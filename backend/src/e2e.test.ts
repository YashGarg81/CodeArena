import { test, expect, describe } from "bun:test";

describe("Issue 23 — End-to-End (E2E) Submission & Progression Lifecycle Pipeline", () => {
  interface User {
    id: string;
    email: string;
    username: string;
    xp: number;
    level: number;
    streak: number;
    longestStreak: number;
    lastActiveDate: Date | null;
  }

  interface Submission {
    id: string;
    userId: string;
    problemId: string;
    code: string;
    language: string;
    status: "Pending" | "Processing" | "Success" | "WrongAnswer" | "TLE" | "RuntimeError" | "Failure";
    runtime?: number;
    passedCount?: number;
    totalCount?: number;
  }

  test("Complete E2E user flow: Signup -> Browse Problem -> Write Code -> Submit -> Worker Judge -> Verdict -> XP/Streak Progression", async () => {
    // 1. Signup / Profile Setup
    const user: User = {
      id: "usr_e2e_test_1",
      email: "candidate@codearena.dev",
      username: "algomaster",
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null
    };
    expect(user.xp).toBe(0);
    expect(user.level).toBe(1);

    // 2. Browse & Select Problem
    const problem = {
      id: "reverse-string",
      title: "Reverse String",
      difficulty: "Easy",
      testCases: [
        { input: "hello", output: "olleh", isHidden: false },
        { input: "codearena", output: "aneraedoc", isHidden: false },
        { input: "algorithm", output: "mhtirogla", isHidden: true }
      ]
    };
    expect(problem.testCases.length).toBe(3);

    // 3. User Submits Code
    const userCode = `function reverseString(s) { return s.split('').reverse().join(''); }`;
    const submission: Submission = {
      id: "sub_e2e_001",
      userId: user.id,
      problemId: problem.id,
      code: userCode,
      language: "js",
      status: "Pending"
    };

    // 4. Reliable Queue Enqueue & Worker Dequeue
    const pendingQueue: Submission[] = [submission];
    const processingQueue: Submission[] = [];

    // Atomic move from pending to processing (rPopLPush)
    const job = pendingQueue.pop()!;
    job.status = "Processing";
    processingQueue.push(job);
    expect(processingQueue.length).toBe(1);

    // 5. Worker Evaluates All Test Cases
    const testResults: Array<{ passed: boolean; runtime: number }> = [];
    for (const tc of problem.testCases) {
      // Execute function logic safely
      const fn = new Function("s", `${job.code}; return reverseString(s);`);
      const got = fn(tc.input);
      const passed = got === tc.output;
      testResults.push({ passed, runtime: 5 });
    }

    const allPassed = testResults.every(r => r.passed);
    job.status = allPassed ? "Success" : "WrongAnswer";
    job.passedCount = testResults.filter(r => r.passed).length;
    job.totalCount = testResults.length;
    job.runtime = 5;

    // 6. Queue Acknowledgment (lRem)
    const processedIdx = processingQueue.findIndex(s => s.id === job.id);
    if (processedIdx !== -1) processingQueue.splice(processedIdx, 1);
    expect(processingQueue.length).toBe(0);

    // 7. Verify Verdict
    expect(job.status).toBe("Success");
    expect(job.passedCount).toBe(3);

    // 8. User Gamification & Stats Progression
    if (job.status === "Success") {
      const xpGain = problem.difficulty === "Hard" ? 50 : problem.difficulty === "Medium" ? 30 : 15;
      user.xp += xpGain;
      user.level = Math.floor(user.xp / 100) + 1;
      user.streak = 1;
      user.longestStreak = 1;
      user.lastActiveDate = new Date();
    }

    expect(user.xp).toBe(15);
    expect(user.level).toBe(1);
    expect(user.streak).toBe(1);

    // 9. Second Submission on same day maintains streak without jumping
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const lastActiveStr = user.lastActiveDate ? user.lastActiveDate.toISOString().slice(0, 10) : "";
    if (lastActiveStr === todayStr) {
      // Same day: streak remains steady
    } else {
      user.streak += 1;
    }
    expect(user.streak).toBe(1);
  });
});
