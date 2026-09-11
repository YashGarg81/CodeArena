// backend/src/interviewRoutes.ts
import { Router } from "express";
import { prisma } from "../db";
import { auth, type AuthenticatedRequest } from "./auth";

export const interviewRouter = Router();

// 1. Create / Schedule Interview
interviewRouter.post("/", auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, candidateEmail, scheduledAt, notes } = req.body;
    if (!title || !scheduledAt) {
      return res.status(400).json({ error: "Title and scheduledAt date are required" });
    }

    let candidateUser = null;
    if (candidateEmail) {
      candidateUser = await prisma.user.findUnique({ where: { email: candidateEmail } });
    }

    const interview = await prisma.interview.create({
      data: {
        title,
        interviewerId: req.userId!,
        scheduledAt: new Date(scheduledAt),
        notes,
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

    res.json({ success: true, interview });
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

// 3. Get Interview Detail
interviewRouter.get("/:id", auth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const interview = await prisma.interview.findUnique({
      where: { id },
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

    if (!interview) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    res.json({ interview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Start Interview Session
interviewRouter.post("/:id/start", auth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const interview = await prisma.interview.update({
      where: { id },
      data: { status: "InProgress", startedAt: new Date() },
    });
    res.json({ success: true, interview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. End Interview Session
interviewRouter.post("/:id/end", auth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const interview = await prisma.interview.update({
      where: { id },
      data: { status: "Completed", endedAt: new Date() },
    });
    res.json({ success: true, interview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Submit Candidate Evaluation Scorecard
interviewRouter.post("/:id/evaluate", auth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { candidateId, codingScore, commScore, problemSolving, feedback, recommendation } = req.body;

  if (!candidateId || !feedback || !recommendation) {
    return res.status(400).json({ error: "Candidate, feedback, and recommendation are required" });
  }

  try {
    const evaluation = await prisma.interviewEvaluation.create({
      data: {
        interviewId: id,
        evaluatorId: req.userId!,
        candidateId,
        codingScore: Number(codingScore) || 5,
        commScore: Number(commScore) || 5,
        problemSolving: Number(problemSolving) || 5,
        feedback,
        recommendation,
      },
    });

    res.json({ success: true, evaluation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
