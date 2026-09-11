# CodeArena — System Architecture

## Overview
CodeArena is an all-in-one developer operating system that unifies learning, competitive programming, real-time collaboration, technical interview preparation, project development, and developer community workflows into a high-performance modular platform.

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

## Core Modules & Boundaries

1. **Auth & Identity Domain (`/api/v1/auth`, `/api/v1/users`)**
   - JWT authentication with secure cookies and bearer header fallback.
   - RBAC: Student, Developer, Candidate, Interviewer, Instructor, Company, Admin.
   - User profiles with contribution heatmaps, contest ratings, XP, streak counters, and social links.

2. **Problem & Online Judge Domain (`/api/v1/problems`, `/api/v1/submissions`)**
   - 20+ curated algorithmic problems covering all DSA archetypes and company frequency tags.
   - Isolated asynchronous execution sandbox via Redis queues.
   - Support for JavaScript, Python, and C++ with automated driver harnesses and 5s TLE watchdog.
   - Hidden vs visible test case evaluation and performance percentiles.

3. **Learning & Roadmap Domain (`/api/v1/roadmaps`, `/api/v1/courses`)**
   - Interactive career and skill roadmaps (DSA Mastery, Frontend, Backend, System Design).
   - Module tracking, notes, and quiz milestones.

4. **Contest & Rating Domain (`/api/v1/contests`, `/api/v1/leaderboard`)**
   - Real-time scheduled contests with penalty-time calculation.
   - Elo-inspired ranking tiers: *Newbie (0-1199)*, *Pupil (1200-1399)*, *Specialist (1400-1599)*, *Expert (1600-1899)*, *Master (1900-2299)*, *Grandmaster (2300+)*.

5. **Community & Discussion Domain (`/api/v1/discussions`, `/api/v1/articles`)**
   - Technical Q&A and long-form engineering articles.
   - Tag taxonomy, upvoting, and reputation metrics.

6. **Interview & Live Coding Domain (`/api/v1/interviews`, `/api/v1/rooms`)**
   - Candidate/Interviewer dual-mode coding room with live problem selector and scorecard rubric.

7. **System Design & Whiteboard Domain**
   - Excalidraw-inspired architectural canvas with standard distributed systems primitives (Load Balancer, Cache, Message Queue, Sharded DB, CDN, Microservice).

8. **AI Developer Assistant Domain (`/api/v1/ai/assist`)**
   - Progressive hints (Hint ➔ Concept ➔ Approach ➔ Full Solution).
   - Time/space complexity analysis and code review.
