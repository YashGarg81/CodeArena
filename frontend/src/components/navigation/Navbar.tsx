// frontend/src/components/navigation/Navbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Icons } from "../ui/Icons";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  contestRating: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
}

interface NavDropdownItem {
  id: string;
  label: string;
  desc?: string;
  icon: React.ReactNode;
}

interface NavCategory {
  id: string;
  label: string;
  directPage?: string;
  items?: NavDropdownItem[];
}

export function Navbar({
  page,
  user,
  theme,
  onNavigate,
  onToggleTheme,
  onOpenCmd,
  onOpenAuth,
  onOpenSnippets,
  onLogout
}: {
  page: string;
  user: User | null;
  theme: string;
  onNavigate: (p: string, s?: string) => void;
  onToggleTheme: () => void;
  onOpenCmd: () => void;
  onOpenAuth: (m: "login" | "signup") => void;
  onOpenSnippets?: () => void;
  onLogout: () => void;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<any>(null);

  const handleMouseEnter = (catId: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveDropdown(catId);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 280);
  };

  // Poll notifications when logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem("ca_token");
        if (!token) return;
        const res = await fetch("http://localhost:3000/api/v1/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());
        if (res.notifications) {
          setNotifications(res.notifications);
          setUnreadCount(res.notifications.filter((n: any) => !n.read).length);
        }
      } catch {
        // Fallback default notifications for demo experience
        const demoNotifs = [
          { id: "n1", title: "Contest Reminder", message: "Weekly Contest #1 starts in 24 hours. Don't forget to register!", type: "contest", read: false, createdAt: new Date().toISOString() },
          { id: "n2", title: "Submission Accepted", message: "Your solution for 'Two Sum' passed all test cases! (Top 94%)", type: "submission", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: "n3", title: "Achievement Unlocked", message: "You earned the 'Speed Demon' badge (+50 XP)!", type: "achievement", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() }
        ];
        setNotifications(demoNotifs);
        setUnreadCount(3);
      }
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 15000);
    return () => clearInterval(timer);
  }, [user]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      const token = localStorage.getItem("ca_token");
      if (token) {
        await fetch("http://localhost:3000/api/v1/notifications/read-all", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {}
  };

  const navCategories: NavCategory[] = [
    {
      id: "problems",
      label: "Problems",
      directPage: "problems"
    },
    {
      id: "contests",
      label: "Contests",
      directPage: "contests"
    },
    {
      id: "learn",
      label: "Courses",
      directPage: "learn"
    },
    {
      id: "arena",
      label: "Arena",
      directPage: "arena"
    },
    {
      id: "system-design",
      label: "System Design",
      directPage: "system-design"
    },
    {
      id: "interview",
      label: "Interview",
      directPage: "interview"
    },
    {
      id: "community",
      label: "Discuss",
      directPage: "community"
    },
    {
      id: "more",
      label: "More",
      items: [
        { id: "roadmap", label: "Learning Roadmaps", desc: "Structured step-by-step career paths", icon: <Icons.Compass size={16} className="text-cyan-400" /> },
        { id: "playground", label: "Web IDE Playground", desc: "Full sandboxed REPL & runner", icon: <Icons.Terminal size={16} className="text-amber-400" /> },
        { id: "collab", label: "Collaborative Studio", desc: "Live multi-user pair-programming workspace", icon: <Icons.Users size={16} className="text-emerald-400" /> },
        { id: "leaderboard", label: "Global Rankings", desc: "Top developers by contest Elo and XP", icon: <Icons.Activity size={16} className="text-purple-400" /> },
        { id: "notes", label: "Developer Notes", desc: "Personal markdown notes & cheat sheets", icon: <Icons.Layers size={16} className="text-emerald-400" /> }
      ]
    },
    ...(user && ["ADMIN", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "CONTEST_ADMIN", "INSTRUCTOR", "DEVELOPER"].includes(user.role)
      ? [{ id: "admin", label: "Admin", directPage: "admin" }]
      : [])
  ];

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      <nav className="navbar" ref={navRef} role="navigation" aria-label="Main Navigation">
        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open Mobile Navigation Menu"
          aria-expanded={mobileDrawerOpen}
        >
          <Icons.Menu size={18} />
        </button>

        {/* Brand */}
        <button
          className="navbar-brand"
          onClick={() => { onNavigate("home"); setActiveDropdown(null); }}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="CodeArena Home"
        >
          <div className="logo-icon">CA</div>
          <span>CodeArena</span>
        </button>

      {/* Global Navigation Links with Dropdowns */}
      <nav className="navbar-nav">
        {navCategories.map(cat => {
          if (cat.directPage) {
            const isActive = page === cat.directPage;
            return (
              <button
                key={cat.id}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => { onNavigate(cat.directPage!); setActiveDropdown(null); }}
              >
                {cat.label}
              </button>
            );
          }

          const hasActiveChild = cat.items?.some(item => item.id === page);
          const isDropdownOpen = activeDropdown === cat.id;

          return (
            <div
              key={cat.id}
              style={{ position: "relative" }}
              onMouseEnter={() => handleMouseEnter(cat.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`nav-link ${hasActiveChild ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(isDropdownOpen ? null : cat.id);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                {cat.label}
                <Icons.ChevronDown size={12} style={{ opacity: 0.6, transform: isDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>

              {isDropdownOpen && (
                <div
                  className="nav-dropdown-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  {cat.items?.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setActiveDropdown(null);
                      }}
                      className="nav-dropdown-item"
                      style={{
                        background: page === item.id ? "var(--bg-tertiary)" : "transparent"
                      }}
                    >
                      <div style={{ marginTop: 2 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{item.label}</div>
                        {item.desc && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 1 }}>{item.desc}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="navbar-spacer" />

      {/* Global Quick Search Button */}
      <button className="navbar-search" onClick={onOpenCmd} aria-label="Open Command Palette">
        <Icons.Search size={14} />
        <span>Search anything...</span>
        <span className="cmd-kbd" style={{ marginLeft: "auto" }}>⌘K</span>
      </button>

      {/* Actions */}
      <div className="navbar-actions">
        {/* Theme Switcher */}
        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Icons.Sun size={15} /> : <Icons.Moon size={15} />}
        </button>

        {/* Notification Center */}
        {user && (
          <div ref={notifMenuRef} style={{ position: "relative" }}>
            <button
              className="btn-icon"
              onClick={() => setShowNotifications(prev => !prev)}
              title="Notification Center"
              aria-label="Notifications"
              style={{ position: "relative" }}
            >
              <Icons.Bell size={15} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    background: "var(--accent-red)",
                    color: "#fff",
                    borderRadius: "50%",
                    minWidth: 15,
                    height: 15,
                    fontSize: 9,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 2px"
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  width: 320,
                  maxHeight: 400,
                  overflowY: "auto",
                  padding: "10px",
                  zIndex: 350,
                  boxShadow: "var(--shadow-lg)",
                  animation: "fadeInDown 0.12s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <Icons.Bell size={14} />
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="badge badge-purple" style={{ fontSize: 10 }}>{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 10px", color: "var(--text-muted)", fontSize: 12 }}>
                    ✨ All caught up! No notifications.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 6,
                          background: n.read ? "transparent" : "var(--bg-tertiary)",
                          border: n.read ? "1px solid transparent" : "1px solid rgba(99,102,241,0.2)",
                          fontSize: 12,
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          if (n.link) onNavigate(n.link.replace(/^\//, ""));
                          setShowNotifications(false);
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {user ? (
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <button
              className="avatar-btn"
              onClick={() => setShowUserMenu(p => !p)}
              aria-label="User profile menu"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  minWidth: 220,
                  padding: "8px",
                  zIndex: 300,
                  boxShadow: "var(--shadow-lg)",
                  animation: "fadeInDown 0.12s ease"
                }}
              >
                <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-light)", marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: "13.5px" }}>{user.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11.5px" }}>@{user.username}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="badge badge-blue" style={{ fontSize: "10px" }}>⚡ {user.xp} XP</span>
                    <span className="badge badge-purple" style={{ fontSize: "10px" }}>🏆 {user.contestRating}</span>
                    {(user as any).isVerified ? (
                      <span className="badge badge-green" style={{ fontSize: "10px" }}>✅ Verified</span>
                    ) : (
                      <button
                        onClick={() => { onNavigate("verify-email"); setShowUserMenu(false); }}
                        className="badge badge-yellow"
                        style={{ fontSize: "10px", cursor: "pointer", border: "none" }}
                        title="Click to verify your email"
                      >
                        ⚠️ Unverified
                      </button>
                    )}
                  </div>
                </div>

                {[
                  { label: "Dashboard", page: "dashboard", icon: <Icons.Activity size={14} /> },
                  { label: "My Profile", page: "profile", icon: <Icons.Users size={14} /> },
                  { label: "My Courses", page: "learn", icon: <Icons.Book size={14} /> },
                  { label: "Developer Notes", page: "notes", icon: <Icons.Layers size={14} /> },
                  { label: "Code Snippets", isSnippets: true, icon: <Icons.Code size={14} /> },
                  { label: "Submissions", page: "dashboard", icon: <Icons.Code size={14} /> },
                  { label: "Settings", page: "settings", icon: <Icons.Settings size={14} /> },
                  ...(user && ["ADMIN", "INSTRUCTOR", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "CONTEST_ADMIN", "DEVELOPER"].includes(user.role)
                    ? [{ label: "Admin Console", page: "admin", icon: <Icons.Shield size={14} /> }]
                    : [])
                ].map((item: any) => (
                  <button
                    key={item.label}
                    className="nav-link"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      gap: 8,
                      borderRadius: 6,
                      padding: "7px 10px",
                      fontSize: "12.5px"
                    }}
                    onClick={() => {
                      if (item.isSnippets) {
                        onOpenSnippets?.();
                      } else if (item.page) {
                        onNavigate(item.page);
                      }
                      setShowUserMenu(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                <div className="divider" style={{ margin: "6px 0" }} />
                <button
                  className="nav-link"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 8,
                    borderRadius: 6,
                    padding: "7px 10px",
                    color: "var(--accent-red)",
                    fontSize: "12.5px"
                  }}
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                >
                  <Icons.Lock size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onOpenAuth("login")}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth("signup")}>Sign Up</button>
          </div>
        )}
      </div>
    </nav>

    {/* Mobile Navigation Slide-out Drawer */}
    <div
      className={`mobile-drawer-overlay ${mobileDrawerOpen ? "open" : ""}`}
      onClick={() => setMobileDrawerOpen(false)}
      aria-hidden="true"
    />
    <div
      className={`mobile-drawer ${mobileDrawerOpen ? "open" : ""}`}
      role="dialog"
      aria-label="Mobile Navigation Menu"
      aria-modal="true"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid var(--border-light)", paddingBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="logo-icon" style={{ width: 22, height: 22, fontSize: 11 }}>CA</div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>CodeArena</span>
        </div>
        <button
          className="btn-icon"
          onClick={() => setMobileDrawerOpen(false)}
          aria-label="Close navigation menu"
        >
          ✕
        </button>
      </div>

      {/* Navigation Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {navCategories.map(cat => (
          <div key={cat.id}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6, paddingLeft: 6 }}>
              {cat.label}
            </div>
            {cat.directPage ? (
              <button
                className={`nav-link ${page === cat.directPage ? "active" : ""}`}
                style={{ width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 13 }}
                onClick={() => {
                  onNavigate(cat.directPage!);
                  setMobileDrawerOpen(false);
                }}
              >
                {cat.label}
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {cat.items?.map(item => (
                  <button
                    key={item.id}
                    className={`nav-link ${page === item.id ? "active" : ""}`}
                    style={{ width: "100%", justifyContent: "flex-start", gap: 8, padding: "8px 10px", fontSize: 13 }}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileDrawerOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border-light)" }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={onToggleTheme}
        >
          {theme === "dark" ? "☀️ Switch to Light Mode" : "🌙 Switch to Dark Mode"}
        </button>
      </div>
    </div>
    </>
  );
}
