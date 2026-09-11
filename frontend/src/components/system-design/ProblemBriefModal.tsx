// frontend/src/components/system-design/ProblemBriefModal.tsx
import React from "react";
import type { SDTemplate } from "./types";
import { Icons } from "../ui/Icons";

export function ProblemBriefModal({
  template,
  onClose,
  onStartDesigning
}: {
  template: SDTemplate | null;
  onClose: () => void;
  onStartDesigning: () => void;
}) {
  if (!template) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 640, padding: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icons.Layers size={22} className="text-blue-400" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
                SYSTEM DESIGN CHALLENGE
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
                {template.title}
              </h2>
            </div>
          </div>
          <span className={`badge ${template.difficulty === "Beginner" ? "badge-easy" : template.difficulty === "Intermediate" ? "badge-medium" : "badge-hard"}`}>
            {template.difficulty}
          </span>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
          {template.desc}
        </p>

        {/* Scale & Requirements Spec Box */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>SCALE & TRAFFIC</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-blue)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              {template.rps}
            </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>TARGET LATENCY</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-green)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              {template.latencyTarget}
            </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ANNUAL STORAGE</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-purple)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              {template.storage}
            </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>READ/WRITE RATIO</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-orange)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              {template.readWriteRatio}
            </div>
          </div>
        </div>

        {/* Trade-off Focus Areas */}
        {template.tradeOffs && template.tradeOffs.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
              Key Architectural Trade-offs
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {template.tradeOffs.map((tradeoff, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>
                  <Icons.Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>{tradeoff}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              onStartDesigning();
              onClose();
            }}
          >
            Start Designing Architecture →
          </button>
        </div>
      </div>
    </div>
  );
}
