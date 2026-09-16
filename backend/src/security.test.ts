import { test, expect, describe } from "bun:test";
import { validateCodeSecurity } from "./security";
import { validatePassword, validateEmail, clampPagination } from "./validation";

describe("Security Module — validateCodeSecurity", () => {
  test("rejects child_process in JavaScript", () => {
    const code = `const cp = require("child_process"); cp.execSync("whoami");`;
    const result = validateCodeSecurity(code, "js");
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("child_process");
  });

  test("rejects filesystem imports in JavaScript", () => {
    const code = `import fs from 'fs'; fs.readFileSync('/etc/passwd');`;
    const result = validateCodeSecurity(code, "js");
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Filesystem");
  });

  test("rejects Python os module", () => {
    const code = `import os\nos.system('rm -rf /')`;
    const result = validateCodeSecurity(code, "py");
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("OS module");
  });

  test("allows benign algorithmic code", () => {
    expect(validateCodeSecurity(`function twoSum(nums, target) { return [0, 1]; }`, "js").safe).toBe(true);
    expect(validateCodeSecurity(`def two_sum(nums, target):\n    return [0, 1]`, "py").safe).toBe(true);
  });

  test("rejects oversized code payloads", () => {
    const result = validateCodeSecurity("x".repeat(100_001), "js");
    expect(result.safe).toBe(false);
  });
});

describe("Validation Module", () => {
  test("password minimum length enforcement", () => {
    expect(validatePassword("short").valid).toBe(false);
    expect(validatePassword("longenough").valid).toBe(true);
  });

  test("email format validation", () => {
    expect(validateEmail("bad").valid).toBe(false);
    expect(validateEmail("user@example.com").valid).toBe(true);
  });

  test("pagination clamping", () => {
    expect(clampPagination("0", "999", 50)).toEqual({ page: 1, limit: 50 });
    expect(clampPagination("2", "10", 50)).toEqual({ page: 2, limit: 10 });
  });
});

import { validateUrlForSSRF } from "./ssrf";
import { hasPermission } from "./rbac";
import { generateAccessToken, generateRefreshToken } from "./auth";

describe("SSRF Protection Module", () => {
  test("blocks localhost and loopback IPv4", () => {
    expect(validateUrlForSSRF("http://localhost:3000").safe).toBe(false);
    expect(validateUrlForSSRF("http://127.0.0.1:8080/admin").safe).toBe(false);
    expect(validateUrlForSSRF("http://127.0.1.1").safe).toBe(false);
  });

  test("blocks AWS/GCP cloud metadata IP 169.254.169.254", () => {
    expect(validateUrlForSSRF("http://169.254.169.254/latest/meta-data").safe).toBe(false);
    expect(validateUrlForSSRF("http://metadata.google.internal/computeMetadata/v1").safe).toBe(false);
  });

  test("blocks private RFC 1918 IPv4 ranges", () => {
    expect(validateUrlForSSRF("http://10.0.0.1/status").safe).toBe(false);
    expect(validateUrlForSSRF("http://192.168.1.1/router").safe).toBe(false);
    expect(validateUrlForSSRF("http://172.16.0.5").safe).toBe(false);
  });

  test("blocks non-HTTP protocols", () => {
    expect(validateUrlForSSRF("file:///etc/passwd").safe).toBe(false);
    expect(validateUrlForSSRF("gopher://127.0.0.1:70").safe).toBe(false);
  });

  test("allows public HTTPS URLs", () => {
    expect(validateUrlForSSRF("https://api.github.com/users/octocat").safe).toBe(true);
    expect(validateUrlForSSRF("https://jsonplaceholder.typicode.com/posts").safe).toBe(true);
  });
});

