import React from "react";
import { StateView } from "./StateView";

export function NotFoundPage({ path, onNavigate }: { path: string; onNavigate: (p: string) => void }) {
  return (
    <div className="container" style={{ padding: "80px 24px", maxWidth: 560, textAlign: "center" }}>
      <div style={{ fontSize: 64, fontWeight: 900, color: "var(--accent-primary)", marginBottom: 8, letterSpacing: -2 }}>
        404
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        Page Not Found
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
        The requested URL <code style={{ background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>{path || window.location.pathname}</code> does not exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={() => onNavigate("home")}>
          Return Home 🏠
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate("problems")}>
          Browse Problems 💻
        </button>
      </div>
    </div>
  );
}

// ─── PUBLIC USER PROFILE PAGE (/u/:username) ────────────────────────────────