FROM oven/bun:1.2-alpine
WORKDIR /app

# Install Docker CLI for sandbox execution
RUN apk add --no-cache docker-cli

COPY worker/package.json worker/bun.lock* ./worker/
COPY backend/package.json backend/bun.lock* ./backend/
WORKDIR /app/worker
# Fail closed: never silently fall back to floating versions.
RUN bun install --frozen-lockfile

WORKDIR /app
COPY worker ./worker
COPY backend/src/security.ts ./backend/src/security.ts
COPY backend/src/judgePrivacy.ts ./backend/src/judgePrivacy.ts
COPY backend/drivers.ts ./backend/drivers.ts

WORKDIR /app/worker
# Generate Prisma client for the container architecture
RUN bunx prisma generate
ENV NODE_ENV=production
CMD ["bun", "run", "index.ts"]
