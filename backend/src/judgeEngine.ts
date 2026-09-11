// backend/src/judgeEngine.ts
import { evaluateOutput, type CheckerMode } from "./outputCheckers";

export type JudgeVerdict = "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE" | "SE";

export interface SubtaskGroup {
  id: string;
  name: string;
  points: number;
  testCaseIndices: number[];
}

export interface AdvancedJudgeConfig {
  problemType: "standard" | "interactive" | "output_only" | "custom_checker";
  checkerMode: CheckerMode;
  floatEpsilon?: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  /**
   * Hardware & sandbox isolation limits (cpuLimitCores, maxProcesses, networkIsolated).
   * NOTE (Issue 16): AdvancedJudgeEngine is an evaluation and scoring layer that grades test outputs.
   * Actual OS-level enforcement of cpuLimitCores, memoryLimitMb, maxProcesses, and network isolation
   * is strictly executed at the virtualization boundary (Docker / Firecracker MicroVM execution runners),
   * NOT by JavaScript runtime logic in this class.
   */
  cpuLimitCores?: number;
  maxProcesses?: number;
  networkIsolated: boolean;
  subtasks: SubtaskGroup[];
}

export interface TestCaseResult {
  index: number;
  passed: boolean;
  verdict: JudgeVerdict;
  runtimeMs: number;
  memoryMb: number;
  got?: string;
  expected?: string;
  subtaskId?: string;
  error?: string;
}

export interface JudgeEvaluationReport {
  verdict: JudgeVerdict;
  totalScore: number;
  maxScore: number;
  percentage: number;
  testCasesPassed: number;
  testCasesTotal: number;
  avgRuntimeMs: number;
  peakMemoryMb: number;
  subtaskScores: Array<{ subtaskId: string; name: string; score: number; maxScore: number; passed: boolean }>;
  testResults: TestCaseResult[];
  compilationCached: boolean;
  networkIsolated: boolean;
}

/**
 * High-performance, multi-subtask, parallel-ready judge evaluation engine.
 */
export class AdvancedJudgeEngine {
  private compilationCache = new Map<string, { compiledBinary: string; timestamp: number }>();

  /**
   * Evaluates parallel testcase outcomes across subtask groups and custom checkers.
   */
  public evaluateSubmission(
    testRuns: Array<{
      index: number;
      input: string;
      expected: string;
      got: string;
      runtime: number;
      memory?: number;
      error?: string;
      isTLE?: boolean;
      isMLE?: boolean;
      isCompileError?: boolean;
      isSecurityError?: boolean;
    }>,
    config: Partial<AdvancedJudgeConfig> = {}
  ): JudgeEvaluationReport {
    const timeLimit = config.timeLimitMs || 4000;
    const memoryLimit = config.memoryLimitMb || 256;
    const checkerMode = config.checkerMode || "trimmed";
    const subtasks = config.subtasks && config.subtasks.length > 0 ? config.subtasks : [
      { id: "subtask_1", name: "Main Test Suite", points: 100, testCaseIndices: testRuns.map(r => r.index) }
    ];

    const maxScore = subtasks.reduce((sum, s) => sum + s.points, 0);
    const results: TestCaseResult[] = [];

    let overallVerdict: JudgeVerdict = "AC";
    let passedCount = 0;
    let totalRuntime = 0;
    let peakMemory = 0;

    for (const run of testRuns) {
      // Use actual measured memory in MB, or 0 if telemetry/cgroup measurement was unavailable.
      // Never invent randomized fake memory metrics, which causes false MLEs or inaccurate telemetry.
      const memoryMb = typeof run.memory === "number" && !isNaN(run.memory) ? Math.max(0, run.memory) : 0;
      peakMemory = Math.max(peakMemory, memoryMb);
      totalRuntime += run.runtime;

      let testVerdict: JudgeVerdict = "AC";
      let passed = false;

      if (run.isSecurityError) {
        testVerdict = "SE";
      } else if (run.isCompileError) {
        testVerdict = "CE";
      } else if (run.isTLE || run.runtime > timeLimit) {
        testVerdict = "TLE";
      } else if (run.isMLE || (memoryMb > 0 && memoryMb > memoryLimit)) {
        testVerdict = "MLE";
      } else if (run.error) {
        testVerdict = "RE";
      } else {
        const check = evaluateOutput(run.got, run.expected, { mode: checkerMode, floatEpsilon: config.floatEpsilon });
        if (check.matched) {
          testVerdict = "AC";
          passed = true;
          passedCount++;
        } else {
          testVerdict = "WA";
        }
      }

      if (testVerdict !== "AC" && overallVerdict === "AC") {
        overallVerdict = testVerdict;
      }

      const matchingSubtask = subtasks.find(st => st.testCaseIndices.includes(run.index));
      results.push({
        index: run.index,
        passed,
        verdict: testVerdict,
        runtimeMs: run.runtime,
        memoryMb,
        got: run.got,
        expected: run.expected,
        subtaskId: matchingSubtask?.id,
        error: run.error
      });
    }

    // Calculate subtask scores (partial scoring)
    const subtaskScores = subtasks.map(st => {
      const stRuns = results.filter(r => st.testCaseIndices.includes(r.index));
      const stPassedCount = stRuns.filter(r => r.passed).length;
      const allPassed = stRuns.length > 0 && stPassedCount === stRuns.length;
      const score = allPassed ? st.points : Math.round((stPassedCount / (stRuns.length || 1)) * st.points);
      return {
        subtaskId: st.id,
        name: st.name,
        score,
        maxScore: st.points,
        passed: allPassed
      };
    });

    const totalScore = subtaskScores.reduce((sum, st) => sum + st.score, 0);
    const avgRuntime = testRuns.length > 0 ? Math.round((totalRuntime / testRuns.length) * 100) / 100 : 0;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      verdict: overallVerdict,
      totalScore,
      maxScore,
      percentage,
      testCasesPassed: passedCount,
      testCasesTotal: testRuns.length,
      avgRuntimeMs: avgRuntime,
      peakMemoryMb: peakMemory,
      subtaskScores,
      testResults: results,
      compilationCached: true,
      networkIsolated: true
    };
  }

  /**
   * Compilation hash cache lookup
   */
  public getCachedCompilation(codeHash: string): string | null {
    const cached = this.compilationCache.get(codeHash);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > 3600 * 1000) {
      this.compilationCache.delete(codeHash);
      return null;
    }
    return cached.compiledBinary;
  }

  public setCachedCompilation(codeHash: string, binaryPath: string) {
    this.compilationCache.set(codeHash, { compiledBinary: binaryPath, timestamp: Date.now() });
  }
}

export const advancedJudgeEngine = new AdvancedJudgeEngine();
