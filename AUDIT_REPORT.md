# CodeArena Comprehensive Audit Report (Line-Accurate Second Pass)

**Date**: September 12, 2026  
**Repository**: `CodeArena` (`backend`, `worker`, `frontend`)  
**Audit Scope**: Complete line-by-line verification of authentication, authorization, sandbox isolation, queue lifecycle, database schema, CI/CD pipeline, and API attack surfaces.

---

## Executive Summary

This second-pass audit performed an evidence-based line-by-line inspection of the CodeArena codebase. Every finding is backed by direct code references, verified control flows, and reproducible failure paths.

### Key Highlights

1. **Sandbox Host Escape / Execution Boundary Failure**: In the default deployment mode (`SANDBOX_MODE` not explicitly configured to `"docker"`), the worker defaults to `"firecracker"`, but `runInFirecrackerMicroVM` is never invoked by any adapter or by `runProcessSafely`. Furthermore, for C++, Java, Rust, C#, Kotlin, PHP, Ruby, and Swift, the execution adapter runs directly on the host machine via Node `child_process.spawn()`. Arbitrary code execution on the host worker is confirmed.
2. **SAML XML Signature Verification Bypass**: `backend/src/saml.ts` includes a fallback regex-based verification path that verifies the RSA signature over `<ds:SignedInfo>` without verifying the `DigestValue` of the `<Assertion>`. This allows attackers to forge assertions for any user account (including administrator accounts) by attaching any valid IdP signature block (SAML XML Signature Wrapping).
3. **Broken & Insecure OAuth Implementations**: GitHub OAuth in `backend/src/oauth.ts` attempts to use the OAuth authorization `code` directly as a Bearer token against GitHub's `/user` endpoint without performing the backend Authorization Code exchange (`/login/oauth/access_token`). Neither Google nor GitHub flows generate or verify CSRF `state` tokens. Account linking automatically associates social identities to existing accounts without verifying prior account ownership.
4. **JWT & 2FA Session Disconnect**: While `backend/src/auth.ts` implements token revocation utilities and in-memory caches, `backend/index.ts` generates monolithic 7-day JWTs without binding them to `Session` or `RefreshToken` database models. 2FA verification (`/api/v1/auth/2fa/verify`) is completely stateless and never persisted to the `User` model, making 2FA cosmetic.
5. **Queue Lifecycle Multi-Worker Race**: On worker boot, `worker/index.ts` unconditionally drains all items from `problems:processing` back into `problems` via `rPopLPush`. In a multi-worker cluster, any new worker booting up will steal in-flight tasks currently being executed by peer workers.

---

## Detailed Findings Matrix

| ID | Severity | Status | File : Line | Finding Summary | Primary Failure Mode |
|---|---|---|---|---|---|
| **SEC-01** | CRITICAL | **CONFIRMED** | `worker/src/adapters/base.ts:37-59`<br>`worker/src/sandbox/index.ts:28-53`<br>`worker/src/adapters/cpp.ts:35-70` | Uncontained Host Code Execution & Adapter Sandbox Bypass | Submissions in default mode and all compiled languages (C++, Java, Rust) execute directly on host OS |
| **SEC-02** | CRITICAL | **CONFIRMED** | `backend/src/saml.ts:55-72` | SAML XML Signature Wrapping / Digest Bypass | Regex fallback validates SignedInfo RSA signature without checking Assertion DigestValue |
| **SEC-03** | HIGH | **CONFIRMED** | `frontend/src/features/auth/AuthModal.tsx:139-160`<br>`backend/src/oauth.ts:36-61`<br>`backend/index.ts:2130-2165` | Incomplete GitHub OAuth Code Flow & Missing CSRF State | Backend omits authorization code-for-token exchange; no `state` validation against login CSRF |
| **SEC-04** | HIGH | **CONFIRMED** | `backend/index.ts:2111, 2362-2398, 2412-2425`<br>`backend/src/auth.ts:107-135` | Disconnected JWT Lifecycles & Cosmetic Stateless 2FA | 7-day tokens lack DB session binding; 2FA is unpersisted; "logout-all" fails to revoke other devices |
| **SEC-05** | MEDIUM | **CONFIRMED** | `worker/index.ts:54-59` | Multi-Worker Task Stealing on Worker Boot | Worker startup loop drains entire `PROCESSING_QUEUE` into `PENDING_QUEUE`, interrupting peer workers |
| **SEC-06** | MEDIUM | **CONFIRMED** | `backend/src/auth.ts:185-189` | Overly Permissive `adminAuth` Role Definition | `DEVELOPER` and `INSTRUCTOR` roles are granted full administrative control over user management |
| **SEC-07** | LOW | **CONFIRMED** | `backend/src/emailVerification.ts:17, 31-64`<br>`backend/prisma/schema.prisma:60-83` | Ephemeral Email Verification Storage | Verification status stored in volatile Redis/memory instead of persistent PostgreSQL column |
| **SEC-08** | MEDIUM | **CONFIRMED** | `.github/workflows/ci.yml:60-104`<br>`backend/src/gaps.test.ts:53-59, 120-201` | Synthetic / Mocked Test Assertions in CI | Tests assert hardcoded local variables and closures rather than invoking live server endpoints |

---

## Roadmap to Security Certification

1. **Step 1**: Containerize All Language Adapters & Enforce Fail-Closed Sandbox Execution.
2. **Step 2**: Remove Insecure SAML Regex Signature Fallback.
3. **Step 3**: Implement Proper OAuth2 Authorization Code Exchange with Cryptographic State.
4. **Step 4**: Bind JWT Authentication to Database Sessions and Persist 2FA Credentials.
5. **Step 5**: Migrate Redis Worker Queue to Consumer Groups or Visibility Timeouts.
6. **Step 6**: Scope RBAC Permissions and Migrate Email Verification to PostgreSQL.
7. **Step 7**: Replace Synthetic Unit Tests with Real HTTP Integration Suites.
