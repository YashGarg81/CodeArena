import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import { app } from "../index";

describe("Access + Refresh Token Lifecycle", () => {
  let server: Server;
  let base = "";

  beforeAll(async () => {
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

  const signup = async () => {
    const stamp = Date.now() + Math.floor(Math.random() * 1000);
    const res = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Refresh Tester", email: `refresh_${stamp}@codearena.test`, password: "password12345", username: `refresh_${stamp}` }),
    });
    return res.json();
  };

  test("signup issues an access token and a refresh token", async () => {
    const body = await signup();
    expect(typeof body.token).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
    expect(body.refreshToken).not.toBe(body.token);
  });

  test("refresh rotates tokens and new access token is accepted", async () => {
    const { token, refreshToken } = await signup();
    const res = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.token).toBe("string");
    expect(typeof data.refreshToken).toBe("string");
    expect(data.refreshToken).not.toBe(refreshToken);

    const me = await fetch(`${base}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    expect(me.status).toBe(200);
  });

  test("reusing a consumed refresh token is rejected and revokes the family", async () => {
    const { refreshToken } = await signup();

    const first = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const rotated = await first.json();
    expect(first.status).toBe(200);

    const replay = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    expect(replay.status).toBe(401);
    const replayBody = await replay.json();
    expect(replayBody.reuseDetected).toBe(true);

    // The successor token must no longer work once the family is revoked.
    const successor = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rotated.refreshToken }),
    });
    expect(successor.status).toBe(401);
  });

  test("garbage refresh token is rejected", async () => {
    const res = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "not-a-real-token" }),
    });
    expect(res.status).toBe(401);
  });

  test("logout revokes the refresh token", async () => {
    const { token, refreshToken } = await signup();
    const logout = await fetch(`${base}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ refreshToken }),
    });
    expect(logout.status).toBe(200);

    const res = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    expect(res.status).toBe(401);
  });
});
