// frontend/src/features/system-design/SystemDesignLearnPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";
import type {
  SDCurriculumPayload,
  SDCurriculumSection,
  SDCurriculumLesson,
} from "../../components/system-design/types";

const LEVEL_COLORS: Record<string, { badge: string; dot: string }> = {
  Beginner: { badge: "badge-easy", dot: "var(--accent-green)" },
  Intermediate: { badge: "badge-blue", dot: "var(--accent-primary)" },
  Advanced: { badge: "badge-medium", dot: "var(--accent-yellow)" },
  Staff: { badge: "badge-hard", dot: "var(--accent-red)" },
};

const DEFAULT_LEVEL_COLOR = { badge: "badge-easy", dot: "var(--accent-green)" };

const LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced", "Staff"] as const;

// ── Lightweight markdown renderer (headers, bold, italic, bullets, code) ─────
function renderMarkdownLine(line: string, key: number) {
  const trimmed = line.trim();
  if (trimmed.startsWith("### ")) return <h5 key={key} style={{ fontSize: 15, fontWeight: 800, margin: "18px 0 6px" }}>{trimmed.slice(4)}</h5>;
  if (trimmed.startsWith("## ")) return <h4 key={key} style={{ fontSize: 17, fontWeight: 800, margin: "20px 0 8px" }}>{trimmed.slice(3)}</h4>;
  if (trimmed.startsWith("# ")) return <h3 key={key} style={{ fontSize: 19, fontWeight: 800, margin: "22px 0 8px" }}>{trimmed.slice(2)}</h3>;
  if (trimmed.startsWith("- ")) return <li key={key} style={{ marginLeft: 18, marginBottom: 4 }}>{trimmed.slice(2)}</li>;
  if (trimmed.startsWith("> ")) {
    return (
      <blockquote
        key={key}
        style={{
          borderLeft: "3px solid var(--accent-primary)",
          background: "var(--bg-tertiary)",
          padding: "8px 12px",
          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          margin: "10px 0",
          fontSize: 13.5,
          lineHeight: 1.5,
        }}
      >
        {trimmed.slice(2)}
      </blockquote>
    );
  }
  if (trimmed.startsWith("`")) {
    return (
      <pre key={key} style={{
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 12px",
        fontSize: 12.5,
        fontFamily: "var(--font-mono)",
        lineHeight: 1.5,
        margin: "10px 0",
        whiteSpace: "pre-wrap",
      }}>{trimmed.replace(/^`+|`+$/g, "").replace(/\\n/g, "\n")}</pre>
    );
  }
  if (!trimmed) return <div key={key} style={{ height: 8 }} />;
  const withBold = trimmed.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
  const withItalic = (parts: React.ReactNode[], idx: number): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    parts.forEach((part, j) => {
      if (typeof part === "string") {
        part.split("*").forEach((p, k) => {
          out.push(k % 2 === 1 ? <em key={`${idx}-${j}-${k}`}>{p}</em> : p);
        });
      } else {
        out.push(part);
      }
    });
    return out;
  };
  return <p key={key} style={{ fontSize: 13.5, lineHeight: 1.65, margin: "6px 0" }}>{withItalic(withBold, key)}</p>;
}

function ContentView({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];
  let inList = false;

  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("- ")) {
      inList = true;
      listBuffer.push(renderMarkdownLine(line, i));
    } else {
      if (inList) {
        elements.push(
          <ul key={`ul-${i}`} style={{ margin: "8px 0", padding: 0, fontSize: 13.5, lineHeight: 1.6 }}>
            {listBuffer}
          </ul>
        );
        listBuffer = [];
        inList = false;
      }
      elements.push(renderMarkdownLine(line, i));
    }
  });
  if (inList) {
    elements.push(<ul key="ul-end" style={{ margin: "8px 0", padding: 0 }}>{listBuffer}</ul>);
  }
  return <div>{elements}</div>;
}

interface QuizState {
  answers: Record<string, number>;
  revealed: boolean;
}

