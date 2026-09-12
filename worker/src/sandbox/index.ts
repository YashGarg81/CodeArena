// worker/src/sandbox/index.ts
export { isDockerSandboxEnabled, isDockerAvailable, runInDocker, compileInDocker } from "./dockerRunner";
export { isFirecrackerAvailable, runInFirecrackerMicroVM } from "./firecrackerRunner";

export interface SandboxPolicy {
  mode: "firecracker" | "docker" | "process";
  strictMode: boolean;
  resourceLimits: {
    maxMemoryMb: number;
    maxTimeoutMs: number;
    maxPids: number;
    cpuQuota: number;
  };
  isolation: {
    networkIsolated: boolean;
    readOnlyRootfs: boolean;
    dropCapabilities: boolean;
    tmpfsCapMb: number;
  };
}

let cachedDockerAvailable: boolean | null = null;
let cachedFirecrackerAvailable: boolean | null = null;

/**
 * Validates whether the Docker sandbox is currently accessible.
 */
export async function shouldUseDockerSandbox(): Promise<boolean> {
  const mode = getSandboxMode();
  if (mode === "process") return false;

  if (cachedDockerAvailable === null) {
    const { isDockerAvailable, isDockerSandboxEnabled } = await import("./dockerRunner");
    cachedDockerAvailable = isDockerSandboxEnabled() && (await isDockerAvailable());
  }
  return cachedDockerAvailable;
}

/**
 * Returns the currently active execution sandbox engine mode.
 * Defaults to secure "docker" container mode for verified production isolation.
 */
export function getSandboxMode(): "firecracker" | "docker" | "process" {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd && process.env.SANDBOX_MODE === "process" && process.env.ALLOW_PROCESS_SANDBOX === "true") {
    return "process";
  }
  if (process.env.SANDBOX_MODE === "firecracker") {
    return "firecracker";
  }
  return "docker";
}

/**
 * Returns the active production sandbox security policy.
 */
export function getSandboxPolicy(): SandboxPolicy {
  const mode = getSandboxMode();
  const isProd = process.env.NODE_ENV === "production";
  const strictMode = process.env.STRICT_SANDBOX === "true" || process.env.REQUIRE_DOCKER === "true" || (isProd && process.env.ALLOW_PROCESS_SANDBOX !== "true");

  return {
    mode,
    strictMode,
    resourceLimits: {
      maxMemoryMb: Number(process.env.MAX_SANDBOX_MEMORY_MB) || 256,
      maxTimeoutMs: Number(process.env.MAX_SANDBOX_TIMEOUT_MS) || 10000,
      maxPids: Number(process.env.MAX_SANDBOX_PIDS) || 64,
      cpuQuota: Number(process.env.MAX_SANDBOX_CPUS) || 1
    },
    isolation: {
      networkIsolated: true,
      readOnlyRootfs: true,
      dropCapabilities: true,
      tmpfsCapMb: 64
    }
  };
}

/**
 * Production Fail-Closed Sandbox Validator:
 * In production or strict mode, rejects unisolated in-process execution with a fail-closed policy.
 */
export async function validateSandboxSafety(overrideMode?: "firecracker" | "docker" | "process"): Promise<{ safe: boolean; reason?: string; policy?: SandboxPolicy }> {
  const policy = getSandboxPolicy();
  const mode = overrideMode || policy.mode;

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && mode === "process" && process.env.ALLOW_PROCESS_SANDBOX !== "true") {
    return {
      safe: false,
      reason: "Production Security Policy Violation: Process sandbox is unsafe for production environments. Container isolation (Docker) required.",
      policy
    };
  }

  if (policy.strictMode || isProd) {
    if (mode === "firecracker") {
      const { isFirecrackerAvailable } = await import("./firecrackerRunner");
      const available = await isFirecrackerAvailable();
      if (!available) {
        return {
          safe: false,
          reason: "Production Security Policy: Hardware virtualization (Firecracker/KVM) is required but unavailable. Execution failed closed.",
          policy
        };
      }
      return { safe: true, policy };
    }

    if (mode === "docker") {
      const { isDockerAvailable } = await import("./dockerRunner");
      const dockerOk = await isDockerAvailable();
      if (!dockerOk) {
        return {
          safe: false,
          reason: "Strict sandbox mode: Docker container isolation is required but unavailable.",
          policy
        };
      }
    }
  }

  return { safe: true, policy };
}
