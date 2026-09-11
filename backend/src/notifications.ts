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
}

export const notificationService = new NotificationService();
