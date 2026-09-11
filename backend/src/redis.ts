// backend/src/redis.ts
import { createClient } from "redis";

class CacheManager {
  private inMemoryStore = new Map<string, { value: string; expiresAt: number }>();
  private redisClient: any = null;
  private isRedisConnected = false;

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    try {
      const url = process.env.REDIS_URL || "redis://localhost:6379";
      this.redisClient = createClient({ url });
      this.redisClient.on("error", (err: any) => {
        // Fallback silently to in-memory cache
        this.isRedisConnected = false;
      });
      this.redisClient.on("connect", () => {
        this.isRedisConnected = true;
      });
      await this.redisClient.connect();
    } catch {
      this.isRedisConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch {
        // Fallback to in-memory
      }
    }
    const item = this.inMemoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttlSeconds, value);
        return;
      } catch {
        // Fallback to in-memory
      }
    }
    this.inMemoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {}
    }
    this.inMemoryStore.delete(key);
  }

  async flush(): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushAll();
      } catch {}
    }
    this.inMemoryStore.clear();
  }

  getStatus() {
    return {
      type: this.isRedisConnected ? "Redis Cluster" : "In-Memory Fallback Cache",
      connected: this.isRedisConnected,
      inMemoryKeys: this.inMemoryStore.size
    };
  }
}

export const cache = new CacheManager();
