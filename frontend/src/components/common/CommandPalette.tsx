import React, { useState, useEffect, useRef } from "react";
import { Icons } from "../ui/Icons";
import { api } from "../../services/api";
import type { Problem } from "../../types";

// ─── COMMAND PALETTE & GLOBAL SEARCH ──────────────────────────────────────────

export function CommandPalette({ onClose, onNavigate, problems }: {
  onClose: () => void;
  onNavigate: (page: string, sub?: string) => void;
  problems: Problem[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [searchResults, setSearchResults] = useState<{
    problems: any[];
    users: any[];
    posts: any[];
    courses: any[];
    contests: any[];
  }>({ problems: [], users: [], posts: [], courses: [], contests: [] });
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const quickActions = [
    { icon: <Icons.Code size={16} />, label: "Explore Problems Library", action: () => onNavigate("problems") },
    { icon: <Icons.Flame size={16} />, label: "Battle Arena PvP", action: () => onNavigate("arena") },
    { icon: <Icons.Book size={16} />, label: "Learning Academy Courses", action: () => onNavigate("learn") },
    { icon: <Icons.Compass size={16} />, label: "Career Roadmaps", action: () => onNavigate("roadmap") },
    { icon: <Icons.Layers size={16} />, label: "Developer Notes & Cheatsheets", action: () => onNavigate("notes") },
    { icon: <Icons.Cpu size={16} />, label: "Mock Interview Studio", action: () => onNavigate("interview") },
    { icon: <Icons.Layers size={16} />, label: "System Design Studio", action: () => onNavigate("system-design") },
    { icon: <Icons.Terminal size={16} />, label: "Web IDE Playground", action: () => onNavigate("playground") },
    { icon: <Icons.Users size={16} />, label: "Live Collaborative Workspace", action: () => onNavigate("collab") },
    { icon: <Icons.Trophy size={16} />, label: "Contests & Coding Cups", action: () => onNavigate("contests") },
    { icon: <Icons.Activity size={16} />, label: "Global Developer Rankings", action: () => onNavigate("leaderboard") },
    { icon: <Icons.Discuss size={16} />, label: "Community Discussions", action: () => onNavigate("community") },
    { icon: <Icons.Shield size={16} />, label: "Admin & Content Management Console", action: () => onNavigate("admin") },
  ];

  // Live global search API call with debouncing
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults({ problems: [], users: [], posts: [], courses: [], contests: [] });
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      api.get(`/api/v1/search?q=${encodeURIComponent(query.trim())}`)
        .then(res => {
          if (res?.data?.results) {
            setSearchResults(res.data.results);
          }
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredActions = query.length > 0
    ? quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : quickActions;

  // Combine items for keyboard navigation
  const allItems: { type: string; label: string; icon: React.ReactNode; meta?: string; action: () => void }[] = [
    ...filteredActions.map(a => ({ type: "action", label: a.label, icon: a.icon, action: a.action })),
    ...(searchResults.problems || []).map(p => ({
      type: "problem",
      label: p.title,
      icon: <Icons.Code size={15} />,
      meta: p.difficulty,
      action: () => onNavigate("problem", p.id)
    })),
    ...(searchResults.users || []).map(u => ({
      type: "user",
      label: `@${u.username} (${u.name})`,
      icon: <Icons.Users size={15} />,
      meta: `Rating: ${u.contestRating || 1200}`,
      action: () => onNavigate("user-profile", u.username)
    })),
    ...(searchResults.courses || []).map(c => ({
      type: "course",
      label: `${c.icon || '📚'} ${c.title}`,
      icon: <Icons.Book size={15} />,
      meta: c.difficulty,
      action: () => onNavigate("course", c.slug)
    })),
    ...(searchResults.contests || []).map(ct => ({
      type: "contest",
      label: `🏆 ${ct.title}`,
      icon: <Icons.Trophy size={15} />,
      meta: `${ct.status} · ${ct.durationMinutes}m`,
      action: () => onNavigate("contests", ct.id)
    })),
    ...(searchResults.posts || []).map(post => ({
      type: "post",
      label: `💬 ${post.title}`,
      icon: <Icons.Discuss size={15} />,
      meta: post.category,
      action: () => onNavigate("community")
    }))
  ];

  useEffect(() => { setSelected(0); }, [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && allItems[selected]) { allItems[selected].action(); onClose(); }
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Icons.Search size={16} style={{ color: "var(--text-muted)" }} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search problems, users, courses, contests, commands..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          {searching ? <span className="animate-spin" style={{ fontSize: 12, marginRight: 6 }}>⚙</span> : <span className="cmd-kbd">ESC</span>}
        </div>
        <div className="cmd-results" style={{ maxHeight: 420, overflowY: "auto" }}>
          {!query && <div className="cmd-section-label">Quick Navigation</div>}
          
          {query && filteredActions.length > 0 && <div className="cmd-section-label">Platform Actions</div>}
          {filteredActions.map((item, i) => (
            <div key={`action-${i}`} className={`cmd-item ${selected === i ? "selected" : ""}`} onClick={() => { item.action(); onClose(); }}>
              <span className="cmd-item-icon" style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
              <span className="cmd-item-label">{item.label}</span>
            </div>
          ))}

          {searchResults.problems?.length > 0 && <div className="cmd-section-label">DSA Problems</div>}
          {searchResults.problems?.map((p, i) => {
            const index = filteredActions.length + i;
            return (
              <div key={p.id} className={`cmd-item ${selected === index ? "selected" : ""}`} onClick={() => { onNavigate("problem", p.id); onClose(); }}>
                <span className="cmd-item-icon" style={{ display: "flex", alignItems: "center" }}><Icons.Code size={14} /></span>
                <span className="cmd-item-label">{p.title}</span>
                <span className={`badge badge-${p.difficulty?.toLowerCase()}`} style={{ fontSize: "10px" }}>{p.difficulty}</span>
              </div>
            );
          })}

          {searchResults.users?.length > 0 && <div className="cmd-section-label">Developers & Profiles</div>}
          {searchResults.users?.map((u, i) => {
            const index = filteredActions.length + (searchResults.problems?.length || 0) + i;
            return (
              <div key={u.id} className={`cmd-item ${selected === index ? "selected" : ""}`} onClick={() => { onNavigate("user-profile", u.username); onClose(); }}>
                <span className="cmd-item-icon" style={{ display: "flex", alignItems: "center" }}><Icons.Users size={14} /></span>
                <span className="cmd-item-label">@{u.username} <span style={{ color: "var(--text-muted)", fontSize: 11 }}>({u.name})</span></span>
                <span className="badge badge-purple" style={{ fontSize: "10px" }}>🏆 {u.contestRating || 1200}</span>
              </div>
            );
          })}

          {searchResults.courses?.length > 0 && <div className="cmd-section-label">Academy Courses</div>}
          {searchResults.courses?.map((c, i) => {
            const index = filteredActions.length + (searchResults.problems?.length || 0) + (searchResults.users?.length || 0) + i;
            return (
              <div key={c.id} className={`cmd-item ${selected === index ? "selected" : ""}`} onClick={() => { onNavigate("course", c.slug); onClose(); }}>
                <span className="cmd-item-icon" style={{ display: "flex", alignItems: "center" }}><Icons.Book size={14} /></span>
                <span className="cmd-item-label">{c.title}</span>
                <span className="badge badge-blue" style={{ fontSize: "10px" }}>{c.difficulty}</span>
              </div>
            );
          })}

          {searchResults.contests?.length > 0 && <div className="cmd-section-label">Coding Contests</div>}
          {searchResults.contests?.map((ct, i) => {
            const index = filteredActions.length + (searchResults.problems?.length || 0) + (searchResults.users?.length || 0) + (searchResults.courses?.length || 0) + i;
            return (
              <div key={ct.id} className={`cmd-item ${selected === index ? "selected" : ""}`} onClick={() => { onNavigate("contests", ct.id); onClose(); }}>
                <span className="cmd-item-icon" style={{ display: "flex", alignItems: "center" }}><Icons.Trophy size={14} /></span>
                <span className="cmd-item-label">{ct.title}</span>
                <span className="badge badge-green" style={{ fontSize: "10px" }}>{ct.status}</span>
              </div>
            );
          })}

          {allItems.length === 0 && !searching && (
            <div style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)" }}>
              No search results found for "{query}". Try a different keyword.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}