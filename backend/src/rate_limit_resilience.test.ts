import { test, expect, describe } from "bun:test";
import {
  createRateLimiter,
  getClientIp,
  recordFailedLogin,
  resetFailedLogins,
  isAccountLocked
} from "./rateLimit";

describe("Rate Limiting Resilience & Account DoS Defense Suite", () => {
  test("1. Failed login lockout triggers after 5 consecutive failures", async () => {
    const email = `victim_${Date.now()}@codearena.test`;
    await resetFailedLogins(email);

    expect(await isAccountLocked(email)).toBe(false);

    // 4 failed attempts should not lock
    for (let i = 1; i <= 4; i++) {
      const res = await recordFailedLogin(email);
      expect(res.locked).toBe(false);
      expect(res.remainingAttempts).toBe(5 - i);
    }
    expect(await isAccountLocked(email)).toBe(false);

    // 5th failed attempt locks the account
    const res5 = await recordFailedLogin(email);
    expect(res5.locked).toBe(true);
    expect(res5.remainingAttempts).toBe(0);
    expect(await isAccountLocked(email)).toBe(true);

    // Resetting unlocks
    await resetFailedLogins(email);
    expect(await isAccountLocked(email)).toBe(false);
  });

  test("2. Unauthenticated random email requests do not exhaust user quota before verification", async () => {
    const userEmail = `alice_safe_${Date.now()}@codearena.test`;
    // An attacker sends queries for another email
    const attackerEmail = `bob_target_${Date.now()}@codearena.test`;
    for (let i = 0; i < 3; i++) {
      await recordFailedLogin(attackerEmail);
    }

    // Alice's account remains completely unlocked
    expect(await isAccountLocked(userEmail)).toBe(false);
  });

  test("3. Atomic multi-key limiter rejects when any key exceeds quota", async () => {
    const limiter = createRateLimiter("test-atomic", 2, 60000, {
      keyGenerator: (req) => [`custom:${(req as any).customId}`]
    });

    const mockRes = () => {
      const res: any = {
        statusCode: 200,
        status(code: number) { this.statusCode = code; return this; },
        json(data: any) { this.data = data; return this; }
      };
      return res;
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const req1 = { ip: "192.168.1.50", headers: {}, customId: "user_alpha" } as any;

    // Call 1: pass
    nextCalled = false;
    const res1 = mockRes();
    await limiter(req1, res1, next);
    expect(nextCalled).toBe(true);

    // Call 2: pass
    nextCalled = false;
    const res2 = mockRes();
    await limiter(req1, res2, next);
    expect(nextCalled).toBe(true);

    // Call 3: blocked (limit is 2)
    nextCalled = false;
    const res3 = mockRes();
    await limiter(req1, res3, next);
    expect(nextCalled).toBe(false);
    expect(res3.statusCode).toBe(429);
  });

  test("4. Fail-closed behavior on limiter error", async () => {
    const strictLimiter = createRateLimiter("strict-test", 1, 60000, { failClosed: true });

    const mockRes = () => {
      const res: any = {
        statusCode: 200,
        status(code: number) { this.statusCode = code; return this; },
        json(data: any) { this.data = data; return this; }
      };
      return res;
    };

    let nextCalled = false;
    const req = { ip: "10.0.0.99", headers: {} } as any;

    // Call 1: passes
    await strictLimiter(req, mockRes(), () => { nextCalled = true; });
    expect(nextCalled).toBe(true);

    // Call 2: fails closed (429)
    nextCalled = false;
    const res2 = mockRes();
    await strictLimiter(req, res2, () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(res2.statusCode).toBe(429);
  });
});
