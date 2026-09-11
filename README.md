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

## 📁 Repository Layout

```
.
├── backend/                  # REST API server & database migration seeds
│   ├── generated/            # Generated Prisma client
│   ├── prisma/               # Prisma relational schema
│   ├── index.ts              # Core Express API router
│   └── package.json          # Backend dependencies
├── frontend/                 # React SPA & Monaco editor client
│   ├── src/                  # Application source (App.tsx, components, styling)
│   ├── build.ts              # High-performance Bun bundler script
│   └── package.json          # Frontend dependencies
├── worker/                   # Sandboxed execution daemon & multi-language runner
│   ├── src/                  # Execution adapters & Docker/Firecracker isolation
│   ├── generated/            # Generated Prisma client
│   ├── prisma/               # Worker database schema
│   ├── index.ts              # Reliable queue consumer daemon (rPopLPush)
│   └── package.json          # Worker dependencies
├── .github/workflows/        # Automated CI Release Gate pipeline
├── docker-compose.yml        # Multi-container production deployment manifest
└── package.json              # Unified monorepo scripts
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

## 📄 License
MIT © CodeArena Engineering