describe("Granular RBAC Module", () => {
  test("STUDENT has no administrative permissions", () => {
    expect(hasPermission("STUDENT", "problem:create")).toBe(false);
    expect(hasPermission("STUDENT", "contest:end")).toBe(false);
    expect(hasPermission("STUDENT", "user:ban")).toBe(false);
  });

  test("INSTRUCTOR has problem and course authoring permissions", () => {
    expect(hasPermission("INSTRUCTOR", "problem:create")).toBe(true);
    expect(hasPermission("INSTRUCTOR", "course:manage")).toBe(true);
    expect(hasPermission("INSTRUCTOR", "user:ban")).toBe(false);
  });

  test("PROBLEM_ADMIN can manage and publish problems", () => {
    expect(hasPermission("PROBLEM_ADMIN", "problem:create")).toBe(true);
    expect(hasPermission("PROBLEM_ADMIN", "problem:publish")).toBe(true);
    expect(hasPermission("PROBLEM_ADMIN", "problem:delete")).toBe(true);
    expect(hasPermission("PROBLEM_ADMIN", "contest:end")).toBe(false);
  });

  test("CONTEST_ADMIN can control contests", () => {
    expect(hasPermission("CONTEST_ADMIN", "contest:create")).toBe(true);
    expect(hasPermission("CONTEST_ADMIN", "contest:end")).toBe(true);
    expect(hasPermission("CONTEST_ADMIN", "user:ban")).toBe(false);
  });

  test("DEVELOPER has full administrative and developer privileges", () => {
    expect(hasPermission("DEVELOPER", "developer:api")).toBe(true);
    expect(hasPermission("DEVELOPER", "developer:debug")).toBe(true);
    expect(hasPermission("DEVELOPER", "developer:plugins")).toBe(true);
    expect(hasPermission("DEVELOPER", "developer:telemetry")).toBe(true);
    expect(hasPermission("DEVELOPER", "user:ban")).toBe(true);
    expect(hasPermission("DEVELOPER", "user:suspend")).toBe(true);
    expect(hasPermission("DEVELOPER", "system:manage")).toBe(true);
    expect(hasPermission("DEVELOPER", "audit:view")).toBe(true);
    expect(hasPermission("DEVELOPER", "problem:publish")).toBe(true);
    expect(hasPermission("DEVELOPER", "course:manage")).toBe(true);
  });

  test("ADMIN has standard operational permissions with developer tools restricted", () => {
    expect(hasPermission("ADMIN", "problem:create")).toBe(true);
    expect(hasPermission("ADMIN", "contest:end")).toBe(true);
    expect(hasPermission("ADMIN", "user:suspend")).toBe(true);
    expect(hasPermission("ADMIN", "course:manage")).toBe(true);
    // Developer-exclusive tooling restricted from Admin
    expect(hasPermission("ADMIN", "developer:api")).toBe(false);
    expect(hasPermission("ADMIN", "developer:debug")).toBe(false);
    expect(hasPermission("ADMIN", "developer:plugins")).toBe(false);
    expect(hasPermission("ADMIN", "system:manage")).toBe(false);
  });
});

describe("Token Pair Generation", () => {
  test("generates valid access and refresh tokens", () => {
    const access = generateAccessToken({ userId: "u123", role: "STUDENT" });
    const refresh = generateRefreshToken({ userId: "u123", familyId: "fam1" });
    expect(typeof access).toBe("string");
    expect(typeof refresh).toBe("string");
    expect(access.length).toBeGreaterThan(20);
    expect(refresh.length).toBeGreaterThan(20);
  });
});

import { generateBase32Secret, generateTOTPCode, verifyTOTPCode, generateBackupCodes, getOTPAuthURI } from "./totp";
import { evaluateOutput } from "./outputCheckers";
import { normalizeSourceCode, generateFingerprints, compareSubmissions } from "./plagiarism";
import { generateCodeExplanation, generateProgressiveHint } from "./aiService";

