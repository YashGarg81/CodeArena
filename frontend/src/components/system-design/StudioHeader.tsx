// frontend/src/components/system-design/StudioHeader.tsx
import React from "react";
import type { SDTemplate } from "./types";
import { Icons } from "../ui/Icons";

export function StudioHeader({
  activeTab,
  onTabChange,
  templates,
  activeTemplateId,
  onSelectTemplate,
  studioMode,
  onToggleStudioMode,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenBrief,
  onExport,
  onOpenAnswerKey,
  onSaveProject,
  onOpenHistory,
  onOpenProjects,
  onShare,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isSaving = false,
  lastSavedAt
}: {
  activeTab: string;
  onTabChange: (tab: any) => void;
  templates: SDTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (tmpl: SDTemplate) => void;
  studioMode: "advanced" | "guided";
  onToggleStudioMode: (mode: "advanced" | "guided") => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenBrief: () => void;
  onExport: () => void;
  onOpenAnswerKey?: () => void;
  onSaveProject?: () => void;
  onOpenHistory?: () => void;
  onOpenProjects?: () => void;
  onShare?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
  lastSavedAt?: string | null;
}) {
  const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0];

  const subTabs = [
    { id: "studio", label: "Studio Canvas", icon: <Icons.Layers size={14} /> },
    { id: "chaos", label: "Chaos Lab (Murphy's)", icon: <Icons.Flame size={14} /> },
    { id: "schema", label: "DB & Schema Lab", icon: <Icons.Database size={14} /> },
    { id: "learn", label: "Curriculum", icon: <Icons.Book size={14} /> },
    { id: "casestudies", label: "Case Studies", icon: <Icons.Compass size={14} /> },
    { id: "estimation", label: "Estimation Lab", icon: <Icons.Sliders size={14} /> },
    { id: "concepts", label: "Visual Concepts", icon: <Icons.Zap size={14} /> },
    { id: "interview", label: "Mock Interview", icon: <Icons.Users size={14} /> },
    { id: "progress", label: "Mastery", icon: <Icons.Award size={14} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
      {/* Top Header Bar */}
      <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Icons.Layers size={17} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              System Design Studio
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Interactive Distributed Systems Workbench
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: "flex", gap: 3, background: "var(--bg-primary)", padding: 3, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginLeft: "auto" }}>
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              style={{
                background: activeTab === t.id ? "var(--bg-tertiary)" : "transparent",
                color: activeTab === t.id ? "var(--text-primary)" : "var(--text-muted)",
                border: "none",
                borderRadius: 4,
                padding: "5px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.1s"
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Header Toolbar when on Studio Tab */}
      {activeTab === "studio" && (
        <div style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-light)", padding: "7px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Problem Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              Problem:
            </span>
            <select
              value={activeTemplateId}
              onChange={e => {
                const tmpl = templates.find(t => t.id === e.target.value);
                if (tmpl) onSelectTemplate(tmpl);
              }}
              className="select"
              style={{ padding: "4px 24px 4px 8px", fontSize: 12, fontWeight: 600 }}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.difficulty})
                </option>
              ))}
            </select>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenBrief}
              style={{ fontSize: 11, padding: "4px 8px" }}
              title="View Problem Challenge Brief"
            >
              <Icons.Book size={12} />
              <span>Brief</span>
            </button>
            {onOpenAnswerKey && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onOpenAnswerKey}
                style={{ fontSize: 11, padding: "4px 8px", borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }}
                title="View Staff Engineer Reference Answer Key (TheOnsite style)"
              >
                <Icons.Award size={12} />
                <span>Staff Solution</span>
              </button>
            )}
          </div>

          {/* Mode Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-primary)", padding: 2, borderRadius: 6, border: "1px solid var(--border)" }}>
            <button
              onClick={() => onToggleStudioMode("advanced")}
              style={{
                background: studioMode === "advanced" ? "var(--accent-primary)" : "transparent",
                color: studioMode === "advanced" ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: 4,
                padding: "3px 8px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ⚡ Advanced
            </button>
            <button
              onClick={() => onToggleStudioMode("guided")}
              style={{
                background: studioMode === "guided" ? "var(--accent-green)" : "transparent",
                color: studioMode === "guided" ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: 4,
                padding: "3px 8px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              🟢 Guided
            </button>
          </div>

          {/* Scale Targets & Save Status */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="badge badge-blue" style={{ fontSize: 10 }}>Target: {activeTemplate?.rps || "50K RPS"}</span>
            <span className="badge badge-purple" style={{ fontSize: 10 }}>P99: {activeTemplate?.latencyTarget || "< 20ms"}</span>
            {lastSavedAt && (
              <span style={{ fontSize: 11, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 4 }}>
                <Icons.CheckCircle size={12} />
                <span>Saved {lastSavedAt}</span>
              </span>
            )}
          </div>

          {/* Undo / Redo */}
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onUndo}
              disabled={!canUndo}
              style={{ fontSize: 11, padding: "3px 8px" }}
              title="Undo change (Ctrl+Z)"
            >
              ↩ Undo
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onRedo}
              disabled={!canRedo}
              style={{ fontSize: 11, padding: "3px 8px" }}
              title="Redo change (Ctrl+Y)"
            >
              ↪ Redo
            </button>
          </div>

          {/* Projects & Version History */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {onOpenProjects && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onOpenProjects}
                style={{ fontSize: 11, padding: "3px 8px" }}
                title="Browse persistent saved projects"
              >
                📁 Projects
              </button>
            )}
            {onOpenHistory && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onOpenHistory}
                style={{ fontSize: 11, padding: "3px 8px" }}
                title="View immutable revision history & restore"
              >
                🕒 History
              </button>
            )}
          </div>

          {/* Canvas Controls */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <button className="btn btn-secondary btn-sm" onClick={onZoomOut} style={{ fontSize: 11, padding: "3px 7px" }}>
              -
            </button>
            <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button className="btn btn-secondary btn-sm" onClick={onZoomIn} style={{ fontSize: 11, padding: "3px 7px" }}>
              +
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onResetView} style={{ fontSize: 11, padding: "3px 8px" }}>
              Reset
            </button>

            {onSaveProject && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onSaveProject}
                disabled={isSaving}
                style={{ fontSize: 11.5, padding: "4px 10px", borderColor: "var(--accent-green)", color: "var(--accent-green)" }}
                title="Save persistent project to cloud database"
              >
                {isSaving ? "Saving..." : "💾 Save Cloud"}
              </button>
            )}

            {onShare && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onShare}
                style={{ fontSize: 11.5, padding: "4px 10px" }}
                title="Generate sharable link with access permissions"
              >
                🔗 Share
              </button>
            )}

            <button className="btn btn-primary btn-sm" onClick={onExport} style={{ fontSize: 11.5, padding: "4px 10px" }}>
              <Icons.Share size={12} />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
