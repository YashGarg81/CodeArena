// backend/src/emailVerification.ts
import crypto from "crypto";
import { prisma } from "../db";
import { getRedisClient } from "./redisClient";
import { safeErrorMessage } from "./config";
import { sendTransactionalEmail } from "./emailService";

export interface EmailVerificationTokenPayload {
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: number; // timestamp in ms
}

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MEMORY_VERIFY_STORE = new Map<string, EmailVerificationTokenPayload>();
const VERIFIED_USERS_CACHE = new Set<string>();

/**
 * Generate a cryptographically secure 256-bit email verification token.
 */
export function generateVerificationToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

/**
 * Check if a user's email is verified.
 */
export async function isUserEmailVerified(userId: string): Promise<boolean> {
  if (VERIFIED_USERS_CACHE.has(userId)) return true;

  const redis = getRedisClient();
  if (redis) {
    try {
      const val = await redis.get(`email_verified:${userId}`);
      if (val === "true") {
        VERIFIED_USERS_CACHE.add(userId);
        return true;
      }
    } catch {
      // Fallback
    }
  }

  return VERIFIED_USERS_CACHE.has(userId);
}

/**
 * Mark a user as verified.
 */
export async function setUserEmailVerified(userId: string, email: string): Promise<void> {
  VERIFIED_USERS_CACHE.add(userId);
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`email_verified:${userId}`, "true");
      await redis.set(`email_verified_by_email:${email.toLowerCase()}`, "true");
    } catch {
      // Cache locally
    }
  }
}

/**
 * Request/create an email verification token for a user.
 */
export async function sendVerificationEmail(userId: string, email: string): Promise<{ success: boolean; message: string; verificationToken?: string; verificationUrl?: string }> {
  if (!email || !userId) {
    return { success: false, message: "User ID and email are required" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const { rawToken, tokenHash } = generateVerificationToken();
  const expiresAt = Date.now() + VERIFICATION_TOKEN_EXPIRY_MS;

  const payload: EmailVerificationTokenPayload = {
    userId,
    email: cleanEmail,
    tokenHash,
    expiresAt
  };

  const redis = getRedisClient();
  const redisKey = `email_verify:${tokenHash}`;

  if (redis) {
    try {
      await redis.set(redisKey, JSON.stringify(payload), { PX: VERIFICATION_TOKEN_EXPIRY_MS });
    } catch {
      MEMORY_VERIFY_STORE.set(tokenHash, payload);
    }
  } else {
    MEMORY_VERIFY_STORE.set(tokenHash, payload);
  }

  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3003";
  const verificationUrl = `${appBaseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

  const emailResult = await sendTransactionalEmail({
    to: cleanEmail,
    subject: "Verify your CodeArena email",
    text: `Welcome to CodeArena! Verify your email address using the link below:\n\n${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome to CodeArena!</p><p>Verify your email address using the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link expires in 24 hours.</p>`,
    metadata: {
      userId,
      type: "email_verification",
    },
  });

  if (!emailResult.success) {
    return {
      success: false,
      message: emailResult.message,
    };
  }

  return {
    success: true,
    message: "Verification email dispatched! Please check your inbox.",
    verificationToken: rawToken,
    verificationUrl
  };
}

/**
 * Verify an email verification token and update the user's status.
 */
export async function verifyEmailToken(rawToken: string): Promise<{ success: boolean; message: string; email?: string; userId?: string }> {
  if (!rawToken || typeof rawToken !== "string") {
    return { success: false, message: "Verification token is required" };
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
  const redis = getRedisClient();
  let payloadStr: string | null = null;

  if (redis) {
    try {
      payloadStr = await redis.get(`email_verify:${tokenHash}`);
    } catch {
      payloadStr = null;
    }
  }

  let payload: EmailVerificationTokenPayload | null = null;
  if (payloadStr) {
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      payload = null;
    }
  } else if (MEMORY_VERIFY_STORE.has(tokenHash)) {
    payload = MEMORY_VERIFY_STORE.get(tokenHash)!;
  }

  if (!payload) {
    return { success: false, message: "Verification token is invalid or has already been used." };
  }

  if (Date.now() > payload.expiresAt) {
    if (redis) await redis.del(`email_verify:${tokenHash}`).catch(() => {});
    MEMORY_VERIFY_STORE.delete(tokenHash);
    return { success: false, message: "Verification token has expired. Please request a new verification email." };
  }

  // Mark user as verified
  await setUserEmailVerified(payload.userId, payload.email);

  // Invalidate consumed token
  if (redis) {
    await redis.del(`email_verify:${tokenHash}`).catch(() => {});
  }
  MEMORY_VERIFY_STORE.delete(tokenHash);

  return {
    success: true,
    message: "Email address has been successfully verified! 🚀",
    email: payload.email,
    userId: payload.userId
  };
}
