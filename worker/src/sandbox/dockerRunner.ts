// worker/src/sandbox/dockerRunner.ts
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import type { ExecutionOptions, ExecutionResult, CompilationResult } from "../adapters/types";

export const LANGUAGE_IMAGES: Record<string, string> = {
  js: "oven/bun:1-alpine",
  ts: "oven/bun:1-alpine",
  javascript: "oven/bun:1-alpine",
  typescript: "oven/bun:1-alpine",
  py: "python:3.12-alpine",
  python: "python:3.12-alpine",
  python3: "python:3.12-alpine",
  cpp: "gcc:14",
  "c++": "gcc:14",
  c: "gcc:14",
  java: "eclipse-temurin:21-jdk-alpine",
  go: "golang:1.22-alpine",
  golang: "golang:1.22-alpine",
  rust: "rust:1.77-alpine",
  rs: "rust:1.77-alpine",
  cs: "mono:latest",
  csharp: "mono:latest",
  "c#": "mono:latest",
  kt: "zenika/kotlin:1.4.20",
  kotlin: "zenika/kotlin:1.4.20",
  php: "php:8.3-cli-alpine",
  ruby: "ruby:3.3-alpine",
  swift: "swift:5.9",
  scala: "hseeberger/scala-sbt:eclipse-temurin-17.0.2_1.6.2_3.1.1",
  dart: "dart:stable",
  r: "r-base:4.4.1",
  rscript: "r-base:4.4.1",
  perl: "perl:5.40",
  pl: "perl:5.40",
  bash: "bash:5.2",
  sh: "bash:5.2",
  shell: "bash:5.2",
  hs: "haskell:9.6",
  haskell: "haskell:9.6",
  ex: "elixir:1.17",
  elixir: "elixir:1.17",
  erlang: "erlang:27",
  erl: "erlang:27",
  clj: "clojure:tools-deps",
  clojure: "clojure:tools-deps",
  groovy: "groovy:4.0-jdk21",
  jl: "julia:1.10",
  julia: "julia:1.10",
  nim: "nimlang/nim:2.0.8-alpine",
};

interface SandboxOverride {
  volumes?: string[];
  env?: Record<string, string>;
  dropEnv?: string[];
  pidsLimit?: string;
}

// Per-language sandbox tuning. Rationale is measured, not guessed:
// - Go: cold `go run` took ~30s (serialized `-p=1` build into a 64MB tmpfs
//   cache, fresh every container). A persistent content-addressed GOCACHE
//   volume makes steady-state builds ~1s; pids 256 replaces the `-p=1`
//   serialization that caused the fork storm under pids-limit 64.
const LANGUAGE_SANDBOX_OVERRIDES: Record<string, SandboxOverride> = {
  go: {
    volumes: ["codearena-gocache:/gocache"],
    env: { GOCACHE: "/gocache" },
    dropEnv: ["GOFLAGS"],
    pidsLimit: "256",
  },
};

function overrideFor(languageKey: string): SandboxOverride {
  return LANGUAGE_SANDBOX_OVERRIDES[languageKey.toLowerCase()] ?? {};
}

function buildEnvFlags(languageKey: string): string[] {
  const override = overrideFor(languageKey);
  const drop = new Set(override.dropEnv ?? []);
  const merged = new Map<string, string>();
  for (let i = 0; i + 1 < SANDBOX_ENV_FLAGS.length; i += 2) {
    if (SANDBOX_ENV_FLAGS[i] !== "-e") continue;
    const value = SANDBOX_ENV_FLAGS[i + 1] ?? "";
    const eq = value.indexOf("=");
    const name = eq === -1 ? value : value.slice(0, eq);
    if (!drop.has(name)) merged.set(name, value);
  }
  for (const [k, v] of Object.entries(override.env ?? {})) merged.set(k, `${k}=${v}`);
  const out: string[] = [];
  for (const v of merged.values()) out.push("-e", v);
  return out;
}

function buildVolumeFlags(languageKey: string): string[] {
  const out: string[] = [];
  for (const v of overrideFor(languageKey).volumes ?? []) out.push("-v", v);
  return out;
}

