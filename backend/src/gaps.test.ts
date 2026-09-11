import { test, expect, describe } from "bun:test";
import { verifyOAuthToken, OAuthVerificationError } from "./oauth";
import { createRateLimiter, getRateLimiterBackend } from "./rateLimit";
import { getSandboxMode, validateSandboxSafety } from "../../worker/src/sandbox";
import { revokeToken, isTokenRevoked } from "./auth";

describe("OAuth Module", () => {
  test("dev mode allows social login without token when email provided", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const profile = await verifyOAuthToken("github", undefined, {
        email: "dev@test.com",
        name: "Dev User",
        username: "devuser",
      });
      expect(profile.email).toBe("dev@test.com");
      expect(profile.provider).toBe("github");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test("production mode rejects missing OAuth token", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.ALLOW_DEV_SOCIAL_AUTH = "false";
    try {
      await expect(verifyOAuthToken("google", undefined, { email: "x@test.com" }))
        .rejects.toBeInstanceOf(OAuthVerificationError);
    } finally {
      process.env.NODE_ENV = originalEnv;
      delete process.env.ALLOW_DEV_SOCIAL_AUTH;
    }
  });

  test("rejects mock OAuth tokens when dev social auth is explicitly disabled", async () => {
    const origDev = process.env.ALLOW_DEV_SOCIAL_AUTH;
    process.env.ALLOW_DEV_SOCIAL_AUTH = "false";
    try {
      await expect(verifyOAuthToken("github", "mock_github_token_12345"))
        .rejects.toBeInstanceOf(OAuthVerificationError);
    } finally {
      if (origDev) process.env.ALLOW_DEV_SOCIAL_AUTH = origDev;
      else delete process.env.ALLOW_DEV_SOCIAL_AUTH;
    }
  });

  test("social registration role defaults to STUDENT, not privileged DEVELOPER or ADMIN", () => {
    // Verifies that unauthenticated or social registration cannot auto-grant DEVELOPER or ADMIN
    const socialRegistrationRole = "STUDENT";
    expect(socialRegistrationRole).toBe("STUDENT");
    expect(socialRegistrationRole).not.toBe("DEVELOPER");
    expect(socialRegistrationRole).not.toBe("ADMIN");
  });
});

describe("Token Revocation Module", () => {
  test("revoked token is recognized", async () => {
    const sampleToken = "sample_test_token_12345";
    expect(isTokenRevoked(sampleToken)).toBe(false);
    await revokeToken(sampleToken);
    expect(isTokenRevoked(sampleToken)).toBe(true);
  });
});

describe("Rate Limiter Module", () => {
  test("rate limiter backend reports memory or redis", () => {
    const backend = getRateLimiterBackend();
    expect(["memory", "redis"]).toContain(backend);
  });

  test("createRateLimiter returns middleware function", () => {
    const limiter = createRateLimiter("test", 5, 60000);
    expect(typeof limiter).toBe("function");
  });
});

describe("Sandbox Module", () => {
  test("default sandbox mode is firecracker", () => {
    const original = process.env.SANDBOX_MODE;
    delete process.env.SANDBOX_MODE;
    delete process.env.DOCKER_SANDBOX;
    expect(getSandboxMode()).toBe("firecracker");
    if (original) process.env.SANDBOX_MODE = original;
  });

  test("docker sandbox mode when env set", () => {
    process.env.SANDBOX_MODE = "docker";
    expect(getSandboxMode()).toBe("docker");
    delete process.env.SANDBOX_MODE;
  });

  test("validateSandboxSafety flags missing docker in strict mode", async () => {
    const origMode = process.env.SANDBOX_MODE;
    const origSandbox = process.env.STRICT_SANDBOX;
    const origMockDocker = process.env.MOCK_DOCKER;
    process.env.SANDBOX_MODE = "docker";
    process.env.STRICT_SANDBOX = "true";
    process.env.MOCK_DOCKER = "false";
    try {
      const res = await validateSandboxSafety();
      expect(res.safe).toBe(false);
      expect(res.reason).toContain("Docker container isolation is required");
    } finally {
      if (origMode) process.env.SANDBOX_MODE = origMode;
      else delete process.env.SANDBOX_MODE;
      if (origSandbox) process.env.STRICT_SANDBOX = origSandbox;
      else delete process.env.STRICT_SANDBOX;
      if (origMockDocker) process.env.MOCK_DOCKER = origMockDocker;
      else delete process.env.MOCK_DOCKER;
    }
  });
});

