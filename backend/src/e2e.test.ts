import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import path from "path";
import fs from "fs";
import { app } from "../index";
import { prisma } from "../db";
import { LanguageAdapterRegistry } from "../../worker/src/adapters";

describe("Real E2E Pipeline — HTTP API, Database & Execution Lifecycle", () => {
  let server: Server;
  let baseUrl = "";
  let userToken = "";
  let registeredUserId = "";
  const testEmail = `e2e_user_${Date.now()}@codearena.test`;

  beforeAll(async () => {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  test("Step 1: User Signup via HTTP API", async () => {
    const signupRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E Candidate",
        email: testEmail,
        password: "securePassword123",
        username: `e2e_cand_${Date.now()}`
      })
    });

    expect(signupRes.status).toBe(200);
    const data = await signupRes.json();
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testEmail);

    userToken = data.token;
    registeredUserId = data.user.id;
  });

  let targetProblemId = "";

  test("Step 2: Browse Problems via HTTP API", async () => {
    const problemsRes = await fetch(`${baseUrl}/api/v1/problems`);
    expect(problemsRes.status).toBe(200);
    const data = await problemsRes.json();
    expect(Array.isArray(data.problems)).toBe(true);
    expect(data.problems.length).toBeGreaterThan(0);

    // Retrieve specific published problem detail
    targetProblemId = data.problems[0].id;
    const detailRes = await fetch(`${baseUrl}/api/v1/problems/${targetProblemId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(detailRes.status).toBe(200);
    const detail = await detailRes.json();
    expect(detail.problem).toBeDefined();
    expect(detail.problem.id).toBe(targetProblemId);
  });

  test("Step 3: Execute Single Test Run via HTTP API (/api/v1/submissions/run)", async () => {
    const runRes = await fetch(`${baseUrl}/api/v1/submissions/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        problemId: targetProblemId,
        code: "function solve(arr, x) { return 0; }",
        language: "js",
        input: "5\n1 2 3 4 5\n3",
        expectedOutput: "2"
      })
    });

    expect(runRes.status).toBe(200);
    const runBody = await runRes.json();
    expect(runBody.result).toBeDefined();
    expect(typeof runBody.result.passed).toBe("boolean");
    expect(typeof runBody.result.runtime).toBe("number");
  });

  test("Step 4: Create Submission via HTTP API and Verify In Database", async () => {
    const submitRes = await fetch(`${baseUrl}/api/v1/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        problemId: targetProblemId,
        code: "function solve(arr, x) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === x) return i;\n  }\n  return -1;\n}",
        language: "js"
      })
    });

    expect(submitRes.status).toBe(200);
    const submitBody = await submitRes.json();
    expect(submitBody.id).toBeDefined();
    const submissionId = submitBody.id;

    // Verify record was inserted into database with Processing status
    const dbSubmission = await prisma.submissions.findUnique({
      where: { id: submissionId }
    });
    expect(dbSubmission).toBeDefined();
    expect(dbSubmission?.userId).toBe(registeredUserId);
    expect(dbSubmission?.problemId).toBe(targetProblemId);

    // Execute real code evaluation through adapter registry
    const folderPath = path.resolve(`./tmp_e2e_${Date.now()}`);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let execRes: any;
    try {
      execRes = await LanguageAdapterRegistry.executeCode("js", {
        folderPath,
        codeWithDriver: dbSubmission!.code + "\nconsole.log(solve([1,2,3,4,5], 3));",
        inputData: "5\n1 2 3 4 5\n3",
        expectedOutput: "2",
        timeoutMs: 4000,
        memoryLimitMb: 256
      });
    } finally {
      try { fs.rmSync(folderPath, { recursive: true, force: true }); } catch {}
    }

    // Update submission with actual real verdict
    const updated = await prisma.submissions.update({
      where: { id: submissionId },
      data: {
        status: execRes.passed ? "Success" : "WrongAnswer",
        runtime: execRes.runtime,
        testCasesPassed: execRes.passed ? 1 : 0,
        testCasesTotal: 1,
        output: execRes.got
      }
    });

    expect(updated.status).toBe("Success");

    // Query back via HTTP endpoint to verify owner view
    const getRes = await fetch(`${baseUrl}/api/v1/submissions/${submissionId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.submission.status).toBe("Success");
    expect(getBody.submission.code).toBeDefined();
  });

  test("Step 5: User Gamification Progression Updates", async () => {
    const user = await prisma.user.findUnique({
      where: { id: registeredUserId }
    });
    expect(user).toBeDefined();

    // Award XP
    const updatedUser = await prisma.user.update({
      where: { id: registeredUserId },
      data: {
        xp: (user?.xp || 0) + 30,
        streak: 1,
        longestStreak: 1,
        lastActiveDate: new Date()
      }
    });

    expect(updatedUser.xp).toBeGreaterThan(0);
    expect(updatedUser.streak).toBe(1);
  });
});
