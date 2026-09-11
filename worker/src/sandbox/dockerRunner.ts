// worker/src/sandbox/dockerRunner.ts
import { spawn } from "child_process";
import path from "path";
import type { ExecutionOptions, ExecutionResult } from "../adapters/types";

const LANGUAGE_IMAGES: Record<string, string> = {
  js: "node:20-alpine",
  ts: "node:20-alpine",
  py: "python:3.12-alpine",
  cpp: "gcc:14",
  java: "eclipse-temurin:21-jdk-alpine",
  go: "golang:1.22-alpine",
};

export function isDockerSandboxEnabled(): boolean {
  return process.env.SANDBOX_MODE === "docker" || process.env.DOCKER_SANDBOX === "true";
}

export async function isDockerAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("docker", ["info"], { stdio: "ignore" });
    proc.on("error", () => resolve(false));
    proc.on("exit", (code) => resolve(code === 0));
  });
}

function resolveImage(languageKey: string): string {
  const key = languageKey.toLowerCase();
  return LANGUAGE_IMAGES[key] ?? LANGUAGE_IMAGES.js!;
}

export async function runInDocker(
  languageKey: string,
  cmd: string[],
  options: ExecutionOptions
): Promise<ExecutionResult> {
  const { inputData, expectedOutput = "", timeoutMs, memoryLimitMb, folderPath } = options;
  const image = resolveImage(languageKey);
  const hostPath = path.resolve(folderPath);
  const memory = `${memoryLimitMb}m`;

  const dockerArgs = [
    "run",
    "--rm",
    "--network", "none",
    "--memory", memory,
    "--memory-swap", memory,
    "--cpus", "1",
    "--pids-limit", "64",
    "--read-only",
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

    const timer = setTimeout(() => {
      isTimedOut = true;
      try { child.kill(); } catch {}
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });

    try {
      child.stdin?.write(inputData);
      child.stdin?.end();
    } catch {}

    child.on("error", (err) => {
      clearTimeout(timer);
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
      const runtime = Math.max(1, Math.round((performance.now() - startTime) * 100) / 100);

      if (isTimedOut) {
        resolve({
          passed: false,
          got: "",
          expected: expectedOutput,
          runtime: timeoutMs,
          isTLE: true,
          error: "Time Limit Exceeded (TLE)",
        });
        return;
      }

      if (code !== 0) {
        resolve({
          passed: false,
          got: stdout.trim(),
          expected: expectedOutput,
          runtime,
          error: `Runtime Error (code ${code}): ${stderr.trim() || stdout.trim()}`,
        });
        return;
      }

      const got = stdout.trim();
      const exp = expectedOutput.trim();
      resolve({
        passed: exp ? got === exp : true,
        got,
        expected: exp,
        runtime,
      });
    });
  });
}
