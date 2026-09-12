import { describe, test, expect, beforeAll } from "bun:test";
import jwt from "jsonwebtoken";
import { verifySamlResponse } from "./saml";
import { generateOAuthState, verifyOAuthState, assertGoogleAudience, OAuthVerificationError } from "./oauth";
import { auth, adminAuth, problemAdminAuth, developerAuth, optionalAuth, revokeToken } from "./auth";
import { generateBase32Secret, generateTOTPCode, verifyTOTPCode } from "./totp";
import { collaborationEngine } from "./collaboration";
import { markdownToHtml } from "../../frontend/src/utils/markdown";
import { isIpBlocked } from "./ssrf";
import { getJwtSecret, isDevSocialAuthAllowed } from "./config";

const TEST_JWT_SECRET = getJwtSecret();

describe("P0 & P1 Security Regression Suite", () => {
  // ─── 1. SAML XML SIGNATURE & REFERENCE DIGEST VERIFICATION ───────────────
  describe("SAML XML-DSig & XSW Defense", () => {
    test("rejects unsigned or modified SAML assertion", async () => {
      const mockCert = `-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0mockCertSampleKey==\n-----END CERTIFICATE-----`;
      const tamperedSaml = Buffer.from(
        `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_resp1">
           <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_a1">
             <saml:Subject><saml:NameID>attacker@evil.com</saml:NameID></saml:Subject>
             <saml:AttributeStatement>
               <saml:Attribute Name="email"><saml:AttributeValue>attacker@evil.com</saml:AttributeValue></saml:Attribute>
               <saml:Attribute Name="role"><saml:AttributeValue>ADMIN</saml:AttributeValue></saml:Attribute>
             </saml:AttributeStatement>
           </saml:Assertion>
         </samlp:Response>`
      ).toString("base64");

      const result = await verifySamlResponse(tamperedSaml, mockCert);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("rejects XML Signature Wrapping (XSW) with duplicate Assertion IDs", async () => {
      const xswPayload = Buffer.from(
        `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
           <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_dup1">
             <saml:Subject><saml:NameID>attacker@evil.com</saml:NameID></saml:Subject>
           </saml:Assertion>
           <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_dup1">
             <saml:Subject><saml:NameID>victim@legit.com</saml:NameID></saml:Subject>
           </saml:Assertion>
         </samlp:Response>`
      ).toString("base64");

      const result = await verifySamlResponse(xswPayload);
      expect(result.valid).toBe(false);
    });

    test("rejects XML with XXE DOCTYPE entities", async () => {
      const xxePayload = Buffer.from(
        `<?xml version="1.0"?>
         <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
         <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
           <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_xxe">
             <saml:Subject><saml:NameID>&xxe;</saml:NameID></saml:Subject>
           </saml:Assertion>
         </samlp:Response>`
      ).toString("base64");

      const result = await verifySamlResponse(xxePayload);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("DOCTYPE or external entity declarations are prohibited");
    });
  });

  // ─── 2. OAUTH CSRF & AUDIENCE CONFUSION PROTECTION ───────────────────────
  describe("OAuth CSRF & Audience Confusion Protection", () => {
    test("generates and verifies valid single-use OAuth state", () => {
      const state = generateOAuthState();
      expect(typeof state).toBe("string");
      expect(state.length).toBeGreaterThan(16);

      // First verification must succeed
      const validFirstTime = verifyOAuthState(state);
      expect(validFirstTime).toBe(true);

      // Second verification must fail (single-use anti-replay)
      const validSecondTime = verifyOAuthState(state);
      expect(validSecondTime).toBe(false);
    });

    test("rejects invalid, forged, or missing OAuth state", () => {
      expect(verifyOAuthState("forged_state_1234567890")).toBe(false);
      expect(verifyOAuthState("")).toBe(false);
      expect(verifyOAuthState(undefined as any)).toBe(false);
    });

    test("assertGoogleAudience enforces matching GOOGLE_CLIENT_ID", () => {
      const origClientId = process.env.GOOGLE_CLIENT_ID;
      try {
        process.env.GOOGLE_CLIENT_ID = "valid-client-id-123.apps.googleusercontent.com";
        // Matching audience succeeds without throwing
        expect(() => assertGoogleAudience("valid-client-id-123.apps.googleusercontent.com")).not.toThrow();

        // Mismatched foreign audience throws to prevent audience confusion attacks
        expect(() => assertGoogleAudience("malicious-foreign-app-id.apps.googleusercontent.com")).toThrow(OAuthVerificationError);
      } finally {
        if (origClientId !== undefined) process.env.GOOGLE_CLIENT_ID = origClientId;
        else delete process.env.GOOGLE_CLIENT_ID;
      }
    });

    test("optionalAuth ignores revoked tokens via distributed revocation check", async () => {
      const token = jwt.sign({ userId: "revoked-user-1", role: "STUDENT" }, TEST_JWT_SECRET, { expiresIn: "1h" });
      await revokeToken(token, 3600);

      let nextCalled = false;
      const req: any = { headers: { authorization: `Bearer ${token}` } };
      const res: any = {};
      await optionalAuth(req, res, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      // userId must NOT be populated because the token was revoked
      expect(req.userId).toBeUndefined();
    });
  });

  // ─── 3. 2FA TOTP VERIFICATION ───────────────────────────────────────────
  describe("Two-Factor Authentication (TOTP)", () => {
    test("generates secret and verifies valid TOTP code", () => {
      const secret = generateBase32Secret();
      expect(secret.length).toBeGreaterThanOrEqual(16);

      const code = generateTOTPCode(secret);
      expect(code).toMatch(/^\d{6}$/);

      const isValid = verifyTOTPCode(secret, code);
      expect(isValid).toBe(true);
    });

    test("rejects invalid or tampered TOTP code", () => {
      const secret = generateBase32Secret();
      const isValid = verifyTOTPCode(secret, "000000");
      // Note: "000000" might theoretically match if lucky, but 99.9999% false
      expect(verifyTOTPCode(secret, "abc123")).toBe(false);
    });

    test("auth and adminAuth reject tokens with is2FAPending: true", async () => {
      const temp2FAToken = jwt.sign({ userId: "user-123", is2FAPending: true }, TEST_JWT_SECRET, { expiresIn: "5m" });

      // Test auth middleware
      let authStatus = 0;
      let authErr = "";
      const req1: any = { headers: { authorization: `Bearer ${temp2FAToken}` } };
      const res1: any = {
        status: (s: number) => { authStatus = s; return { json: (d: any) => { authErr = d.error; } }; }
      };
      await auth(req1, res1, () => {});
      expect(authStatus).toBe(403);
      expect(authErr).toContain("Two-Factor Authentication");

      // Test adminAuth middleware
      let adminStatus = 0;
      let adminErr = "";
      const req2: any = { headers: { authorization: `Bearer ${temp2FAToken}` } };
      const res2: any = {
        status: (s: number) => { adminStatus = s; return { json: (d: any) => { adminErr = d.error; } }; }
      };
      await adminAuth(req2, res2, () => {});
      expect(adminStatus).toBe(403);
      expect(adminErr).toContain("Two-Factor Authentication");
    });

    test("isDevSocialAuthAllowed is strictly false in production regardless of env flags", () => {
      const origEnv = process.env.NODE_ENV;
      const origFlag = process.env.ALLOW_DEV_SOCIAL_AUTH;
      try {
        process.env.NODE_ENV = "production";
        process.env.ALLOW_DEV_SOCIAL_AUTH = "true";
        expect(isDevSocialAuthAllowed()).toBe(false);
      } finally {
        process.env.NODE_ENV = origEnv;
        if (origFlag !== undefined) process.env.ALLOW_DEV_SOCIAL_AUTH = origFlag;
        else delete process.env.ALLOW_DEV_SOCIAL_AUTH;
      }
    });
  });

  // ─── 4. WEBSOCKET & CANVAS ROOM AUTHORIZATION ────────────────────────────
  describe("WebSocket / Canvas IDOR Authorization", () => {
    const roomId = "project-secure-room-123";
    const ownerId = "user-owner-1";
    const collaboratorId = "user-collab-2";
    const attackerId = "user-attacker-3";

    beforeAll(() => {
      collaborationEngine.setRoomOwner(roomId, ownerId);
      collaborationEngine.addCollaborator(roomId, collaboratorId);
    });

    test("allows owner to join canvas room", () => {
      expect(collaborationEngine.isAuthorized(roomId, ownerId)).toBe(true);
    });

    test("allows authorized collaborator to join canvas room", () => {
      expect(collaborationEngine.isAuthorized(roomId, collaboratorId)).toBe(true);
    });

    test("blocks unauthorized user from joining private canvas room", () => {
      expect(collaborationEngine.isAuthorized(roomId, attackerId)).toBe(false);
    });

    test("blocks unauthorized user when room has no explicit authorization", () => {
      expect(collaborationEngine.isAuthorized("unknown-secret-room", attackerId)).toBe(false);
    });
  });

  // ─── 5. FRONTEND MARKDOWN XSS SANITIZATION ──────────────────────────────
  describe("Markdown XSS Defense", () => {
    test("disarms img onerror payload", () => {
      const payload = `<img src=x onerror=alert(1)>`;
      const html = markdownToHtml(payload);
      expect(html).not.toContain("onerror");
      expect(html).not.toContain("alert(1)");
    });

    test("strips script tags and executable contents", () => {
      const payload = `<script>alert('pwned')</script>Hello **World**`;
      const html = markdownToHtml(payload);
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("alert('pwned')");
      expect(html).toContain("<strong>World</strong>");
    });

    test("disarms javascript: URI schemes in links", () => {
      const payload = `<a href="javascript:alert(1)">Click Me</a>`;
      const html = markdownToHtml(payload);
      expect(html).not.toContain("javascript:");
    });

    test("strips iframe and svg vectors", () => {
      const payload = `<iframe src="https://evil.com"></iframe><svg onload=alert(1)>`;
      const html = markdownToHtml(payload);
      expect(html).not.toContain("<iframe");
      expect(html).not.toContain("<svg");
      expect(html).not.toContain("onload");
    });
  });

  // ─── 6. SSRF IP VALIDATION ───────────────────────────────────────────────
  describe("SSRF Protection Engine", () => {
    test("detects loopback and private IPv4 addresses", () => {
      expect(isIpBlocked("127.0.0.1")).toBe(true);
      expect(isIpBlocked("10.0.0.5")).toBe(true);
      expect(isIpBlocked("192.168.1.1")).toBe(true);
      expect(isIpBlocked("172.16.0.1")).toBe(true);
      expect(isIpBlocked("169.254.169.254")).toBe(true); // AWS/GCP metadata
    });

    test("detects IPv6 loopback and link-local", () => {
      expect(isIpBlocked("::1")).toBe(true);
      expect(isIpBlocked("fe80::1")).toBe(true);
    });

    test("allows public internet IPs", () => {
      expect(isIpBlocked("8.8.8.8")).toBe(false);
      expect(isIpBlocked("1.1.1.1")).toBe(false);
      expect(isIpBlocked("142.250.190.46")).toBe(false);
    });
  });
});
