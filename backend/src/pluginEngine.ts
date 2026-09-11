// backend/src/pluginEngine.ts
import { EventEmitter } from "events";

export type PluginType = "INTEGRATION" | "JUDGE_EXTENSION" | "AI_TOOL" | "COMMUNITY_CONNECTOR";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description: string;
  icon: string;
  enabled: boolean;
  webhookUrl?: string;
  authConfig?: Record<string, string>;
  supportedEvents: string[];
}

export interface WebhookEventPayload {
  eventId: string;
  event: "SUBMISSION_ACCEPTED" | "CONTEST_STARTING" | "ARENA_MATCH_WON" | "MENTOR_BOOKED";
  timestamp: string;
  data: Record<string, unknown>;
}

export class PluginManager extends EventEmitter {
  private plugins: Map<string, PluginManifest> = new Map();

  constructor() {
    super();
    this.registerDefaultPlugins();
  }

  private registerDefaultPlugins() {
    const defaultPlugins: PluginManifest[] = [
      {
        id: "plugin_github",
        name: "GitHub Solution Sync",
        version: "1.4.0",
        type: "INTEGRATION",
        description: "Automatically commits accepted solutions to user GitHub repositories with formatted READMEs.",
        icon: "🐙",
        enabled: true,
        supportedEvents: ["SUBMISSION_ACCEPTED"]
      },
      {
        id: "plugin_discord",
        name: "Discord Bot & Webhooks",
        version: "2.1.0",
        type: "COMMUNITY_CONNECTOR",
        description: "Streams contest announcements, 1v1 battle results, and daily streak alerts to Discord channels.",
        icon: "🎮",
        enabled: true,
        webhookUrl: "https://discord.com/api/webhooks/codearena/events",
        supportedEvents: ["CONTEST_STARTING", "ARENA_MATCH_WON", "SUBMISSION_ACCEPTED"]
      },
      {
        id: "plugin_slack",
        name: "Slack Engineering Workspace",
        version: "1.2.0",
        type: "INTEGRATION",
        description: "Notifies team channels about shared mock interviews, team contests, and leaderboard updates.",
        icon: "💬",
        enabled: true,
        supportedEvents: ["CONTEST_STARTING", "MENTOR_BOOKED"]
      },
      {
        id: "plugin_vscode",
        name: "VS Code Extension Companion",
        version: "3.0.0",
        type: "JUDGE_EXTENSION",
        description: "Direct bridge enabling problem retrieval, test execution, and code submission from VS Code.",
        icon: "💻",
        enabled: true,
        supportedEvents: ["SUBMISSION_ACCEPTED"]
      },
      {
        id: "plugin_gcal",
        name: "Google Calendar Contest Sync",
        version: "1.0.5",
        type: "INTEGRATION",
        description: "Adds upcoming competitive rounds and booked 1:1 mentorship sessions directly to Google Calendar.",
        icon: "📅",
        enabled: true,
        supportedEvents: ["CONTEST_STARTING", "MENTOR_BOOKED"]
      },
      {
        id: "plugin_jira",
        name: "Jira / Linear Issue Tracker",
        version: "1.1.0",
        type: "INTEGRATION",
        description: "Syncs interview feedback rubrics and course curriculum task milestones to Jira/Linear projects.",
        icon: "📋",
        enabled: false,
        supportedEvents: ["MENTOR_BOOKED"]
      }
    ];

    for (const p of defaultPlugins) {
      this.plugins.set(p.id, p);
    }
  }

  public listPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  public togglePlugin(id: string, enabled: boolean): PluginManifest | null {
    const plugin = this.plugins.get(id);
    if (!plugin) return null;
    plugin.enabled = enabled;
    return plugin;
  }

  public dispatchEvent(event: WebhookEventPayload["event"], data: Record<string, unknown>): void {
    const payload: WebhookEventPayload = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event,
      timestamp: new Date().toISOString(),
      data
    };

    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.supportedEvents.includes(event)) {
        this.emit("plugin_dispatched", { pluginId: plugin.id, payload });
      }
    }
  }
}

export const pluginManager = new PluginManager();
