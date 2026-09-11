// backend/src/oauth.ts
/**
 * OAuth token verification and authorization-code exchange for GitHub and Google providers.
 */
import crypto from "crypto";
import { isDevSocialAuthAllowed } from "./config";

export interface OAuthProfile {
  provider: "github" | "google";
  providerId: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
}

export class OAuthVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OAuthVerificationError";
  }
}

// In-memory single-use CSRF OAuth state cache with TTL
const oauthStates = new Map<string, { provider: "github" | "google"; expiresAt: number }>();

export function generateOAuthState(provider: "github" | "google"): string {
  const state = crypto.randomBytes(32).toString("hex");
  oauthStates.set(state, { provider, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min TTL
  return state;
}

export function verifyOAuthState(state: string, expectedProvider: "github" | "google"): boolean {
  if (!state || typeof state !== "string") return false;
  const record = oauthStates.get(state.trim());
  if (!record) return false;
  oauthStates.delete(state.trim()); // Single-use consumption
  if (Date.now() > record.expiresAt) return false;
  return record.provider === expectedProvider;
}

async function fetchGitHubPrimaryEmail(token: string): Promise<string | null> {
  const res = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeArena-Platform",
    },
  });
  if (!res.ok) return null;
  const emails = (await res.json()) as Array<{ email: string; primary?: boolean; verified?: boolean }>;
  const primary = emails.find((e) => e.primary && e.verified);
  return primary?.email ?? emails.find((e) => e.verified)?.email ?? emails[0]?.email ?? null;
}

export async function exchangeGitHubCode(code: string, redirectUri?: string): Promise<string> {
  if (code.startsWith("mock_") || code.startsWith("dev_")) {
    if (isDevSocialAuthAllowed()) return code;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new OAuthVerificationError("GitHub OAuth is not configured on the server (missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET)");
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "CodeArena-Platform",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new OAuthVerificationError("Failed to exchange GitHub authorization code for access token");
  }

  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!data.access_token) {
    throw new OAuthVerificationError(data.error_description || data.error || "GitHub authorization code exchange failed");
  }

  return data.access_token;
}

export async function verifyGitHubToken(token: string): Promise<OAuthProfile> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeArena-Platform",
    },
  });

  if (!res.ok) {
    throw new OAuthVerificationError("Invalid or expired GitHub access token");
  }

  const data = (await res.json()) as {
    id: number;
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };

  const email = data.email ?? (await fetchGitHubPrimaryEmail(token));
  if (!email) {
    throw new OAuthVerificationError("GitHub account has no verified email address");
  }

  return {
    provider: "github",
    providerId: String(data.id),
    email: email.toLowerCase(),
    name: data.name || data.login,
    username: data.login.toLowerCase().replace(/[^a-z0-9_]/g, ""),
    avatar: data.avatar_url,
  };
}

export async function verifyGoogleToken(token: string): Promise<OAuthProfile> {
  // Validate token via Google tokeninfo / userinfo endpoint
  let profile: OAuthProfile | null = null;

  const idRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
  );
  if (idRes.ok) {
    const data = (await idRes.json()) as {
      sub: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
    };
    if (data.email && (data.email_verified === true || data.email_verified === "true")) {
      profile = {
        provider: "google",
        providerId: data.sub,
        email: data.email.toLowerCase(),
        name: data.name || data.email.split("@")[0] || "Google User",
        avatar: data.picture,
      };
    }
  }

  if (!profile) {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
      throw new OAuthVerificationError("Invalid or expired Google token");
    }
    const data = (await userRes.json()) as {
      sub: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };
    if (!data.email || !data.email_verified) {
      throw new OAuthVerificationError("Google account email is not verified");
    }
    profile = {
      provider: "google",
      providerId: data.sub,
      email: data.email.toLowerCase(),
      name: data.name || data.email.split("@")[0] || "Google User",
      avatar: data.picture,
    };
  }

  return profile;
}

export async function verifyOAuthToken(
  provider: "github" | "google",
  tokenOrCode: string | undefined,
  devPayload?: { email?: string; name?: string; username?: string; avatar?: string; isCode?: boolean }
): Promise<OAuthProfile> {
  const isMockToken = tokenOrCode && (tokenOrCode.startsWith("mock_") || tokenOrCode.startsWith("dev_"));

  if (tokenOrCode && !isMockToken) {
    if (provider === "github") {
      let accessToken = tokenOrCode;
      if (devPayload?.isCode || tokenOrCode.length < 40) {
        accessToken = await exchangeGitHubCode(tokenOrCode);
      }
      return verifyGitHubToken(accessToken);
    } else {
      return verifyGoogleToken(tokenOrCode);
    }
  }

  if (isDevSocialAuthAllowed()) {
    const devEmail = devPayload?.email?.trim().toLowerCase() || `${provider}_dev@codearena.dev`;
    return {
      provider,
      providerId: `dev_${provider}_${Date.now()}`,
      email: devEmail,
      name: devPayload?.name || `${provider.toUpperCase()} User`,
      username: devPayload?.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") || `${provider}_dev`,
      avatar: devPayload?.avatar,
    };
  }

  throw new OAuthVerificationError("Valid OAuth access token is required");
}
