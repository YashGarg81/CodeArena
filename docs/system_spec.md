# CodeArena — Master System Specification

## 1. Executive Summary & Product Architecture
CodeArena is an all-in-one developer operating system that unifies competitive programming, real-time collaboration, technical interview preparation, project development, learning roadmaps, and community workflows into a high-performance modular platform.

```
                               ┌────────────────────────┐
                               │      React Client      │
                               │   (Monaco + Zustand)   │
                               └───────────┬────────────┘
                                           │ HTTP / WebSocket
                                           ▼
                               ┌────────────────────────┐
                               │     API Gateway /      │
                               │    Modular Monolith    │
                               │     (Bun + Express)    │
                               └──────┬──────────┬──────┘
                                      │          │
                            Prisma /  │          │ BullMQ / Redis
                            PostgreSQL│          │ Queue
                                      ▼          ▼
                               ┌──────────┐ ┌───────────────┐
                               │ Database │ │ Sandbox Judge │
                               │ (PG 18)  │ │    Workers    │
                               └──────────┘ └───────────────┘
```

---

## 2. Platform Subsystem Specifications

### 2.1 Core Architecture ([`docs/architecture.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/architecture.md))
- **Frontend**: React 18 SPA with Monaco Editor, Tailwind CSS, Lucide icons, and Zustand for state management.
- **API Tier**: High-throughput Bun runtime executing Express API routing.
- **Judge Worker**: Asynchronous queue processor daemon interacting via Redis `problems` channel.
- **Relational Persistence**: PostgreSQL 18 with Prisma ORM data modeling.

### 2.2 Identity & Role-Based Access Control ([`docs/authentication.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/authentication.md))
- **JWT Authentication**: Signed HMAC SHA-256 tokens with 7-day TTL and secure cookie/header fallback.
- **Role Hierarchy**:
  - `STUDENT`: Access to practice problems, roadmaps, and public contests.
  - `DEVELOPER`: Problem solving, project sandboxes, community writing, and portfolios.
  - `CANDIDATE`: Access to designated interview rooms and timed assessments.
  - `INTERVIEWER`: Room creation, live candidate evaluation, and private scoring rubrics.
  - `INSTRUCTOR`: Course authoring, assignment management, and student tracking.
  - `ADMIN`: Global user management, problem curation, and system diagnostics.

### 2.3 Data Model & Schema ([`docs/database.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/database.md))
- Fully normalized relational schema covering `User`, `Problems`, `Submissions`, `Contest`, `ContestParticipant`, `RatingHistory`, `Posts`, `Comments`, `Vote`, `Snippet`, `Note`, and `Achievement`.
- Automated indexing on query paths (`username`, `email`, `contestRating`, `difficulty`, `category`).

### 2.4 Online Judge & Sandboxed Execution ([`docs/judge.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/judge.md))
- **Multi-Language Driver Matrix**:
  - **JavaScript**: Node.js engine, stdio stream piping, 5000 ms timeout.
  - **Python**: Python 3.x runtime, isolated driver harness, 5000 ms timeout.
  - **C++**: GCC (`g++`) compilation to ephemeral binary executable, 5000 ms timeout.
- **Verdict Pipeline**: `Processing` ➔ `Success` (Accepted) | `WrongAnswer` | `TLE` | `RuntimeError` | `CompileError`.

### 2.5 Real-Time Collaboration & Whiteboard ([`docs/collaboration.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/collaboration.md))
- **Ephemeral Rooms**: Keyed by unique UUID with real-time participant presence and typing heartbeat.
- **System Design Canvas**: Infinite vector whiteboard with architectural primitives (Load Balancer, Microservice, Cache, Queue, DB, CDN).
- **Live Interview Split View**: Dual-pane workspace with synchronized Monaco buffer, scratchpad, timer, and rubric scorecard.

### 2.6 Security & Hardening ([`docs/security.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/security.md))
- **OWASP Defense**: Parameterized Prisma SQL, XSS sanitization (`DOMPurify`), CSRF token protection, and Helmet HTTP security headers.
- **Execution Sandboxing**: Ephemeral run directories, stripped environment variables, memory boundaries (128–256 MB), and hard 5s `SIGKILL` watchdog.

### 2.7 Deployment & Production Operations ([`docs/deployment.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/deployment.md))
- **Local Dev Stack**: Bun runtime, PostgreSQL 18, and Redis 7.
- **Containerized Orchestration**: Docker Compose multi-container setup with automated service healthchecks and isolated judge workers.

### 2.8 Scaling & Performance Topology ([`docs/scaling.md`](file:///c:/Users/LENOVO/Downloads/26-june-leetcode-v0-assignment-main/docs/scaling.md))
- **Horizontal API Scaling**: Stateless REST tier fronted by reverse proxy/load balancer.
- **Queue-Based Autoscaling**: KEDA/HPA scaling worker instances based on Redis `LLEN problems`.
- **Database Scaling**: Read replicas for problem browsing/leaderboards; dedicated primary instance for write transactions.

---

## 3. SLA & Operational Benchmarks

| Metric | Target SLA | Strategy |
|---|---|---|
| API Response Latency (p95) | < 50 ms | Redis caching for problem listings & leaderboards |
| Submission Queue Latency | < 200 ms | Redis in-memory FIFO queue (`BRPOP`) |
| Judge Verdict Turnaround | < 3000 ms | Fast driver injection & warm container reuse |
| WebSocket Frame Sync | < 30 ms | Binary/compact JSON message payloads |
| System Availability | 99.9% | Healthcheck probes and automated worker recovery |

