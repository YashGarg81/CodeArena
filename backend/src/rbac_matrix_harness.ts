import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { app } from "../index";
import { prisma } from "../db";
import { getJwtSecret } from "./config";

const repoRoot = path.resolve(__dirname, "../..");
const routeMapPath = path.join(repoRoot, "ROUTE_MAP.md");

const ROLES = [
  "STUDENT",
  "DEVELOPER",
  "INTERVIEWER",
  "INSTRUCTOR",
  "MODERATOR",
  "CONTEST_ADMIN",
  "PROBLEM_ADMIN",
  "ADMIN"
] as const;

interface RouteEntry {
  method: string;
  path: string;
  auth: string;
  sourceFile: string;
}

function parseRouteMap(): RouteEntry[] {
  const content = fs.readFileSync(routeMapPath, "utf8");
  const lines = content.split("\n");
  const routes: RouteEntry[] = [];

  let inTable = false;
  for (const line of lines) {
    if (line.includes("| METHOD | PATH | Auth Middleware |")) {
      inTable = true;
      continue;
    }
    if (inTable) {
      if (!line.startsWith("|")) break;
      if (line.includes(":---")) continue;
      const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 4 && parts[0] && parts[1] && parts[2] && parts[parts.length - 1]) {
        const method = parts[0].replace(/`/g, "");
        const routePath = parts[1].replace(/`/g, "");
        const auth = parts[2].replace(/`/g, "");
        const sourceFile = parts[parts.length - 1]!.replace(/`/g, "");
        routes.push({ method, path: routePath, auth, sourceFile });
      }
    }
  }
  return routes;
}

