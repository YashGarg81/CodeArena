/**
 * Redis-backed rate limiter with in-memory fallback for single-node dev.
 */
import type { Request, Response, NextFunction } from "express";
import { getRedisClient, isRedisReady } from "./redisClient";
import { TRUST_PROXY } from "./config";

const memoryStore = new Map<string, { count: number; resetTime: number }>();

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

export function createRateLimiter(name: string, maxRequests: number, windowMs: number) {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));

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
    } catch {
      // Fail open on rate limiter errors to avoid blocking legitimate traffic
      next();
    }
  };
}

export function getRateLimiterBackend(): "redis" | "memory" {
  return isRedisReady() ? "redis" : "memory";
}
