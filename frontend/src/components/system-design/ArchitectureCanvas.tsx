// frontend/src/components/system-design/ArchitectureCanvas.tsx
import React, { useRef } from "react";
import type { SDNode, SDConnection } from "./types";
import { getNodeIcon } from "./ComponentPalette";

export function ArchitectureCanvas({
  nodes,
  connections,
  selectedNodeId,
  draggingNodeId,
  injectedFailure,
  isSimulating,
  zoom,
  panOffset,
  isPanning,
  onNodeMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasMouseDown
}: {
  nodes: SDNode[];
  connections: SDConnection[];
  selectedNodeId: string | null;
  draggingNodeId: string | null;
  injectedFailure: string | null;
  isSimulating: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  isPanning: boolean;
  onNodeMouseDown: (e: React.MouseEvent, node: SDNode) => void;
  onCanvasMouseMove: (e: React.MouseEvent) => void;
  onCanvasMouseUp: () => void;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={canvasRef}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
      onMouseDown={onCanvasMouseDown}
      style={{
        flex: 1,
        position: "relative",
        background: "var(--bg-primary) radial-gradient(var(--border) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        overflow: "hidden",
        cursor: isPanning ? "grabbing" : "default",
        userSelect: "none"
      }}
    >
      {/* Scaled & Translated Container */}
      <div
        style={{
          position: "absolute",
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: 1200,
          height: 700
        }}
      >
        {/* SVG Connections & Animated Flow */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none"
          }}
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-primary)" />
            </marker>
            <marker id="arrow-fail" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-red)" />
            </marker>
          </defs>
          {connections.map((conn, idx) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x + 80;
            const y1 = fromNode.y + 35;
            const x2 = toNode.x + 80;
            const y2 = toNode.y + 35;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const cx1 = x1 + dx * 0.4;
            const cy1 = y1;
            const cx2 = x1 + dx * 0.6;
            const cy2 = y2;
            const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

            const isFailing =
              (injectedFailure === "db_primary" && (toNode.id === "db_primary" || fromNode.id === "db_primary")) ||
              (injectedFailure === "redis_cache" && (toNode.id === "cache" || fromNode.id === "cache"));

            return (
              <g key={idx}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isFailing ? "var(--accent-red)" : "var(--accent-primary)"}
                  strokeWidth="2"
                  strokeDasharray={isFailing ? "4 4" : undefined}
                  markerEnd={isFailing ? "url(#arrow-fail)" : "url(#arrow)"}
                  opacity={0.85}
                />
                {isSimulating && (
                  <circle r="3.5" fill={isFailing ? "var(--accent-red)" : "var(--accent-blue)"}>
                    <animateMotion dur={isFailing ? "3.5s" : "1.8s"} repeatCount="indefinite" path={pathD} />
                  </circle>
                )}
                {conn.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill="var(--text-muted)"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes rendering */}
        {nodes.map(node => {
          const isSelected = node.id === selectedNodeId;
          const isFailing =
            (injectedFailure === "db_primary" && (node.id === "db_primary" || node.type === "db")) ||
            (injectedFailure === "redis_cache" && (node.id === "cache" || node.type === "cache")) ||
            (injectedFailure === "cdn_blackout" && node.type === "cdn") ||
            (injectedFailure === "kafka_lag" && node.type === "queue") ||
            (injectedFailure === "network_partition" && (node.type === "service" && node.id.includes("read")));

          return (
            <div
              key={node.id}
              onMouseDown={e => onNodeMouseDown(e, node)}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                width: 170,
                background: isFailing
                  ? "rgba(239, 68, 68, 0.12)"
                  : isSelected
                  ? "var(--bg-secondary)"
                  : "var(--bg-secondary)",
                border: isFailing
                  ? "2px solid var(--accent-red)"
                  : isSelected
                  ? "2px solid var(--accent-primary)"
                  : "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "9px 12px",
                cursor: "grab",
                boxShadow: isFailing
                  ? "0 0 16px rgba(239, 68, 68, 0.35)"
                  : isSelected
                  ? "var(--shadow-glow), var(--shadow-md)"
                  : "var(--shadow-sm)",
                transition: draggingNodeId === node.id ? "none" : "border-color 0.15s ease, box-shadow 0.15s ease",
                zIndex: isSelected ? 5 : 2
              }}
            >
              {/* Left & Right Connection Ports */}
              <div
                style={{
                  position: "absolute",
                  left: -5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: isFailing ? "var(--accent-red)" : "var(--accent-primary)",
                  border: "2px solid var(--bg-primary)"
                }}
                title="Input Port"
              />
              <div
                style={{
                  position: "absolute",
                  right: -5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: isFailing ? "var(--accent-red)" : "var(--accent-green)",
                  border: "2px solid var(--bg-primary)"
                }}
                title="Output Port"
              />

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {getNodeIcon(node.type, 16)}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1
                  }}
                >
                  {node.label}
                </div>
              </div>

              <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 105 }}>{node.tech}</span>
                <span style={{ color: isFailing ? "var(--accent-red)" : "var(--accent-green)", fontWeight: 700 }}>
                  {isFailing ? "DEGRADED" : "HEALTHY"}
                </span>
              </div>

              <div style={{ marginTop: 5, display: "flex", gap: 4, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 9,
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-light)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {node.instances}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
