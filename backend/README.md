# CodeArena — Backend API Service

High-performance modular API server powered by Bun and Express, with PostgreSQL persistence via Prisma ORM and Redis caching/queues.

## Features
- **Authentication & RBAC**: JWT token management, 6-tier role-based access control.
- **Problem Catalog**: Full CRUD and filtering for DSA problems (difficulty, tags, companies).
- **Submissions**: Asynchronous submission ingestion into Redis queue (`problems`).
- **Community & Leaderboard**: Global contest ratings, XP points, and discussion forums.

## Setup & Running
```bash
# Install dependencies
bun install

# Database schema sync & client generation
bunx prisma db push
bunx prisma generate

# Start development server
bun run index.ts

# Run test suite
bun test
```
