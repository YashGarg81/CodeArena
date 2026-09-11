// backend/src/passwordReset.ts
import crypto from "crypto";
import { prisma } from "../db";
import { getRedisClient } from "./redisClient";
import { validatePassword } from "./validation";
import { safeErrorMessage } from "./config";
import { sendTransactionalEmail } from "./emailService";

export interface PasswordResetTokenPayload {
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: number; // timestamp in ms
}

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const MEMORY_RESET_STORE = new Map<string, { userId: string; email: string; tokenHash: string; expiresAt: number }>();

/**
 * Generate a cryptographically secure 256-bit random reset token.
 */
export function generateSecureResetToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

/**
 * Request a password reset for a given email address.
 * Stores a cryptographically hashed token with a 15-minute expiration time.
 * Returns the raw token and metadata (or mock link for testing/dev environments).
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetToken?: string; resetUrl?: string }> {
  if (!email || typeof email !== "string") {
    return { success: false, message: "A valid email address is required" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email: cleanEmail }
  });

  // Always return generic success message to prevent user enumeration
  if (!user) {
    return {
      success: true,
      message: "If an account with that email exists, a password reset link has been dispatched."
    };
  }

  if (user.isSuspended) {
    return {
      success: false,
      message: "Account suspended. Please contact platform administration."
    };
  }

  const { rawToken, tokenHash } = generateSecureResetToken();
  const expiresAt = Date.now() + RESET_TOKEN_EXPIRY_MS;
  const payload: PasswordResetTokenPayload = {
    userId: user.id,
    email: user.email,
    tokenHash,
    expiresAt
  };

  const redis = getRedisClient();
  const redisKey = `pwd_reset:${tokenHash}`;

  if (redis) {
    try {
      await redis.set(redisKey, JSON.stringify(payload), { PX: RESET_TOKEN_EXPIRY_MS });
    } catch {
      MEMORY_RESET_STORE.set(tokenHash, payload);
    }
  } else {
    MEMORY_RESET_STORE.set(tokenHash, payload);
  }

  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3003";
  const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  const emailResult = await sendTransactionalEmail({
    to: user.email,
    subject: "Reset your CodeArena password",
    text: `You requested a password reset. Use the secure link below to create a new password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`,
    html: `<p>You requested a password reset.</p><p>Use the secure link below to create a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 15 minutes.</p>`,
    metadata: {
      userId: user.id,
      email: user.email,
      type: "password_reset",
    },
  });

  if (!emailResult.success) {
    return {
      success: false,
      message: emailResult.message,
    };
  }

  // Only expose resetToken in response when explicitly opted-in via DEV_RESET_TOKEN=true
  const isExplicitDevTokenAllowed = process.env.DEV_RESET_TOKEN === "true";
  return {
    success: true,
    message: "If an account with that email exists, a password reset link has been dispatched.",
    ...(isExplicitDevTokenAllowed ? { resetToken: rawToken, resetUrl } : {})
  };
}

/**
 * Validate a raw reset token and ensure it has not expired or already been consumed.
 */
export async function verifyResetToken(rawToken: string): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }> {
  if (!rawToken || typeof rawToken !== "string") {
    return { valid: false, error: "Reset token is required" };
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
  const redis = getRedisClient();
  let payloadStr: string | null = null;

  if (redis) {
    try {
      payloadStr = await redis.get(`pwd_reset:${tokenHash}`);
    } catch {
      payloadStr = null;
    }
  }

  let payload: PasswordResetTokenPayload | null = null;
  if (payloadStr) {
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      payload = null;
    }
  } else if (MEMORY_RESET_STORE.has(tokenHash)) {
    payload = MEMORY_RESET_STORE.get(tokenHash)!;
  }

  if (!payload) {
    return { valid: false, error: "Password reset token is invalid, already used, or expired." };
  }

  if (Date.now() > payload.expiresAt) {
    if (redis) await redis.del(`pwd_reset:${tokenHash}`).catch(() => {});
    MEMORY_RESET_STORE.delete(tokenHash);
    return { valid: false, error: "Password reset token has expired. Please request a new one." };
  }

  return { valid: true, userId: payload.userId, email: payload.email };
}

/**
 * Reset the user's password using the verified reset token.
 * Hashes new password, revokes all active device sessions, and consumes the token.
 */
export async function resetPasswordWithToken(rawToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const verification = await verifyResetToken(rawToken);
  if (!verification.valid || !verification.userId) {
    return { success: false, message: verification.error || "Invalid or expired reset token" };
  }

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) {
    return { success: false, message: passwordCheck.error || "Password does not meet complexity requirements." };
  }

  try {
    const passwordHash = await Bun.password.hash(newPassword);

    // 1. Update user password
    await prisma.user.update({
      where: { id: verification.userId },
      data: { password: passwordHash }
    });

    // 2. Security requirement: Revoke all active sessions & refresh tokens
    await prisma.session.updateMany({
      where: { userId: verification.userId },
      data: { isRevoked: true }
    });

    await prisma.refreshToken.updateMany({
      where: { userId: verification.userId },
      data: { isRevoked: true }
    });

    // 3. Invalidate / consume reset token immediately
    const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
    const redis = getRedisClient();
    if (redis) {
      await redis.del(`pwd_reset:${tokenHash}`).catch(() => {});
    }
    MEMORY_RESET_STORE.delete(tokenHash);

    return {
      success: true,
      message: "Password has been successfully updated. All active sessions have been securely terminated."
    };
  } catch (err: any) {
    return {
      success: false,
      message: safeErrorMessage(err, "Failed to reset password")
    };
  }
}
