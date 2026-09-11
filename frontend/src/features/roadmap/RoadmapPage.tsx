import React, { useState, useEffect } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";
import type { Roadmap } from "../../types";


const DEFAULT_ROADMAPS: Roadmap[] = [
  {
    id: "dsa-mastery",
    title: "Data Structures & Algorithms",
    description: "From Big-O complexity to Dynamic Programming and Advanced Graph Algorithms.",
    icon: "🗺️",
    estimatedWeeks: 12,
    stages: [
      { title: "Basics & Complexity", week: "1-2", topics: ["Time & Space Complexity", "Arrays", "Strings", "Two Pointers"] },
      { title: "Linear Data Structures", week: "3-4", topics: ["Linked Lists", "Stacks & Queues", "Hash Maps & Sets"] },
      { title: "Trees & Binary Search", week: "5-6", topics: ["Binary Search", "Binary Trees", "BST", "DFS & BFS Traversal"] },
      { title: "Graphs & Heaps", week: "7-8", topics: ["Graph Representations", "Dijkstra & BFS", "Min/Max Heaps", "Trie"] },
      { title: "Advanced Dynamic Programming", week: "9-12", topics: ["1D/2D DP", "Knapsack Problems", "Backtracking", "Greedy"] },
    ]
  },
  {
    id: "system-design",
    title: "System Design Studio Mastery",
    description: "Architect scalable distributed systems with microservices, caching, sharding, and messaging.",
    icon: "🏗️",
    estimatedWeeks: 8,
    stages: [
      { title: "Core Fundamentals", week: "1-2", topics: ["Client-Server", "Load Balancing", "CAP Theorem", "DNS & CDN"] },
      { title: "Storage & Caching", week: "3-4", topics: ["SQL vs NoSQL", "Redis & Memcached", "Replication & Sharding"] },
      { title: "Messaging & Async Queues", week: "5-6", topics: ["Kafka / RabbitMQ", "Event-Driven Systems", "WebSockets & SSE"] },
      { title: "Real-World Architecture Deep Dives", week: "7-8", topics: ["Rate Limiter", "URL Shortener", "Video Streaming", "Collaborative Whiteboard"] },
    ]
  },
  {
    id: "frontend-engineering",
    title: "Frontend Engineering Fast-Track",
    description: "Master Modern React, State Management, Web Performance, and Architecture.",
    icon: "⚡",
    estimatedWeeks: 6,
    stages: [
      { title: "JavaScript Deep Dive", week: "1-2", topics: ["Event Loop & Async", "Closures & Prototypes", "Memory Management"] },
      { title: "React Architecture", week: "3-4", topics: ["Advanced Hooks", "Component Design Patterns", "State Management (Zustand/Redux)"] },
      { title: "Performance & Web Vitals", week: "5-6", topics: ["Bundle Splitting", "SSR & Hydration", "Web Workers & Virtualized Lists"] },
    ]
  },
  {
    id: "blind-75",
    title: "Blind 75 & Grind 169 Fast Track",
    description: "The most frequently tested interview problems curated for top tech company hiring bars.",
    icon: "🎯",
    estimatedWeeks: 4,
    stages: [
      { title: "Arrays, Strings & Pointers", week: "1", topics: ["Two Sum", "Best Time to Buy and Sell Stock", "Valid Anagram", "Container With Most Water"] },
      { title: "Linked Lists & Binary Search", week: "2", topics: ["Reverse Linked List", "Merge Two Sorted Lists", "Search in Rotated Sorted Array"] },
      { title: "Trees & Graphs", week: "3", topics: ["Maximum Depth of Binary Tree", "Invert Tree", "Number of Islands", "Clone Graph"] },
      { title: "DP & Intervals", week: "4", topics: ["Climbing Stairs", "Coin Change", "Merge Intervals", "Non-overlapping Intervals"] },
    ]
  }
];

