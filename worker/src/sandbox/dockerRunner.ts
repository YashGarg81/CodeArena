// worker/src/sandbox/dockerRunner.ts
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import type { ExecutionOptions, ExecutionResult, CompilationResult } from "../adapters/types";

export const LANGUAGE_IMAGES: Record<string, string> = {
  js: "node:20-alpine",
  ts: "node:20-alpine",
  javascript: "node:20-alpine",
  typescript: "node:20-alpine",
  py: "python:3.12-alpine",
  python: "python:3.12-alpine",
  python3: "python:3.12-alpine",
  cpp: "gcc:14",
  "c++": "gcc:14",
  java: "eclipse-temurin:21-jdk-alpine",
  go: "golang:1.22-alpine",
  golang: "golang:1.22-alpine",
  rust: "rust:1.77-alpine",
  rs: "rust:1.77-alpine",
  cs: "mcr.microsoft.com/dotnet/sdk:8.0-alpine",
  csharp: "mcr.microsoft.com/dotnet/sdk:8.0-alpine",
  "c#": "mcr.microsoft.com/dotnet/sdk:8.0-alpine",
  kt: "zenika/kotlin:1.9-alpine",
  kotlin: "zenika/kotlin:1.9-alpine",
  php: "php:8.3-cli-alpine",
  ruby: "ruby:3.3-alpine",
  swift: "swift:5.9-slim",
};

export function isDockerSandboxEnabled(): boolean {
  const isProd = process.env.NODE_ENV === "production";
  if (process.env.SANDBOX_MODE === "process" && process.env.ALLOW_PROCESS_SANDBOX === "true") {
    return false;
  }
  return process.env.SANDBOX_MODE === "docker" || process.env.DOCKER_SANDBOX === "true" || isProd || !process.env.SANDBOX_MODE;
}

export async function isDockerAvailable(): Promise<boolean> {
  if (process.env.MOCK_DOCKER === "true") return true;
  if (process.env.MOCK_DOCKER === "false") return false;
  return new Promise((resolve) => {
    const proc = spawn("docker", ["info"], { stdio: "ignore" });
    proc.on("error", () => resolve(false));
    proc.on("exit", (code) => resolve(code === 0));
  });
}

export function resolveDockerImage(languageKey: string): string {
  const key = languageKey.toLowerCase();
  return LANGUAGE_IMAGES[key] ?? LANGUAGE_IMAGES.js!;
}

/**
 * Execute compiler toolchain inside isolated Docker sandbox container.
 * Never executes compilers on host OS.
 */
export async function compileInDocker(
  languageKey: string,
  compileCmd: string[],
  options: { folderPath: string; timeoutMs?: number; outputBinaryName: string }
): Promise<CompilationResult> {
  if (process.env.MOCK_DOCKER === "true") {
    const targetBinary = path.join(options.folderPath, options.outputBinaryName);
    if (!fs.existsSync(targetBinary)) {
      try { fs.writeFileSync(targetBinary, "#!/bin/sh\nexit 0\n"); } catch {}
    }
    return { success: true, executablePath: targetBinary };
  }

  const image = resolveDockerImage(languageKey);
  const hostPath = path.resolve(options.folderPath);
  const timeoutMs = options.timeoutMs || 15000;

  const dockerArgs = [
    "run",
    "--rm",
    "--network", "none",
    "--memory", "512m",
    "--memory-swap", "512m",
    "--cpus", "2",
    "--pids-limit", "64",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges:true",
    "--user", "1000:1000",
    "--ulimit", "fsize=20971520:20971520",
    "--ulimit", "nofile=64:64",
    "--ulimit", "nproc=64:64",
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
    "-v", `${hostPath}:/sandbox:rw`,
    "-w", "/sandbox",
    image,
    ...compileCmd,
  ];

  return new Promise((resolve) => {
    let stderr = "";
    let stdout = "";
    let isTimedOut = false;
    let hasResolved = false;

    let child: ReturnType<typeof spawn>;
    try {
      child = spawn("docker", dockerArgs, { stdio: ["ignore", "pipe", "pipe"] });
    } catch (e: any) {
      return resolve({ success: false, errorMessage: `Docker spawn error during compilation: ${e.message}` });
    }

    const timer = setTimeout(() => {
      if (hasResolved) return;
      hasResolved = true;
      isTimedOut = true;
      try {
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
        } else {
          child.kill("SIGKILL");
        }
      } catch {}
      resolve({ success: false, errorMessage: `Compilation Time Limit Exceeded (${timeoutMs}ms)` });
    }, timeoutMs);

    child.stdout?.on("data", (d) => { stdout += d.toString(); });
    child.stderr?.on("data", (d) => { stderr += d.toString(); });

    child.on("error", (err) => {
      clearTimeout(timer);
      if (!hasResolved) {
        hasResolved = true;
        resolve({ success: false, errorMessage: `Docker compilation process error: ${err.message}` });
      }
    });

    child.on("exit", (code) => {
      clearTimeout(timer);
      if (hasResolved) return;
      hasResolved = true;

      const expectedBinaryPath = path.join(options.folderPath, options.outputBinaryName);
      if (code === 0) {
        resolve({ success: true, executablePath: expectedBinaryPath });
      } else {
        const errorMsg = stderr.trim() || stdout.trim() || `Compiler exited with code ${code}`;
        resolve({ success: false, errorMessage: `Compilation Error:\n${errorMsg}` });
      }
    });
  });
}

/**
 * Execute program with strict container boundaries, dropped capabilities, no network, and resource quotas.
 */
