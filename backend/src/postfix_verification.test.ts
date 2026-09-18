import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";
import { prisma } from "../db";
import { computeIsTest } from "./config";

describe("Post-fix regression: audit remediation verification", () => {
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

  const signup = async (tag: string) => {
    const stamp = `${tag}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const res = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Postfix", email: `${stamp}@codearena.test`, password: "password12345", username: stamp }),
    });
    expect(res.status).toBe(200);
    return res.json();
  };

  test("C-5: production-shaped env with adversarial argv stays production", () => {
    const prodEnv = { NODE_ENV: "production" };
    expect(computeIsTest(prodEnv, ["bun", "/app/latest/server/index.ts"])).toBe(false);
    expect(computeIsTest(prodEnv, ["bun", "/opt/contest-platform/index.ts"])).toBe(false);
    expect(computeIsTest(prodEnv, ["bun", "harness-runner.ts"])).toBe(false);
    expect(computeIsTest({ NODE_ENV: "test" }, ["bun", "index.ts"])).toBe(true);
    expect(computeIsTest({ BUN_ENV: "test" }, ["bun", "index.ts"])).toBe(true);
    expect(computeIsTest({}, ["bun", "run", "test"])).toBe(false);
  });

  test("C-4: access token is rejected after password reset", async () => {
    const created = await signup("reset401");
    const oldToken: string = created.token;
    const email: string = created.user.email;

    const meBefore = await fetch(`${base}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${oldToken}` },
    });
    expect(meBefore.status).toBe(200);

    const forgot = await fetch(`${base}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    expect(forgot.status).toBe(200);
    const forgotBody = await forgot.json();
    expect(typeof forgotBody.resetToken).toBe("string");

    const reset = await fetch(`${base}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: forgotBody.resetToken, newPassword: "brand-new-password-1" }),
    });
    expect(reset.status).toBe(200);

    const meAfter = await fetch(`${base}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${oldToken}` },
    });
    expect(meAfter.status).toBe(401);
  });

  test("S-2: demoted admin loses storage access despite stale admin token", async () => {
    const adminCandidate = await signup("demoteadmin");
    const victim = await signup("demotevictim");

    // Victim uploads a private file.
    const uploadRes = await fetch(`${base}/api/v1/storage/upload?filename=demote_probe.txt`, {
      method: "POST",
      headers: { "Content-Type": "text/plain", Authorization: `Bearer ${victim.token}` },
      body: "victim private data",
    });
    expect(uploadRes.status).toBe(200);
    const { key } = await uploadRes.json();

    // Promote candidate, then mint a token carrying the ADMIN claim.
    await prisma.user.update({ where: { id: adminCandidate.user.id }, data: { role: "ADMIN" } });
    const loginRes = await fetch(`${base}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminCandidate.user.email, password: "password12345" }),
    });
    expect(loginRes.status).toBe(200);
    const adminToken: string = (await loginRes.json()).token;

    const asAdmin = await fetch(`${base}/api/v1/storage/files/${key}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(asAdmin.status).toBe(200);

    // Demote in DB; the same (still unexpired) token must now be denied.
    await prisma.user.update({ where: { id: adminCandidate.user.id }, data: { role: "STUDENT" } });
    const asDemoted = await fetch(`${base}/api/v1/storage/files/${key}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(asDemoted.status).toBe(403);
  });

  test("S-6: unauthenticated benchmark flood trips the rate limiter", async () => {
    let saw429 = false;
    for (let i = 0; i < 35; i++) {
      const res = await fetch(`${base}/api/v1/submissions/benchmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runtimeMs: 120, memoryMb: 32 }),
      });
      if (res.status === 429) {
        saw429 = true;
        break;
      }
      expect([200, 429].includes(res.status)).toBe(true);
    }
    expect(saw429).toBe(true);
  });
});
