export function publishedProblemWhere(extra: Record<string, unknown> = {}) {
  return { status: "Published", ...extra };
}

export function isPublishedProblem(problem: { status?: string } | null | undefined): boolean {
  if (!problem) return false;
  // Issue 20: Secure default — only problems explicitly marked "Published" are public
  return problem.status === "Published";
}

export function publicTestCases(testCases: unknown): unknown[] {
  const raw = Array.isArray(testCases) ? testCases : [];
  return raw.filter((tc: any) => !tc?.isHidden);
}

function functionSignature(template: unknown, language: string): string {
  if (typeof template !== "string") return "";
  const lines = template.split(/\r?\n/);
  const patterns: Record<string, RegExp> = {
    js: /^\s*(?:export\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{/,
    ts: /^\s*(?:export\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)[^{]*\{/,
    py: /^\s*def\s+\w+\s*\([^)]*\)\s*:/,
    cpp: /^\s*(?:[\w:<>]+\s+)+\w+\s*\([^;]*\)\s*\{/,
    java: /^\s*(?:public|private|protected)?\s*(?:static\s+)?[\w<>\[\], ?]+\s+\w+\s*\([^;]*\)\s*\{/,
    go: /^\s*func\s+\w+\s*\([^)]*\)[^{]*\{/,
  };
  const pattern = patterns[language] || patterns.js;
  if (!pattern) return "";
  const signature = lines.find(line => pattern.test(line));
  return signature ? signature.trim() : "";
}

export function publicFunctionTemplates(templates: unknown): Record<string, string> {
  if (!templates || typeof templates !== "object") return {};
  return Object.fromEntries(
    Object.entries(templates as Record<string, unknown>)
      .map(([language, template]) => [language, functionSignature(template, language)])
      .filter(([, signature]) => Boolean(signature))
  );
}

export function isStarterTemplate(code: unknown, templates: unknown): boolean {
  if (typeof code !== "string" || !code.trim() || !templates || typeof templates !== "object") return false;
  const normalizedCode = code.trim().replace(/\s+/g, " ");
  return Object.entries(templates as Record<string, unknown>).some(([language, template]) => {
    const signature = functionSignature(template, language);
    return signature && normalizedCode === signature.replace(/\s+/g, " ");
  });
}

export function toPublicProblemView(problem: Record<string, unknown>) {
  const { solutions: _solutions, testCasesRel: _rel, revisions: _rev, ...rest } = problem;
  return {
    ...rest,
    templates: publicFunctionTemplates(problem.templates),
    testCases: publicTestCases(problem.testCases),
  };
}

export function firstPublicTestCase(testCases: unknown): { input: string; output: string } | null {
  const pub = publicTestCases(testCases);
  const tc = pub[0] as { input?: string; output?: string; expectedOutput?: string } | undefined;
  if (!tc) return null;
  return {
    input: tc.input || "",
    output: tc.output || tc.expectedOutput || "",
  };
}
