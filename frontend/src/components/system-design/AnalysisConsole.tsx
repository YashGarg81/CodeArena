// frontend/src/components/system-design/AnalysisConsole.tsx
import React from "react";
import { Icons } from "../ui/Icons";
import type { SimMetrics } from "./types";

export function AnalysisConsole({
  bottomTab,
  bottomExpanded,
  onTabChange,
  onToggleExpanded,
  trafficMultiplier,
  onTrafficMultiplierChange,
  simMetrics,
  injectedFailure,
  onSetInjectedFailure,
  linterIssues,
  scoreScalability,
  scoreReliability,
  scoreAvailability,
  scorePerformance,
  overallScore,
  monthlyCostTotal,
  monthlyCostCompute,
  monthlyCostDb,
  monthlyCostCache,
  monthlyCostQueue,
  monthlyCostCdn,
  architectureTimeline
}: {
  bottomTab: string;
  bottomExpanded: boolean;
  onTabChange: (tab: any) => void;
  onToggleExpanded: () => void;
  trafficMultiplier: number;
  onTrafficMultiplierChange: (val: number) => void;
  simMetrics: SimMetrics;
  injectedFailure: string | null;
  onSetInjectedFailure: (val: string | null) => void;
  linterIssues: Array<{ level: string; title: string; desc: string }>;
  scoreScalability: number;
  scoreReliability: number;
  scoreAvailability: number;
  scorePerformance: number;
  overallScore: number;
  monthlyCostTotal: number;
  monthlyCostCompute: number;
  monthlyCostDb: number;
  monthlyCostCache: number;
  monthlyCostQueue: number;
  monthlyCostCdn: number;
  architectureTimeline: Array<{ time: string; action: string; impact: string; costChange: string }>;
}) {
  const tabs = [
    { id: "traffic", label: "Traffic Simulation", icon: <Icons.Activity size={13} /> },
    { id: "chaos", label: "Chaos Testing", icon: <Icons.Flame size={13} /> },
    { id: "linter", label: "Architecture Linter", icon: <Icons.Shield size={13} /> },
    { id: "tradeoffs", label: "Trade-offs", icon: <Icons.Split size={13} /> },
    { id: "score", label: "Architecture Score", icon: <Icons.Award size={13} /> },
    { id: "cost", label: "Cost Explorer", icon: <Icons.Dollar size={13} /> },
    { id: "timeline", label: "Decisions", icon: <Icons.History size={13} /> },
    { id: "diff", label: "Packet Trace", icon: <Icons.Zap size={13} /> },
  ];

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: bottomExpanded ? 190 : 36,
        transition: "height 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {/* Bottom Tabs Bar */}
      <div
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-light)",
          padding: "4px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          overflowX: "auto"
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              if (!bottomExpanded) onToggleExpanded();
            }}
            style={{
              background: bottomTab === tab.id && bottomExpanded ? "var(--bg-tertiary)" : "transparent",
              color: bottomTab === tab.id && bottomExpanded ? "var(--text-primary)" : "var(--text-muted)",
              border: "1px solid",
              borderColor: bottomTab === tab.id && bottomExpanded ? "var(--border)" : "transparent",
              borderRadius: "var(--radius-sm)",
              padding: "4px 10px",
              fontSize: "11.5px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              whiteSpace: "nowrap"
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}

        <button
          onClick={onToggleExpanded}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "11px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          {bottomExpanded ? <Icons.Minimize size={13} /> : <Icons.Maximize size={13} />}
          <span>{bottomExpanded ? "Collapse" : "Expand"}</span>
        </button>
      </div>

      {/* Bottom Content Area */}
      {bottomExpanded && (
        <div style={{ flex: 1, padding: "12px 18px", overflowY: "auto", display: "flex", gap: 20 }}>
          {/* 1. TRAFFIC SIMULATOR */}
          {bottomTab === "traffic" && (
            <div style={{ display: "flex", gap: 24, width: "100%", alignItems: "center" }}>
              <div style={{ width: 220 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  Traffic Multiplier: {trafficMultiplier}x
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={trafficMultiplier}
                  onChange={e => onTrafficMultiplierChange(parseFloat(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  <span>1x (Base)</span>
                  <span>3x (Spike)</span>
                  <span>5x (Peak)</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, flex: 1 }}>
                <div className="card card-sm" style={{ margin: 0, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>THROUGHPUT</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                    {simMetrics.rps.toLocaleString()} RPS
                  </div>
                </div>
                <div className="card card-sm" style={{ margin: 0, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>P99 LATENCY</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: simMetrics.p99Latency > 80 ? "var(--accent-red)" : "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
                    {simMetrics.p99Latency} ms
                  </div>
                </div>
                <div className="card card-sm" style={{ margin: 0, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ERROR RATE</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: simMetrics.errorRate > 0.05 ? "var(--accent-red)" : "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
                    {(simMetrics.errorRate * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="card card-sm" style={{ margin: 0, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>CPU LOAD</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: simMetrics.cpu > 80 ? "var(--accent-red)" : "var(--accent-orange)", fontFamily: "var(--font-mono)" }}>
                    {simMetrics.cpu}%
                  </div>
                </div>
                <div className="card card-sm" style={{ margin: 0, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>MEMORY</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    {simMetrics.memory}%
                  </div>
                </div>
                <div className="card card-sm" style={{ margin: 0, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>QUEUE DEPTH</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: simMetrics.queueBacklog > 1000 ? "var(--accent-red)" : "var(--accent-purple)", fontFamily: "var(--font-mono)" }}>
                    {simMetrics.queueBacklog.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CHAOS MODE (FAILURE INJECTION) */}
          {bottomTab === "chaos" && (
            <div style={{ display: "flex", gap: 20, width: "100%" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: 360 }}>
                {[
                  { id: null, label: "All Healthy", icon: <Icons.CheckCircle size={13} /> },
                  { id: "db_primary", label: "Primary DB Crash", icon: <Icons.Alert size={13} /> },
                  { id: "redis_cache", label: "Redis Cluster Outage", icon: <Icons.Zap size={13} /> },
                  { id: "region_failure", label: "Region Partition", icon: <Icons.Flame size={13} /> },
                ].map(f => (
                  <button
                    key={String(f.id)}
                    onClick={() => onSetInjectedFailure(f.id)}
                    style={{
                      background: injectedFailure === f.id ? (f.id === null ? "var(--accent-green)" : "var(--accent-red)") : "var(--bg-tertiary)",
                      color: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "6px 10px",
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    {f.icon}
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", padding: "10px 14px", border: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: injectedFailure ? "var(--accent-red)" : "var(--accent-green)", display: "flex", alignItems: "center", gap: 6 }}>
                  {injectedFailure ? <Icons.Alert size={14} /> : <Icons.CheckCircle size={14} />}
                  <span>{injectedFailure ? `Failure Injected: ${injectedFailure.toUpperCase()}` : "System Operating Normally"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.45 }}>
                  {injectedFailure === "db_primary" && "Write requests fail immediately with HTTP 500. Read replicas continue servicing cached queries. Mitigation: Trigger Patroni / Sentinel automated failover."}
                  {injectedFailure === "redis_cache" && "Thundering herd spike hits Primary SQL instance, driving CPU to 96%. Mitigation: Activate single-flight mutex locking on cache misses."}
                  {injectedFailure === "region_failure" && "Cross-region replication split-brain risk. Mitigation: Strict Raft/Paxos quorum majority check before accepting writes."}
                  {!injectedFailure && "All compute instances, read replica streams, and edge CDN nodes are healthy."}
                </div>
              </div>
            </div>
          )}

          {/* 3. ARCHITECTURE LINTER */}
          {bottomTab === "linter" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%" }}>
              {linterIssues.slice(0, 3).map((issue, idx) => (
                <div key={idx} style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span className={`badge ${issue.level === "CRITICAL" ? "badge-hard" : issue.level === "WARNING" ? "badge-medium" : "badge-easy"}`} style={{ fontSize: 9 }}>
                      {issue.level}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>{issue.title}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text-secondary)", lineHeight: 1.35 }}>{issue.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* 4. TRADEOFF ENGINE */}
          {bottomTab === "tradeoffs" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, width: "100%" }}>
              <div style={{ background: "var(--bg-tertiary)", borderRadius: 6, padding: "10px 12px", border: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-blue)" }}>Decision: PostgreSQL vs Distributed NoSQL</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
                  • <strong>PostgreSQL</strong>: Strong ACID transactions, secondary B-Tree indexing, complex joins. Harder horizontal sharding.<br />
                  • <strong>NoSQL</strong>: Sub-10ms partition scaling, zero Ops maintenance. Limited query access patterns.
                </div>
              </div>
              <div style={{ background: "var(--bg-tertiary)", borderRadius: 6, padding: "10px 12px", border: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-purple)" }}>Decision: Kafka vs RabbitMQ</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
                  • <strong>Kafka</strong>: Append-only distributed log, durable event replay, millions of msg/sec per partition.<br />
                  • <strong>RabbitMQ</strong>: Flexible routing exchanges, dead-lettering, individual message acknowledgments.
                </div>
              </div>
            </div>
          )}

          {/* 5. ARCHITECTURE SCORE */}
          {bottomTab === "score" && (
            <div style={{ display: "flex", gap: 20, width: "100%", alignItems: "center" }}>
              <div style={{ textAlign: "center", width: 140 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                  {overallScore}/100
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Architecture Rating</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, flex: 1 }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Scalability: {scoreScalability}/20</div>
                  <div style={{ height: 5, background: "var(--bg-primary)", borderRadius: 3, marginTop: 4 }}>
                    <div style={{ width: `${(scoreScalability / 20) * 100}%`, height: "100%", background: "var(--accent-primary)", borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Reliability: {scoreReliability}/20</div>
                  <div style={{ height: 5, background: "var(--bg-primary)", borderRadius: 3, marginTop: 4 }}>
                    <div style={{ width: `${(scoreReliability / 20) * 100}%`, height: "100%", background: "var(--accent-green)", borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Availability: {scoreAvailability}/20</div>
                  <div style={{ height: 5, background: "var(--bg-primary)", borderRadius: 3, marginTop: 4 }}>
                    <div style={{ width: `${(scoreAvailability / 20) * 100}%`, height: "100%", background: "var(--accent-purple)", borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Performance: {scorePerformance}/20</div>
                  <div style={{ height: 5, background: "var(--bg-primary)", borderRadius: 3, marginTop: 4 }}>
                    <div style={{ width: `${(scorePerformance / 20) * 100}%`, height: "100%", background: "var(--accent-orange)", borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. COST EXPLORER */}
          {bottomTab === "cost" && (
            <div style={{ display: "flex", gap: 20, width: "100%", alignItems: "center" }}>
              <div style={{ textAlign: "center", width: 160 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
                  ${monthlyCostTotal.toLocaleString()} / mo
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  ${(monthlyCostTotal * 12).toLocaleString()} / yr est.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, flex: 1, fontSize: 11 }}>
                <div style={{ background: "var(--bg-tertiary)", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-light)" }}>Compute: ${monthlyCostCompute}/mo</div>
                <div style={{ background: "var(--bg-tertiary)", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-light)" }}>Database: ${monthlyCostDb}/mo</div>
                <div style={{ background: "var(--bg-tertiary)", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-light)" }}>Cache: ${monthlyCostCache}/mo</div>
                <div style={{ background: "var(--bg-tertiary)", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-light)" }}>Queue: ${monthlyCostQueue}/mo</div>
                <div style={{ background: "var(--bg-tertiary)", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border-light)" }}>CDN & Egress: ${monthlyCostCdn + 180}/mo</div>
              </div>
            </div>
          )}

          {/* 7. DECISION TIMELINE */}
          {bottomTab === "timeline" && (
            <div style={{ display: "flex", gap: 10, width: "100%", overflowX: "auto", paddingBottom: 4 }}>
              {architectureTimeline.map((item, idx) => (
                <div key={idx} style={{ minWidth: 220, background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 10px", fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-blue)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    <span>{item.time}</span>
                    <span style={{ color: "var(--accent-green)" }}>{item.costChange}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{item.action}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 2 }}>{item.impact}</div>
                </div>
              ))}
            </div>
          )}

          {/* 8. REQUEST PACKET TRACER & LATENCY WATERFALL */}
          {bottomTab === "diff" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Microsecond Trace:</span>
                  <code style={{ background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: 4, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    POST /api/v1/resource/sync (P99: 14.8ms)
                  </code>
                </div>
                <span className="badge badge-easy" style={{ fontSize: 10 }}>200 OK · 6 Hops</span>
              </div>

              {/* Latency Waterfall Bars */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, fontSize: 10.5 }}>
                {[
                  { hop: "1. Client TLS", dur: "1.8ms", pct: 12, color: "#60a5fa" },
                  { hop: "2. Edge CDN", dur: "0.9ms", pct: 6, color: "#38bdf8" },
                  { hop: "3. NLB Gateway", dur: "0.4ms", pct: 3, color: "#34d399" },
                  { hop: "4. Worker Pod", dur: "2.2ms", pct: 15, color: "#a78bfa" },
                  { hop: "5. Redis Lock", dur: "1.1ms", pct: 8, color: "#fbbf24" },
                  { hop: "6. Postgres WAL", dur: "8.4ms", pct: 56, color: "#f87171" }
                ].map((h, i) => (
                  <div key={i} style={{ background: "var(--bg-tertiary)", padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                      <span>{h.hop}</span>
                      <strong style={{ color: h.color, fontFamily: "var(--font-mono)" }}>{h.dur}</strong>
                    </div>
                    <div style={{ height: 4, background: "var(--bg-primary)", borderRadius: 2, marginTop: 4 }}>
                      <div style={{ width: `${h.pct}%`, height: "100%", background: h.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