// Named volumes are root-owned on creation, but containers run as 1000:1000.
// One-time best-effort chown so cache writes don't fail with permission denied.
let goCacheInit: Promise<void> | null = null;
export function ensureLanguageVolumes(languageKey: string): Promise<void> {
  if ((overrideFor(languageKey).volumes ?? []).length === 0) return Promise.resolve();
  if (!goCacheInit) {
    goCacheInit = (async () => {
      try {
        const image = resolveDockerImage(languageKey);
        await new Promise<void>((resolve) => {
          const child = spawn("docker", ["run", "--rm", "-v", "codearena-gocache:/gocache", image, "chown", "1000:1000", "/gocache"], { stdio: "ignore" });
          child.on("error", () => resolve());
          child.on("exit", () => resolve());
        });
      } catch {}
      // Fire-and-forget: pruning must never block judging. Runs once per
      // worker lifetime, right after the cache becomes writable.
      maybePruneGoCacheVolume().catch(() => {});
    })();
  }
  return goCacheInit;
}

export function goCacheMaxBytes(): number {
  const mb = Number(process.env.GOCACHE_MAX_MB ?? 2048);
  return (Number.isFinite(mb) && mb > 0 ? mb : 2048) * 1024 * 1024;
}

export function shouldPruneCache(usedBytes: number, maxBytes: number = goCacheMaxBytes()): boolean {
  return usedBytes > maxBytes;
}

async function runCacheTool(args: string[], timeoutMs = 30000): Promise<string | null> {
  return new Promise((resolve) => {
    let out = "";
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
    } catch {
      return resolve(null);
    }
    const timer = setTimeout(() => {
      try { child.kill("SIGKILL"); } catch {}
      resolve(null);
    }, timeoutMs);
    child.stdout?.on("data", (d) => { out += d.toString(); });
    child.on("error", () => { clearTimeout(timer); resolve(null); });
    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve(code === 0 ? out : null);
    });
  });
}

