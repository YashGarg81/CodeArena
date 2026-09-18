// Auto-generated route manifest for RBAC and contract testing
export interface RouteEntry {
  method: string;
  path: string;
  auth: string;
  sourceFile: string;
}

export const ROUTE_MANIFEST: RouteEntry[] = [
  {
    "method": "GET",
    "path": "/api/v1/health",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/debugger/trace",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/arena/matchmake",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/arena/rooms",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/arena/rooms/join",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/arena/matches/:matchId/rematch",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/arena/history",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/arena/matches/:matchId",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/arena/matches/:matchId/progress",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/security/telemetry",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/security/audit-logs",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/storage/files/*key",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/storage/upload",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/social/feed",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/social/follow/:userId",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/social/discussions",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/social/discussions",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/social/tournaments/brackets",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/social/teams",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/recommendations",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/submissions/benchmark",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/mentors",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/plugins",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/plugins/:id/toggle",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/contests/anti-cheat/analyze",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/signup",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/login",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/auth/oauth/state",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/social",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/auth/me",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/auth/profile",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/logout",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/forgot-password",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/auth/verify-reset-token",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/reset-password",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/resend-verification",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/verify-email",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/auth/verification-status",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/2fa/setup",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/2fa/verify",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/2fa/challenge",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/2fa/disable",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/auth/sessions",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/logout-all",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/auth/signup",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/auth/login",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/auth/logout",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/auth/me",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/problems/meta/filters",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/public/stats",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/problems",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/problems/liked",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/problems/:problemId",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/problems/:problemId/like",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/problems/:problemId/submissions",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/problems",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/problems/:id",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/dashboard",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/problems",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/problems",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/admin/problems/:id",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "DELETE",
    "path": "/api/v1/admin/problems/:id",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/problems/:id/publish",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/problems/:id/unpublish",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/problems/:id/revisions",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/problems/:id/revisions/:version",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/problems/:id/restore/:version",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/problems/:id/test-cases",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/problems/:id/test-cases",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/admin/problems/:id/test-cases/:tcId",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "DELETE",
    "path": "/api/v1/admin/problems/:id/test-cases/:tcId",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/problems/bulk-import",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/problems/export",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/problems/:id/validate",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/developer/dashboard",
    "auth": "developerAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/developer/telemetry",
    "auth": "developerAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/developer/sandbox-health",
    "auth": "developerAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/users",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/users/:userId/suspend",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/users/:userId/unsuspend",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/admin/users/:userId/role",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/admin/users/:userId",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/courses",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/courses",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/admin/courses/:id",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "DELETE",
    "path": "/api/v1/admin/courses/:id",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/contests",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/admin/contests/:id",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "DELETE",
    "path": "/api/v1/admin/contests/:id",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/submissions/run",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/problems/:problemId/run",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/execute",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/submissions",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/submissions/:id",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/submissions/:id/compare/:targetId",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/submissions/:id/share",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/users/:userId/submissions",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/submission",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/submission/:id",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/users/:userId/stats",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/users/:userId/stats",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/users/:username",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/users/:username/profile",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/leaderboard",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/leaderboard",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/forum/posts",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/forum/posts",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/forum/posts/:postId",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/forum/posts/:postId/comments",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/forum/posts",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/forum/posts",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/forum/posts/:id",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/forum/posts/:id/comments",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/snippets",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/snippets",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "DELETE",
    "path": "/api/v1/snippets/:id",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/search",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/system-design/templates",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/system-design/guide",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/contests",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/contests/:id/register",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/contests/:id",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/contests/:id/leaderboard",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/contests/:id/announcements",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/contests/:id/announcements",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/contests/:id/clarifications",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/contests/:id/clarifications",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/contests/:id/end",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/achievements",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/courses",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/courses/:slugOrId",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/courses/:id/enroll",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/lessons/:id",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/lessons/:id/complete",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/lessons/:id/execute",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/lessons/:id/quiz",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/lessons/:id/quiz/submit",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/notes",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/notes",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/notes/:id",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "DELETE",
    "path": "/api/v1/notes/:id",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/users/me/learning",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/notifications",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/notifications/:id/read",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/notifications/read-all",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/users/me/profile",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/users/me/profile",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/users/me/settings",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/users/me/settings",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/users/me/password",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/analytics/overview",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/analytics/problems",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/analytics/users",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/moderation/reports",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/moderation/reports/:id/resolve",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/users/:userId/ban",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/users/:userId/unban",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/users/:userId/delete",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/problems/:id/analytics",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/system/health",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/audit-logs",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/contests/:id/leaderboard",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/plagiarism/results",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/users/bulk-role-update",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/admin/users/bulk-suspend",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/export/users",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/admin/export/submissions",
    "auth": "adminAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/collab/rooms",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/collab/rooms/:roomId",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/collab/rooms/:roomId/messages",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/collab/rooms/:roomId/messages",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/gamification/daily",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/gamification/profile",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/submissions/stream/:id",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/saml/callback",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/integrations/github/sync",
    "auth": "auth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/interviews",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/interviews/:id",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/:id/sync",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/:id/timer",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/:id/hints",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/:id/evaluate",
    "auth": "optionalAuth",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/health",
    "auth": "none",
    "sourceFile": "backend\\index.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/system-design/templates/:id",
    "auth": "none",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/system-design/reference-solution/:id",
    "auth": "none",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/system-design/estimate",
    "auth": "none",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/system-design/simulate",
    "auth": "none",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/system-design/score",
    "auth": "none",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/system-design/projects",
    "auth": "auth",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/system-design/projects",
    "auth": "auth",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/system-design/projects/:id",
    "auth": "none",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "PUT",
    "path": "/api/v1/system-design/projects/:id",
    "auth": "auth",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/system-design/projects/:id/rollback/:versionNumber",
    "auth": "auth",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/system-design/validate",
    "auth": "none",
    "sourceFile": "backend\\src\\systemDesign.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/infra/status",
    "auth": "none",
    "sourceFile": "backend\\src\\infra.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/infra/notifications",
    "auth": "auth",
    "sourceFile": "backend\\src\\infra.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/infra/notifications/:id/read",
    "auth": "auth",
    "sourceFile": "backend\\src\\infra.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/infra/achievements",
    "auth": "none",
    "sourceFile": "backend\\src\\infra.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/infra/audit-logs",
    "auth": "adminAuth",
    "sourceFile": "backend\\src\\infra.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/scheduled-interviews",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/scheduled-interviews",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/scheduled-interviews/:id",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/scheduled-interviews/:id/start",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/scheduled-interviews/:id/end",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/scheduled-interviews/:id/timer",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/scheduled-interviews/:id/sync",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/scheduled-interviews/:id/hints",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/scheduled-interviews/:id/evaluate",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/calendar",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/interviews/calendar",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/interviews/calendar/:id",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/calendar/:id/start",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/calendar/:id/end",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/calendar/:id/timer",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/calendar/:id/sync",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/calendar/:id/hints",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/interviews/calendar/:id/evaluate",
    "auth": "auth",
    "sourceFile": "backend\\src\\interviewRoutes.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/roadmaps",
    "auth": "optionalAuth",
    "sourceFile": "backend\\src\\roadmapRoutes.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/roadmaps/:slug",
    "auth": "optionalAuth",
    "sourceFile": "backend\\src\\roadmapRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/roadmaps/:slug/toggle-node",
    "auth": "auth",
    "sourceFile": "backend\\src\\roadmapRoutes.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/explain",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/hint",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/mock-interview",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/mock-interview/evaluate",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/chat",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/review",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/hint-tree",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/diagnose-testcase",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/debug",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/optimize",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "POST",
    "path": "/api/v1/ai/generate-tests",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/ai/candidate-profile",
    "auth": "auth",
    "sourceFile": "backend\\src\\aiService.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/status",
    "auth": "none",
    "sourceFile": "backend\\src\\infra.ts"
  },
  {
    "method": "GET",
    "path": "/api/v1/audit-logs",
    "auth": "adminAuth",
    "sourceFile": "backend\\src\\infra.ts"
  }
];
