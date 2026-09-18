// frontend/src/components/system-design/SystemDesignInterview.tsx
import React, { useState, useEffect } from "react";
import { Icons } from "../ui/Icons";
import type { SDTemplate } from "./types";

interface QuestionPack {
  id: string;
  problemTitle: string;
  level: "Beginner" | "Intermediate" | "Senior" | "Staff";
  interviewerPersona: string;
  interviewerAvatar: string;
  scenario: string;
  constraints: Array<{
    title: string;
    description: string;
    expectedConsideration: string;
  }>;
  rubric: {
    requirementsWeight: number;
    estimationWeight: number;
    hldWeight: number;
    deepDiveWeight: number;
    resilienceWeight: number;
  };
}

const INTERVIEW_PACKS: Record<string, QuestionPack> = {
  "url-shortener": {
    id: "url-shortener",
    problemTitle: "Design TinyURL / URL Redirection Service",
    level: "Intermediate",
    interviewerPersona: "Alex Mercer — Staff Engineer (Google Search)",
    interviewerAvatar: "👨‍💻",
    scenario: "Our company needs a globally scalable URL shortening service handling 100M daily creations and 10B daily redirects with sub-10ms latency.",
    constraints: [
      {
        title: "1. Handling Hash Collision vs Pre-generated IDs",
        description: "If two users shorten the same destination URL or generate conflicting Base62 hashes, how do you prevent race conditions without table locks?",
        expectedConsideration: "Snowflake ID generation or ZooKeeper range allocation per instance."
      },
      {
        title: "2. 100:1 Read-Heavy Cache Stampede",
        description: "A celebrity posts a short link on X (Twitter). 500,000 users click it simultaneously. The Redis key just expired.",
        expectedConsideration: "Probabilistic early refresh (XFetch) or mutex locking on cache miss."
      },
      {
        title: "3. 301 vs 302 Redirection & Telemetry Tracking",
        description: "Should we return HTTP 301 Permanent Redirect or HTTP 302 Found? What are the network and analytics trade-offs?",
        expectedConsideration: "301 caches in browser saving server bandwidth; 302 forces hits through gateway for click analytics."
      }
    ],
    rubric: {
      requirementsWeight: 15,
      estimationWeight: 20,
      hldWeight: 25,
      deepDiveWeight: 25,
      resilienceWeight: 15
    }
  },
  "tiktok-feed": {
    id: "tiktok-feed",
    problemTitle: "Design TikTok Video Feed & Streaming Platform",
    level: "Staff",
    interviewerPersona: "Dr. Elena Rostova — Principal Systems Architect (Meta / ByteDance)",
    interviewerAvatar: "👩‍💼",
    scenario: "Design a high-throughput personalized For You Page (FYP) serving 1B DAU with sub-25ms first-frame rendering and immediate telemetry feedback.",
    constraints: [
      {
        title: "1. Fan-out On Write vs Pull for Viral Creators",
        description: "A creator with 80M followers uploads a video clip. Pushing to all follower inboxes would take minutes. How do you design hybrid fan-out?",
        expectedConsideration: "Fan-out on read for celebrity users; pre-computed hybrid pipeline for active users."
      },
      {
        title: "2. Video Cold-Start & Adaptive Bitrate Streaming",
        description: "How do you ensure instantaneous playback across shaky 3G mobile connections without pre-loading full 50MB files?",
        expectedConsideration: "2-second initial HLS chunk fetching with CDN edge transcoding."
      },
      {
        title: "3. ML Recommendation Feedback Loop",
        description: "Users swipe within 1.5 seconds. How does watch-time telemetry influence the candidate generation pool in real time?",
        expectedConsideration: "Kafka event stream consumed by real-time online feature store and vector search."
      }
    ],
    rubric: {
      requirementsWeight: 10,
      estimationWeight: 15,
      hldWeight: 30,
      deepDiveWeight: 25,
      resilienceWeight: 20
    }
  },
  "stripe-payments": {
    id: "stripe-payments",
    problemTitle: "Design Stripe Distributed Payment Engine",
    level: "Staff",
    interviewerPersona: "Marcus Vance — Head of Core Infrastructure (Stripe)",
    interviewerAvatar: "💳",
    scenario: "Design a zero-loss financial payment processing platform processing $50B annually with strict idempotency and distributed ACID compliance.",
    constraints: [
      {
        title: "1. Preventing Double Charging on Network Timeout",
        description: "A customer clicks 'Pay $500', the merchant server makes an HTTP request to Stripe, but client WiFi disconnects before receiving 200 OK.",
        expectedConsideration: "Unique Idempotency-Key enforced via distributed Redis mutex and database unique constraint."
      },
      {
        title: "2. Double-Entry Immutable Ledger",
        description: "Why must financial platforms never execute `UPDATE accounts SET balance = balance + 100`?",
        expectedConsideration: "Immutable debit/credit ledger entries that can be cryptographically audited and reconciled."
      },
      {
        title: "3. Banking Gateway Failover & Circuit Breakers",
        description: "Visa acquiring gateway response latency spikes from 150ms to 6 seconds. How do you prevent thread starvation?",
        expectedConsideration: "Circuit breaker with asynchronous polling fallback and dead-letter queues."
      }
    ],
    rubric: {
      requirementsWeight: 15,
      estimationWeight: 15,
      hldWeight: 25,
      deepDiveWeight: 25,
      resilienceWeight: 20
    }
  }
};

