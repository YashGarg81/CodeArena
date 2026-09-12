/**
 * Redis-backed atomic rate limiter with in-memory fail-closed fallback for single-node / emergency recovery.
 */
import type { Request, Response, NextFunction } from "express";
import { getRedisClient, isRedisReady } from "./redisClient";
import { TRUST_PROXY, IS_TEST } from "./config";

const memoryStore = new Map<string, { count: number; resetTime: number }>();
const failedLoginStore = new Map<string, { attempts: number; lockUntil: number }>();

// Periodic in-memory store eviction for expired keys (every 60 seconds)
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memoryStore.entries()) {
      if (now > v.resetTime) {
        memoryStore.delete(k);
      }
    }
    for (const [k, v] of failedLoginStore.entries()) {
      if (now > v.lockUntil) {
        failedLoginStore.delete(k);
      }
    }
  }, 60000);
  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

/**
 * Resolves the client's network IP address for rate limiting.
 */
export function getClientIp(req: Request): string {
  if (TRUST_PROXY) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "anonymous";
    if (Array.isArray(forwarded)) return forwarded[0] || "anonymous";
  }
  return String(req.ip || req.socket?.remoteAddress || "anonymous");
}

/**
 * Atomic multi-key check in local memory store.
 * Verifies that ALL keys have remaining quota before incrementing any key.
 */
function checkMemoryLimitsAtomic(keys: string[], maxRequests: number, windowMs: number): boolean {
  const now = Date.now();

  // Phase 1: Verify all keys have available quota
  for (const key of keys) {
    const record = memoryStore.get(key);
    if (record && now <= record.resetTime && record.count >= maxRequests) {
      return false; // Quota exceeded for at least one key
    }
  }

  // Phase 2: Atomically increment all keys
  for (const key of keys) {
    const record = memoryStore.get(key);
    if (!record || now > record.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      record.count++;
    }
  }

  return true;
}

/**
 * Atomic multi-key check in Redis using an EVAL script.
 * Guarantees zero partial quota exhaustion across IP and Account buckets.
 */
const REDIS_ATOMIC_RATELIMIT_LUA = `
local max_requests = tonumber(ARGV[1])
local window_sec = tonumber(ARGV[2])

for i, key in ipairs(KEYS) do
  local cur = tonumber(redis.call('get', key) or '0')
  if cur >= max_requests then
    return 0
  end
end

for i, key in ipairs(KEYS) do
  local val = redis.call('incr', key)
  if val == 1 then
    redis.call('expire', key, window_sec)
  end
end

return 1
`;

async function checkRedisLimitsAtomic(keys: string[], maxRequests: number, windowSec: number): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisReady()) {
    return checkMemoryLimitsAtomic(keys, maxRequests, windowSec * 1000);
  }

  try {
    const redisKeys = keys.map(k => `codearena:ratelimit:${k}`);
    const result = await redis.eval(
      REDIS_ATOMIC_RATELIMIT_LUA,
      {
        keys: redisKeys,
        arguments: [String(maxRequests), String(windowSec)]
      }
    );
    return Number(result) === 1;
  } catch (err) {
    // Fall back to memory with strict local atomic limits
    console.warn("[RateLimit Alert] Redis rate-limit execution failed, engaging safe local memory fallback:", err);
    return checkMemoryLimitsAtomic(keys, maxRequests, windowSec * 1000);
  }
}

/**
 * Account Brute-Force Defense:
 * Tracks consecutive failed authentication attempts on a specific email.
 * Prevents unauthenticated attackers from exhausting victim account quotas before password verification.
 */
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const FAILED_LOGIN_LOCK_MS = 15 * 60 * 1000; // 15 minutes

export async function isAccountLocked(email: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const redis = getRedisClient();
  if (redis && isRedisReady()) {
    try {
      const locked = await redis.get(`codearena:lockout:${cleanEmail}`);
      if (locked) return true;
    } catch {}
  }

  const record = failedLoginStore.get(cleanEmail);
  if (record && Date.now() < record.lockUntil) {
    return true;
  }
  return false;
}

