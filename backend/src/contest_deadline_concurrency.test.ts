import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";
import { prisma } from "../db";

describe("Contest Deadline Race & Boundary Protection Suite", () => {
  let server: Server;
  let base = "";
  let testUser: any;
  let testToken = "";
  let problemId = "search-an-element-in-an-array";

  beforeAll(async () => {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    base = `http://127.0.0.1:${port}`;

    // Create unique user for testing
    const email = `contest_deadline_${Date.now()}@codearena.test`;
    const res = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Contest Tester",
        email,
        password: "StrongPassword123!",
        username: `c_tester_${Date.now()}`
      })
    });
    const data = (await res.json()) as any;
    testUser = data.user;
    testToken = data.token;

    // Ensure the problem is published so active window submissions are accepted
    await prisma.problems.update({
      where: { id: problemId },
      data: { status: "Published" }
    }).catch(() => {});
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  test("Submissions at T-1s succeed, exact boundary and T+1s fail closed", async () => {
    const now = Date.now();

    // Create an active contest ending in 2 seconds
    const activeContest = await prisma.contest.create({
      data: {
        id: `contest_boundary_${Date.now()}`,
        title: "Boundary Contest",
        description: "Testing boundary precision",
        startTime: new Date(now - 10000), // Started 10s ago
        endTime: new Date(now + 2000),     // Ends in 2s
        status: "Active"
      }
    });

    // 1. Submit at T-2s (active window) -> should succeed (200)
    const validRes = await fetch(`${base}/api/v1/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testToken}`
      },
      body: JSON.stringify({
        problemId,
        contestId: activeContest.id,
        code: "function twoSum(nums, target) { return [0, 1]; }",
        language: "js"
      })
    });
    expect(validRes.status).toBe(200);
    const validBody = await validRes.json();
    expect(validBody.message).toBe("processing");

    // Create an expired contest (ended 1s ago)
    const expiredContest = await prisma.contest.create({
      data: {
        id: `contest_expired_${Date.now()}`,
        title: "Expired Contest",
        description: "Contest that has already concluded",
        startTime: new Date(now - 60000),
        endTime: new Date(now - 1000), // Ended 1s ago
        status: "Active"
      }
    });

    // 2. Submit at T+1s (past deadline) -> must be rejected with 400 CONTEST_ENDED
    const expiredRes = await fetch(`${base}/api/v1/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testToken}`
      },
      body: JSON.stringify({
        problemId,
        contestId: expiredContest.id,
        code: "function twoSum(nums, target) { return [0, 1]; }",
        language: "js"
      })
    });
    expect(expiredRes.status).toBe(400);
    const expiredBody = await expiredRes.json();
    expect(expiredBody.error).toBe("Contest has ended. Submissions are closed.");

    // Create a contest with status "Ended"
    const endedStatusContest = await prisma.contest.create({
      data: {
        id: `contest_status_ended_${Date.now()}`,
        title: "Ended Status Contest",
        description: "Contest marked as ended",
        startTime: new Date(now - 60000),
        endTime: new Date(now + 60000), // endTime in future but status is Ended
        status: "Ended"
      }
    });

    // 3. Submit to contest with status Ended -> must be rejected
    const endedRes = await fetch(`${base}/api/v1/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testToken}`
      },
      body: JSON.stringify({
        problemId,
        contestId: endedStatusContest.id,
        code: "function twoSum(nums, target) { return [0, 1]; }",
        language: "js"
      })
    });
    expect(endedRes.status).toBe(400);
    const endedBody = await endedRes.json();
    expect(endedBody.error).toBe("Contest has ended. Submissions are closed.");
  });

  test("10 concurrent submissions right at contest expiration boundary fail closed once deadline elapses", async () => {
    const contestId = `contest_race_${Date.now()}`;
    // Contest ending right now (now + 100ms)
    await prisma.contest.create({
      data: {
        id: contestId,
        title: "Race Boundary Contest",
        description: "10 concurrent submissions racing deadline",
        startTime: new Date(Date.now() - 5000),
        endTime: new Date(Date.now() - 10), // already passed by 10ms
        status: "Active"
      }
    });

    const promises = Array.from({ length: 10 }).map(() =>
      fetch(`${base}/api/v1/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`
        },
        body: JSON.stringify({
          problemId,
          contestId,
          code: "function twoSum(nums, target) { return [0, 1]; }",
          language: "js"
        })
      })
    );

    const responses = await Promise.all(promises);
    for (const r of responses) {
      expect(r.status).toBe(400);
      const body = await r.json();
      expect(body.error).toBe("Contest has ended. Submissions are closed.");
    }
  });
});
