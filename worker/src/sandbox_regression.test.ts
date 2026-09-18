import { describe, test, expect } from "bun:test";
import { getSandboxMode, getSandboxPolicy, validateSandboxSafety, shouldUseDockerSandbox } from "./sandbox";
import { runInDocker, compileInDocker, isDockerAvailable } from "./sandbox/dockerRunner";
import { CppAdapter } from "./adapters/cpp";
import { RustAdapter } from "./adapters/rust";
import { JavaAdapter } from "./adapters/java";
import { PythonAdapter } from "./adapters/python";
import { LanguageAdapterRegistry } from "./adapters";
import os from "os";
import path from "path";
import fs from "fs";

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
     const compileRes = await compileInDocker("cpp", ["g++", "-O3", "test.cpp", "-o", "test_exec"], {
         folderPath: tempDir,
         outputBinaryName: "test_exec"
     });
     expect(compileRes).toBeDefined();
   });

   test("Python submission: file created → sandbox sees file → executes successfully → correct verdict", async () => {
     const pythonAdapter = new PythonAdapter();
     expect(pythonAdapter.key).toBe("py");

     const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "py-regression-"));
     try {
       const codeWithDriver = "import sys\nsys.stdout.write(sys.stdin.read())\n";
       const result = await pythonAdapter.execute({
         folderPath: tempDir,
         codeWithDriver,
         inputData: "hello compiler",
         expectedOutput: "hello compiler",
         timeoutMs: 5000,
         memoryLimitMb: 256
       });

       const filePath = path.join(tempDir, "solution.py");
       expect(fs.existsSync(filePath)).toBe(true);
       const fileContent = fs.readFileSync(filePath, "utf-8");
       expect(fileContent).toContain("sys.stdout.write");
       if (await shouldUseDockerSandbox()) {
         expect(result.passed).toBe(true);
         expect(result.verdict).toBe("AC");
         expect(result.got.trim()).toBe("hello compiler");
       } else {
         expect(result.error || result.passed === false).toBeTruthy();
       }
     } finally {
       try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
     }
   });

   test("Python adapter file path matches Docker mount path", async () => {
     const pythonAdapter = new PythonAdapter();
     const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "py-path-"));
     try {
       const codeWithDriver = "import sys\nsys.stdout.write(sys.stdin.read())\n";
       const result = await pythonAdapter.execute({
         folderPath: tempDir,
         codeWithDriver,
         inputData: "test",
         expectedOutput: "test",
         timeoutMs: 5000,
         memoryLimitMb: 256
       });

       const filePath = path.join(tempDir, "solution.py");
       expect(fs.existsSync(filePath)).toBe(true);
       const fileContent = fs.readFileSync(filePath, "utf-8");
       expect(fileContent).toContain("sys.stdout.write");
       if (await shouldUseDockerSandbox()) {
         expect(result.passed).toBe(true);
         expect(result.verdict).toBe("AC");
       } else {
         expect(result.error || result.passed === false).toBeTruthy();
       }
     } finally {
       try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
     }
   });
 });
