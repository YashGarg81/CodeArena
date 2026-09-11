import React, { useState, useEffect } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import axios from "axios";
import { api, API } from "../../services/api";

export function PublicProfilePage({ username, onNavigate }: { username: string; onNavigate: (p: string, s?: string) => void }) {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios.get(`${API}/api/v1/users/${username}`)
      .then(res => {
        setProfileUser(res.data.user);
        setError("");
      })
      .catch(err => {
        setError(err.response?.data?.error || `User @${username} not found.`);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><span className="animate-spin" style={{ fontSize: 32 }}>⚙</span></div>;
  }

  if (error || !profileUser) {
    return (
      <div className="container" style={{ padding: "60px 24px", maxWidth: 600, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>User Not Found</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>{error || `The user @${username} does not exist.`}</p>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("leaderboard")}>View Global Leaderboard</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "32px 24px", maxWidth: 960 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("leaderboard")} style={{ marginBottom: 16 }}>← Back to Leaderboard</button>
      
      {/* Header Profile Card */}
      <div className="card" style={{ marginBottom: 24, padding: "28px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, fontWeight: 800, boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
          }}>
            {profileUser.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{profileUser.name}</h1>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>{profileUser.role}</span>
              {profileUser.location && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📍 {profileUser.location}</span>}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              @{profileUser.username} &bull; Member since {new Date(profileUser.createdAt || Date.now()).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </div>
            {profileUser.bio && <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.4 }}>{profileUser.bio}</div>}
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 24 }}>
          <div className="card" style={{ background: "var(--bg-tertiary)", padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Contest Rating</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-primary)", marginTop: 4 }}>🏆 {profileUser.contestRating || 1200}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Top 4.2% Global</div>
          </div>
          <div className="card" style={{ background: "var(--bg-tertiary)", padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total XP</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-blue)", marginTop: 4 }}>⚡ {profileUser.xp || 1820}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Level Progress</div>
          </div>
          <div className="card" style={{ background: "var(--bg-tertiary)", padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Level</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-green)", marginTop: 4 }}>🎖️ {profileUser.level || 18}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Grandmaster Track</div>
          </div>
          <div className="card" style={{ background: "var(--bg-tertiary)", padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Current Streak</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-orange)", marginTop: 4 }}>🔥 {profileUser.streak || 14}d</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Max: {profileUser.longestStreak || 28}d</div>
          </div>
        </div>
      </div>

      {/* Breakdown & Achievements Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Problems Solved Breakdown */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>📊</span>
            <span>Problems Solved</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>🟢 Easy</span>
                <span style={{ fontWeight: 700 }}>42 / 120</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--bg-tertiary)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "35%", height: "100%", background: "var(--accent-green)" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--accent-yellow)", fontWeight: 700 }}>🟡 Medium</span>
                <span style={{ fontWeight: 700 }}>68 / 250</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--bg-tertiary)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "27%", height: "100%", background: "var(--accent-yellow)" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--accent-red)", fontWeight: 700 }}>🔴 Hard</span>
                <span style={{ fontWeight: 700 }}>19 / 80</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--bg-tertiary)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "23%", height: "100%", background: "var(--accent-red)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Badges */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🏅</span>
            <span>Unlocked Badges (12 / 40)</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "⚡", title: "Speed Demon", desc: "Top 5% submission runtime" },
              { icon: "🛡️", title: "Bug Hunter", desc: "Zero compilation errors" },
              { icon: "👑", title: "Contest Victor", desc: "Top 10 finish in weekly cup" },
              { icon: "🤝", title: "Pair Master", desc: "5 collaborative sessions" }
            ].map(b => (
              <div key={b.title} style={{ padding: "8px 10px", background: "var(--bg-tertiary)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{b.title}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PLAYGROUND PAGE ────────────────────────────────────────────────────────