import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";
import type { User, ProblemDetail, Submission, TestResult } from "../../types";
import { markdownToHtml } from "../../utils/markdown";
import { LANGUAGE_OPTIONS } from "../../utils/languages";


export function ProblemDetailPage({ problemId, user, onToast }: {
  problemId: string; user: User | null; onToast: (msg: string, type: string) => void;
}) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("py");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [runResult, setRunResult] = useState<any>(null);
  const [runIsCustom, setRunIsCustom] = useState(false);
  const [polling, setPolling] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "hints" | "editorial" | "submissions" | "discuss" | "ai" | "debugger">("desc");
  const [showHints, setShowHints] = useState<boolean[]>([]);
  const [fontSize, setFontSize] = useState(14);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [outputTab, setOutputTab] = useState<"testcase" | "result">("testcase");
  const [problemSubmissions, setProblemSubmissions] = useState<Submission[]>([]);
  const [subFilterStatus, setSubFilterStatus] = useState("");
  const [subFilterLang, setSubFilterLang] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiProgressiveHint, setAiProgressiveHint] = useState<{ text: string; level: number } | null>(null);
  const [aiGeneratedTests, setAiGeneratedTests] = useState<any[]>([]);
  const [aiTutorPrompt, setAiTutorPrompt] = useState("");
  const [aiTutorChat, setAiTutorChat] = useState<Array<{ role: string; text: string }>>([
    { role: "assistant", text: "Hello! I'm your AI Algorithmic Tutor. Ask me anything about intuition, time complexity, edge cases, or test cases." }
  ]);
  const [problemDiscussions, setProblemDiscussions] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Approach");
  const [discussLoading, setDiscussLoading] = useState(false);
  const [debugSession, setDebugSession] = useState<any>(null);
  const [debugStepIdx, setDebugStepIdx] = useState(0);
  const [debugLoading, setDebugLoading] = useState(false);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [compareModal, setCompareModal] = useState<{ sub1: Submission; sub2: Submission } | null>(null);
  const [viewCodeModal, setViewCodeModal] = useState<Submission | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasImplementation = () => {
    const starter = problem ? (problem.templates as any)?.[language] : "";
    const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
    return Boolean(code.trim()) && normalize(code) !== normalize(starter || "");
  };

  const loadDiscussions = useCallback(() => {
    setDiscussLoading(true);
    api.get(`/api/v1/social/discussions?problemId=${problemId}`).then(r => {
      setProblemDiscussions(r.data?.discussions || []);
      setDiscussLoading(false);
    }).catch(() => setDiscussLoading(false));
  }, [problemId]);

  useEffect(() => {
    if (activeTab === "discuss") {
      loadDiscussions();
    }
  }, [activeTab, loadDiscussions]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onToast("Sign in to start a discussion", "warning"); return; }
    if (!newPostTitle.trim() || !newPostContent.trim()) { onToast("Title and content are required", "error"); return; }
    try {
      await api.post("/api/v1/social/discussions", {
        problemId,
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        codeSnippet: code,
        language
      });
      setNewPostTitle("");
      setNewPostContent("");
      onToast("Discussion thread posted! 💬", "success");
      loadDiscussions();
    } catch {
      onToast("Failed to post discussion", "error");
    }
  };

  const askAiTutor = async (action: "explain" | "debug" | "optimize" | "generate-tests" | "custom") => {
    if (!code.trim() && action !== "generate-tests") {
      onToast("Please write some code first", "error");
      return;
    }
    setAiLoading(true);
    try {
      if (action === "explain") {
        const res = await api.post("/api/v1/ai/explain", { code, language });
        setAiAnalysis(res.data.explanation);
        setAiTutorChat(prev => [...prev, { role: "user", text: "Explain my solution & Big-O complexity" }, { role: "assistant", text: res.data.explanation }]);
        onToast("AI Code Explanation ready! 🤖", "success");
      } else if (action === "debug") {
        const res = await api.post("/api/v1/ai/debug", { code, language, error: runResult?.error || "" });
        setAiAnalysis(res.data.debug);
        setAiTutorChat(prev => [...prev, { role: "user", text: "Debug my code and identify errors" }, { role: "assistant", text: res.data.debug }]);
        onToast("AI Debug analysis ready! 🐞", "success");
      } else if (action === "optimize") {
        const res = await api.post("/api/v1/ai/optimize", { code, language, targetComplexity: "O(N)" });
        setAiAnalysis(res.data.optimization);
        setAiTutorChat(prev => [...prev, { role: "user", text: "Optimize code for best runtime complexity" }, { role: "assistant", text: res.data.optimization }]);
        onToast("AI Optimization roadmap ready! ⚡", "success");
      } else if (action === "generate-tests") {
        const res = await api.post("/api/v1/ai/generate-tests", { problemTitle: problem?.title || "Problem" });
        setAiGeneratedTests(res.data.testCases || []);
        onToast("Synthetic edge-case tests generated! 🧪", "success");
      } else if (action === "custom" && aiTutorPrompt.trim()) {
        const q = aiTutorPrompt;
        setAiTutorPrompt("");
        setAiTutorChat(prev => [...prev, { role: "user", text: q }]);
        const res = await api.post("/api/v1/ai/chat", { prompt: q, code, language });
        setAiTutorChat(prev => [...prev, { role: "assistant", text: res.data.reply }]);
      }
    } catch {
      onToast("Failed to communicate with AI Tutor", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const startDebugger = async () => {
    if (!code.trim()) { onToast("Write code to debug", "error"); return; }
    setDebugLoading(true);
    try {
      const res = await api.post("/api/v1/debugger/trace", { code, language });
      setDebugSession(res.data);
      setDebugStepIdx(0);
      setActiveTab("debugger");
      onToast(`Trace recorded: ${res.data.totalSteps} steps captured 🔍`, "success");
    } catch {
      onToast("Failed to initialize debug session", "error");
    } finally {
      setDebugLoading(false);
    }
  };

  const fetchAiExplanation = async () => {
    if (!code.trim()) { onToast("Write code to analyze", "error"); return; }
    setAiLoading(true);
    try {
      const res = await api.post("/api/v1/ai/explain", { code, language });
      setAiAnalysis(res.data.explanation);
      onToast("AI Code Explanation ready! 🤖", "success");
    } catch {
      onToast("Failed to fetch AI explanation", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchAiHint = async (level: number) => {
    setAiLoading(true);
    try {
      const res = await api.post("/api/v1/ai/hint", {
        problemTitle: problem?.title || "Problem",
        hintLevel: level
      });
      setAiProgressiveHint({ text: res.data.hint, level });
      onToast(`Level ${level} AI Hint unlocked! 💡`, "success");
    } catch {
      onToast("Failed to fetch AI hint", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1243);

  useEffect(() => {
    if (problem) {
      setLikeCount(problem.solveCount ? problem.solveCount * 3 + 12 : 1243);
      if (user) {
        api.get(`/api/v1/problems/liked`).then(r => {
          const isLiked = (r.data.liked || []).some((p: any) => String(p.id) === String(problemId));
          setLiked(isLiked);
        }).catch(() => {});
      }
    }
  }, [problem, problemId, user]);

  const handleToggleLike = async () => {
    if (!user) { onToast("Sign in to like problems", "warning"); return; }
    try {
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikeCount(c => nextLiked ? c + 1 : Math.max(0, c - 1));
      await api.post(`/api/v1/problems/${problemId}/like`, {});
      onToast(nextLiked ? "Problem added to your favorites! ❤️" : "Problem removed from favorites", "info");
    } catch {
      onToast("Failed to update like status", "error");
    }
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/api/v1/problems/${problemId}`).then(r => {
      const p = r.data.problem;
      setProblem(p);
      setCode((p.templates as any)[language] || "");
      setShowHints(new Array((p.hints || []).length).fill(false));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [problemId]);

  const lastProblemTemplateRef = useRef<string>("");
  useEffect(() => {
    if (!problem) return;
    const nextTemplate = (problem.templates as any)[language] || "";
    // Don't wipe code the user has already edited — only swap the scaffold
    // when the editor still holds the previous template (or is empty).
    setCode((prev) => {
      if (!prev.trim() || prev === lastProblemTemplateRef.current) {
        lastProblemTemplateRef.current = nextTemplate;
        return nextTemplate;
      }
      lastProblemTemplateRef.current = nextTemplate;
      return prev;
    });
  }, [language, problem]);

  // Load problem submissions when tab switches or filters change
  const loadSubmissions = useCallback(() => {
    if (user) {
      let query = `/api/v1/problems/${problemId}/submissions?limit=50`;
      if (subFilterStatus) query += `&status=${subFilterStatus}`;
      if (subFilterLang) query += `&language=${subFilterLang}`;
      api.get(query).then(r => {
        setProblemSubmissions(r.data.submissions || []);
      }).catch(() => {});
    }
  }, [problemId, user, subFilterStatus, subFilterLang]);

  useEffect(() => {
    if (activeTab === "submissions") {
      loadSubmissions();
    }
  }, [activeTab, loadSubmissions]);

  const [liveStreamEvents, setLiveStreamEvents] = useState<any[]>([]);

  const handleSubmit = async () => {
    if (!hasImplementation()) { onToast("Complete the function implementation before submitting.", "error"); return; }
    setSubmitting(true); setSubmission(null); setRunResult(null); setOutputTab("result");
    setLiveStreamEvents([]);
    try {
      const { data } = await api.post("/api/v1/submissions", { problemId, code, language });
      const subId = data?.id;
      if (!subId) {
        setSubmitting(false);
        onToast(data?.error || "Submission failed to initialize", "error");
        return;
      }

      setPolling(true);

      // Connect to Real-time Judge Stream (SSE)
      try {
        const eventSource = new EventSource(`${API}/api/v1/submissions/stream/${subId}`);
        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.done) {
              isCancelled = true;
              eventSource.close();
            } else {
              setLiveStreamEvents(prev => [...prev, payload]);
            }
          } catch {}
        };
        eventSource.onerror = () => {
          eventSource.close();
        };
      } catch {}

      let isCancelled = false;
      let attempts = 0;
      const poll = async () => {
        if (isCancelled) return;
        attempts++;
        try {
          const { data: res } = await api.get(`/api/v1/submissions/${subId}`);
          const sub = res?.submission;
          if (sub && (sub.status === "Processing" || sub.status === "Pending") && attempts < 25) {
            setTimeout(poll, 1000);
          } else if (sub) {
            isCancelled = true;
            setSubmission(sub);
            setPolling(false);
            setSubmitting(false);
            const s = sub.status;
            if (s === "Success" || s === "Accepted") onToast(`✅ Accepted! All tests passed`, "success");
            else if (s === "WrongAnswer" || s === "Wrong Answer") onToast("❌ Wrong Answer", "error");
            else if (s === "TLE") onToast("⏱️ Time Limit Exceeded", "error");
            else onToast(`❌ ${s}`, "error");
            loadSubmissions();
          } else if (attempts < 25) {
            setTimeout(poll, 1000);
          } else {
            isCancelled = true;
            setPolling(false);
            setSubmitting(false);
            onToast("Submission timed out", "error");
          }
        } catch {
          if (attempts < 25) {
            setTimeout(poll, 1000);
          } else {
            isCancelled = true;
            setPolling(false);
            setSubmitting(false);
            onToast("Error checking submission verdict", "error");
          }
        }
      };
      setTimeout(poll, 800);
    } catch (err: any) {
      setSubmitting(false);
      onToast(err?.response?.data?.error || "Submission failed", "error");
    }
  };

  const handleRun = async () => {
    if (!hasImplementation()) { onToast("Complete the function implementation before running.", "error"); return; }
    setRunning(true); setRunResult(null); setOutputTab("result");
    const isCustom = activeTestCase === (problem?.testCases?.filter(tc => !tc.isHidden).length ?? 0);
    const input = isCustom ? customInput : problem?.testCases?.[activeTestCase]?.input || "";
    const expected = isCustom ? "" : problem?.testCases?.[activeTestCase]?.output || "";
    setRunIsCustom(isCustom);
    try {
      const { data } = await api.post("/api/v1/submissions/run", {
        problemId, code, language, input, expectedOutput: expected
      });
      setRunResult({ ...data.result, input });
    } catch (err: any) {
      setRunResult({ error: err?.response?.data?.error || "Run failed" });
    } finally {
      setRunning(false);
    }
  };

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart; const end = el.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2; }, 0);
    }
    // Ctrl+Enter = Run, Ctrl+Shift+Enter = Submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) handleSubmit();
      else handleRun();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => onToast("Code copied!", "success"));
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 56px)" }}><div className="animate-spin" style={{ fontSize: 32 }}>⚙</div></div>;
  if (!problem) return <div className="empty-state"><div className="empty-state-icon">❓</div><h3>Problem not found</h3></div>;

  const langs = LANGUAGE_OPTIONS.map(l => ({ value: l.key, label: l.label }));

  const visibleTestCases = problem.testCases?.filter(tc => !tc.isHidden) || [];
  const statusColor = !submission ? "" : submission.status === "Success" ? "var(--accent-green)" : submission.status === "TLE" ? "var(--accent-orange)" : "var(--accent-red)";
  const statusIcon = !submission ? "" : submission.status === "Success" ? "✅" : submission.status === "TLE" ? "⏱️" : "❌";

  const subStatusColor = (s: string) => s === "Success" ? "var(--accent-green)" : s === "TLE" ? "var(--accent-orange)" : "var(--accent-red)";
  const subStatusIcon = (s: string) => s === "Success" ? "✅" : s === "TLE" ? "⏱️" : "❌";

  return (
    <div className="problem-detail-layout">
      {/* Left: Problem */}
      <div className="problem-pane">
        <div className="problem-pane-header">
          <span className={`badge badge-${(problem.difficulty ?? "medium").toLowerCase()}`}>{problem.difficulty}</span>
          <span className="badge badge-gray">{problem.category}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
            {user && ["ADMIN", "INSTRUCTOR", "DEVELOPER", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "CONTEST_ADMIN"].includes(user.role) && (
              <button
                onClick={async () => {
                  try {
                    const isPub = (problem as any).status === "Published" || (problem as any).status === undefined;
                    const endpoint = isPub ? `/api/v1/admin/problems/${problemId}/unpublish` : `/api/v1/admin/problems/${problemId}/publish`;
                    await api.post(endpoint, {});
                    const newStatus = isPub ? "Draft" : "Published";
                    setProblem(p => p ? { ...p, status: newStatus } as any : p);
                    onToast(isPub ? "Problem moved to Draft ⬇️" : "Problem published live! 🚀", "success");
                  } catch (err: any) {
                    onToast(err.response?.data?.error || "Status update failed", "error");
                  }
                }}
                className={`btn btn-sm ${(problem as any).status === "Draft" ? "btn-primary" : "btn-secondary"}`}
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  fontWeight: 700,
                  borderRadius: 16
                }}
                title={(problem as any).status === "Draft" ? "Click to publish this problem live" : "Click to unpublish problem"}
              >
                {(problem as any).status === "Draft" ? "🚀 Publish Problem" : "⬇️ Move to Draft"}
              </button>
            )}

            <button
              onClick={handleToggleLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: liked ? "rgba(248,81,73,0.12)" : "var(--bg-tertiary)",
                border: liked ? "1px solid rgba(248,81,73,0.35)" : "1px solid var(--border-light)",
                color: liked ? "var(--accent-red)" : "var(--text-secondary)",
                borderRadius: 20,
                padding: "3px 10px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                transition: "all 0.15s ease"
              }}
              title={liked ? "Liked! Click to remove" : "Like this problem"}
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span>{liked ? "Liked" : "Like"}</span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>({likeCount.toLocaleString()})</span>
            </button>
            <span>✅ {problem.solveCount}</span>
            <span>📝 {problem.attemptCount}</span>
          </div>
        </div>

        <div className="tabs" style={{ padding: "0 16px", marginBottom: 0, overflowX: "auto", whiteSpace: "nowrap", flexShrink: 0, gap: 4 }}>
          <button className={`tab ${activeTab === "desc" ? "active" : ""}`} onClick={() => setActiveTab("desc")}>
            📄 Description
          </button>
          {problem.hints?.length > 0 && (
            <button className={`tab ${activeTab === "hints" ? "active" : ""}`} onClick={() => setActiveTab("hints")}>
              💡 Hints
            </button>
          )}
          {problem.editorial && (
            <button className={`tab ${activeTab === "editorial" ? "active" : ""}`} onClick={() => setActiveTab("editorial")}>
              📖 Editorial
            </button>
          )}
          <button className={`tab ${activeTab === "submissions" ? "active" : ""}`} onClick={() => setActiveTab("submissions")}>
            📊 Submissions
          </button>
          <button className={`tab ${activeTab === "discuss" ? "active" : ""}`} onClick={() => setActiveTab("discuss")}>
            💬 Discuss
          </button>
          <button className={`tab ${activeTab === "ai" ? "active" : ""}`} onClick={() => setActiveTab("ai")}>
            ✨ AI Tutor
          </button>
          <button className={`tab ${activeTab === "debugger" ? "active" : ""}`} onClick={() => { if (!debugSession) startDebugger(); else setActiveTab("debugger"); }}>
            🐞 Debugger
          </button>
        </div>

        <div className="problem-body">
          {activeTab === "desc" && (
            <div>
              <h1>{problem.title}</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {problem.tags.map(t => <span key={t} className="badge badge-blue">{t}</span>)}
              </div>
              <div
                className="problem-description-content"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(problem.description || `Solve the problem **${problem.title}**. Implement an optimal algorithm considering both time and space complexities.`) }}
              />
              <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)" }}>
                ⏱ Time Limit: {problem.timeLimit ? (problem.timeLimit / 1000).toFixed(1) : "1.0"}s &nbsp;·&nbsp; 💾 Memory Limit: {problem.memoryLimit || 256}MB
              </div>
              {problem.companies?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>ASKED BY</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {problem.companies.map(c => <span key={c} className="company-tag">{c}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "hints" && (
            <div>
              <h3 style={{ marginBottom: 16 }}>💡 Hints</h3>
              {problem.hints.map((h, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <button className="btn btn-secondary btn-sm" style={{ marginBottom: 8 }}
                    onClick={() => { const arr = [...showHints]; arr[i] = !arr[i]; setShowHints(arr); }}>
                    {showHints[i] ? "🙈 Hide" : "👁️ Show"} Hint {i + 1}
                  </button>
                  {showHints[i] && <div className="hint-box">{h}</div>}
                </div>
              ))}
            </div>
          )}
          {activeTab === "editorial" && problem.editorial && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📖 Official Solution & Editorial</span>
                  <span className="badge badge-green">Verified</span>
                </h3>
                {user && (
                  <span style={{ fontSize: 11, color: "var(--accent-green)", fontWeight: 600 }}>
                    🔓 Unlocked for you
                  </span>
                )}
              </div>
              <div className="card" style={{ padding: 18, background: "var(--bg-secondary)", lineHeight: 1.6 }}>
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(problem.editorial) }} />
              </div>
            </div>
          )}
          {activeTab === "submissions" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>📜 Submission History</h3>
                {selectedSubIds.length === 2 && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      const sub1 = problemSubmissions.find(s => s.id === selectedSubIds[0]);
                      const sub2 = problemSubmissions.find(s => s.id === selectedSubIds[1]);
                      if (sub1 && sub2) setCompareModal({ sub1, sub2 });
                    }}
                  >
                    🔍 Compare Selected (2)
                  </button>
                )}
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <select className="select" style={{ fontSize: 12 }} value={subFilterStatus} onChange={e => setSubFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Success">Accepted (AC)</option>
                  <option value="WrongAnswer">Wrong Answer (WA)</option>
                  <option value="TLE">Time Limit Exceeded (TLE)</option>
                  <option value="CompileError">Compilation Error (CE)</option>
                  <option value="RuntimeError">Runtime Error (RE)</option>
                </select>
                <select className="select" style={{ fontSize: 12 }} value={subFilterLang} onChange={e => setSubFilterLang(e.target.value)}>
                  <option value="">All Languages</option>
                  {LANGUAGE_OPTIONS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>

              {!user && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Sign in to see your submission history.</div>}
              {user && problemSubmissions.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No submissions match the selected filters.</div>}
              {user && problemSubmissions.map(s => {
                const isSelected = selectedSubIds.includes(s.id);
                return (
                  <div key={s.id} className="sub-history-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          setSelectedSubIds(prev => prev.filter(id => id !== s.id));
                        } else {
                          if (selectedSubIds.length >= 2) {
                            setSelectedSubIds([selectedSubIds[1]!, s.id]);
                          } else {
                            setSelectedSubIds(prev => [...prev, s.id]);
                          }
                        }
                      }}
                      title="Select 2 submissions to compare diff"
                    />
                    <span style={{ color: subStatusColor(s.status), fontWeight: 600, fontSize: 13, minWidth: 120 }}>
                      {subStatusIcon(s.status)} {s.status === "Success" ? "Accepted" : s.status}
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{s.language.toUpperCase()}</span>
                    {s.runtime != null && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>⏱ {s.runtime.toFixed(0)}ms</span>}
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                    
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => setViewCodeModal(s)} title="View Code">👁️ Code</button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => {
                        setCode(s.code); setLanguage(s.language); setActiveTab("desc"); onToast("Loaded past submission into editor", "info");
                      }} title="Load code into editor">↺ Re-run</button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => {
                        const url = `${window.location.origin}/submissions/${s.id}`;
                        navigator.clipboard.writeText(url);
                        onToast("Shareable submission link copied! 🔗", "success");
                      }} title="Share submission link">🔗 Share</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === "discuss" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>💬 Problem Discussions</h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Ask questions, share alternative algorithms, and discuss edge cases with the community.</div>
                </div>
              </div>

              {/* Post Creation Form */}
              <div className="card" style={{ padding: 14, marginBottom: 16, background: "var(--bg-secondary)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Start a Discussion Thread</div>
                <form onSubmit={handleCreatePost}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      className="input"
                      style={{ flex: 1, fontSize: 13 }}
                      placeholder="Title (e.g., How to optimize space to O(1)?)"
                      value={newPostTitle}
                      onChange={e => setNewPostTitle(e.target.value)}
                    />
                    <select
                      className="select"
                      style={{ fontSize: 12 }}
                      value={newPostCategory}
                      onChange={e => setNewPostCategory(e.target.value)}
                    >
                      <option value="Approach">💡 Approach</option>
                      <option value="Optimization">⚡ Optimization</option>
                      <option value="Bug">🐞 Bug / Help</option>
                      <option value="Question">❓ Question</option>
                    </select>
                  </div>
                  <textarea
                    className="input"
                    rows={3}
                    style={{ width: "100%", fontSize: 12.5, fontFamily: "var(--font-sans)", marginBottom: 8 }}
                    placeholder="Describe your thoughts or questions. Your current editor code will automatically be attached!"
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>📎 Code attachment enabled ({language})</span>
                    <button type="submit" className="btn btn-primary btn-sm">Post to Community 🚀</button>
                  </div>
                </form>
              </div>

              {/* Discussions List */}
              {discussLoading ? (
                <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />
              ) : problemDiscussions.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <div className="empty-state-icon">💭</div>
                  <h4>No discussions yet</h4>
                  <p>Be the first to share an approach or ask a question about this problem!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {problemDiscussions.map((d: any) => (
                    <div key={d.id} className="card" style={{ padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="badge badge-purple" style={{ fontSize: 10 }}>{d.category}</span>
                          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{d.title}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>
                        {d.content}
                      </div>
                      {d.codeSnippet && (
                        <pre style={{ margin: "6px 0 8px", padding: 8, background: "var(--bg-tertiary)", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", overflowX: "auto" }}>
                          {d.codeSnippet}
                        </pre>
                      )}
                      <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "var(--text-muted)", alignItems: "center" }}>
                        <span>👤 @{d.username}</span>
                        <span>▲ {d.upvotes} upvotes</span>
                        <span>💬 {d.commentCount} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🤖 Real AI Algorithmic Tutor</span>
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>Claude Opus Thinking</span>
                  </h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Full AI Tutor with Explain, Hint, Debug, Optimize, Complexity, & Synthetic Test Generation.
                  </div>
                </div>
              </div>

              {/* Tutor Action Palette */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 14 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5 }}
                  onClick={() => askAiTutor("explain")}
                  disabled={aiLoading}
                  title="Detailed Big-O complexity & code structure breakdown"
                >
                  🔍 Explain & Big-O
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5 }}
                  onClick={() => askAiTutor("debug")}
                  disabled={aiLoading}
                  title="Analyze errors and logic bugs"
                >
                  🐞 AI Debug
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5 }}
                  onClick={() => askAiTutor("optimize")}
                  disabled={aiLoading}
                  title="Get asymptotic optimization roadmap"
                >
                  ⚡ Optimize Code
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5 }}
                  onClick={() => askAiTutor("generate-tests")}
                  disabled={aiLoading}
                  title="Generate tricky edge case inputs"
                >
                  🧪 Generate Tests
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5 }}
                  onClick={() => fetchAiHint(1)}
                  disabled={aiLoading}
                  title="Level 1 intuition"
                >
                  💡 Hint 1 (Intuition)
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5 }}
                  onClick={() => fetchAiHint(2)}
                  disabled={aiLoading}
                  title="Level 2 data structure selection"
                >
                  💡 Hint 2 (Data Structure)
                </button>
              </div>

              {/* Synthetic Generated Test Cases Display */}
              {aiGeneratedTests.length > 0 && (
                <div className="card" style={{ marginBottom: 14, background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--accent-green)", marginBottom: 6 }}>
                    🧪 AI Generated Edge-Case Test Cases:
                  </div>
                  {aiGeneratedTests.map((tc, idx) => (
                    <div key={idx} style={{ fontSize: 12, padding: "4px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>Input: {tc.input} ➔ Expected: {tc.expected}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{tc.explanation}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Progressive Hint Display */}
              {aiProgressiveHint && (
                <div className="card" style={{ marginBottom: 14, background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.3)", padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 4, color: "var(--accent-primary)" }}>
                    💡 Progressive Hint (Level {aiProgressiveHint.level}):
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-primary)" }}>
                    {aiProgressiveHint.text}
                  </div>
                </div>
              )}

              {/* AI Interactive Chat Stream */}
              <div className="card" style={{ padding: 12, background: "var(--bg-secondary)", maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
                {aiTutorChat.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "90%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: msg.role === "user" ? "var(--accent-primary)" : "var(--bg-tertiary)",
                      color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                      fontSize: 12.5,
                      lineHeight: 1.5
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }} />
                    ) : (
                      msg.text
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="animate-spin">⚙</span> AI Tutor is thinking...
                  </div>
                )}
              </div>

              {/* Custom Prompt Input */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  askAiTutor("custom");
                }}
                style={{ display: "flex", gap: 6 }}
              >
                <input
                  className="input"
                  style={{ flex: 1, fontSize: 12.5 }}
                  placeholder="Ask a custom question about your code or this problem..."
                  value={aiTutorPrompt}
                  onChange={e => setAiTutorPrompt(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={aiLoading || !aiTutorPrompt.trim()}>
                  Ask Tutor 💬
                </button>
              </form>
            </div>
          )}

          {activeTab === "debugger" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🐞 Visual Execution Debugger</span>
                    <span className="badge badge-blue">Step Inspector</span>
                  </h3>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Step through AST frames, inspect memory variables, and rewind execution pointers.
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={startDebugger} disabled={debugLoading}>
                  {debugLoading ? "⏳ Tracing..." : "🔄 Re-Trace"}
                </button>
              </div>

              {debugSession && Array.isArray(debugSession.steps) && debugSession.steps.length > 0 ? (() => {
                const currentStep = debugSession.steps[Math.min(Math.max(0, debugStepIdx), debugSession.steps.length - 1)] || debugSession.steps[0] || {};
                return (
                  <div>
                    {/* Step Navigator Bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 14 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDebugStepIdx(0)}
                        disabled={debugStepIdx === 0}
                        title="Rewind to start"
                      >
                        ⏮ First
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDebugStepIdx(s => Math.max(0, s - 1))}
                        disabled={debugStepIdx === 0}
                        title="Step Backward"
                      >
                        ◀ Prev
                      </button>
                      <div style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 13 }}>
                        Step {Math.min(debugStepIdx + 1, debugSession.steps.length)} of {debugSession.steps.length} &nbsp;·&nbsp;
                        <span style={{ color: "var(--accent-primary)" }}>Line {currentStep?.line ?? 1}</span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setDebugStepIdx(s => Math.min(debugSession.steps.length - 1, s + 1))}
                        disabled={debugStepIdx >= debugSession.steps.length - 1}
                        title="Step Forward"
                      >
                        Next ▶
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDebugStepIdx(debugSession.steps.length - 1)}
                        disabled={debugStepIdx >= debugSession.steps.length - 1}
                        title="Jump to End"
                      >
                        ⏭ Last
                      </button>
                    </div>

                    {/* Call Stack & Variable Watch Window */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div className="card" style={{ padding: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                          🥞 Call Stack
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {(currentStep?.callStack || ["main()"]).map((frame: string, idx: number) => (
                            <div key={idx} style={{ padding: "6px 8px", background: "var(--bg-tertiary)", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                              ▸ {frame}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card" style={{ padding: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                          👁️ Variable Watch Window
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 160, overflowY: "auto" }}>
                          {Object.entries(currentStep?.variables || {}).map(([key, val]: any) => (
                            <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "var(--bg-tertiary)", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                              <span style={{ color: "var(--accent-primary)" }}>{key}:</span>
                              <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>{JSON.stringify(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Memory Heap Layout */}
                    <div className="card" style={{ padding: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                        📦 Memory Heap & Buffer Inspector
                      </div>
                      <pre style={{ margin: 0, padding: 10, background: "var(--bg-primary)", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>
                        {JSON.stringify(currentStep?.heap || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                );
              })() : (
                <div className="empty-state" style={{ padding: "30px 20px" }}>
                  <div className="empty-state-icon">🐞</div>
                  <h3>No Active Debug Trace</h3>
                  <p>Click "Trace Execution" to record AST step frames and inspect variables.</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={startDebugger} disabled={debugLoading}>
                    {debugLoading ? "⏳ Tracing..." : "🚀 Launch Debugger"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="editor-pane">
        <div className="editor-toolbar">
          <select className="select lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
            {langs.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <select className="select" style={{ width: 75 }} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} title="Font Size">
            {[12, 13, 14, 15, 16, 18].map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setCode((problem.templates as any)[language] || "")} title="Reset code to starter template">
            <Icons.Reload size={13} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={copyCode} title="Copy code">
            <Icons.Copy size={13} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, marginRight: 8, fontFamily: "var(--font-mono)" }}>
            <span style={{ background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>⌘↵ Run</span>
            <span style={{ background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>⇧⌘↵ Submit</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleRun} disabled={running || submitting} style={{ minWidth: 72, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            {running ? <><span className="animate-spin">⚙</span> Run</> : <><Icons.Play size={13} /> Run</>}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting || running} style={{ minWidth: 84, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            {submitting ? <><span className="animate-spin">⚙</span> Submit</> : <><Icons.Check size={14} /> Submit</>}
          </button>
        </div>

        <div className="editor-wrapper">
          <textarea
            ref={textareaRef}
            className="code-textarea"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleTab}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            style={{ fontSize: fontSize }}
          />
        </div>

        {/* Testcase + Output Panel */}
        <div className="test-panel">
          <div className="test-panel-tabs">
            <button
              className={`test-panel-tab ${outputTab === "testcase" ? "active" : ""}`}
              onClick={() => setOutputTab("testcase")}
            >Testcase</button>
            <button
              className={`test-panel-tab ${outputTab === "result" ? "active" : ""}`}
              onClick={() => setOutputTab("result")}
            >Result</button>
          </div>

          {outputTab === "testcase" && (
            <div className="testcase-console">
              <div className="testcase-case-tabs">
                {visibleTestCases.map((_, i) => (
                  <button
                    key={i}
                    className={`testcase-tab ${activeTestCase === i ? "active" : ""}`}
                    onClick={() => setActiveTestCase(i)}
                  >Case {i + 1}</button>
                ))}
                <button
                  className={`testcase-tab ${activeTestCase === visibleTestCases.length ? "active" : ""}`}
                  onClick={() => setActiveTestCase(visibleTestCases.length)}
                >+ Custom</button>
              </div>
              <div className="testcase-input-area">
                {activeTestCase < visibleTestCases.length ? (
                  <>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>INPUT</div>
                    <pre className="testcase-pre">{visibleTestCases[activeTestCase]?.input}</pre>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, marginTop: 10 }}>EXPECTED OUTPUT</div>
                    <pre className="testcase-pre">{visibleTestCases[activeTestCase]?.output}</pre>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>CUSTOM INPUT (stdin)</div>
                    <textarea
                      className="testcase-custom-input"
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder="Enter custom stdin input..."
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {outputTab === "result" && (
            <div className="test-panel-body">
              {!submission && !runResult && !polling && !running && (
                <div style={{ color: "var(--text-muted)", padding: "12px 0" }}>
                  Click <strong>▷ Run</strong> to test or <strong>▶ Submit</strong> to submit.
                </div>
              )}
              {(polling || running) && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--accent-primary)", marginBottom: 12, fontWeight: 600 }}>
                    <span className="animate-spin">⚙</span> Real-time Judge Streaming...
                  </div>

                  {liveStreamEvents.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--bg-primary)", padding: 12, borderRadius: 8, border: "1px solid var(--border-light)" }}>
                      {liveStreamEvents.map((ev, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span>{ev.status === "Accepted" ? "✅" : ev.status === "Running" ? "🟢" : "⚡"}</span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{ev.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Run result */}
              {runResult && !running && (
                <div className="run-result-panel">
                  {runResult.error ? (
                    <div style={{ color: "var(--accent-red)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{runResult.error}</div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, color: runIsCustom ? "var(--accent-primary)" : runResult.passed ? "var(--accent-green)" : "var(--accent-red)" }}>
                          {runIsCustom ? "📟 Output (custom input — not judged)" : runResult.passed ? "✅ Passed" : "❌ Wrong Answer"}
                        </span>
                        {runResult.runtime !== undefined && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>⏱ {runResult.runtime?.toFixed(1)}ms</span>}
                      </div>
                      <div className="diff-grid">
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>INPUT</div>
                          <pre className="testcase-pre">{runResult.input}</pre>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>EXPECTED</div>
                          <pre className="testcase-pre">{runResult.expected}</pre>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>YOUR OUTPUT</div>
                          <pre className={`testcase-pre ${runResult.passed ? "" : "testcase-pre-error"}`}>{runResult.got}</pre>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Submit result */}
              {submission && !polling && !runResult && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: statusColor }}>
                      {statusIcon} {submission.status === "Success" ? "Accepted" : submission.status}
                    </span>
                    {submission?.runtime && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>⏱ {submission.runtime.toFixed(1)}ms</span>}
                  </div>
                  {submission.status === "Success" && submission.beatsPercent !== null && (
                    <div className="beats-card">
                      🏆 Beats <strong>{submission.beatsPercent}%</strong> of {langs.find(l => l.value === language)?.label} submissions!
                    </div>
                  )}
                  {submission.status !== "Success" && submission.output && (
                    <div style={{ marginBottom: 12, color: statusColor, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      {submission.output}
                    </div>
                  )}
                  {submission.testResults && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
                        TEST RESULTS: {submission.testCasesPassed}/{submission.testCasesTotal} passed
                      </div>
                      {submission.testResults.map((r, i) => (
                        <div key={i} className="test-case-row">
                          <span>{r.passed ? "✅" : "❌"}</span>
                          <span style={{ color: "var(--text-muted)" }}>Case {i + 1}{r.isHidden ? " (hidden)" : ""}</span>
                          {!r.isHidden && <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{r.input.substring(0, 40)}</span>}
                          {r.error && <span style={{ color: "var(--accent-red)", fontSize: 11 }}>{r.error.substring(0, 50)}</span>}
                          <span style={{ color: "var(--text-muted)", marginLeft: "auto", fontSize: 11 }}>{r.runtime.toFixed(1)}ms</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Code Modal */}
      {viewCodeModal && (
        <div className="modal-backdrop" onClick={() => setViewCodeModal(null)}>
          <div className="modal" style={{ maxWidth: 700, width: "90vw" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📄 Submission Code</h3>
              <div style={{ fontSize: 12, color: subStatusColor(viewCodeModal.status), fontWeight: 600 }}>
                {subStatusIcon(viewCodeModal.status)} {viewCodeModal.status} · {viewCodeModal.language.toUpperCase()}
                {viewCodeModal.runtime && ` · ⏱ ${viewCodeModal.runtime.toFixed(0)}ms`}
              </div>
              <button className="modal-close" onClick={() => setViewCodeModal(null)}>×</button>
            </div>
            <div style={{ maxHeight: "60vh", overflow: "auto" }}>
              <pre style={{
                margin: 0, padding: 20,
                fontFamily: "var(--font-mono)", fontSize: 13,
                background: "var(--bg-primary)",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                color: "var(--text-primary)"
              }}>{viewCodeModal.code}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => {
                setCode(viewCodeModal.code);
                setLanguage(viewCodeModal.language);
                setViewCodeModal(null);
                setActiveTab("desc");
                onToast("Code loaded into editor", "success");
              }}>Load into Editor</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewCodeModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Submissions Modal with Line Diff Highlighting */}
      {compareModal && (
        <div className="modal-backdrop" onClick={() => setCompareModal(null)}>
          <div className="modal" style={{ maxWidth: 1000, width: "95vw" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>🔍 Side-by-Side Submission Diff Comparison</h3>
              <button className="modal-close" onClick={() => setCompareModal(null)}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Submission 1 */}
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: subStatusColor(compareModal.sub1.status) }}>
                      Submission A ({compareModal.sub1.language.toUpperCase()}) — {compareModal.sub1.status}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: "2px 6px" }}
                      onClick={() => { setCode(compareModal.sub1.code); setLanguage(compareModal.sub1.language); setCompareModal(null); onToast("Loaded Submission A into editor", "success"); }}
                    >
                      Use in Editor ↗
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                    {new Date(compareModal.sub1.createdAt).toLocaleString()} · ⏱ {compareModal.sub1.runtime?.toFixed(0)}ms
                  </div>
                  <div style={{ background: "var(--bg-primary)", borderRadius: 6, maxHeight: 380, overflow: "auto", fontFamily: "var(--font-mono)", fontSize: 12, padding: "8px 0" }}>
                    {compareModal.sub1.code.split("\n").map((line, idx) => {
                      const otherLines = compareModal.sub2.code.split("\n");
                      const isDiff = otherLines[idx] !== line;
                      return (
                        <div key={idx} style={{ display: "flex", background: isDiff ? "rgba(248,81,73,0.12)" : "transparent", padding: "1px 8px" }}>
                          <span style={{ width: 30, color: "var(--text-muted)", userSelect: "none", fontSize: 11 }}>{idx + 1}</span>
                          <span style={{ color: isDiff ? "var(--accent-red)" : "var(--text-primary)", whiteSpace: "pre" }}>{line || " "}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submission 2 */}
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: subStatusColor(compareModal.sub2.status) }}>
                      Submission B ({compareModal.sub2.language.toUpperCase()}) — {compareModal.sub2.status}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: "2px 6px" }}
                      onClick={() => { setCode(compareModal.sub2.code); setLanguage(compareModal.sub2.language); setCompareModal(null); onToast("Loaded Submission B into editor", "success"); }}
                    >
                      Use in Editor ↗
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                    {new Date(compareModal.sub2.createdAt).toLocaleString()} · ⏱ {compareModal.sub2.runtime?.toFixed(0)}ms
                  </div>
                  <div style={{ background: "var(--bg-primary)", borderRadius: 6, maxHeight: 380, overflow: "auto", fontFamily: "var(--font-mono)", fontSize: 12, padding: "8px 0" }}>
                    {compareModal.sub2.code.split("\n").map((line, idx) => {
                      const otherLines = compareModal.sub1.code.split("\n");
                      const isDiff = otherLines[idx] !== line;
                      return (
                        <div key={idx} style={{ display: "flex", background: isDiff ? "rgba(63,185,80,0.12)" : "transparent", padding: "1px 8px" }}>
                          <span style={{ width: 30, color: "var(--text-muted)", userSelect: "none", fontSize: 11 }}>{idx + 1}</span>
                          <span style={{ color: isDiff ? "var(--accent-green)" : "var(--text-primary)", whiteSpace: "pre" }}>{line || " "}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setCompareModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}