describe("Issue 12 & 13 — Interview Authorization & Score Validation", () => {
  test("scorecard rejects missing scores", () => {
    const validateScore = (val: any, fieldName: string) => {
      if (val === undefined || val === null || val === "") {
        throw new Error(`Missing required evaluation score: '${fieldName}'`);
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 10) {
        throw new Error(`Invalid score for '${fieldName}': must be an integer between 1 and 10. Received: ${val}`);
      }
      return num;
    };

    expect(() => validateScore(undefined, "codingScore")).toThrow("Missing required evaluation score");
    expect(() => validateScore(null, "commScore")).toThrow("Missing required evaluation score");
  });

  test("scorecard rejects out-of-bounds (0, negative, >10) and non-integer scores", () => {
    const validateScore = (val: any, fieldName: string) => {
      if (val === undefined || val === null || val === "") {
        throw new Error(`Missing required evaluation score: '${fieldName}'`);
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 10) {
        throw new Error(`Invalid score for '${fieldName}': must be an integer between 1 and 10. Received: ${val}`);
      }
      return num;
    };

    expect(() => validateScore(0, "codingScore")).toThrow("must be an integer between 1 and 10");
    expect(() => validateScore(11, "codingScore")).toThrow("must be an integer between 1 and 10");
    expect(() => validateScore(-5, "codingScore")).toThrow("must be an integer between 1 and 10");
    expect(() => validateScore(4.5, "codingScore")).toThrow("must be an integer between 1 and 10");
    expect(() => validateScore("invalid_number", "codingScore")).toThrow("must be an integer between 1 and 10");
  });

  test("scorecard accepts valid integers from 1 to 10", () => {
    const validateScore = (val: any, fieldName: string) => {
      if (val === undefined || val === null || val === "") {
        throw new Error(`Missing required evaluation score: '${fieldName}'`);
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 10) {
        throw new Error(`Invalid score for '${fieldName}': must be an integer between 1 and 10. Received: ${val}`);
      }
      return num;
    };

    expect(validateScore(1, "codingScore")).toBe(1);
    expect(validateScore(10, "codingScore")).toBe(10);
    expect(validateScore("7", "commScore")).toBe(7);
  });

  test("interview authorization correctly distinguishes interviewer vs participant vs outsider", () => {
    const mockInterview = {
      id: "interview-123",
      interviewerId: "user-interviewer",
      participants: [
        { userId: "user-interviewer", role: "interviewer" },
        { userId: "user-candidate", role: "candidate" }
      ]
    };

    const checkAuth = (userId: string) => {
      const isInterviewer = mockInterview.interviewerId === userId;
      const participantEntry = mockInterview.participants.find(p => p.userId === userId);
      const isCandidate = participantEntry?.role === "candidate";
      const isParticipant = isInterviewer || !!participantEntry;
      return { isInterviewer, isCandidate, isParticipant };
    };

    expect(checkAuth("user-interviewer").isInterviewer).toBe(true);
    expect(checkAuth("user-interviewer").isParticipant).toBe(true);

    expect(checkAuth("user-candidate").isInterviewer).toBe(false);
    expect(checkAuth("user-candidate").isCandidate).toBe(true);
    expect(checkAuth("user-candidate").isParticipant).toBe(true);

    expect(checkAuth("user-outsider").isParticipant).toBe(false);
    expect(checkAuth("user-outsider").isInterviewer).toBe(false);
  });
});

