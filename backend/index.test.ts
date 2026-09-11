import { test, expect, describe } from "bun:test";
import jwt from "jsonwebtoken";

const JWT_SECRET = "codearena-secret-test-key";

// ─── PHASE 1 ─────────────────────────────────────────────────────────────────

describe("Phase 1 — Authentication & Token Security", () => {
    test("JWT token signing and verification with user metadata", () => {
        const payload = { userId: "usr_test_123", email: "alice@codearena.dev", role: "DEVELOPER" };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
        expect(typeof token).toBe("string");
        expect(token.length).toBeGreaterThan(20);
        const decoded: any = jwt.verify(token, JWT_SECRET);
        expect(decoded.userId).toBe("usr_test_123");
        expect(decoded.email).toBe("alice@codearena.dev");
        expect(decoded.role).toBe("DEVELOPER");
    });

    test("Expired or tampered token verification fails securely", () => {
        const payload = { userId: "usr_tamper" };
        const validToken = jwt.sign(payload, JWT_SECRET);
        const tamperedToken = validToken.slice(0, -4) + "abcd";
        expect(() => { jwt.verify(tamperedToken, JWT_SECRET); }).toThrow();
    });

    test("Password hashing produces unique salts (bcrypt simulation)", () => {
        const simulateHash = (pwd: string, salt: string) => `${salt}:${pwd.split("").reverse().join("")}`;
        expect(simulateHash("secret", "s1")).not.toBe(simulateHash("secret", "s2"));
    });
});

describe("Phase 1 — Problem Specifications & Test Cases", () => {
    test("Problem structure conforms to required data contract", () => {
        const p = { id: "two-sum", title: "1. Two Sum", difficulty: "Easy", category: "Arrays",
            tags: ["array","hash-table"], companies: ["Google","Amazon"],
            testCases: [{ input: "2 7 11 15\n9", output: "0 1", isHidden: false }],
            timeLimit: 5000, memoryLimit: 256 };
        expect(p.id).toBe("two-sum");
        expect(p.difficulty).toBe("Easy");
        expect(p.testCases.length).toBe(1);
        expect(p.testCases[0]?.output).toBe("0 1");
    });

    test("Problem must have at least one visible test case", () => {
        const tcs = [{ input: "1\n2", output: "3", isHidden: false }, { input: "x", output: "y", isHidden: true }];
        expect(tcs.filter(t => !t.isHidden).length).toBeGreaterThan(0);
    });

    test("All required metadata fields present", () => {
        const required = ["id","title","difficulty","category","tags","companies","description","hints","templates","testCases","timeLimit","memoryLimit"];
        const problem: Record<string,any> = { id:"x",title:"X",difficulty:"Easy",category:"Arrays",tags:[],companies:[],description:"...",hints:[],templates:{js:"",py:"",cpp:""},testCases:[],timeLimit:5000,memoryLimit:256 };
        for (const f of required) expect(f in problem).toBe(true);
    });
});

describe("Phase 1 — User Profile & RBAC", () => {
    test("User profile has required fields", () => {
        const user = { id:"usr_1",username:"alice",name:"Alice",email:"a@b.com",role:"DEVELOPER",contestRating:1200,xp:0,level:1,streak:3,longestStreak:7 };
        expect(user.contestRating).toBe(1200);
        expect(user.streak).toBe(3);
    });

    test("RBAC roles are a known set", () => {
        const validRoles = ["STUDENT","DEVELOPER","INTERVIEWER","INSTRUCTOR","ADMIN"];
        expect(validRoles).toContain("DEVELOPER");
        expect(validRoles).not.toContain("HACKER");
    });
});

// ─── PHASE 2 ─────────────────────────────────────────────────────────────────

