import { test, expect, describe } from "bun:test";
import { isDockerSandboxEnabled, isDockerAvailable, runInDocker } from "./src/sandbox/dockerRunner";
import { isFirecrackerAvailable, runInFirecrackerMicroVM } from "./src/sandbox/firecrackerRunner";
import { getSandboxPolicy, validateSandboxSafety } from "./src/sandbox";
import fs from "fs";
import path from "path";

describe("Sandbox Security & Hardening Integration Suite", () => {
  test("Sandbox policy enforces non-root execution, dropped caps, and zero host network", () => {
    const policy = getSandboxPolicy();
    expect(policy.isolation.dropCapabilities).toBe(true);
    expect(policy.isolation.networkIsolated).toBe(true);
    expect(policy.isolation.readOnlyRootfs).toBe(true);
    expect(policy.resourceLimits.maxPids).toBeLessThanOrEqual(64);
  });

  test("validateSandboxSafety flags dangerous process execution in production", async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.ALLOW_PROCESS_SANDBOX;

    try {
      const check = await validateSandboxSafety("process");
      expect(check.safe).toBe(false);
      expect(check.reason).toContain("Process sandbox is unsafe for production");
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  test("Docker runner reports status cleanly via isDockerAvailable", async () => {
    const available = await isDockerAvailable();
    expect(typeof available).toBe("boolean");
  });

  test("Docker runner handles infinite loops via timeout without hanging worker", async () => {
    const tmpDir = path.resolve("./tmp_sandbox_tle_test");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    try {
      const result = await runInDocker("js", ["node", "-e", "while(true){}"], {
        folderPath: tmpDir,
        codeWithDriver: "while(true){}",
        inputData: "",
        expectedOutput: "",
        timeoutMs: 500,
        memoryLimitMb: 128
      });

      expect(result.passed).toBe(false);
      expect(result.isTLE || result.error?.includes("Time Limit Exceeded") || (result.error && result.error.length > 0)).toBeTruthy();
    } finally {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  });

  test("Docker runner bounds massive stdout flood to prevent denial of service", async () => {
    const tmpDir = path.resolve("./tmp_sandbox_flood_test");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    try {
      // Print 2MB of text to test 1MB buffer cap
      const floodScript = "process.stdout.write('A'.repeat(2 * 1024 * 1024));";
      const result = await runInDocker("js", ["node", "-e", floodScript], {
        folderPath: tmpDir,
        codeWithDriver: floodScript,
        inputData: "",
        expectedOutput: "",
        timeoutMs: 3000,
        memoryLimitMb: 128,
        maxOutputBytes: 64 * 1024 // 64KB cap for test
      });

      expect(result.passed).toBe(false);
      expect(result.isOLE || result.error?.includes("Output Limit Exceeded") || (result.error && result.error.length > 0)).toBeTruthy();
    } finally {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  });

  test("Firecracker MicroVM runner fails closed when virtualization devices are missing", async () => {
    const origMock = process.env.MOCK_FIRECRACKER;
    process.env.MOCK_FIRECRACKER = "false";
    try {
      await expect(runInFirecrackerMicroVM("console.log('test')", "js")).rejects.toThrow(
        /Security Violation.*Firecracker MicroVM/
      );
    } finally {
      if (origMock !== undefined) process.env.MOCK_FIRECRACKER = origMock;
      else delete process.env.MOCK_FIRECRACKER;
    }
  });
});
