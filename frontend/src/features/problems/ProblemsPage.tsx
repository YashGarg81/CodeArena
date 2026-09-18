import React, { useState, useEffect } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";
import type { User, Problem } from "../../types";

// ─── PROBLEMS LIST ────────────────────────────────────────────────────────────

const TOPIC_CHIPS = [
  { label: "Arrays", icon: "📦" }, { label: "Strings", icon: "🔤" },
  { label: "Dynamic Programming", icon: "🧠" }, { label: "Trees", icon: "🌲" },
  { label: "Graphs", icon: "🕸️" }, { label: "Stack", icon: "📚" },
  { label: "Binary Search", icon: "🔍" }, { label: "Math", icon: "➗" },
  { label: "Design", icon: "🏗️" }, { label: "Sorting", icon: "⬆️" },
  { label: "Linked List", icon: "🔗" }, { label: "Backtracking", icon: "↩️" },
];
const COMPANIES = ["Google","Amazon","Microsoft","Meta","Apple","Netflix","Uber","Adobe","Bloomberg","Twitter"];

export function ProblemsPage({ onNavigate, user, onToast }: { onNavigate: (p: string, s?: string) => void; user: User | null; onToast: (msg: string, type: string) => void }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ difficulty: "", category: "", company: "", search: "", solved: "" });
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [dailyProblem, setDailyProblem] = useState<Problem | null>(null);

  useEffect(() => {
    api.get("/api/v1/problems?limit=1000").then(r => {
      const ps: Problem[] = r.data.problems || [];
      setProblems(ps);
      // Deterministic daily problem based on day-of-year (stable across the year)
      if (ps.length > 0) {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
        setDailyProblem(ps[dayOfYear % ps.length] || null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      api.get(`/api/v1/users/${user.id}/submissions`).then(r => {
        const ids = new Set(r.data.submissions.filter((s: any) => s.status === "Success").map((s: any) => s.problemId));
        setSolvedIds(ids as Set<string>);
      }).catch(() => {});
      api.get(`/api/v1/problems/liked`).then(r => {
        const likedSet = new Set<string>((r.data.liked || []).map((p: any) => String(p.id)));
        setLikedIds(likedSet);
      }).catch(() => {});
    }
  }, [user]);

  const filtered = problems.filter(p => {
    if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.company && !p.companies?.includes(filters.company)) return false;
    if (filters.search && !(p.title ?? "").toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.solved === "solved" && !solvedIds.has(p.id)) return false;
    if (filters.solved === "unsolved" && solvedIds.has(p.id)) return false;
    return true;
  });

  const [likePending, setLikePending] = useState<Set<string>>(new Set());
  const handleLike = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    if (!user) {
      onToast("Please sign in to like problems", "warning");
      return;
    }
    if (likePending.has(problemId)) return;
    setLikePending(prev => new Set([...prev, problemId]));
    try {
      const { data } = await api.post(`/api/v1/problems/${problemId}/like`, {});
      if (data.liked) {
        setLikedIds(prev => new Set([...prev, problemId]));
      } else {
        setLikedIds(prev => {
          const next = new Set(prev);
          next.delete(problemId);
          return next;
        });
      }
    } catch (err) {
      console.error("Like error:", err);
      onToast("Unable to update like state", "error");
    } finally {
      setLikePending(prev => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  };

  const canManage = user && ["ADMIN", "INSTRUCTOR", "DEVELOPER", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "CONTEST_ADMIN"].includes(user.role);

  const handleTogglePublish = async (e: React.MouseEvent, p: Problem) => {
    e.stopPropagation();
    try {
      const isPub = (p as any).status === "Published" || (p as any).status === undefined;
      const endpoint = isPub ? `/api/v1/admin/problems/${p.id}/unpublish` : `/api/v1/admin/problems/${p.id}/publish`;
      await api.post(endpoint, {});
      const newStatus = isPub ? "Draft" : "Published";
      setProblems(prev => prev.map(item => item.id === p.id ? { ...item, status: newStatus } as any : item));
      onToast(isPub ? `Problem '${p.title}' moved to Draft ⬇️` : `Problem '${p.title}' published live! 🚀`, "success");
    } catch (err: any) {
      onToast(err.response?.data?.error || "Failed to update problem status", "error");
    }
  };

  const difficultyOrder: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
  const easyCnt = problems.filter(p => p.difficulty === "Easy").length;
  const mediumCnt = problems.filter(p => p.difficulty === "Medium").length;
  const hardCnt = problems.filter(p => p.difficulty === "Hard").length;

  const pickRandom = () => {
    if (filtered.length === 0) return;
    const p = filtered[Math.floor(Math.random() * filtered.length)];
    if (p) onNavigate("problem", p.id);
  };

  const clearFilters = () => setFilters({ difficulty: "", category: "", company: "", search: "", solved: "" });
  const hasFilters = !!(filters.difficulty || filters.category || filters.company || filters.search || filters.solved);

  return (
    <div className="problems-page">
      <div className="container">
        {/* Daily Challenge Banner */}
        {dailyProblem && (
          <div
            className="daily-banner"
            onClick={() => onNavigate("problem", dailyProblem.id)}
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(234,88,12,0.12) 0%, rgba(99,102,241,0.08) 100%)",
              border: "1px solid rgba(234,88,12,0.3)",
              borderRadius: "var(--radius-md)",
              marginBottom: 20,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>🔥</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className="daily-badge" style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
                    Daily Challenge · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </span>
                  <span className={`badge badge-${(dailyProblem.difficulty ?? "medium").toLowerCase()}`}>{dailyProblem.difficulty}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>⏱ ~20 min</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  {dailyProblem.title}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-orange)" }}>
                  🔥 {user?.streak || 1} Day Streak
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>+50 Bonus XP on solve</div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ fontWeight: 700, padding: "6px 14px" }}>
                Start Challenge →
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Problems</h1>
            {canManage && (
              <div style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 700, marginTop: 3 }}>
                🛡️ Developer & Admin Mode Active: Direct Publish / Unpublish Controls Enabled
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginLeft: "auto", alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge badge-easy">🟢 {easyCnt}</span>
            <span className="badge badge-medium">🟡 {mediumCnt}</span>
            <span className="badge badge-hard">🔴 {hardCnt}</span>
            <button className="btn btn-secondary btn-sm" onClick={pickRandom} title="Pick a random problem">🎲 Random</button>
            {canManage && (
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate("admin")}>
                ⚙️ Admin Console
              </button>
            )}
          </div>
        </div>

        {/* Topic Chips */}
        <div className="topic-chips">
          {TOPIC_CHIPS.map(chip => (
            <button
              key={chip.label}
              className={`topic-chip ${filters.category === chip.label ? "active" : ""}`}
              onClick={() => setFilters(f => ({ ...f, category: f.category === chip.label ? "" : chip.label }))}
            >
              <span>{chip.icon}</span> {chip.label}
            </button>
          ))}
        </div>

        {/* Search & Filters Row */}
        <div className="problems-header" style={{ marginTop: 14 }}>
          <input
            className="input" style={{ maxWidth: 260 }}
            placeholder="🔍 Search problems..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
          <select className="select" value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}>
            <option value="">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select className="select" value={filters.company} onChange={e => setFilters(f => ({ ...f, company: e.target.value }))}>
            <option value="">All Companies</option>
            {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={filters.solved} onChange={e => setFilters(f => ({ ...f, solved: e.target.value }))}>
            <option value="">All Status</option>
            <option value="solved">✅ Solved</option>
            <option value="unsolved">⬜ Unsolved</option>
          </select>
          <span className="problems-count">{filtered.length} problems</span>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 46, borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <table className="problem-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}></th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Category</th>
                <th>Companies</th>
                <th>Acceptance</th>
                <th style={{ width: 50 }}>Like</th>
                {canManage && <th style={{ width: 110, textAlign: "center" }}>Status & Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0))
                .map(p => {
                  const acceptRate = p.attemptCount > 0 ? Math.round((p.solveCount / p.attemptCount) * 100) : 60;
                  const isPublished = (p as any).status !== "Draft" && (p as any).status !== "Archived";
                  return (
                    <tr key={p.id} className="problem-row" onClick={() => onNavigate("problem", p.id)}>
                      <td style={{ textAlign: "center" }}>
                        {solvedIds.has(p.id) ? <span className="solved-indicator">✓</span> : null}
                      </td>
                      <td>
                        <span className="problem-title">
                          {p.title}
                          {p.isPremium && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent-yellow)" }}>🔒</span>}
                        </span>
                        <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                          {p.tags?.slice(0, 3).map(t => (
                            <span key={t} style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "1px 5px", borderRadius: 4 }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${(p.difficulty ?? "medium").toLowerCase()}`}>{p.difficulty}</span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{p.category}</td>
                      <td>
                        <div className="problem-companies">
                          {(p.companies || []).slice(0, 2).map(c => <span key={c} className="company-tag">{c}</span>)}
                          {(p.companies?.length || 0) > 2 && <span className="company-tag">+{(p.companies?.length || 0) - 2}</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="acceptance-bar">
                            <div className="acceptance-fill" style={{ width: `${acceptRate}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", width: 32 }}>{acceptRate}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={(e) => handleLike(e, p.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            padding: 0,
                            opacity: likedIds.has(p.id) ? 1 : 0.5
                          }}
                          title={likedIds.has(p.id) ? "Unlike" : "Like"}
                        >
                          {likedIds.has(p.id) ? "❤️" : "🤍"}
                        </button>
                      </td>
                      {canManage && (
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={(e) => handleTogglePublish(e, p)}
                            className={`btn btn-sm ${isPublished ? "btn-secondary" : "btn-primary"}`}
                            style={{
                              fontSize: 11,
                              padding: "3px 8px",
                              fontWeight: 700,
                              borderRadius: 14
                            }}
                            title={isPublished ? "Click to move to Draft" : "Click to Publish live"}
                          >
                            {isPublished ? "⬇️ Unpub" : "🚀 Pub"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