async function runRbacMatrix() {
  console.log("Starting RBAC Runtime Matrix Evaluation across 8 roles x 190 routes = 1,520 combinations...");

  const routes = parseRouteMap();
  console.log(`Discovered ${routes.length} routes from ROUTE_MAP.md.`);

  // Start temporary server on random port
  const server = app.listen(0, "127.0.0.1");
  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}`;
  const JWT_SECRET = getJwtSecret();

  // Ensure an established user exists for all 8 roles
  const userTokens: Record<string, string> = {};
  for (const role of ROLES) {
    const roleId = `usr_rbac_${role.toLowerCase()}`;
    let user = await prisma.user.findFirst({ where: { role } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: roleId,
          email: `${role.toLowerCase()}@codearena.dev`,
          name: `${role} User`,
          username: `role_${role.toLowerCase()}`,
          role: role,
          password: "hashed_dummy_password",
          isEmailVerified: true,
          tokenVersion: 0,
          isSuspended: false
        }
      });
    }
    const token = jwt.sign({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion || 0 }, JWT_SECRET, { expiresIn: "1h" });
    userTokens[role] = token;
  }

  // Pre-seed mock entity IDs so parameterized routes don't 404 unnecessarily
  const sampleProblem = await prisma.problems.findFirst();
  const problemId = sampleProblem?.id || "search-an-element-in-an-array";
  const contestId = "contest_rbac_test";
  const matchId = "match_rbac_test";
  const userId = `rbac_user_student_${Date.now()}`;

  function resolveTestUrl(rawPath: string): string {
    return rawPath
      .replace(":problemId", problemId)
      .replace(":id", problemId)
      .replace(":userId", userId)
      .replace(":matchId", matchId)
      .replace(":contestId", contestId)
      .replace(":tcId", "tc_1")
      .replace(":version", "1")
      .replace(":targetId", problemId)
      .replace(":username", "admin")
      .replace("*key", "public/test.png");
  }

  interface MatrixResult {
    method: string;
    route: string;
    role: string;
    authType: string;
    expectedStatus: string;
    actualStatus: number;
    passed: boolean;
    reason: string;
  }

  const results: MatrixResult[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const route of routes) {
    const testPath = resolveTestUrl(route.path);
    const fullUrl = `${baseUrl}${testPath}`;

    for (const role of ROLES) {
      let user = await prisma.user.findFirst({ where: { role } });
      if (user) {
        user.isSuspended = false;
      }
      const token = jwt.sign(
        {
          userId: user?.id || `usr_rbac_${role.toLowerCase()}`,
          role: role,
          tokenVersion: user?.tokenVersion || 0,
          nonce: Math.random().toString() + Date.now().toString()
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-test-bypass-ratelimit": "1"
      };

      let expectedStatusDesc = "2xx / 4xx (Authorized)";
      let shouldBeDenied = false;

      if (route.auth === "adminAuth") {
        shouldBeDenied = !((role as string) === "ADMIN" || (role as string) === "PLATFORM_ADMIN");
        expectedStatusDesc = shouldBeDenied ? "403 Forbidden" : "Allowed (non-403)";
      } else if (route.auth === "developerAuth") {
        shouldBeDenied = !((role as string) === "DEVELOPER" || (role as string) === "ADMIN" || (role as string) === "PLATFORM_ADMIN");
        expectedStatusDesc = shouldBeDenied ? "403 Forbidden" : "Allowed (non-403)";
      } else if (route.auth === "problemAdminAuth") {
        shouldBeDenied = !((role as string) === "ADMIN" || (role as string) === "PLATFORM_ADMIN" || (role as string) === "PROBLEM_ADMIN" || (role as string) === "INSTRUCTOR");
        expectedStatusDesc = shouldBeDenied ? "403 Forbidden" : "Allowed (non-403)";
      } else if (route.auth === "auth") {
        shouldBeDenied = false; // Authenticated user is admitted to business logic
        expectedStatusDesc = "Allowed (non-401/non-403)";
      } else {
        // none or optionalAuth
        shouldBeDenied = false;
        expectedStatusDesc = "Public / Optional";
      }

      let actualStatus = 0;
      let reason = "OK";
      let passed = true;

      try {
        const res = await fetch(fullUrl, {
          method: route.method,
          headers,
          body: ["POST", "PUT", "PATCH"].includes(route.method) ? JSON.stringify({ ping: true }) : undefined
        });
        actualStatus = res.status;

        if (shouldBeDenied) {
          if (actualStatus === 403) {
            passed = true;
            reason = "Properly denied with 403 Forbidden";
          } else {
            passed = false;
            reason = `Privilege escalation: expected 403 Forbidden, received ${actualStatus}`;
          }
        } else {
          // If authorized, it should NOT return 401 Unauthorized or 403 Forbidden
          if (actualStatus === 401 || actualStatus === 403) {
            passed = false;
            reason = `Unexpected denial: role ${role} received ${actualStatus}`;
          } else {
            passed = true;
            reason = `Authorized access reached application layer (HTTP ${actualStatus})`;
          }
        }
      } catch (err: any) {
        actualStatus = 599;
        passed = false;
        reason = `Request dispatch failure: ${err.message}`;
      }

      if (passed) passedCount++;
      else failedCount++;

      results.push({
        method: route.method,
        route: route.path,
        role,
        authType: route.auth,
        expectedStatus: expectedStatusDesc,
        actualStatus,
        passed,
        reason
      });
    }
  }

  server.close();

  // Generate RBAC_RUNTIME_MATRIX_REPORT.md
  let report = `# RBAC Runtime Matrix Report (Automated HTTP Execution)\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n`;
  report += `**Total Combinations Evaluated**: ${results.length} (${ROLES.length} roles x ${routes.length} routes)\n`;
  report += `**Passed**: ${passedCount}\n`;
  report += `**Failed**: ${failedCount}\n`;
  report += `**Skipped**: 0\n`;
  report += `**Blocked**: 0\n\n`;

  report += `## Summary by Role\n\n`;
  report += `| Role | Combinations | Passed | Failed |\n`;
  report += `| :--- | :--- | :--- | :--- |\n`;
  for (const role of ROLES) {
    const roleResults = results.filter((r) => r.role === role);
    const rPass = roleResults.filter((r) => r.passed).length;
    const rFail = roleResults.filter((r) => !r.passed).length;
    report += `| \`${role}\` | ${roleResults.length} | ${rPass} | ${rFail} |\n`;
  }

  report += `\n## Runtime Combinations Breakdown\n\n`;
  report += `| METHOD | ROUTE | ROLE | AUTH MIDDLEWARE | EXPECTED | ACTUAL STATUS | RESULT | DETAILS |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const r of results) {
    const verdict = r.passed ? "✅ PASS" : "❌ FAIL";
    report += `| \`${r.method}\` | \`${r.route}\` | \`${r.role}\` | \`${r.authType}\` | ${r.expectedStatus} | \`${r.actualStatus}\` | ${verdict} | ${r.reason} |\n`;
  }

  const outPath = path.join(repoRoot, "RBAC_RUNTIME_MATRIX_REPORT.md");
  fs.writeFileSync(outPath, report, "utf8");
  console.log(`\nRBAC matrix generated successfully at: ${outPath}`);
  console.log(`Results: ${passedCount} passed, ${failedCount} failed, total ${results.length}`);
}

runRbacMatrix().catch((err) => {
  console.error("RBAC harness error:", err);
  process.exit(1);
});
