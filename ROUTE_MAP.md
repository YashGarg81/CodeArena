# CodeArena Route & Data Map (Section 1 Inventory)

**Generated**: 2026-09-12T07:37:34.492Z
**Total Express Routes Discovered**: 190
**Total Frontend API Client Calls**: 131

## 1. Express Route Table

| METHOD | PATH | Auth Middleware | Request Body Shape | Response Shape | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | `none` | `-` | `{ status: "ok", time: new Date().toISOString() }` | `backend\index.ts` |
| `POST` | `/api/v1/debugger/trace` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/arena/matchmake` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/arena/rooms` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/arena/rooms/join` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/arena/matches/:matchId/rematch` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/arena/history` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/arena/matches/:matchId` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/arena/matches/:matchId/progress` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/security/telemetry` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/security/audit-logs` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/storage/files/*key` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/storage/upload` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/social/feed` | `optionalAuth` | `-` | `{ success: true, feed: socialAndTournamentEngin...` | `backend\index.ts` |
| `POST` | `/api/v1/social/follow/:userId` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/social/discussions` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/social/discussions` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/social/tournaments/brackets` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/social/teams` | `optionalAuth` | `-` | `{ success: true, teams: socialAndTournamentEngi...` | `backend\index.ts` |
| `GET` | `/api/v1/recommendations` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/submissions/benchmark` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/mentors` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/auth/sessions` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/plugins` | `optionalAuth` | `-` | `{ success: true, plugins: pluginManager.listPlu...` | `backend\index.ts` |
| `POST` | `/api/v1/plugins/:id/toggle` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/debugger/trace` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/signup` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/login` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/auth/oauth/state` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/social` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/auth/me` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/auth/profile` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/logout` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/forgot-password` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/auth/verify-reset-token` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/reset-password` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/resend-verification` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/verify-email` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/auth/verification-status` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/setup` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/verify` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/challenge` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/disable` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/auth/sessions` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/logout-all` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/auth/signup` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/auth/login` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/auth/logout` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/auth/me` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/problems/meta/filters` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/public/stats` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/problems` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/problems/:problemId` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/problems/:problemId/like` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/problems/:problemId/submissions` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/problems` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/problems/:id` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/dashboard` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/problems` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/problems` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/problems/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/admin/problems/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/problems/:id/publish` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/problems/:id/unpublish` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/problems/:id/revisions` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/problems/:id/revisions/:version` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/problems/:id/restore/:version` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/problems/:id/test-cases` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/problems/:id/test-cases` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/problems/bulk-import` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/problems/export` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/problems/:id/validate` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/dashboard` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/developer/dashboard` | `developerAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/developer/telemetry` | `developerAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/developer/sandbox-health` | `developerAuth` | `-` | `{ engine: "CodeArena-Sandbox", mode: process.en...` | `backend\index.ts` |
| `GET` | `/api/v1/admin/users` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/users/:userId/suspend` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/users/:userId/unsuspend` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/users/:userId/role` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/users/:userId` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/courses` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/courses` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/courses/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/admin/courses/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/contests` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/contests/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/admin/contests/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/submissions/run` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/submissions` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/:id` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/:id/share` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/:userId/submissions` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/submission` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/submission/:id` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/:userId/stats` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/users/:userId/stats` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/:username/profile` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/leaderboard` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/leaderboard` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/forum/posts` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/forum/posts` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/forum/posts/:postId` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/forum/posts/:postId/comments` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/forum/posts` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/forum/posts` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/forum/posts/:id` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/forum/posts/:id/comments` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/snippets` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/snippets` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/snippets/:id` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/search` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/system-design/templates` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/system-design/guide` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/contests` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/contests/:id/register` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/contests/:id` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/contests/:id/leaderboard` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/contests/:id/announcements` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/contests/:id/announcements` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/contests/:id/clarifications` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/contests/:id/clarifications` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/contests/:id/end` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/achievements` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/courses` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/courses/:slugOrId` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/courses/:id/enroll` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/lessons/:id` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/lessons/:id/complete` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/lessons/:id/execute` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/lessons/:id/quiz` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/lessons/:id/quiz/submit` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/notes` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/notes` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/notes/:id` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/notes/:id` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/me/learning` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/notifications` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/notifications/:id/read` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/notifications/read-all` | `auth` | `-` | `{ message: "All notifications marked as read" }` | `backend\index.ts` |
| `GET` | `/api/v1/users/me/profile` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/users/me/profile` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/me/settings` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/users/me/settings` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/users/me/password` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/analytics/overview` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/analytics/problems` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/analytics/users` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/moderation/reports` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/moderation/reports/:id/resolve` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/users/:userId/ban` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/users/:userId/unban` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/users/:userId/delete` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/problems/:id/analytics` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/system/health` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/audit-logs` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/contests` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/contests/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/admin/contests/:id` | `adminAuth` | `-` | `{ message: "Contest deleted" }` | `backend\index.ts` |
| `GET` | `/api/v1/admin/contests/:id/leaderboard` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/plagiarism/results` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/users/bulk-role-update` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/users/bulk-suspend` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/export/users` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/admin/export/submissions` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/collab/rooms` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/collab/rooms/:roomId` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/collab/rooms/:roomId/messages` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/collab/rooms/:roomId/messages` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/gamification/daily` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/gamification/profile` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/stream/:id` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/contests` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/admin/contests` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/contests/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `DELETE` | `/api/v1/admin/contests/:id` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/auth/saml/callback` | `none` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/integrations/github/sync` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/interviews` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/interviews` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/interviews/:id` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/interviews/:id/sync` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/interviews/:id/timer` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/interviews/:id/hints` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/interviews/:id/evaluate` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/health` | `none` | `-` | `{ status: "ok", time: new Date().toISOString() }` | `backend\index.ts` |

## 2. Cross-Reference Analysis

### Backend Routes with NO Frontend Caller (83 routes)
*(These may represent admin-only endpoints, internal integrations, or dead code)*

| METHOD | PATH | Auth | Source File |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/arena/history` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/admin/security/telemetry` | `adminAuth` | `backend\index.ts` |
| `GET` | `/api/v1/admin/security/audit-logs` | `adminAuth` | `backend\index.ts` |
| `GET` | `/api/v1/storage/files/*key` | `none` | `backend\index.ts` |
| `POST` | `/api/v1/storage/upload` | `auth` | `backend\index.ts` |
| `GET` | `/api/v1/social/feed` | `optionalAuth` | `backend\index.ts` |
| `POST` | `/api/v1/social/follow/:userId` | `auth` | `backend\index.ts` |
| `GET` | `/api/v1/social/tournaments/brackets` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/social/teams` | `optionalAuth` | `backend\index.ts` |
| `GET` | `/api/v1/recommendations` | `auth` | `backend\index.ts` |
| `POST` | `/api/v1/submissions/benchmark` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/mentors` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/auth/sessions` | `auth` | `backend\index.ts` |
| `GET` | `/api/v1/plugins` | `optionalAuth` | `backend\index.ts` |
| `POST` | `/api/v1/plugins/:id/toggle` | `adminAuth` | `backend\index.ts` |
| `POST` | `/api/v1/auth/signup` | `none` | `backend\index.ts` |
| `POST` | `/api/v1/auth/login` | `none` | `backend\index.ts` |
| `PUT` | `/api/v1/auth/profile` | `auth` | `backend\index.ts` |
| `GET` | `/api/v1/auth/verify-reset-token` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/auth/verification-status` | `auth` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/setup` | `auth` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/verify` | `auth` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/challenge` | `none` | `backend\index.ts` |
| `POST` | `/api/v1/auth/2fa/disable` | `auth` | `backend\index.ts` |
| `GET` | `/api/v1/auth/sessions` | `auth` | `backend\index.ts` |
| `POST` | `/api/v1/auth/logout-all` | `auth` | `backend\index.ts` |
| `POST` | `/auth/signup` | `auth` | `backend\index.ts` |
| `POST` | `/auth/login` | `auth` | `backend\index.ts` |
| `POST` | `/auth/logout` | `auth` | `backend\index.ts` |
| `GET` | `/auth/me` | `auth` | `backend\index.ts` |
| `GET` | `/api/v1/problems/meta/filters` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/problems/:problemId/submissions` | `auth` | `backend\index.ts` |
| `GET` | `/problems` | `none` | `backend\index.ts` |
| `GET` | `/problems/:id` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/developer/dashboard` | `developerAuth` | `backend\index.ts` |
| `GET` | `/api/v1/developer/telemetry` | `developerAuth` | `backend\index.ts` |
| `GET` | `/api/v1/developer/sandbox-health` | `developerAuth` | `backend\index.ts` |
| `PUT` | `/api/v1/admin/users/:userId/role` | `adminAuth` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `auth` | `backend\index.ts` |
| `POST` | `/submission` | `none` | `backend\index.ts` |
| `GET` | `/submission/:id` | `none` | `backend\index.ts` |
| `GET` | `/users/:userId/stats` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/users/:username/profile` | `none` | `backend\index.ts` |
| `GET` | `/leaderboard` | `none` | `backend\index.ts` |
| `GET` | `/api/v1/forum/posts` | `none` | `backend\index.ts` |
| `GET` | `/forum/posts` | `none` | `backend\index.ts` |
| `POST` | `/forum/posts` | `none` | `backend\index.ts` |
| `GET` | `/forum/posts/:id` | `none` | `backend\index.ts` |
| `POST` | `/forum/posts/:id/comments` | `none` | `backend\index.ts` |

*... and 33 more administrative/internal routes*

### Frontend Calls with NO Direct Backend Route Match (21 calls)
*(Flagged for inspection of missing backend routes or path mismatches)*

| METHOD | Client Endpoint | Calling File |
| :--- | :--- | :--- |
| `GET` | `${API}/api/v1/system-design/reference-solution/${templateId}` | `frontend\src\components\system-design\ReferenceSolutionModal.tsx` |
| `POST` | `/api/v1/execute` | `frontend\src\features\collab\CollabStudioPage.tsx` |
| `GET` | `/api/v1/forum/posts${cat}` | `frontend\src\features\community\CommunityPage.tsx` |
| `POST` | `/api/v1/problems/${activeSession.problemId}/run` | `frontend\src\features\interviews\InterviewPage.tsx` |
| `POST` | `/api/v1/ai/explain` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `POST` | `/api/v1/ai/debug` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `POST` | `/api/v1/ai/optimize` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `POST` | `/api/v1/ai/generate-tests` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `POST` | `/api/v1/ai/chat` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `POST` | `/api/v1/ai/explain` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `POST` | `/api/v1/ai/hint` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `GET` | `/api/v1/problems/liked` | `frontend\src\features\problems\ProblemDetailPage.tsx` |
| `GET` | `/api/v1/problems/liked` | `frontend\src\features\problems\ProblemsPage.tsx` |
| `GET` | `${API}/api/v1/users/${username}` | `frontend\src\features\profile\PublicProfilePage.tsx` |
| `GET` | `/api/v1/roadmaps` | `frontend\src\features\roadmap\RoadmapPage.tsx` |
| `PUT` | `/api/v1/system-design/projects/${currentProjectId}` | `frontend\src\SystemDesignStudio.tsx` |
| `POST` | `/api/v1/system-design/projects` | `frontend\src\SystemDesignStudio.tsx` |
| `POST` | `/api/v1/system-design/projects/${currentProjectId}/rollback/${vNum}` | `frontend\src\SystemDesignStudio.tsx` |
| `GET` | `/api/v1/system-design/projects` | `frontend\src\SystemDesignStudio.tsx` |
| `GET` | `/api/v1/system-design/projects/${currentProjectId}` | `frontend\src\SystemDesignStudio.tsx` |
| `PUT` | `/api/v1/system-design/projects/${currentProjectId}` | `frontend\src\SystemDesignStudio.tsx` |

## 3. WebSocket Channels & Real-Time Event Handlers

| Event Name | Scope / Namespace | Channel Type | Authorization / Access Control |
| :--- | :--- | :--- | :--- |
| `JOIN_ROOM` | Real-time Collab | Workspace Collab | `collaborationEngine.isAuthorized(roomId, userId)` |
| `CODE_CHANGE` | Room Broadcast | Workspace Collab | Room membership check + broadcast to peers |
| `CURSOR_MOVE` | Room Broadcast | Workspace Collab | Room membership check |
| `LEAVE_ROOM` | Room Lifecycle | Workspace Collab | Cleanup user cursor and socket session |
| `canvas:join` | Whiteboard Canvas | System Design | Owner or authorized collaborator check |
| `canvas:update` | Whiteboard Canvas | System Design | Broadcast canvas delta if user is authorized |
| `arena:match` | Battle Arena | 1v1 Arena | Authenticated match participants only |

## 4. Prisma Schema Comparison & Data Models

- **Backend Models**: 26 models (User, Account, Problems, Submission, TestCase, Contest, ContestParticipant, Discussion, Note, Certificate, Organization, Team, OrganizationMember, Workspace, CollaborationRoom, WhiteboardObject, Project, ProjectFile, Roadmap, RoadmapNode, RoadmapProgress, AIConversation, AIMessage, AIUsage, SubscriptionPlan, UserSubscription).
- **Worker Models**: 4 core judge models (User, Problems, Submission, TestCase).
- **Schema Alignment Status**: Core judge models (`User`, `Problems`, `Submission`, `TestCase`) are structurally aligned. Worker schema is intentionally pruned to judge-critical data.

## 5. Background Jobs & Queue Workers

- **Queue Engine**: BullMQ backed by Redis.
- **Submission Queue**: `submissionQueue` processing code judge tasks in worker container.
- **Idempotency**: Submissions are tied to unique `submissionId` with transactional status transitions (`Processing` -> `Success`/`WrongAnswer`/`TLE`/`MLE`/`CompileError`/`RuntimeError`). Retried jobs check current submission state before re-scoring.
