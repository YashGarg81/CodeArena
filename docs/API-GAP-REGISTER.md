# CodeArena — API Gap Register

This document audits all frontend API calls and maps them directly to their backend routes, controllers, database models, authorization middleware, validation, and test suites.

---

## API End-to-End Mapping Table

| Frontend Call | HTTP Method | Endpoint | Backend Route | Controller / Service | Database Model | Auth / RBAC | Validation | Tests | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.get("/api/v1/auth/me")` | GET | `/api/v1/auth/me` | `backend/index.ts` | `auth` | `User` | `auth` | None (token) | `api.integration.test.ts` | COMPLETE |
| `api.post("/api/v1/auth/signup")` | POST | `/api/v1/auth/signup` | `backend/index.ts` | inline | `User` | Public | `validatePassword`, `validateEmail` | `certification.test.ts` | COMPLETE |
| `api.post("/api/v1/auth/login")` | POST | `/api/v1/auth/login` | `backend/index.ts` | inline | `User` | Public | Rate limited | `api.integration.test.ts` | COMPLETE |
| `api.post("/api/v1/auth/logout")` | POST | `/api/v1/auth/logout` | `backend/index.ts` | `revokeToken` | `User`, Redis | `auth` | Token check | `certification.test.ts` | COMPLETE |
| `api.get("/api/v1/problems")` | GET | `/api/v1/problems` | `backend/index.ts` | inline | `Problems` | `optionalAuth` | `clampPagination` | `api.integration.test.ts` | COMPLETE |
| `api.get("/api/v1/problems/:id")` | GET | `/api/v1/problems/:id` | `backend/index.ts` | inline | `Problems`, `TestCases` | `optionalAuth` | `publishedProblemWhere` | `api.integration.test.ts` | COMPLETE |
| `api.post("/api/v1/problems/:id/run")` | POST | `/api/v1/problems/:id/run` | `backend/index.ts` | `executeSingleTest` | `Problems`, `TestCases` | `auth` | `validateCodeSecurity` | `api.integration.test.ts` | COMPLETE |
| `api.post("/api/v1/problems/:id/submit")` | POST | `/api/v1/problems/:id/submit`| `backend/index.ts` | `backgroundQueue` | `Submissions` | `auth` | `validateCodeSecurity` | `api.integration.test.ts` | COMPLETE |
| `api.get("/api/v1/submissions/:id")` | GET | `/api/v1/submissions/:id` | `backend/index.ts` | `sanitizeJudgeOutput`| `Submissions` | `optionalAuth` | IDOR privacy guard | `api.integration.test.ts` | COMPLETE |
| `api.get("/api/v1/courses")` | GET | `/api/v1/courses` | `backend/index.ts` | inline | `Course`, `Enrollment`| `optionalAuth` | None | `certification.test.ts` | COMPLETE |
| `api.get("/api/v1/courses/:slugOrId")` | GET | `/api/v1/courses/:slugOrId`| `backend/index.ts` | inline | `Course`, `Lesson` | `optionalAuth` | Slug validation | `certification.test.ts` | COMPLETE |
| `api.get("/api/v1/lessons/:id")` | GET | `/api/v1/lessons/:id` | `backend/index.ts` | inline | `Lesson`, `Quiz` | `optionalAuth` | UUID check | Manual & Cert | COMPLETE |
| `api.post("/api/v1/lessons/:id/execute")`| POST | `/api/v1/lessons/:id/execute` | `backend/index.ts` | `executeSingleTest` | `Lesson` | `auth` | `validateCodeSecurity` | Monorepo verified | COMPLETE |
| `api.post("/api/v1/lessons/:id/complete")`| POST | `/api/v1/lessons/:id/complete`| `backend/index.ts` | inline | `LessonProgress`, `User`| `auth` | Auth guard | Manual & Cert | COMPLETE |
| `api.get("/api/v1/lessons/:id/quiz")` | GET | `/api/v1/lessons/:id/quiz` | `backend/index.ts` | inline | `Quiz`, `QuizQuestion`| `optionalAuth` | Redacts answers | `certification.test.ts` | COMPLETE |
| `api.post("/api/v1/lessons/:id/quiz/submit")`| POST | `/api/v1/lessons/:id/quiz/submit` | `backend/index.ts` | inline | `QuizAttempt`, `User` | `auth` | Score calculator | `certification.test.ts` | COMPLETE |
| `api.get("/api/v1/contests")` | GET | `/api/v1/contests` | `backend/index.ts` | inline | `Contest` | Public | Status filter | Monorepo verified | COMPLETE |
| `api.post("/api/v1/contests/:id/end")`| POST | `/api/v1/contests/:id/end` | `backend/index.ts` | `applyContestRatings` | `Contest`, `RatingHistory`| `adminAuth` | Admin / Scoped | Monorepo verified | COMPLETE |
| `api.get("/api/v1/leaderboard")` | GET | `/api/v1/leaderboard` | `backend/index.ts` | inline | `User` | Public | Sorted by rating | Monorepo verified | COMPLETE |
| `api.get("/api/v1/community/posts")` | GET | `/api/v1/community/posts` | `backend/index.ts` | inline | `Posts`, `Comments` | Public | `clampPagination` | Monorepo verified | COMPLETE |
| `api.post("/api/v1/community/posts")` | POST | `/api/v1/community/posts` | `backend/index.ts` | inline | `Posts` | `auth` | Rich text sanitizer | Monorepo verified | COMPLETE |
| `api.get("/api/v1/notes")` | GET | `/api/v1/notes` | `backend/index.ts` | inline | `Note` | `auth` | User ID filter | Monorepo verified | COMPLETE |
| `api.post("/api/v1/notes")` | POST | `/api/v1/notes` | `backend/index.ts` | inline | `Note` | `auth` | Sanitizer | Monorepo verified | COMPLETE |
| `api.get("/api/v1/admin/dashboard")` | GET | `/api/v1/admin/dashboard` | `backend/index.ts` | inline | Aggregate stats | `adminAuth` | Admin role check | `api.integration.test.ts` | COMPLETE |
| `api.post("/api/v1/admin/problems")` | POST | `/api/v1/admin/problems` | `backend/index.ts` | inline | `Problems`, `TestCases` | `adminAuth` | Admin validation | `api.integration.test.ts` | COMPLETE |
| `api.get("/api/v1/admin/audit")` | GET | `/api/v1/admin/audit` | `backend/index.ts` | `auditService` | `AuditLog` | `adminAuth` | Admin role check | `api.integration.test.ts` | COMPLETE |
| `api.post("/api/v1/admin/validate-url")` | POST | `/api/v1/admin/validate-url` | `backend/index.ts` | `validateUrlForSSRF` | N/A | `adminAuth` | `validateUrlForSSRF` | `security.test.ts` | COMPLETE |
