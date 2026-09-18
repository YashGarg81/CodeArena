FROM oven/bun:1.2-alpine AS build
WORKDIR /app
COPY package.json bun.lock* ./
# Fail closed: never silently fall back to floating versions.
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build.ts --outdir=dist --minify

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
