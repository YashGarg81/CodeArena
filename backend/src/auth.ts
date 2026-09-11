import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { getJwtSecret, getRefreshTokenSecret } from "./config";
import { getRedisClient } from "./redisClient";

import crypto from "crypto";

// In-memory revocation cache with TTL & size bound to prevent unbounded growth / memory leaks
const MAX_REVOKED_TOKENS = 10_000;
const REVOCATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (matching max token lifetime)
const revokedTokensMemory = new Map<string, number>(); // tokenHash -> expiresAt

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function pruneRevocationCache(): void {
  const now = Date.now();
  for (const [key, expiresAt] of revokedTokensMemory.entries()) {
    if (now > expiresAt) {
      revokedTokensMemory.delete(key);
    }
  }
  // If still above maximum capacity, evict oldest entries
  if (revokedTokensMemory.size > MAX_REVOKED_TOKENS) {
    const overflow = revokedTokensMemory.size - MAX_REVOKED_TOKENS;
    let evicted = 0;
    for (const key of revokedTokensMemory.keys()) {
      revokedTokensMemory.delete(key);
      evicted++;
      if (evicted >= overflow) break;
    }
  }
}

export async function revokeToken(token: string): Promise<void> {
  if (!token) return;
  const hash = hashToken(token);
  pruneRevocationCache();
  revokedTokensMemory.set(hash, Date.now() + REVOCATION_TTL_MS);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`revoked_token:${hash}`, "1", { EX: 7 * 24 * 60 * 60 });
    } catch {
      // Redis fallback
    }
  }
}

export function isTokenRevoked(token: string): boolean {
  if (!token) return false;
  const hash = hashToken(token);
  const expiresAt = revokedTokensMemory.get(hash);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    revokedTokensMemory.delete(hash);
    return false;
  }
  return true;
}

export async function checkTokenRevocation(token: string): Promise<boolean> {
  if (!token) return false;
  if (isTokenRevoked(token)) return true;
  const redis = getRedisClient();
  if (redis) {
    try {
      const hash = hashToken(token);
      const val = await redis.get(`revoked_token:${hash}`);
      if (val) {
        revokedTokensMemory.set(hash, Date.now() + REVOCATION_TTL_MS);
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
  return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: "7d" });
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

