import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";
import { incCounter, observeLatency, renderPrometheus, snapshot, resetMetrics, recordHttpRequest, recordJudgeRun } from "./metrics";

describe("Operational metrics registry", () => {
  test("counters accumulate and render in Prometheus text format", () => {
    resetMetrics();
    incCounter("judge_runs_total", { language: "js", verdict: "AC" });
    incCounter("judge_runs_total", { language: "js", verdict: "AC" });
    incCounter("judge_runs_total", { language: "py", verdict: "WA" });
    const out = renderPrometheus();
    expect(out).toContain('judge_runs_total{language="js",verdict="AC"} 2');
    expect(out).toContain('judge_runs_total{language="py",verdict="WA"} 1');
  });

  test("latency observations produce sum/count series and averages", () => {
    resetMetrics();
    observeLatency("judge_run_duration_ms", 100, { language: "js" });
    observeLatency("judge_run_duration_ms", 300, { language: "js" });
    const out = renderPrometheus();
    expect(out).toContain('judge_run_duration_ms{language="js"}_sum 400');
    expect(out).toContain('judge_run_duration_ms{language="js"}_count 2');
    expect(snapshot().latencyAvgMs['judge_run_duration_ms{language="js"}']).toBe(200);
  });

  test("label values are sanitized against injection", () => {
    resetMetrics();
    recordHttpRequest("GET", "/x\n evil\"", 200, 5);
    const out = renderPrometheus();
    expect(out).not.toContain("\n evil");
    expect(out).toContain("http_requests_total");
  });

  test("server errors are counted separately", () => {
    resetMetrics();
    recordHttpRequest("GET", "/problems", 500, 3);
    recordJudgeRun("go", "AC", 12);
    const snap = snapshot();
    expect(snap.counters['http_server_errors_total{method="GET",route="/problems",status="500"}']).toBe(1);
    expect(snap.counters['judge_runs_total{language="go",verdict="AC"}']).toBe(1);
  });
});

describe("Metrics endpoint authorization", () => {
  let server: Server;
  let base = "";

  beforeAll(async () => {
    resetMetrics();
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

  test("anonymous metrics scrape is rejected", async () => {
    const res = await fetch(`${base}/api/v1/metrics`);
    expect(res.status).toBe(401);
  });

  test("student token cannot scrape metrics", async () => {
    const stamp = Date.now();
    const signup = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Metrics", email: `metrics_${stamp}@codearena.test`, password: "password12345", username: `metrics_${stamp}` }),
    });
    const body = await signup.json();
    const res = await fetch(`${base}/api/v1/metrics`, {
      headers: { Authorization: `Bearer ${body.token}` },
    });
    expect(res.status).toBe(403);
  });
});
