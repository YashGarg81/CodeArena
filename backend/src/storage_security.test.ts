import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import { app } from "../index";
import { getJwtSecret } from "./config";
const JWT_SECRET = getJwtSecret();
import { validateStorageKey, resolveSafeStoragePath, checkFileAccess } from "./storageService";

describe("Storage Security & IDOR Defense Suite", () => {
  let server: Server;
  let base = "";
  let user1Token = "";
  let user1Id = "usr_storage_alice";
  let user2Token = "";
  let user2Id = "usr_storage_bob";

  beforeAll(async () => {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    base = `http://127.0.0.1:${port}`;

    const email1 = `alice_${Date.now()}@codearena.test`;
    const res1 = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: email1, password: "password12345", username: `alice_${Date.now()}` })
    });
    const body1 = await res1.json();
    user1Token = body1.token;
    user1Id = body1.user.id;

    const email2 = `bob_${Date.now()}@codearena.test`;
    const res2 = await fetch(`${base}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob", email: email2, password: "password12345", username: `bob_${Date.now()}` })
    });
    const body2 = await res2.json();
    user2Token = body2.token;
    user2Id = body2.user.id;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  test("1. Direct unit checks: validateStorageKey rejects traversal vectors", () => {
    expect(validateStorageKey("../etc/passwd").safe).toBe(false);
    expect(validateStorageKey("..\\..\\windows\\system32").safe).toBe(false);
    expect(validateStorageKey("%2e%2e%2fsecret.txt").safe).toBe(false);
    expect(validateStorageKey("file.txt\0.exe").safe).toBe(false);
    expect(validateStorageKey("file.txt%00.png").safe).toBe(false);
    expect(validateStorageKey("C:\\boot.ini").safe).toBe(false);
    expect(validateStorageKey("\\\\192.168.1.1\\share\\data").safe).toBe(false);
    expect(validateStorageKey("//server/share/file").safe).toBe(false);
    expect(validateStorageKey("/absolute/path").safe).toBe(false);
    expect(validateStorageKey("valid_user/report.pdf").safe).toBe(true);
  });

  test("2. Upload requires authentication (401 without token)", async () => {
    const res = await fetch(`${base}/api/v1/storage/upload?filename=notes.txt`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "secret notes"
    });
    expect(res.status).toBe(401);
  });

  test("3. Upload rejects dangerous executable file types", async () => {
    const res = await fetch(`${base}/api/v1/storage/upload?filename=malware.exe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${user1Token}`
      },
      body: "binary executable data"
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("prohibited");
  });

  test("4. Upload rejects oversized payloads (> 10MB)", async () => {
    // 11MB payload
    const oversized = Buffer.alloc(11 * 1024 * 1024);
    const res = await fetch(`${base}/api/v1/storage/upload?filename=huge.png`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${user1Token}`
      },
      body: oversized
    });
    expect(res.status).toBe(413);
  });

  test("5. Normal user upload succeeds and scopes file to user ID", async () => {
    const res = await fetch(`${base}/api/v1/storage/upload?filename=code.py`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${user1Token}`
      },
      body: "print('hello from secure storage')"
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.key).toContain(user1Id);
  });

  test("6. Normal download by owner succeeds", async () => {
    const uploadRes = await fetch(`${base}/api/v1/storage/upload?filename=my_diary.md`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${user1Token}`
      },
      body: "# Private Diary Entry"
    });
    const { key } = await uploadRes.json();

    const getRes = await fetch(`${base}/api/v1/storage/files/${key}`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    expect(getRes.status).toBe(200);
    expect(getRes.headers.get("x-content-type-options")).toBe("nosniff");
    const content = await getRes.text();
    expect(content).toContain("Private Diary Entry");
  });

  test("7. Cross-user IDOR access is blocked (403 Forbidden to stranger)", async () => {
    // User1 uploads private file
    const uploadRes = await fetch(`${base}/api/v1/storage/upload?filename=confidential.txt`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${user1Token}`
      },
      body: "top secret user1 data"
    });
    const { key } = await uploadRes.json();

    // User2 attempts to access User1's private file
    const getRes = await fetch(`${base}/api/v1/storage/files/${key}`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    expect(getRes.status).toBe(403);
    const body = await getRes.json();
    expect(body.error).toContain("Forbidden");
  });

  test("8. Unauthenticated access to private user file returns 401", async () => {
    const uploadRes = await fetch(`${base}/api/v1/storage/upload?filename=secret.txt`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${user1Token}`
      },
      body: "unauth secret"
    });
    const { key } = await uploadRes.json();

    const getRes = await fetch(`${base}/api/v1/storage/files/${key}`);
    expect(getRes.status).toBe(401);
  });

  test("9. Path traversal attempts on download return 400 Bad Request", async () => {
    const res = await fetch(`${base}/api/v1/storage/files/..%2f..%2fpackage.json`);
    expect(res.status).toBe(400);
  });

  test("10. Nonexistent file returns 404 Not Found", async () => {
    const res = await fetch(`${base}/api/v1/storage/files/public/nonexistent_file_12345.png`);
    expect(res.status).toBe(404);
  });
});
