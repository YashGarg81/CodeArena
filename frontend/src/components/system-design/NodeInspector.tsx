// frontend/src/components/system-design/NodeInspector.tsx
import React from "react";
import type { SDNode } from "./types";
import { Icons } from "../ui/Icons";
import { getNodeIcon } from "./ComponentPalette";

export function NodeInspector({
  selectedNode,
  onUpdateNode,
  onDeleteNode
}: {
  selectedNode: SDNode | null;
  onUpdateNode: (updated: Partial<SDNode>) => void;
  onDeleteNode: () => void;
}) {
  return (
    <div style={{ width: 280, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 10 }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
          <Icons.Settings size={14} />
          <span>Inspector</span>
        </div>
        {selectedNode && (
          <button
            onClick={onDeleteNode}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-red)",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <Icons.Trash size={13} />
            <span>Delete</span>
          </button>
        )}
      </div>

      {selectedNode ? (
        <div style={{ padding: "14px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg-tertiary)", borderRadius: 6, border: "1px solid var(--border-light)" }}>
            {getNodeIcon(selectedNode.type, 18)}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{selectedNode.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Type: {selectedNode.type.toUpperCase()}</div>
            </div>
          </div>

          <div>
            <label className="label" style={{ fontSize: 11 }}>Component Label</label>
            <input
              className="input input-sm"
              value={selectedNode.label}
              onChange={e => onUpdateNode({ label: e.target.value })}
            />
          </div>

          <div>
            <label className="label" style={{ fontSize: 11 }}>Technology Stack</label>
            <input
              className="input input-sm"
              value={selectedNode.tech}
              onChange={e => onUpdateNode({ tech: e.target.value })}
            />
          </div>

          <div>
            <label className="label" style={{ fontSize: 11 }}>Instances / Deployment Sizing</label>
            <input
              className="input input-sm"
              value={selectedNode.instances}
              onChange={e => onUpdateNode({ instances: e.target.value })}
            />
          </div>

          <div>
            <label className="label" style={{ fontSize: 11 }}>Consistency Guarantees</label>
            <select
              className="select w-full"
              value={selectedNode.consistency || "Strong"}
              onChange={e => onUpdateNode({ consistency: e.target.value as any })}
              style={{ fontSize: 12 }}
            >
              <option value="Strong">Strong Consistency (ACID / Raft)</option>
              <option value="Eventual">Eventual Consistency (Async Replicas)</option>
              <option value="Linearizable">Linearizable (Sequential Order)</option>
            </select>
          </div>

          <div>
            <label className="label" style={{ fontSize: 11 }}>Failure Strategy Policy</label>
            <select
              className="select w-full"
              value={selectedNode.failurePolicy || "Fail-open"}
              onChange={e => onUpdateNode({ failurePolicy: e.target.value as any })}
              style={{ fontSize: 12 }}
            >
              <option value="Fail-open">Fail-Open (Fallback to Cache/Replicas)</option>
              <option value="Fail-closed">Fail-Closed (Strict Rejection)</option>
              <option value="Degrade">Graceful Degradation (Circuit Breaker)</option>
            </select>
          </div>

          {/* Architectural Role Box */}
          <div style={{ background: "var(--bg-tertiary)", borderRadius: 6, padding: "10px 12px", marginTop: 4, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
              <Icons.Sparkles size={12} />
              <span>Architectural Role</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.45 }}>
              {selectedNode.type === "cache" && "Caches hot read keys in RAM to offload database IOPS and achieve sub-10ms P99 latencies."}
              {selectedNode.type === "db" && "Provides persistent, durable storage with WAL streaming for zero-data-loss guarantees."}
              {selectedNode.type === "lb" && "Distributes incoming traffic across worker pools and terminates TLS encryption."}
              {selectedNode.type === "queue" && "Decouples write surges and provides at-least-once message delivery."}
              {selectedNode.type === "service" && "Stateless compute worker executing business logic and orchestrating data stores."}
              {selectedNode.type === "cdn" && "Caches assets and terminates connections at 300+ Edge locations close to end-users."}
              {selectedNode.type === "security" && "Protects downstream APIs via token-bucket rate limiting and DDoS mitigation."}
              {selectedNode.type === "storage" && "Provides virtually infinite capacity for immutable multimedia and backup objects."}
              {selectedNode.type === "realtime" && "Maintains full-duplex persistent WebSocket connections for instant push messaging."}
              {selectedNode.type === "client" && "End-user interface initiating client-side requests and caching UI state."}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6 }}>
          <Icons.Layers size={24} style={{ opacity: 0.3, margin: "0 auto 10px" }} />
          Select any component on the canvas to inspect its capacity, replicas, consistency, and failure policies.
        </div>
      )}
    </div>
  );
}