describe("TOTP Two-Factor Authentication Engine", () => {
  test("generates valid base32 secret and 6-digit TOTP codes", () => {
    const secret = generateBase32Secret(20);
    expect(secret.length).toBeGreaterThanOrEqual(16);

    const now = Date.now();
    const code = generateTOTPCode(secret, now);
    expect(code).toMatch(/^\d{6}$/);

    const isValid = verifyTOTPCode(secret, code, now);
    expect(isValid).toBe(true);
  });

  test("rejects invalid or expired TOTP codes", () => {
    const secret = generateBase32Secret(20);
    expect(verifyTOTPCode(secret, "000000")).toBe(false);
    expect(verifyTOTPCode(secret, "abcdef")).toBe(false);
  });

  test("generates and hashes backup recovery codes", () => {
    const { rawCodes, hashedCodes } = generateBackupCodes(8);
    expect(rawCodes.length).toBe(8);
    expect(hashedCodes.length).toBe(8);
    expect(rawCodes[0]).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
  });

  test("generates valid otpauth:// URI", () => {
    const secret = generateBase32Secret(20);
    const uri = getOTPAuthURI(secret, "developer@codearena.com", "CodeArena");
    expect(uri).toContain("otpauth://totp/CodeArena:developer%40codearena.com");
    expect(uri).toContain(`secret=${secret}`);
  });
});

describe("Advanced Judge Output Checkers", () => {
  test("exact and trimmed comparison strategies", () => {
    expect(evaluateOutput("hello\n", "hello", { mode: "trimmed" }).matched).toBe(true);
    expect(evaluateOutput("hello\n", "hello", { mode: "exact" }).matched).toBe(false);
  });

  test("case-insensitive comparison", () => {
    expect(evaluateOutput("TRUE", "true", { mode: "case_insensitive" }).matched).toBe(true);
    expect(evaluateOutput("False", "true", { mode: "case_insensitive" }).matched).toBe(false);
  });

  test("floating-point tolerance comparison (epsilon)", () => {
    expect(evaluateOutput("3.1415926", "3.1415900", { mode: "floating_point", floatEpsilon: 1e-4 }).matched).toBe(true);
    expect(evaluateOutput("3.1415926", "3.1500000", { mode: "floating_point", floatEpsilon: 1e-4 }).matched).toBe(false);
  });

  test("token array comparison", () => {
    expect(evaluateOutput("1  2   3\n4", "1 2 3 4", { mode: "token_array" }).matched).toBe(true);
  });
});

describe("Plagiarism & Code Similarity Engine", () => {
  test("normalizes variable names and strips comments", () => {
    const codeA = `// Two sum solution\nfunction solve(arr, t) { /* find pair */ return [0, 1]; }`;
    const normalized = normalizeSourceCode(codeA);
    expect(normalized).not.toContain("Two sum solution");
    expect(normalized).not.toContain("find pair");
  });

  test("flags high similarity on renamed variable code", () => {
    const codeA = `function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) return [map.get(diff), i];
        map.set(nums[i], i);
      }
      return [];
    }`;

    const codeB = `function findIndices(arr, k) {
      const dict = new Map();
      for (let idx = 0; idx < arr.length; idx++) {
        const complement = k - arr[idx];
        if (dict.has(complement)) return [dict.get(complement), idx];
        dict.set(arr[idx], idx);
      }
      return [];
    }`;

    const match = compareSubmissions(codeA, codeB, 0.6);
    expect(match.similarityScore).toBeGreaterThan(0.55);
  });
});

describe("AI Platform Engine", () => {
  test("generates structured complexity analysis", () => {
    const explanation = generateCodeExplanation(`function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }`, "javascript");
    expect(explanation).toContain("Time & Space Complexity");
    expect(explanation).toContain("Optimization Opportunities");
  });

  test("generates progressive hints by level", () => {
    const hint1 = generateProgressiveHint("Two Sum", 1);
    const hint2 = generateProgressiveHint("Two Sum", 2);
    const hint3 = generateProgressiveHint("Two Sum", 3);
    expect(hint1).toContain("Hint Level 1");
    expect(hint2).toContain("Hint Level 2");
    expect(hint3).toContain("Hint Level 3");
  });
});


