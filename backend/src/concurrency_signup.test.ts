import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";
import { prisma } from "../db";

describe("Concurrent Signup Race Condition Suite", () => {
  let server: Server;
  let base = "";

  beforeAll(async () => {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    base = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  test("10 concurrent signups with identical email -> exactly 1 succeeds (200), 9 receive 409 Conflict, 0 receive 500", async () => {
    const raceEmail = `race_signup_${Date.now()}@codearena.test`;
    const signupPayload = {
      name: "Race Tester",
      email: raceEmail,
      password: "StrongPassword123!",
      username: `racer_${Date.now()}`
    };

    // Dispatch 10 concurrent requests simultaneously
    const promises = Array.from({ length: 10 }).map(() =>
      fetch(`${base}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload)
      })
    );

    const responses = await Promise.all(promises);
    const statuses = responses.map((r) => r.status);

    const count200 = statuses.filter((s) => s === 200).length;
    const count409 = statuses.filter((s) => s === 409).length;
    const count500 = statuses.filter((s) => s === 500).length;

    expect(count200).toBe(1);
    expect(count409).toBe(9);
    expect(count500).toBe(0);

    // Verify in database: exactly 1 user record created
    const usersInDb = await prisma.user.findMany({ where: { email: raceEmail } });
    expect(usersInDb.length).toBe(1);
    expect(usersInDb[0]?.email).toBe(raceEmail);
  });
});
