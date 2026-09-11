# CodeArena Test Reality & CI Gate Report

**Date**: September 12, 2026  
**Scope**: Inspection of test files, assertion depth, mock usage, and CI/CD workflow reality.

---

## 1. Test Suite Summary

| Test File | Total Tests | Execution Target | Real vs Synthetic Assertions |
|---|---|---|---|
| `backend/src/api.integration.test.ts` | 18 | Live Express HTTP Server (Port 0) + Memory DB | **REAL**: Makes live HTTP requests (`fetch`) to endpoints, tests response status, headers, and payloads. |
| `backend/src/e2e.test.ts` | 6 | Live Express HTTP Server + Database | **REAL**: Tests full user flow (Signup -> Problem list -> Run code -> Submit -> Poll result). |
| `backend/src/security.test.ts` | 14 | Regex rules, SSRF URL validator, rate limiter | **REAL**: Validates SSRF blocking for private IPs, loopback, and metadata URLs. |
| `backend/src/gaps.test.ts` | 12 | OAuth token verification, Rate limiter, Score validation | **MIXED**: OAuth and rate limit tests are real; scorecard validation (`validateScore`) and `socialRegistrationRole` tests test locally defined mock constants/closures. |
| `backend/src/certification.test.ts` | 45 | Authentication, Validation, Password reset, SAML | **MIXED**: Validation and SAML parser tests are real; RBAC tests (`RBAC-001`) and admin suspension tests test local mock objects. |
| `worker/sandbox_security.test.ts` | 6 | Docker runner, Firecracker mock | **REAL**: Tests Docker container timeout, stdout flood cap (64KB), and fail-closed behavior. |
| `worker/test_matrix.test.ts` | 10 | Language Adapters (JS, TS, Python, Go, C++, Java, Rust) | **REAL**: Executes real compiler and runner binaries on the test runner machine. |

---

## 2. CI/CD Gate Analysis (`.github/workflows/ci.yml`)

### 2.1 Workflow Steps
1. **Dependency Installation**: `bun install` across backend, worker, frontend.
2. **Prisma Generation**: `bunx prisma generate` in backend and worker.
3. **Static Typecheck**: `bun x tsc --noEmit` across all 3 directories.
4. **Code Hygiene Gate**: `grep` check verifying no `process.env.JWT_SECRET` in `console.log`.
5. **Backend Tests**: `bun test` with `NODE_ENV=test`, `JWT_SECRET=ci_test_secret...`.
6. **Worker Tests**: `bun test` with `SANDBOX_MODE=docker`.
7. **Frontend Build**: `bun run build.ts`.
8. **Security Gate**: `bun pm untrusted` and `npm audit --audit-level=critical`.
9. **Docker Image Build**: Builds backend, worker, frontend Docker images.

### 2.2 Critical CI Limitations
- In step 6 & 11, the GitHub Actions runner runs with `SANDBOX_MODE: docker`. However, the runner environment does not pre-pull the language images (`gcc:14`, `eclipse-temurin:21`, etc.), causing Docker tests to either mock responses or skip compiled languages.
- Synthetic assertions in `gaps.test.ts` and `certification.test.ts` always pass in CI because they test local constants, masking real integration failures in production code paths.
