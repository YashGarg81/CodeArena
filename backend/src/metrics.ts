// backend/src/metrics.ts
// Minimal operational metrics: in-memory counters + latency summaries with
// Prometheus-text exposition at GET /api/v1/metrics (admin-only).
// Worker verdicts arrive via Redis hash `codearena:metrics:worker_verdicts`
// and are merged best-effort; everything here degrades to "no data", never errors.

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

export function renderPrometheus(extra: Record<string, number> = {}): string {
  const lines: string[] = [];
  const merged = new Map<string, number>(counters);
  for (const [k, v] of Object.entries(extra)) {
    merged.set(k, (merged.get(k) || 0) + v);
  }
  for (const [k, v] of merged.entries()) {
    lines.push(`${k} ${v}`);
  }
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
  if (statusCode >= 500) {
    incCounter("http_server_errors_total", labels);
  }
}

export function recordJudgeRun(language: string, verdict: string, ms: number): void {
  const labels = { language, verdict };
  incCounter("judge_runs_total", labels);
  observeLatency("judge_run_duration_ms", ms, { language });
}
