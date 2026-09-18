import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

console.log("[Worker DB] Module loading...");

const rawDbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public";
// In Docker compose, the worker must connect to the postgres container by name.
// Only rewrite @postgres: to @localhost: when running locally outside compose (dev mode).
const isInCompose = process.env.DOCKER_COMPOSE === "true" || process.env.IN_DOCKER === "true";
const dbUrl = (!isInCompose && rawDbUrl.includes("@postgres:")) ? rawDbUrl.replace("@postgres:", "@localhost:") : rawDbUrl;

console.log("[Worker DB] Connecting to:", dbUrl.replace(/:[^:]+@/, ":****@"));
console.log("[Worker DB] DOCKER_COMPOSE:", process.env.DOCKER_COMPOSE);
console.log("[Worker DB] IN_DOCKER:", process.env.IN_DOCKER);
console.log("[Worker DB] isInCompose:", isInCompose);

let rawPrisma: any;
try {
  const adapter = new PrismaPg({ connectionString: dbUrl });
  rawPrisma = new PrismaClient({ adapter } as any);
  console.log("[Worker DB] PrismaPg adapter connected successfully");
} catch (e: any) {
  console.error("[Worker DB] PrismaPg adapter failed:", e.message);
  console.error("[Worker DB] PrismaPg adapter stack:", e.stack);
  try {
    rawPrisma = new PrismaClient();
    console.log("[Worker DB] Fallback PrismaClient created");
  } catch (e2: any) {
    console.error("[Worker DB] Fallback PrismaClient failed:", e2.message);
    rawPrisma = {};
  }
}

export function isProductionStrict(): boolean {
  return process.env.NODE_ENV === "production" && process.env.ALLOW_IN_MEMORY_DB !== "true";
}

export async function assertWorkerPostgres(): Promise<void> {
  let lastErr: any;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await rawPrisma.$queryRaw`SELECT 1`;
      console.log("[Worker DB] PostgreSQL connection verified");
      return;
    } catch (err: any) {
      lastErr = err;
      console.warn(`[Worker DB] Connection attempt ${attempt}/10 failed: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error(`Production Database Error: PostgreSQL is unavailable after retries: ${lastErr?.message || lastErr}`);
}

const workerStore: Record<string, any[]> = {
  submission: [],
  problems: []
};

const handler: ProxyHandler<any> = {
  get(target, propKey: string) {
    if (typeof propKey === "symbol" || propKey.startsWith("$")) {
      const val = target[propKey];
      return typeof val === "function" ? val.bind(target) : val;
    }

    const orig = target[propKey];
    const dummyTarget = orig || {};

    return new Proxy(dummyTarget, {
      get(modelTarget, methodKey: string) {
        const modelMethod = modelTarget[methodKey];
        return async function (...args: any[]) {
          const strictProd = isProductionStrict();
          try {
            if (typeof modelMethod === "function") {
              return await modelMethod.apply(modelTarget, args);
            }
          } catch (err: any) {
            // Fail closed in production: never serve the empty local store
            // when PostgreSQL is unreachable (dev/test keep the fallback).
            if (strictProd) throw err;
            // Fallback
          }

          const modelName = propKey.toLowerCase();
          const list = workerStore[modelName] || [];
          const queryOptions = args[0] || {};

          if (methodKey === "findUnique" || methodKey === "findFirst") {
            return list.find((i) => i.id === queryOptions.where?.id || i.slug === queryOptions.where?.slug) || null;
          }
          if (methodKey === "findMany") return [...list];
          if (methodKey === "update" || methodKey === "upsert") {
            const dataToSet = queryOptions.update || queryOptions.create || queryOptions.data || {};
            const idx = list.findIndex((i) => i.id === queryOptions.where?.id);
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...dataToSet, updatedAt: new Date() };
              return list[idx];
            }
            const newItem = { id: queryOptions.where?.id || `sub_${Date.now()}`, ...dataToSet, updatedAt: new Date() };
            list.push(newItem);
            return newItem;
          }
          return null;
        };
      }
    });
  }
};

export const prisma = new Proxy(rawPrisma, handler);