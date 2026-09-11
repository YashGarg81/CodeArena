import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { getJwtSecret } from "./config";
import { getRedisClient } from "./redisClient";

const revokedTokensMemory = new Set<string>();

export async function revokeToken(token: string): Promise<void> {
  if (!token) return;
  revokedTokensMemory.add(token);
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`revoked_token:${token}`, "1", { EX: 7 * 24 * 60 * 60 });
    } catch {
      // Redis fallback
    }
  }
}

export function isTokenRevoked(token: string): boolean {
  if (!token) return false;
  return revokedTokensMemory.has(token);
}

export async function checkTokenRevocation(token: string): Promise<boolean> {
  if (isTokenRevoked(token)) return true;
  const redis = getRedisClient();
  if (redis) {
    try {
      const val = await redis.get(`revoked_token:${token}`);
      if (val) {
        revokedTokensMemory.add(token);
        return true;
      }
    } catch {}
  }
  return false;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  user?: { id: string; role: string; email?: string };
  sessionId?: string;
}

export function generateAccessToken(payload: { userId: string; role: string; sessionId?: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
}

export function generateRefreshToken(payload: { userId: string; familyId: string; sessionId?: string }): string {
  return jwt.sign(payload, getJwtSecret() + "_refresh", { expiresIn: "7d" });
}

export function auth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }
  if (isTokenRevoked(token)) {
    res.status(401).json({ error: "Token has been revoked" });
    return;
  }
  jwt.verify(token, getJwtSecret(), async (err, decoded) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    if (await checkTokenRevocation(token)) {
      res.status(401).json({ error: "Token has been revoked" });
      return;
    }
    const dec = decoded as { userId: string; role?: string; sessionId?: string };
    const userId = dec.userId;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, email: true, isSuspended: true }
      });
      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }
      if (user.isSuspended) {
        res.status(403).json({ error: "Account suspended. Please contact platform administration." });
        return;
      }
      req.userId = user.id;
      req.userRole = user.role;
      req.user = { id: user.id, role: user.role, email: user.email };
      req.sessionId = dec.sessionId;
      next();
    } catch (err: any) {
      res.status(401).json({ error: "Authentication verification failed" });
    }
  });
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    if (isTokenRevoked(token)) {
      next();
      return;
    }
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string };
      req.userId = decoded.userId;
      req.userRole = decoded.role || "STUDENT";
    } catch {
      // Ignore invalid optional tokens
    }
  }
  next();
}

export async function adminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }
  if (await checkTokenRevocation(token)) {
    res.status(401).json({ error: "Token has been revoked" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string };
    req.userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, isSuspended: true },
    });

    if (!user || user.isSuspended) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const adminRoles = ["ADMIN", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "CONTEST_ADMIN", "INSTRUCTOR", "DEVELOPER"];
    if (!adminRoles.includes(user.role)) {
      res.status(403).json({ error: "Administrative privileges required" });
      return;
    }

    req.userRole = user.role;
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

export async function developerAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }
  if (await checkTokenRevocation(token)) {
    res.status(401).json({ error: "Token has been revoked" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string };
    req.userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, isSuspended: true },
    });

    if (!user || user.isSuspended) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const devRoles = ["DEVELOPER", "ADMIN", "PLATFORM_ADMIN"];
    if (!devRoles.includes(user.role)) {
      res.status(403).json({ error: "Developer privileges required" });
      return;
    }

    req.userRole = user.role;
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

