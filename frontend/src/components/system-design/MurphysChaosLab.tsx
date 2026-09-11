// frontend/src/components/system-design/MurphysChaosLab.tsx
import React, { useState } from "react";
import { Icons } from "../ui/Icons";
import type { ChaosScenario, SimMetrics } from "./types";

const SCENARIOS: ChaosScenario[] = [
  {
    id: "db_primary",
    title: "Primary Database Node Crash (SPOF)",
    icon: "🗄️",
    category: "Storage",
    description: "The primary relational database instance experiences unexpected SIGKILL / hardware termination during peak write throughput.",
    expectedImpact: "100% Write failure, 8.4% error rate, queue buffers rapidly backlogging.",
    remediationPlaybook: "Patroni / Sentinel automated failover triggers within 15s; read replicas absorb readonly queries; write traffic diverted to dead-letter queue.",
    impactedNodeType: "db"
  },
  {
    id: "redis_cache",
    title: "Cache Tier Eviction & Stampede Storm",
    icon: "⚡",
    category: "Traffic",
    description: "Redis cluster runs out of memory (OOM), flushing LRU hot keys. 50,000 concurrent requests immediately storm the persistent database.",
    expectedImpact: "Database connection pool saturated (98%), P99 latency spikes from 15ms to 120ms.",
    remediationPlaybook: "Mutex locking (Singleflight) on cache miss so only 1 request queries DB; pre-warm standby cluster; enable probabilistic early refresh.",
    impactedNodeType: "cache"
  },
  {
    id: "network_partition",
    title: "Cross-Region Split-Brain Network Partition",
    icon: "🌐",
    category: "Networking",
    description: "Transatlantic fiber link severed between us-east-1 and eu-west-1. Nodes can no longer establish quorum heartbeat.",
    expectedImpact: "Leader election flapping, replication lag diverging, strict consistency writes blocked.",
    remediationPlaybook: "Enforce strict Raft/Paxos quorum majority; minority partition immediately steps down to read-only; replay CDC logs upon partition healing.",
    impactedNodeType: "service"
  },
  {
    id: "cdn_blackout",
    title: "Global CDN Edge 504 Blackout",
    icon: "🛡️",
    category: "Traffic",
    description: "All 300+ Edge Anycast PoPs return 504 Gateway Timeout. 100% of global ingress immediately hits origin datacenters.",
    expectedImpact: "Origin ingress bandwidth exhausted, CPU spikes to 95%, connection queue drops requests.",
    remediationPlaybook: "Automated multi-CDN DNS failover (Route53 health checks flip to secondary CDN); aggressive stale-if-error client cache headers.",
    impactedNodeType: "cdn"
  },
  {
    id: "kafka_lag",
    title: "Kafka Consumer Rebalancing Lag Storm",
    icon: "📨",
    category: "Datacenter",
    description: "A slow downstream worker causes Kafka consumer heartbeat timeout, causing partition rebalances every 30 seconds.",
    expectedImpact: "Queue backlog explodes to 840,000 unconsumed messages; end-to-end event latency exceeds 45 minutes.",
    remediationPlaybook: "Dynamically autoscale worker pods to match partition count (1:1 ratio); increase max.poll.interval.ms; isolate slow payloads.",
    impactedNodeType: "queue"
  }
];

