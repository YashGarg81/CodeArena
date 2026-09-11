/**
 * OAuth token verification for GitHub and Google providers.
 */
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
  // Try ID token validation first, then access token via userinfo
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
  token: string | undefined,
  devPayload?: { email?: string; name?: string; username?: string; avatar?: string }
): Promise<OAuthProfile> {
  const isMockToken = token && (token.startsWith("mock_") || token.startsWith("dev_"));

  if (token && !isMockToken) {
    return provider === "github" ? verifyGitHubToken(token) : verifyGoogleToken(token);
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
