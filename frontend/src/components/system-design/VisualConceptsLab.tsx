// frontend/src/components/system-design/VisualConceptsLab.tsx
import React, { useState } from "react";
import { Icons } from "../ui/Icons";

export function VisualConceptsLab() {
  const [capSelection, setCapSelection] = useState<"CP" | "AP" | "CA">("CP");
  const [hashRingNodes, setHashRingNodes] = useState<string[]>([
    "Node Alpha (0°)",
    "Node Beta (120°)",
    "Node Gamma (240°)"
  ]);
  const [hashRingKey, setHashRingKey] = useState("user_9842 -> Node Gamma");
  const [circuitState, setCircuitState] = useState<"CLOSED" | "OPEN" | "HALF-OPEN">("CLOSED");
  const [circuitFails, setCircuitFails] = useState(0);

  return (
    <div className="container" style={{ padding: "28px 24px", maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}>
        Interactive System Design Visual Concepts
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
        Experiment with CAP Theorem trade-offs, Consistent Hashing ring distributions, and Circuit Breakers in real-time.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 1. CAP THEOREM SIMULATOR */}
        <div className="card" style={{ padding: 20, margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.Shield size={16} />
              <span>1. CAP Theorem Simulator</span>
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              {(["CP", "AP", "CA"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setCapSelection(mode)}
                  className={`btn btn-sm ${capSelection === mode ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: 11.5 }}
                >
                  {mode} System
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", padding: 14, borderRadius: 6, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, border: "1px solid var(--border-light)" }}>
            {capSelection === "CP" && (
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Consistency + Partition Tolerance (e.g. HBase, MongoDB Primary, Spanner)</strong><br />
                When a network partition occurs, the system rejects writes or blocks reads that cannot reach a quorum of replicas to prevent stale data. Availability is sacrificed.
              </div>
            )}
            {capSelection === "AP" && (
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Availability + Partition Tolerance (e.g. Cassandra, DynamoDB, CouchDB)</strong><br />
                When a network partition occurs, nodes continue accepting reads and writes independently. The system returns potentially stale data but remains available. Reconciled via eventual consistency.
              </div>
            )}
            {capSelection === "CA" && (
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Consistency + Availability (e.g. Single-Node PostgreSQL / MySQL)</strong><br />
                Guarantees both strong consistency and instant response, but cannot survive a network partition across distributed nodes.
              </div>
            )}
          </div>
        </div>

        {/* 2. CONSISTENT HASHING RING */}
        <div className="card" style={{ padding: 20, margin: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-purple)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.Radio size={16} />
            <span>2. Consistent Hashing Ring Visualizer</span>
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
            Keys and server nodes are hashed onto a 360° circular ring, minimizing key migration when nodes scale up or fail.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setHashRingNodes(p => [...p, `Node Delta (${Math.floor(Math.random() * 360)}°)`])}
            >
              + Add Node to Ring
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const id = Math.floor(Math.random() * 10000);
                const deg = Math.floor(Math.random() * 360);
                setHashRingKey(`user_${id} (Hash: ${deg}°) -> Assigned to nearest clockwise node`);
              }}
            >
              Route Random Key
            </button>
          </div>
          <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 6, fontSize: 12, color: "var(--text-primary)", border: "1px solid var(--border-light)" }}>
            <div><strong>Active Ring Nodes:</strong> {hashRingNodes.join(" · ")}</div>
            <div style={{ marginTop: 6, color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
              <strong>Last Routed Key:</strong> {hashRingKey}
            </div>
          </div>
        </div>

        {/* 3. CIRCUIT BREAKER STATE MACHINE */}
        <div className="card" style={{ padding: 20, margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.Zap size={16} />
              <span>3. Circuit Breaker State Machine</span>
            </h3>
            <span className={`badge ${circuitState === "CLOSED" ? "badge-easy" : circuitState === "OPEN" ? "badge-hard" : "badge-medium"}`}>
              State: {circuitState}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
            Prevents cascading failures by tripping open when the downstream error threshold exceeds the limit.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const newFails = circuitFails + 1;
                setCircuitFails(newFails);
                if (newFails >= 3) setCircuitState("OPEN");
              }}
            >
              Simulate Downstream Error ({circuitFails}/3)
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setCircuitFails(0);
                setCircuitState("CLOSED");
              }}
            >
              Reset Circuit Breaker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
