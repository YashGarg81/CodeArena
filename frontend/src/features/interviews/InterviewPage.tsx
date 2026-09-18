import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";
import type { User } from "../../types";
import { LANGUAGE_OPTIONS, normalizeLanguage } from "../../utils/languages";

// ─── REAL-TIME MOCK INTERVIEW STUDIO (P1 CORE FEATURE) ───────────────────────

export function InterviewPage({ user, onToast }: { user: User | null; onToast: (msg: string, type: string) => void }) {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [role, setRole] = useState<"candidate" | "interviewer">("candidate");
  const [selectedProblem, setSelectedProblem] = useState("two-sum");
  const [language, setLanguage] = useState("js");
  const [duration, setDuration] = useState(45);
  const [code, setCode] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [evalModal, setEvalModal] = useState(false);
  const [evalScores, setEvalScores] = useState({ problemSolving: 4, codingProficiency: 4, communication: 4, feedback: "" });
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);

  // Execution & test results state
  const [runResult, setRunResult] = useState<any | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "problem">("code");

  // Timer tick interval
  useEffect(() => {
    if (!isTimerRunning || !activeSession || activeSession.status === "completed") return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, activeSession]);

  const loadInterviews = () => {
    api.get("/api/v1/interviews")
      .then(r => setInterviews(r.data?.interviews || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleStartInterview = async () => {
    try {
      const res = await api.post("/api/v1/interviews", {
        problemId: selectedProblem,
        language,
        durationMinutes: duration,
        candidateName: user?.name || "Candidate"
      });
      if (res.data?.interview) {
        setActiveSession(res.data.interview);
        setCode(res.data.interview.code);
        setSecondsLeft(res.data.interview.timerSecondsLeft || duration * 60);
        setIsTimerRunning(false); // Do not run until user clicks Start!
        setRunResult(null);
        onToast("Mock Interview room ready! 🎯 Press 'Start Session' to begin timer.", "success");
      }
    } catch {
      onToast("Failed to create interview session", "error");
    }
  };

  const handleOpenSession = async (id: string) => {
    try {
      const res = await api.get(`/api/v1/interviews/${id}`);
      if (res.data?.interview) {
        const interview = res.data.interview;
        setActiveSession(interview);
        setCode(interview.code);
        setLanguage(normalizeLanguage(interview.language) || "js");
        setSecondsLeft(interview.timerSecondsLeft ?? (interview.durationMinutes * 60));
        setIsTimerRunning(interview.status === "completed" ? false : Boolean(interview.timerRunning));
        setRunResult(null);
      }
    } catch {
      onToast("Failed to load interview", "error");
    }
  };

  const handleTimerAction = async (action: "start" | "pause" | "resume" | "reset") => {
    if (!activeSession) return;
    try {
      const res = await api.post(`/api/v1/interviews/${activeSession.id}/timer`, { action, secondsLeft });
      if (res.data?.interview) {
        setActiveSession(res.data.interview);
        if (action === "start" || action === "resume") {
          setIsTimerRunning(true);
          onToast(action === "start" ? "⏱ Interview timer started!" : "▶ Timer resumed", "info");
        } else if (action === "pause") {
          setIsTimerRunning(false);
          onToast("⏸ Timer paused", "info");
        } else if (action === "reset") {
          setIsTimerRunning(false);
          setSecondsLeft(activeSession.durationMinutes * 60);
          onToast("🔄 Timer reset to start", "info");
        }
      }
    } catch {
      // Local fallback
      if (action === "start" || action === "resume") setIsTimerRunning(true);
      else if (action === "pause") setIsTimerRunning(false);
      else if (action === "reset") {
        setIsTimerRunning(false);
        setSecondsLeft(activeSession.durationMinutes * 60);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeSession) return;
    const msg = { sender: role, text: chatInput.trim() };
    setChatInput("");
    try {
      const res = await api.post(`/api/v1/interviews/${activeSession.id}/sync`, { code, message: msg });
      if (res.data?.interview) setActiveSession(res.data.interview);
    } catch {
      // Local fallback
      setActiveSession((prev: any) => prev ? {
        ...prev,
        messages: [...prev.messages, { ...msg, time: new Date().toLocaleTimeString() }]
      } : null);
    }
  };

  const handleAskHint = async () => {
    if (!activeSession) return;
    try {
      const res = await api.post(`/api/v1/interviews/${activeSession.id}/hints`, {});
      if (res.data?.interview) {
        setActiveSession(res.data.interview);
        onToast(`💡 Interviewer Socratic Hint: ${res.data.hint}`, "info");
      }
    } catch {
      onToast("Failed to request hint", "error");
    }
  };

  const handleRunCode = async () => {
    if (!activeSession) return;
    setIsRunningCode(true);
    setRunResult(null);
    try {
      const res = await api.post(`/api/v1/problems/${activeSession.problemId}/run`, {
        code,
        language
      });
      setRunResult(res.data);
      if (res.data.allPassed) {
        onToast("All test cases passed! Solution verified ✅", "success");
      } else {
        onToast("Test execution finished with discrepancies", "warning");
      }
    } catch (err: any) {
      // Never fake successful execution in production
      setRunResult({
        success: false,
        allPassed: false,
        results: [],
        message: "Execution service unavailable. Please check judge worker status and try again."
      });
      onToast("Execution service unavailable — solution could not be evaluated", "error");
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!activeSession) return;
    try {
      const res = await api.post(`/api/v1/interviews/${activeSession.id}/evaluate`, evalScores);
      if (res.data?.scorecard) {
        setActiveSession(res.data.interview);
        setIsTimerRunning(false);
        setEvalModal(false);
        loadInterviews();
        onToast(`Evaluation scorecard finalized: [${res.data.scorecard.verdict}] 🎉`, "success");
      }
    } catch {
      onToast("Failed to submit evaluation", "error");
    }
  };

  if (activeSession) {
    const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    const isCompleted = activeSession.status === "completed";
    const problem = activeSession.problemDetails || {
      title: activeSession.problemTitle,
      diff: activeSession.difficulty,
      desc: "Implement the required algorithm ensuring optimal time and space complexity.",
      testCases: []
    };

    return (
      <div className="container" style={{ padding: "20px 20px 40px" }}>
        {/* Top Navigation & Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setActiveSession(null); loadInterviews(); }}>
            ← Back to Interview Hub
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Role Switcher */}
            <div style={{ display: "flex", gap: 4, background: "var(--bg-tertiary)", padding: "3px 6px", borderRadius: 8 }}>
              <button
                className={`btn btn-sm ${role === "candidate" ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "4px 10px", fontSize: 12 }}
                onClick={() => setRole("candidate")}
              >
                👤 Candidate
              </button>
              <button
                className={`btn btn-sm ${role === "interviewer" ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "4px 10px", fontSize: 12 }}
                onClick={() => setRole("interviewer")}
              >
                👨‍🏫 Interviewer
              </button>
            </div>

            {/* Interactive Timer Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>⏱ TIMER:</span>
              <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "var(--font-mono)", color: isCompleted ? "var(--accent-purple)" : secondsLeft < 300 ? "var(--accent-red)" : "var(--accent-primary)" }}>
                {isCompleted ? "COMPLETED" : `${mins}:${secs}`}
              </span>

              {!isCompleted && (
                <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                  {!isTimerRunning ? (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ padding: "2px 8px", fontSize: 11 }}
                      onClick={() => handleTimerAction(secondsLeft === activeSession.durationMinutes * 60 ? "start" : "resume")}
                    >
                      ▶ {secondsLeft === activeSession.durationMinutes * 60 ? "Start" : "Resume"}
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "2px 8px", fontSize: 11 }}
                      onClick={() => handleTimerAction("pause")}
                    >
                      ⏸ Pause
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "2px 6px", fontSize: 11 }}
                    title="Reset Timer"
                    onClick={() => handleTimerAction("reset")}
                  >
                    🔄
                  </button>
                </div>
              )}
            </div>

            {/* Evaluation Scorecard CTA */}
            {!isCompleted ? (
              <button className="btn btn-primary btn-sm" onClick={() => setEvalModal(true)}>
                📋 Complete & Evaluate
              </button>
            ) : (
              <span className="badge badge-purple" style={{ fontSize: 13, padding: "6px 12px" }}>
                Scorecard: {activeSession.scorecard?.verdict} ({activeSession.scorecard?.overallScore}/100)
              </span>
            )}
          </div>
        </div>

        {/* Workspace Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(340px, 1fr)", gap: 18, minHeight: "78vh" }}>
          {/* Left Column: Problem Tabs & Code Canvas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Problem Overview Card */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span className="badge badge-blue">Target Problem</span>
                    <span className={`badge badge-${(activeSession.difficulty ?? "medium").toLowerCase()}`}>{activeSession.difficulty}</span>
                    <span className="badge badge-gray">{activeSession.durationMinutes} mins allocated</span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{activeSession.problemTitle}</h2>
                </div>
                
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className={`btn btn-sm ${activeTab === "problem" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setActiveTab(activeTab === "problem" ? "code" : "problem")}
                  >
                    {activeTab === "problem" ? "💻 Show Editor" : "📖 Problem Statement"}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleAskHint}>
                    💡 Socratic Hint
                  </button>
                </div>
              </div>

              {/* Problem Description Drawer */}
              {activeTab === "problem" && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-light)", fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                  <div style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>{problem.desc}</div>
                  {problem.testCases && problem.testCases.length > 0 && (
                    <div style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 8, fontSize: 12 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Sample Test Inputs:</strong>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                        {problem.testCases.map((tc: any, idx: number) => (
                          <div key={idx} style={{ fontFamily: "var(--font-mono)" }}>
                            Case {idx + 1}: <code>{tc.input}</code> → Expected: <span style={{ color: "var(--accent-primary)" }}>{tc.output}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Code Canvas & Controls */}
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-light)", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                    💻 Real-Time Shared Canvas
                  </span>
                  <select
                    className="input"
                    style={{ fontSize: 11, padding: "2px 8px", height: 26, width: "auto" }}
                    value={language}
                    onChange={e => {
                      const newLang = e.target.value;
                      setLanguage(newLang);
                      api.post(`/api/v1/interviews/${activeSession.id}/sync`, { language: newLang }).catch(() => {});
                    }}
                  >
                    {LANGUAGE_OPTIONS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: "4px 12px", fontSize: 12 }}
                    disabled={isRunningCode}
                    onClick={handleRunCode}
                  >
                    {isRunningCode ? "⏳ Executing..." : "▶ Run & Test Code"}
                  </button>
                </div>
              </div>

              <textarea
                className="code-textarea"
                style={{ flex: 1, border: "none", borderRadius: 0, padding: 16, fontSize: 13.5, fontFamily: "var(--font-mono)", resize: "none", minHeight: 380 }}
                value={code}
                placeholder="// Write your solution here and test against interview test cases..."
                onChange={e => {
                  setCode(e.target.value);
                  api.post(`/api/v1/interviews/${activeSession.id}/sync`, { code: e.target.value }).catch(() => {});
                }}
              />

              {/* Execution Feedback Drawer */}
              {runResult && (
                <div style={{ padding: "12px 16px", background: runResult.allPassed ? "rgba(46,160,67,0.1)" : "rgba(248,81,73,0.1)", borderTop: "1px solid var(--border-light)", fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong style={{ color: runResult.allPassed ? "var(--accent-green, #3fb950)" : "var(--accent-red, #f85149)" }}>
                      {runResult.allPassed ? "✅ All Test Cases Passed" : "⚠️ Test Executed with Issues"}
                    </strong>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "0 6px", fontSize: 11 }} onClick={() => setRunResult(null)}>✕</button>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    {runResult.message || (runResult.results ? `${runResult.results.length} assertions evaluated.` : "Output generated.")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dialogue, Socratic Hints, & Evaluation Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Scorecard Summary Card (visible if completed) */}
            {isCompleted && activeSession.scorecard && (
              <div className="card" style={{ padding: 16, background: "linear-gradient(135deg, rgba(163,113,247,0.08) 0%, rgba(88,166,255,0.08) 100%)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px" }}>🎯 Final Evaluation Scorecard</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10 }}>
                  <div style={{ background: "var(--bg-tertiary)", padding: 8, borderRadius: 6 }}>
                    <div>Problem Solving:</div>
                    <strong>{activeSession.scorecard.problemSolving}/5</strong>
                  </div>
                  <div style={{ background: "var(--bg-tertiary)", padding: 8, borderRadius: 6 }}>
                    <div>Coding Skill:</div>
                    <strong>{activeSession.scorecard.codingProficiency}/5</strong>
                  </div>
                  <div style={{ background: "var(--bg-tertiary)", padding: 8, borderRadius: 6 }}>
                    <div>Communication:</div>
                    <strong>{activeSession.scorecard.communication}/5</strong>
                  </div>
                  <div style={{ background: "var(--bg-tertiary)", padding: 8, borderRadius: 6 }}>
                    <div>Overall Score:</div>
                    <strong style={{ color: "var(--accent-primary)" }}>{activeSession.scorecard.overallScore}/100</strong>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  <strong>Feedback:</strong> {activeSession.scorecard.feedback}
                </div>
              </div>
            )}

            {/* Dialogue & Hints Live Transcript */}
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>💬 Interview Dialogue</h3>
                <span className="badge badge-gray" style={{ fontSize: 10 }}>Live Sync</span>
              </div>

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, paddingRight: 4 }}>
                {activeSession.messages.map((m: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      background: m.sender === "system" ? "var(--bg-secondary)" : m.sender === "ai_mentor" ? "rgba(235,179,56,0.1)" : m.sender === role ? "var(--accent-primary-light, rgba(88,166,255,0.15))" : "var(--bg-tertiary)",
                      alignSelf: m.sender === role ? "flex-end" : "flex-start",
                      maxWidth: "92%",
                      border: m.sender === "ai_mentor" ? "1px solid rgba(235,179,56,0.3)" : "none"
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>
                      {m.sender} · {m.time}
                    </div>
                    <div style={{ lineHeight: 1.4 }}>{m.text}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                  className="input"
                  style={{ fontSize: 12 }}
                  placeholder={`Speak as ${role}...`}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Scorecard Modal */}
        {evalModal && (
          <div className="modal-backdrop" onClick={() => setEvalModal(false)}>
            <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>📋 Candidate Evaluation Scorecard</h3>
                <button className="modal-close" onClick={() => setEvalModal(false)}>×</button>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="label" style={{ fontSize: 12 }}>Problem Solving & Algorithm Design (1-5)</label>
                    <input
                      type="range"
                      min="1" max="5" step="1"
                      value={evalScores.problemSolving}
                      onChange={e => setEvalScores(p => ({ ...p, problemSolving: Number(e.target.value) }))}
                      style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                      <span>1 (Struggled)</span>
                      <span><strong>{evalScores.problemSolving} / 5</strong></span>
                      <span>5 (Optimal)</span>
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontSize: 12 }}>Coding Proficiency & Syntax Cleanliness (1-5)</label>
                    <input
                      type="range"
                      min="1" max="5" step="1"
                      value={evalScores.codingProficiency}
                      onChange={e => setEvalScores(p => ({ ...p, codingProficiency: Number(e.target.value) }))}
                      style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                      <span>1 (Syntax errors)</span>
                      <span><strong>{evalScores.codingProficiency} / 5</strong></span>
                      <span>5 (Production-ready)</span>
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontSize: 12 }}>Communication & Thought Articulation (1-5)</label>
                    <input
                      type="range"
                      min="1" max="5" step="1"
                      value={evalScores.communication}
                      onChange={e => setEvalScores(p => ({ ...p, communication: Number(e.target.value) }))}
                      style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                      <span>1 (Silent)</span>
                      <span><strong>{evalScores.communication} / 5</strong></span>
                      <span>5 (Proactive & structured)</span>
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontSize: 12 }}>Interviewer Summary & Hire Recommendation</label>
                    <textarea
                      className="input"
                      style={{ height: 80, fontSize: 12 }}
                      placeholder="Detail specific strengths, optimization tradeoffs, and areas of improvement..."
                      value={evalScores.feedback}
                      onChange={e => setEvalScores(p => ({ ...p, feedback: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setEvalModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSubmitEvaluation}>Finalize Scorecard</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "28px 24px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>🎙️ Real-Time Technical Mock Interviews</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Simulate realistic FAANG/Tier-1 software engineering interviews with interactive timer controls, progressive Socratic hints, test execution, and rubric-based scorecards.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Left: Start New Interview Session Form */}
        <div>
          <div className="card" style={{ padding: 22, marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>🚀 Launch New Mock Session</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label" style={{ fontSize: 12 }}>Interview Problem</label>
                <select className="input" value={selectedProblem} onChange={e => setSelectedProblem(e.target.value)}>
                  <option value="two-sum">1. Two Sum (Easy — Arrays & Hash Map)</option>
                  <option value="reverse-linked-list">206. Reverse Linked List (Easy — Pointer Manipulation)</option>
                  <option value="valid-parentheses">20. Valid Parentheses (Easy — Stack Architecture)</option>
                  <option value="trapping-rain-water">42. Trapping Rain Water (Hard — Two Pointers / Monotonic Stack)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label" style={{ fontSize: 12 }}>Language</label>
                  <select className="input" value={language} onChange={e => setLanguage(e.target.value)}>
                    {LANGUAGE_OPTIONS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" style={{ fontSize: 12 }}>Session Duration</label>
                  <select className="input" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                    <option value={30}>30 Minutes (Screening)</option>
                    <option value={45}>45 Minutes (Standard FAANG)</option>
                    <option value={60}>60 Minutes (Deep Dive)</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 8 }} onClick={handleStartInterview}>
                Enter Interview Room →
              </button>
            </div>
          </div>

          {/* Past Interview History */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>📜 Past Interview Sessions & Scorecards</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {interviews.length === 0 ? (
                <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                  No past sessions recorded yet. Launch your first mock interview above!
                </div>
              ) : (
                interviews.map(session => (
                  <div key={session.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span className={`badge badge-${session.status === "completed" ? "purple" : "easy"}`}>
                          {session.status === "completed" ? "Completed" : "In Progress"}
                        </span>
                        <span className={`badge badge-${session.difficulty ? session.difficulty.toLowerCase() : "easy"}`}>{session.difficulty}</span>
                        {session.verdict && <span className="badge badge-gray">Verdict: {session.verdict}</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{session.problemTitle}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        Candidate: {session.candidateName} · {new Date(session.startTime).toLocaleDateString()} · Score: {session.overallScore !== undefined ? `${session.overallScore}/100` : "Pending"}
                      </div>
                    </div>

                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenSession(session.id)}>
                      {session.status === "completed" ? "View Scorecard 📋" : "Re-enter Session 🚀"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Rubric Information */}
        <div>
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>📐 FAANG Evaluation Rubric</h3>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
              Every candidate is evaluated across four core performance vectors:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: 6 }}>
                <strong>1. Problem Solving (30%)</strong>
                <div style={{ color: "var(--text-muted)", marginTop: 2 }}>Exploration of constraints, identifying brute force vs optimal O(n) solutions.</div>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: 6 }}>
                <strong>2. Coding Proficiency (30%)</strong>
                <div style={{ color: "var(--text-muted)", marginTop: 2 }}>Clean modular architecture, correct data structure choices, idiom usage.</div>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: 6 }}>
                <strong>3. Communication (20%)</strong>
                <div style={{ color: "var(--text-muted)", marginTop: 2 }}>Articulating thought process aloud, receptive to hints, asking clarifying questions.</div>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: 6 }}>
                <strong>4. Verification & Testing (20%)</strong>
                <div style={{ color: "var(--text-muted)", marginTop: 2 }}>Walking through dry runs with sample inputs, identifying edge cases.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
