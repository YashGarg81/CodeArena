import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";
import { prisma } from "../db";
import { battleArenaService } from "./battleArena";

describe("Battle Arena Elo Concurrency & Idempotency Suite", () => {
  let server: Server;
  let base = "";
  let testUser: any;
  let testToken = "";

  beforeAll(async () => {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    base = `http://127.0.0.1:${port}`;

    // Create unique user for testing
    const email = `battle_concurrency_${Date.now()}@codearena.test`;
    const res = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Battle Concurrency Tester",
        email,
        password: "StrongPassword123!",
        username: `battle_${Date.now()}`
      })
    });
    const data = (await res.json()) as any;
    testUser = data.user;
    testToken = data.token;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  test("10+ concurrent match completion requests award Elo and XP exactly once (idempotent)", async () => {
    // 1. Create a match for testUser
    const match = battleArenaService.createPrivateRoom({
      userId: testUser.id,
      username: testUser.username,
      elo: testUser.contestRating || 1200,
      gameMode: "classic",
      difficulty: "Easy"
    });
    match.status = "active";

    const initialUser = await prisma.user.findFirst({ where: { id: testUser.id } });
    const initialElo = initialUser.contestRating;
    const initialXp = initialUser.xp;

    // 2. Dispatch 15 concurrent progress updates completing the match (testsPassed: 5/5)
    const promises = Array.from({ length: 15 }).map(() =>
      fetch(`${base}/api/v1/arena/matches/${match.matchId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`
        },
        body: JSON.stringify({ testsPassed: 5, totalTests: 5 })
      })
    );

    const responses = await Promise.all(promises);
    for (const r of responses) {
      expect(r.status).toBe(200);
      const body = (await r.json()) as any;
      expect(body.success).toBe(true);
      expect(body.match.status).toBe("completed");
    }

    // 3. Verify user's final Elo and XP: incremented EXACTLY ONCE (classic mode: eloGain=25, xpGain=100)
    const updatedUser = await prisma.user.findFirst({ where: { id: testUser.id } });
    expect(updatedUser.contestRating).toBe(initialElo + 25);
    expect(updatedUser.xp).toBe(initialXp + 100);
  });
});
