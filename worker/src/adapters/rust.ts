// worker/src/adapters/rust.ts
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult } from "./types";
import { runProcessSafely, getSanitizedEnv } from "./base";
import { shouldUseDockerSandbox } from "../sandbox";
import { compileInDocker, runInDocker } from "../sandbox/dockerRunner";

export class RustAdapter implements ILanguageAdapter {
    readonly key = "rust" as const;
    readonly displayName = "Rust";
    readonly fileExtension = "rs";
    readonly defaultTimeoutMs = 5000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        const exeName = process.platform === "win32" ? "solution.exe" : "solution";
        const exePath = path.join(folderPath, exeName);

        if (await shouldUseDockerSandbox()) {
            return compileInDocker("rust", [
                "rustc",
                "-O",
                "main.rs",
                "-o",
                "solution"
            ], { folderPath, outputBinaryName: "solution", timeoutMs: 15000 });
        }

        const isProd = process.env.NODE_ENV === "production";
        const isStrict = process.env.STRICT_SANDBOX === "true" || process.env.REQUIRE_DOCKER === "true";
        const allowProcess = process.env.ALLOW_PROCESS_SANDBOX === "true" || (process.env.NODE_ENV === "test" && process.env.STRICT_SANDBOX !== "true");

        if ((isProd || isStrict) && !allowProcess) {
            return {
                success: false,
                errorMessage: "Security Violation: Host compiler execution is strictly prohibited. Docker sandbox required."
            };
        }

        return new Promise((resolve) => {
            let stderr = "";
            try {
                const child = spawn("rustc", ["-O", sourceFilePath, "-o", exePath], {
                    cwd: folderPath,
                    env: getSanitizedEnv()
                });

                child.stderr?.on("data", (d) => { stderr += d.toString(); });
                child.on("error", (err) => resolve({ success: false, errorMessage: `rustc not found: ${err.message}` }));
                child.on("exit", (code) => {
                    if (code === 0 && fs.existsSync(exePath)) {
                        resolve({ success: true, executablePath: exePath });
                    } else {
                        resolve({ success: false, errorMessage: `Rust compilation failed:\n${stderr.trim()}` });
                    }
                });
            } catch (e: any) {
                resolve({ success: false, errorMessage: `Compiler spawn exception: ${e.message}` });
            }
        });
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const sourceFilePath = path.join(options.folderPath, `main.${this.fileExtension}`);
        fs.writeFileSync(sourceFilePath, options.codeWithDriver, "utf-8");

        const comp = await this.compile(options.folderPath, sourceFilePath);
        if (!comp.success || !comp.executablePath) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                verdict: "CE",
                error: comp.errorMessage || "Compilation error"
            };
        }

        if (await shouldUseDockerSandbox()) {
            return runInDocker("rust", ["./solution"], { ...options, languageKey: "rust" });
        }

        return runProcessSafely(comp.executablePath, [], {
            ...options,
            languageKey: "rust"
        });
    }
}
