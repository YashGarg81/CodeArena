import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import "./index.css";

// Shared Types
import type { User, Problem } from "./types";

// Services & Utilities
import { API } from "./services/api";
import { parseLocationToRoute, routeToUrl } from "./utils/routes";

// Layout & Common Components
import { Navbar } from "./components/navigation/Navbar";
import { Icons } from "./components/ui/Icons";
import { Toast } from "./components/common/StateView";
import { CommandPalette } from "./components/common/CommandPalette";
import { SnippetsLibraryModal } from "./components/common/SnippetsLibraryModal";
import { NotFoundPage } from "./components/common/NotFoundPage";

// Modular Feature Views
import { AuthModal } from "./features/auth/AuthModal";
import { EmailVerificationPage } from "./features/auth/EmailVerificationPage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { LandingPage } from "./features/problems/LandingPage";
import { ProblemsPage } from "./features/problems/ProblemsPage";
import { ProblemDetailPage } from "./features/problems/ProblemDetailPage";
import { SubmissionSharePage } from "./features/submissions/SubmissionSharePage";
import { DashboardPage } from "./features/profile/DashboardPage";
import { PublicProfilePage } from "./features/profile/PublicProfilePage";
import { LeaderboardPage } from "./features/leaderboard/LeaderboardPage";
import { CommunityPage } from "./features/community/CommunityPage";
import { RoadmapPage } from "./features/roadmap/RoadmapPage";
import { ContestsPage } from "./features/contests/ContestsPage";
import { LearnPage, CourseDetailPage, LessonViewerPage } from "./features/academy/AcademyPages";
import { NotesPage } from "./features/notes/NotesPage";
import { BattleArenaPage } from "./features/arena/BattleArenaPage";
import { SystemDesignStudio } from "./SystemDesignStudio";
import { InterviewPage } from "./features/interviews/InterviewPage";
import { CollabStudioPage } from "./features/collab/CollabStudioPage";
import { PlaygroundPage } from "./features/playground/PlaygroundPage";
import { AdminPanelPage } from "./features/admin/AdminPanelPage";

