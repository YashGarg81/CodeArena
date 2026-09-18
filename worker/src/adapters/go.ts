// worker/src/adapters/go.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult, SupportedLanguage } from "./types";
import { runProcessSafely, getSanitizedEnv } from "./base";
import { shouldUseDockerSandbox } from "../sandbox";
import { compileInDocker, runInDocker } from "../sandbox/dockerRunner";

export class GoAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage = "go";
    readonly displayName = "Go (Golang)";
    readonly fileExtension = ".go";
    readonly defaultTimeoutMs = 3000;
    readonly defaultMemoryLimitMb = 256;

    // Compiled (was: `go run` inside the timed run phase, which billed the
    // ~30s cold toolchain build against the 3s execution limit). Now the
    // build happens in the compile phase (60s budget, persistent GOCACHE
    // volume → ~1s steady-state) and only the binary runs under the limit.
    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        const outBinary = path.join(folderPath, "solution");

        if (await shouldUseDockerSandbox()) {
            return compileInDocker("go", [
                "go",
                "build",
                "-o",
                "solution",
                "main.go"
            ], { folderPath, outputBinaryName: "solution", timeoutMs: 60000 });
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
                const child = spawn("go", ["build", "-o", outBinary, sourceFilePath], {
                    cwd: folderPath,
                    env: getSanitizedEnv()
                });

                child.stderr?.on("data", (chunk: any) => {
                    stderr += chunk.toString();
                });

                child.on("error", (err: any) => {
                    resolve({
                        success: false,
                        errorMessage: `go compiler error: ${err.message}`
                    });
                });

                child.on("exit", (code: number) => {
                    if (code === 0) {
                        resolve({
                            success: true,
                            executablePath: outBinary
                        });
                    } else {
                        resolve({
                            success: false,
                            errorMessage: `Compilation Error: ${stderr.trim() || `Compiler exited with code ${code}`}`
                        });
                    }
                });
            } catch (e: any) {
                resolve({
                    success: false,
                    errorMessage: `Compiler spawn exception: ${e.message}`
                });
            }
        });
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        // User submissions are bare functions and drivers provide `import` + `func main()`
        // but no package clause — normalize so `go build` compiles a valid `package main`.
        let source = options.codeWithDriver || "";
        if (!/^\s*package\s+main\b/m.test(source)) {
            source = "package main\n\n" + source;
        }

        const sourcePath = path.join(options.folderPath, `main${this.fileExtension}`);
        fs.writeFileSync(sourcePath, source);

        const compilation = await this.compile(options.folderPath, sourcePath);
        if (!compilation.success || !compilation.executablePath) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                verdict: "CE",
                error: compilation.errorMessage || "Go Compilation Failed"
            };
        }

        if (await shouldUseDockerSandbox()) {
            return runInDocker("go", ["./solution"], { ...options, languageKey: this.key });
        }

        return runProcessSafely(compilation.executablePath, [], { ...options, languageKey: this.key });
    }
}
