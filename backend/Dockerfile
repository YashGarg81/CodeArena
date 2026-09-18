FROM oven/bun:1.2-alpine
WORKDIR /app

COPY backend/package.json backend/bun.lock* ./backend/
COPY worker/package.json worker/bun.lock* ./worker/
WORKDIR /app/backend
# Fail closed: never silently fall back to floating versions.
RUN bun install --frozen-lockfile

WORKDIR /app
COPY backend ./backend
COPY worker ./worker

WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "index.ts"]
