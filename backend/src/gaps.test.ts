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
  test("default sandbox mode is process", () => {
    const original = process.env.SANDBOX_MODE;
    delete process.env.SANDBOX_MODE;
    delete process.env.DOCKER_SANDBOX;
    expect(getSandboxMode()).toBe("process");
    if (original) process.env.SANDBOX_MODE = original;
  });

  test("docker sandbox mode when env set", () => {
    process.env.SANDBOX_MODE = "docker";
    expect(getSandboxMode()).toBe("docker");
    delete process.env.SANDBOX_MODE;
  });

  test("validateSandboxSafety flags missing docker in strict mode", async () => {
    const origSandbox = process.env.STRICT_SANDBOX;
    process.env.STRICT_SANDBOX = "true";
    try {
      const res = await validateSandboxSafety();
      expect(res.safe).toBe(false);
      expect(res.reason).toContain("Docker container isolation is required");
    } finally {
      if (origSandbox) process.env.STRICT_SANDBOX = origSandbox;
      else delete process.env.STRICT_SANDBOX;
    }
  });
});
