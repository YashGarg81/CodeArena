import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const rawDbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/codearena?schema=public";
const dbUrl = rawDbUrl.includes("@postgres:") ? rawDbUrl.replace("@postgres:", "@localhost:") : rawDbUrl;

let rawPrisma: any;
try {
  const adapter = new PrismaPg({ connectionString: dbUrl });
  rawPrisma = new PrismaClient({ adapter } as any);
} catch {
  rawPrisma = new PrismaClient();
}

export function isProductionStrict(): boolean {
  return process.env.NODE_ENV === "production" && process.env.ALLOW_IN_MEMORY_DB !== "true";
}

export async function assertWorkerPostgres(): Promise<void> {
  try {
    await rawPrisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    throw new Error(`Production Database Error: PostgreSQL is unavailable: ${err?.message || err}`);
  }
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
            return list.find(i => i.id === queryOptions.where?.id || i.slug === queryOptions.where?.slug) || null;
          }
          if (methodKey === "findMany") return [...list];
          if (methodKey === "update" || methodKey === "upsert") {
            const dataToSet = queryOptions.update || queryOptions.create || queryOptions.data || {};
            const idx = list.findIndex(i => i.id === queryOptions.where?.id);
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