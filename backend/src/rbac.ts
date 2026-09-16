// backend/src/rbac.ts
import type { Response, NextFunction } from "express";

export type RoleName =
  | "STUDENT"
  | "DEVELOPER"
  | "INSTRUCTOR"
  | "MODERATOR"
  | "CONTEST_ADMIN"
  | "PROBLEM_ADMIN"
  | "PLATFORM_ADMIN"
  | "ADMIN";

export type Permission =
  | "problem:create"
  | "problem:edit"
  | "problem:publish"
  | "problem:delete"
  | "testcase:manage"
  | "contest:create"
  | "contest:manage"
  | "contest:end"
  | "user:view"
  | "user:suspend"
  | "user:ban"
  | "course:manage"
  | "audit:view"
  | "system:manage"
  | "developer:api"
  | "developer:debug"
  | "developer:plugins"
  | "developer:telemetry";

const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  STUDENT: [],
  DEVELOPER: [
    "problem:create",
    "problem:edit",
    "problem:publish",
    "problem:delete",
    "testcase:manage",
    "contest:create",
    "contest:manage",
    "contest:end",
    "user:view",
    "user:suspend",
    "user:ban",
    "course:manage",
    "audit:view",
    "system:manage",
    "developer:api",
    "developer:debug",
    "developer:plugins",
    "developer:telemetry",
  ],
  INSTRUCTOR: [
    "problem:create",
    "problem:edit",
    "testcase:manage",
    "course:manage",
  ],
  MODERATOR: [
    "user:view",
    "user:suspend",
    "audit:view",
  ],
  PROBLEM_ADMIN: [
    "problem:create",
    "problem:edit",
    "problem:publish",
    "problem:delete",
    "testcase:manage",
    "course:manage",
  ],
  CONTEST_ADMIN: [
    "contest:create",
    "contest:manage",
    "contest:end",
    "problem:create",
    "problem:edit",
    "testcase:manage",
  ],
  PLATFORM_ADMIN: [
    "problem:create",
    "problem:edit",
    "problem:publish",
    "problem:delete",
    "testcase:manage",
    "contest:create",
    "contest:manage",
    "contest:end",
    "user:view",
    "user:suspend",
    "user:ban",
    "course:manage",
    "audit:view",
    "developer:api",
    "developer:debug",
    "developer:plugins",
    "developer:telemetry",
  ],
  ADMIN: [
    "problem:create",
    "problem:edit",
    "problem:publish",
    "problem:delete",
    "testcase:manage",
    "contest:create",
    "contest:manage",
    "contest:end",
    "user:view",
    "user:suspend",
    "course:manage",
    "audit:view",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as RoleName];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Express middleware to enforce granular permission requirements.
 */
export function requirePermission(permission: Permission) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!hasPermission(req.userRole, permission)) {
      return res.status(403).json({
        error: `Forbidden: requires '${permission}' permission`,
        userRole: req.userRole,
      });
    }

    next();
  };
}
