/**
 * Centralized application configuration with production safety checks.
 */

function parseIntSafe(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const IS_TEST = process.env.NODE_ENV === "test";
export const IS_PROD = process.env.NODE_ENV === "production";

const INSECURE_DEFAULT_SECRETS = [
  "codearena-dev-secret-change-in-production",
  "secret",
  "jwt-secret",
  "change-me",
  "replace-with-long-random-secret",
];

export function isInsecureSecret(secret: string | undefined): boolean {
  if (!secret) return true;
  return INSECURE_DEFAULT_SECRETS.includes(secret.toLowerCase());
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && IS_PROD) {
    throw new Error("FATAL: JWT_SECRET environment variable is required in production");
  }
  if (IS_PROD && secret && isInsecureSecret(secret)) {
    throw new Error("FATAL: Insecure or default JWT_SECRET detected in production environment");
  }
  return secret || "codearena-dev-secret-change-in-production";
}

export function getRefreshTokenSecret(): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret && IS_PROD) {
    throw new Error("FATAL: REFRESH_TOKEN_SECRET environment variable is required in production");
  }
  if (IS_PROD && secret && isInsecureSecret(secret)) {
    throw new Error("FATAL: Insecure or default REFRESH_TOKEN_SECRET detected in production environment");
  }
  return secret || (getJwtSecret() + "_refresh");
}

export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";

export const PORT = parseIntSafe(process.env.PORT, 3000);

export const CORS_ORIGINS: string[] = (process.env.CORS_ORIGIN || "http://localhost:3003,http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (IS_PROD && (!process.env.CORS_ORIGIN || CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes("*"))) {
  throw new Error("FATAL: CORS_ORIGIN must be set explicitly in production without wildcard access");
}

export const MAX_JSON_BODY = "5mb";

/** Sandbox execution mode: "docker" (default container isolation), "firecracker" (advanced MicroVM), or "process" (testing only) */
export const SANDBOX_MODE = process.env.SANDBOX_MODE || "docker";

/** Allow mock social login without OAuth token in development */
export function isDevSocialAuthAllowed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ALLOW_DEV_SOCIAL_AUTH === "true") return true;
  if (process.env.ALLOW_DEV_SOCIAL_AUTH === "false") return false;
  return true;
}

/** Only honor X-Forwarded-For when sitting behind a trusted reverse proxy. */
export const TRUST_PROXY = process.env.TRUST_PROXY === "true";

export function safeErrorMessage(err: unknown, fallback = "Internal server error"): string {
  if (!IS_PROD && err instanceof Error) return err.message;
  if (!IS_PROD && typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}
