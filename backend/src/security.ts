/**
 * Online judge pre-execution code syntax heuristic validator.
 * 
 * IMPORTANT ARCHITECTURAL NOTE (DEFENSE IN DEPTH):
 * Static regex validation is strictly an auxiliary filter (early feedback layer).
 * It is NOT a security boundary. Arbitrary code safety relies entirely on true
 * container / MicroVM isolation:
 *  - Firecracker MicroVM / Docker container isolation
 *  - Network isolation (--network none)
 *  - Strict memory & CPU quotas
 *  - Read-only root filesystem
 *  - Dropped Linux capabilities (--cap-drop=ALL, no-new-privileges)
 *  - Non-root execution & PID limits
 *  - Fail-closed execution policy
 */

export interface SecurityCheckResult {
  safe: boolean;
  reason?: string;
}

const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; desc: string }> = [
  { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/i, desc: "Process execution (child_process)" },
  { pattern: /require\s*\(\s*['"]fs['"]\s*\)/i, desc: "Direct filesystem access (fs)" },
  { pattern: /import\s+.*from\s+['"]child_process['"]/i, desc: "Process execution import" },
  { pattern: /import\s+.*from\s+['"]fs['"]/i, desc: "Filesystem import" },
  { pattern: /process\.env/i, desc: "Environment variable inspection" },
  { pattern: /process\.exit/i, desc: "Process termination attempt" },
  { pattern: /import\s+os\b|from\s+os\s+import/i, desc: "OS module access (Python)" },
  { pattern: /import\s+subprocess\b|from\s+subprocess\s+import/i, desc: "Subprocess execution (Python)" },
  { pattern: /__import__\s*\(\s*['"]os['"]\s*\)/i, desc: "Dynamic OS import (Python)" },
  { pattern: /__import__\s*\(\s*['"]subprocess['"]\s*\)/i, desc: "Dynamic Subprocess import (Python)" },
  { pattern: /#include\s*<cstdlib>.*system\s*\(/is, desc: "System execution in C++" },
  { pattern: /\bsystem\s*\(/i, desc: "System shell execution" },
  { pattern: /\bpopen\s*\(/i, desc: "Pipe process execution" },
  { pattern: /Runtime\.getRuntime\s*\(\s*\)\.exec/i, desc: "Java process execution" },
  { pattern: /exec\.Command\s*\(/i, desc: "Go command execution" },
  { pattern: /eval\s*\(/i, desc: "Dynamic code evaluation (eval)" },
  { pattern: /Function\s*\(\s*['"`]/i, desc: "Dynamic function constructor" },
  { pattern: /import\s+socket\b|from\s+socket\s+import/i, desc: "Network socket access (Python)" },
];

export function validateCodeSecurity(code: string, _language: string): SecurityCheckResult {
  if (!code || typeof code !== "string") {
    return { safe: false, reason: "Invalid code payload" };
  }
  if (code.length > 100_000) {
    return { safe: false, reason: "Code exceeds maximum allowed length (100KB)" };
  }

  for (const { pattern, desc } of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      return { safe: false, reason: `Security Violation: ${desc} is forbidden in online judge environment.` };
    }
  }
  return { safe: true };
}
