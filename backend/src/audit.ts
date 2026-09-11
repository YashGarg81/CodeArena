// backend/src/audit.ts
import { prisma } from "../db";
import { backgroundQueue } from "./queue";

export interface AuditRecord {
  id: string;
  userId?: string | null;
  action: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: string;
}

class AuditService {
  async log(
    action: string,
    options: {
      userId?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<AuditRecord> {
    const record = await prisma.auditLog.create({
      data: {
        action,
        userId: options.userId ?? null,
        resourceId: options.resourceId ?? null,
        metadata: options.metadata ?? undefined,
        ipAddress: options.ipAddress ?? "127.0.0.1",
        userAgent: options.userAgent ?? null,
      },
    });

    const mapped: AuditRecord = {
      id: record.id,
      action: record.action,
      userId: record.userId,
      resourceId: record.resourceId,
      metadata: record.metadata as Record<string, unknown> | null,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      timestamp: record.createdAt.toISOString(),
    };

    backgroundQueue.enqueue("audit", "PERSIST_AUDIT_LOG", mapped);
    return mapped;
  }

  async getRecentLogs(limit = 50): Promise<AuditRecord[]> {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return logs.map((record: {
      id: string;
      action: string;
      userId: string | null;
      resourceId: string | null;
      metadata: unknown;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
    }) => ({
      id: record.id,
      action: record.action,
      userId: record.userId,
      resourceId: record.resourceId,
      metadata: record.metadata as Record<string, unknown> | null,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      timestamp: record.createdAt.toISOString(),
    }));
  }
}

export const auditService = new AuditService();