export function MurphysChaosLab({
  injectedFailure,
  onTriggerFailure,
  simMetrics
}: {
  injectedFailure: string | null;
  onTriggerFailure: (scenarioId: string | null) => void;
  simMetrics: SimMetrics;
}) {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("db_primary");
  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0]!;

  const isCurrentActive = injectedFailure === activeScenario.id;

  return (
    <div className="container" style={{ padding: "28px 24px", maxWidth: 1060 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>⚡</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Murphy's Chaos Lab
            </h1>
            <span className="badge badge-purple" style={{ fontSize: 11 }}>ScaleDojo Simulator</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            "Anything that can go wrong, will go wrong." Inject real-world production outages into your architecture and verify automated failover resilience.
          </p>
        </div>

        {injectedFailure && (
          <button
            onClick={() => onTriggerFailure(null)}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)" }}
          >
            <Icons.RotateCcw size={13} />
            <span>Heal All Injected Outages</span>
          </button>
        )}
      </div>

      {/* Live Telemetry HUD Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
          background: "var(--bg-secondary)",
          padding: 16,
          borderRadius: 8,
          border: `1px solid ${injectedFailure ? "rgba(239, 68, 68, 0.4)" : "var(--border)"}`
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Cluster P99 Latency
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: simMetrics.p99Latency > 80 ? "var(--accent-red)" : "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
            {simMetrics.p99Latency.toFixed(1)} ms
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Target: &lt; 25ms</div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            System Error Rate
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: simMetrics.errorRate > 0.02 ? "var(--accent-red)" : "var(--accent-green)", fontFamily: "var(--font-mono)" }}>
            {(simMetrics.errorRate * 100).toFixed(2)} %
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>SLO: 99.99% Availability</div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Host CPU Saturation
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: simMetrics.cpu > 80 ? "var(--accent-red)" : "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
            {simMetrics.cpu} %
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Autoscale Trigger: 70%</div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Buffer / Queue Lag
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: simMetrics.queueBacklog > 5000 ? "var(--accent-red)" : "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
            {simMetrics.queueBacklog.toLocaleString()} msgs
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Partition Consumption Flow</div>
        </div>
      </div>

      {/* Main Chaos Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
        {/* Left: Scenarios Selector */}
        <div className="card" style={{ padding: 14, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
            Injectable Chaos Scenarios
          </div>
          {SCENARIOS.map(s => {
            const isTarget = injectedFailure === s.id;
            const isSelected = activeScenarioId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveScenarioId(s.id)}
                style={{
                  background: isSelected ? "var(--bg-tertiary)" : "transparent",
                  border: isTarget ? "1px solid var(--accent-red)" : isSelected ? "1px solid var(--border)" : "1px solid transparent",
                  borderRadius: 6,
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.15s"
                }}
              >
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: isTarget ? "var(--accent-red)" : "var(--text-primary)" }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Category: {s.category}
                  </div>
                </div>
                {isTarget && (
                  <span className="badge badge-hard" style={{ fontSize: 10, padding: "2px 6px" }}>
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Experiment Control & Playbook */}
        <div className="card" style={{ padding: 20, margin: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{activeScenario.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                  {activeScenario.title}
                </h3>
              </div>
              <span className="badge badge-blue" style={{ marginTop: 6 }}>
                Target: {activeScenario.impactedNodeType.toUpperCase()} Layer
              </span>
            </div>

            <button
              onClick={() => onTriggerFailure(isCurrentActive ? null : activeScenario.id)}
              className={`btn ${isCurrentActive ? "btn-secondary" : "btn-primary"}`}
              style={{
                background: isCurrentActive ? "transparent" : "var(--accent-red)",
                borderColor: "var(--accent-red)",
                color: isCurrentActive ? "var(--accent-red)" : "#fff",
                fontWeight: 700,
                fontSize: 13
              }}
            >
              {isCurrentActive ? "Stop Simulation / Heal Outage" : "⚡ Inject Outage into Cluster"}
            </button>
          </div>

          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
            {activeScenario.description}
          </div>

          {/* Expected Blast Radius & Impact */}
          <div style={{ background: "var(--bg-tertiary)", padding: 14, borderRadius: 6, border: "1px solid var(--border-light)", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "var(--accent-red)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.AlertTriangle size={14} />
              <span>Blast Radius & Predicted Failure Cascade</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-primary)" }}>
              {activeScenario.expectedImpact}
            </div>
          </div>

          {/* Architectural Remediation Playbook */}
          <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: 14, borderRadius: 6, border: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "var(--accent-green)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.Shield size={14} />
              <span>Recommended High Availability Remediation</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {activeScenario.remediationPlaybook}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Tip: Return to the <strong>Architecture Studio</strong> tab while chaos is active to watch real-time node error rings.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
