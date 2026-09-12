import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";
import { resetRateLimits } from "./rateLimit";

describe("Frontend <-> Backend API Contract Resolution Suite", () => {
    let server: Server;
    let base = "";

    beforeAll(async () => {
        resetRateLimits();
        server = await new Promise<Server>((resolve) => {
            const s = app.listen(0, "127.0.0.1", () => resolve(s));
        });
        const addr = server.address();
        const port = typeof addr === "object" && addr ? addr.port : 0;
        base = `http://127.0.0.1:${port}`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    });

    it("GET /api/v1/problems/liked returns empty list when unauthenticated", async () => {
        const res = await fetch(`${base}/api/v1/problems/liked`, {
            method: "GET"
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.liked).toBeDefined();
        expect(Array.isArray(data.liked)).toBe(true);
    });

    it("POST /api/v1/execute rejects empty code payload with 400", async () => {
        const res = await fetch(`${base}/api/v1/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: "", language: "js" })
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toContain("required");
    });

    it("POST /api/v1/execute rejects malicious AST injection with 400", async () => {
        const res = await fetch(`${base}/api/v1/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: "require('child_process').execSync('whoami')",
                language: "js"
            })
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });

    it("POST /api/v1/problems/:problemId/run requires authentication (401)", async () => {
        const res = await fetch(`${base}/api/v1/problems/problem-1/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: "console.log(1);", language: "js" })
        });
        expect(res.status).toBe(401);
    });

    it("GET /api/v1/users/:username resolves without 404 router crash (returns 404 only for nonexistent user)", async () => {
        const res = await fetch(`${base}/api/v1/users/nonexistent_test_user_xyz`, {
            method: "GET"
        });
        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toBe("User not found");
    });
});
