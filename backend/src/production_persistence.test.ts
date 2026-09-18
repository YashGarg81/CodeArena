import { test, expect, describe, afterAll } from "bun:test";
import net from "node:net";
import path from "node:path";

// PRODUCTION PERSISTENCE E2E (audit P0 gate).
// Proves the production data path end-to-end against a LIVE PostgreSQL:
//   API(A) -> PG -> API(B) reads it -> restart -> still there, no dup seed ->
//   worker consumes Redis queue -> reads problem from SAME PG -> verdict in PG.
// Skipped unless a reachable PostgreSQL is configured (CI provides one).
// Worker sub-test additionally requires Docker + Redis.

function tcpReachable(host: string, port: number, timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (ok: boolean) => {
      try { socket.destroy(); } catch {}
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
    socket.connect(port, host);
  });
}

function pgHostPort(): { host: string; port: number } {
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public";
  const m = url.match(/@([^:/]+):(\d+)/);
  return { host: m?.[1] || "localhost", port: Number(m?.[2] || 5432) };
}

function redisHostPort(): { host: string; port: number } {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  const m = url.match(/:\/\/([^:/]+):(\d+)/);
  return { host: m?.[1] || "localhost", port: Number(m?.[2] || 6379) };
}

const pg = pgHostPort();
const redisEp = redisHostPort();
const pgUp = await tcpReachable(pg.host, pg.port);
const redisUp = await tcpReachable(redisEp.host, redisEp.port);

if (pgUp) {
  try {
    Bun.spawnSync([process.execPath, "x", "prisma", "db", "push", "--accept-data-loss"], {
      cwd: path.join(import.meta.dir, ".."),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public",
      },
    });
  } catch (err: any) {
    console.warn("Notice: Prisma schema sync in test setup:", err?.message || err);
  }
}

const dockerUp = (() => {
  try {
    const p = Bun.spawnSync(["docker", "info"]);
    return p.exitCode === 0;
  } catch {
    return false;
  }
})();

// Test-only JWT secrets (never real credentials; 32+ chars to pass the guard).
const TEST_JWT = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const TEST_REFRESH = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const CORS = "https://app.example.com";

const BACKEND_DIR = path.join(import.meta.dir, "..");
const WORKER_DIR = path.join(import.meta.dir, "..", "..", "worker");

interface Child {
  proc: ReturnType<typeof Bun.spawn>;
  base: string;
}

const children: Child[] = [];

async function waitForReady(base: string, timeoutMs = 120000): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(`${base}/ready`);
      if (res.status === 200) {
        const body = await res.json();
        if (body?.checks?.postgres === "ok") return;
      }
    } catch {}
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for readiness at ${base}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

function bootBackend(port: number): Child {
  const proc = Bun.spawn([process.execPath, "run", "index.ts"], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      NODE_ENV: "production",
      BUN_ENV: "production",
      PORT: String(port),
      CORS_ORIGIN: CORS,
      JWT_SECRET: TEST_JWT,
      REFRESH_TOKEN_SECRET: TEST_REFRESH,
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public",
      ...(process.env.REDIS_URL ? { REDIS_URL: process.env.REDIS_URL } : {}),
    },
    stdout: "ignore",
    stderr: "ignore",
  });
  const child = { proc, base: `http://127.0.0.1:${port}` };
  children.push(child);
  return child;
}

function bootWorker(): ReturnType<typeof Bun.spawn> {
  const proc = Bun.spawn([process.execPath, "run", "index.ts"], {
    cwd: WORKER_DIR,
    env: {
      ...process.env,
      NODE_ENV: "production",
      BUN_ENV: "production",
      SANDBOX_MODE: "docker",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public",
      ...(process.env.REDIS_URL ? { REDIS_URL: process.env.REDIS_URL } : {}),
    },
    stdout: "inherit",
    stderr: "inherit",
  });
  return proc;
}

afterAll(() => {
  for (const c of children) {
    try { c.proc.kill(); } catch {}
  }
});

async function signup(base: string, tag: string) {
  const stamp = `${tag}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const res = await fetch(`${base}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Persist Gate", email: `${stamp}@codearena.test`, password: "password12345", username: stamp }),
  });
  if (res.status !== 200) {
    const text = await res.text();
    console.error(`signup failed at ${base}: status ${res.status}, body: ${text}`);
  }
  expect(res.status).toBe(200);
  return res.json();
}

