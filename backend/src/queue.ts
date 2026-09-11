// backend/src/queue.ts
import { EventEmitter } from "events";
import { prisma } from "../db";
import { getRedisClient, isRedisReady } from "./redisClient";
import { IS_TEST } from "./config";

export interface BackgroundJob {
  id: string;
  queue: "emails" | "notifications" | "analytics" | "audit";
  type: string;
  payload: unknown;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: string;
  processedAt?: string;
}

const REDIS_JOB_QUEUE = "codearena:background-jobs";

class QueueManager extends EventEmitter {
  private isProcessing = false;
  private memoryJobs: BackgroundJob[] = [];

  constructor() {
    super();
    if (!IS_TEST) {
      setInterval(() => this.processNextBatch(), 2000);
    }
  }

  enqueue(queue: BackgroundJob["queue"], type: string, payload: unknown): BackgroundJob {
    const job: BackgroundJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      queue,
      type,
      payload,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    };

    this.memoryJobs.push(job);
    this.persistJob(job).catch(() => {});
    this.pushToRedis(job).catch(() => {});
    this.emit("enqueued", job);
    return job;
  }

  private async persistJob(job: BackgroundJob): Promise<void> {
    try {
      await prisma.backgroundJob.create({
        data: {
          id: job.id,
          queue: job.queue,
          type: job.type,
          payload: job.payload as any,
          status: job.status,
          attempts: job.attempts,
          maxAttempts: job.maxAttempts,
        },
      });
    } catch {
      // DB may be offline — in-memory queue still works
    }
  }

  private async pushToRedis(job: BackgroundJob): Promise<void> {
    const redis = getRedisClient();
    if (!redis || !isRedisReady()) return;
    await redis.lPush(REDIS_JOB_QUEUE, JSON.stringify({ id: job.id, queue: job.queue }));
  }

  private async processNextBatch(): Promise<void> {
    if (this.isProcessing) return;

    const pendingJobs = this.memoryJobs.filter((j) => j.status === "pending").slice(0, 5);
    if (pendingJobs.length === 0) return;

    this.isProcessing = true;
    for (const job of pendingJobs) {
      job.status = "processing";
      job.attempts++;
      try {
        await this.handleJob(job);
        job.status = "completed";
        job.processedAt = new Date().toISOString();
        await this.updateJobStatus(job);
        this.emit("completed", job);
      } catch (err: unknown) {
        job.error = err instanceof Error ? err.message : "Execution failure";
        if (job.attempts >= job.maxAttempts) {
          job.status = "failed";
          this.emit("failed", job);
        } else {
          job.status = "pending";
        }
        await this.updateJobStatus(job);
      }
    }
    this.isProcessing = false;
  }

  private async updateJobStatus(job: BackgroundJob): Promise<void> {
    try {
      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: job.status,
          attempts: job.attempts,
          error: job.error ?? null,
          processedAt: job.processedAt ? new Date(job.processedAt) : null,
        },
      });
    } catch {
      // ignore persistence errors for job status updates
    }
  }

  private async handleJob(job: BackgroundJob): Promise<void> {
    switch (job.queue) {
      case "audit":
        // Audit logs are already persisted synchronously; job confirms delivery
        break;
      case "notifications":
        // Notifications are already persisted; future: push to websocket/email
        break;
      case "emails":
        // Placeholder for transactional email provider integration
        break;
      case "analytics":
        // Placeholder for analytics pipeline
        break;
      default:
        break;
    }
  }

  getJobs(limit = 20): BackgroundJob[] {
    return this.memoryJobs.slice(-limit).reverse();
  }

  getStats() {
    const total = this.memoryJobs.length;
    const pending = this.memoryJobs.filter((j) => j.status === "pending").length;
    const completed = this.memoryJobs.filter((j) => j.status === "completed").length;
    const failed = this.memoryJobs.filter((j) => j.status === "failed").length;
    return {
      total,
      pending,
      completed,
      failed,
      backend: isRedisReady() ? "redis+postgres" : "memory+postgres",
    };
  }
}

export const backgroundQueue = new QueueManager();
