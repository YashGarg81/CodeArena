// backend/src/auth.ts
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

export async function revokeToken(token: string, ttlSeconds?: number): Promise<void> {
  if (!token) return;
  const hash = hashToken(token);
  pruneRevocationCache();
  const ttlMs = ttlSeconds ? ttlSeconds * 1000 : REVOCATION_TTL_MS;
  revokedTokensMemory.set(hash, Date.now() + ttlMs);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`revoked_token:${hash}`, "1", { EX: ttlSeconds || 7 * 24 * 60 * 60 });
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

export function generateAccessToken(payload: { userId: string; role: string; tokenVersion?: number; sessionId?: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
}

export function generateRefreshToken(payload: { userId: string; familyId: string; tokenVersion?: number; sessionId?: string }): string {
  return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: "7d" });
}

export async function auth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
    const dec = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string; tokenVersion?: number; sessionId?: string; is2FAPending?: boolean };
    if (dec.is2FAPending) {
      res.status(403).json({ error: "Two-Factor Authentication challenge required before accessing platform" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: dec.userId },
      select: { id: true, role: true, email: true, isSuspended: true, tokenVersion: true }
    });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    if (user.isSuspended) {
      res.status(403).json({ error: "Account suspended. Please contact platform administration." });
      return;
    }
    // Check if token was issued prior to a global session revocation (tokenVersion mismatch)
    if (dec.tokenVersion !== undefined && user.tokenVersion !== undefined && dec.tokenVersion < user.tokenVersion) {
      res.status(401).json({ error: "Session has expired or was revoked. Please sign in again." });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.user = { id: user.id, role: user.role, email: user.email };
    req.sessionId = dec.sessionId;
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    if (await checkTokenRevocation(token)) {
      next();
      return;
    }
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string; tokenVersion?: number; sessionId?: string; is2FAPending?: boolean };
      if (!decoded.is2FAPending) {
        req.userId = decoded.userId;
        req.userRole = decoded.role || "STUDENT";
        req.sessionId = decoded.sessionId;
      }
    } catch {
      // In optional auth, invalid/expired token is gracefully ignored and request proceeds as anonymous
    }
  }
  next();
}

/**
 * Strict Core Administration authorization: Only ADMIN and PLATFORM_ADMIN.
 * Prevents privilege escalation from Developer / Instructor roles.
 */
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
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string; tokenVersion?: number; is2FAPending?: boolean };
    if (decoded.is2FAPending) {
      res.status(403).json({ error: "Two-Factor Authentication challenge required" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, isSuspended: true, tokenVersion: true },
    });

    if (!user || user.isSuspended) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion) {
      res.status(401).json({ error: "Session has expired or was revoked. Please sign in again." });
      return;
    }

    const adminRoles = ["ADMIN", "PLATFORM_ADMIN", "DEVELOPER"];
    if (!adminRoles.includes(user.role)) {
      res.status(403).json({ error: "Administrative privileges required (ADMIN, PLATFORM_ADMIN, or DEVELOPER)" });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

/**
 * Problem Management authorization: ADMIN, PLATFORM_ADMIN, PROBLEM_ADMIN, INSTRUCTOR.
 */
export async function problemAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string; tokenVersion?: number; is2FAPending?: boolean };
    if (decoded.is2FAPending) {
      res.status(403).json({ error: "Two-Factor Authentication challenge required" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, isSuspended: true, tokenVersion: true },
    });

    if (!user || user.isSuspended) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion) {
      res.status(401).json({ error: "Session has expired or was revoked. Please sign in again." });
      return;
    }

    const problemRoles = ["ADMIN", "PLATFORM_ADMIN", "PROBLEM_ADMIN", "INSTRUCTOR"];
    if (!problemRoles.includes(user.role)) {
      res.status(403).json({ error: "Problem authoring privileges required" });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

/**
 * Developer Tooling authorization: DEVELOPER, ADMIN, PLATFORM_ADMIN.
 */
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
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role?: string; tokenVersion?: number; is2FAPending?: boolean };
    if (decoded.is2FAPending) {
      res.status(403).json({ error: "Two-Factor Authentication challenge required" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, isSuspended: true, tokenVersion: true },
    });

    if (!user || user.isSuspended) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion) {
      res.status(401).json({ error: "Session has expired or was revoked. Please sign in again." });
      return;
    }

    const devRoles = ["DEVELOPER", "ADMIN", "PLATFORM_ADMIN"];
    if (!devRoles.includes(user.role)) {
      res.status(403).json({ error: "Developer privileges required" });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
