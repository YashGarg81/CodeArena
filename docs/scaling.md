# CodeArena — Scaling & High-Availability Architecture

## 1. Overview & Scaling Principles
CodeArena is engineered for horizontal scale across compute, queue processing, caching, and persistent storage layers to handle traffic spikes during global live contests.

```
                    ┌────────────────────────┐
                    │  CDN / Load Balancer   │
                    │  (Cloudflare / Nginx)  │
                    └───────────┬────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
         ┌──────────────┐┌──────────────┐┌──────────────┐
         │ API Node #1  ││ API Node #2  ││ API Node #N  │
         └───────┬──────┘└──────┬───────┘└──────┬───────┘
                 │              │               │
                 ├──────────────┴───────────────┤
                 │                              │
                 ▼                              ▼
      ┌──────────────────────┐      ┌──────────────────────┐
      │   Redis Cluster /    │      │  PostgreSQL Cluster  │
      │   Queue & Cache      │      │  Primary (Writes)    │
      └──────────┬───────────┘      └──────────┬───────────┘
                 │                             │
          ┌──────┴──────┐               ┌──────┴──────┐
          ▼             ▼               ▼             ▼
   ┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐
   │ Judge Wrk 1 ││ Judge Wrk N ││ Read Replica││ Read Replica│
   └─────────────┘└─────────────┘└─────────────┘└─────────────┘
```

---

## 2. API Layer Horizontal Scaling
- **Stateless Design**: All user authentication tokens (JWT) and session records are stateless or backed by Redis, allowing round-robin routing across infinite API instances.
- **Connection Management**: PostgreSQL connection pooling via PgBouncer or Prisma client connection pool limits to prevent connection exhaustion.
- **Graceful Shutdown**: SIGTERM handling completes in-flight requests before container termination.

---

## 3. Sandboxed Judge Worker Scaling
- **Consumer-Worker Model**: Workers continuously pop execution payloads from Redis queue (`BRPOP problems 0`).
- **Autoscaling Policy (KEDA / HPA)**:
  - Metric: Redis Queue Length (`LLEN problems`).
  - Target: Queue depth > 50 jobs scales worker replicas from baseline 2 up to 30 instances.
  - Scale Down: Cooldown period of 120 seconds to prevent thrashing.
- **Resource Constraints**:
  - CPU Limit per container: 1.0 core.
  - RAM Limit per container: 512 MB.

---

## 4. Database Scaling & Read Replicas
- **Read-Heavy Workloads**: 90% of database traffic consists of problem lookups, leaderboard queries, roadmaps, and profile views.
- **Replication Topology**:
  - Single **Primary (Leader)** node handles all submissions, contest entries, and profile updates.
  - Multiple **Read Replicas** serve catalog browsing and leaderboard caches.
- **Caching Strategy**:
  - `problems:list`: Cached in Redis with 10-minute TTL.
  - `leaderboard:global`: Cached with 60-second TTL.
  - `problem:<id>`: Cached with 1-hour TTL, invalidated on author edits.
