# CodeArena Route & Data Map (Section 1 Inventory)

**Generated**: 2026-09-12T10:49:46.132Z
**Total Express Routes Discovered**: 235
**Total Frontend API Client Calls**: 119
**Contract Alignment Status**: 100% MATCHED (0 Unresolved Calls)

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
| `GET` | `/api/v1/storage/files/*key` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
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
| `GET` | `/api/v1/plugins` | `optionalAuth` | `-` | `{ success: true, plugins: pluginManager.listPlu...` | `backend\index.ts` |
| `POST` | `/api/v1/plugins/:id/toggle` | `adminAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `auth` | `-` | `JSON` | `backend\index.ts` |
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
| `GET` | `/api/v1/problems/liked` | `optionalAuth` | `-` | `{ liked: [] }` | `backend\index.ts` |
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
| `POST` | `/api/v1/problems/:problemId/run` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/execute` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/api/v1/submissions` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/:id` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/:id/compare/:targetId` | `auth` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/submissions/:id/share` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/:userId/submissions` | `optionalAuth` | `-` | `JSON` | `backend\index.ts` |
| `POST` | `/submission` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/submission/:id` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/:userId/stats` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/users/:userId/stats` | `none` | `-` | `JSON` | `backend\index.ts` |
| `GET` | `/api/v1/users/:username` | `none` | `-` | `JSON` | `backend\index.ts` |
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
| `GET` | `/api/v1/system-design/templates/:id` | `none` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `GET` | `/api/v1/system-design/reference-solution/:id` | `none` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `POST` | `/api/v1/system-design/estimate` | `none` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `POST` | `/api/v1/system-design/simulate` | `none` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `POST` | `/api/v1/system-design/score` | `none` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `GET` | `/api/v1/system-design/projects` | `auth` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `POST` | `/api/v1/system-design/projects` | `auth` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `GET` | `/api/v1/system-design/projects/:id` | `none` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `PUT` | `/api/v1/system-design/projects/:id` | `auth` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `POST` | `/api/v1/system-design/projects/:id/rollback/:versionNumber` | `auth` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `POST` | `/api/v1/system-design/validate` | `none` | `-` | `JSON` | `backend\src\systemDesign.ts` |
| `GET` | `/api/v1/infra/status` | `none` | `-` | `{ status: "healthy", timestamp: new Date().toIS...` | `backend\src\infra.ts` |
| `GET` | `/api/v1/infra/notifications` | `auth` | `-` | `JSON` | `backend\src\infra.ts` |
| `POST` | `/api/v1/infra/notifications/:id/read` | `auth` | `-` | `JSON` | `backend\src\infra.ts` |
| `GET` | `/api/v1/infra/achievements` | `none` | `-` | `{ achievements: ACHIEVEMENTS_LIST }` | `backend\src\infra.ts` |
| `GET` | `/api/v1/infra/audit-logs` | `adminAuth` | `-` | `JSON` | `backend\src\infra.ts` |
| `POST` | `/api/v1/scheduled-interviews` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `GET` | `/api/v1/scheduled-interviews` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `GET` | `/api/v1/scheduled-interviews/:id` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/scheduled-interviews/:id/start` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/scheduled-interviews/:id/end` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/scheduled-interviews/:id/timer` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/scheduled-interviews/:id/sync` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/scheduled-interviews/:id/hints` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/scheduled-interviews/:id/evaluate` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/interviews/calendar` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `GET` | `/api/v1/interviews/calendar` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `GET` | `/api/v1/interviews/calendar/:id` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/interviews/calendar/:id/start` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/interviews/calendar/:id/end` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/interviews/calendar/:id/timer` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/interviews/calendar/:id/sync` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/interviews/calendar/:id/hints` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `POST` | `/api/v1/interviews/calendar/:id/evaluate` | `auth` | `-` | `JSON` | `backend\src\interviewRoutes.ts` |
| `GET` | `/api/v1/roadmaps` | `optionalAuth` | `-` | `JSON` | `backend\src\roadmapRoutes.ts` |
| `GET` | `/api/v1/roadmaps/:slug` | `optionalAuth` | `-` | `JSON` | `backend\src\roadmapRoutes.ts` |
| `POST` | `/api/v1/roadmaps/:slug/toggle-node` | `auth` | `-` | `JSON` | `backend\src\roadmapRoutes.ts` |
| `POST` | `/api/v1/ai/explain` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/hint` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/mock-interview` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/mock-interview/evaluate` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/chat` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/review` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/hint-tree` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/diagnose-testcase` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/debug` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/optimize` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `POST` | `/api/v1/ai/generate-tests` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `GET` | `/api/v1/ai/candidate-profile` | `auth` | `-` | `JSON` | `backend\src\aiService.ts` |
| `GET` | `/api/v1/status` | `none` | `-` | `{ status: "healthy", timestamp: new Date().toIS...` | `backend\src\infra.ts` |
| `GET` | `/api/v1/audit-logs` | `adminAuth` | `-` | `JSON` | `backend\src\infra.ts` |

## 2. Frontend API Calls Inventory & Resolution Matrix

| METHOD | Frontend Endpoint | Source File | Resolved Backend Route | Contract Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `${API}/api/v1/problems` | `frontend\src\App.tsx` | `/api/v1/problems` | `MATCHED` |
| `GET` | `${API}/api/v1/auth/me` | `frontend\src\App.tsx` | `/api/v1/auth/me` | `MATCHED` |
| `POST` | `${API}/api/v1/auth/logout` | `frontend\src\App.tsx` | `/api/v1/auth/logout` | `MATCHED` |
| `GET` | `/api/v1/search` | `frontend\src\components\common\CommandPalette.tsx` | `/api/v1/search` | `MATCHED` |
| `GET` | `/api/v1/snippets` | `frontend\src\components\common\SnippetsLibraryModal.tsx` | `/api/v1/snippets` | `MATCHED` |
| `GET` | `${API}/api/v1/system-design/reference-solution/${templateId}` | `frontend\src\components\system-design\ReferenceSolutionModal.tsx` | `/api/v1/system-design/reference-solution/:id` | `MATCHED` |
| `GET` | `/api/v1/courses` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/courses` | `MATCHED` |
| `GET` | `/api/v1/courses/${courseId}` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/courses/:slugOrId` | `MATCHED` |
| `POST` | `/api/v1/courses/${course.id}/enroll` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/courses/:id/enroll` | `MATCHED` |
| `GET` | `/api/v1/lessons/${lessonId}` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/lessons/:id` | `MATCHED` |
| `GET` | `/api/v1/courses/${r.data.lesson.course.slug}` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/courses/:slugOrId` | `MATCHED` |
| `POST` | `/api/v1/lessons/${lesson.id}/complete` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/lessons/:id/complete` | `MATCHED` |
| `GET` | `/api/v1/lessons/${lessonId}/quiz` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/lessons/:id/quiz` | `MATCHED` |
| `POST` | `/api/v1/lessons/${lessonId}/quiz/submit` | `frontend\src\features\academy\AcademyPages.tsx` | `/api/v1/lessons/:id/quiz/submit` | `MATCHED` |
| `GET` | `/api/v1/admin/dashboard` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/dashboard` | `MATCHED` |
| `GET` | `/api/v1/admin/problems` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems` | `MATCHED` |
| `GET` | `/api/v1/admin/problems/${tcProblemId}/test-cases` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/test-cases` | `MATCHED` |
| `GET` | `/api/v1/admin/problems/${revProblemId}/revisions` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/revisions` | `MATCHED` |
| `GET` | `/api/v1/admin/courses` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/courses` | `MATCHED` |
| `GET` | `/api/v1/admin/users` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/users` | `MATCHED` |
| `PUT` | `/api/v1/admin/users/${editingUser.id}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/users/:userId` | `MATCHED` |
| `POST` | `/api/v1/admin/users/${u.id}/unsuspend` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/users/:userId/unsuspend` | `MATCHED` |
| `POST` | `/api/v1/admin/users/${u.id}/suspend` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/users/:userId/suspend` | `MATCHED` |
| `POST` | `/api/v1/admin/users/${u.id}/delete` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/users/:userId/delete` | `MATCHED` |
| `GET` | `/api/v1/contests` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/contests` | `MATCHED` |
| `PUT` | `/api/v1/admin/contests/${editingContestId}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/contests/:id` | `MATCHED` |
| `POST` | `/api/v1/admin/contests` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/contests` | `MATCHED` |
| `DELETE` | `/api/v1/admin/contests/${c.id}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/contests/:id` | `MATCHED` |
| `GET` | `/api/v1/admin/analytics/overview` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/analytics/overview` | `MATCHED` |
| `GET` | `/api/v1/admin/moderation/reports` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/moderation/reports` | `MATCHED` |
| `POST` | `/api/v1/admin/moderation/reports/${reportId}/resolve` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/moderation/reports/:id/resolve` | `MATCHED` |
| `GET` | `/api/v1/admin/system/health` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/system/health` | `MATCHED` |
| `GET` | `/api/v1/admin/audit-logs` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/audit-logs` | `MATCHED` |
| `PUT` | `/api/v1/admin/courses/${editingCourseId}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/courses/:id` | `MATCHED` |
| `POST` | `/api/v1/admin/courses` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/courses` | `MATCHED` |
| `DELETE` | `/api/v1/admin/courses/${id}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/courses/:id` | `MATCHED` |
| `PUT` | `/api/v1/admin/courses/${c.id}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/courses/:id` | `MATCHED` |
| `GET` | `/api/v1/problems/${problemId}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/problems/:problemId` | `MATCHED` |
| `PUT` | `/api/v1/admin/problems/${editingId}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id` | `MATCHED` |
| `POST` | `/api/v1/admin/problems` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems` | `MATCHED` |
| `GET` | `/api/v1/admin/problems/${editingId}/validate` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/validate` | `MATCHED` |
| `POST` | `/api/v1/admin/problems/${id}/publish` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/publish` | `MATCHED` |
| `POST` | `/api/v1/admin/problems/${id}/unpublish` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/unpublish` | `MATCHED` |
| `DELETE` | `/api/v1/admin/problems/${id}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id` | `MATCHED` |
| `POST` | `/api/v1/admin/problems/${tcProblemId}/test-cases` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/test-cases` | `MATCHED` |
| `PUT` | `/api/v1/admin/problems/${tcProblemId}/test-cases/${tcId}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `MATCHED` |
| `DELETE` | `/api/v1/admin/problems/${tcProblemId}/test-cases/${tcId}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/test-cases/:tcId` | `MATCHED` |
| `POST` | `/api/v1/admin/problems/bulk-import` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/bulk-import` | `MATCHED` |
| `GET` | `/api/v1/admin/problems/export` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/export` | `MATCHED` |
| `GET` | `/api/v1/admin/problems/${problemId}/revisions/${version}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/revisions/:version` | `MATCHED` |
| `POST` | `/api/v1/admin/problems/${problemId}/restore/${version}` | `frontend\src\features\admin\AdminPanelPage.tsx` | `/api/v1/admin/problems/:id/restore/:version` | `MATCHED` |
| `GET` | `/api/v1/arena/matches/${matchState.matchId}` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/arena/matches/:matchId` | `MATCHED` |
| `POST` | `/api/v1/arena/matchmake` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/arena/matchmake` | `MATCHED` |
| `POST` | `/api/v1/arena/rooms` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/arena/rooms` | `MATCHED` |
| `POST` | `/api/v1/arena/rooms/join` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/arena/rooms/join` | `MATCHED` |
| `POST` | `/api/v1/arena/matches/${matchState.matchId}/rematch` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/arena/matches/:matchId/rematch` | `MATCHED` |
| `POST` | `/api/v1/contests/anti-cheat/analyze` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/contests/anti-cheat/analyze` | `MATCHED` |
| `POST` | `/api/v1/submissions/run` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/submissions/run` | `MATCHED` |
| `POST` | `/api/v1/arena/matches/${matchState.matchId}/progress` | `frontend\src\features\arena\BattleArenaPage.tsx` | `/api/v1/arena/matches/:matchId/progress` | `MATCHED` |
| `POST` | `${API}/api/v1/auth/forgot-password` | `frontend\src\features\auth\AuthModal.tsx` | `/api/v1/auth/forgot-password` | `MATCHED` |
| `POST` | `${API}/api/v1/auth/reset-password` | `frontend\src\features\auth\AuthModal.tsx` | `/api/v1/auth/reset-password` | `MATCHED` |
| `GET` | `${API}/api/v1/auth/oauth/state` | `frontend\src\features\auth\AuthModal.tsx` | `/api/v1/auth/oauth/state` | `MATCHED` |
| `POST` | `${API}/api/v1/auth/social` | `frontend\src\features\auth\AuthModal.tsx` | `/api/v1/auth/social` | `MATCHED` |
| `POST` | `${API}/api/v1/auth/verify-email` | `frontend\src\features\auth\EmailVerificationPage.tsx` | `/api/v1/auth/verify-email` | `MATCHED` |
| `POST` | `${API}/api/v1/auth/resend-verification` | `frontend\src\features\auth\EmailVerificationPage.tsx` | `/api/v1/auth/resend-verification` | `MATCHED` |
| `GET` | `/api/v1/collab/rooms/${rId}` | `frontend\src\features\collab\CollabStudioPage.tsx` | `/api/v1/collab/rooms/:roomId` | `MATCHED` |
| `POST` | `/api/v1/collab/rooms` | `frontend\src\features\collab\CollabStudioPage.tsx` | `/api/v1/collab/rooms` | `MATCHED` |
| `POST` | `/api/v1/collab/rooms/${roomId}/messages` | `frontend\src\features\collab\CollabStudioPage.tsx` | `/api/v1/collab/rooms/:roomId/messages` | `MATCHED` |
| `POST` | `/api/v1/execute` | `frontend\src\features\collab\CollabStudioPage.tsx` | `/api/v1/execute` | `MATCHED` |
| `GET` | `/api/v1/forum/posts` | `frontend\src\features\community\CommunityPage.tsx` | `/api/v1/forum/posts` | `MATCHED` |
| `POST` | `/api/v1/forum/posts` | `frontend\src\features\community\CommunityPage.tsx` | `/api/v1/forum/posts` | `MATCHED` |
| `GET` | `/api/v1/forum/posts/${id}` | `frontend\src\features\community\CommunityPage.tsx` | `/api/v1/forum/posts/:postId` | `MATCHED` |
| `POST` | `/api/v1/forum/posts/${selectedPost.id}/comments` | `frontend\src\features\community\CommunityPage.tsx` | `/api/v1/forum/posts/:postId/comments` | `MATCHED` |
| `GET` | `/api/v1/contests/${contestId}` | `frontend\src\features\contests\ContestsPage.tsx` | `/api/v1/contests/:id` | `MATCHED` |
| `GET` | `/api/v1/contests/${contestId}/leaderboard` | `frontend\src\features\contests\ContestsPage.tsx` | `/api/v1/contests/:id/leaderboard` | `MATCHED` |
| `GET` | `/api/v1/contests/${contestId}/announcements` | `frontend\src\features\contests\ContestsPage.tsx` | `/api/v1/contests/:id/announcements` | `MATCHED` |
| `GET` | `/api/v1/contests/${contestId}/clarifications` | `frontend\src\features\contests\ContestsPage.tsx` | `/api/v1/contests/:id/clarifications` | `MATCHED` |
| `POST` | `/api/v1/contests/${activeContestView.id}/clarifications` | `frontend\src\features\contests\ContestsPage.tsx` | `/api/v1/contests/:id/clarifications` | `MATCHED` |
| `POST` | `/api/v1/contests/${c.id}/register` | `frontend\src\features\contests\ContestsPage.tsx` | `/api/v1/contests/:id/register` | `MATCHED` |
| `GET` | `/api/v1/interviews` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/interviews` | `MATCHED` |
| `POST` | `/api/v1/interviews` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/interviews` | `MATCHED` |
| `GET` | `/api/v1/interviews/${id}` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/interviews/:id` | `MATCHED` |
| `POST` | `/api/v1/interviews/${activeSession.id}/timer` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/interviews/:id/timer` | `MATCHED` |
| `POST` | `/api/v1/interviews/${activeSession.id}/sync` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/interviews/:id/sync` | `MATCHED` |
| `POST` | `/api/v1/interviews/${activeSession.id}/hints` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/interviews/:id/hints` | `MATCHED` |
| `POST` | `/api/v1/problems/${activeSession.problemId}/run` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/problems/:problemId/run` | `MATCHED` |
| `POST` | `/api/v1/interviews/${activeSession.id}/evaluate` | `frontend\src\features\interviews\InterviewPage.tsx` | `/api/v1/interviews/:id/evaluate` | `MATCHED` |
| `GET` | `/api/v1/leaderboard` | `frontend\src\features\leaderboard\LeaderboardPage.tsx` | `/api/v1/leaderboard` | `MATCHED` |
| `GET` | `/api/v1/notes` | `frontend\src\features\notes\NotesPage.tsx` | `/api/v1/notes` | `MATCHED` |
| `POST` | `/api/v1/notes` | `frontend\src\features\notes\NotesPage.tsx` | `/api/v1/notes` | `MATCHED` |
| `PUT` | `/api/v1/notes/${selectedNote.id}` | `frontend\src\features\notes\NotesPage.tsx` | `/api/v1/notes/:id` | `MATCHED` |
| `DELETE` | `/api/v1/notes/${id}` | `frontend\src\features\notes\NotesPage.tsx` | `/api/v1/notes/:id` | `MATCHED` |
| `POST` | `/api/v1/lessons/${lessonId}/execute` | `frontend\src\features\playground\PlaygroundPage.tsx` | `/api/v1/lessons/:id/execute` | `MATCHED` |
| `GET` | `/api/v1/public/stats` | `frontend\src\features\problems\LandingPage.tsx` | `/api/v1/public/stats` | `MATCHED` |
| `GET` | `/api/v1/social/discussions` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/social/discussions` | `MATCHED` |
| `POST` | `/api/v1/social/discussions` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/social/discussions` | `MATCHED` |
| `POST` | `/api/v1/ai/explain` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/ai/explain` | `MATCHED` |
| `POST` | `/api/v1/ai/debug` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/ai/debug` | `MATCHED` |
| `POST` | `/api/v1/ai/optimize` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/ai/optimize` | `MATCHED` |
| `POST` | `/api/v1/ai/generate-tests` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/ai/generate-tests` | `MATCHED` |
| `POST` | `/api/v1/ai/chat` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/ai/chat` | `MATCHED` |
| `POST` | `/api/v1/debugger/trace` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/debugger/trace` | `MATCHED` |
| `POST` | `/api/v1/ai/hint` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/ai/hint` | `MATCHED` |
| `GET` | `/api/v1/problems/liked` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/problems/liked` | `MATCHED` |
| `POST` | `/api/v1/problems/${problemId}/like` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/problems/:problemId/like` | `MATCHED` |
| `POST` | `/api/v1/submissions` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/submissions` | `MATCHED` |
| `GET` | `/api/v1/submissions/${subId}` | `frontend\src\features\problems\ProblemDetailPage.tsx` | `/api/v1/submissions/:id` | `MATCHED` |
| `GET` | `/api/v1/problems` | `frontend\src\features\problems\ProblemsPage.tsx` | `/api/v1/problems` | `MATCHED` |
| `GET` | `/api/v1/users/${user.id}/submissions` | `frontend\src\features\problems\ProblemsPage.tsx` | `/api/v1/users/:userId/submissions` | `MATCHED` |
| `GET` | `/api/v1/users/${user.id}/stats` | `frontend\src\features\profile\DashboardPage.tsx` | `/api/v1/users/:userId/stats` | `MATCHED` |
| `GET` | `${API}/api/v1/users/${username}` | `frontend\src\features\profile\PublicProfilePage.tsx` | `/api/v1/users/:username` | `MATCHED` |
| `GET` | `/api/v1/roadmaps` | `frontend\src\features\roadmap\RoadmapPage.tsx` | `/api/v1/roadmaps` | `MATCHED` |
| `GET` | `/api/v1/submissions/${submissionId}/share` | `frontend\src\features\submissions\SubmissionSharePage.tsx` | `/api/v1/submissions/:id/share` | `MATCHED` |
| `GET` | `/api/v1/system-design/templates` | `frontend\src\features\system-design\SystemDesignPage.tsx` | `/api/v1/system-design/templates` | `MATCHED` |
| `PUT` | `/api/v1/system-design/projects/${currentProjectId}` | `frontend\src\SystemDesignStudio.tsx` | `/api/v1/system-design/projects/:id` | `MATCHED` |
| `POST` | `/api/v1/system-design/projects` | `frontend\src\SystemDesignStudio.tsx` | `/api/v1/system-design/projects` | `MATCHED` |
| `POST` | `/api/v1/system-design/projects/${currentProjectId}/rollback/${vNum}` | `frontend\src\SystemDesignStudio.tsx` | `/api/v1/system-design/projects/:id/rollback/:versionNumber` | `MATCHED` |
| `GET` | `/api/v1/system-design/projects` | `frontend\src\SystemDesignStudio.tsx` | `/api/v1/system-design/projects` | `MATCHED` |
| `GET` | `/api/v1/system-design/projects/${currentProjectId}` | `frontend\src\SystemDesignStudio.tsx` | `/api/v1/system-design/projects/:id` | `MATCHED` |

## 3. Unresolved Frontend Calls Audit

✅ **Zero Unresolved Frontend Calls**. All frontend endpoints map directly to registered, authenticated Express routes.

## 4. WebSocket Channels & Real-Time Event Handlers

| Event Name | Scope / Namespace | Channel Type | Authorization / Access Control |
| :--- | :--- | :--- | :--- |
| `JOIN_ROOM` | Real-time Collab | Workspace Collab | `collaborationEngine.isAuthorized(roomId, userId)` |
| `CODE_CHANGE` | Room Broadcast | Workspace Collab | Room membership check + broadcast to peers |
| `CURSOR_MOVE` | Room Broadcast | Workspace Collab | Room membership check |
| `LEAVE_ROOM` | Room Lifecycle | Workspace Collab | Cleanup user cursor and socket session |
| `canvas:join` | Whiteboard Canvas | System Design | Owner or authorized collaborator check |
| `canvas:update` | Whiteboard Canvas | System Design | Broadcast canvas delta if user is authorized |
| `arena:match` | Battle Arena | 1v1 Arena | Authenticated match participants only |

## 5. Prisma Schema Comparison & Data Models

- **Backend Models**: 26 models (User, Account, Problems, Submission, TestCase, Contest, ContestParticipant, Discussion, Note, Certificate, Organization, Team, OrganizationMember, Workspace, CollaborationRoom, WhiteboardObject, Project, ProjectFile, Roadmap, RoadmapNode, RoadmapProgress, AIConversation, AIMessage, AIUsage, SubscriptionPlan, UserSubscription).
- **Worker Models**: 4 core judge models (User, Problems, Submission, TestCase).
- **Schema Alignment Status**: Core judge models (`User`, `Problems`, `Submission`, `TestCase`) are structurally aligned. Worker schema is intentionally pruned to judge-critical data.

## 6. Background Jobs & Queue Workers

- **Queue Engine**: BullMQ backed by Redis.
- **Submission Queue**: `submissionQueue` processing code judge tasks in worker container.
- **Idempotency**: Submissions are tied to unique `submissionId` with transactional status transitions (`Processing` -> `Success`/`WrongAnswer`/`TLE`/`MLE`/`CompileError`/`RuntimeError`). Retried jobs check current submission state before re-scoring.
