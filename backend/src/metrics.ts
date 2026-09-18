// backend/src/metrics.ts
// Minimal operational metrics: in-memory counters + latency summaries with
// Prometheus-text exposition at GET /api/v1/metrics (admin-only).
// Worker verdicts arrive via Redis hash `codearena:metrics:worker_verdicts`
// and are merged best-effort; everything here degrades to "no data", never errors.
// Metrics are periodically persisted to Redis for cross-restart continuity.

import { createClient } from "redis";

function sanitizeLabel(value: string): string {
  return String(value ?? "unknown").replace(/[^a-zA-Z0-9_.\-/:*]/g, "_").slice(0, 120);
}

function keyOf(name: string, labels: Record<string, string>): string {
  const parts = Object.entries(labels)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}="${sanitizeLabel(v)}"`);
  return parts.length > 0 ? `${name}{${parts.join(",")}}` : name;
}

const counters = new Map<string, number>();
const latencySum = new Map<string, number>();
const latencyCount = new Map<string, number>();
const startedAt = Date.now();

let redisClient: ReturnType<typeof createClient> | null = null;
let redisReady = false;

function getRedisClient(): ReturnType<typeof createClient> | null {
  if (!redisClient && process.env.REDIS_URL) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", () => { redisReady = false; });
    redisClient.connect().then(() => { redisReady = true; }).catch(() => { redisReady = false; });
  }
  return redisReady ? redisClient : null;
}

async function persistCounters(): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    const data = JSON.stringify({ counters: Object.fromEntries(counters), latencySum: Object.fromEntries(latencySum), latencyCount: Object.fromEntries(latencyCount), startedAt });
    await client.set("codearena:metrics:backend", data);
  } catch {}
}

async function restoreCounters(): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    const data = await client.get("codearena:metrics:backend");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.counters) for (const [k, v] of Object.entries(parsed.counters)) counters.set(k, Number(v));
      if (parsed.latencySum) for (const [k, v] of Object.entries(parsed.latencySum)) latencySum.set(k, Number(v));
      if (parsed.latencyCount) for (const [k, v] of Object.entries(parsed.latencyCount)) latencyCount.set(k, Number(v));
      if (parsed.startedAt) Object.assign(startedAt, parsed.startedAt);
    }
  } catch {}
}

export function incCounter(name: string, labels: Record<string, string> = {}, by = 1): void {
  const key = keyOf(name, labels);
  counters.set(key, (counters.get(key) || 0) + by);
}

export function observeLatency(name: string, ms: number, labels: Record<string, string> = {}): void {
  if (!Number.isFinite(ms) || ms < 0) return;
  const key = keyOf(name, labels);
  latencySum.set(key, (latencySum.get(key) || 0) + ms);
  latencyCount.set(key, (latencyCount.get(key) || 0) + 1);
}

export function snapshot(): { uptimeMs: number; counters: Record<string, number>; latencyAvgMs: Record<string, number> } {
  const avg: Record<string, number> = {};
  for (const [k, sum] of latencySum.entries()) {
    const n = latencyCount.get(k) || 1;
    avg[k] = Math.round((sum / n) * 100) / 100;
  }
  return { uptimeMs: Date.now() - startedAt, counters: Object.fromEntries(counters), latencyAvgMs: avg };
}

async function fetchWorkerVerdicts(): Promise<Record<string, number>> {
  const client = getRedisClient();
  if (!client) return {};
  try {
    const data = await client.hGetAll("codearena:metrics:worker_verdicts");
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(data)) {
      out[`worker_verdicts_total{verdict="${sanitizeLabel(k)}"`] = Number(v);
    }
    return out;
  } catch {
    return {};
  }
}

export async function renderPrometheusWithWorker(extra: Record<string, number> = {}): Promise<string> {
  const workerVerdicts = await fetchWorkerVerdicts();
  const lines: string[] = [];
  const merged = new Map<string, number>(counters);
  for (const [k, v] of Object.entries(extra)) merged.set(k, (merged.get(k) || 0) + v);
  for (const [k, v] of Object.entries(workerVerdicts)) merged.set(k, (merged.get(k) || 0) + v);
  for (const [k, v] of merged.entries()) lines.push(`${k} ${v}`);
  for (const [k, sum] of latencySum.entries()) {
    const n = latencyCount.get(k) || 1;
    lines.push(`${k}_sum ${Math.round(sum * 100) / 100}`);
    lines.push(`${k}_count ${n}`);
  }
  return lines.join("\n") + (lines.length > 0 ? "\n" : "");
}

export function renderPrometheus(extra: Record<string, number> = {}): string {
  const lines: string[] = [];
  const merged = new Map<string, number>(counters);
  for (const [k, v] of Object.entries(extra)) merged.set(k, (merged.get(k) || 0) + v);
  for (const [k, v] of merged.entries()) lines.push(`${k} ${v}`);
  for (const [k, sum] of latencySum.entries()) {
    const n = latencyCount.get(k) || 1;
    lines.push(`${k}_sum ${Math.round(sum * 100) / 100}`);
    lines.push(`${k}_count ${n}`);
  }
  return lines.join("\n") + (lines.length > 0 ? "\n" : "");
}

export function resetMetrics(): void {
  counters.clear();
  latencySum.clear();
  latencyCount.clear();
}

export function recordHttpRequest(method: string, route: string, statusCode: number, ms: number): void {
  const labels = { method, route, status: String(statusCode) };
  incCounter("http_requests_total", labels);
  observeLatency("http_request_duration_ms", ms, { method, route });
  if (statusCode >= 500) incCounter("http_server_errors_total", labels);
}

export function recordJudgeRun(language: string, verdict: string, ms: number): void {
  const labels = { language, verdict };
  incCounter("judge_runs_total", labels);
  observeLatency("judge_run_duration_ms", ms, { language });
}

// Initialize persistence
if (process.env.REDIS_URL) {
  restoreCounters();
  setInterval(persistCounters, 30000);
}
