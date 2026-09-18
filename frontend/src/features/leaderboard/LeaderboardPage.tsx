import React, { useState, useEffect } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";
import type { User, LeaderboardUser } from "../../types";

export function LeaderboardPage({ user }: { user: User | null }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [type, setType] = useState<"global" | "weekly">("global");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/v1/leaderboard?type=${type}`).then(r => {
      setLeaderboard(r.data?.leaderboard || []);
      setLoading(false);
    }).catch(() => {
      setLeaderboard([]);
      setLoading(false);
    });
  }, [type]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>🏆 Leaderboard</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {(["global", "weekly"] as const).map(t => (
            <button key={t} className={`btn ${type === t ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setType(t)}>
              {t === "global" ? "🌍 Global" : "📅 This Week"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 8 }} />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🏆</div><h3>No data yet</h3><p>Be the first to solve problems and claim rank #1!</p></div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Rank</th>
              <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Developer</th>
              <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Solved</th>
              <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Rating</th>
              <th style={{ padding: "8px 16px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>XP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((u, i) => (
              <tr key={u.id} className="leaderboard-row" style={user && u.id === user.id ? { outline: "1px solid var(--accent-primary)" } : {}}>
                <td><div className={`rank-cell rank-${i + 1}`}>{i < 3 ? medals[i] : `#${i + 1}`}</div></td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-lb">{(u.name ?? "?").charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{u.username}</div>
                    </div>
                    {user && u.id === user.id && <span className="badge badge-blue" style={{ marginLeft: 8 }}>You</span>}
                  </div>
                </td>
                <td><span style={{ fontWeight: 700, fontSize: 16 }}>{u.solvedCount}</span></td>
                <td><div className="rating-bar"><span className="rating-val">{u.contestRating}</span></div></td>
                <td><span style={{ color: "var(--accent-purple)", fontWeight: 600 }}>⚡ {u.xp}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── COMMUNITY / FORUM ────────────────────────────────────────────────────────