export async function goCacheUsageBytes(): Promise<number | null> {
  const out = await runCacheTool([
    "run", "--rm", "-v", "codearena-gocache:/gocache",
    resolveDockerImage("go"), "du", "-sb", "/gocache",
  ]);
  if (!out) return null;
  const n = parseInt(out.trim().split(/\s+/)[0] ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Prunes the shared Go build cache when it exceeds GOCACHE_MAX_MB
 * (default 2048). `go clean -cache` only drops build artifacts keyed by
 * content hash — it cannot poison other submissions, it just makes the next
 * build cold (~20s, inside the 60s compile budget).
 */
export async function maybePruneGoCacheVolume(): Promise<{ pruned: boolean; usedBytes: number | null; usedMb?: number; maxMb?: number }> {
  const used = await goCacheUsageBytes();
  const maxBytes = goCacheMaxBytes();
  const maxMb = Math.round(maxBytes / 1024 / 1024);
  if (used === null) {
    return { pruned: false, usedBytes: null, usedMb: undefined, maxMb };
  }
  const usedMb = Math.round(used / 1024 / 1024);
  if (!shouldPruneCache(used, maxBytes)) {
    return { pruned: false, usedBytes: used, usedMb, maxMb };
  }
  console.log(`[GOCACHE] Pruning: ${usedMb}MB exceeds limit of ${maxMb}MB`);
  const cleaned = await runCacheTool(
    [
      "run", "--rm", "--user", "1000:1000",
      "-e", "HOME=/tmp", "-e", "GOCACHE=/gocache",
      "-v", "codearena-gocache:/gocache",
      resolveDockerImage("go"), "go", "clean", "-cache",
    ],
    120000
  );
  const pruned = cleaned !== null;
  if (pruned) {
    const after = await goCacheUsageBytes();
    const afterMb = after !== null ? Math.round(after / 1024 / 1024) : "unknown";
    console.log(`[GOCACHE] Pruned: ${usedMb}MB -> ${afterMb}MB`);
  } else {
    console.warn(`[GOCACHE] Pruning attempted but failed`);
  }
  return { pruned, usedBytes: used, usedMb, maxMb };
}

// Compiler runtimes (Go, .NET, Kotlin, etc.) write caches to the container user's home
// directory by default. Containers run as uid 1000 with a writable /tmp tmpfs (noexec),
// so redirect caches into /tmp to avoid permission errors. /tmp stays noexec so untrusted
// programs cannot drop+execute payloads there. These flags are applied to both compile
// and run phases so toolchain daemons and cache writes never touch host state.
const SANDBOX_ENV_FLAGS = [
  "-e", "HOME=/tmp",
  "-e", "XDG_CACHE_HOME=/tmp/.cache",
  "-e", "GOCACHE=/tmp/.gocache",
  "-e", "GOPATH=/tmp/.gopath",
  "-e", "GOMODCACHE=/tmp/.gopath/pkg/mod",
  "-e", "DOTNET_CLI_TELEMETRY_OPTOUT=1",
  "-e", "DOTNET_NOLOGO=1",
  "-e", "NUGET_PACKAGES=/tmp/.nuget/packages",
  // Go: `go run` forks a compiler process per package in parallel, which trips the
  // pids-limit; `-p=1` serializes the build without altering the program's runtime
  // scheduler. `GOTMPDIR` must be on an executable mount because /tmp is noexec.
  "-e", "GOFLAGS=-p=1",
  "-e", "GOTMPDIR=/sandbox",
];

// Sandbox docker binary is not guaranteed to be on PATH (e.g. Docker Desktop on Windows
// installs the CLI under its own resources\\bin directory). Locate it explicitly.
function ensureDockerBinaryOnPath(): void {
  if (process.env.DOCKER_BIN) {
    const dir = process.env.DOCKER_BIN;
    if (!(process.env.PATH ?? "").split(path.delimiter).includes(dir)) {
      process.env.PATH = dir + path.delimiter + (process.env.PATH ?? "");
    }
    return;
  }
  if (process.platform !== "win32" || process.env.CI) return;
  const candidates = [
    "C:\\Program Files\\Docker\\Docker\\resources\\bin",
  ];
  for (const dir of candidates) {
    const exe = path.join(dir, "docker.exe");
    if (fs.existsSync(exe) && !(process.env.PATH ?? "").split(path.delimiter).includes(dir)) {
      process.env.PATH = dir + path.delimiter + (process.env.PATH ?? "");
      return;
    }
  }
}
ensureDockerBinaryOnPath();

export function isDockerSandboxEnabled(): boolean {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return true;
  // Raw host process execution is strictly prohibited unless ALLOW_PROCESS_SANDBOX="true" is explicitly supplied
  if (process.env.SANDBOX_MODE === "process" && process.env.ALLOW_PROCESS_SANDBOX === "true") {
    return false;
  }
  return true;
}

export async function isDockerAvailable(): Promise<boolean> {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd && process.env.MOCK_DOCKER === "true") return true;
  if (process.env.MOCK_DOCKER === "false") return false;
  // Fail closed on mock injection: any MOCK_DOCKER flag must poison
  // availability in production, even when a real daemon is reachable.
  // Otherwise a mock flag could mask as healthy capacity.
  if (isProd && process.env.MOCK_DOCKER !== undefined) return false;
  return new Promise((resolve) => {
    const proc = spawn("docker", ["info"], { stdio: "ignore" });
    proc.on("error", () => resolve(false));
    proc.on("exit", (code) => resolve(code === 0));
  });
}

export function resolveDockerImage(languageKey: string): string {
  const key = languageKey.toLowerCase();
  const image = LANGUAGE_IMAGES[key];
  if (!image) {
    throw new Error(`Unsupported language '${languageKey}': no sandbox image is configured`);
  }
  return image;
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
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && process.env.MOCK_DOCKER === "true") {
    throw new Error("Security Violation: MOCK_DOCKER is strictly prohibited in production. Real Docker daemon is required.");
  }
  if (!isProd && process.env.MOCK_DOCKER === "true") {
    const targetBinary = path.join(options.folderPath, options.outputBinaryName);
    if (!fs.existsSync(targetBinary)) {
      try { fs.writeFileSync(targetBinary, "#!/bin/sh\nexit 0\n"); } catch {}
    }
    return { success: true, executablePath: targetBinary };
  }

  const image = resolveDockerImage(languageKey);
  // Translate container path to host path for Docker volume mount
  const containerScratchBase = "/app/worker/scratch";
  const hostScratchBase = process.env.WORKER_SCRATCH_HOST_PATH || containerScratchBase;
  let hostPath: string;
  if (options.folderPath.startsWith(containerScratchBase)) {
    const relativePath = options.folderPath.slice(containerScratchBase.length);
    hostPath = path.join(hostScratchBase, relativePath);
  } else {
    hostPath = path.resolve(options.folderPath);
  }
  const timeoutMs = options.timeoutMs || 15000;

  try {
    fs.chmodSync(hostPath, 0o777);
    if (fs.existsSync(hostPath) && fs.statSync(hostPath).isDirectory()) {
      for (const f of fs.readdirSync(hostPath)) {
        try { fs.chmodSync(path.join(hostPath, f), 0o666); } catch {}
      }
    }
  } catch {}

  await ensureLanguageVolumes(languageKey);

  const dockerArgs = [
    "run",
    "--rm",
    "--network", "none",
    "--memory", "512m",
    "--memory-swap", "512m",
    "--cpus", "2",
    "--pids-limit", overrideFor(languageKey).pidsLimit ?? "64",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges:true",
    "--user", "1000:1000",
    "--ulimit", "fsize=20971520:20971520",
    "--ulimit", "nofile=65536:65536",
    "--ulimit", "nproc=4096:4096",
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
    ...buildEnvFlags(languageKey),
    ...buildVolumeFlags(languageKey),
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

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && process.env.MOCK_DOCKER === "true") {
    return {
      passed: false,
      got: "",
      expected: expectedOutput,
      runtime: 0,
      verdict: "RE",
      error: "Security Violation: MOCK_DOCKER is strictly prohibited in production. Real Docker daemon is required."
    };
  }

  if (!isProd && process.env.MOCK_DOCKER === "true") {
    return {
      passed: true,
      got: expectedOutput || "Mock Docker Output",
      expected: expectedOutput,
      runtime: 12,
      verdict: "AC"
    };
  }

  const image = resolveDockerImage(languageKey);
  // Translate container path to host path for Docker volume mount
  // When worker runs in container with bind mount, folderPath is container path (e.g., /app/worker/scratch/code_xxx)
  // Host path is WORKER_SCRATCH_HOST_PATH (e.g., /host/path/worker-scratch)
  const containerScratchBase = "/app/worker/scratch";
  const hostScratchBase = process.env.WORKER_SCRATCH_HOST_PATH || containerScratchBase;
  let hostPath: string;
  if (folderPath.startsWith(containerScratchBase)) {
    const relativePath = folderPath.slice(containerScratchBase.length);
    hostPath = path.join(hostScratchBase, relativePath);
  } else {
    hostPath = path.resolve(folderPath);
  }
  const memory = `${memoryLimitMb || 256}m`;

  try {
    fs.chmodSync(hostPath, 0o777);
    if (fs.existsSync(hostPath) && fs.statSync(hostPath).isDirectory()) {
      for (const f of fs.readdirSync(hostPath)) {
        try { fs.chmodSync(path.join(hostPath, f), 0o666); } catch {}
      }
    }
  } catch {}

  await ensureLanguageVolumes(languageKey);

  const dockerArgs = [
    "run",
    "--rm",
    "--network", "none",
    "--memory", memory,
    "--memory-swap", memory,
    "--cpus", "1",
    "--pids-limit", overrideFor(languageKey).pidsLimit ?? "64",
    "--read-only",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges:true",
    "--user", "1000:1000",
    "--ulimit", "fsize=268435456:268435456", // 256MB max file size (Go build archives exceed 10MB)
    "--ulimit", "nofile=4096:4096",       // max 4096 open file descriptors
    "--ulimit", "nproc=4096:4096",        // max 4096 processes
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
    ...buildEnvFlags(languageKey),
    ...buildVolumeFlags(languageKey),
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