export async function recordFailedLogin(email: string): Promise<{ locked: boolean; remainingAttempts: number }> {
  if (!email) return { locked: false, remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS };
  const cleanEmail = email.trim().toLowerCase();
  const now = Date.now();

  const record = failedLoginStore.get(cleanEmail) || { attempts: 0, lockUntil: 0 };
  record.attempts++;

  if (record.attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    record.lockUntil = now + FAILED_LOGIN_LOCK_MS;
    failedLoginStore.set(cleanEmail, record);

    const redis = getRedisClient();
    if (redis && isRedisReady()) {
      try {
        await redis.set(`codearena:lockout:${cleanEmail}`, "1", { EX: Math.ceil(FAILED_LOGIN_LOCK_MS / 1000) });
      } catch {}
    }
    return { locked: true, remainingAttempts: 0 };
  }

  failedLoginStore.set(cleanEmail, record);
  return { locked: false, remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS - record.attempts };
}

export async function resetFailedLogins(email: string): Promise<void> {
  if (!email) return;
  const cleanEmail = email.trim().toLowerCase();
  failedLoginStore.delete(cleanEmail);

  const redis = getRedisClient();
  if (redis && isRedisReady()) {
    try {
      await redis.del(`codearena:lockout:${cleanEmail}`);
    } catch {}
  }
}

/**
 * Creates an Express rate-limiting middleware with atomic multi-key evaluation and fail-closed handling.
 */
export function createRateLimiter(
  name: string,
  maxRequests: number,
  windowMs: number,
  options: {
    failClosed?: boolean;
    keyGenerator?: (req: Request) => string | string[];
  } = {}
) {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const failClosed = options.failClosed ?? (name.includes("auth") || name.includes("login") || name.includes("register") || name.includes("submit"));

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (IS_TEST && req.headers && req.headers["x-test-bypass-ratelimit"]) {
      return next();
    }
    try {
      const ip = getClientIp(req);
      const customKeys = options.keyGenerator ? options.keyGenerator(req) : [];
      const additionalKeys = Array.isArray(customKeys) ? customKeys : (customKeys ? [customKeys] : []);
      const keys = [`${name}:ip:${ip}`, ...additionalKeys.map(k => `${name}:${k}`)];

      const allowed = await checkRedisLimitsAtomic(keys, maxRequests, windowSec);
      if (!allowed) {
        res.status(429).json({ error: "Too many requests. Please slow down and try again later." });
        return;
      }
      next();
    } catch (err) {
      if (failClosed) {
        const ip = getClientIp(req);
        const keys = [`${name}:ip:${ip}`];
        const memoryAllowed = checkMemoryLimitsAtomic(keys, maxRequests, windowMs);
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

// ─── SPECIALIZED PRODUCTION LIMITERS ─────────────────────────────────────────

export const signupRateLimiter = createRateLimiter("signup", 60, 60 * 1000); // 60 signups / min per IP
export const loginRateLimiter = createRateLimiter("login", 60, 60 * 1000);   // 60 login requests / min per IP
export const passwordResetRateLimiter = createRateLimiter("password-reset", 5, 15 * 60 * 1000, {
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : null;
    return email ? [`email:${email}`] : [];
  }
});
export const submissionRateLimiter = createRateLimiter("submission", 20, 60 * 1000, {
  keyGenerator: (req: any) => req.userId ? [`user:${req.userId}`] : []
});
export const runCodeRateLimiter = createRateLimiter("run-code", 40, 60 * 1000, {
  keyGenerator: (req: any) => req.userId ? [`user:${req.userId}`] : []
});
export const storageUploadRateLimiter = createRateLimiter("storage-upload", 25, 10 * 60 * 1000, {
  keyGenerator: (req: any) => req.userId ? [`user:${req.userId}`] : []
});

export function resetRateLimits(): void {
  memoryStore.clear();
  failedLoginStore.clear();
}