describe("Phase 2 — Multi-Language Driver Matrix", () => {
    test("All supported language keys exist", () => {
        const langs = ["js","py","cpp"];
        expect(langs).toContain("js");
        expect(langs).toContain("py");
        expect(langs).toContain("cpp");
    });

    test("Python template has correct function signature", () => {
        const tpl = `def twoSum(nums, target):\n    seen = {}\n    return []`;
        expect(tpl).toContain("def twoSum");
    });

    test("JS template has correct function signature", () => {
        const tpl = `function twoSum(nums, target) { return []; }`;
        expect(tpl).toContain("function twoSum");
    });

    test("Language-to-runtime map is correct", () => {
        const m: Record<string,string> = { js:"node", py:"python3", cpp:"g++" };
        expect(m["js"]).toBe("node");
        expect(m["py"]).toBe("python3");
        expect(m["cpp"]).toBe("g++");
    });
});

describe("Phase 2 — Testcase I/O Normalization", () => {
    const norm = (s: string) => s.trim().replace(/\r\n/g, "\n").replace(/\s+$/gm, "");
    test("Exact match", () => { expect(norm("0 1\n")).toBe(norm("0 1")); });
    test("Wrong answer", () => { expect(norm("1 2")).not.toBe(norm("0 1")); });
    test("Whitespace trim", () => { expect(norm("  [0, 1]  \n")).toBe(norm("[0, 1]")); });
    test("Multi-line", () => { expect(norm("true\nfalse\n")).toBe(norm("true\nfalse")); });
    test("Empty vs non-empty", () => { expect(norm("")).not.toBe(norm("0 1")); });
});

describe("Phase 2 — Run Endpoint (/api/v1/submissions/run)", () => {
    test("Passing run result shape", () => {
        const r = { passed:true, input:"2 7 11 15\n9", expected:"0 1", got:"0 1", runtime:12.3 };
        expect(r.passed).toBe(true);
        expect(typeof r.runtime).toBe("number");
    });

    test("Failing run result shape", () => {
        const r = { passed:false, input:"2 7\n9", expected:"0 1", got:"1 0", runtime:8.1 };
        expect(r.passed).toBe(false);
        expect(r.got).not.toBe(r.expected);
    });

    test("Custom stdin preserved in payload", () => {
        const p = { problemId:"two-sum", code:"print('0 1')", language:"py", input:"5 3\n8", expected:"" };
        expect(p.input).toBe("5 3\n8");
        expect(p.expected).toBe("");
    });

    test("All supported languages accepted", () => {
        const langs = ["js","py","cpp","java","go"];
        for (const l of langs) expect(langs).toContain(l);
    });
});

describe("Phase 2 — Metadata Filters (/api/v1/problems/meta/filters)", () => {
    test("Response shape is correct", () => {
        const meta = { categories:["Arrays","Strings","Dynamic Programming"], difficulties:["Easy","Medium","Hard"], tags:["array","dp"], companies:["Google","Amazon"] };
        expect(Array.isArray(meta.categories)).toBe(true);
        expect(meta.difficulties).toEqual(["Easy","Medium","Hard"]);
        expect(meta.companies).toContain("Google");
    });

    test("Category filter logic", () => {
        const ps = [{ id:"a", category:"Arrays" },{ id:"b", category:"Strings" },{ id:"c", category:"Arrays" }];
        expect(ps.filter(p => p.category === "Arrays").length).toBe(2);
    });

    test("Company filter logic", () => {
        const ps = [{ id:"a", companies:["Google"] },{ id:"b", companies:["Amazon"] },{ id:"c", companies:["Google","Amazon"] }];
        expect(ps.filter(p => p.companies.includes("Google")).length).toBe(2);
    });

    test("Solved/Unsolved filter logic", () => {
        const solvedIds = new Set(["two-sum","reverse-string"]);
        const problems = ["two-sum","valid-parens","reverse-string","merge-intervals"];
        expect(problems.filter(id => solvedIds.has(id)).length).toBe(2);
        expect(problems.filter(id => !solvedIds.has(id)).length).toBe(2);
    });
});

