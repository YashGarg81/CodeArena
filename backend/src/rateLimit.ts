/**
 * Redis-backed rate limiter with in-memory fallback for single-node dev.
 */
import type { Request, Response, NextFunction } from "express";
import { getRedisClient, isRedisReady } from "./redisClient";
import { TRUST_PROXY } from "./config";

const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Resolves the client's network IP address for rate limiting.
 *
 * SECURITY NOTE:
 * When TRUST_PROXY is true, the upstream infrastructure MUST guarantee that:
 * 1. Express is sitting strictly behind a trusted reverse proxy (e.g. Cloudflare / Nginx / ALB).
 * 2. Clients cannot bypass the reverse proxy to communicate directly with Express.
 * If clients can reach Express directly while TRUST_PROXY=true, arbitrary
 * `X-Forwarded-For` header spoofing can bypass IP-based rate limiting.
 */
export function getClientIp(req: Request): string {
  if (TRUST_PROXY) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "anonymous";
    if (Array.isArray(forwarded)) return forwarded[0] || "anonymous";
  }
  return String(req.ip || req.socket.remoteAddress || "anonymous");
}

async function checkRedisLimit(key: string, maxRequests: number, windowSec: number): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisReady()) return checkMemoryLimit(key, maxRequests, windowSec * 1000);

  const redisKey = `codearena:ratelimit:${key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.expire(redisKey, windowSec);
  }
  return count <= maxRequests;
}

function checkMemoryLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = memoryStore.get(key);
  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

export function createRateLimiter(
  name: string,
  maxRequests: number,
  windowMs: number,
  options: { failClosed?: boolean } = {}
) {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  // Security-critical limiters (auth, registration, submissions) fail closed on unhandled errors
  const failClosed = options.failClosed ?? (name.includes("auth") || name.includes("login") || name.includes("register") || name.includes("submit"));

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = getClientIp(req);
      const key = `${name}:${ip}`;
      const allowed = await checkRedisLimit(key, maxRequests, windowSec);

      if (!allowed) {
        res.status(429).json({ error: "Too many requests. Please slow down and try again later." });
        return;
      }
      next();
    } catch (err) {
      // For security-critical endpoints, don't blindly fail open if rate limiting infrastructure errors out
      if (failClosed) {
        // Attempt immediate synchronous in-memory rate check as emergency defense
        const ip = getClientIp(req);
        const key = `${name}:${ip}`;
        const memoryAllowed = checkMemoryLimit(key, maxRequests, windowMs);
        if (!memoryAllowed) {
          res.status(429).json({ error: "Too many requests. Please slow down and try again later." });
          return;
        }
      }
      next();
    }
  };
}

export function getRateLimiterBackend(): "redis" | "memory" {
  return isRedisReady() ? "redis" : "memory";
}
