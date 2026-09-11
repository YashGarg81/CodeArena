// backend/src/antiCheat.ts
import { compareSubmissions, normalizeSourceCode } from "./plagiarism";

export interface ContestSubmissionTelemetry {
  userId: string;
  problemId: string;
  contestId?: string;
  code: string;
  submissionTimeMs: number;
  timeTakenSec: number;
  pasteEventDetected: boolean;
  pasteCharCount?: number;
  tabSwitchCount: number;
  ipAddress: string;
  browserFingerprint: string;
}

export interface AntiCheatAuditResult {
  isFlagged: boolean;
  cheatConfidenceScore: number; // 0 to 100
  flags: string[];
  anomalies: {
    astSimilarityMatch?: { matchedUserId: string; similarityPercentage: number };
    instantSubmissionDetected: boolean;
    unnaturalPasteDetected: boolean;
    excessiveTabSwitches: boolean;
    multiAccountSameIP: boolean;
  };
}

export class AntiCheatEngine {
  private contestSubmissions: ContestSubmissionTelemetry[] = [];

  /**
   * Evaluates contest/arena submissions across multiple anti-cheat vectors.
   */
  public analyzeSubmission(
    current: ContestSubmissionTelemetry,
    historicalPool: ContestSubmissionTelemetry[] = this.contestSubmissions
  ): AntiCheatAuditResult {
    const flags: string[] = [];
    let anomalyScore = 0;

    // 1. Instant Submission Timing Anomaly (solving Hard/Medium problems in < 15 seconds)
    const isInstant = current.timeTakenSec < 15 && current.code.length > 300;
    if (isInstant) {
      flags.push(`Anomalous solve time: Solved problem in ${current.timeTakenSec}s (<15s threshold)`);
      anomalyScore += 40;
    }

    // 2. Unnatural Bulk Paste Detection (> 400 characters pasted in a single keystroke)
    const unnaturalPaste = current.pasteEventDetected && (current.pasteCharCount || 0) > 350;
    if (unnaturalPaste) {
      flags.push(`Unnatural clipboard paste: ${current.pasteCharCount} characters pasted directly into editor`);
      anomalyScore += 30;
    }

    // 3. Tab Switching / Background App Telemetry (> 10 tab switches during active contest)
    const excessiveTabSwitches = current.tabSwitchCount > 10;
    if (excessiveTabSwitches) {
      flags.push(`Excessive tab switching: ${current.tabSwitchCount} blur events recorded`);
      anomalyScore += 20;
    }

    // 4. Multi-Account / Collusion Detection (same IP & browser fingerprint on different userIds)
    const collusionMatch = historicalPool.find(
      s => s.userId !== current.userId &&
           s.problemId === current.problemId &&
           s.ipAddress === current.ipAddress &&
           s.browserFingerprint === current.browserFingerprint
    );

    const multiAccount = !!collusionMatch;
    if (multiAccount) {
      flags.push(`Multi-account collusion flagged: Identical IP & fingerprint matched with user ${collusionMatch.userId}`);
      anomalyScore += 50;
    }

    // 5. AST & Tokenized Structural Plagiarism Check
    let bestMatch: { matchedUserId: string; similarityPercentage: number } | undefined;
    for (const prior of historicalPool) {
      if (prior.userId === current.userId || prior.problemId !== current.problemId) continue;
      const sim = compareSubmissions(current.code, prior.code, 0.75);
      if (sim.isSuspicious && (!bestMatch || sim.similarityScore * 100 > bestMatch.similarityPercentage)) {
        bestMatch = {
          matchedUserId: prior.userId,
          similarityPercentage: Math.round(sim.similarityScore * 100)
        };
      }
    }

    if (bestMatch && bestMatch.similarityPercentage >= 80) {
      flags.push(`High AST structural similarity (${bestMatch.similarityPercentage}%) matched with candidate @${bestMatch.matchedUserId}`);
      anomalyScore += 45;
    }

    this.contestSubmissions.push(current);
    if (this.contestSubmissions.length > 500) this.contestSubmissions.shift();

    const confidence = Math.min(100, anomalyScore);
    return {
      isFlagged: confidence >= 50,
      cheatConfidenceScore: confidence,
      flags,
      anomalies: {
        astSimilarityMatch: bestMatch,
        instantSubmissionDetected: isInstant,
        unnaturalPasteDetected: unnaturalPaste,
        excessiveTabSwitches,
        multiAccountSameIP: multiAccount
      }
    };
  }
}

export const antiCheatEngine = new AntiCheatEngine();
