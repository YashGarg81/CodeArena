import { test, expect, describe } from "bun:test";
import { isDockerSandboxEnabled, isDockerAvailable, runInDocker, compileInDocker } from "./sandbox/dockerRunner";
import { isFirecrackerAvailable, runInFirecrackerMicroVM } from "./sandbox/firecrackerRunner";
import { getSandboxMode, getSandboxPolicy, validateSandboxSafety } from "./sandbox";
import { runProcessSafely } from "./adapters/base";

describe("Adversarial Production Sandbox & Mock Injection Test Matrix", () => {
  const originalEnv = { ...process.env };

  const resetEnv = () => {
    process.env = { ...originalEnv };
  };

  test("1. NODE_ENV=production, MOCK_DOCKER=true -> compileInDocker and runInDocker FAIL CLOSED", async () => {
    resetEnv();
    process.env.NODE_ENV = "production";
    process.env.MOCK_DOCKER = "true";

    // isDockerAvailable must not return true simply because MOCK_DOCKER=true in production
    const isAvail = await isDockerAvailable();
    // In an environment without real docker, it must be false
    expect(isAvail).toBe(false);

    // compileInDocker must throw Security Violation
    expect(compileInDocker("js", ["node", "main.js"], { folderPath: "./", outputBinaryName: "out" }))
      .rejects.toThrow("Security Violation: MOCK_DOCKER is strictly prohibited in production");

    // runInDocker must return RE fail-closed verdict, NEVER synthetic AC
    const result = await runInDocker("js", ["node", "main.js"], {
      folderPath: "./",
      codeWithDriver: "console.log('hi')",
      expectedOutput: "expected_test_output",
      timeoutMs: 2000
    });
    expect(result.passed).toBe(false);
    expect(result.verdict).toBe("RE");
    expect(result.error).toContain("MOCK_DOCKER is strictly prohibited in production");
    expect(result.got).not.toBe("expected_test_output");
  });

  test("2. NODE_ENV=production, MOCK_DOCKER=false -> isDockerAvailable is false and validateSandboxSafety fails closed", async () => {
    resetEnv();
    process.env.NODE_ENV = "production";
    process.env.MOCK_DOCKER = "false";

    const isAvail = await isDockerAvailable();
    expect(isAvail).toBe(false);

    const safety = await validateSandboxSafety("docker");
    expect(safety.safe).toBe(false);
    expect(safety.reason).toContain("Docker container isolation is required but unavailable");
  });

  test("3. NODE_ENV=production, MOCK_FIRECRACKER=true -> runInFirecrackerMicroVM FAILS CLOSED", async () => {
    resetEnv();
    process.env.NODE_ENV = "production";
    process.env.MOCK_FIRECRACKER = "true";

    const isAvail = await isFirecrackerAvailable();
    expect(isAvail).toBe(false);

    expect(runInFirecrackerMicroVM("console.log('pwn')", "js"))
      .rejects.toThrow("Security Violation: MOCK_FIRECRACKER is strictly prohibited in production");
  });

  test("4. NODE_ENV=production, SANDBOX_MODE=process, ALLOW_PROCESS_SANDBOX=true -> strictly rejects process mode", async () => {
    resetEnv();
    process.env.NODE_ENV = "production";
    process.env.SANDBOX_MODE = "process";
    process.env.ALLOW_PROCESS_SANDBOX = "true";

    // getSandboxMode must refuse to return 'process' in production
    const mode = getSandboxMode();
    expect(mode).not.toBe("process");

    // validateSandboxSafety must fail closed
    const safety = await validateSandboxSafety("process");
    expect(safety.safe).toBe(false);
    expect(safety.reason).toContain("Process sandbox is strictly prohibited in production");
  });

  test("5. NODE_ENV=production, ALLOW_PROCESS_SANDBOX=true -> runProcessSafely strictly prevents host spawn", async () => {
    resetEnv();
    process.env.NODE_ENV = "production";
    process.env.ALLOW_PROCESS_SANDBOX = "true";
    delete process.env.STRICT_SANDBOX;

    const result = await runProcessSafely("whoami", [], {
      folderPath: "./",
      expectedOutput: "root"
    });

    expect(result.passed).toBe(false);
    expect(result.verdict).toBe("RE");
    expect(result.error).toContain("Security Violation: Host process execution is strictly prohibited");
  });

  test("6. NODE_ENV=production, unexpected MOCK_DOCKER values -> fails closed", async () => {
    resetEnv();
    process.env.NODE_ENV = "production";
    process.env.MOCK_DOCKER = "random_garbage_value";

    const isAvail = await isDockerAvailable();
    expect(isAvail).toBe(false);

    const safety = await validateSandboxSafety("docker");
    expect(safety.safe).toBe(false);
  });
});
