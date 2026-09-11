# CodeArena Production Deployment & Security Checklist

## 1. Environment Secrets & Configuration

- [x] **JWT Secrets**:
  - `JWT_SECRET` must be set to a high-entropy secret (minimum 32 characters).
  - Verify `JWT_SECRET` is NOT committed in any repository `.env` or configuration file.
- [x] **Database & Caching**:
  - `DATABASE_URL` pointing to hardened PostgreSQL cluster with SSL enabled (`sslmode=require`).
  - `REDIS_URL` pointing to authenticated Redis instance.
- [x] **OAuth 2.0 Credentials**:
  - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` configured in backend environment only.
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` configured in backend environment only.
  - `ALLOW_DEV_SOCIAL_AUTH` strictly set to `"false"` in production.
- [x] **Sandbox Configuration**:
  - `SANDBOX_MODE` set to `"docker"`.
  - `ALLOW_PROCESS_SANDBOX` set to `"false"`.
  - `STRICT_SANDBOX` set to `"true"`.
- [x] **SAML 2.0 Enterprise SSO**:
  - `SAML_IDP_CERT_PEM` configured with IdP X.509 certificate.
  - `SAML_ISSUER` and `SAML_AUDIENCE` explicitly set to production domain.

---

## 2. Infrastructure & Container Isolation

- [x] **Docker Engine Daemon**:
  - Docker daemon active on judge worker hosts.
  - Pre-pull language execution container images:
    - `node:20-alpine` (JavaScript / TypeScript)
    - `python:3.12-alpine` (Python)
    - `gcc:14` (C++)
    - `eclipse-temurin:21-jdk-alpine` (Java)
    - `golang:1.22-alpine` (Go)
    - `rust:1.77-alpine` (Rust)
    - `mcr.microsoft.com/dotnet/sdk:8.0-alpine` (C#)
    - `zenika/kotlin:1.9-alpine` (Kotlin)
    - `php:8.3-cli-alpine` (PHP)
    - `ruby:3.3-alpine` (Ruby)
    - `swift:5.9-slim` (Swift)
- [x] **Container Runtime Flags**:
  - All judge containers run with:
    - `--network none`
    - `--read-only`
    - `--cap-drop=ALL`
    - `--security-opt=no-new-privileges:true`
    - `--user 1000:1000`
    - `--pids-limit 64`
    - `--memory 256m` / `--memory-swap 256m`
- [x] **Zero Host Secrets Exposure**:
  - Verify judge container volume mounts are strictly isolated to per-execution temporary directories.
  - No mounting of `/`, `/home`, Docker socket `/var/run/docker.sock`, or application source trees.

---

## 3. Database Migrations & Prisma Validation

- [x] **Prisma Client**:
  - Run `bunx prisma generate` during build pipeline.
  - Run `bunx prisma migrate deploy` against target PostgreSQL instance.
- [x] **Schema Integrity**:
  - Verify fields `isEmailVerified`, `emailVerifiedAt`, `tokenVersion`, `twoFactorEnabled`, `twoFactorSecret` exist on `User` table.

---

## 4. Continuous Integration & Release Gates

- [x] **CI Security Checks**:
  - `bun pm untrusted` passes on backend and worker.
  - `npm audit --audit-level=critical` passes without suppression (`|| true` eliminated).
  - All backend (211 tests) and worker (19 tests) execute and pass in CI pipeline.
  - Frontend typecheck and production bundle build succeed.
