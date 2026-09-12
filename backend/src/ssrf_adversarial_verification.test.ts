import { test, expect, describe } from "bun:test";
import { validateUrlForSSRF, validateResolvedUrlForSSRF, isIpBlocked, fetchWithSSRFProtection } from "./ssrf";

describe("Adversarial SSRF Verification Protocol", () => {
  test("SSRF-1: 127.0.0.1 (standard loopback) is blocked", () => {
    const res = validateUrlForSSRF("http://127.0.0.1/admin");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("forbidden");
  });

  test("SSRF-2: localhost is blocked", () => {
    const res = validateUrlForSSRF("http://localhost:8000/internal");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("restricted");
  });

  test("SSRF-3: 2130706433 (decimal IP for 127.0.0.1) is blocked", () => {
    const res = validateUrlForSSRF("http://2130706433/status");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("forbidden");
  });

  test("SSRF-4: 0177.0.0.1 (octal notation) is blocked", () => {
    const res = validateUrlForSSRF("http://0177.0.0.1/secret");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("forbidden");
  });

  test("SSRF-5: ::1 (IPv6 loopback) is blocked", () => {
    const res = validateUrlForSSRF("http://[::1]:3000/api");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("forbidden");
  });

  test("SSRF-6: ::ffff:127.0.0.1 (IPv4-mapped IPv6) is blocked", () => {
    const res = validateUrlForSSRF("http://[::ffff:127.0.0.1]/metrics");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("forbidden");
  });

  test("SSRF-7: 169.254.169.254 (cloud metadata) is blocked", () => {
    const res = validateUrlForSSRF("http://169.254.169.254/latest/meta-data");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("forbidden");
  });

  test("SSRF-8: file:// scheme is blocked", () => {
    const res = validateUrlForSSRF("file:///etc/passwd");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("Unsupported protocol 'file:'");
  });

  test("SSRF-9: gopher:// scheme is blocked", () => {
    const res = validateUrlForSSRF("gopher://127.0.0.1:70");
    expect(res.safe).toBe(false);
    expect(res.reason).toContain("Unsupported protocol 'gopher:'");
  });

  test("SSRF-10: DNS Rebinding / TOCTOU resolution validation blocks internal destinations", async () => {
    const res = await validateResolvedUrlForSSRF("http://localhost");
    expect(res.safe).toBe(false);
  });

  test("SSRF-11: Public benign HTTPS URL is allowed", async () => {
    const res = validateUrlForSSRF("https://api.github.com/events");
    expect(res.safe).toBe(true);
  });
});
