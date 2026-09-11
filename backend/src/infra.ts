// backend/src/infra.ts
import { Router, type Request, type Response } from "express";
import { cache } from "./redis";
import { backgroundQueue } from "./queue";
import { auditService } from "./audit";
import { notificationService, ACHIEVEMENTS_LIST } from "./notifications";
import { auth, adminAuth, type AuthenticatedRequest } from "./auth";
import { getRateLimiterBackend } from "./rateLimit";
import { safeErrorMessage } from "./config";

function extractString(value: unknown, fallback: string = "all"): string {
  if (Array.isArray(value)) {
    return (typeof value[0] === "string" ? value[0] : fallback) ?? fallback;
  }
  if (typeof value === "string") {
    return value;
  }
  return fallback;
}

export const infraRouter = Router();

// GET /api/v1/infra/status
infraRouter.get("/status", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    cache: cache.getStatus(),
    queue: backgroundQueue.getStats(),
    rateLimiter: getRateLimiterBackend(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// GET /api/v1/notifications — requires auth; users may only read their own notifications
infraRouter.get("/notifications", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedUserId = extractString(req.query.userId, req.userId || "all");
    if (requestedUserId !== req.userId && requestedUserId !== "all") {
      return res.status(403).json({ error: "Cannot access another user's notifications" });
    }
    const userId = requestedUserId === "all" ? (req.userId || "all") : requestedUserId;
    const notifs = await notificationService.getUserNotifications(userId);
    res.json({ notifications: notifs });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

// POST /api/v1/notifications/:id/read
infraRouter.post("/notifications/:id/read", auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || extractString(req.body.userId, "all");
    const success = await notificationService.markAsRead(req.params.id as string, userId);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

// GET /api/v1/achievements
infraRouter.get("/achievements", (_req: Request, res: Response) => {
  res.json({ achievements: ACHIEVEMENTS_LIST });
});

// GET /api/v1/audit-logs — admin/instructor only
infraRouter.get("/audit-logs", adminAuth, async (_req: Request, res: Response) => {
  try {
    const logs = await auditService.getRecentLogs(50);
    res.json({ auditLogs: logs });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});
