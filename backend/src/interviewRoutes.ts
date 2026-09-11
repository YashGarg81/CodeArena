// backend/src/interviewRoutes.ts
import { Router } from "express";
import { prisma } from "../db";
import { auth, type AuthenticatedRequest } from "./auth";

export const interviewRouter = Router();

// 1. Create / Schedule Interview (Supports both candidate-scheduled & live mock interview rooms)
interviewRouter.post("/", auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, candidateEmail, scheduledAt, notes, problemId, language, durationMinutes, candidateName } = req.body;
    const sessionTitle = title || (problemId ? `Technical Interview: ${problemId}` : `Mock Technical Interview`);
    const sessionDate = scheduledAt ? new Date(scheduledAt) : new Date();

    let candidateUser = null;
    if (candidateEmail) {
      candidateUser = await prisma.user.findUnique({ where: { email: candidateEmail } });
    }

    const metaPayload = JSON.stringify({
      problemId: problemId || "two-sum",
      language: language || "javascript",
      durationMinutes: Number(durationMinutes) || 45,
      candidateName: candidateName || undefined,
      notes: notes || undefined
    });

    const interview = await prisma.interview.create({
      data: {
        title: sessionTitle,
        interviewerId: req.userId!,
        scheduledAt: sessionDate,
        notes: metaPayload,
        status: "Scheduled",
        participants: candidateUser
          ? {
              create: [
                { userId: req.userId!, role: "interviewer" },
                { userId: candidateUser.id, role: "candidate" },
              ],
            }
          : {
              create: [{ userId: req.userId!, role: "interviewer" }],
            },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, username: true, email: true, avatar: true } },
          },
        },
      },
    });

    const state = getOrCreateSessionState(interview.id, Number(durationMinutes) || 45, language || "javascript");
    const enrichedInterview = {
      ...interview,
      problemId: problemId || "two-sum",
      language: language || "javascript",
      durationMinutes: Number(durationMinutes) || 45,
      timerSecondsLeft: state.secondsLeft,
      timerRunning: false,
      code: state.code,
      messages: state.messages
    };

    res.json({ success: true, interview: enrichedInterview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. List user's interviews
interviewRouter.get("/", auth, async (req: AuthenticatedRequest, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        OR: [
          { interviewerId: req.userId! },
          { participants: { some: { userId: req.userId! } } },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      include: {
        interviewer: { select: { id: true, name: true, username: true, avatar: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
        _count: { select: { evaluations: true } },
      },
    });

    res.json({ interviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Active interview session state store with server-authoritative timestamps & countdown
interface ActiveInterviewState {
  code: string;
  language: string;
  secondsLeft: number;
  timerRunning: boolean;
  lastTickTimestamp: number;
  messages: Array<{ sender: string; text: string; time: string }>;
  hintLevel: number;
  durationMinutes: number;
  problemId: string;
}

const activeInterviewStates = new Map<string, ActiveInterviewState>();

function parseInterviewNotes(notes: string | null): { problemId: string; language: string; durationMinutes: number; code?: string; messages?: any[]; hintLevel?: number; secondsLeft?: number; timerRunning?: boolean } {
  if (!notes) return { problemId: "two-sum", language: "javascript", durationMinutes: 45 };
  try {
    const parsed = JSON.parse(notes);
    return {
      problemId: parsed.problemId || "two-sum",
      language: parsed.language || "javascript",
      durationMinutes: Number(parsed.durationMinutes) || 45,
      code: parsed.code,
      messages: parsed.messages,
      hintLevel: parsed.hintLevel,
      secondsLeft: parsed.secondsLeft,
      timerRunning: parsed.timerRunning
    };
  } catch {
    return { problemId: "two-sum", language: "javascript", durationMinutes: 45 };
  }
}

function getOrCreateSessionState(
  interviewId: string,
  durationMinutes = 45,
  language = "javascript",
  problemId = "two-sum",
  initialState?: Partial<ActiveInterviewState>
): ActiveInterviewState {
  let state = activeInterviewStates.get(interviewId);
  const now = Date.now();
  if (!state) {
    state = {
      code: initialState?.code || "// Write your solution here\n",
      language: initialState?.language || language,
      secondsLeft: typeof initialState?.secondsLeft === "number" ? initialState.secondsLeft : durationMinutes * 60,
      timerRunning: Boolean(initialState?.timerRunning),
      lastTickTimestamp: now,
      messages: initialState?.messages || [],
      hintLevel: initialState?.hintLevel || 0,
      durationMinutes,
      problemId
    };
    activeInterviewStates.set(interviewId, state);
  } else {
    state.durationMinutes = durationMinutes;
    state.problemId = problemId;
    if (state.timerRunning) {
      // Server-authoritative countdown based on elapsed physical milliseconds
      const elapsedSeconds = Math.floor((now - state.lastTickTimestamp) / 1000);
      if (elapsedSeconds > 0) {
        state.secondsLeft = Math.max(0, state.secondsLeft - elapsedSeconds);
        state.lastTickTimestamp = now;
        if (state.secondsLeft === 0) {
          state.timerRunning = false;
        }
      }
    } else {
      state.lastTickTimestamp = now;
    }
  }
  return state;
}

// Persist interview session state to database notes so state survives server restarts
async function persistInterviewSessionState(interviewId: string, state: ActiveInterviewState, interview: any) {
  try {
    const existingNotes = parseInterviewNotes(interview.notes);
    const updatedNotes = JSON.stringify({
      ...existingNotes,
      problemId: state.problemId || existingNotes.problemId,
      language: state.language || existingNotes.language,
      durationMinutes: state.durationMinutes || existingNotes.durationMinutes,
      code: state.code,
      messages: state.messages.slice(-50), // persist recent 50 messages
      hintLevel: state.hintLevel,
      secondsLeft: state.secondsLeft,
      timerRunning: state.timerRunning,
      lastPersistedAt: new Date().toISOString()
    });
    await prisma.interview.update({
      where: { id: interviewId },
      data: { notes: updatedNotes }
    }).catch(() => {});
  } catch {}
}

// Helper: Verify user belongs to interview and get their role
async function getInterviewWithParticipant(interviewId: string, userId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      interviewer: { select: { id: true, name: true, username: true, avatar: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
        },
      },
      evaluations: {
        include: {
          evaluator: { select: { id: true, name: true, username: true } },
        },
      },
    },
  });

  if (!interview) return null;

  const isInterviewer = interview.interviewerId === userId;
  const participantEntry = interview.participants.find((p: any) => p.userId === userId);
  const isCandidate = participantEntry?.role === "candidate";
  const isParticipant = isInterviewer || !!participantEntry;

  return {
    interview,
    isInterviewer,
    isCandidate,
    isParticipant,
    participantRole: isInterviewer ? "interviewer" : (participantEntry?.role || null)
  };
}

// 3. Get Interview Detail
interviewRouter.get("/:id", auth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  const userId = req.userId!;
  try {
    const authContext = await getInterviewWithParticipant(id, userId);
    if (!authContext) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (!authContext.isParticipant) {
      return res.status(403).json({ error: "Forbidden: You are not a participant in this interview session" });
    }

    const { interview } = authContext;
    const meta = parseInterviewNotes(interview.notes);
    const state = getOrCreateSessionState(id, meta.durationMinutes, meta.language);

    const enrichedInterview = {
      ...interview,
      problemId: meta.problemId,
      problemTitle: interview.title || `Technical Interview: ${meta.problemId}`,
      difficulty: "Medium",
      durationMinutes: meta.durationMinutes,
      timerSecondsLeft: state.secondsLeft,
      timerRunning: state.timerRunning,
      code: state.code,
      language: state.language,
      messages: state.messages,
      userRole: authContext.participantRole
    };

    res.json({ interview: enrichedInterview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Start Interview Session (Only interviewer can start)
interviewRouter.post("/:id/start", auth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  const userId = req.userId!;
  try {
    const authContext = await getInterviewWithParticipant(id, userId);
    if (!authContext) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (!authContext.isInterviewer) {
      return res.status(403).json({ error: "Forbidden: Only the interviewer can start the interview session" });
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: { status: "InProgress", startedAt: new Date() },
    });
    const meta = parseInterviewNotes(interview.notes);
    const state = getOrCreateSessionState(id, meta.durationMinutes, meta.language, meta.problemId);
    state.timerRunning = true;
    await persistInterviewSessionState(id, state, interview);
    res.json({
      success: true,
      interview: {
        ...interview,
        problemId: meta.problemId,
        durationMinutes: meta.durationMinutes,
        timerRunning: true,
        timerSecondsLeft: state.secondsLeft,
        code: state.code,
        language: state.language,
        messages: state.messages
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. End Interview Session (Only interviewer can conclude interview)
interviewRouter.post("/:id/end", auth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  const userId = req.userId!;
  try {
    const authContext = await getInterviewWithParticipant(id, userId);
    if (!authContext) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (!authContext.isInterviewer) {
      return res.status(403).json({ error: "Forbidden: Only the interviewer can conclude the interview session" });
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: { status: "Completed", endedAt: new Date() },
    });
    const meta = parseInterviewNotes(interview.notes);
    const state = getOrCreateSessionState(id, meta.durationMinutes, meta.language, meta.problemId);
    state.timerRunning = false;
    await persistInterviewSessionState(id, state, interview);
    res.json({
      success: true,
      interview: {
        ...interview,
        problemId: meta.problemId,
        durationMinutes: meta.durationMinutes,
        timerRunning: false,
        timerSecondsLeft: state.secondsLeft,
        code: state.code,
        language: state.language,
        messages: state.messages
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Interview Timer Action (start | pause | resume | reset - Only interviewer)
interviewRouter.post("/:id/timer", auth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  const userId = req.userId!;
  const { action, secondsLeft } = req.body;

  try {
    const authContext = await getInterviewWithParticipant(id, userId);
    if (!authContext) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (!authContext.isInterviewer) {
      return res.status(403).json({ error: "Forbidden: Only the interviewer can control the interview timer" });
    }

    const meta = parseInterviewNotes(authContext.interview.notes);
    const state = getOrCreateSessionState(id, meta.durationMinutes, meta.language, meta.problemId);
    if (typeof secondsLeft === "number") {
      state.secondsLeft = secondsLeft;
    }

    if (action === "start" || action === "resume") {
      state.timerRunning = true;
    } else if (action === "pause") {
      state.timerRunning = false;
    } else if (action === "reset") {
      state.timerRunning = false;
      state.secondsLeft = meta.durationMinutes * 60;
    }

    const interview = authContext.interview;
    await persistInterviewSessionState(id, state, interview);

    const enrichedInterview = {
      ...interview,
      problemId: meta.problemId,
      problemTitle: interview.title || `Technical Interview: ${meta.problemId}`,
      durationMinutes: meta.durationMinutes,
      timerSecondsLeft: state.secondsLeft,
      timerRunning: state.timerRunning,
      code: state.code,
      language: state.language,
      messages: state.messages
    };

    res.json({ success: true, interview: enrichedInterview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Synchronize Live Code, Language & Chat Messages (Participants only)
interviewRouter.post("/:id/sync", auth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  const userId = req.userId!;
  const { code, language, message } = req.body;

  try {
    const authContext = await getInterviewWithParticipant(id, userId);
    if (!authContext) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (!authContext.isParticipant) {
      return res.status(403).json({ error: "Forbidden: You are not a participant in this interview session" });
    }

    const meta = parseInterviewNotes(authContext.interview.notes);
    const state = getOrCreateSessionState(id, meta.durationMinutes, meta.language, meta.problemId);
    if (typeof code === "string") {
      state.code = code;
    }
    if (typeof language === "string") {
      state.language = language;
    }
    if (message && typeof message === "object") {
      state.messages.push({
        sender: message.sender || authContext.participantRole || "participant",
        text: String(message.text || "").slice(0, 1000),
        time: new Date().toLocaleTimeString()
      });
      // Cap in-memory chat messages buffer to 200 items
      if (state.messages.length > 200) state.messages.shift();
    }

    const interview = authContext.interview;
    await persistInterviewSessionState(id, state, interview);

    const enrichedInterview = {
      ...interview,
      problemId: meta.problemId,
      problemTitle: interview.title || `Technical Interview: ${meta.problemId}`,
      durationMinutes: meta.durationMinutes,
      timerSecondsLeft: state.secondsLeft,
      timerRunning: state.timerRunning,
      code: state.code,
      language: state.language,
      messages: state.messages
    };

    res.json({ success: true, interview: enrichedInterview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { aiMentorEngine } from "./aiMentor";

// 8. Request Progressive Socratic AI Interview Hint (Participants only)
interviewRouter.post("/:id/hints", auth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  const userId = req.userId!;

  try {
    const authContext = await getInterviewWithParticipant(id, userId);
    if (!authContext) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (!authContext.isParticipant) {
      return res.status(403).json({ error: "Forbidden: You are not a participant in this interview session" });
    }

    const meta = parseInterviewNotes(authContext.interview.notes);
    const state = getOrCreateSessionState(id, meta.durationMinutes, meta.language, meta.problemId);
    state.hintLevel = Math.min(5, state.hintLevel + 1);

    const hintNode = aiMentorEngine.getHintTree(meta.problemId, state.hintLevel);
    const hintText = `[Stage ${hintNode.level}: ${hintNode.stage}] ${hintNode.title} — ${hintNode.content}`;

    state.messages.push({
      sender: "interviewer",
      text: `💡 Socratic Hint: ${hintText}`,
      time: new Date().toLocaleTimeString()
    });

    const interview = authContext.interview;
    await persistInterviewSessionState(id, state, interview);

    const enrichedInterview = {
      ...interview,
      problemId: meta.problemId,
      problemTitle: interview.title || `Technical Interview: ${meta.problemId}`,
      durationMinutes: meta.durationMinutes,
      timerSecondsLeft: state.secondsLeft,
      timerRunning: state.timerRunning,
      code: state.code,
      language: state.language,
      messages: state.messages
    };

    res.json({
      success: true,
      hint: hintText,
      hintNode,
      interview: enrichedInterview
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Submit Candidate Evaluation Scorecard (Strict 1-10 score validation & Interviewer only)
interviewRouter.post("/:id/evaluate", auth, async (req: AuthenticatedRequest, res) => {
  const id = String(req.params.id);
  const userId = req.userId!;
  const {
    candidateId,
    codingScore,
    commScore,
    problemSolving,
    codingProficiency,
    communication,
    feedback,
    recommendation
  } = req.body;

  try {
    // 1. Authorize: User must be the interviewer
    const authContext = await getInterviewWithParticipant(id, userId);
    if (!authContext) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    if (!authContext.isInterviewer) {
      return res.status(403).json({ error: "Forbidden: Only the interviewer can submit an evaluation scorecard" });
    }

    // 2. Strict Score Validation (1 <= score <= 10)
    const rawCoding = codingScore ?? codingProficiency;
    const rawComm = commScore ?? communication;
    const rawProblemSolving = problemSolving;

    const validateScore = (val: any, fieldName: string) => {
      if (val === undefined || val === null || val === "") {
        throw new Error(`Missing required evaluation score: '${fieldName}'`);
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 10) {
        throw new Error(`Invalid score for '${fieldName}': must be an integer between 1 and 10. Received: ${val}`);
      }
      return num;
    };

    let resolvedCodingScore: number;
    let resolvedCommScore: number;
    let resolvedProblemSolving: number;

    try {
      resolvedCodingScore = validateScore(rawCoding, "codingScore");
      resolvedCommScore = validateScore(rawComm, "commScore");
      resolvedProblemSolving = validateScore(rawProblemSolving, "problemSolving");
    } catch (valErr: any) {
      return res.status(400).json({ error: valErr.message });
    }

    const resolvedFeedback = typeof feedback === "string" && feedback.trim()
      ? feedback.trim()
      : "Candidate evaluation completed.";
    const avgScore = (resolvedCodingScore + resolvedCommScore + resolvedProblemSolving) / 3;
    const validRecommendations = ["STRONG_HIRE", "HIRE", "NO_HIRE", "STRONG_NO_HIRE"];
    const resolvedRecommendation = recommendation && validRecommendations.includes(recommendation)
      ? recommendation
      : (avgScore >= 7 ? "STRONG_HIRE" : avgScore >= 5 ? "HIRE" : "NO_HIRE");

    const state = getOrCreateSessionState(id);
    state.timerRunning = false;

    // Resolve candidate user
    let targetCandidateId = candidateId;
    if (!targetCandidateId) {
      const participant = authContext.interview.participants.find((p: any) => p.role === "candidate");
      targetCandidateId = participant?.userId || null;
    }

    const evaluation = await prisma.interviewEvaluation.create({
      data: {
        interviewId: id,
        evaluatorId: userId,
        candidateId: targetCandidateId || userId,
        codingScore: resolvedCodingScore,
        commScore: resolvedCommScore,
        problemSolving: resolvedProblemSolving,
        feedback: resolvedFeedback,
        recommendation: resolvedRecommendation,
      },
    });

    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: { status: "Completed", endedAt: new Date() }
    }).catch(() => null);

    const scorecard = {
      id: evaluation.id,
      verdict: resolvedRecommendation,
      overallScore: +avgScore.toFixed(1),
      problemSolving: resolvedProblemSolving,
      codingProficiency: resolvedCodingScore,
      communication: resolvedCommScore,
      feedback: resolvedFeedback
    };

    res.json({
      success: true,
      scorecard,
      evaluation,
      interview: {
        ...(updatedInterview || { id, status: "completed" }),
        status: "completed",
        timerRunning: false,
        timerSecondsLeft: state.secondsLeft,
        code: state.code,
        messages: state.messages
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
