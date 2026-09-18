// backend/src/tokenService.ts
// Access + refresh token lifecycle: issuance, rotation, reuse detection, revocation.
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  getRefreshTokenSecret,
} from "./config";
import { generateAccessToken, generateRefreshToken } from "./auth";

export interface TokenUser {
  id: string;
  role: string;
  email?: string | null;
  tokenVersion?: number | null;
}

export interface SessionMeta {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  familyId: string;
  expiresIn: string;
}

export interface RotateResult {
  ok: boolean;
  status: number;
  error?: string;
  reuseDetected?: boolean;
  tokens?: IssuedTokens;
  user?: TokenUser;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function refreshExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_TTL_MS);
}

/**
 * Issues a fresh access/refresh token pair, creating (or reusing) a device session.
 * Refresh tokens are persisted only as SHA-256 hashes.
 */
export async function issueTokenPair(
  user: TokenUser,
  meta: SessionMeta = {},
  existing?: { sessionId?: string; familyId?: string }
): Promise<IssuedTokens> {
  const familyId = existing?.familyId || crypto.randomUUID();
  const sessionId = existing?.sessionId || crypto.randomUUID();

  // Persist the session (best-effort: token issuance must not fail if the DB blips).
  try {
    const session = await (prisma as any).session.findUnique({ where: { id: sessionId } });
    if (session) {
      await (prisma as any).session.update({
        where: { id: sessionId },
        data: { lastActiveAt: new Date(), isRevoked: false },
      });
    } else {
      await (prisma as any).session.create({
        data: {
          id: sessionId,
          userId: user.id,
          deviceInfo: meta.deviceInfo || null,
          ipAddress: meta.ipAddress || null,
          userAgent: meta.userAgent || null,
          expiresAt: refreshExpiryDate(),
        },
      });
    }
  } catch {
    // Non-fatal: refresh token is still valid JWT-wise.
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion || 0,
    sessionId,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    familyId,
    tokenVersion: user.tokenVersion || 0,
    sessionId,
    jti: crypto.randomUUID(),
  });

  try {
    await (prisma as any).refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        sessionId,
        familyId,
        expiresAt: refreshExpiryDate(),
      },
    });
  } catch {
    // Non-fatal: access token still works; refresh will simply fail closed later.
  }

  return { accessToken, refreshToken, sessionId, familyId, expiresIn: ACCESS_TOKEN_EXPIRY };
}

/**
 * Rotates a refresh token. Detects reuse of already-used/revoked tokens and, on
 * suspicion of theft, revokes the entire token family (all descendants).
 */
export async function rotateRefreshToken(rawToken: string, meta: SessionMeta = {}): Promise<RotateResult> {
  if (!rawToken || typeof rawToken !== "string") {
    return { ok: false, status: 401, error: "Refresh token required" };
  }

  let decoded: { userId: string; familyId: string; sessionId?: string; tokenVersion?: number };
  try {
    decoded = jwt.verify(rawToken, getRefreshTokenSecret()) as typeof decoded;
  } catch {
    return { ok: false, status: 401, error: "Invalid or expired refresh token" };
  }

  const tokenHash = hashToken(rawToken);

  let record: any = null;
  try {
    record = await (prisma as any).refreshToken.findUnique({ where: { tokenHash } });
  } catch {
    record = null;
  }

  if (!record) {
    return { ok: false, status: 401, error: "Refresh token not recognized. Please sign in again." };
  }

  // Reuse of a consumed or revoked token => likely theft. Nuke the family.
  if (record.isUsed || record.isRevoked) {
    await revokeFamily(record.familyId, record.sessionId);
    return { ok: false, status: 401, error: "Refresh token reuse detected. All sessions for this device were revoked.", reuseDetected: true };
  }

  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
    await revokeFamily(record.familyId, record.sessionId);
    return { ok: false, status: 401, error: "Refresh token expired. Please sign in again." };
  }

  let user: any = null;
  try {
    user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true, isSuspended: true, tokenVersion: true },
    });
  } catch {
    user = null;
  }

  if (!user || user.isSuspended) {
    await revokeFamily(record.familyId, record.sessionId);
    return { ok: false, status: 401, error: "Account unavailable" };
  }

  if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && decoded.tokenVersion < user.tokenVersion) {
    await revokeFamily(record.familyId, record.sessionId);
    return { ok: false, status: 401, error: "Session has expired or was revoked. Please sign in again." };
  }

  // Mark the presented token consumed before issuing its successor.
  try {
    await (prisma as any).refreshToken.update({
      where: { id: record.id },
      data: { isUsed: true },
    });
  } catch {
    // fall through — successor still issued
  }

  let sessionId = record.sessionId || decoded.sessionId;
  try {
    if (sessionId) {
      await (prisma as any).session.update({
        where: { id: sessionId },
        data: { lastActiveAt: new Date(), ipAddress: meta.ipAddress || undefined, userAgent: meta.userAgent || undefined },
      });
    }
  } catch {
    sessionId = sessionId || crypto.randomUUID();
  }

  const tokens = await issueTokenPair(user, meta, { sessionId: sessionId || undefined, familyId: record.familyId });

  return { ok: true, status: 200, tokens, user: { id: user.id, role: user.role, email: user.email } };
}

/** Revokes a single refresh token (by raw value) and its session. */
export async function revokeRefreshToken(rawToken: string): Promise<void> {
  if (!rawToken) return;
  try {
    const record = await (prisma as any).refreshToken.findUnique({ where: { tokenHash: hashToken(rawToken) } });
    if (!record) return;
    await (prisma as any).refreshToken.update({ where: { id: record.id }, data: { isRevoked: true } });
    if (record.sessionId) {
      await (prisma as any).session.update({ where: { id: record.sessionId }, data: { isRevoked: true } });
    }
  } catch {
    // best-effort
  }
}

/** Revokes every refresh token in a family plus the owning session. */
export async function revokeFamily(familyId: string, sessionId?: string): Promise<void> {
  try {
    await (prisma as any).refreshToken.updateMany({ where: { familyId }, data: { isRevoked: true } });
    if (sessionId) {
      await (prisma as any).session.update({ where: { id: sessionId }, data: { isRevoked: true } });
    }
  } catch {
    // best-effort
  }
}

/** Revokes all refresh tokens for a session and marks the session revoked. */
export async function revokeSessionTokens(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await (prisma as any).refreshToken.updateMany({ where: { sessionId }, data: { isRevoked: true } });
    await (prisma as any).session.update({ where: { id: sessionId }, data: { isRevoked: true } });
  } catch {
    // best-effort
  }
}

/** Revokes all refresh tokens/sessions for a user (used by logout-all & password change). */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  try {
    await (prisma as any).refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } });
    await (prisma as any).session.updateMany({ where: { userId }, data: { isRevoked: true } });
  } catch {
    // best-effort
  }
}
