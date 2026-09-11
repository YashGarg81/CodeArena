// backend/src/notifications.ts
import { prisma } from "../db";
import { backgroundQueue } from "./queue";

export type NotificationType = "achievement" | "contest" | "system" | "forum" | "submission";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: "solving" | "streak" | "contests" | "system-design" | "community";
}

export const ACHIEVEMENTS_LIST: AchievementItem[] = [
  { id: "ach_first_solve", name: "First Step", description: "Solved your first coding problem", icon: "🌱", xpReward: 50, category: "solving" },
  { id: "ach_streak_7", name: "Consistency King", description: "Maintained a 7-day coding streak", icon: "🔥", xpReward: 150, category: "streak" },
  { id: "ach_contest_debut", name: "Contest Challenger", description: "Participated in a live coding contest", icon: "🏆", xpReward: 200, category: "contests" },
  { id: "ach_architect", name: "Systems Architect", description: "Completed an architecture design review", icon: "🏗️", xpReward: 250, category: "system-design" },
  { id: "ach_community_voice", name: "Community Contributor", description: "Published a post or solution in Discuss", icon: "💬", xpReward: 100, category: "community" },
];

function mapNotification(record: {
  id: string;
  userId: string | null;
  isBroadcast: boolean;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
}): NotificationItem {
  return {
    id: record.id,
    userId: record.isBroadcast ? "all" : (record.userId ?? "all"),
    title: record.title,
    message: record.message,
    type: record.type as NotificationType,
    read: record.read,
    link: record.link ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

class NotificationService {
  async send(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = "system",
    link?: string
  ): Promise<NotificationItem> {
    const isBroadcast = userId === "all";

    const record = await prisma.notification.create({
      data: {
        userId: isBroadcast ? null : userId,
        isBroadcast,
        title,
        message,
        type: type as any,
        link: link ?? null,
      },
    });

    const item = mapNotification(record);
    backgroundQueue.enqueue("notifications", "DISPATCH_NOTIFICATION", item);
    return item;
  }

  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    const records = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { isBroadcast: true }],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return records.map(mapNotification);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const result = await prisma.notification.updateMany({
      where: {
        id,
        OR: [{ userId }, { isBroadcast: true }],
      },
      data: { read: true },
    });
    return result.count > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        read: false,
        OR: [{ userId }, { isBroadcast: true }],
      },
      data: { read: true },
    });
    return result.count;
  }

  /**
   * Send notification with deduplication window (e.g. 1 hour window for same title & recipient)
   */
  async sendWithDeduplication(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = "system",
    link?: string,
    dedupWindowMinutes = 60
  ): Promise<NotificationItem | null> {
    const windowStart = new Date(Date.now() - dedupWindowMinutes * 60 * 1000);
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        title,
        createdAt: { gte: windowStart }
      }
    });
    if (existing) {
      return null;
    }
    return this.send(userId, title, message, type, link);
  }

  /**
   * Standardized Event Emitters for Platform Events
   */
  async onSubmissionCompleted(userId: string, problemTitle: string, status: string, submissionId: string) {
    const isSuccess = status === "Success";
    return this.send(
      userId,
      isSuccess ? "Submission Accepted 🎉" : "Submission Result Available",
      isSuccess
        ? `Congratulations! Your solution for "${problemTitle}" passed all test cases.`
        : `Your submission for "${problemTitle}" concluded with verdict: ${status}.`,
      "submission",
      `/submissions/${submissionId}`
    );
  }

  async onInterviewScheduled(userId: string, interviewTitle: string, interviewId: string, scheduledDate: string) {
    return this.send(
      userId,
      "Technical Interview Scheduled 📅",
      `You have a technical interview "${interviewTitle}" scheduled for ${scheduledDate}.`,
      "system",
      `/interviews`
    );
  }

  async onContestStarts(contestTitle: string, contestId: string) {
    return this.send(
      "all",
      "Live Coding Contest Started ⚔️",
      `"${contestTitle}" is now live! Join now to compete for rating points.`,
      "contest",
      `/contests/${contestId}`
    );
  }

  async onCommentReply(userId: string, replierName: string, discussionTitle: string, discussionId: string) {
    return this.send(
      userId,
      "New Reply on Discussion 💬",
      `${replierName} replied to "${discussionTitle}".`,
      "forum",
      `/discuss`
    );
  }

  async onAchievementUnlocked(userId: string, achievementName: string, xpReward: number) {
    return this.sendWithDeduplication(
      userId,
      `Achievement Unlocked: ${achievementName} 🏆`,
      `You unlocked "${achievementName}" and earned +${xpReward} XP!`,
      "achievement",
      `/profile`,
      1440
    );
  }
}

export const notificationService = new NotificationService();
