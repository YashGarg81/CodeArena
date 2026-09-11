import { createClient } from "redis";
import fs from "fs";
import { prisma } from "./db";
import { DRIVERS } from "./drivers";
import { LanguageAdapterRegistry } from "./src/adapters";
import { validateCodeSecurity } from "../backend/src/security";
import { publicWrongAnswerMessage, sanitizeTestResults } from "../backend/src/judgePrivacy";
import { validateSandboxSafety } from "./src/sandbox";

const redisClient = createClient({
    RESP: 2
});

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

redisClient.connect()
    .then(async () => {
        console.log("⚡ CodeArena Sandbox Queue Worker connected to Redis list 'problems'...");
        while (1) {
            const response = await redisClient.rPop("problems");
            if (!response) {
                await new Promise((r) => setTimeout(r, 600));
                continue;
            }

            const parsedResponse = JSON.parse(response);
            const submissionId = parsedResponse.submissionId;
            const problemId = parsedResponse.problemId;
            const code = parsedResponse.code;
            const language = parsedResponse.language || "js";

            console.log(`\n[Queue] Evaluating submission ${submissionId} for [${problemId}] in (${language})...`);

            const sandboxCheck = await validateSandboxSafety();
            if (!sandboxCheck.safe) {
                console.error(`[Sandbox Error] Submission ${submissionId} rejected: ${sandboxCheck.reason}`);
                await prisma.submissions.update({
                    where: { id: submissionId },
                    data: {
                        status: "Failure",
                        errorMessage: sandboxCheck.reason
                    }
                });
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
                });
                continue;
            }

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

                const driverCode = DRIVERS[problemId]?.[language] ?? "";
                const codeWithDriver = code + driverCode;

                const folderPath = __dirname + `/code_${submissionId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                console.log(`Running code against ${testCases.length} test cases via Language Adapter [${language}]...`);
                const results: TestResult[] = [];
                let hasTle = false;
                let hasFailure = false;
                let isCompileFail = false;
                let passedCount = 0;

                for (let i = 0; i < testCases.length; i++) {
                    const tc = testCases[i];
                    if (!tc) continue;

                    const execResult = await LanguageAdapterRegistry.executeCode(language, {
                        folderPath,
                        codeWithDriver,
                        inputData: tc.input,
                        expectedOutput: tc.output,
                        timeoutMs: problem.timeLimit || 4000,
                        memoryLimitMb: problem.memoryLimit || 256
                    });

                    results.push({
                        input: tc.input,
                        expected: tc.output,
                        got: execResult.got,
                        passed: execResult.passed,
                        runtime: execResult.runtime,
                        isHidden: tc.isHidden,
                        error: execResult.error
                    });

                    if (execResult.isCompileError) {
                        isCompileFail = true;
                        break;
                    }

                    if (execResult.isTLE) {
                        hasTle = true;
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

                // Calculate final metrics
                let finalStatus = "Success";
                let finalOutput = "";
                let runtime = 0;

                if (isCompileFail) {
                    finalStatus = "CompileError";
                    finalOutput = results[0]?.error || "Compilation Error";
                } else if (hasTle) {
                    finalStatus = "TLE";
                    finalOutput = "Time Limit Exceeded (TLE)";
                    runtime = problem.timeLimit || 4000;
                } else if (hasFailure) {
                    finalStatus = "RuntimeError";
                    const lastResult = results[results.length - 1];
                    finalOutput = lastResult?.error ?? "Runtime Error";
                } else if (passedCount < testCases.length) {
                    finalStatus = "WrongAnswer";
                    const failedTc = results.find((r) => !r.passed);
                    if (failedTc) {
                        finalOutput = publicWrongAnswerMessage(failedTc, results.indexOf(failedTc));
                    }
                } else {
                    finalStatus = "Success";
                    const totalRt = results.reduce((acc, r) => acc + r.runtime, 0);
                    finalOutput = `Accepted! All ${testCases.length} test cases passed.\nTotal execution time: ${totalRt.toFixed(1)}ms`;
                }

                const completedTests = results.filter((r) => !r.error || !r.error.includes("TLE"));
                runtime = completedTests.length > 0 
                    ? completedTests.reduce((acc, r) => acc + r.runtime, 0) / completedTests.length 
                    : (hasTle ? (problem.timeLimit || 4000) : 0);
                runtime = Math.round(runtime * 100) / 100;

                console.log(`Submission ${submissionId} => ${finalStatus} (${passedCount}/${testCases.length} tests passed, avg runtime: ${runtime}ms)`);

                if (finalStatus === "Success") {
                    await prisma.problems.update({
                        where: { id: problemId },
                        data: { solveCount: { increment: 1 } }
                    }).catch(() => {});
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
                        testCasesTotal: testCases.length
                    }
                });

                // Cleanup ephemeral directory
                try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch {}

            } catch (err: any) {
                console.error("Worker processing failed:", err);
                await prisma.submissions.update({
                    where: { id: submissionId },
                    data: {
                        status: "Failure",
                        output: err.message,
                        errorMessage: "Internal Worker Error"
                    }
                }).catch(() => {});
            }
        }
    })
    .catch((err) => {
        console.error("Redis client initialization failed inside worker:", err);
    });
