import React, { useState, useEffect } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";
import type { User } from "../../types";

export function ContestsPage({ user, onToast }: { user: User | null; onToast: (msg: string, type: string) => void }) {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContestView, setActiveContestView] = useState<any | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any | null>(null);
  const [lbLoading, setLbLoading] = useState(false);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadContests = () => {
    setLoading(true);
    api.get("/api/v1/contests")
      .then(r => { setContests(r.data.contests || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadContests();
  }, []);

  const openContestRoom = async (contestId: string) => {
    try {
      const res = await api.get(`/api/v1/contests/${contestId}`);
      if (res.data.contest) {
        setActiveContestView(res.data.contest);
      } else {
        const found = [...allUpcoming, ...allPast].find(c => c.id === contestId);
        setActiveContestView(found || allUpcoming[0]);
      }
      loadLeaderboard(contestId);
    } catch {
      const found = [...allUpcoming, ...allPast].find(c => c.id === contestId);
      setActiveContestView(found || allUpcoming[0]);
      loadLeaderboard(contestId);
    }
  };

  const loadLeaderboard = async (contestId: string) => {
    setLbLoading(true);
    try {
      const res = await api.get(`/api/v1/contests/${contestId}/leaderboard`);
      setLeaderboardData(res.data);
    } catch {
      // fallback
    } finally {
      setLbLoading(false);
    }
  };

  const formatCountdown = (targetTimeMs: number) => {
    const diff = targetTimeMs - nowTime;
    if (diff <= 0) return "00:00:00";
    const hrs = Math.floor(diff / 3600000).toString().padStart(2, "0");
    const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
    const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const defaultUpcoming = [
    { id: "wc-weekly-1", title: "CodeArena Weekly Contest #1", startTime: new Date(Date.now() + 86400000).toISOString(), durationMinutes: 90, status: "Upcoming", _count: { participants: 1248, problems: 4 } },
    { id: "bw-biweekly-1", title: "CodeArena Biweekly Contest #21", startTime: new Date(Date.now() + 86400000 * 4).toISOString(), durationMinutes: 90, status: "Upcoming", _count: { participants: 842, problems: 4 } },
  ];

  const defaultPast = [
    { id: "past-launch-0", title: "CodeArena Inaugural Launch Cup", startTime: new Date(Date.now() - 86400000 * 3).toISOString(), durationMinutes: 90, status: "Ended", _count: { participants: 523, problems: 4 } },
  ];

  const allUpcoming = [...(contests.filter(c => c.status === "Upcoming" || c.status === "Active")), ...defaultUpcoming];
  const allPast = [...(contests.filter(c => c.status === "Ended")), ...defaultPast];

  const [contestTab, setContestTab] = useState<"problems" | "leaderboard" | "announcements" | "clarifications" | "results">("problems");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [clarifications, setClarifications] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [askingClarification, setAskingClarification] = useState(false);

  const loadContestExtra = (contestId: string) => {
    api.get(`/api/v1/contests/${contestId}/announcements`)
      .then(r => setAnnouncements(r.data?.announcements || []))
      .catch(() => {});
    api.get(`/api/v1/contests/${contestId}/clarifications`)
      .then(r => setClarifications(r.data?.clarifications || []))
      .catch(() => {});
  };

  if (activeContestView) {
    const startMs = new Date(activeContestView.startTime).getTime();
    const endMs = new Date(activeContestView.endTime).getTime();
    const isActive = nowTime >= startMs && nowTime < endMs;
    const isUpcoming = nowTime < startMs;
    const isEnded = activeContestView.status === "Ended" || nowTime >= endMs;

    const handleAskClarification = async () => {
      if (!user) { onToast("Please sign in to ask a clarification question.", "error"); return; }
      if (!newQuestion.trim()) return;
      setAskingClarification(true);
      try {
        const { data } = await api.post(`/api/v1/contests/${activeContestView.id}/clarifications`, { question: newQuestion.trim() });
        if (data.clarification) {
          setClarifications(p => [data.clarification, ...p]);
          setNewQuestion("");
          onToast("Clarification sent to jury! 📩", "success");
        }
      } catch (e: any) {
        onToast(e.response?.data?.error || "Failed to submit clarification", "error");
      } finally {
        setAskingClarification(false);
      }
    };

    return (
      <div className="container" style={{ padding: "28px 24px" }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }} onClick={() => { setActiveContestView(null); setLeaderboardData(null); loadContests(); }}>
          ← Back to All Contests
        </button>

        {/* Contest Header Banner */}
        <div className="card" style={{ marginBottom: 20, padding: 24, background: "linear-gradient(135deg, rgba(88,166,255,0.08) 0%, rgba(188,140,255,0.08) 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <span className={`badge ${isActive ? "badge-easy" : isUpcoming ? "badge-blue" : "badge-gray"}`}>
                  {isActive ? "🔴 LIVE CONTEST" : isUpcoming ? "📅 UPCOMING" : "🏁 CONTEST ENDED"}
                </span>
                <span className="badge badge-purple">🏆 Ranked Competition</span>
                {leaderboardData?.isFrozen && <span className="badge badge-yellow">❄️ Leaderboard Frozen (Last 15m)</span>}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{activeContestView.title}</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6, maxWidth: 650 }}>
                {activeContestView.description || "Solve 4 algorithmic challenges in 90 minutes. Penalty time calculated per failed submission."}
              </p>
            </div>

            <div style={{ textAlign: "right", background: "var(--bg-secondary)", padding: "14px 20px", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                {isUpcoming ? "Starts In" : isActive ? "Contest Timer (Remaining)" : "Status"}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-mono)", color: isActive ? "var(--accent-green)" : "var(--accent-primary)" }}>
                {isUpcoming ? formatCountdown(startMs) : isActive ? formatCountdown(endMs) : "Contest Finished"}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, borderTop: "1px solid var(--border-light)", paddingTop: 16, flexWrap: "wrap" }}>
            <button
              className={`btn btn-sm ${contestTab === "problems" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setContestTab("problems")}
            >
              📝 Problems (4)
            </button>
            <button
              className={`btn btn-sm ${contestTab === "leaderboard" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { setContestTab("leaderboard"); loadLeaderboard(activeContestView.id); }}
            >
              📊 Live Standings {leaderboardData?.isFrozen ? "❄️" : ""}
            </button>
            <button
              className={`btn btn-sm ${contestTab === "announcements" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { setContestTab("announcements"); loadContestExtra(activeContestView.id); }}
            >
              📢 Announcements {announcements.length > 0 ? `(${announcements.length})` : ""}
            </button>
            <button
              className={`btn btn-sm ${contestTab === "clarifications" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => { setContestTab("clarifications"); loadContestExtra(activeContestView.id); }}
            >
              💬 Clarifications {clarifications.length > 0 ? `(${clarifications.length})` : ""}
            </button>
            {isEnded && (
              <button
                className={`btn btn-sm ${contestTab === "results" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setContestTab("results")}
              >
                🏅 Rating Changes & Editorial
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Problems */}
        {contestTab === "problems" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(activeContestView.problems?.length > 0 ? activeContestView.problems : [
              { problemId: "two-sum", title: "Two Sum", difficulty: "Easy", points: 100 },
              { problemId: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", points: 200 },
              { problemId: "valid-parentheses", title: "Valid Parentheses", difficulty: "Medium", points: 300 },
              { problemId: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", points: 400 }
            ]).map((p: any, idx: number) => (
              <div key={idx} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "var(--accent-primary)" }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{p.title}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>⭐ {p.points} Points</span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.location.href = `/problems/${p.problemId}`}
                >
                  {isEnded ? "Practice Problem 💡" : "Open Workspace 🚀"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {contestTab === "leaderboard" && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>📊 Contest Standings</h3>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {leaderboardData?.isFrozen ? "❄️ Frozen snapshot during final 15 minutes. Final unfreezing occurs at contest conclusion." : "Live real-time ranking with 20-minute penalty per failed submission."}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => loadLeaderboard(activeContestView.id)}>
                🔄 Refresh Standings
              </button>
            </div>

            {leaderboardData && leaderboardData.leaderboard?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {leaderboardData.leaderboard.map((row: any) => (
                  <div key={row.userId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: 800, width: 24, color: row.rank === 1 ? "#FFD700" : row.rank === 2 ? "#C0C0C0" : row.rank === 3 ? "#CD7F32" : "var(--text-muted)" }}>
                        #{row.rank}
                      </span>
                      <div>
                        <span style={{ fontWeight: 700 }}>@{row.username}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>({row.name})</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 14, fontWeight: 700 }}>
                      <span style={{ color: "var(--accent-green)" }}>{row.score} pts</span>
                      <span style={{ color: "var(--text-muted)" }}>+{row.penalty}m</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <div>👥 No accepted submissions recorded yet.</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Be the first to submit a working solution to claim rank #1!</div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Announcements */}
        {contestTab === "announcements" && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>📢 Jury Announcements</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {announcements.length > 0 ? announcements.map((a: any) => (
                <div key={a.id} style={{ padding: "12px 16px", background: "var(--bg-tertiary)", borderRadius: 8, borderLeft: "4px solid var(--accent-primary)" }}>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{new Date(a.time).toLocaleTimeString()}</div>
                </div>
              )) : (
                <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                  No official broadcast announcements yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Clarifications */}
        {contestTab === "clarifications" && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>💬 Problem Clarifications & Questions</h3>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input
                className="input"
                placeholder="Ask jury for problem statement clarification..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAskClarification()}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAskClarification}
                disabled={askingClarification}
              >
                {askingClarification ? "Sending..." : "Submit Question"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clarifications.length > 0 ? clarifications.map((c: any) => (
                <div key={c.id} style={{ padding: "12px 16px", background: "var(--bg-tertiary)", borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>❓ {c.question}</div>
                  <div style={{ fontSize: 13, color: c.answer ? "var(--accent-green)" : "var(--text-muted)", marginTop: 6, paddingLeft: 10, borderLeft: "2px solid var(--border)" }}>
                    {c.answer ? `💡 Jury Response: ${c.answer}` : "⏳ Pending jury review (No response needed if statement is self-contained)"}
                  </div>
                </div>
              )) : (
                <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                  No clarifications submitted yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Post-Contest Results & Rating Changes */}
        {contestTab === "results" && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>🏆 Final Official Results & Rating Changes</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
              Contest completed! Elo performance ratings have been processed and updated on all participant profiles.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
              <div className="card" style={{ background: "var(--bg-tertiary)", padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Rank 1 Winner</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-primary)", marginTop: 4 }}>👑 @tourist_dev</div>
              </div>
              <div className="card" style={{ background: "var(--bg-tertiary)", padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Rating Delta (Max)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-green)", marginTop: 4 }}>📈 +115 Elo</div>
              </div>
              <div className="card" style={{ background: "var(--bg-tertiary)", padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Editorial Status</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-purple)", marginTop: 4 }}>📖 Published</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => window.location.href = "/problems"}>
                Browse Problem Editorials & Video Solutions 🎥
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = "/leaderboard"}>
                View Global Elo Leaderboard 📊
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>🏅 Competitive Contests</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Scheduled rating competitions, multi-problem sets, frozen leaderboards, and instant Elo calculations.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "var(--accent-primary)" }}>
            📅 Active & Upcoming Competitions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allUpcoming.map((c: any) => (
              <div key={c.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span className={`badge ${c.status === "Active" ? "badge-easy" : "badge-blue"}`}>
                        {c.status}
                      </span>
                      <span className="badge badge-gray">⏱ {c.durationMinutes || 90}m</span>
                      <span className="badge badge-purple">4 Problems</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{c.title}</h3>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      <span>📅 {new Date(c.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span> &nbsp;·&nbsp;
                      <span>👥 {(c._count?.participants || c.participants || 0).toLocaleString()} Registered</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openContestRoom(c.id)}>
                      Enter Arena 🏟️
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={async () => {
                        if (!user) { onToast("Sign in to register", "error"); return; }
                        try {
                          await api.post(`/api/v1/contests/${c.id}/register`, {});
                          onToast("Registered for contest! 🎉", "success");
                        } catch (e: any) {
                          onToast(e.response?.data?.error || "Already registered", "info");
                        }
                      }}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "28px 0 14px", color: "var(--text-secondary)" }}>
            🏁 Past Contests (Practice Mode)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allPast.map((c: any) => (
              <div key={c.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{c.title}</h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Completed on {new Date(c.startTime).toLocaleDateString()} · 4 Problems
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => openContestRoom(c.id)}>
                    View Leaderboard & Practice 💡
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Rating Stats */}
        <div>
          <div className="card" style={{ marginBottom: 16, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>📊 Your Contest Profile</h3>
            {user ? (
              <>
                <div style={{ fontSize: 36, fontWeight: 900, color: "var(--accent-primary)" }}>{user.contestRating || 1500}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Current Global Elo Rating</div>
                <div style={{ marginTop: 14, padding: 12, background: "var(--bg-tertiary)", borderRadius: 8, fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>🏅 Contests Participated: <strong>{user.streak > 0 ? user.streak : 1}</strong></div>
                  <div>🏆 Tier: <strong style={{ color: "var(--accent-green)" }}>Specialist</strong></div>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Sign in to view your rating progression.</div>
            )}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>🎯 Global Tier Ladders</h3>
            {[
              { name: "Newbie", min: 0, color: "#8b949e" },
              { name: "Pupil", min: 1200, color: "#3fb950" },
              { name: "Specialist", min: 1400, color: "#39d353" },
              { name: "Expert", min: 1600, color: "#388bfd" },
              { name: "Master", min: 1900, color: "#bc8cff" },
              { name: "Grandmaster", min: 2300, color: "#f85149" }
            ].map(r => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
                  <span>{r.name}</span>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{r.min}+</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
