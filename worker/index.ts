import { createClient } from "redis";
import fs from "fs";
import path from "path";
import { prisma, assertWorkerPostgres, isProductionStrict } from "./db";
import { DRIVERS } from "./drivers";
import { LanguageAdapterRegistry, buildCodeWithDriver } from "./src/adapters";
import { validateCodeSecurity } from "../backend/src/security";
import { publicWrongAnswerMessage, sanitizeTestResults } from "../backend/src/judgePrivacy";
import { validateSandboxSafety } from "./src/sandbox";
import { maybePruneGoCacheVolume } from "./src/sandbox/dockerRunner";

let redisClient: any = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

async function connectWorkerRedis() {
  try {
    await redisClient.connect();
  } catch (err: any) {
    if (String(err?.message || "").includes("HELLO")) {
      redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379", RESP: 2 } as any);
      await redisClient.connect();
    } else {
      throw err;
    }
  }
}

interface TestCase {
    input: string;
    output: string;
    isHidden: boolean;
}

interface TestResult {
    input: string;
    expected: string;
    got: string;
    passed: boolean;
    runtime: number;
    isHidden: boolean;
    error?: string;
}

const PENDING_QUEUE = "problems";
const PROCESSING_QUEUE = "problems:processing";
const DLQ_QUEUE = "problems:dlq";
const WORKER_HEARTBEAT_KEY = "worker:heartbeat:judge_node_1";
const MAX_RETRY_ATTEMPTS = 3;