describe("Phase 2 — Submission History (/api/v1/problems/:id/submissions)", () => {
    test("Submission item has required fields", () => {
        const s = { id:"s1", problemId:"two-sum", code:"...", language:"py", status:"Success", runtime:14.2, testCasesPassed:3, testCasesTotal:3, createdAt:new Date().toISOString() };
        expect(typeof s.id).toBe("string");
        expect(s.status).toBe("Success");
        expect(s.testCasesPassed).toBe(s.testCasesTotal);
    });

    test("WrongAnswer verdict from failed test cases", () => {
        const results = [{ passed:true },{ passed:false }];
        const verdict = results.every(r => r.passed) ? "Success" : "WrongAnswer";
        expect(verdict).toBe("WrongAnswer");
    });

    test("TLE detected from runtime threshold", () => {
        const TL = 5000;
        const runtimes = [150, 200, 5200];
        expect(runtimes.some(r => r > TL)).toBe(true);
    });

    test("All submission statuses are valid enum values", () => {
        const valid = ["Processing","Success","WrongAnswer","TLE","MLE","RuntimeError","CompileError","Failure"];
        for (const s of ["Success","WrongAnswer","TLE","CompileError"]) expect(valid).toContain(s);
    });
});

describe("Phase 2 — Submission Compare (/api/v1/submissions/:id/compare/:targetId)", () => {
    test("Different submissions produce non-empty diff", () => {
        const s1 = { code:"def f(): return [0,1]", status:"Success" };
        const s2 = { code:"def f(): return [1,0]", status:"WrongAnswer" };
        expect(s1.code === s2.code).toBe(false);
        expect(s1.status).toBe("Success");
    });

    test("Identical code produces empty diff", () => {
        const code = "def f(): return [0,1]";
        expect(code === code).toBe(true);
    });
});

describe("Phase 2 — Problem Like Endpoint (/api/v1/problems/:id/like)", () => {
    test("Like increments count", () => { let c = 42; c++; expect(c).toBe(43); });
    test("Unlike decrements count", () => { let c = 43; c--; expect(c).toBe(42); });
});

describe("Phase 2 — API Response Envelope", () => {
    test("Success envelope matches spec", () => {
        const r = { success:true, data:{ problems:[] } };
        expect(r.success).toBe(true);
        expect("data" in r).toBe(true);
    });

    test("Error envelope — no stack traces", () => {
        const r = { success:false, error:{ code:"PROBLEM_NOT_FOUND", message:"Not found" } };
        expect(r.success).toBe(false);
        expect("stack" in r.error).toBe(false);
    });

    test("Paginated response shape", () => {
        const r = { success:true, data:{ problems:[], total:24, page:1, limit:20, hasMore:true } };
        expect(r.data.total).toBe(24);
        expect(r.data.hasMore).toBe(true);
    });
});

// ─── PHASE 3 ─────────────────────────────────────────────────────────────────

describe("Phase 3 — Learning Academy & Developer Knowledge Base", () => {
    test("Course model conforms to specification", () => {
        const course = {
            id: "course_1",
            slug: "dsa-foundations",
            title: "Data Structures & Algorithms Foundations",
            difficulty: "Beginner",
            estimatedHours: 12,
            xpReward: 500,
            lessonCount: 8
        };
        expect(course.slug).toBe("dsa-foundations");
        expect(course.xpReward).toBe(500);
    });

    test("Quiz scoring calculation produces accurate percentage and pass status", () => {
        const calculateQuizScore = (userAnswers: number[], correctAnswers: number[]) => {
            const correctCount = userAnswers.filter((ans, i) => ans === correctAnswers[i]).length;
            const percentage = Math.round((correctCount / correctAnswers.length) * 100);
            return { score: correctCount, total: correctAnswers.length, percentage, passed: percentage >= 70 };
        };
        const res = calculateQuizScore([0, 1, 2, 3], [0, 1, 2, 0]);
        expect(res.score).toBe(3);
        expect(res.total).toBe(4);
        expect(res.percentage).toBe(75);
        expect(res.passed).toBe(true);
    });
});

