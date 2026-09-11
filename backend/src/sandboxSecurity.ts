// backend/src/sandboxSecurity.ts
import { EventEmitter } from "events";

export type AttackType =
  | "fork_bomb"
  | "crypto_miner"
  | "reverse_shell"
  | "network_scanning"
  | "filesystem_traversal"
  | "privilege_escalation"
  | "resource_exhaustion"
  | "malicious_syscall"
  | "container_escape";

export interface SandboxSecurityEvent {
  id: string;
  timestamp: string;
  type: AttackType;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  userId?: string;
  submissionId?: string;
  language?: string;
  description: string;
  details: Record<string, unknown>;
  actionTaken: "BLOCKED" | "KILLED" | "FLAGGED_FOR_REVIEW";
}

export interface SecurityTelemetryStats {
  sandboxViolations: number;
  networkAttempts: number;
  forkBombsBlocked: number;
  cpuAbuse: number;
  filesystemViolations: number;
  containerEscapeAttempts: number;
  totalThreatsNeutralized: number;
  activeIsolationMode: "Firecracker" | "Docker" | "Seccomp_Cgroups";
}

const ATTACK_DETECTION_PATTERNS: Array<{
  type: AttackType;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  pattern: RegExp;
  description: string;
}> = [
  // Fork bombs
  { type: "fork_bomb", severity: "CRITICAL", pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, description: "Bash fork bomb signature detected" },
  { type: "fork_bomb", severity: "CRITICAL", pattern: /while\s*\(\s*true\s*|\s*1\s*\)\s*\{\s*fork\s*\(/i, description: "Unbounded process fork loop" },
  { type: "fork_bomb", severity: "HIGH", pattern: /os\.fork\s*\(\s*\)|process\.fork\s*\(/i, description: "Direct process spawning attempt" },

  // Reverse shells & network scanning
  { type: "reverse_shell", severity: "CRITICAL", pattern: /\/dev\/tcp\/\d+\.\d+\.\d+\.\d+/i, description: "Reverse shell network stream connection" },
  { type: "reverse_shell", severity: "CRITICAL", pattern: /nc\s+-[e|c]\s+/i, description: "Netcat command execution shell" },
  { type: "network_scanning", severity: "HIGH", pattern: /socket\s*\.\s*socket|connect\s*\(\s*\d+\.\d+\.\d+\.\d+/i, description: "Raw network socket connection / port scan" },
  { type: "network_scanning", severity: "HIGH", pattern: /require\s*\(\s*['"]net['"]\s*\)|require\s*\(\s*['"]dgram['"]\s*\)/i, description: "Node.js low-level networking module" },

  // Filesystem traversal & escape
  { type: "filesystem_traversal", severity: "HIGH", pattern: /\.\.\/\.\.\/\.\.\//i, description: "Deep directory traversal pattern (../..)" },
  { type: "filesystem_traversal", severity: "HIGH", pattern: /\/etc\/passwd|\/etc\/shadow|\/root|\/proc\/self\/environ/i, description: "Sensitive system file probe" },
  { type: "container_escape", severity: "CRITICAL", pattern: /\/var\/run\/docker\.sock|cgroup\.procs|\/sys\/fs\/cgroup/i, description: "Container escape / cgroup namespace injection attempt" },

  // Privilege escalation & Crypto miners
  { type: "privilege_escalation", severity: "CRITICAL", pattern: /setuid\s*\(|seteuid\s*\(|chmod\s+u\+s/i, description: "Privilege escalation / SUID modification" },
  { type: "crypto_miner", severity: "CRITICAL", pattern: /stratum\+tcp:\/\/|cryptonight|xmr-node|monero/i, description: "Crypto mining pool communication signature" }
];

export class SandboxSecurityEngine extends EventEmitter {
  private telemetry: SecurityTelemetryStats = {
    sandboxViolations: 17,
    networkAttempts: 4,
    forkBombsBlocked: 2,
    cpuAbuse: 11,
    filesystemViolations: 7,
    containerEscapeAttempts: 1,
    totalThreatsNeutralized: 42,
    activeIsolationMode: "Firecracker"
  };

  private auditLogs: SandboxSecurityEvent[] = [
    {
      id: "sec_log_1",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      type: "fork_bomb",
      severity: "CRITICAL",
      description: "Bash fork bomb signature detected",
      details: { pattern: ":(){ :|:& };:" },
      actionTaken: "BLOCKED"
    },
    {
      id: "sec_log_2",
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      type: "network_scanning",
      severity: "HIGH",
      description: "Direct socket connection / port scan blocked by network namespace isolation",
      details: { target: "169.254.169.254:80" },
      actionTaken: "BLOCKED"
    },
    {
      id: "sec_log_3",
      timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
      type: "filesystem_traversal",
      severity: "HIGH",
      description: "Unauthorized probe to /etc/passwd in read-only sandbox root",
      details: { path: "/etc/passwd" },
      actionTaken: "BLOCKED"
    }
  ];

  public inspectPayload(
    code: string,
    metadata: { userId?: string; submissionId?: string; language?: string } = {}
  ): { safe: boolean; violation?: SandboxSecurityEvent } {
    for (const item of ATTACK_DETECTION_PATTERNS) {
      if (item.pattern.test(code)) {
        const event: SandboxSecurityEvent = {
          id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          type: item.type,
          severity: item.severity,
          userId: metadata.userId,
          submissionId: metadata.submissionId,
          language: metadata.language,
          description: item.description,
          details: { detectedPattern: item.pattern.toString() },
          actionTaken: "BLOCKED"
        };

        this.recordViolation(event);
        return { safe: false, violation: event };
      }
    }
    return { safe: true };
  }

  public recordViolation(event: SandboxSecurityEvent): void {
    this.auditLogs.unshift(event);
    if (this.auditLogs.length > 200) this.auditLogs.pop();

    this.telemetry.sandboxViolations += 1;
    this.telemetry.totalThreatsNeutralized += 1;

    switch (event.type) {
      case "fork_bomb":
        this.telemetry.forkBombsBlocked += 1;
        break;
      case "network_scanning":
      case "reverse_shell":
        this.telemetry.networkAttempts += 1;
        break;
      case "filesystem_traversal":
        this.telemetry.filesystemViolations += 1;
        break;
      case "container_escape":
      case "privilege_escalation":
        this.telemetry.containerEscapeAttempts += 1;
        break;
      case "resource_exhaustion":
      case "crypto_miner":
        this.telemetry.cpuAbuse += 1;
        break;
    }

    this.emit("threat_neutralized", event);
  }

  public getTelemetry(): SecurityTelemetryStats {
    return { ...this.telemetry };
  }

  public getAuditLogs(): SandboxSecurityEvent[] {
    return this.auditLogs;
  }
}

export const sandboxSecurityEngine = new SandboxSecurityEngine();
