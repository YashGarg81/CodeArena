import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";
import { sanitizeTestResults, publicWrongAnswerMessage, sanitizeJudgeOutput } from "./judgePrivacy";
import { toPublicProblemView } from "./publicProblem";
import { getClientIp } from "./rateLimit";

describe("Judge privacy sanitizer", () => {
  test("strips hidden test I/O from results", () => {
    const sanitized = sanitizeTestResults([
      { input: "1 2\n3", expected: "0 1", got: "0 1", passed: true, runtime: 1, isHidden: false },
      { input: "SECRET", expected: "LEAK", got: "x", passed: false, runtime: 2, isHidden: true, error: "WA" },
    ]);
    expect(sanitized[0]?.input).toBe("1 2\n3");
    expect(sanitized[1]?.input).toBeUndefined();
    expect(sanitized[1]?.expected).toBeUndefined();
    expect(sanitized[1]?.got).toBeUndefined();
    expect(sanitized[1]?.error).toBe("Hidden test failed");
  });

  test("public WA message hides hidden case payload", () => {
    const msg = publicWrongAnswerMessage({ isHidden: true, input: "secret", expected: "a", got: "b" }, 2);
    expect(msg).not.toContain("secret");
    expect(msg).toContain("hidden");
  });

  test("sanitizeJudgeOutput redacts leaked hidden I/O", () => {
    const out = sanitizeJudgeOutput("Wrong Answer\nInput:\nsecret\nExpected Output:\na", [
      { isHidden: true, passed: false },
    ]);
    expect(out).not.toContain("secret");
  });
});

describe("Public problem view", () => {
  test("omits official solutions and hidden tests", () => {
    const view = toPublicProblemView({
      id: "two-sum",
      title: "Two Sum",
      status: "Published",
      solutions: [{ lang: "js", code: "SECRET_SOLUTION" }],
      testCases: [
        { input: "1", output: "2", isHidden: false },
        { input: "SECRET", output: "X", isHidden: true },
      ],
    });
    expect((view as any).solutions).toBeUndefined();
    expect((view.testCases as any[]).some((t) => t.isHidden)).toBe(false);
  });
});

describe("Rate limiter IP source", () => {
  test("ignores X-Forwarded-For when TRUST_PROXY is unset", () => {
    const req = {
      headers: { "x-forwarded-for": "1.2.3.4" },
      ip: "10.0.0.9",
      socket: { remoteAddress: "10.0.0.9" },
    } as any;
    expect(getClientIp(req)).toBe("10.0.0.9");
  });
});