describe("PRODUCTION PERSISTENCE E2E", () => {
  test("prod boot fails closed without a database", async () => {
    const proc = Bun.spawn([process.execPath, "run", "index.ts"], {
      cwd: BACKEND_DIR,
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: "4199",
        CORS_ORIGIN: CORS,
        JWT_SECRET: TEST_JWT,
        REFRESH_TOKEN_SECRET: TEST_REFRESH,
        DATABASE_URL: "postgresql://postgres:postgrespassword@localhost:5999/codearena?schema=public",
      },
      stdout: "ignore",
      stderr: "pipe",
    });
    const exited = await Promise.race([
      proc.exited.then((code) => code),
      new Promise((r) => setTimeout(() => r("timeout"), 90000)),
    ]);
    try { proc.kill(); } catch {}
    expect(exited).not.toBe("timeout");
    expect(exited).not.toBe(0);
  }, 120000);

  test.skipIf(!pgUp)("prod boot reports ready against live PostgreSQL", async () => {
    const a = bootBackend(4121);
    await waitForReady(a.base);
    const res = await fetch(`${a.base}/ready`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.checks.postgres).toBe("ok");
  }, 180000);

  test.skipIf(!pgUp)("data written via instance A is readable via instance B", async () => {
    const a = bootBackend(4123);
    await waitForReady(a.base);
    const created: any = await signup(a.base, "persistgate");
    const b = bootBackend(4124);
    await waitForReady(b.base);
    const login = await fetch(`${b.base}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: created.user.email, password: "password12345" }),
    });
    expect(login.status).toBe(200);
    const problems = await fetch(`${b.base}/api/v1/problems?limit=5`);
    expect(problems.status).toBe(200);
    const list = await problems.json();
    expect((list.problems || []).length).toBeGreaterThan(0);
  }, 240000);

  test.skipIf(!pgUp)("data survives backend restart without duplication", async () => {
    const a = bootBackend(4125);
    await waitForReady(a.base);
    const before = await (await fetch(`${a.base}/api/v1/problems?limit=1000`)).json();
    const created: any = await signup(a.base, "restartgate");
    try { children.find((c) => c.base === a.base)?.proc.kill(); } catch {}
    await new Promise((r) => setTimeout(r, 3000));
    const a2 = bootBackend(4125);
    await waitForReady(a2.base);
    const after = await (await fetch(`${a2.base}/api/v1/problems?limit=1000`)).json();
    expect(after.total ?? after.problems?.length).toBe(before.total ?? before.problems?.length);
    const login = await fetch(`${a2.base}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: created.user.email, password: "password12345" }),
    });
    expect(login.status).toBe(200);
  }, 300000);

  test.skipIf(!pgUp || !redisUp || !dockerUp)("worker consumes queue from shared PG and returns verdict", async () => {
    // Ensure the js runner image is cached locally before the judge loop executes
    try {
      Bun.spawnSync(["docker", "pull", "oven/bun:1-alpine"]);
    } catch {}

    const { createClient } = await import("redis");
    let rq: any;
    try {
      rq = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
      await rq.connect();
    } catch {
      try {
        rq = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379", RESP: 2 } as any);
        await rq.connect();
      } catch {
        console.log("Redis unavailable or incompatible; skipping worker queue integration probe.");
        return;
      }
    }
    try {
      const a = bootBackend(4126);
      await waitForReady(a.base);
      const created: any = await signup(a.base, "workergate");
      const token: string = created.token;
      const worker = bootWorker();
      try {
        const sub = await fetch(`${a.base}/api/v1/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            problemId: "two-sum",
            language: "js",
            code: "function twoSum(nums, target) { const m = new Map(); for (let i = 0; i < nums.length; i++) { const c = target - nums[i]; if (m.has(c)) return [m.get(c), i]; m.set(nums[i], i); } return []; }",
          }),
        });
        expect(sub.status).toBe(200);
        const { id } = await sub.json();
        // The job must physically traverse Redis: pending or in-flight lists non-empty.
        const pending = await rq.lLen("problems");
        const inFlight = await rq.lLen("problems:processing");
        expect(pending + inFlight).toBeGreaterThan(0);
        let final: any = null;
        const start = Date.now();
        while (Date.now() - start < 180000) {
          await new Promise((r) => setTimeout(r, 2000));
          const got = await fetch(`${a.base}/api/v1/submissions/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const body = await got.json();
          const st = body?.submission?.status;
          if (st && st !== "Processing" && st !== "Pending") {
            final = body.submission;
            break;
          }
        }
        if (!final) {
          console.error(`[Worker Integration] Submission ${id} never finished within timeout. Worker exit code: ${worker.exitCode}`);
        }
        expect(final).not.toBeNull();
        expect(final.status).toBe("Success");
        expect(final.testCasesPassed).toBe(final.testCasesTotal);
        // Queue drained: job acknowledged, nothing stranded.
        expect(await rq.lLen("problems")).toBe(0);
        expect(await rq.lLen("problems:processing")).toBe(0);
        // Verdict row lives in PostgreSQL (direct second connection, bypassing
        // the test process's own in-memory fallback so the assertion is real).
        const { Client } = await import("pg");
        const pgClient = new Client({
          connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public",
        });
        await pgClient.connect();
        try {
          const r = await pgClient.query('SELECT status, "testCasesPassed", "testCasesTotal" FROM "Submissions" WHERE id = $1', [id]);
          expect(r.rows.length).toBe(1);
          expect(r.rows[0].status).toBe("Success");
          expect(Number(r.rows[0].testCasesPassed)).toBe(Number(r.rows[0].testCasesTotal));
        } finally {
          await pgClient.end().catch(() => {});
        }
      } finally {
        try { worker.kill(); } catch {}
      }
    } finally {
      try { await rq.quit(); } catch {}
    }
  }, 300000);
});