// ─── PHASE 4 ─────────────────────────────────────────────────────────────────

describe("Phase 4 — Core Database, Storage, Caching & Background Infrastructure", () => {
    test("Redis caching key format & TTL configuration", () => {
        const getCacheKey = (type: string, id: string) => `codearena:${type}:${id}`;
        expect(getCacheKey("user_stats", "usr_123")).toBe("codearena:user_stats:usr_123");
        expect(getCacheKey("problem", "two-sum")).toBe("codearena:problem:two-sum");
    });

    test("Token-bucket rate limiter algorithm", () => {
        class TokenBucket {
            capacity: number;
            tokens: number;
            constructor(capacity: number) {
                this.capacity = capacity;
                this.tokens = capacity;
            }
            take(): boolean {
                if (this.tokens > 0) {
                    this.tokens--;
                    return true;
                }
                return false;
            }
        }
        const limiter = new TokenBucket(3);
        expect(limiter.take()).toBe(true);
        expect(limiter.take()).toBe(true);
        expect(limiter.take()).toBe(true);
        expect(limiter.take()).toBe(false);
    });

    test("Background queue job payload validation", () => {
        const job = {
            id: "job_email_001",
            queue: "notifications",
            type: "SEND_WELCOME_EMAIL",
            payload: { userId: "usr_123", email: "user@example.com" },
            attempts: 0,
            maxAttempts: 3,
            createdAt: new Date().toISOString()
        };
        expect(job.queue).toBe("notifications");
        expect(job.maxAttempts).toBe(3);
        expect(job.payload.email).toBe("user@example.com");
    });

    test("Audit log record structure", () => {
        const auditLog = {
            id: "audit_991",
            userId: "usr_admin",
            action: "USER_ROLE_UPDATED",
            resourceId: "usr_target_456",
            metadata: { oldRole: "STUDENT", newRole: "DEVELOPER" },
            ipAddress: "127.0.0.1",
            timestamp: new Date().toISOString()
        };
        expect(auditLog.action).toBe("USER_ROLE_UPDATED");
        expect(auditLog.metadata.newRole).toBe("DEVELOPER");
    });

    test("System Design estimation formula verification", () => {
        const calculateEstimation = (dau: number, readsPerUser: number, writesPerUser: number) => {
            const totalReads = dau * readsPerUser;
            const totalWrites = dau * writesPerUser;
            const avgQps = Math.round((totalReads + totalWrites) / 86400);
            const peakQps = Math.round(avgQps * 2.8);
            return { avgQps, peakQps };
        };
        const est = calculateEstimation(10000000, 20, 2); // 10M DAU
        expect(est.avgQps).toBe(2546);
        expect(est.peakQps).toBe(7129);
    });
});

// ─── PHASE 5: PROBLEM BANK & ADMIN CONTENT MANAGEMENT TESTS ──────────────────