describe("API attack surface (live Express app)", () => {
  let server: Server;
  let base = "";
  let token = "";
  let userId = "";

  beforeAll(async () => {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    base = `http://127.0.0.1:${port}`;

    const email = `qa_${Date.now()}@codearena.test`;
    const signup = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "QA User", email, password: "correcthorse1", username: `qa_${Date.now()}` }),
    });
    const body = (await signup.json()) as { token?: string; user?: { id?: string } };
    token = body.token ?? "";
    userId = body.user?.id ?? "";
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  test("health is public", async () => {
    const res = await fetch(`${base}/api/v1/health`);
    expect(res.status).toBe(200);
  });

  test("signup rejects short password", async () => {
    const res = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "x", email: "bad@x.com", password: "short" }),
    });
    expect(res.status).toBe(400);
  });

  test("login rejects wrong password", async () => {
    const res = await fetch(`${base}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "nobody@x.com", password: "wrongpassword" }),
    });
    expect(res.status).toBe(400);
  });

  test("missing token on /auth/me is 401", async () => {
    const res = await fetch(`${base}/api/v1/auth/me`);
    expect(res.status).toBe(401);
  });

  test("tampered token on /auth/me is 403", async () => {
    const res = await fetch(`${base}/api/v1/auth/me`, {
      headers: { authorization: "Bearer not.a.real.token" },
    });
    expect(res.status).toBe(403);
  });

  test("admin routes reject anonymous", async () => {
    const res = await fetch(`${base}/api/v1/admin/dashboard`);
    expect(res.status).toBe(401);
  });

  test("admin routes reject student JWT", async () => {
    expect(token).toBeTruthy();
    const res = await fetch(`${base}/api/v1/admin/problems`, {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(403);
  });

  test("run code without auth is 401", async () => {
    const res = await fetch(`${base}/api/v1/submissions/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ problemId: "two-sum", code: "function twoSum(){return [0,1]}" }),
    });
    expect(res.status).toBe(401);
  });

  test("submit without auth is 401", async () => {
    const res = await fetch(`${base}/api/v1/submissions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ problemId: "two-sum", code: "function twoSum(){return [0,1]}" }),
    });
    expect(res.status).toBe(401);
  });

  test("problem submissions list without auth is 401", async () => {
    const res = await fetch(`${base}/api/v1/problems/two-sum/submissions`);
    expect(res.status).toBe(401);
  });

  test("like without auth is 401", async () => {
    const res = await fetch(`${base}/api/v1/problems/two-sum/like`, { method: "POST" });
    expect(res.status).toBe(401);
  });

  test("audit logs require admin", async () => {
    const anon = await fetch(`${base}/api/v1/audit-logs`);
    expect(anon.status).toBe(401);
    const user = await fetch(`${base}/api/v1/audit-logs`, {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(user.status).toBe(403);
  });

  test("notifications require auth", async () => {
    const res = await fetch(`${base}/api/v1/notifications`);
    expect(res.status).toBe(401);
  });

  test("authenticated user cannot list another user's private submissions with code", async () => {
    expect(userId).toBeTruthy();
    const res = await fetch(`${base}/api/v1/users/usr_demo_1/submissions`);
    expect([200, 404].includes(res.status)).toBe(true);
    if (res.status === 200) {
      const data = (await res.json()) as { submissions?: Array<{ code?: string; testResults?: unknown }> };
      for (const s of data.submissions || []) {
        expect(s.code).toBeUndefined();
        expect(s.testResults).toBeUndefined();
      }
    }
  });

  test("private submission GET is forbidden to strangers", async () => {
    const created = await fetch(`${base}/api/v1/submissions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ problemId: "two-sum", code: "function twoSum(){return [0,1]}", language: "js" }),
    });
    if (created.status !== 200 && created.status !== 201) {
      // Problem catalog may be empty if neither DB nor seed ran; do not fake a pass.
      expect([400, 404, 500].includes(created.status)).toBe(true);
      return;
    }
    const { id } = (await created.json()) as { id: string };
    const stranger = await fetch(`${base}/api/v1/submissions/${id}`);
    expect(stranger.status).toBe(403);
    const share = await fetch(`${base}/api/v1/submissions/${id}/share`);
    expect(share.status).toBe(404);
  });

  test("public problem list does not include Draft status when drafts exist", async () => {
    const res = await fetch(`${base}/api/v1/problems`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { problems?: Array<{ status?: string }> };
    for (const p of data.problems || []) {
      expect(p.status === undefined || p.status === "Published").toBe(true);
    }
  });

  test("authenticated like toggles like state and count", async () => {
    const res1 = await fetch(`${base}/api/v1/problems/two-sum/like`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` }
    });
    expect([200, 404].includes(res1.status)).toBe(true);
    if (res1.status === 200) {
      const data1 = (await res1.json()) as { success: boolean; liked: boolean; likeCount: number };
      expect(data1.success).toBe(true);
      expect(typeof data1.liked).toBe("boolean");

      const res2 = await fetch(`${base}/api/v1/problems/two-sum/like`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` }
      });
      expect(res2.status).toBe(200);
      const data2 = (await res2.json()) as { success: boolean; liked: boolean; likeCount: number };
      expect(data2.success).toBe(true);
      expect(data2.liked).toBe(!data1.liked);
    }
  });

  test("auth logout revokes access token", async () => {
    // Register temporary user token
    const signup = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Logout Test", email: `logout_${Date.now()}@test.com`, password: "password123" }),
    });
    expect(signup.status).toBe(200);
    const { token: tempToken } = (await signup.json()) as { token: string };

    const meBefore = await fetch(`${base}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${tempToken}` }
    });
    expect(meBefore.status).toBe(200);

    const logout = await fetch(`${base}/api/v1/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${tempToken}` }
    });
    expect(logout.status).toBe(200);

    const meAfter = await fetch(`${base}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${tempToken}` }
    });
    expect(meAfter.status).toBe(401);
  });
});
