# CodeArena — Authentication & Security Architecture

## Authentication Strategies
- **JWT (JSON Web Tokens)**: Signed using SHA-256 HMAC (`JWT_SECRET`). Tokens expire in 7 days.
- **Header**: `Authorization: Bearer <token>`
- **Password Hashing**: Bcrypt / Argon2-compatible secure hashing via `Bun.password.hash()`.
- **Role-Based Access Control (RBAC)**:
  - `STUDENT`: Read problems, submit solutions, take courses, join public contests.
  - `DEVELOPER`: Standard DSA practice, community authoring, portfolio management.
  - `CANDIDATE`: Access to assigned interview rooms and assessments.
  - `INTERVIEWER`: Room creation, live code assessment, candidate scoring.
  - `INSTRUCTOR`: Course authoring, problem creation, assignment grading.
  - `COMPANY`: Bulk assessment creation, candidate hiring dashboards.
  - `ADMIN`: Global user management, content moderation, system diagnostics.

## Protected Routes & Middleware Flow
```
Incoming Request ──► extractToken() ──► jwt.verify() ──► req.userId / req.role ──► Handler
                            │
                      (missing/invalid)
                            ▼
                    401 Unauthorized
```
