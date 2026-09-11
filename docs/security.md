# CodeArena — Security & Sandboxing Architecture

## 1. Overview
Security is designed with defense-in-depth principles across client interactions, API endpoints, data persistence, and untrusted user code execution in the online judge.

```
                    ┌────────────────────────┐
                    │      Client Layer      │
                    │  (XSS / CSRF Guards)   │
                    └───────────┬────────────┘
                                │ HTTPS / Secure Headers
                                ▼
                    ┌────────────────────────┐
                    │     API / Gateway      │
                    │  (Rate Limit + JWT)    │
                    └───────────┬────────────┘
                                │
                    ┌───────────┴────────────┐
                    ▼                        ▼
         ┌─────────────────────┐  ┌─────────────────────┐
         │ Database (Prisma)   │  │   Sandbox Judge     │
         │ Parameterized SQL   │  │ Process Jails & TLE │
         └─────────────────────┘  └─────────────────────┘
```

---

## 2. OWASP Top 10 Protections

### A. Injection & SQL Safety
- All database queries are executed strictly through **Prisma ORM** parameterized queries, preventing SQL injection.
- Dynamic sorting and column lookups are validated against strict string literals.

### B. Broken Authentication & Session Security
- **Passwords**: Hashed with modern salt algorithms (`Bun.password.hash` / Bcrypt / Argon2).
- **JWT Protection**: Signed with cryptographic secrets (`HS256` / `RS256`), enforced expiration (7-day lifecycle), and token invalidation on password reset.
- **Brute-Force Defense**: In-memory and Redis-backed rate limiting per IP on `/api/v1/auth/login` (5 failed attempts per 15 minutes trigger temporary lockout).

### C. Cross-Site Scripting (XSS) & Content Injection
- All user-supplied Markdown (problem descriptions, articles, forum posts, comments) is sanitized with `DOMPurify` / HTML entity escaping before rendering.
- Markdown code blocks are strictly parsed without raw `script` or `iframe` injection capabilities.

### D. Cross-Site Request Forgery (CSRF) & Secure Headers
- Secure HTTP headers configured via `Helmet` or API middleware:
  - `Content-Security-Policy`: Disallows unauthorized external script injection.
  - `Strict-Transport-Security`: Enforces TLS encryption.
  - `X-Frame-Options: DENY`: Prevents Clickjacking attacks.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing vulnerabilities.

---

## 3. Sandboxed Code Execution & Isolation

```
User Code Submission
       │
       ▼
Worker Container / Process
       │
       ├─► 1. Ephemeral scratch directory creation (`/tmp/run_<uuid>`)
       ├─► 2. Driver injection with strict stdout/stderr piping
       ├─► 3. Environment sanitization (`PATH` restricted, no app env vars)
       ├─► 4. Hard Watchdog Timer (5000 ms SIGKILL)
       ├─► 5. Memory constraint capping (128MB - 256MB)
       └─► 6. Immediate directory scrubbing & post-execution audit
```

### Safety Controls:
1. **No Application State Exposure**: The worker execution process has zero access to PostgreSQL credentials, Redis authentication tokens, or app source code.
2. **5-Second Hard Watchdog**: A separate timer thread kills runaway infinite loops using `SIGKILL` (`kill -9`).
3. **Restricted File System Access**: Subprocess permissions prevent writing outside the designated ephemeral run directory.
4. **Input Size Limits**: Submissions capped at 64 KB code size and 2 MB memory payload.
