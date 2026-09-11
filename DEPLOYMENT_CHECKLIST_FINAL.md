# CodeArena Production Deployment Checklist (Final Release Pass)

## 1. Secrets & Environment Configuration

- [x] **`JWT_SECRET`**: Set to high-entropy 256-bit secret string (minimum 32 characters).
- [x] **`DATABASE_URL`**: Hardened PostgreSQL connection string with TLS/SSL enabled.
- [x] **`REDIS_URL`**: Authenticated Redis connection URI.
- [x] **OAuth 2.0**:
  - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` configured exclusively in backend environment.
  - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` configured exclusively in backend environment.
  - `ALLOW_DEV_SOCIAL_AUTH="false"`.
- [x] **Sandbox Execution**:
  - `SANDBOX_MODE="docker"`.
  - `ALLOW_PROCESS_SANDBOX="false"`.
  - `STRICT_SANDBOX="true"`.
- [x] **SAML 2.0**:
  - `SAML_IDP_CERT_PEM` loaded with IdP X.509 certificate.

---

## 2. Container Host Infrastructure

- [x] Docker engine daemon running and healthy on judge worker nodes.
- [x] Pre-pulled base runner images:
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
- [x] Strict execution boundaries verified: `--network none`, `--read-only`, `--cap-drop=ALL`, `--user 1000:1000`.

---

## 3. Database Deployment & Client Generation

- [x] `bunx prisma generate` builds client with `isEmailVerified`, `emailVerifiedAt`, `tokenVersion`, `twoFactorEnabled`, `twoFactorSecret`.
- [x] `bunx prisma migrate deploy` executed on target database.
