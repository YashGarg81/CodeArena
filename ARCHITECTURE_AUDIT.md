# CodeArena Architecture Audit Report

**Date**: September 12, 2026  
**Scope**: High-level and component architecture analysis, inter-service communication, scalability, and lifecycle guarantees.

---

## 1. System Architecture Overview

```
                        ┌──────────────────────────────┐
                        │   React / Vite Frontend      │
                        └──────────────┬───────────────┘
                                       │ HTTP / WebSockets
                                       ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                 Express Backend API (Port 3003)              │
        │  - Authentication & RBAC (JWT, Argon2, SAML, OAuth)          │
        │  - Problem & Contest Management                              │
        │  - Collaborative Canvas (Socket.IO)                          │
        │  - Rate Limiting (Token Bucket / Sliding Window)             │
        └──────────────┬───────────────────────────────┬───────────────┘
                       │                               │
            PostgreSQL │ Query / Transactions          │ Redis Queue & Cache
                       ▼                               ▼
        ┌──────────────────────────────┐ ┌─────────────────────────────┐
        │   PostgreSQL Database        │ │   Redis Instance            │
        │   (Prisma ORM with pg-adapter│ │   - Submission Queue        │
        │    & In-Memory Dev Proxy)    │ │   - Revocation Set & Cache  │
        └──────────────────────────────┘ └──────────────┬──────────────┘
                                                        │ rPopLPush
                                                        ▼
                                         ┌─────────────────────────────┐
                                         │  Judge Worker Service       │
                                         │  - Dequeues & Pre-validates │
                                         │  - Language Adapters        │
                                         │  - Docker / MicroVM Sandbox │
                                         │  - DB Results Updater       │
                                         └─────────────────────────────┘
```

---

## 2. Queue Lifecycle Deep-Dive

### 2.1 Lifecycle Stages

1. **Enqueue**:
   - Backend receives `POST /api/v1/submissions` or `/run`.
   - Creates `prisma.submissions` record with status `Processing`.
   - Executes `redisClient.lPush("problems", JSON.stringify({ submissionId, problemId, code, language }))`.
2. **Acquisition**:
   - Worker connects to Redis with RESP 2.
   - Executes `redisClient.rPopLPush("problems", "problems:processing")` to atomically claim the task.
3. **Processing**:
   - Worker parses JSON payload.
   - Validates sandbox mode via `validateSandboxSafety()`.
   - Validates syntax security heuristic via `validateCodeSecurity(code, language)`.
   - Retrieves problem details and relational test cases from PostgreSQL.
   - Invokes `LanguageAdapterRegistry.executeCode()`.
4. **Execution Boundary**:
   - For `js`, `ts`, `py`, `go` (when `SANDBOX_MODE="docker"`), code executes inside an isolated Docker container with `--network none`, `--read-only`, `--cap-drop=ALL`, `--user 1000:1000`, and memory quotas.
   - For other languages or in default mode, execution falls through to host `spawn()`.
5. **Database Update & Scoring**:
   - Worker computes runtime, memory, and status (`Success`, `WrongAnswer`, `TLE`, `CompileError`, `RuntimeError`).
   - Idempotently increments `solveCount` and user XP / streak if submission is newly `Success`.
   - Updates `prisma.submissions` with final status and sanitized test results.
6. **ACK & Removal**:
   - In the `finally` block, worker removes the item from `problems:processing` via `redisClient.lRem("problems:processing", 1, response)`.
7. **Crash Recovery & DLQ**:
   - If unhandled execution error occurs, worker increments `attempts`.
   - If `attempts < 3`, re-enqueues to `problems`.
   - If `attempts >= 3`, moves to `problems:dlq` and marks DB submission as `Failure`.

### 2.2 Architectural Weakness in Queue
- **Startup Recovery Race**: On startup, worker runs `while (stranded = await rPopLPush(PROCESSING, PENDING))` which drains all tasks currently in progress across all workers, breaking horizontal scaling.

---

## 3. Authentication & Session Architecture

### 3.1 JWT Architecture
- Monolithic 7-day JWTs signed with `getJwtSecret()`.
- Tokens are verified statelessly in `auth` middleware.
- In-memory `revokedTokensMemory` Map with a 10,000 item capacity and 7-day TTL, synced with Redis key `revoked_token:<hash>`.
- Token revocation is checked in `auth` middleware, but `optionalAuth` only checks local in-memory Map.
- **Architectural Gap**: Tokens are not linked to database `Session` records or a user `tokenVersion` epoch, making global session invalidation impossible.

### 3.2 OAuth Architecture
- Frontend popup communication via `window.opener.postMessage()`.
- Google uses ID token validation via tokeninfo / userinfo endpoints.
- GitHub lacks the backend authorization code exchange step.
- No cryptographic `state` token is generated or validated.

---

## 4. Horizontal Scalability Assessment

| Component | Scalability Rating | Scalability Bottlenecks |
|---|---|---|
| **Backend API** | **HIGH** | Stateless Express architecture; can scale horizontally behind a load balancer. Redis client handles distributed rate limiting and token revocation. |
| **Database** | **HIGH** | PostgreSQL with indexed lookups on all foreign keys and query paths. Fallback in-memory proxy ensures local development resilience. |
| **Judge Worker** | **LOW / BLOCKED** | Worker startup recovery loop drains `PROCESSING_QUEUE` unconditionally, preventing multiple worker instances from running concurrently without stealing active tasks. |
| **Socket Server** | **MEDIUM** | Uses in-memory Map `socketMessageCounts` for rate limiting; multiple Socket.IO nodes require Redis adapter for cross-node canvas broadcasting. |
