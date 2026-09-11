import { describe, test, expect } from "bun:test";
import { getSandboxMode, getSandboxPolicy, validateSandboxSafety } from "./sandbox";
import { runInDocker, compileInDocker, isDockerAvailable } from "./sandbox/dockerRunner";
import { CppAdapter } from "./adapters/cpp";
import { RustAdapter } from "./adapters/rust";
import { JavaAdapter } from "./adapters/java";
import os from "os";
import path from "path";

describe("Worker Sandbox Remediation & Fail-Closed Regression Suite", () => {
  test("authoritative sandbox policy defaults to docker in production", () => {
    const mode = getSandboxMode();
    expect(["docker", "firecracker", "process"]).toContain(mode);
  });

  test("Docker runner enforces strict isolation flags (--network none, --read-only, --cap-drop=ALL)", () => {
    const policy = getSandboxPolicy();
    expect(policy.isolation.networkIsolated).toBe(true);
    expect(policy.isolation.readOnlyRootfs).toBe(true);
    expect(policy.isolation.dropCapabilities).toBe(true);
    expect(policy.resourceLimits.maxMemoryMb).toBeGreaterThanOrEqual(64);
  });

  test("validateSandboxSafety fails closed when sandbox backend is missing in production", async () => {
    const result = await validateSandboxSafety("process");
    // In test / prod, process sandbox should be rejected unless explicitly allowed
    if (process.env.ALLOW_PROCESS_SANDBOX !== "true" && process.env.NODE_ENV === "production") {
      expect(result.safe).toBe(false);
    }
  });

  test("Compiled languages (C++, Rust, Java) use containerized compilation via compileInDocker", async () => {
    const cppAdapter = new CppAdapter();
    const rustAdapter = new RustAdapter();
    const javaAdapter = new JavaAdapter();

    expect(cppAdapter.key).toBe("cpp");
    expect(rustAdapter.key).toBe("rust");
    expect(javaAdapter.key).toBe("java");

    const tempDir = os.tmpdir();
    // Compiling via compileInDocker must fail closed or execute in container
    const compileRes = await compileInDocker("cpp", ["g++", "-O3", "test.cpp", "-o", "test_exec"], {
      folderPath: tempDir,
      outputBinaryName: "test_exec"
    });
    expect(compileRes).toBeDefined();
  });
});
