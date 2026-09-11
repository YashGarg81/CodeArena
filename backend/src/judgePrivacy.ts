/**
 * Judge/submission response sanitization.
 * Hidden test I/O must never leave the worker or API, including to the author.
 */

export interface PublicTestResult {
  passed: boolean;
  runtime: number;
  isHidden: boolean;
  input?: string;
  expected?: string;
  got?: string;
  error?: string;
}

export function sanitizeTestResults(results: unknown): PublicTestResult[] {
  if (!Array.isArray(results)) return [];
  return results.map((raw) => {
    const r = raw as Record<string, unknown>;
    const isHidden = Boolean(r.isHidden);
    const passed = Boolean(r.passed);
    const runtime = typeof r.runtime === "number" ? r.runtime : 0;
    if (isHidden) {
      return {
        passed,
        runtime,
        isHidden: true,
        error: passed ? undefined : "Hidden test failed",
      };
    }
    return {
      passed,
      runtime,
      isHidden: false,
      input: typeof r.input === "string" ? r.input : undefined,
      expected: typeof r.expected === "string" ? r.expected : undefined,
      got: typeof r.got === "string" ? r.got : undefined,
      error: typeof r.error === "string" ? r.error : undefined,
    };
  });
}

export function publicWrongAnswerMessage(
  failed: { isHidden?: boolean; input?: string; expected?: string; got?: string } | undefined,
  caseIndex: number
): string {
  if (!failed) return "Wrong Answer";
  if (failed.isHidden) {
    return `Wrong Answer on hidden test case ${caseIndex + 1}.`;
  }
  return `Wrong Answer on Case ${caseIndex + 1}.\nInput:\n${failed.input ?? ""}\n\nExpected Output:\n${failed.expected ?? ""}\n\nActual Output:\n${failed.got ?? ""}`;
}

export function sanitizeJudgeOutput(output: string | null | undefined, results: unknown): string | null {
  if (!output) return output ?? null;
  const list = Array.isArray(results) ? results : [];
  const hiddenFailed = list.find((r: any) => r && r.isHidden && !r.passed);
  if (hiddenFailed && /Input:|Expected Output:|Actual Output:/i.test(output)) {
    return "Wrong Answer on a hidden test case.";
  }
  return output;
}

const SUBMISSION_LIST_SELECT = {
  id: true,
  problemId: true,
  userId: true,
  language: true,
  status: true,
  runtime: true,
  testCasesPassed: true,
  testCasesTotal: true,
  isPublic: true,
  createdAt: true,
} as const;

export { SUBMISSION_LIST_SELECT };

export function toOwnerSubmissionView(submission: Record<string, any>) {
  return {
    ...submission,
    testResults: sanitizeTestResults(submission.testResults),
    output: sanitizeJudgeOutput(submission.output, submission.testResults),
  };
}

export function toPublicShareView(submission: Record<string, any>) {
  return {
    id: submission.id,
    problem: submission.problem,
    language: submission.language,
    status: submission.status,
    runtime: submission.runtime,
    beatsPercent: submission.beatsPercent,
    code: submission.code,
    testCasesPassed: submission.testCasesPassed,
    testCasesTotal: submission.testCasesTotal,
    createdAt: submission.createdAt,
  };
}

export function toStrangerSubmissionView(submission: Record<string, any>) {
  return {
    id: submission.id,
    problemId: submission.problemId,
    language: submission.language,
    status: submission.status,
    runtime: submission.runtime,
    testCasesPassed: submission.testCasesPassed,
    testCasesTotal: submission.testCasesTotal,
    createdAt: submission.createdAt,
    problem: submission.problem,
  };
}