// ── Main Page ───────────────────────────────────────────────────────────────
export function SystemDesignLearnPage({ onToast }: { onToast: (m: string, t?: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<SDCurriculumSection[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({ answers: {}, revealed: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get("/api/v1/system-design/curriculum")
      .then((r: any) => {
        if (!mounted) return;
        const payload: SDCurriculumPayload = r.data?.curriculum ? r.data : { curriculum: [], totalLessons: 0 };
        setSections(payload.curriculum || []);
        setTotalLessons(payload.totalLessons || 0);
        const first = payload.curriculum?.[0]?.lessons?.[0];
        if (first) setSelectedLesson(first.id);
      })
      .catch(() => {
        if (mounted) setSections([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const completedCount = useMemo(
    () => sections.reduce((acc, s) => acc + s.lessons.filter(l => l.completed).length, 0),
    [sections]
  );

  const allLessons = useMemo(
    () => sections.flatMap(s => s.lessons.map(l => ({ section: s, lesson: l }))),
    [sections]
  );

  const currentLesson = useMemo(
    () => allLessons.find(x => x.lesson.id === selectedLesson) || null,
    [allLessons, selectedLesson]
  );

  const currentIndex = currentLesson ? allLessons.findIndex(x => x.lesson.id === currentLesson.lesson.id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const goTo = useCallback((id: string) => {
    setSelectedLesson(id);
    setQuizState({ answers: {}, revealed: false });
  }, []);

  const handleComplete = async (score: number | null) => {
    if (!currentLesson) return;
    setSaving(true);
    try {
      await api.post(`/api/v1/system-design/curriculum/lessons/${encodeURIComponent(currentLesson.lesson.id)}/complete`, { score });
      setSections(prev =>
        prev.map(s =>
          s.slug === currentLesson.section.slug
            ? { ...s, lessons: s.lessons.map(l => l.id === currentLesson.lesson.id ? { ...l, completed: true, score } : l) }
            : s
        )
      );
      onToast?.(`Lesson "${currentLesson.lesson.title}" completed! 🎉`, "success");
    } catch {
      onToast?.("Could not save progress right now. Try again in a moment.", "error");
    } finally {
      setSaving(false);
    }
  };

  const quizScore = useMemo(() => {
    if (!currentLesson || quizState.answers[`${currentLesson.lesson.id}_revealed`] === undefined) return null;
    const answers = quizState.answers[currentLesson.lesson.id] !== undefined
      ? { [currentLesson.lesson.id]: quizState.answers[currentLesson.lesson.id] }
      : {};
    const total = currentLesson.lesson.quiz.length;
    const correct = currentLesson.lesson.quiz.filter(q => answers[currentLesson.lesson.id] === q.correct).length;
    return total ? Math.round((correct / total) * 100) : null;
  }, [currentLesson, quizState]);

  if (loading) return <StateView type="loading" title="Loading System Design Curriculum…" />;

  if (!sections.length) {
    return (
      <StateView
        type="error"
        title="Curriculum unavailable."
        description="The system design server endpoint could not be reached. Make sure the backend is running."
      />
    );
  }

  return (
    <div className="container" style={{ maxWidth: 1500, padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🎓</span>
            <span>System Design — Step-by-Step Path</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            From first principles to staff-level mastery. Complete lessons in order, take the quiz, and track your progress.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="card" style={{ padding: "10px 16px", minWidth: 170 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Course Progress</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{completedCount} / {totalLessons || allLessons.length} <span style={{ fontSize: 12, color: "var(--text-muted)" }}>lessons</span></div>
            <div style={{ height: 5, background: "var(--bg-tertiary)", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalLessons ? (completedCount / totalLessons) * 100 : 0}%`, background: "var(--accent-green)", borderRadius: 3 }} />
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (!window.confirm("Reset all system design progress for your account?")) return;
              api.post("/api/v1/system-design/curriculum/reset", {})
                .then(() => setSections(prev => prev.map(s => ({ ...s, lessons: s.lessons.map(l => ({ ...l, completed: false, score: null })) }))))
                .then(() => onToast?.("Progress reset", "info"))
                .catch(() => onToast?.("Reset failed", "error"));
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 22, alignItems: "start" }}>
        {/* ── Sidebar: step-by-step path ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100vh - 220px)", overflowY: "auto", paddingRight: 4 }}>
          {sections.map((section) => {
            const done = section.lessons.filter(l => l.completed).length;
            const pct = section.lessons.length ? Math.round((done / section.lessons.length) * 100) : 0;
            const levelColor = LEVEL_COLORS[section.level] ?? DEFAULT_LEVEL_COLOR;
            return (
              <div key={section.slug} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", flexShrink: 0,
                  }}>{section.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 13.5 }}>Step {section.order}. {section.title}</strong>
                      <span className={`badge ${levelColor.badge}`} style={{ fontSize: 9.5 }}>{section.level}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{done}/{section.lessons.length} lessons · {pct}%</div>
                    <div style={{ height: 4, background: "var(--bg-tertiary)", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: levelColor.dot, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--border-light)" }}>
                  {section.lessons.map((lesson, li) => {
                    const active = selectedLesson === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => goTo(lesson.id)}
                        style={{
                          display: "flex", gap: 9, alignItems: "center", width: "100%", textAlign: "left", padding: "8px 14px",
                          background: active ? "var(--bg-tertiary)" : "transparent", border: "none", cursor: "pointer",
                          borderLeft: active ? "3px solid var(--accent-primary)" : "3px solid transparent",
                          fontSize: 12.5, color: active ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        <span style={{ fontSize: 13, width: 18, textAlign: "center" }}>
                          {lesson.completed ? <span style={{ color: "var(--accent-green)" }}>✓</span> : <span style={{ opacity: 0.35 }}>{li + 1}</span>}
                        </span>
                        <span style={{ flex: 1, fontWeight: active ? 700 : 500 }}>{lesson.title}</span>
                        <span style={{ fontSize: 10.5, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{lesson.durationMin}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Lesson reader ── */}
        {currentLesson ? (
          <div className="card" style={{ padding: "26px 28px" }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 12, fontWeight: 600 }}>
              {currentLesson.section.icon} {currentLesson.section.title}
              <span style={{ margin: "0 6px" }}>/</span>
              {currentLesson.lesson.title}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
              <div>
                <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.3 }}>
                  {currentLesson.lesson.completed ? "✅ " : ""}{currentLesson.lesson.title}
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{currentLesson.lesson.summary}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={`badge ${LEVEL_COLORS[currentLesson.section.level]?.badge || "badge-easy"}`}>{currentLesson.section.level}</span>
                <span className="badge badge-blue">⏱ {currentLesson.lesson.durationMin} min</span>
              </div>
            </div>

            {/* Lesson content */}
            <div style={{ marginTop: 6 }}>
              <ContentView markdown={currentLesson.lesson.content} />
            </div>

            {/* Key concepts */}
            {currentLesson.lesson.keyConcepts.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>🔑 Key Concepts</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {currentLesson.lesson.keyConcepts.map((c, i) => (
                    <span key={i} style={{ padding: "5px 11px", borderRadius: 20, background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 600 }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            {currentLesson.lesson.checklist.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>✏️ Practice Checklist</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {currentLesson.lesson.checklist.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-secondary)", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)", padding: "7px 11px" }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>▢</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz */}
            {currentLesson.lesson.quiz.length > 0 && (
              <div style={{ marginTop: 26 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>📝 Quick Quiz</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {currentLesson.lesson.quiz.map((q, qi) => {
                    const answer = quizState.answers[`${currentLesson.lesson.id}_${qi}`];
                    const revealed = quizState.revealed;
                    return (
                      <div key={qi} style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", padding: "14px 16px", border: "1px solid var(--border-light)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{qi + 1}. {q.question}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {q.options.map((opt, oi) => {
                            let style: React.CSSProperties = { background: "transparent", border: "1px solid var(--border-light)" };
                            let icon: string | null = null;
                            if (revealed) {
                              if (oi === q.correct) { style = { background: "rgba(63,185,80,0.12)", border: "1px solid var(--accent-green)" }; icon = "✓"; }
                              else if (oi === answer) { style = { background: "rgba(248,81,73,0.10)", border: "1px solid var(--accent-red)" }; icon = "✗"; }
                            } else if (oi === answer) {
                              style = { background: "rgba(63,118,255,0.14)", border: "1px solid var(--accent-primary)" };
                            }
                            return (
                              <button
                                key={oi}
                                disabled={revealed}
                                onClick={() => setQuizState(prev => ({ ...prev, answers: { ...prev.answers, [`${currentLesson!.lesson.id}_${qi}`]: oi } }))}
                                style={{
                                  ...style,
                                  display: "flex", alignItems: "center", gap: 8, textAlign: "left", borderRadius: "var(--radius-sm)",
                                  padding: "8px 11px", fontSize: 13, cursor: revealed ? "default" : "pointer", color: "var(--text-primary)",
                                }}
                              >
                                <span style={{ width: 16, textAlign: "center" }}>{icon}</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                        {revealed && (
                          <div style={{ marginTop: 9, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", padding: "8px 11px" }}>
                            <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>💡 {answer === q.correct ? "Correct. " : ""}</span>{q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  {!quizState.revealed && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setQuizState(prev => ({ ...prev, revealed: true }))}
                    >
                      Check Answers
                    </button>
                  )}
                  {quizState.revealed && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        handleComplete(quizScore);
                      }}
                      disabled={saving}
                    >
                      {currentLesson.lesson.completed ? "✓ Completed — Update" : "Mark Lesson Complete"} →
                    </button>
                  )}
                  {quizState.revealed && quizScore !== null && (
                    <span className="badge" style={{ background: "rgba(63,185,80,0.12)", color: "var(--accent-green)", fontWeight: 700 }}>
                      Score: {quizScore}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Resources */}
            {currentLesson.lesson.resources.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>📚 Further Reading</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {currentLesson.lesson.resources.map((r, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: "var(--text-secondary)", display: "flex", gap: 7, alignItems: "center" }}>
                      <span style={{ color: "var(--accent-primary)" }}>◆</span> {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prev / Next */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 30, borderTop: "1px solid var(--border-light)", paddingTop: 18 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={!prevLesson}
                onClick={() => prevLesson && goTo(prevLesson.lesson.id)}
                style={{ opacity: prevLesson ? 1 : 0.4 }}
              >
                ← {prevLesson?.lesson.title?.slice(0, 34) || "Start"}
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && goTo(nextLesson.lesson.id)}
                style={{ opacity: nextLesson ? 1 : 0.4 }}
              >
                {nextLesson ? `${nextLesson.lesson.title.slice(0, 34)} →` : "🎊 Course Complete!"}
              </button>
            </div>
          </div>
        ) : (
          <StateView type="empty" title="Select a lesson to begin." />
        )}
      </div>
    </div>
  );
}

export default SystemDesignLearnPage;