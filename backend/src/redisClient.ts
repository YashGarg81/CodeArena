/**
 * Shared Redis client for rate limiting, caching, and job queues.
 */
import { createClient, type RedisClientType } from "redis";
import { IS_TEST } from "./config";

let client: RedisClientType | null = null;
let connected = false;

export function getRedisClient(): RedisClientType | null {
  return connected ? client : null;
}

export function isRedisReady(): boolean {
  return connected;
}

export async function initRedis(): Promise<RedisClientType | null> {
  if (IS_TEST) return null;
  if (client && connected) return client;

  try {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    client = createClient({ url }) as RedisClientType;
    client.on("error", () => {
      connected = false;
    });
    client.on("connect", () => {
      connected = true;
    });
    await client.connect();
    connected = true;
    return client;
  } catch {
    connected = false;
    client = null;
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (client) {
    try {
      await client.quit();
    } catch {
      // ignore shutdown errors
    }
  }
  client = null;
  connected = false;
}

// Auto-init for non-test environments (fire-and-forget)
if (!IS_TEST) {
  initRedis().catch(() => {});
}
