# CodeArena — Architecture Audit & Flow Verification

**Audit Date**: September 12, 2026  
**Repository**: [https://github.com/YashGarg81/Codearena](https://github.com/YashGarg81/Codearena)  
**Status**: VERIFIED EVIDENCE-BASED AUDIT  

---

## 1. Real System Architecture Flow

```
+-------------------------------------------------------------------------------+
|                                React 19 Client                                |
|           (Monaco Editor, Zustand State, React Router, Canvas Studio)          |
+-----------------------+-------------------------------+-----------------------+
                        | HTTP / REST                   | WebSocket (Socket.IO)
                        v                               v
+-------------------------------------------------------------------------------+
|                        API Gateway / Modular Monolith                         |
|                         (Bun 1.3+ & Express Framework)                        |
|                                                                               |
|  - Auth & RBAC (JWT, Revocation, SAML 2.0, OAuth2 verification)               |
|  - Rate Limiter (Token Bucket / Sliding Window)                               |
|  - DSA Problem & Submission Manager                                           |
|  - AI Mentor & Complexity Review Engine                                       |
|  - System Design Canvas API (In-Memory Map Store)                             |
|  - Battle Arena & Live Pair Programming Rooms                                 |
+-----------+-----------------------------------+-------------------+-----------+
            | Prisma ORM                        | Redis (rPush)     | Memory State
            v                                   v                   v
+-----------------------+           +-----------------------+ +-----------------+
|   PostgreSQL 16/18    |           |     Redis 7 Queue     | | In-Memory Stores|
| (Relational Database) |           |  (problems / pending) | | (SD Canvas,     |
+-----------------------+           +-----------+-----------+ |  Social, Maps)  |
            ^                                   |             +-----------------+
            | Status Update / Verdict           | rPopLPush (Processing list)
            |                                   v
+-----------+-------------------------------------------------------------------+
|                        Sandboxed Judge Worker Daemon                          |
|                       (Bun 1.3+ Queue Consumer Engine)                        |
|                                                                               |
|  - Queue Reliability (Atomic rPopLPush, crash recovery, DLQ)                  |
|  - Static Code Pre-Validation & Heuristic Inspection                          |
|  - Multi-Language Adapters (12 Languages: JS, PY, CPP, JAVA, GO, RS, etc.)     |
|  - Sandbox Isolation Boundary:                                                |
|      * Tier 1: Hardware-virtualized Firecracker MicroVM (STUB / INCOMPLETE)   |
|      * Tier 2: Hardened Rootless OCI Docker Container (--network none, RO)    |
|      * Tier 3: Local Process Execution (Strictly Dev/Test Only)               |
+-------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown & Verification

### A. Frontend Layer (`frontend/src/`)
- **Entry Points**: `src/index.ts`, `src/index.html`, `src/App.tsx`.
- **Core Features**:
  - `features/problems/`: Monaco editor integration, problem viewer, editorial, submissions tab.
  - `features/arena/`: 1v1 live competitive matchmaking interface.
  - `features/system-design/`: Visual architecture whiteboard canvas.
  - `features/interviews/`: Split candidate-interviewer technical workspace.
  - `features/academy/`: Interactive DSA learning lessons & quizzes.
  - `features/contests/`: Timed contest participation & leaderboards.
- **Client Bundler**: `frontend/build.ts` (custom Bun bundler building to `dist/`).

### B. Backend API Gateway (`backend/`)
- **Entry Point**: `backend/index.ts` (monolith registering modular routers).
- **Sub-Routers & Modular Engines**:
  - `src/auth.ts`: JWT token management with in-memory revocation TTL cache.
  - `src/saml.ts`: SAML 2.0 XML assertion parser with XML-DSig signature verification.
  - `src/oauth.ts`: GitHub (`/user`) and Google (`tokeninfo`) identity verification.
  - `src/systemDesign.ts`: System design templates, simulation engine & revisions.
  - `src/aiService.ts` / `src/aiMentor.ts`: Socratic hints & AST code complexity.
  - `src/debuggerEngine.ts`: Step-by-step AST execution tracer.
  - `src/battleArena.ts`: 1v1 Elo matchmaking & room lifecycle.
  - `src/collaboration.ts`: Real-time operational transform code collaboration.
  - `src/rateLimit.ts`: Distributed token-bucket rate limiter.
  - `src/security.ts` & `src/sandboxSecurity.ts`: Pre-flight security heuristic AST filter.
  - `src/ssrf.ts`: DNS pinning & private RFC 1918 / Cloud metadata IP blocker.

### C. Database & Persistence Layer (`backend/prisma/`)
- **Schema**: `backend/prisma/schema.prisma` (26 Models, 6 Enums).
- **Core Entities**: `User`, `Problems`, `Submissions`, `TestCases`, `Contests`, `Enrollment`, `AuditLog`, `Session`, `RefreshToken`.
- **ORM**: Prisma Client v7/v8 outputting to `generated/prisma/`.

### D. Queue & Asynchronous Messaging
- **Pending Queue Key**: `problems` (Redis list).
- **Processing Queue Key**: `problems:processing` (Redis list).
- **Producer**: `backend/index.ts` line 3676 (`redis.lPush`).
- **Consumer**: `worker/index.ts` line 66 (`rPopLPush`).

### E. Sandboxed Worker Daemon (`worker/`)
- **Entry Point**: `worker/index.ts`.
- **Language Adapters** (`worker/src/adapters/`):
  - `javascript.ts`, `python.ts`, `cpp.ts`, `java.ts`, `go.ts`, `rust.ts`, `cs.ts`, `kt.ts`, `php.ts`, `ruby.ts`, `swift.ts`.
  - `base.ts`: Immediate TLE timer resolution, memory caps, sanitized environment (`getSanitizedEnv()`).
- **Sandbox Isolation Engines** (`worker/src/sandbox/`):
  - `dockerRunner.ts`: Hardened Docker runner (`--network none`, `--read-only`, `--user 1000:1000`, `--cap-drop=ALL`).
  - `firecrackerRunner.ts`: MicroVM boot stub (**INCOMPLETE**).

---

## 3. Discrepancies Between Intended vs Real Architecture

1. **System Design Persistence**:
   - *Intended*: Persisted to PostgreSQL database with revisions and version rollback.
   - *Actual Code*: Stored exclusively in an in-memory `Map<string, SDProject>` (`sdProjectsStore`) inside `backend/src/systemDesign.ts`. Any container restart purges all user-created canvas designs.

2. **Social Follow Graph & Tournament Brackets**:
   - *Intended*: PostgreSQL relational follow graph and tournament state.
   - *Actual Code*: Stored in in-memory Maps (`followersMap`, `followingMap`, `tournaments`) inside `backend/src/socialEngine.ts`.

3. **Firecracker MicroVM Execution**:
   - *Intended*: Full microVM boot via `/dev/kvm`, guest kernel injection, and standard I/O pipes.
   - *Actual Code*: Spawns the Firecracker CLI daemon but does not execute the HTTP socket REST API calls (`/boot-source`, `/drives`, `/actions/InstanceStart`).
