# CodeArena Step-by-Step Remediation Plan

**Status**: AWAITING USER APPROVAL  
**Rule**: No production code will be modified until user explicit approval.

---

## Phase 1: Critical Security Remediation (P0)

### Action 1.1: Sandbox Containerization & Fail-Closed Boundary
- **Target Files**: `worker/src/adapters/base.ts`, `worker/src/sandbox/index.ts`, `worker/src/sandbox/dockerRunner.ts`, `worker/src/adapters/cpp.ts`, `worker/src/adapters/java.ts`, `worker/src/adapters/rust.ts`.
- **Changes**:
  1. Add `cpp`, `java`, `rust`, `cs`, `kt`, `php`, `ruby`, `swift` to Docker runner images.
  2. Implement container-based compilation inside `runInDocker()` for compiled languages (`g++`, `javac`, `rustc`).
  3. In `worker/src/adapters/base.ts`, fail closed if `shouldUseDockerSandbox()` returns false in production or strict mode. Never fall back to host `spawn()`.

### Action 1.2: Remove SAML Regex Signature Fallback
- **Target Files**: `backend/src/saml.ts`.
- **Changes**:
  1. Remove lines 55–72 in `verifySAMLSignature()`.
  2. Rely exclusively on `SignedXml.checkSignature(xml)` with full Reference Digest validation.

### Action 1.3: Complete OAuth2 Code Flow & Add CSRF State
- **Target Files**: `backend/src/oauth.ts`, `backend/index.ts`, `frontend/src/features/auth/AuthModal.tsx`.
- **Changes**:
  1. In `backend/src/oauth.ts`, add GitHub OAuth code exchange via `https://github.com/login/oauth/access_token` using `GITHUB_CLIENT_SECRET`.
  2. Generate and verify cryptographic `state` parameter in `AuthModal.tsx` and `backend/index.ts`.
  3. Enforce secure account linking (prompt for verification if linking an existing password account).

---

## Phase 2: Session, 2FA, and RBAC Hardening (P1)

### Action 2.1: Schema Update & 2FA Persistence
- **Target Files**: `backend/prisma/schema.prisma`, `backend/index.ts`, `backend/src/auth.ts`.
- **Changes**:
  1. Add `isEmailVerified Boolean @default(false)`, `tokenVersion Int @default(0)`, `twoFactorEnabled Boolean @default(false)`, `twoFactorSecret String?` to `User` model.
  2. Persist 2FA secret on `/api/v1/auth/2fa/verify`.
  3. Require 2FA verification step during `/api/v1/auth/login`.
  4. In `auth` middleware, verify `payload.tokenVersion === user.tokenVersion` to enable instant global session revocation.

### Action 2.2: Multi-Worker Queue Reclaim Hardening
- **Target Files**: `worker/index.ts`.
- **Changes**:
  1. Replace unconditional `rPopLPush` startup loop with timestamp-based visibility timeout.
  2. Only reclaim tasks from `problems:processing` that have been idle for > 60 seconds.

### Action 2.3: Scope RBAC Privileges
- **Target Files**: `backend/src/auth.ts`.
- **Changes**:
  1. Remove `DEVELOPER` and `INSTRUCTOR` from `adminAuth` for user management and system administration endpoints.

---

## Phase 3: Verification & Integration Testing

1. Run live backend integration tests: `cd backend && bun test`.
2. Run worker multi-language sandbox tests: `cd worker && bun test`.
3. Run end-to-end user flows against live database.