connectWorkerRedis()
    .then(async () => {
        console.log("⚡ CodeArena Sandbox Queue Worker connected (Reliable Queue Mode)...");
        // Production gate: the worker shares the authoritative PostgreSQL
        // with the API. Never start consuming jobs on a silent empty store.
        if (isProductionStrict()) {
            await assertWorkerPostgres();
            console.log("✅ PostgreSQL connectivity verified (production strict mode).");
        }
        
        // 1. Worker Heartbeat registration (every 10s with 30s TTL)
        setInterval(async () => {
            try {
                await redisClient.set(WORKER_HEARTBEAT_KEY, JSON.stringify({
                    status: "alive",
                    timestamp: new Date().toISOString(),
                    pid: process.pid,
                    memoryUsage: process.memoryUsage()
                }), { EX: 30 });
            } catch {}
        }, 10000);

        // 2. Lease-aware recovery: Reclaim ONLY stranded tasks whose lease has expired (>60s)
        const VISIBILITY_TIMEOUT_MS = 60000;
        
        // 3. Periodic GOCACHE pruning (every 5 minutes, only if over threshold)
        const GOCACHE_PRUNE_INTERVAL_MS = 5 * 60 * 1000;
        const startPeriodicGoCachePruning = () => {
          setInterval(async () => {
            try {
              const res = await maybePruneGoCacheVolume();
              if (res.pruned) {
                console.log(`[GOCACHE] Periodic prune completed: ${res.usedMb}MB -> ${res.maxMb}MB limit`);
              }
            } catch (err) {
              console.warn("[GOCACHE] Periodic prune failed:", err);
            }
          }, GOCACHE_PRUNE_INTERVAL_MS);
        };
        startPeriodicGoCachePruning();
        
        const checkExpiredLeases = async () => {
            try {
                const processingItems = await redisClient.lRange(PROCESSING_QUEUE, 0, -1);
                const now = Date.now();
                for (const item of processingItems) {
                    try {
                        const parsed = JSON.parse(item);
                        const claimedAt = parsed._claimedAt || 0;
                        if (claimedAt > 0 && now - claimedAt > VISIBILITY_TIMEOUT_MS) {
                            console.warn(`[Queue Recovery] Lease expired for stranded submission ${parsed.submissionId}. Reclaiming to pending queue.`);
                            await redisClient.lRem(PROCESSING_QUEUE, 1, item);
                            await redisClient.lPush(PENDING_QUEUE, JSON.stringify({ ...parsed, _claimedAt: undefined }));
                        }
                    } catch {}
                }
            } catch {}
        };
        await checkExpiredLeases();
        setInterval(checkExpiredLeases, 30000);

        while (1) {
            // Atomically move submission from pending to processing list
            let response: string | null = null;
            try {
                // Use rPopLPush for reliable queuing (retains item in PROCESSING_QUEUE until acknowledged)
                response = await redisClient.rPopLPush(PENDING_QUEUE, PROCESSING_QUEUE);
            } catch {
                // Fallback to rPop if rPopLPush fails (item is only in PENDING_QUEUE; ack lRem is a no-op)
                try {
                    response = await redisClient.rPop(PENDING_QUEUE);
                } catch (fallbackErr) {
                    console.error("[Queue Error] rPopLPush and fallback rPop both failed:", fallbackErr);
                    response = null;
                }
            }

            if (!response) {
                await new Promise((r) => setTimeout(r, 600));
                continue;
            }

            // Stamp a lease timestamp so crashed/reclaimed items can be recovered:
            // rPopLPush moved the item to PROCESSING_QUEUE, so swap the original for a
            // _claimedAt-stamped copy that the lease recovery loop can expire.
            try {
                const stampable = JSON.parse(response);
                if (stampable && typeof stampable === "object") {
                    const stamped = JSON.stringify({ ...stampable, _claimedAt: Date.now() });
                    await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
                    await redisClient.rPush(PROCESSING_QUEUE, stamped).catch(() => {});
                    response = stamped;
                }
            } catch {}

            let parsedResponse: any;
            try {
                parsedResponse = JSON.parse(response);
            } catch (jsonErr: any) {
                console.error(`[Queue Error] Malformed Redis message payload (failed JSON.parse): ${response}`, jsonErr);
                // Acknowledge by removing unparseable item from processing queue so it doesn't loop
                await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
                continue;
            }

            const submissionId = parsedResponse?.submissionId;
            const problemId = parsedResponse?.problemId;
            const code = parsedResponse?.code;
            const language = parsedResponse?.language || "js";

            if (!submissionId || !problemId || typeof code !== "string") {
                console.error(`[Queue Error] Submission payload missing required fields:`, parsedResponse);
                await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
                continue;
            }

            console.log(`\n[Queue] Evaluating submission ${submissionId} for [${problemId}] in (${language})...`);

            const sandboxCheck = await validateSandboxSafety().catch((sandboxErr: any) => ({
                safe: false,
                reason: `Sandbox validation error: ${sandboxErr?.message || "unknown"}`
            }));
            if (!sandboxCheck.safe) {
                console.error(`[Sandbox Error] Submission ${submissionId} rejected: ${sandboxCheck.reason}`);
                await prisma.submissions.update({
                    where: { id: submissionId },
                    data: {
                        status: "Failure",
                        errorMessage: sandboxCheck.reason
                    }
                }).catch(() => {});
                // Acknowledge by removing from processing queue
                await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
                continue;
            }

            const secCheck = validateCodeSecurity(code, language);
            if (!secCheck.safe) {
                console.warn(`[Security Alert] Rejected submission ${submissionId}: ${secCheck.reason}`);
                await prisma.submissions.update({
                    where: { id: submissionId },
                    data: {
                        status: "RuntimeError" as any,
                        errorMessage: secCheck.reason
                    }
                }).catch(() => {});
                // Acknowledge by removing from processing queue
                await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
                continue;
            }

            // Hoisted so the finally-cleanup below can see it (block-scoped
            // declarations inside try are invisible to finally).
            let folderPath: string | null = null;
            try {
                // Fetch problem & canonical test cases from database
                const problem = await prisma.problems.findFirst({
                    where: { id: problemId },
                    include: { testCasesRel: { orderBy: { order: "asc" } } }
                });

                if (!problem) {
                    console.error(`Problem ${problemId} not found in database.`);
                    await prisma.submissions.update({
                        where: { id: submissionId },
                        data: {
                            status: "Failure",
                            errorMessage: "Problem definition not found in database."
                        }
                    });
                    continue;
                }

                // Canonical test cases: use relational TestCases table, fallback to legacy JSON if not migrated
                let testCases: TestCase[] = [];
                if (problem.testCasesRel && problem.testCasesRel.length > 0) {
                    testCases = problem.testCasesRel.map((tc: any) => ({
                        input: tc.input,
                        output: tc.expectedOutput,
                        isHidden: tc.isHidden
                    }));
                } else if (Array.isArray(problem.testCases)) {
                    testCases = (problem.testCases as unknown as TestCase[]) || [];
                }

                // Issue 13: Driver lookup validation
                // Algorithmic problems need their problem-specific runner driver, whereas custom/script problems don't.
                // Log when no problem-specific driver is registered.
                const problemDrivers = DRIVERS[problemId];
                let driverCode = "";
                if (problemDrivers) {
                    if (problemDrivers[language]) {
                        driverCode = problemDrivers[language];
                    } else {
                        console.warn(`[Driver Warning] No driver found for language '${language}' under problem '${problemId}'. Running code directly.`);
                    }
                } else {
                    console.log(`[Driver Info] No specific driver registered for problem '${problemId}'. Running as standalone script.`);
                }
                const codeWithDriver = buildCodeWithDriver(language, code, driverCode);

                // Scratch directory is removed in the finally block below (covers
                // early-return/continue paths that previously leaked folders).
                const scratchBase = process.env.WORKER_SCRATCH_HOST_PATH ? path.resolve(process.env.WORKER_SCRATCH_HOST_PATH) : __dirname;
                folderPath = path.join(scratchBase, `code_${submissionId.replace(/[^a-zA-Z0-9_-]/g, "")}`);
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                // Issue 14: Defense against unbounded test cases & workload amplification
                const MAX_TEST_CASES = 50;
                const MAX_TOTAL_INPUT_BYTES = 1024 * 1024; // 1 MB total input cap across all cases
                const MAX_CUMULATIVE_TIMEOUT_MS = 60000; // 60s total execution budget per submission

                const executableTestCases = testCases.slice(0, MAX_TEST_CASES);

                // Idempotency guard (checked BEFORE running any test case): if the
                // submission already reached a terminal status (a previous worker
                // finished it, or it was scored synchronously), ack & skip instead of
                // executing — and never double-award XP/solveCount below.
                const existingSubmission = await prisma.submissions.findUnique({
                    where: { id: submissionId },
                    select: { status: true, userId: true }
                });
                if (existingSubmission && existingSubmission.status !== "Processing") {
                    console.log(`[Idempotency] Submission ${submissionId} already evaluated with status: ${existingSubmission.status}. Skipping.`);
                    await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
                    continue;
                }

                // Validation: A problem with 0 executable test cases cannot be accepted
                if (executableTestCases.length === 0) {
                    console.error(`Problem ${problemId} has no executable test cases configured. Failing submission.`);
                    await prisma.submissions.update({
                        where: { id: submissionId },
                        data: {
                            status: "Failure",
                            errorMessage: "Configuration Error: Problem contains no executable test cases."
                        }
                    });
                    await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
                    continue;
                }

                if (testCases.length > MAX_TEST_CASES) {
                    console.warn(`[Workload Protection] Problem ${problemId} has ${testCases.length} test cases; capping execution to ${MAX_TEST_CASES}.`);
                }

                console.log(`Running code against ${executableTestCases.length} test cases via Language Adapter [${language}]...`);
                const results: TestResult[] = [];
                let hasTle = false;
                let hasOle = false;
                let hasMle = false;
                let hasFailure = false;
                let isCompileFail = false;
                let passedCount = 0;
                let totalInputBytes = 0;
                let cumulativeRuntimeMs = 0;

                for (let i = 0; i < executableTestCases.length; i++) {
                    const tc = executableTestCases[i];
                    if (!tc) continue;

                    // Check total input bytes
                    const tcInputBytes = Buffer.byteLength(tc.input || "", "utf-8");
                    totalInputBytes += tcInputBytes;
                    if (totalInputBytes > MAX_TOTAL_INPUT_BYTES) {
                        hasFailure = true;
                        results.push({
                            input: tc.input,
                            expected: tc.output,
                            got: "",
                            passed: false,
                            runtime: 0,
                            isHidden: tc.isHidden,
                            error: `Payload Limit Exceeded: Total test input exceeds ${MAX_TOTAL_INPUT_BYTES / 1024} KB limit.`
                        });
                        break;
                    }

                    // Check cumulative execution time budget
                    if (cumulativeRuntimeMs >= MAX_CUMULATIVE_TIMEOUT_MS) {
                        hasTle = true;
                        results.push({
                            input: tc.input,
                            expected: tc.output,
                            got: "",
                            passed: false,
                            runtime: 0,
                            isHidden: tc.isHidden,
                            error: `Cumulative Time Limit Exceeded: Total submission execution exceeded ${MAX_CUMULATIVE_TIMEOUT_MS / 1000}s limit.`
                        });
                        break;
                    }

                    // Honor the toolchain's declared minimum budgets (see
                    // LanguageAdapterRegistry.resolveBudgets): a floor, not a
                    // blanket increase — languages without special needs keep
                    // the problem author's limits untouched.
                    const budgets = LanguageAdapterRegistry.resolveBudgets(language, problem.timeLimit, problem.memoryLimit);
                    const execResult = await LanguageAdapterRegistry.executeCode(language, {
                        folderPath: folderPath!,
                        codeWithDriver,
                        inputData: tc.input,
                        expectedOutput: tc.output,
                        timeoutMs: budgets.timeoutMs,
                        memoryLimitMb: budgets.memoryLimitMb
                    });

                    cumulativeRuntimeMs += execResult.runtime || 0;

                    results.push({
                        input: tc.input,
                        expected: tc.output,
                        got: execResult.got,
                        passed: execResult.passed,
                        runtime: execResult.runtime,
                        isHidden: tc.isHidden,
                        error: execResult.error
                    });

                    if (execResult.isCompileError || execResult.verdict === "CE") {
                        isCompileFail = true;
                        break;
                    }

                    if (execResult.isTLE || execResult.verdict === "TLE") {
                        hasTle = true;
                        break;
                    }

                    if (execResult.isOLE || execResult.verdict === "OLE" || (execResult.error && execResult.error.includes("Output Limit Exceeded"))) {
                        hasOle = true;
                        break;
                    }

                    if (execResult.isMLE || execResult.verdict === "MLE") {
                        hasMle = true;
                        break;
                    }

                    if (execResult.error && !execResult.error.includes("Wrong Answer")) {
                        hasFailure = true;
                        break;
                    }

                    if (execResult.passed) {
                        passedCount++;
                    }
                }

                // Calculate final metrics using structured verdicts
                let finalStatus = "Success";
                let finalOutput = "";
                let runtime = 0;

                if (isCompileFail) {
                    finalStatus = "CompileError";
                    finalOutput = results[results.length - 1]?.error || "Compilation Error";
                } else if (hasTle) {
                    finalStatus = "TLE";
                    finalOutput = "Time Limit Exceeded (TLE)";
                    runtime = problem.timeLimit || 4000;
                } else if (hasOle) {
                    finalStatus = "RuntimeError";
                    finalOutput = "Output Limit Exceeded (OLE) — standard output exceeded quota";
                } else if (hasMle) {
                    finalStatus = "RuntimeError";
                    finalOutput = "Memory Limit Exceeded (MLE) — allocated memory exceeded limit";
                } else if (hasFailure) {
                    finalStatus = "RuntimeError";
                    const lastResult = results[results.length - 1];
                    finalOutput = lastResult?.error ?? "Runtime Error";
                } else if (passedCount < executableTestCases.length) {
                    finalStatus = "WrongAnswer";
                    const failedTc = results.find((r) => !r.passed);
                    if (failedTc) {
                        finalOutput = publicWrongAnswerMessage(failedTc, results.indexOf(failedTc));
                    }
                } else {
                    finalStatus = "Success";
                    const totalRt = results.reduce((acc, r) => acc + r.runtime, 0);
                    finalOutput = `Accepted! All ${executableTestCases.length} test cases passed.\nTotal execution time: ${totalRt.toFixed(1)}ms`;
                }

                const completedTests = results.filter((r) => !r.error || !r.error.includes("TLE"));
                runtime = completedTests.length > 0 
                    ? completedTests.reduce((acc, r) => acc + r.runtime, 0) / completedTests.length 
                    : (hasTle ? (problem.timeLimit || 4000) : 0);
                runtime = Math.round(runtime * 100) / 100;

                console.log(`Submission ${submissionId} => ${finalStatus} (${passedCount}/${executableTestCases.length} tests passed, avg runtime: ${runtime}ms)`);

                // Operational metric for the backend /metrics endpoint.
                // Fire-and-forget by design: metrics must never stall judging.
                try {
                    if ((redisClient as any)?.isReady) {
                        redisClient.hIncrBy("codearena:metrics:worker_verdicts", finalStatus, 1).catch(() => {});
                    }
                } catch {}

                if (finalStatus === "Success") {
                    // 1. Idempotently increment problem solveCount: only if this user hasn't already solved this problem
                    let alreadySolvedByUser = false;
                    if (existingSubmission?.userId) {
                        const previousAccepted = await prisma.submissions.findFirst({
                            where: {
                                userId: existingSubmission.userId,
                                problemId: problemId,
                                status: "Success",
                                id: { not: submissionId }
                            },
                            select: { id: true }
                        });
                        alreadySolvedByUser = Boolean(previousAccepted);
                    }

                    if (!alreadySolvedByUser) {
                        try {
                            await prisma.problems.update({
                                where: { id: problemId },
                                data: { solveCount: { increment: 1 } }
                            });
                        } catch (pErr) {
                            console.error(`[DB Error] Failed to increment solveCount for problem ${problemId}:`, pErr);
                        }
                    }

                    // 2. Award XP, streak, and update user statistics
                    if (existingSubmission?.userId && !alreadySolvedByUser) {
                        try {
                            const u = await prisma.user.findUnique({
                                where: { id: existingSubmission.userId },
                                select: { xp: true, streak: true, longestStreak: true, lastActiveDate: true }
                            });
                            if (u) {
                                const xpGain = problem.difficulty === "Hard" ? 50 : problem.difficulty === "Medium" ? 30 : 15;
                                const newXp = (u.xp || 0) + xpGain;
                                const newLevel = Math.floor(newXp / 100) + 1;

                                const now = new Date();
                                const todayStr = now.toISOString().slice(0, 10);
                                const lastActiveStr = u.lastActiveDate ? new Date(u.lastActiveDate).toISOString().slice(0, 10) : "";
                                
                                let newStreak = u.streak || 0;
                                if (lastActiveStr !== todayStr) {
                                    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                                    if (lastActiveStr === yesterday) {
                                        newStreak += 1;
                                    } else {
                                        newStreak = 1;
                                    }
                                }
                                const newLongest = Math.max(u.longestStreak || 0, newStreak);

                                await prisma.user.update({
                                    where: { id: existingSubmission.userId },
                                    data: {
                                        xp: newXp,
                                        level: newLevel,
                                        streak: newStreak,
                                        longestStreak: newLongest,
                                        lastActiveDate: now
                                    }
                                });
                            }
                        } catch (uErr) {
                            console.error("[Stats Error] Failed to update user XP & streaks:", uErr);
                        }
                    }
                }

                // Write results back to database
                await prisma.submissions.update({
                    where: { id: submissionId },
                    data: {
                        status: finalStatus as any,
                        output: finalOutput,
                        testResults: sanitizeTestResults(results) as any,
                        runtime,
                        testCasesPassed: passedCount,
                        testCasesTotal: executableTestCases.length
                    }
                });

            } catch (err: any) {
                console.error("Worker processing failed:", err);
                
                // Retry Policy & Dead-Letter Queue (DLQ)
                const attempts = (parsedResponse?.attempts || 0) + 1;
                if (attempts < MAX_RETRY_ATTEMPTS) {
                    console.warn(`[Retry Policy] Retrying submission ${submissionId} (Attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS})...`);
                    await redisClient.lPush(PENDING_QUEUE, JSON.stringify({ ...parsedResponse, attempts }));
                } else {
                    console.error(`[Dead Letter Queue] Submission ${submissionId} exceeded max retry limit. Forwarding to ${DLQ_QUEUE}.`);
                    await redisClient.lPush(DLQ_QUEUE, JSON.stringify({
                        ...parsedResponse,
                        error: err.message,
                        failedAt: new Date().toISOString()
                    })).catch(() => {});

                    try {
                        await prisma.submissions.update({
                            where: { id: submissionId },
                            data: {
                                status: "Failure",
                                output: err.message,
                                errorMessage: "Internal Worker Error: Max retries exceeded"
                            }
                        });
                    } catch (dbErr) {
                        console.error(`[DB Critical] Failed to persist DLQ failure status for submission ${submissionId}:`, dbErr);
                    }
                }
            } finally {
                // Cleanup ephemeral scratch directory on every exit path (success, retry, DLQ, rejects).
                if (folderPath) {
                    try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch {}
                }
                // Acknowledge task completion by removing from the processing queue
                await redisClient.lRem(PROCESSING_QUEUE, 1, response).catch(() => {});
            }
        }
    })
    .catch((err) => {
        console.error("Worker startup failed:", err?.message || err);
        if (isProductionStrict()) process.exit(1);
    });
