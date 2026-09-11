import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import type { User } from "../../types";
// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

export function LandingPage({ onNavigate, onOpenAuth, problemCount, user }: {
  onNavigate: (p: string) => void; onOpenAuth: (m: "login" | "signup") => void; problemCount: number; user: User | null;
}) {
  const features = [
    { icon: "💡", title: "500+ Problems", desc: "From easy warm-ups to hard algorithmic challenges across all DSA topics. Track your progress with visual analytics." },
    { icon: "⚡", title: "Live Code Execution", desc: "Run your code in JavaScript, Python, C++, Java, and more. Get instant feedback with detailed test results." },
    { icon: "🏆", title: "Compete in Contests", desc: "Weekly and monthly contests with real-time leaderboards, rating changes, and prizes for top performers." },
    { icon: "🗺️", title: "Guided Roadmaps", desc: "Structured learning paths for DSA, Frontend, Backend, and System Design. Know exactly what to learn next." },
    { icon: "🧠", title: "AI Code Assistant", desc: "Get hints, explanations, and code reviews from our AI. Choose from hint-only to full solution mode." },
    { icon: "👥", title: "Developer Community", desc: "Ask questions, share solutions, discuss interview experiences. Learn from thousands of developers." },
    { icon: "🎯", title: "Interview Prep", desc: "Company-specific problem sets, mock interviews, and AI interviewers. Land your dream job." },
    { icon: "📊", title: "Progress Analytics", desc: "Activity graphs, streak tracking, skill radar charts, and detailed submission history." },
  ];

  const formatCompactCount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M+`;
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
    return `${value}+`;
  };

  const [platformStats, setPlatformStats] = useState({
    problems: problemCount || 0,
    languages: 15,
    developers: 1,
    uptime: "99.9%"
  });

  useEffect(() => {
    if (problemCount > 0) {
      setPlatformStats((prev) => ({ ...prev, problems: problemCount }));
    }
  }, [problemCount]);

  useEffect(() => {
    let active = true;
    api.get("/api/v1/public/stats")
      .then((res) => {
        if (!active || !res || !res.data) return;

        setPlatformStats((prev) => {
          const nextProblems = res.data.problems ?? res.data.totalProblems ?? prev.problems;
          const nextLanguages = res.data.languages ?? prev.languages;
          const nextDevelopers = res.data.developers ?? res.data.totalUsers ?? prev.developers;

          return {
            problems: Number.isFinite(Number(nextProblems)) ? Number(nextProblems) : prev.problems,
            languages: Number.isFinite(Number(nextLanguages)) ? Number(nextLanguages) : prev.languages,
            developers: Number.isFinite(Number(nextDevelopers)) ? Math.max(1, Number(nextDevelopers)) : prev.developers,
            uptime: res.data.uptime ?? prev.uptime,
          };
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { num: formatCompactCount(platformStats.problems), label: "Problems" },
    { num: `${platformStats.languages}+`, label: "Languages" },
    { num: formatCompactCount(platformStats.developers), label: "Developers" },
    { num: platformStats.uptime, label: "Uptime" },
  ];

  const firstName = user?.name ? user.name.split(" ")[0] : "";

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            {user ? `👋 Welcome back, ${firstName}! Ready to code?` : "🚀 CodeArena v2.0 — Now with AI Assistant"}
          </div>
          <h1 className="hero-title">
            Master DSA.<br />
            <span className="gradient-text">Get Hired.</span>
          </h1>
          <p className="hero-subtitle">
            The complete platform to learn data structures, practice algorithms, compete with developers worldwide, and ace your technical interviews.
          </p>
          <div className="hero-cta">
            {user ? (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => onNavigate("problems")}>
                  Continue Practicing →
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => onNavigate("dashboard")}>
                  View Dashboard
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={() => onOpenAuth("signup")}>
                  Start for Free →
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => onNavigate("problems")}>
                  Explore Problems
                </button>
              </>
            )}
          </div>
          <div className="hero-stats">
            {stats.map(s => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything a developer needs</h2>
          <p className="section-subtitle">One platform. All the tools to go from beginner to senior engineer.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company logos */}
      <section style={{ padding: "60px 0", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-light)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 28 }}>
            Problems from top companies
          </div>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            {["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Uber", "Adobe"].map(c => (
              <div key={c} style={{ color: "var(--text-muted)", fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 0", textAlign: "center", background: "var(--gradient-hero)" }}>
        <div className="container">
          {user ? (
            <>
              <h2 className="section-title">Keep up the momentum, {firstName}! 🔥</h2>
              <p className="section-subtitle">Level up your rating or start your next DSA problem today.</p>
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate("problems")}>
                Solve Problems Now →
              </button>
            </>
          ) : (
            <>
              <h2 className="section-title">Ready to level up? 🚀</h2>
              <p className="section-subtitle">Join thousands of developers who use CodeArena every day to stay sharp.</p>
              <button className="btn btn-primary btn-lg" onClick={() => onOpenAuth("signup")}>
                Create Free Account →
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}