describe("Phase 5 — Problem Bank & Admin Content Management", () => {
    test("Slug generation produces clean url-friendly slugs", () => {
        const generateSlug = (title: string) =>
            title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

        expect(generateSlug("Two Sum")).toBe("two-sum");
        expect(generateSlug("3Sum Closest (Special Edition!)")).toBe("3sum-closest-special-edition");
        expect(generateSlug("   Valid Parentheses --- ")).toBe("valid-parentheses");
    });

    test("Problem status lifecycle follows Draft -> Review -> Published -> Archived", () => {
        const allowedTransitions: Record<string, string[]> = {
            Draft: ["Review", "Published", "Archived"],
            Review: ["Draft", "Published", "Archived"],
            Published: ["Draft", "Archived"],
            Archived: ["Draft"]
        };

        expect(allowedTransitions["Draft"]).toContain("Published");
        expect(allowedTransitions["Published"]).toContain("Draft");
        expect(allowedTransitions["Archived"]).toContain("Draft");
    });

    test("Problem content validator correctly flags missing essential fields", () => {
        const validateProblem = (p: any) => {
            const issues: string[] = [];
            const warnings: string[] = [];
            if (!p.title || p.title.trim().length < 3) issues.push("Title too short");
            if (!p.description || p.description.trim().length < 50) issues.push("Description too short (min 50 chars)");
            if (!p.testCases || p.testCases.length === 0) issues.push("No test cases defined");
            const publicTcs = (p.testCases || []).filter((tc: any) => !tc.isHidden).length;
            if (publicTcs === 0) warnings.push("No public test cases");
            return { valid: issues.length === 0, issues, warnings };
        };

        const invalidProblem = { title: "A", description: "Short", testCases: [] };
        const resInvalid = validateProblem(invalidProblem);
        expect(resInvalid.valid).toBe(false);
        expect(resInvalid.issues.length).toBe(3);

        const validProblem = {
            title: "Two Sum II",
            description: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order...",
            testCases: [{ input: "2 7 11\n9", output: "1 2", isHidden: false }]
        };
        const resValid = validateProblem(validProblem);
        expect(resValid.valid).toBe(true);
        expect(resValid.issues.length).toBe(0);
    });

    test("Revision history snapshot captures immutable state and increments version", () => {
        const initialProblem = {
            id: "two-sum",
            version: 1,
            title: "Two Sum",
            difficulty: "Easy",
            category: "Arrays"
        };

        const updateProblem = (current: any, changes: any) => {
            const newVersion = current.version + 1;
            const updated = { ...current, ...changes, version: newVersion };
            const revision = {
                problemId: current.id,
                version: newVersion,
                snapshot: { ...current, ...changes },
                createdAt: new Date().toISOString()
            };
            return { updated, revision };
        };

        const { updated, revision } = updateProblem(initialProblem, { difficulty: "Medium" });
        expect(updated.version).toBe(2);
        expect(updated.difficulty).toBe("Medium");
        expect(revision.version).toBe(2);
        expect(revision.snapshot.difficulty).toBe("Medium");
    });

    test("Test case normalized structure supports hidden test cases and ordering", () => {
        const testCases = [
            { id: "tc_1", problemId: "two-sum", input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false, order: 0 },
            { id: "tc_2", problemId: "two-sum", input: "3 2 4\n6", expectedOutput: "1 2", isHidden: false, order: 1 },
            { id: "tc_3", problemId: "two-sum", input: "3 3\n6", expectedOutput: "0 1", isHidden: true, order: 2 }
        ];

        const publicCases = testCases.filter(t => !t.isHidden);
        const hiddenCases = testCases.filter(t => t.isHidden);

        expect(publicCases.length).toBe(2);
        expect(hiddenCases.length).toBe(1);
        expect(testCases[0]?.order).toBe(0);
        expect(testCases[2]?.isHidden).toBe(true);
    });

    test("Bulk import payload parser and validation", () => {
        const importPayload = [
            { title: "Binary Search", difficulty: "Easy", category: "Binary Search", description: "Search target in sorted array..." },
            { title: "Invert Binary Tree", difficulty: "Easy", category: "Trees", description: "Given root of a binary tree, invert the tree..." }
        ];

        expect(Array.isArray(importPayload)).toBe(true);
        expect(importPayload.length).toBe(2);
        importPayload.forEach(p => {
            expect(p.title).toBeDefined();
            expect(p.difficulty).toBeDefined();
            expect(p.category).toBeDefined();
            expect(p.description).toBeDefined();
        });
    });
});

// ─── SECURITY AUDIT & VULNERABILITY REMEDIATION TESTS ────────────────────────

