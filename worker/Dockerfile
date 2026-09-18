FROM oven/bun:1.2-alpine
WORKDIR /app

COPY worker/package.json worker/bun.lock* ./worker/
COPY backend/package.json backend/bun.lock* ./backend/
WORKDIR /app/worker
# Fail closed: never silently fall back to floating versions.
RUN bun install --frozen-lockfile

WORKDIR /app
COPY worker ./worker
COPY backend/src/security.ts ./backend/src/security.ts
COPY backend/src/judgePrivacy.ts ./backend/src/judgePrivacy.ts

WORKDIR /app/worker
ENV NODE_ENV=production
CMD ["bun", "run", "index.ts"]
