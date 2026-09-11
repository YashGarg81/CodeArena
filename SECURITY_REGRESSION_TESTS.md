# CodeArena Security Regression Test Suite Documentation

## Overview
This document catalogs the permanent security regression tests implemented across the CodeArena backend, worker, and frontend services. Each test ensures that previously identified security vulnerabilities cannot regress.

---

## 1. P0 Sandbox & Remote Code Execution (RCE) Defense

### `SANDBOX-RCE-001`: Authoritative Production Sandbox Policy
- **Test File**: `worker/src/sandbox_regression.test.ts`
- **Guarantees**:
  - `getSandboxMode()` defaults strictly to `"docker"`.
  - Incomplete or experimental virtualization backends (Firecracker) are never implicitly assumed as production ready.
  - Fail-closed behavior: When `process.env.SANDBOX_MODE = "process"` is attempted in production without explicit debug flags, `validateSandboxSafety()` immediately flags the environment as unsafe.

### `SANDBOX-RCE-002`: Container Isolation Flags & Capabilities Drop
- **Test File**: `worker/sandbox_security.test.ts`
- **Guarantees**:
  - Docker containers execute with `--network none` (complete egress/ingress denial).
  - Containers enforce `--read-only` rootfs, `--cap-drop=ALL`, `--security-opt=no-new-privileges:true`.
  - Memory quotas (256MB) and swap quotas are strictly enforced.

### `SANDBOX-RCE-003`: Containerized Compilation for Native Languages
- **Test File**: `worker/src/sandbox_regression.test.ts`
- **Guarantees**:
  - Compilers (`g++`, `javac`, `rustc`, `dotnet`, `kotlinc`, `swiftc`) execute exclusively inside isolated Docker container workspaces via `compileInDocker()`.
  - Host process spawning (`child_process.spawn`) of untrusted compilers is eliminated.

---

## 2. P0 SAML 2.0 XML-DSig & Signature Wrapping Defense

### `SAML-DSIG-001`: XML-DSig & Reference Digest Validation
- **Test File**: `backend/src/security_regression.test.ts`
- **Guarantees**:
  - Validates XML Digital Signatures (`SignedXml`) against IdP X.509 certificates.
  - Verifies `Reference DigestValue` over canonicalized Assertion nodes.
  - Completely eliminates regex-based `SignatureValue` bypass fallbacks.

### `SAML-XSW-001`: XML Signature Wrapping (XSW) & Duplicate Assertion ID Defense
- **Test File**: `backend/src/security_regression.test.ts`
- **Guarantees**:
  - Rejects SAML responses containing duplicate Assertion IDs.
  - Blocks injection of unsigned cloned Assertions preceding or succeeding signed Assertions.

### `SAML-XXE-001`: XML External Entity (XXE) & DTD Injection Defense
- **Test File**: `backend/src/security_regression.test.ts`
- **Guarantees**:
  - Rejects XML containing `<!DOCTYPE` or `<!ENTITY` declarations before DOM evaluation.

---

## 3. P0 OAuth 2.0 Authorization Code Flow & CSRF State

### `OAUTH-CSRF-001`: Cryptographic Single-Use State Validation
- **Test File**: `backend/src/security_regression.test.ts`
- **Guarantees**:
  - Generates 256-bit cryptographically random OAuth state tokens (`generateOAuthState()`).
  - Enforces strict single-use consumption (`verifyOAuthState()`) to prevent replay and CSRF attacks.

### `OAUTH-CODE-001`: Zero Client Secrets in Frontend
- **Guarantees**:
  - Frontend (`frontend/src/features/auth/AuthModal.tsx`) initiates OAuth authorization popup with server-generated state and receives an authorization code.
  - Backend (`backend/src/oauth.ts`) exchanges code for access token via `https://github.com/login/oauth/access_token` and `https://oauth2.googleapis.com/token`.
  - Client secrets (`GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET`) are never bundled in client assets.

---

## 4. P1 Two-Factor Authentication (TOTP) & Session Lifecycle

### `2FA-ENFORCE-001`: Real 2FA Enforcement on Login
- **Test File**: `backend/src/security_regression.test.ts`, `backend/src/security.test.ts`
- **Guarantees**:
  - If `user.twoFactorEnabled` is true, login requires valid 6-digit TOTP token or returns `{ requires2FA: true }`.
  - Unverified sessions cannot access authenticated endpoints.

### `SESSION-REVOKE-001`: Instant Global Session Invalidation via `tokenVersion`
- **Test File**: `backend/src/security_regression.test.ts`, `backend/src/auth.test.ts`
- **Guarantees**:
  - User model maintains `tokenVersion: Int`.
  - Calling `/api/v1/auth/logout-all` increments `tokenVersion` in PostgreSQL.
  - All existing JWTs carrying stale `tokenVersion` are immediately rejected by `auth` middleware.

---

## 5. P1 WebSocket / Canvas Collaboration IDOR Defense

### `WS-IDOR-001`: Room Ownership & Collaborator Verification
- **Test File**: `backend/src/security_regression.test.ts`
- **Guarantees**:
  - `collaborationEngine.isAuthorized(roomId, userId)` validates project ownership or explicit collaborator membership.
  - Unauthorized users cannot join private canvas rooms or receive broadcast updates.
  - Unregistered/unowned rooms fail closed.

---

## 6. P1 Multi-Worker Queue Visibility & Distributed Recovery

### `QUEUE-LEASE-001`: Visibility Timeout Lease Architecture
- **Implementation**: `worker/index.ts`
- **Guarantees**:
  - Replaces blind `rPopLPush` startup draining with lease-based visibility check (`VISIBILITY_TIMEOUT_MS = 60000`).
  - Active jobs being processed by Worker A are never stolen or re-executed by Worker B on startup.

---

## 7. Frontend Markdown XSS Sanitization

### `XSS-MD-001`: HTML & Event Handler Sanitization
- **Test File**: `backend/src/security_regression.test.ts`
- **Guarantees**:
  - Disarms `<img src=x onerror=alert(1)>` event handlers.
  - Strips `<script>`, `<style>`, `<iframe>`, `<svg>`, `<object>`, `<embed>` blocks and executable payloads.
  - Disarms `javascript:` and `vbscript:` URI schemes in anchor links and images.

---

## 8. Server-Side Request Forgery (SSRF) Protection

### `SSRF-IP-001`: Private & Cloud Metadata Range Blocking
- **Test File**: `backend/src/security_regression.test.ts`, `backend/src/security.test.ts`
- **Guarantees**:
  - Rejects loopback (`127.0.0.0/8`, `::1`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`, `metadata.google.internal`).
  - Performs pre-connection DNS resolution checks against DNS rebinding attacks (`validateResolvedUrlForSSRF`).

---

## Execution Summary

| Test Suite | Total Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Integration & Security Suite** | 211 | 211 | 0 | **PASS** |
| **Worker Sandbox & Adapter Suite** | 19 | 19 | 0 | **PASS** |
| **Frontend Static Typecheck & Build** | Typecheck + Bundle | PASS | 0 | **PASS** |
