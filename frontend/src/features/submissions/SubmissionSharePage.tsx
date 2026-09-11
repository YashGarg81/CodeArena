import React, { useState, useEffect } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";

export function SubmissionSharePage({ submissionId, onNavigate }: { submissionId: string; onNavigate: (p: string, s?: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/v1/submissions/${submissionId}/share`)
      .then(r => { setData(r.data.share); setLoading(false); })
      .catch(() => setLoading(false));
  }, [submissionId]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><span className="animate-spin" style={{ fontSize: 32 }}>⚙</span></div>;
  if (!data) return <div className="empty-state" style={{ padding: 60 }}><div className="empty-state-icon">❓</div><h3>Submission Report Not Found</h3><button className="btn btn-secondary btn-sm" onClick={() => onNavigate("problems")} style={{ marginTop: 12 }}>Browse Problems</button></div>;

  const isSuccess = data.status === "Success";
  const badgeColor = isSuccess ? "var(--accent-green)" : data.status === "TLE" ? "var(--accent-orange)" : "var(--accent-red)";

  return (
    <div className="container" style={{ padding: "28px 24px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("problem", data.problem.id)} style={{ marginBottom: 8 }}>← Back to {data.problem.title}</button>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>📜 Public Submission Report</h1>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Submitted on {new Date(data.createdAt).toLocaleString()}</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert("Submission link copied to clipboard!");
        }}>🔗 Copy Link</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: badgeColor }}>
            {isSuccess ? "✅ Accepted" : data.status}
          </span>
          <span className="badge badge-gray">{data.language.toUpperCase()}</span>
          {data.runtime !== undefined && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>⏱ {data.runtime.toFixed(1)}ms</span>}
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Passed {data.testCasesPassed} / {data.testCasesTotal} Test Cases</span>
        </div>
        {isSuccess && data.beatsPercent !== undefined && (
          <div className="beats-card" style={{ marginTop: 14 }}>
            🏆 Beats <strong>{data.beatsPercent}%</strong> of {data.language.toUpperCase()} submissions for {data.problem.title}!
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--bg-tertiary)", padding: "10px 16px", borderBottom: "1px solid var(--border-light)", fontWeight: 700, fontSize: 13 }}>
          Source Code ({data.language})
        </div>
        <pre style={{
          margin: 0, padding: 20,
          fontFamily: "var(--font-mono)", fontSize: 13,
          background: "var(--bg-primary)",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          color: "var(--text-primary)"
        }}>{data.code}</pre>
      </div>
    </div>
  );
}

// ─── EMAIL VERIFICATION PAGE (P0 SECURITY) ──────────────────────────────────