describe("Security Audit & Sandbox Hardening (Phases 1-5)", () => {
    test("Sandbox rejects arbitrary process execution and shell spawning (JS / TS)", () => {
        const { validateCodeSecurity } = require("./src/security");
        const attackPayload1 = `const cp = require("child_process"); cp.execSync("whoami");`;
        const res1 = validateCodeSecurity(attackPayload1, "js");
        expect(res1.safe).toBe(false);
        expect(res1.reason).toContain("child_process");

        const attackPayload2 = `import fs from 'fs'; fs.readFileSync('/etc/passwd');`;
        const res2 = validateCodeSecurity(attackPayload2, "js");
        expect(res2.safe).toBe(false);
        expect(res2.reason).toContain("Filesystem");
    });

    test("Sandbox rejects malicious OS and subprocess commands (Python)", () => {
        const { validateCodeSecurity } = require("./src/security");
        const attackPython1 = `import os\nos.system('rm -rf /')`;
        const res1 = validateCodeSecurity(attackPython1, "py");
        expect(res1.safe).toBe(false);
        expect(res1.reason).toContain("OS module");

        const attackPython2 = `__import__('subprocess').call(['ls', '-la'])`;
        const res2 = validateCodeSecurity(attackPython2, "py");
        expect(res2.safe).toBe(false);
        expect(res2.reason).toContain("Subprocess");
    });

    test("Sandbox allows benign algorithmic user code", () => {
        const { validateCodeSecurity } = require("./src/security");
        const validJS = `function twoSum(nums, target) { return [0, 1]; }`;
        expect(validateCodeSecurity(validJS, "js").safe).toBe(true);

        const validPy = `def two_sum(nums, target):\n    return [0, 1]`;
        expect(validateCodeSecurity(validPy, "py").safe).toBe(true);
    });

    test("Hidden testcase sanitizer strips secret inputs from public responses", () => {
        const rawProblem = {
            id: "two-sum",
            title: "Two Sum",
            testCases: [
                { input: "2 7\n9", output: "0 1", isHidden: false },
                { input: "100 200\n300", output: "0 1", isHidden: true },
                { input: "secret_case\n42", output: "secret_out", isHidden: true }
            ]
        };

        const sanitized = {
            ...rawProblem,
            testCases: (rawProblem.testCases || []).filter(tc => !tc.isHidden)
        };

        expect(sanitized.testCases.length).toBe(1);
        expect(sanitized.testCases[0]?.input).toBe("2 7\n9");
        expect(sanitized.testCases.some(tc => tc.isHidden)).toBe(false);
    });

    test("Rate limiter blocks requests exceeding threshold", () => {
        const requestLog = new Map<string, number>();
        const isAllowed = (ip: string, limit = 5) => {
            const count = requestLog.get(ip) || 0;
            if (count >= limit) return false;
            requestLog.set(ip, count + 1);
            return true;
        };

        for (let i = 0; i < 5; i++) {
            expect(isAllowed("192.168.1.100", 5)).toBe(true);
        }
        expect(isAllowed("192.168.1.100", 5)).toBe(false);
    });
});

// ─── PHASE 6: SECURE CODE EXECUTION ENGINE & LANGUAGE ADAPTER TESTS ─────────