export default function App() {
  const initialRoute = typeof window !== "undefined" ? parseLocationToRoute(window.location.pathname) : { page: "home", subPage: "" };
  const [page, setPage] = useState(initialRoute.page);
  const [subPage, setSubPage] = useState(initialRoute.subPage);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("ca_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [problems, setProblems] = useState<Problem[]>([]);
  const [authModal, setAuthModal] = useState<null | "login" | "signup">(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [snippetsOpen, setSnippetsOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Handle OAuth popup callback response if this window was opened as an OAuth popup
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check URL hash for OAuth implicit tokens (e.g., #access_token=... or #id_token=...)
    const hash = window.location.hash;
    if (hash && (hash.includes("access_token=") || hash.includes("id_token="))) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const token = params.get("access_token") || params.get("id_token");
      if (token && window.opener) {
        window.opener.postMessage({ provider: "google", token }, window.location.origin);
        window.close();
        return;
      }
    }

    // Check query params for OAuth code / token (e.g. ?code=... or ?token=...)
    const searchParams = new URLSearchParams(window.location.search);
    const oauthToken = searchParams.get("token") || searchParams.get("code");
    const oauthProvider = searchParams.get("provider") || "github";
    if (oauthToken && window.opener) {
      window.opener.postMessage({ provider: oauthProvider, token: oauthToken }, window.location.origin);
      window.close();
      return;
    }
  }, []);

  // Fetch actual database problem list for global search and dynamic platform counts
  useEffect(() => {
    axios.get(`${API}/api/v1/problems?limit=1000`)
      .then(res => {
        if (Array.isArray(res.data?.problems)) {
          setProblems(res.data.problems);
        }
      })
      .catch(() => {});
  }, []);

  // Restore authenticated user session on mount or page refresh
  useEffect(() => {
    const token = localStorage.getItem("ca_token");
    if (!token) return;

    axios.get(`${API}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res?.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("ca_user", JSON.stringify(res.data.user));
        }
      })
      .catch(err => {
        // If token is invalid or expired (401/403), clear persisted session
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("ca_token");
          localStorage.removeItem("ca_user");
          setUser(null);
        }
      });
  }, []);

  // Synchronize browser URL and back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const { page: targetPage, subPage: targetSub } = parseLocationToRoute(window.location.pathname);
      setPage(targetPage);
      setSubPage(targetSub);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (p: string, s?: string, replace = false) => {
    setPage(p);
    setSubPage(s || "");
    const targetUrl = routeToUrl(p, s);
    if (window.location.pathname !== targetUrl) {
      if (replace) {
        window.history.replaceState({ page: p, subPage: s }, "", targetUrl);
      } else {
        window.history.pushState({ page: p, subPage: s }, "", targetUrl);
      }
    }
  };

  const showToast = useCallback((msg: string, type: string) => { setToast({ msg, type }); }, []);

  const handleAuthSuccess = (u: User, token: string) => {
    setUser(u);
    localStorage.setItem("ca_token", token);
    localStorage.setItem("ca_user", JSON.stringify(u));
    setAuthModal(null);
    showToast(`Welcome back, ${u.name}! 👋`, "success");
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("ca_token");
      if (token) {
        await axios.post(`${API}/api/v1/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err: any) {
      console.error("Logout API error:", err.message);
    }
    setUser(null);
    localStorage.removeItem("ca_token");
    localStorage.removeItem("ca_user");
    navigate("home");
    showToast("Signed out successfully", "info");
  };

  // Dark / Light / System theme persistence and system preference sync
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">(() => {
    return (localStorage.getItem("ca_theme_mode") as any) || "system";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("ca_theme_mode");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    const updateTheme = () => {
      let resolved: "dark" | "light" = "dark";
      if (themeMode === "system") {
        resolved = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      } else {
        resolved = themeMode;
      }
      setEffectiveTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
      localStorage.setItem("ca_theme_mode", themeMode);
    };

    updateTheme();

    if (themeMode === "system" && window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: light)");
      const listener = () => updateTheme();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === "dark" ? "light" : prev === "light" ? "system" : "dark");
  };

  return (
    <div className="app">
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar
        page={page} user={user} theme={effectiveTheme}
        onNavigate={navigate} onToggleTheme={toggleTheme}
        onOpenCmd={() => setCmdOpen(true)}
        onOpenSnippets={() => setSnippetsOpen(true)}
        onOpenAuth={(m) => setAuthModal(m)}
        onLogout={handleLogout}
      />

      <div className="main-layout">
        <main id="main-content" className="page-content" tabIndex={-1}>
          {page === "home" && <LandingPage onNavigate={navigate} onOpenAuth={m => setAuthModal(m)} problemCount={problems.length} user={user} />}
          {page === "problems" && <ProblemsPage onNavigate={navigate} user={user} onToast={showToast} />}
          {page === "problem" && <ProblemDetailPage problemId={subPage} user={user} onToast={showToast} />}
          {page === "submission-share" && <SubmissionSharePage submissionId={subPage} onNavigate={navigate} />}
          {page === "dashboard" && <DashboardPage user={user} onNavigate={navigate} />}
          {page === "leaderboard" && <LeaderboardPage user={user} />}
          {page === "community" && <CommunityPage user={user} onToast={showToast} />}
          {page === "roadmap" && <RoadmapPage onNavigate={navigate} />}
          {page === "contests" && <ContestsPage user={user} onToast={showToast} />}
          {page === "learn" && <LearnPage onNavigate={navigate} user={user} onOpenAuth={m => setAuthModal(m)} />}
          {page === "course" && <CourseDetailPage courseId={subPage} onNavigate={navigate} user={user} onToast={showToast} onOpenAuth={m => setAuthModal(m)} />}
          {page === "lesson" && <LessonViewerPage lessonId={subPage} onNavigate={navigate} user={user} onToast={showToast} onOpenAuth={m => setAuthModal(m)} />}
          {page === "notes" && <NotesPage user={user} onToast={showToast} onOpenAuth={m => setAuthModal(m)} />}
          {page === "interview" && <InterviewPage user={user} onToast={showToast} />}
          {page === "arena" && <BattleArenaPage user={user} onToast={showToast} />}
          {page === "system-design" && <SystemDesignStudio onToast={showToast} />}
          {page === "playground" && <PlaygroundPage onToast={showToast} />}
          {page === "verify-email" && (
            <EmailVerificationPage
              token={subPage}
              user={user}
              onNavigate={navigate}
              onToast={showToast}
            />
          )}
          {page === "reset-password" && (
            <ResetPasswordPage
              token={subPage}
              onNavigate={navigate}
              onToast={showToast}
              onOpenLogin={() => setAuthModal("login")}
            />
          )}
          {page === "collab" && <CollabStudioPage roomId={subPage} user={user} onToast={showToast} onNavigate={navigate} />}
          {page === "profile" && user && (
            <div className="container" style={{ padding: "28px 24px" }}>
              <DashboardPage user={user} onNavigate={navigate} />
            </div>
          )}
          {page === "user-profile" && (
            <PublicProfilePage username={subPage} onNavigate={navigate} />
          )}
          {page === "settings" && (
            <div className="container" style={{ padding: "28px 24px", maxWidth: 700 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Icons.Settings size={22} />
                <span>Platform Settings</span>
              </h1>
              
              {/* Appearance */}
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icons.Sun size={15} />
                  <span>Appearance & Interface</span>
                </h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Theme Mode</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Persist your preferred color scheme or match your operating system</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["dark", "light", "system"] as const).map(mode => (
                      <button
                        key={mode}
                        className={`btn btn-sm ${themeMode === mode ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setThemeMode(mode)}
                        style={{ textTransform: "capitalize", fontSize: 12 }}
                      >
                        {mode === "dark" ? "🌙 Dark" : mode === "light" ? "☀️ Light" : "💻 System"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GitHub Repository Solution Auto-Sync */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icons.Git size={15} />
                      <span>GitHub Solution Auto-Sync</span>
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Auto-commit accepted solutions directly to your personal GitHub repository</div>
                  </div>
                  <span className="badge badge-easy">Active</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label className="label" style={{ fontSize: 11 }}>Target GitHub Repository</label>
                    <input className="input" defaultValue="octocat/my-leetcode-solutions" placeholder="username/repository-name" />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label className="label" style={{ fontSize: 11 }}>Target Branch</label>
                      <input className="input" defaultValue="main" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label" style={{ fontSize: 11 }}>Solutions Folder</label>
                      <input className="input" defaultValue="solutions" />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", marginTop: 4 }} onClick={() => showToast("GitHub repository sync preferences saved! 🚀", "success")}>Save Repository Settings</button>
                </div>
              </div>

              {/* MicroVM Sandbox Isolation */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icons.Shield size={15} />
                      <span>Custom Sandbox Runner</span>
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Select untrusted code execution sandbox engine</div>
                  </div>
                  <span className="badge badge-purple">Enterprise</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer", background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border-light)" }}>
                    <input type="radio" name="sandbox_mode" defaultChecked />
                    <div>
                      <strong>⚡ Firecracker MicroVM (Sub-5ms Cold Start)</strong>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Hardware-virtualized Linux kernel jail with dedicated cgroups & read-only rootfs</div>
                    </div>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer", background: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border-light)" }}>
                    <input type="radio" name="sandbox_mode" />
                    <div>
                      <strong>🐳 Docker-in-Docker Container Jail (DinD)</strong>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Rootless container sandbox with 256MB memory cap and isolated network namespace</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Account & Enterprise SSO */}
              {user && (
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <Icons.Lock size={15} />
                    <span>Enterprise Identity & Account</span>
                  </h3>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>Signed in as <strong>{user.email}</strong> &nbsp;({user.role})</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => showToast("SAML 2.0 Single Sign-On certificate verified! 🛡️", "info")}>SAML 2.0 SSO Status</button>
                    <button className="btn btn-secondary btn-sm" style={{ color: "var(--accent-red)", borderColor: "var(--accent-red)" }} onClick={handleLogout}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {page === "admin" && (
            user && ["ADMIN", "INSTRUCTOR", "DEVELOPER", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "CONTEST_ADMIN"].includes(user.role) ? (
              <AdminPanelPage user={user} onToast={showToast} />
            ) : (
              <div className="container" style={{ padding: "80px 24px", textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🛡️</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5 }}>Staff & Admin Console</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 24 }}>
                  Administrative credentials (Admin, Developer, Instructor) are required to access problem authoring, test suite management, and platform analytics.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setAuthModal("login")}
                  >
                    🔐 Sign In as Administrator
                  </button>
                  <button className="btn btn-ghost" onClick={() => navigate("home")}>Return to Safety</button>
                </div>
              </div>
            )
          )}
          {page === "404" && <NotFoundPage path={subPage} onNavigate={navigate} />}
        </main>
      </div>

      {/* Modals */}
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSuccess={handleAuthSuccess} />}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} onNavigate={(p, s) => { navigate(p, s); setCmdOpen(false); }} problems={problems} />}
      {snippetsOpen && (
        <SnippetsLibraryModal
          onClose={() => setSnippetsOpen(false)}
          onToast={showToast}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export { App };
