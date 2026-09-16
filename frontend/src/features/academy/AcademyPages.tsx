import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";
import type { User, CourseSummary, CourseDetail, LessonDetail, QuizData, QuizResult } from "../../types";
import { markdownToHtml } from "../../utils/markdown";
import { LessonCodeRunner } from "../playground/PlaygroundPage";

// ─── PHASE 3: LEARN PAGE ───────────────────────────────────────────────────────

export function LearnPage({ onNavigate, user, onOpenAuth }: {
  onNavigate: (p: string, s?: string) => void;
  user: User | null;
  onOpenAuth: (m: "login" | "signup") => void;
}) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced" | "Enrolled">("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get("/api/v1/courses")
      .then(r => {
        setCourses(r.data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = courses.filter(c => {
    if (filter === "Enrolled") {
      if (!c.isEnrolled) return false;
    } else if (filter !== "All" && c.difficulty !== filter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const enrolledCourses = courses.filter(c => c.isEnrolled);

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <span>📚</span>
              <span>Learning Academy</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 640, lineHeight: 1.6 }}>
              Master Data Structures, Web Engineering, and Scalable System Design with interactive, structured courses and quizzes.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("notes")}>
              📝 My Notes
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("roadmap")}>
              🗺️ Roadmaps
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled Courses "Continue Learning" Banner */}
      {user && enrolledCourses.length > 0 && (
        <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(88, 166, 255, 0.08) 0%, rgba(188, 140, 255, 0.06) 100%)", border: "1px solid rgba(88, 166, 255, 0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Continue Learning</h2>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{enrolledCourses.length} active course{enrolledCourses.length > 1 ? "s" : ""}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {enrolledCourses.map(c => (
              <div key={c.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: 16, cursor: "pointer" }}
                onClick={() => onNavigate("course", c.slug)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 24, width: 38, height: 38, borderRadius: 8, background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.lessonCount} lessons · {c.userProgress ?? 0}% completed</div>
                  </div>
                </div>
                <div className="course-progress-bar">
                  <div className="course-progress-fill" style={{ width: `${c.userProgress ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["All", "Beginner", "Intermediate", "Advanced", ...(user ? ["Enrolled" as const] : [])] as const).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter(f as any)}
            >
              {f === "Enrolled" ? "⚡ Enrolled" : f}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 260 }}>
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search courses or tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="course-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 20px" }}>
          <div className="empty-state-icon">🔍</div>
          <h3>No courses found</h3>
          <p>Try adjusting your search query or filters.</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setFilter("All"); setSearch(""); }}>Clear Filters</button>
        </div>
      ) : (
        <div className="course-grid">
          {filtered.map(c => {
            const diffBadge = c.difficulty === "Beginner" ? "badge-easy" : c.difficulty === "Intermediate" ? "badge-medium" : "badge-hard";
            return (
              <div key={c.id} className="course-card" onClick={() => onNavigate("course", c.slug)}>
                <div className="course-card-header">
                  <div className="course-icon-wrapper">{c.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span className={`badge ${diffBadge}`}>{c.difficulty}</span>
                      <span className="badge badge-purple">⚡ {c.xpReward} XP</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{c.title}</h3>
                  </div>
                </div>

                <div className="course-card-body">
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
                    {c.description}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {c.tags.slice(0, 4).map(t => (
                      <span key={t} className="badge badge-gray" style={{ fontSize: 11 }}>{t}</span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-muted)" }}>
                    <span>📖 {c.lessonCount} Lessons</span>
                    <span>⏱ {c.estimatedHours} Hours</span>
                    <span>👥 {c.enrollmentCount} Enrolled</span>
                  </div>

                  {c.isEnrolled && (
                    <div className="course-progress-container">
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: 700, color: c.isCompleted ? "var(--accent-green)" : "var(--accent-primary)" }}>
                          {c.isCompleted ? "✓ Completed" : `${c.userProgress ?? 0}%`}
                        </span>
                      </div>
                      <div className="course-progress-bar">
                        <div className="course-progress-fill" style={{ width: `${c.userProgress ?? 0}%` }} />
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm w-full">
                      {c.isCompleted ? "Review Course →" : c.isEnrolled ? "Continue Learning →" : "View Curriculum →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Roadmap Promo */}
      <div style={{ marginTop: 48, padding: "36px 32px", background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 44, width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "rgba(88, 166, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>🗺️</div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Structured DSA & Career Roadmaps</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Follow step-by-step roadmaps with problem checklists from beginner to FAANG-ready.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("roadmap")}>
          Explore Roadmaps →
        </button>
      </div>
    </div>
  );
}

// ─── PHASE 3: COURSE DETAIL PAGE ──────────────────────────────────────────────

export function CourseDetailPage({ courseId, onNavigate, user, onToast, onOpenAuth }: {
  courseId: string;
  onNavigate: (p: string, s?: string) => void;
  user: User | null;
  onToast: (msg: string, type: string) => void;
  onOpenAuth: (m: "login" | "signup") => void;
}) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/v1/courses/${courseId}`)
      .then(r => {
        setCourse(r.data.course);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    if (!course) return;
    setEnrolling(true);
    try {
      await api.post(`/api/v1/courses/${course.id}/enroll`, {});
      onToast(`Enrolled in ${course.title}! 🚀`, "success");
      setCourse(prev => prev ? { ...prev, isEnrolled: true } : null);
    } catch (err: any) {
      onToast(err.response?.data?.error || "Enrollment failed", "error");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <div className="skeleton" style={{ height: 220, borderRadius: 16, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2>Course not found</h2>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => onNavigate("learn")}>
          ← Back to Courses
        </button>
      </div>
    );
  }

  const diffBadge = course.difficulty === "Beginner" ? "badge-easy" : course.difficulty === "Intermediate" ? "badge-medium" : "badge-hard";
  const firstIncompleteLesson = course.lessons.find(l => !l.isCompleted) || course.lessons[0];

  return (
    <div className="container" style={{ padding: "28px 24px", maxWidth: 1040 }}>
      {/* Breadcrumb */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => onNavigate("learn")}>
        ← All Courses
      </button>

      {/* Header Banner */}
      <div className="course-detail-header">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: "var(--radius-lg)", background: "var(--bg-tertiary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
            {course.icon}
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <span className={`badge ${diffBadge}`}>{course.difficulty}</span>
              <span className="badge badge-purple">⚡ {course.xpReward} XP Reward</span>
              <span className="badge badge-gray">⏱ {course.estimatedHours} Hours</span>
              <span className="badge badge-gray">📖 {course.lessonCount} Lessons</span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12 }}>
              {course.title}
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
              {course.longDesc}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {course.tags.map(t => (
                <span key={t} className="badge badge-blue" style={{ fontSize: 11 }}>#{t}</span>
              ))}
            </div>

            {/* Action buttons & Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {course.isEnrolled ? (
                <>
                  <button className="btn btn-primary" onClick={() => firstIncompleteLesson && onNavigate("lesson", firstIncompleteLesson.id)}>
                    {course.isCompleted ? "Review Course" : "Continue Learning →"}
                  </button>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                      <span>Course Progress</span>
                      <span style={{ fontWeight: 700, color: course.isCompleted ? "var(--accent-green)" : "var(--accent-primary)" }}>
                        {course.userProgress}%
                      </span>
                    </div>
                    <div className="course-progress-bar">
                      <div className="course-progress-fill" style={{ width: `${course.userProgress}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <button className="btn btn-primary" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? "Enrolling..." : "Enroll for Free 🚀"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Course Curriculum</h2>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {course.lessons.filter(l => l.isCompleted).length} of {course.lessons.length} lessons completed
          </span>
        </div>

        <div className="curriculum-list">
          {course.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className={`lesson-card-item ${lesson.isCompleted ? "completed" : ""}`}
              onClick={() => onNavigate("lesson", lesson.id)}
            >
              <div className="lesson-order-badge">
                {lesson.isCompleted ? "✓" : idx + 1}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>
                  {lesson.title}
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                  <span>⏱ {lesson.estimatedMinutes} mins</span>
                  <span>⚡ +{lesson.xpReward} XP</span>
                  {lesson.hasQuiz && (
                    <span className="badge badge-purple" style={{ fontSize: 10, padding: "1px 6px" }}>
                      🎯 Quiz ({lesson.quizQuestionCount} Qs)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <button className={`btn btn-sm ${lesson.isCompleted ? "btn-secondary" : "btn-primary"}`}>
                  {lesson.isCompleted ? "Review" : "Start"} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 3: LESSON VIEWER PAGE ──────────────────────────────────────────────

export function LessonViewerPage({ lessonId, onNavigate, user, onToast, onOpenAuth }: {
  lessonId: string;
  onNavigate: (p: string, s?: string) => void;
  user: User | null;
  onToast: (msg: string, type: string) => void;
  onOpenAuth: (m: "login" | "signup") => void;
}) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);

  // Helper to extract YouTube video ID from various URL formats
  const getYouTubeEmbedUrl = (url: string | undefined | null): string | null => {
    if (!url) return null;
    try {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const fetchLesson = useCallback(() => {
    setLoading(true);
    api.get(`/api/v1/lessons/${lessonId}`)
      .then(r => {
        setLesson(r.data.lesson);
        // Also fetch course lessons list for sidebar
        if (r.data.lesson?.course?.slug) {
          api.get(`/api/v1/courses/${r.data.lesson.course.slug}`)
            .then(cr => setCourseLessons(cr.data.course.lessons || []))
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lessonId, user]);

  useEffect(() => {
    fetchLesson();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchLesson]);

  const handleMarkComplete = async () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    if (!lesson) return;
    setCompleting(true);
    try {
      const res = await api.post(`/api/v1/lessons/${lesson.id}/complete`, {});
      onToast(`Lesson completed! +${res.data.xpGained} XP 🌟`, "success");
      setLesson(prev => prev ? { ...prev, isCompleted: true } : null);
      if (lesson.nextLesson) {
        onNavigate("lesson", lesson.nextLesson.id);
      }
    } catch (err: any) {
      onToast(err.response?.data?.error || "Failed to mark complete", "error");
    } finally {
      setCompleting(false);
    }
  };

  const embedUrl = getYouTubeEmbedUrl(lesson?.videoUrl);

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <div className="skeleton" style={{ height: 40, width: 240, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 500, borderRadius: 16 }} />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container" style={{ padding: "60px 24px", textAlign: "center" }}>
        <h2>Lesson not found</h2>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => onNavigate("learn")}>
          ← Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-viewer-layout">
      {/* Left Sidebar: Course Curriculum */}
      <aside className="lesson-viewer-sidebar">
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16, justifyContent: "flex-start", padding: "6px 8px" }}
          onClick={() => onNavigate("course", lesson.course.slug)}
        >
          ← {lesson.course.title}
        </button>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.5, marginBottom: 10, textTransform: "uppercase" }}>
          Curriculum
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {courseLessons.map((l: any, i: number) => {
            const isActive = l.id === lesson.id;
            return (
              <button
                key={l.id}
                className={`lesson-sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => onNavigate("lesson", l.id)}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: l.isCompleted ? "rgba(63, 185, 80, 0.15)" : isActive ? "var(--accent-primary)" : "var(--bg-tertiary)",
                  color: l.isCompleted ? "var(--accent-green)" : isActive ? "#000" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0
                }}>
                  {l.isCompleted ? "✓" : i + 1}
                </span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                  {l.title}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Main Viewer */}
      <main className="lesson-viewer-main">
        {/* Lesson Header */}
        <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: 24, marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span className="badge badge-blue">Lesson {lesson.order}</span>
            <span className="badge badge-purple">⚡ +{lesson.xpReward} XP</span>
            <span className="badge badge-gray">⏱ {lesson.estimatedMinutes} mins</span>
            {lesson.isCompleted && (
              <span className="badge badge-easy" style={{ marginLeft: "auto" }}>
                ✓ Completed
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
            {lesson.title}
          </h1>
        </div>

        {/* Interactive Video Player (YouTube or HTML5) */}
        {lesson.videoUrl && (
          <div style={{
            marginBottom: 32,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "#0a0c10",
            border: "1px solid var(--border-light)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
            transition: "all 0.3s ease",
            ...(theaterMode ? {
              position: "relative",
              width: "100%",
              maxWidth: "100%",
              margin: "0 0 32px 0",
            } : {})
          }}>
            {/* Player Top Toolbar */}
            <div style={{
              background: "linear-gradient(90deg, #161b22, #0d1117)",
              padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>🎬</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Video Lecture Player
                </span>
                <span className="badge badge-purple" style={{ fontSize: 10, padding: "2px 8px" }}>
                  HD 1080p
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setTheaterMode(!theaterMode)}
                  title={theaterMode ? "Exit Theater Mode" : "Expand to Theater Mode"}
                  style={{ fontSize: 11, padding: "4px 8px", color: "var(--text-secondary)" }}
                >
                  {theaterMode ? "📱 Standard View" : "📺 Theater Mode"}
                </button>
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, padding: "4px 8px", color: "var(--text-muted)" }}
                  title="Open in YouTube"
                >
                  ↗️ YouTube
                </a>
              </div>
            </div>

            {/* Video Screen */}
            <div style={{ position: "relative", width: "100%", paddingTop: theaterMode ? "60%" : "56.25%", background: "#000" }}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none"
                  }}
                />
              ) : (
                <video
                  controls
                  controlsList="nodownload"
                  src={lesson.videoUrl}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                  }}
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              )}
            </div>
          </div>
        )}

        {/* Markdown Content */}
        <div
          className="markdown-article"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content) }}
        />

        {/* Inline Code Exercise Runner */}
        <LessonCodeRunner lessonId={lesson.id} />

        {/* Bottom Navigation & Completion Controls */}
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            {lesson.prevLesson ? (
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("lesson", lesson.prevLesson!.id)}>
                ← {lesson.prevLesson.title}
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("course", lesson.course.slug)}>
                ← Back to Course
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {lesson.quiz && (
              <button className="btn btn-secondary" onClick={() => setShowQuiz(true)}>
                🎯 Take Quiz ({lesson.quiz.questionCount} Qs)
              </button>
            )}

            <button
              className={`btn ${lesson.isCompleted ? "btn-secondary" : "btn-success"}`}
              onClick={handleMarkComplete}
              disabled={completing}
            >
              {completing ? "Saving..." : lesson.isCompleted ? "✓ Completed (Next →)" : "Mark as Complete & Next →"}
            </button>
          </div>
        </div>
      </main>

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          onClose={() => setShowQuiz(false)}
          onSuccess={() => {
            fetchLesson();
            onToast("Quiz completed and XP awarded! 🎯", "success");
          }}
          user={user}
          onOpenAuth={onOpenAuth}
        />
      )}
    </div>
  );
}

// ─── PHASE 3: QUIZ MODAL ──────────────────────────────────────────────────────

export function QuizModal({ lessonId, lessonTitle, onClose, onSuccess, user, onOpenAuth }: {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
  onOpenAuth: (m: "login" | "signup") => void;
}) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    api.get(`/api/v1/lessons/${lessonId}/quiz`)
      .then(r => {
        setQuiz(r.data.quiz);
        if (r.data.quiz?.questions) {
          setSelectedAnswers(new Array(r.data.quiz.questions.length).fill(-1));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lessonId]);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (result) return; // Locked after submitting
    const next = [...selectedAnswers];
    next[qIdx] = optIdx;
    setSelectedAnswers(next);
  };

  const handleSubmit = async () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    if (selectedAnswers.includes(-1)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/api/v1/lessons/${lessonId}/quiz/submit`, { answers: selectedAnswers });
      setResult(res.data);
      if (res.data.passed) {
        onSuccess();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Quiz submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setResult(null);
    if (quiz) setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Lesson Quiz</div>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>{quiz?.title || lessonTitle}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {loading ? (
            <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
          ) : !quiz ? (
            <p>No quiz found for this lesson.</p>
          ) : result ? (
            /* Result View */
            <div>
              <div style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                background: result.passed ? "rgba(63, 185, 80, 0.1)" : "rgba(248, 81, 73, 0.1)",
                border: `1px solid ${result.passed ? "var(--accent-green)" : "var(--accent-red)"}`,
                textAlign: "center",
                marginBottom: 24
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{result.passed ? "🎉" : "📚"}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: result.passed ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {result.passed ? "Quiz Passed!" : "Keep Practicing!"}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                  You scored <strong>{result.score}</strong> out of <strong>{result.total}</strong> ({result.percentage}%)
                </p>
                {result.xpEarned > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <span className="badge badge-purple" style={{ fontSize: 13, padding: "4px 12px" }}>
                      ⚡ +{result.xpEarned} XP Earned!
                    </span>
                  </div>
                )}
              </div>

              {/* Answers Breakdown */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Answers Breakdown:</h4>
                {result.breakdown.map((item, idx) => (
                  <div key={item.questionId} className="quiz-question-box" style={{ borderColor: item.isCorrect ? "rgba(63, 185, 80, 0.3)" : "rgba(248, 81, 73, 0.3)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 16 }}>{item.isCorrect ? "✅" : "❌"}</span>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{idx + 1}. {item.question}</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                      {item.options.map((opt, optIdx) => {
                        const isChosen = item.userAnswer === optIdx;
                        const isAnswer = item.correctAnswer === optIdx;
                        return (
                          <div key={optIdx} className={`quiz-option-btn ${isAnswer ? "correct" : isChosen && !item.isCorrect ? "incorrect" : ""}`} style={{ cursor: "default" }}>
                            <span style={{ fontWeight: 700 }}>{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                            {isAnswer && <span style={{ marginLeft: "auto", fontSize: 11 }}>✓ Correct</span>}
                            {isChosen && !isAnswer && <span style={{ marginLeft: "auto", fontSize: 11 }}>✗ Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <div style={{ padding: "8px 12px", background: "var(--bg-tertiary)", borderRadius: 6, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        💡 <strong>Explanation:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="btn btn-secondary" onClick={resetQuiz}>🔄 Retake Quiz</button>
                <button className="btn btn-primary" onClick={onClose}>Done</button>
              </div>
            </div>
          ) : (
            /* Questions View */
            <div>
              <div style={{ marginBottom: 16, fontSize: 13, color: "var(--text-muted)" }}>
                Score 70% or higher to pass and unlock full XP rewards.
              </div>

              {quiz.questions.map((q, qIdx) => (
                <div key={q.id} className="quiz-question-box">
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                    {qIdx + 1}. {q.question}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          className={`quiz-option-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelect(qIdx, optIdx)}
                        >
                          <span style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: isSelected ? "var(--accent-primary)" : "var(--bg-primary)",
                            color: isSelected ? "#000" : "var(--text-secondary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, flexShrink: 0
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="modal-footer" style={{ margin: "0 -24px -20px", padding: "16px 24px" }}>
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting || selectedAnswers.includes(-1)}
                >
                  {submitting ? "Grading..." : "Submit Answers →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PHASE 3: NOTES PAGE ──────────────────────────────────────────────────────