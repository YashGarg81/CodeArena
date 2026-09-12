# RBAC Runtime Matrix Report (Automated HTTP Execution)

**Generated**: 2026-09-12T09:54:54.293Z
**Total Combinations Evaluated**: 1520 (8 roles x 190 routes)
**Passed**: 1520
**Failed**: 0
**Skipped**: 0
**Blocked**: 0

## Summary by Role

| Role | Combinations | Passed | Failed |
| :--- | :--- | :--- | :--- |
| `STUDENT` | 190 | 190 | 0 |
| `DEVELOPER` | 190 | 190 | 0 |
| `INTERVIEWER` | 190 | 190 | 0 |
| `INSTRUCTOR` | 190 | 190 | 0 |
| `MODERATOR` | 190 | 190 | 0 |
| `CONTEST_ADMIN` | 190 | 190 | 0 |
| `PROBLEM_ADMIN` | 190 | 190 | 0 |
| `ADMIN` | 190 | 190 | 0 |

## Runtime Combinations Breakdown

| METHOD | ROUTE | ROLE | AUTH MIDDLEWARE | EXPECTED | ACTUAL STATUS | RESULT | DETAILS |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/health` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/health` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/health` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/health` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/health` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/health` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/health` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/debugger/trace` | `STUDENT` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `DEVELOPER` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `MODERATOR` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `ADMIN` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/matchmake` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/matchmake` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/matchmake` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/matchmake` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/matchmake` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/matchmake` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/matchmake` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/matchmake` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/arena/rooms/join` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/rooms/join` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/rooms/join` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/rooms/join` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/rooms/join` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/rooms/join` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/rooms/join` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/rooms/join` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/history` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/history` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/history` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/history` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/history` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/history` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/history` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/history` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/arena/matches/:matchId` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/matches/:matchId` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/matches/:matchId` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/matches/:matchId` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/matches/:matchId` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/matches/:matchId` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/matches/:matchId` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/arena/matches/:matchId` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/admin/security/telemetry` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/telemetry` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/telemetry` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/telemetry` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/telemetry` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/telemetry` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/telemetry` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/telemetry` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/security/audit-logs` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/audit-logs` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/audit-logs` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/audit-logs` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/audit-logs` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/audit-logs` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/audit-logs` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/security/audit-logs` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/storage/files/*key` | `STUDENT` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/storage/files/*key` | `DEVELOPER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/storage/files/*key` | `INTERVIEWER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/storage/files/*key` | `INSTRUCTOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/storage/files/*key` | `MODERATOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/storage/files/*key` | `CONTEST_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/storage/files/*key` | `PROBLEM_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/storage/files/*key` | `ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/storage/upload` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/storage/upload` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/storage/upload` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/storage/upload` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/storage/upload` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/storage/upload` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/storage/upload` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/storage/upload` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/feed` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/follow/:userId` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/discussions` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/social/discussions` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/social/discussions` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/social/discussions` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/social/discussions` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/social/discussions` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/social/discussions` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/social/discussions` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/social/discussions` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/social/tournaments/brackets` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/tournaments/brackets` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/tournaments/brackets` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/tournaments/brackets` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/tournaments/brackets` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/tournaments/brackets` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/tournaments/brackets` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/tournaments/brackets` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/social/teams` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/recommendations` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/submissions/benchmark` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/mentors` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/plugins` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/plugins/:id/toggle` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/plugins/:id/toggle` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/plugins/:id/toggle` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/plugins/:id/toggle` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/plugins/:id/toggle` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/plugins/:id/toggle` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/plugins/:id/toggle` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/plugins/:id/toggle` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `STUDENT` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `DEVELOPER` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `MODERATOR` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/debugger/trace` | `ADMIN` | `optionalAuth` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/signup` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/login` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/oauth/state` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/oauth/state` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/oauth/state` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/oauth/state` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/oauth/state` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/oauth/state` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/oauth/state` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/oauth/state` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/social` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/social` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/social` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/social` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/social` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/social` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/social` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/social` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/me` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/me` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/me` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/me` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/me` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/me` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/me` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/me` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/auth/profile` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/forgot-password` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/forgot-password` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/forgot-password` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/forgot-password` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/forgot-password` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/forgot-password` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/forgot-password` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/forgot-password` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verify-reset-token` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/reset-password` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/resend-verification` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/verify-email` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/auth/verification-status` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/verification-status` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/verification-status` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/verification-status` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/verification-status` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/verification-status` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/verification-status` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/verification-status` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/setup` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/verify` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/verify` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/verify` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/verify` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/verify` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/verify` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/verify` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/verify` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/challenge` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/2fa/disable` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/disable` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/disable` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/disable` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/disable` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/disable` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/disable` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/2fa/disable` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/auth/sessions` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/auth/logout-all` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/signup` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/signup` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/signup` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/signup` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/signup` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/signup` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/signup` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/signup` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/login` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/auth/logout` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/logout` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/logout` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/logout` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/logout` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/logout` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/logout` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/auth/logout` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/auth/me` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/meta/filters` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/public/stats` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/problems/:problemId/like` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/problems/:problemId/submissions` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/problems/:id` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/dashboard` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/problems` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/problems` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/admin/problems/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `DELETE` | `/api/v1/admin/problems/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/problems/:id/publish` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/publish` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/publish` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/publish` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/publish` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/publish` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/publish` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/publish` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/problems/bulk-import` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/bulk-import` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/bulk-import` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/bulk-import` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/bulk-import` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/bulk-import` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/bulk-import` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/problems/bulk-import` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/admin/problems/export` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/export` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/export` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/export` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/export` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/export` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/export` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/export` | `ADMIN` | `adminAuth` | Allowed (non-403) | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/admin/problems/:id/validate` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/validate` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/validate` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/validate` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/validate` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/validate` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/validate` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/validate` | `ADMIN` | `adminAuth` | Allowed (non-403) | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/admin/dashboard` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/dashboard` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/developer/dashboard` | `STUDENT` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/dashboard` | `DEVELOPER` | `developerAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/developer/dashboard` | `INTERVIEWER` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/dashboard` | `INSTRUCTOR` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/dashboard` | `MODERATOR` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/dashboard` | `CONTEST_ADMIN` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/dashboard` | `PROBLEM_ADMIN` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/dashboard` | `ADMIN` | `developerAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/developer/telemetry` | `STUDENT` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/telemetry` | `DEVELOPER` | `developerAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/developer/telemetry` | `INTERVIEWER` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/telemetry` | `INSTRUCTOR` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/telemetry` | `MODERATOR` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/telemetry` | `CONTEST_ADMIN` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/telemetry` | `PROBLEM_ADMIN` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/telemetry` | `ADMIN` | `developerAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/developer/sandbox-health` | `STUDENT` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/sandbox-health` | `DEVELOPER` | `developerAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/developer/sandbox-health` | `INTERVIEWER` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/sandbox-health` | `INSTRUCTOR` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/sandbox-health` | `MODERATOR` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/sandbox-health` | `CONTEST_ADMIN` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/sandbox-health` | `PROBLEM_ADMIN` | `developerAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/developer/sandbox-health` | `ADMIN` | `developerAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/users` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/users` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/users` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/users` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/users` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/users` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/users` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/users` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/admin/users/:userId/role` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId/role` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId/role` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId/role` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId/role` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId/role` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId/role` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId/role` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/admin/users/:userId` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/users/:userId` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/admin/courses` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/courses` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/courses` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/courses` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/courses` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/courses` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/courses` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/courses` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/courses` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/courses` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/courses` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/courses` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/courses` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/courses` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/courses` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/courses` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/admin/courses/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/courses/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/courses/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/courses/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/courses/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/courses/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/courses/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/courses/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/admin/courses/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/courses/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/courses/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/courses/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/courses/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/courses/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/courses/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/courses/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/admin/contests` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/admin/contests/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/admin/contests/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/submissions/run` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions/run` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions/run` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions/run` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions/run` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions/run` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions/run` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions/run` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/submissions` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/submissions/:id` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `STUDENT` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `DEVELOPER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `INTERVIEWER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `INSTRUCTOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `MODERATOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `CONTEST_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `PROBLEM_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/submissions/:id/share` | `ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:userId/submissions` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/submissions` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/submissions` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/submissions` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/submissions` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/submissions` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/submissions` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/submissions` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/submission` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/submission` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/submission` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/submission` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/submission` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/submission` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/submission` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/submission` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/submission/:id` | `STUDENT` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/submission/:id` | `DEVELOPER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/submission/:id` | `INTERVIEWER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/submission/:id` | `INSTRUCTOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/submission/:id` | `MODERATOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/submission/:id` | `CONTEST_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/submission/:id` | `PROBLEM_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/submission/:id` | `ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:userId/stats` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/stats` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/stats` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/stats` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/stats` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/stats` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/stats` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:userId/stats` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/users/:userId/stats` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/:username/profile` | `STUDENT` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:username/profile` | `DEVELOPER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:username/profile` | `INTERVIEWER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:username/profile` | `INSTRUCTOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:username/profile` | `MODERATOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:username/profile` | `CONTEST_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:username/profile` | `PROBLEM_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/:username/profile` | `ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/leaderboard` | `STUDENT` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/leaderboard` | `DEVELOPER` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/leaderboard` | `INTERVIEWER` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/leaderboard` | `INSTRUCTOR` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/leaderboard` | `MODERATOR` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/leaderboard` | `CONTEST_ADMIN` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/leaderboard` | `PROBLEM_ADMIN` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/leaderboard` | `ADMIN` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `STUDENT` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `DEVELOPER` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `INTERVIEWER` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `INSTRUCTOR` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `MODERATOR` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `CONTEST_ADMIN` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `PROBLEM_ADMIN` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/leaderboard` | `ADMIN` | `none` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/forum/posts` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/forum/posts` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/forum/posts` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/forum/posts` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/forum/posts` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/forum/posts` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/forum/posts` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/forum/posts` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/forum/posts` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/forum/posts/:postId` | `STUDENT` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/forum/posts/:postId` | `DEVELOPER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/forum/posts/:postId` | `INTERVIEWER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/forum/posts/:postId` | `INSTRUCTOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/forum/posts/:postId` | `MODERATOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/forum/posts/:postId` | `CONTEST_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/forum/posts/:postId` | `PROBLEM_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/forum/posts/:postId` | `ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/forum/posts` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/forum/posts` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/forum/posts` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/forum/posts` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/forum/posts` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/forum/posts` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/forum/posts` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/forum/posts` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/forum/posts` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/forum/posts/:id` | `STUDENT` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/forum/posts/:id` | `DEVELOPER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/forum/posts/:id` | `INTERVIEWER` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/forum/posts/:id` | `INSTRUCTOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/forum/posts/:id` | `MODERATOR` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/forum/posts/:id` | `CONTEST_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/forum/posts/:id` | `PROBLEM_ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/forum/posts/:id` | `ADMIN` | `none` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/forum/posts/:id/comments` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts/:id/comments` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts/:id/comments` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts/:id/comments` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts/:id/comments` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts/:id/comments` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts/:id/comments` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/forum/posts/:id/comments` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/snippets` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/snippets` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/snippets` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/snippets` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/snippets` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/snippets` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/snippets` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/snippets` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/snippets` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/snippets` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/snippets` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/snippets` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/snippets` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/snippets` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/snippets` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/snippets` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `DELETE` | `/api/v1/snippets/:id` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/snippets/:id` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/snippets/:id` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/snippets/:id` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/snippets/:id` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/snippets/:id` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/snippets/:id` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/snippets/:id` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/search` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/search` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/search` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/search` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/search` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/search` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/search` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/search` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/templates` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/system-design/guide` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/contests/:id/register` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/:id/register` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/:id/register` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/:id/register` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/:id/register` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/:id/register` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/:id/register` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/contests/:id/register` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/leaderboard` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/contests/:id/announcements` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/announcements` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/announcements` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/announcements` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/announcements` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/announcements` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/announcements` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/announcements` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/contests/:id/announcements` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/announcements` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/announcements` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/announcements` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/announcements` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/announcements` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/announcements` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/announcements` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/contests/:id/clarifications` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/clarifications` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/clarifications` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/clarifications` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/clarifications` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/clarifications` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/clarifications` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests/:id/clarifications` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/contests/:id/clarifications` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/clarifications` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/clarifications` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/clarifications` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/clarifications` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/clarifications` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/clarifications` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/clarifications` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/contests/:id/end` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/end` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/end` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/end` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/end` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/end` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/end` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/contests/:id/end` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/achievements` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/achievements` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/achievements` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/achievements` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/achievements` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/achievements` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/achievements` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/achievements` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/courses` | `STUDENT` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses` | `DEVELOPER` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses` | `MODERATOR` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses` | `ADMIN` | `optionalAuth` | Public / Optional | `500` | ✅ PASS | Authorized access reached application layer (HTTP 500) |
| `GET` | `/api/v1/courses/:slugOrId` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/courses/:slugOrId` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/courses/:slugOrId` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/courses/:slugOrId` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/courses/:slugOrId` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/courses/:slugOrId` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/courses/:slugOrId` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/courses/:slugOrId` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/courses/:id/enroll` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/complete` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/execute` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/execute` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/execute` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/execute` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/execute` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/execute` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/execute` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/execute` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/lessons/:id/quiz` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id/quiz` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id/quiz` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id/quiz` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id/quiz` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id/quiz` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id/quiz` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/lessons/:id/quiz` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/notes` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notes` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notes` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notes` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notes` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notes` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notes` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notes` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notes` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/notes` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/notes` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/notes` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/notes` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/notes` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/notes` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/notes` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/notes/:id` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/notes/:id` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/notes/:id` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/notes/:id` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/notes/:id` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/notes/:id` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/notes/:id` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/notes/:id` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/notes/:id` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/learning` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/learning` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/learning` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/learning` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/learning` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/learning` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/learning` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/learning` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/notifications` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/:id/read` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/notifications/read-all` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/profile` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/profile` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/profile` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/profile` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/profile` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/profile` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/profile` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/users/me/profile` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `PUT` | `/api/v1/users/me/profile` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/profile` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/profile` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/profile` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/profile` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/profile` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/profile` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/profile` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/users/me/settings` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `PUT` | `/api/v1/users/me/settings` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/users/me/password` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/users/me/password` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/users/me/password` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/users/me/password` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/users/me/password` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/users/me/password` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/users/me/password` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/users/me/password` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/admin/analytics/overview` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/overview` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/overview` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/overview` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/overview` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/overview` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/overview` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/overview` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/analytics/problems` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/problems` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/problems` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/problems` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/problems` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/problems` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/problems` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/problems` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/analytics/users` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/users` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/users` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/users` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/users` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/users` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/users` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/analytics/users` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/moderation/reports` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/moderation/reports` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/moderation/reports` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/moderation/reports` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/moderation/reports` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/moderation/reports` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/moderation/reports` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/moderation/reports` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/users/:userId/ban` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/ban` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/ban` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/ban` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/ban` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/ban` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/ban` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/ban` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/admin/users/:userId/unban` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unban` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unban` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unban` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unban` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unban` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unban` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/unban` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/admin/users/:userId/delete` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/delete` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/delete` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/delete` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/delete` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/delete` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/delete` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/:userId/delete` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/system/health` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/system/health` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/system/health` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/system/health` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/system/health` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/system/health` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/system/health` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/system/health` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/audit-logs` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/audit-logs` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/audit-logs` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/audit-logs` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/audit-logs` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/audit-logs` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/audit-logs` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/audit-logs` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/contests` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/admin/contests/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/admin/contests/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/plagiarism/results` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/plagiarism/results` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/plagiarism/results` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/plagiarism/results` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/plagiarism/results` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/plagiarism/results` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/plagiarism/results` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/plagiarism/results` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/export/users` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/users` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/users` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/users` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/users` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/users` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/users` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/users` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/admin/export/submissions` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/submissions` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/submissions` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/submissions` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/submissions` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/submissions` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/submissions` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `GET` | `/api/v1/admin/export/submissions` | `ADMIN` | `adminAuth` | Allowed (non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/gamification/daily` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/daily` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/daily` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/daily` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/daily` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/daily` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/daily` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/daily` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/gamification/profile` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/submissions/stream/:id` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/contests` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/admin/contests` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `POST` | `/api/v1/admin/contests` | `ADMIN` | `adminAuth` | Allowed (non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `PUT` | `/api/v1/admin/contests/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `PUT` | `/api/v1/admin/contests/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `DELETE` | `/api/v1/admin/contests/:id` | `STUDENT` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `DEVELOPER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `INTERVIEWER` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `INSTRUCTOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `MODERATOR` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `CONTEST_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `PROBLEM_ADMIN` | `adminAuth` | 403 Forbidden | `403` | ✅ PASS | Properly denied with 403 Forbidden |
| `DELETE` | `/api/v1/admin/contests/:id` | `ADMIN` | `adminAuth` | Allowed (non-403) | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/auth/saml/callback` | `STUDENT` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/saml/callback` | `DEVELOPER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/saml/callback` | `INTERVIEWER` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/saml/callback` | `INSTRUCTOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/saml/callback` | `MODERATOR` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/saml/callback` | `CONTEST_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/saml/callback` | `PROBLEM_ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/auth/saml/callback` | `ADMIN` | `none` | Public / Optional | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `STUDENT` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `DEVELOPER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `INTERVIEWER` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `INSTRUCTOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `MODERATOR` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `CONTEST_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `PROBLEM_ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `POST` | `/api/v1/integrations/github/sync` | `ADMIN` | `auth` | Allowed (non-401/non-403) | `400` | ✅ PASS | Authorized access reached application layer (HTTP 400) |
| `GET` | `/api/v1/interviews` | `STUDENT` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/interviews` | `DEVELOPER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/interviews` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/interviews` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/interviews` | `MODERATOR` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/interviews` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/interviews` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/api/v1/interviews` | `ADMIN` | `optionalAuth` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `POST` | `/api/v1/interviews` | `STUDENT` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `POST` | `/api/v1/interviews` | `DEVELOPER` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `POST` | `/api/v1/interviews` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `POST` | `/api/v1/interviews` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `POST` | `/api/v1/interviews` | `MODERATOR` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `POST` | `/api/v1/interviews` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `POST` | `/api/v1/interviews` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `POST` | `/api/v1/interviews` | `ADMIN` | `optionalAuth` | Public / Optional | `201` | ✅ PASS | Authorized access reached application layer (HTTP 201) |
| `GET` | `/api/v1/interviews/:id` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/interviews/:id` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/interviews/:id` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/interviews/:id` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/interviews/:id` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/interviews/:id` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/interviews/:id` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/api/v1/interviews/:id` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/sync` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/timer` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/hints` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `STUDENT` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `DEVELOPER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `INTERVIEWER` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `INSTRUCTOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `MODERATOR` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `CONTEST_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `PROBLEM_ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `POST` | `/api/v1/interviews/:id/evaluate` | `ADMIN` | `optionalAuth` | Public / Optional | `404` | ✅ PASS | Authorized access reached application layer (HTTP 404) |
| `GET` | `/health` | `STUDENT` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/health` | `DEVELOPER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/health` | `INTERVIEWER` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/health` | `INSTRUCTOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/health` | `MODERATOR` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/health` | `CONTEST_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/health` | `PROBLEM_ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
| `GET` | `/health` | `ADMIN` | `none` | Public / Optional | `200` | ✅ PASS | Authorized access reached application layer (HTTP 200) |
