// worker/src/adapters/base.ts
import { spawn } from "child_process";
import type { ExecutionOptions, ExecutionResult } from "./types";
import { shouldUseDockerSandbox } from "../sandbox";
import { runInDocker } from "../sandbox/dockerRunner";

export const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024; // 64KB output cap

/**
 * Assemble user code + runner driver into a valid, compilable source file for a
 * given language.
 *
 * - Go: the driver provides `import` + `func main()` but no `package` clause, and
 *   user submissions are bare functions — prepend `package main` so `go run`/`go build`
 *   works in both the backend (sync) and worker (async) judge paths.
 * - Java: submissions are method bodies; wrap them in `class Solution` (the driver
 *   instantiates `new Solution()`), then append the `class Driver` harness.
 * - C/C++: the driver supplies the `#include`s, so it must come before user code.
 * - Everything else: user functions first, driver after (js/py convention).
 */
export function buildCodeWithDriver(language: string, code: string, driverCode: string): string {
    const lang = (language || "").toLowerCase();
    if (!driverCode) return code;

    if (lang === "go") {
        const src = driverCode + "\n" + code;
        return /^\s*package\s+main\b/m.test(src) ? src : "package main\n\n" + src;
    }
    if (lang === "java") {
        return `class Solution {\n${code}\n}\n${driverCode}`;
    }
    if (lang === "cpp" || lang === "c++" || lang === "c") {
        return driverCode + "\n" + code;
    }
    return code + driverCode;
}

/**
 * Returns a sanitized environment map containing only essential OS variables,
 * strictly stripping application secrets, database URLs, and auth tokens.
 */
export function getSanitizedEnv(): Record<string, string> {
    const cleanEnv: Record<string, string> = {
        PATH: process.env.PATH || "",
        SYSTEMROOT: process.env.SYSTEMROOT || "",
        HOMEPATH: process.env.HOMEPATH || "",
        TEMP: process.env.TEMP || "",
        TMP: process.env.TMP || "",
        LANG: "en_US.UTF-8",
        NODE_ENV: "production"
    };
    return cleanEnv;
}

/**
 * Executes a process with time limits, output quotas, and fail-closed sandbox isolation.
 */
export async function runProcessSafely(
    cmd: string,
    args: string[],
    options: ExecutionOptions,
    customEnv?: Record<string, string>
): Promise<ExecutionResult> {
    const { inputData, expectedOutput = "", timeoutMs, maxOutputBytes = DEFAULT_MAX_OUTPUT_BYTES, languageKey } = options;

    if (languageKey && (await shouldUseDockerSandbox())) {
        return runInDocker(languageKey, [cmd, ...args], options);
    }

    const isProd = process.env.NODE_ENV === "production";
    const isStrict = process.env.STRICT_SANDBOX === "true" || process.env.REQUIRE_DOCKER === "true";
    const allowProcess = !isProd && (process.env.ALLOW_PROCESS_SANDBOX !== "false" || (process.env.NODE_ENV === "test" && process.env.STRICT_SANDBOX !== "true"));

    if (isProd || isStrict || !allowProcess) {
        return {
            passed: false,
            got: "",
            expected: expectedOutput,
            runtime: 0,
            verdict: "RE",
            error: "Security Violation: Host process execution is strictly prohibited in production or strict mode. Docker container isolation is required."
        };
    }

    return new Promise((resolve) => {
        const startTime = performance.now();
        let isTimedOut = false;
        let isBufferExceeded = false;
        let child: any;
        let hasResolved = false;

        const env = customEnv || getSanitizedEnv();

        try {
            child = spawn(cmd, args, {
                cwd: options.folderPath,
                env,
                stdio: ["pipe", "pipe", "pipe"]
            });
        } catch (e: any) {
            return resolve({
                passed: false,
                got: "",
                expected: expectedOutput,
                runtime: 0,
                error: `Process spawn error: ${e.message}`
            });
        }

        let stdout = "";
        let stderr = "";

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
                error: "Time Limit Exceeded (TLE)"
            });
        }, timeoutMs);

        child.on("error", (err: any) => {
            clearTimeout(timer);
            if (!hasResolved) {
                hasResolved = true;
                resolve({
                    passed: false,
                    got: "",
                    expected: expectedOutput,
                    runtime: 0,
                    error: `Process error: ${err.message}`
                });
            }
        });

        if (child.stdout) {
            child.stdout.on("data", (chunk: any) => {
                if (stdout.length + chunk.length > maxOutputBytes) {
                    isBufferExceeded = true;
                    stdout += chunk.toString().slice(0, maxOutputBytes - stdout.length);
                    try { child.kill(); } catch {}
                } else {
                    stdout += chunk.toString();
                }
            });
        }

        if (child.stderr) {
            child.stderr.on("data", (chunk: any) => {
                if (stderr.length < maxOutputBytes) {
                    stderr += chunk.toString();
                }
            });
        }

        if (child.stdin) {
            try {
                child.stdin.write(inputData);
                child.stdin.end();
            } catch {}
        }

        child.on("exit", (code: number) => {
            clearTimeout(timer);
            if (hasResolved) return;
            hasResolved = true;
            
            const endTime = performance.now();
            const runtime = Math.max(1, Math.round((endTime - startTime) * 100) / 100);

            if (isTimedOut) {
                resolve({
                    passed: false,
                    got: "",
                    expected: expectedOutput,
                    runtime: timeoutMs,
                    verdict: "TLE",
                    isTLE: true,
                    error: "Time Limit Exceeded (TLE)"
                });
            } else if (isBufferExceeded) {
                resolve({
                    passed: false,
                    got: stdout.trim(),
                    expected: expectedOutput,
                    runtime,
                    verdict: "OLE",
                    isOLE: true,
                    error: "Output Limit Exceeded (OLE) — standard output exceeded 64KB quota"
                });
            } else if (code !== 0 && code !== null) {
                resolve({
                    passed: false,
                    got: stdout.trim(),
                    expected: expectedOutput,
                    runtime,
                    verdict: "RE",
                    error: `Runtime Error (code ${code}): ${stderr.trim() || stdout.trim()}`
                });
            } else {
                const got = stdout.trim();
                const exp = expectedOutput === undefined ? undefined : expectedOutput.trim();
                const passed = exp === undefined ? true : got === exp;
                resolve({
                    passed,
                    got,
                    expected: exp ?? "",
                    verdict: passed ? "AC" : "WA",
                    runtime
                });
            }
        });
    });
}
