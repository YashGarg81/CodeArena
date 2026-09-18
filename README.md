# CodeArena — Production-Grade Developer Operating System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Runtime](https://img.shields.io/badge/runtime-Bun%201.3+-black.svg)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL%2018-blue.svg)]()
[![Cache](https://img.shields.io/badge/cache-Redis%207-red.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React%2019-61dafb.svg)]()

> **CodeArena** is a unified developer platform combining competitive programming, online judge sandboxes, real-time collaboration, system design whiteboards, interactive learning roadmaps, technical interview workspaces, and developer community forums.

---

## 🏛️ System Architecture

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

## 📁 Repository Layout & Architecture

```
.
├── backend/                              # Modular REST & WebSocket API Server (Bun + Express)
│   ├── prisma/                           # PostgreSQL relational schema & database migrations
│   │   └── schema.prisma                 # Core domain models (User, Problem, Submission, Contest, etc.)
│   ├── generated/                        # Generated Prisma ORM client
│   ├── src/                              # Core backend architecture & modular domain services
│   │   ├── aiMentor.ts                   # Socratic AI hints & code complexity analysis engine
│   │   ├── aiService.ts                  # AI router & progressive prompt engineering pipeline
│   │   ├── antiCheat.ts                  # Keystroke anomaly, paste frequency & submission heuristics
│   │   ├── audit.ts                      # Immutable compliance audit logging service
│   │   ├── auth.ts                       # JWT token issuance, verification & in-memory revocation cache
│   │   ├── battleArena.ts                # Real-time 1v1 Elo matchmaking & room state synchronization
│   │   ├── collaboration.ts              # Operational transform & multi-cursor WebSocket rooms
│   │   ├── config.ts                     # Environment configuration & strict secret validation
│   │   ├── debuggerEngine.ts             # Interactive step-by-step AST execution tracer
│   │   ├── emailService.ts               # Transactional email dispatcher (verification, alerts)
│   │   ├── emailVerification.ts          # Email verification tokens & account lifecycle
│   │   ├── githubSync.ts                 # Automated repository solution sync & commit builder
│   │   ├── infra.ts                      # System health, telemetry & infrastructure metrics
│   │   ├── interviewRoutes.ts            # Scheduled technical interviews, calendar & private rubrics
│   │   ├── judgeEngine.ts                # Subtask evaluator, partial scoring & verdict aggregator
│   │   ├── judgePrivacy.ts               # Test case output masking & hidden test privacy filters
│   │   ├── notifications.ts              # Real-time event notifications & user activity feed
│   │   ├── oauth.ts                      # GitHub & Google OAuth2 token exchange & verification
│   │   ├── outputCheckers.ts             # Floating-point epsilon, whitespace & tokenized checkers
│   │   ├── passwordReset.ts              # Secure hashed password reset tokens & expiry rules
│   │   ├── plagiarism.ts                 # Token-based AST normalization & winnowing similarity
│   │   ├── platformServices.ts           # Failure-driven recommendation engine & benchmark percentiles
│   │   ├── pluginEngine.ts               # Extensible webhook & plugin lifecycle dispatcher
│   │   ├── publicProblem.ts              # Published problem visibility sanitizers & views
│   │   ├── queue.ts                      # Reliable Redis queue consumer & producer abstractions
│   │   ├── rateLimit.ts                  # Redis-backed distributed token bucket rate limiters
│   │   ├── ratingEngine.ts               # Contest performance Elo rating recalculation engine
│   │   ├── rbac.ts                       # 6-tier Granular Role-Based Access Control matrix
│   │   ├── redis.ts / redisClient.ts     # Redis client connection pool & caching layer
│   │   ├── roadmapRoutes.ts              # Topic mastery tracks, skill trees & milestone sync
│   │   ├── saml.ts                       # Enterprise SAML 2.0 SSO identity provider parsing
│   │   ├── sandboxSecurity.ts            # Pre-flight code inspection & dangerous pattern detector
│   │   ├── security.ts                   # AST security validator & system call filter
│   │   ├── socialEngine.ts               # User follow graphs, social feeds & tournament brackets
│   │   ├── ssrf.ts                       # Server-Side Request Forgery & private IP blocklist
│   │   ├── storageService.ts             # Problem assets & solution file persistence
│   │   ├── systemDesign.ts               # Distributed system whiteboard canvas state API
│   │   ├── totp.ts                       # RFC 6238 TOTP two-factor authentication & backup codes
│   │   ├── validation.ts                 # Zod/custom input sanitation & pagination clamping
│   │   └── *.test.ts                     # Integration & security test suites (e2e, security, gaps, etc.)
│   ├── db.ts                             # Singleton Prisma database client
│   ├── drivers.ts                        # Solution harness runner wrappers & stdin/stdout drivers
│   ├── index.ts                          # Main Express application entrypoint & route registration
│   ├── Dockerfile                        # Multi-stage production container manifest
│   └── package.json                      # Backend dependencies & scripts
│
├── frontend/                             # Single-Page Application (React 19 + Monaco Editor)
│   ├── src/                              # Frontend source code
│   │   ├── components/                   # Reusable UI component library
│   │   │   ├── common/                   # Shared UI primitives (Buttons, Badges, Modals, Inputs)
│   │   │   ├── navigation/               # Navbar, sidebar, breadcrumbs & command palette
│   │   │   ├── system-design/            # Architecture canvas nodes, connections & toolbars
│   │   │   └── ui/                       # Layout containers, cards, dialogs & toasts
│   │   ├── features/                     # Domain-driven feature modules
│   │   │   ├── academy/                  # Interactive tutorial lessons, quizzes & interactive run
│   │   │   ├── admin/                    # Administrative dashboard, problem & contest management
│   │   │   ├── arena/                    # 1v1 Real-time live code battle arena & matchmaking
│   │   │   ├── auth/                     # Login, signup, OAuth buttons, TOTP 2FA modals
│   │   │   ├── collab/                   # Live pair programming editor with shared cursors
│   │   │   ├── community/                # Developer discussion forums, comments & tagging
│   │   │   ├── contests/                 # Timed programming contests, standings & countdowns
│   │   │   ├── interviews/               # Technical interview studio, shared notes & scorecards
│   │   │   ├── leaderboard/              # Global rating leaderboards & user rank badges
│   │   │   ├── notes/                    # Rich markdown personal scratchpad & problem notes
│   │   │   ├── playground/               # Freeform scratchpad multi-language code runner
│   │   │   ├── problems/                 # Problem explorer, description tabs & submission history
│   │   │   ├── profile/                  # Heatmaps, solved statistics, activity timeline & badges
│   │   │   ├── roadmap/                  # Visual career roadmaps & interactive milestone tracking
│   │   │   ├── submissions/              # Live submission progress, execution telemetry & results
│   │   │   └── system-design/            # System design studio, capacity estimator & canvas
│   │   ├── services/                     # Centralized API service & HTTP/WebSocket clients
│   │   ├── types/                        # Global TypeScript interfaces & data contracts
│   │   ├── lib/ & utils/                 # Formatting, date parsing, Monaco helpers & storage
│   │   ├── App.tsx                       # Main application routing & root layout
│   │   ├── SystemDesignStudio.tsx        # System design workspace standalone view
│   │   ├── index.css                     # Design system tokens, Tailwind directives & dark theme
│   │   ├── index.html                    # HTML5 shell & font preloading
│   │   └── index.ts                      # Client hydration entrypoint
│   ├── build.ts                          # Bun bundler script for optimized production packaging
│   ├── nginx.conf                        # Production reverse proxy & static asset cache config
│   ├── Dockerfile                        # Nginx static deployment container manifest
│   └── package.json                      # Frontend dependencies & scripts
│
├── worker/                               # Isolated Code Execution Engine & Judge Worker Daemon
│   ├── prisma/                           # Worker database relational schema
│   │   └── schema.prisma                 # Worker-specific database models & client configuration
│   ├── generated/                        # Generated Prisma ORM client
│   ├── src/
│   │   ├── adapters/                     # Multi-language execution adapters
│   │   │   ├── base.ts                   # Process execution lifecycle, TLE enforcement & output bounds
│   │   │   ├── javascript.ts             # Node.js / Bun runtime adapter
│   │   │   ├── python.ts                 # Python 3 execution adapter
│   │   │   ├── cpp.ts                    # GCC 14 C++ compilation & runner adapter
│   │   │   ├── java.ts                   # OpenJDK 21 Java compiler & JVM runner adapter
│   │   │   ├── go.ts                     # Golang compiler & runner adapter
│   │   │   ├── rust.ts                   # Rustc compilation & execution adapter
│   │   │   ├── cs.ts                     # C# / .NET compilation & execution adapter
│   │   │   ├── kt.ts                     # Kotlin compiler & execution adapter
│   │   │   ├── php.ts                    # PHP CLI runtime adapter
│   │   │   ├── ruby.ts                   # Ruby 3 interpreter adapter
│   │   │   ├── swift.ts                  # Swift compiler & execution adapter
│   │   │   ├── index.ts                  # Language adapter registry & alias resolver
│   │   │   └── types.ts                  # Execution options, limits & verdict interfaces
│   │   └── sandbox/                      # Multi-tier virtualization & container isolation
│   │       ├── firecrackerRunner.ts      # Tier 1: Hardware-virtualized KVM MicroVM execution
│   │       ├── dockerRunner.ts           # Tier 2: Hardened rootless OCI container isolation
│   │       └── index.ts                  # Sandbox policy validator & fail-closed security gate
│   ├── db.ts                             # Worker database client connection
│   ├── drivers.ts                        # Solution harnesses & standard I/O driver matrices
│   ├── index.ts                          # Reliable Redis queue consumer daemon (`rPopLPush`)
│   ├── index.test.ts                     # Verdict evaluation & test harness unit tests
│   ├── test_matrix.test.ts               # Multi-language compatibility & adapter validation matrix
│   ├── sandbox_security.test.ts          # Isolation boundary & sandbox security verification suite
│   ├── Dockerfile                        # Worker container deployment manifest
│   └── package.json                      # Worker dependencies & scripts
│
├── .github/                              # CI/CD automation & release pipelines
│   └── workflows/
│       └── ci.yml                        # 12-stage automated CI Release Gate pipeline
├── docker-compose.yml                    # Multi-container orchestration (API, Worker, Frontend, PG, Redis)
├── .env.example                          # Comprehensive environment variables template
└── package.json                          # Monorepo workspace scripts & commands
```

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- **Bun**: v1.1+
- **PostgreSQL**: v16+ (or via Docker)
- **Redis**: v7+ (or via Docker)

### 2. Local Setup
```bash
# 1. Start Database & Cache
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=codearena postgres:16-alpine
docker run -d -p 6379:6379 redis:7-alpine

# 2. Setup Backend & Seed Database
cd backend
bun install
bunx prisma db push
bunx prisma generate

# 3. Start Backend API Server (Port 3000)
bun run index.ts

# 4. Start Worker Execution Daemon (Separate Terminal)
cd ../worker
bun install
bun run index.ts

# 5. Start Frontend Client (Port 3003)
cd ../frontend
bun install
bun dev
```

---

## 🧪 Testing & Validation

```bash
# Typecheck all sub-projects
bun run typecheck

# Build frontend production bundle
bun run build:frontend

# Run automated test suites
bun test
```

## 🛠️ Operations Runbook

### Health & readiness
- `GET /health` — liveness only (process alive). **Do not use for load-balancer health.**
- `GET /ready` — returns 200 only when PostgreSQL answers `SELECT 1` (Redis reported separately). Point load balancers / orchestrator healthchecks here.

### Metrics
- `GET /api/v1/metrics` (admin token required) — Prometheus-text exposition:
  `http_requests_total`, `http_request_duration_ms`, `http_server_errors_total`,
  `judge_runs_total`, `judge_run_duration_ms`, plus worker verdicts merged from
  Redis (`worker_verdicts_total`). Append `?format=json` for a JSON snapshot.

### Database backups
```bash
# Nightly (cron) or on demand — verified backup → restore → row-count match:
bun run backup:db                                   # ./backups/codearena_*.dump, retention 14
bun run restore:db ./backups/codearena_<ts>.dump    # restores into codearena_restore_test + verifies
```
Tune with `DB_CONTAINER`, `POSTGRES_USER`, `POSTGRES_DB`, `BACKUP_DIR`, `RETENTION`.
Redis persists via the `redisdata` volume; PostgreSQL data via `pgdata`.

### Judge cache maintenance
Go builds share a content-addressed `codearena-gocache` volume (steady-state
~1 s builds; safe across submissions by hash). It grows unboundedly, so prune it:
```bash
bun run maintenance:prune-caches                   # prunes only if over GOCACHE_MAX_MB (default 2048)
```

### Production boot requirements
`NODE_ENV=production` needs `JWT_SECRET` (≥32 chars, non-placeholder),
`REFRESH_TOKEN_SECRET`, `CORS_ORIGIN`, `DATABASE_URL`, and a reachable
PostgreSQL — otherwise the backend exits(1) and the worker refuses jobs.
Never set `ALLOW_IN_MEMORY_DB=true` in production.

## 📄 License
MIT © CodeArena Engineering