export function SystemDesignInterview({
  activeTemplateId = "url-shortener",
  templates = [],
  onSelectTemplate,
  onToast
}: {
  activeTemplateId?: string;
  templates?: SDTemplate[];
  onSelectTemplate?: (tmpl: SDTemplate) => void;
  onToast: (msg: string, type: string) => void;
}) {
  const [selectedPackId, setSelectedPackId] = useState<string>(activeTemplateId);
  const pack = INTERVIEW_PACKS[selectedPackId] || INTERVIEW_PACKS["url-shortener"]!;

  // 45-minute countdown timer with Play/Pause (Starts paused until user clicks Start)
  const [timeLeft, setTimeLeft] = useState(2700);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 4-Step FAANG Defense Framework
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [stepNotes, setStepNotes] = useState<{ 1: string; 2: string; 3: string; 4: string }>({
    1: "",
    2: "",
    3: "",
    4: ""
  });

  // AI Rubric Evaluation Result
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    overallScore: number;
    verdict: "Staff Bar Passed" | "Senior Bar Passed" | "Needs Practice";
    feedback: Array<{ category: string; rating: string; score: number; comment: string }>;
  } | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Sync if parent changes template
  useEffect(() => {
    if (INTERVIEW_PACKS[activeTemplateId]) {
      setSelectedPackId(activeTemplateId);
    }
  }, [activeTemplateId]);

  const handleEvaluate = () => {
    const totalWords = Object.values(stepNotes)
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (totalWords < 25) {
      onToast("Please write at least 25 words in your architectural defense steps before self-check.", "info");
      return;
    }

    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const isExtensive = totalWords >= 120;
      // Deterministic heuristic self-check: overall is the exact sum of the
      // four rubric parts below (+3 depth bonus, capped at 97). Same notes
      // always produce the same score — no randomness.
      const partScores = [
        stepNotes[1].length > 40 ? 19 : 14,
        stepNotes[2].length > 60 ? 28 : 22,
        stepNotes[3].length > 60 ? 25 : 20,
        stepNotes[4].length > 40 ? 20 : 15,
      ];
      const score = Math.min(97, partScores.reduce((a, b) => a + b, 0) + (isExtensive ? 3 : 0));
      const verdict = score >= 90 ? "Staff Bar Passed" : score >= 80 ? "Senior Bar Passed" : "Needs Practice";

      setEvalResult({
        overallScore: score,
        verdict,
        feedback: [
          {
            category: "1. Scope & Scale Math",
            rating: stepNotes[1].length > 40 ? "Exceeds Bar" : "Meets Bar",
            score: partScores[0] as number,
            comment: "Clear understanding of QPS boundaries, read-write ratio, and storage estimation."
          },
          {
            category: "2. High-Level Architecture",
            rating: stepNotes[2].length > 60 ? "Exceeds Bar" : "Meets Bar",
            score: partScores[1] as number,
            comment: "Clean decoupling of edge, service, and database tiers with stateless web workers."
          },
          {
            category: "3. Deep Dives & Data Modeling",
            rating: stepNotes[3].length > 60 ? "Staff Level" : "Meets Bar",
            score: partScores[2] as number,
            comment: "Strong rationale for partition keys, sharding strategy, and in-memory caching."
          },
          {
            category: "4. Failure Recovery & Trade-Offs",
            rating: stepNotes[4].length > 40 ? "Staff Level" : "Needs Detail",
            score: partScores[3] as number,
            comment: "Identified single points of failure (SPOF) and presented mitigation playbooks."
          }
        ]
      });

      onToast(`Self-check complete! Heuristic score: ${score}/100 (${verdict})`, "success");
    }, 1200);
  };

  const stepsMeta = [
    { num: 1 as const, title: "1. Scope & Clarifying Questions", placeholder: "• Functional: Can users customize short codes? Expiration TTL?\n• Non-Functional: 99.99% Availability, < 10ms P99 latency.\n• Scale: 100M URLs/day -> ~1,160 writes/sec, 100x reads -> ~116K reads/sec." },
    { num: 2 as const, title: "2. High-Level Diagram", placeholder: "• Client -> Anycast DNS / CDN -> API Gateway / Load Balancer.\n• Split Write Service (URL shortener) from Read Gateway (Redirect engine).\n• Stateless application pods autoscale horizontally." },
    { num: 3 as const, title: "3. Component Deep Dive", placeholder: "• Base62 7-character encoding (62^7 = 3.5T links).\n• Storage: PostgreSQL B-Tree unique index on short_code.\n• Cache Tier: Redis Cluster LRU cache (80-20 Pareto distribution).\n• Async Clickstream: Kafka buffer -> ClickHouse analytics." },
    { num: 4 as const, title: "4. Trade-Offs & Disaster Recovery", placeholder: "• 301 vs 302: Use 302 to track telemetry on origin server.\n• Cache Stampede: Mutex lock on cache miss + probabilistic early refresh.\n• Primary DB Failure: Automated Patroni failover to read replica within 15s." },
  ];

  return (
    <div className="container" style={{ padding: "24px 20px", maxWidth: 1080 }}>
      {/* Top Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎙️</span>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
              System Design Mock Interview Studio
            </h1>
            <span className="badge badge-purple" style={{ fontSize: 11 }}>Codemia + TheOnsite Rubric</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: 4 }}>
            Simulate a real 45-minute FAANG Staff/Senior architectural interview. Defend your design against tough interviewer follow-ups.
          </p>
        </div>

        {/* Timer & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-secondary)", padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: timeLeft < 600 ? "var(--accent-red)" : isTimerRunning ? "var(--accent-green)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
            <div style={{ fontSize: 10, color: isTimerRunning ? "var(--accent-green)" : "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
              {isTimerRunning ? "LIVE SESSION" : "PAUSED"}
            </div>
          </div>
          <button
            onClick={() => {
              setIsTimerRunning(r => {
                const next = !r;
                onToast(next ? "Interview started! 45:00 clock running." : "Interview clock paused.", "info");
                return next;
              });
            }}
            className={`btn btn-sm ${isTimerRunning ? "btn-secondary" : "btn-primary"}`}
            style={{ padding: "5px 10px", fontSize: 11.5, display: "flex", alignItems: "center", gap: 5 }}
            title={isTimerRunning ? "Pause Interview" : "Start Interview Clock"}
          >
            {isTimerRunning ? (
              <>
                <Icons.Lock size={12} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Icons.Play size={12} />
                <span>Start Session</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsTimerRunning(false);
              setTimeLeft(2700);
              onToast("Interview timer reset to 45:00.", "info");
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: "5px 8px" }}
            title="Reset Timer (45m)"
          >
            <Icons.RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Problem Pack Switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {Object.values(INTERVIEW_PACKS).map(p => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPackId(p.id);
              if (onSelectTemplate && templates.length > 0) {
                const matched = templates.find(t => t.id === p.id);
                if (matched) onSelectTemplate(matched);
              }
            }}
            className={`btn btn-sm ${selectedPackId === p.id ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>{p.interviewerAvatar}</span>
            <span>{p.problemTitle}</span>
            <span className="badge badge-outline" style={{ fontSize: 9.5 }}>{p.level}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Left Interviewer / Right Defense Notepad */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        {/* Left Column: Interviewer Card & Injected Constraints */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Persona Card */}
          <div className="card" style={{ padding: 16, margin: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {pack.interviewerAvatar}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{pack.interviewerPersona}</div>
                <div style={{ fontSize: 11, color: "var(--accent-primary)", fontWeight: 600 }}>Mock Interviewer (Active)</div>
              </div>
            </div>
            <div style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: 6, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45, border: "1px solid var(--border-light)" }}>
              "{pack.scenario}"
            </div>
          </div>

          {/* Injected Follow-Up Questions */}
          <div className="card" style={{ padding: 16, margin: 0, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, color: "var(--accent-blue)" }}>
              <Icons.Help size={15} />
              <span>Interviewer Injected Constraints</span>
            </div>

            {pack.constraints.map((c, i) => (
              <div key={i} style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 6, border: "1px solid var(--border-light)" }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--text-primary)", marginBottom: 4 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {c.description}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: "var(--accent-green)" }}>
                  💡 <strong>Target Defense:</strong> {c.expectedConsideration}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 4-Step FAANG Framework Workspace */}
        <div className="card" style={{ padding: 18, margin: 0, display: "flex", flexDirection: "column" }}>
          {/* Step Selector Tabs */}
          <div style={{ display: "flex", gap: 4, background: "var(--bg-secondary)", padding: 3, borderRadius: 6, border: "1px solid var(--border)", marginBottom: 12 }}>
            {stepsMeta.map(s => (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                style={{
                  flex: 1,
                  background: activeStep === s.num ? "var(--bg-tertiary)" : "transparent",
                  color: activeStep === s.num ? "var(--text-primary)" : "var(--text-muted)",
                  border: "none",
                  borderRadius: 4,
                  padding: "6px 8px",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Active Step Content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-blue)" }}>
                {stepsMeta[activeStep - 1]?.title}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {stepNotes[activeStep].trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              className="input"
              rows={11}
              placeholder={stepsMeta[activeStep - 1]?.placeholder}
              value={stepNotes[activeStep]}
              onChange={e => setStepNotes({ ...stepNotes, [activeStep]: e.target.value })}
              style={{
                flex: 1,
                fontSize: 12.5,
                lineHeight: 1.55,
                fontFamily: "var(--font-mono)",
                resize: "none"
              }}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              onClick={() => {
                // Populate sample defense notes for current step
                const sample = stepsMeta[activeStep - 1]?.placeholder || "";
                setStepNotes({ ...stepNotes, [activeStep]: sample });
                onToast("Loaded FAANG Staff blueprint into notes", "info");
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12 }}
            >
              Insert Blueprint Template
            </button>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, fontSize: 12.5, fontWeight: 700 }}
            >
              {isEvaluating ? "Evaluating rubric..." : "Submit for Heuristic Self-Check 🚀"}
            </button>
          </div>

          {/* Evaluation Results Card */}
          {evalResult && (
            <div style={{ marginTop: 16, background: "var(--bg-secondary)", padding: 14, borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🏆</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>
                      Heuristic Self-Check: <span style={{ color: evalResult.overallScore >= 90 ? "var(--accent-green)" : "var(--accent-blue)" }}>{evalResult.verdict}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Deterministic rubric estimate — not an official score</div>
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                  {evalResult.overallScore} / 100
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {evalResult.feedback.map((f, i) => (
                  <div key={i} style={{ background: "var(--bg-tertiary)", padding: 10, borderRadius: 6, border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                      <span>{f.category}</span>
                      <span style={{ color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>{f.rating}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
                      {f.comment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