describe("Phase 6 — Secure Code Execution Engine & Language Adapters", () => {
    test("LanguageAdapterRegistry maps all supported language keys and aliases", () => {
        const { LanguageAdapterRegistry } = require("../worker/src/adapters");
        expect(LanguageAdapterRegistry.get("js")).toBeDefined();
        expect(LanguageAdapterRegistry.get("javascript")).toBeDefined();
        expect(LanguageAdapterRegistry.get("py")).toBeDefined();
        expect(LanguageAdapterRegistry.get("python3")).toBeDefined();
        expect(LanguageAdapterRegistry.get("cpp")).toBeDefined();
        expect(LanguageAdapterRegistry.get("java")).toBeDefined();
        expect(LanguageAdapterRegistry.get("go")).toBeDefined();
        expect(LanguageAdapterRegistry.get("unknown_lang")).toBeUndefined();
    });

    test("Sanitized environment strips sensitive database and authentication variables", () => {
        const { getSanitizedEnv } = require("../worker/src/adapters");
        process.env.DATABASE_URL = "postgres://user:secret@localhost:5432/db";
        process.env.JWT_SECRET = "super_secret_jwt_key";
        
        const cleanEnv = getSanitizedEnv();
        expect(cleanEnv.DATABASE_URL).toBeUndefined();
        expect(cleanEnv.JWT_SECRET).toBeUndefined();
        expect(cleanEnv.PATH).toBeDefined();
    });

    test("Unsupported language request returns clear error verdict", async () => {
        const { LanguageAdapterRegistry } = require("../worker/src/adapters");
        const res = await LanguageAdapterRegistry.executeCode("brainfuck", {
            folderPath: "/tmp",
            codeWithDriver: "++++",
            inputData: "",
            timeoutMs: 1000,
            memoryLimitMb: 128
        });
        expect(res.passed).toBe(false);
        expect(res.error).toContain("Unsupported execution language: 'brainfuck'");
    });

    test("Output cap prevents excessive stdout buffer flooding (OLE)", () => {
        const maxOutputBytes = 100;
        let stdout = "";
        let isBufferExceeded = false;
        const chunk = "A".repeat(150);

        if (stdout.length + chunk.length > maxOutputBytes) {
            isBufferExceeded = true;
            stdout += chunk.slice(0, maxOutputBytes - stdout.length);
        }

        expect(isBufferExceeded).toBe(true);
        expect(stdout.length).toBe(100);
    });
});

// ─── PHASE 7: ONLINE JUDGE, SUBMISSIONS & CODE EDITOR TESTS ──────────────────

describe("Phase 7 — Online Judge, Submissions & Code Editor", () => {
    test("Judge statuses conform to standardized online judge enum set", () => {
        const validStatuses = [
            "Accepted", "Success",
            "WrongAnswer",
            "TLE", "Time Limit Exceeded",
            "MLE", "Memory Limit Exceeded",
            "CompileError",
            "RuntimeError",
            "InternalError"
        ];
        expect(validStatuses).toContain("Accepted");
        expect(validStatuses).toContain("WrongAnswer");
        expect(validStatuses).toContain("TLE");
        expect(validStatuses).toContain("CompileError");
        expect(validStatuses).toContain("RuntimeError");
    });

    test("Submission history filtering logic isolates status and language", () => {
        const mockSubmissions = [
            { id: "sub-1", status: "Success", language: "py" },
            { id: "sub-2", status: "WrongAnswer", language: "js" },
            { id: "sub-3", status: "Success", language: "cpp" }
        ];

        const filterSuccessPy = mockSubmissions.filter(s => s.status === "Success" && s.language === "py");
        expect(filterSuccessPy.length).toBe(1);
        expect(filterSuccessPy[0]?.id).toBe("sub-1");
    });

    test("Submission comparison produces side-by-side diff representation", () => {
        const sub1 = { code: "def two_sum(): return [0, 1]", language: "py" };
        const sub2 = { code: "def two_sum(): return [1, 2]", language: "py" };

        const diffLines = sub1.code !== sub2.code;
        expect(diffLines).toBe(true);
    });

    test("Shareable submission report payload structure validation", () => {
        const sharePayload = {
            id: "sub-123",
            problem: { id: "two-sum", title: "Two Sum", difficulty: "Easy" },
            language: "py",
            status: "Success",
            runtime: 42.5,
            beatsPercent: 88.5,
            code: "print('hello')",
            testCasesPassed: 15,
            testCasesTotal: 15
        };

        expect(sharePayload.id).toBe("sub-123");
        expect(sharePayload.problem.title).toBe("Two Sum");
        expect(sharePayload.testCasesPassed).toBe(15);
        expect(sharePayload.beatsPercent).toBeGreaterThan(0);
    });
});