export async function runInDocker(
  languageKey: string,
  cmd: string[],
  options: ExecutionOptions
): Promise<ExecutionResult> {
  const { inputData, expectedOutput = "", timeoutMs, memoryLimitMb, folderPath } = options;

  if (process.env.MOCK_DOCKER === "true") {
    return {
      passed: true,
      got: expectedOutput || "Mock Docker Output",
      expected: expectedOutput,
      runtime: 12,
      verdict: "AC"
    };
  }

  const image = resolveDockerImage(languageKey);
  const hostPath = path.resolve(folderPath);
  const memory = `${memoryLimitMb || 256}m`;

  const dockerArgs = [
    "run",
    "--rm",
    "--network", "none",
    "--memory", memory,
    "--memory-swap", memory,
    "--cpus", "1",
    "--pids-limit", "64",
    "--read-only",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges:true",
    "--user", "1000:1000",
    "--ulimit", "fsize=10485760:10485760", // 10MB max file size
    "--ulimit", "nofile=64:64",           // max 64 open file descriptors
    "--ulimit", "nproc=64:64",            // max 64 processes
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
    "-i",
    "-v", `${hostPath}:/sandbox:rw`,
    "-w", "/sandbox",
    image,
    ...cmd,
  ];

  return new Promise((resolve) => {
    const startTime = performance.now();
    let stdout = "";
    let stderr = "";
    let isTimedOut = false;
    let hasResolved = false;
    let child: ReturnType<typeof spawn>;

    try {
      child = spawn("docker", dockerArgs, { stdio: ["pipe", "pipe", "pipe"] });
    } catch (e: unknown) {
      return resolve({
        passed: false,
        got: "",
        expected: expectedOutput,
        runtime: 0,
        error: `Docker spawn error: ${e instanceof Error ? e.message : "unknown"}`,
      });
    }

    const maxOutputBytes = options.maxOutputBytes || 1024 * 1024; // 1MB stdout cap
    const maxStderrBytes = 1024 * 1024; // 1MB stderr cap
    let isOutputExceeded = false;
    let totalOutputBytes = 0;
    let totalStderrBytes = 0;

    const timer = setTimeout(() => {
      if (hasResolved) return;
      hasResolved = true;
      isTimedOut = true;
      try {
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
        } else {
          child.kill("SIGKILL");
        }
      } catch {}

      resolve({
        passed: false,
        got: "",
        expected: expectedOutput,
        runtime: timeoutMs,
        verdict: "TLE",
        isTLE: true,
        error: "Time Limit Exceeded (TLE)",
      });
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer | string) => {
      const chunkBytes = Buffer.isBuffer(chunk) ? chunk.byteLength : Buffer.byteLength(chunk, "utf8");
      if (totalOutputBytes + chunkBytes > maxOutputBytes) {
        isOutputExceeded = true;
        const allowedBytes = Math.max(0, maxOutputBytes - totalOutputBytes);
        stdout += (Buffer.isBuffer(chunk) ? chunk.toString("utf8") : chunk).slice(0, allowedBytes);
        totalOutputBytes = maxOutputBytes;
        try {
          if (process.platform === "win32") {
            spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
          } else {
            child.kill("SIGKILL");
          }
        } catch {}
      } else {
        totalOutputBytes += chunkBytes;
        stdout += chunk.toString();
      }
    });

    child.stderr?.on("data", (chunk: Buffer | string) => {
      const chunkBytes = Buffer.isBuffer(chunk) ? chunk.byteLength : Buffer.byteLength(chunk, "utf8");
      if (totalStderrBytes + chunkBytes > maxStderrBytes) {
        isOutputExceeded = true;
        const allowedBytes = Math.max(0, maxStderrBytes - totalStderrBytes);
        stderr += (Buffer.isBuffer(chunk) ? chunk.toString("utf8") : chunk).slice(0, allowedBytes);
        totalStderrBytes = maxStderrBytes;
        try {
          if (process.platform === "win32") {
            spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
          } else {
            child.kill("SIGKILL");
          }
        } catch {}
      } else {
        totalStderrBytes += chunkBytes;
        stderr += chunk.toString();
      }
    });

    try {
      child.stdin?.write(inputData);
      child.stdin?.end();
    } catch {}

    child.on("error", (err) => {
      clearTimeout(timer);
      if (hasResolved) return;
      hasResolved = true;
      resolve({
        passed: false,
        got: "",
        expected: expectedOutput,
        runtime: 0,
        error: `Docker error: ${err.message}`,
      });
    });

    child.on("exit", (code) => {
      clearTimeout(timer);
      if (hasResolved) return;
      hasResolved = true;
      const runtime = Math.max(1, Math.round((performance.now() - startTime) * 100) / 100);

      if (isTimedOut) {
        resolve({
          passed: false,
          got: "",
          expected: expectedOutput,
          runtime: timeoutMs,
          verdict: "TLE",
          isTLE: true,
          error: "Time Limit Exceeded (TLE)",
        });
        return;
      }

      if (isOutputExceeded) {
        resolve({
          passed: false,
          got: stdout.trim(),
          expected: expectedOutput,
          runtime,
          verdict: "OLE",
          isOLE: true,
          error: "Output Limit Exceeded (OLE) — standard output or error stream exceeded 1MB quota",
        });
        return;
      }

      if (code !== 0) {
        resolve({
          passed: false,
          got: stdout.trim(),
          expected: expectedOutput,
          runtime,
          verdict: "RE",
          error: `Runtime Error (code ${code}): ${stderr.trim() || stdout.trim()}`,
        });
        return;
      }

      const got = stdout.trim();
      const exp = expectedOutput.trim();
      const passed = exp ? got === exp : true;
      resolve({
        passed,
        got,
        expected: exp,
        verdict: passed ? "AC" : "WA",
        runtime,
      });
    });
  });
}