export function RoadmapPage({ onNavigate }: { onNavigate: (p: string, s?: string) => void }) {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(DEFAULT_ROADMAPS);
  const [selected, setSelected] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("ca_roadmap_completed");
      return saved ? new Set(JSON.parse(saved)) : new Set(["Client-Server", "Time & Space Complexity", "Two Sum"]);
    } catch {
      return new Set(["Client-Server", "Time & Space Complexity", "Two Sum"]);
    }
  });

  const toggleComplete = (itemKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      try {
        localStorage.setItem("ca_roadmap_completed", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    api.get("/api/v1/roadmaps")
      .then(r => {
        if (r && r.data && Array.isArray(r.data.roadmaps) && r.data.roadmaps.length > 0) {
          setRoadmaps(r.data.roadmaps);
        } else {
          setRoadmaps(DEFAULT_ROADMAPS);
        }
      })
      .catch(() => {
        setRoadmaps(DEFAULT_ROADMAPS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (selected) {
    const allTopics = (selected.stages || []).flatMap(s => s.problems || s.topics || []);
    const completedCount = allTopics.filter(t => completedItems.has(`${selected.id}_${t}`) || completedItems.has(t)).length;
    const progressPct = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;

    return (
      <div className="container" style={{ padding: "28px 24px" }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setSelected(null)}>← All Roadmaps</button>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <span style={{ fontSize: 40 }}>{selected.icon}</span>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>{selected.title}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>{selected.description}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span className="badge badge-blue">📅 {selected.estimatedWeeks} weeks</span>
              <span className="badge badge-gray">{selected.stages?.length || 0} stages</span>
              <span className="badge badge-green">🚀 {completedCount} / {allTopics.length} completed ({progressPct}%)</span>
            </div>
            {/* Progress Bar */}
            <div style={{ width: "100%", maxWidth: 500, height: 8, background: "var(--bg-tertiary)", borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #10b981)", borderRadius: 4, transition: "width 0.3s ease" }} />
            </div>
          </div>
        </div>

        <div className="roadmap-detail">
          {(selected.stages || []).map((stage, i) => (
            <div key={i} className="roadmap-stage">
              <div className="stage-dot">{i + 1}</div>
              <div className="stage-title">{stage.title}</div>
              <div className="stage-week">Week {stage.week}</div>
              <div className="stage-items">
                {(stage.problems || stage.topics || []).map((item: string) => {
                  const key = `${selected.id}_${item}`;
                  const isDone = completedItems.has(key) || completedItems.has(item);
                  return (
                    <div
                      key={item}
                      className="stage-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        background: isDone ? "rgba(16,185,129,0.12)" : "var(--bg-secondary)",
                        borderColor: isDone ? "rgba(16,185,129,0.3)" : "var(--border)"
                      }}
                      onClick={() => stage.problems ? onNavigate("problem", item) : toggleComplete(key)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{stage.problems ? `💡` : `📚`}</span>
                        <span style={{ textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--text-muted)" : "var(--text-primary)" }}>{item}</span>
                      </div>
                      <button
                        onClick={(e) => toggleComplete(key, e)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: "2px 4px",
                          color: isDone ? "var(--accent-green)" : "var(--text-muted)"
                        }}
                        title={isDone ? "Mark as in-progress" : "Mark as completed"}
                      >
                        {isDone ? "✅" : "⬜"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>🗺️ Learning Roadmaps</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28 }}>Structured paths to help you master each domain. Follow step-by-step and track your progress.</p>
      {loading ? (
        <div className="roadmap-grid">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div className="roadmap-grid">
          {(roadmaps || []).map(r => (
            <div key={r.id} className="roadmap-card" onClick={() => setSelected(r)}>
              <div className="roadmap-icon">{r.icon}</div>
              <div className="roadmap-title">{r.title}</div>
              <div className="roadmap-desc">{r.description}</div>
              <div className="roadmap-meta">
                <span>📅 {r.estimatedWeeks} weeks</span>
                <span>·</span>
                <span>{r.stages?.length || 0} stages</span>
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Start Roadmap →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CONTESTS PAGE ────────────────────────────────────────────────────────────