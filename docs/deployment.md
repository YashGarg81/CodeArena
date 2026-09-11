# CodeArena — Deployment & Operations Guide

## 1. Local Development Setup

### Prerequisites
- **Bun**: v1.1+
- **PostgreSQL**: v16+ (or Docker container)
- **Redis**: v7+ (or Docker container)

### Environment Configuration

#### Backend (`backend/.env`)
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codearena?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="codearena-production-super-secret-key-2025"
CORS_ORIGIN="http://localhost:5173"
```

#### Worker (`worker/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codearena?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Running Locally
```bash
# 1. Start PostgreSQL & Redis
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=codearena postgres:16-alpine
docker run -d -p 6379:6379 redis:7-alpine

# 2. Database migration & Prisma Client generation
cd backend && bunx prisma db push && bunx prisma generate

# 3. Start Backend API Server
cd backend && bun run index.ts

# 4. Start Worker Execution Daemon
cd worker && bun run index.ts

# 5. Start Frontend Dev Server
cd frontend && bun run ./src/index.ts
```

---

## 2. Docker & Containerized Deployment

### Multi-Stage Docker Compose Stack (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: codearena_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: codearena
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: codearena_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: codearena_api
    restart: always
    environment:
      PORT: 3000
      DATABASE_URL: "postgresql://postgres:secure_password@postgres:5432/codearena?schema=public"
      REDIS_URL: "redis://redis:6379"
      JWT_SECRET: "prod_jwt_secret_token"
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile
    container_name: codearena_worker
    restart: always
    environment:
      DATABASE_URL: "postgresql://postgres:secure_password@postgres:5432/codearena?schema=public"
      REDIS_URL: "redis://redis:6379"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: codearena_web
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
  redisdata:
```

---

## 3. Production Health Monitoring & Metrics
- **Liveness Endpoint**: `GET /health` returns `{ "status": "ok", "time": "<ISO timestamp>" }`.
- **Database Connection Pool**: Prisma pool size tuned between 10–50 connections per API instance.
- **Redis Queue Depth Monitoring**: Metrics tracking `LLEN problems` to trigger auto-scaling on judge worker replicas.
