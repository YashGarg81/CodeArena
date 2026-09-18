// worker/src/adapters/java.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult, SupportedLanguage } from "./types";
import { runProcessSafely, getSanitizedEnv } from "./base";
import { shouldUseDockerSandbox } from "../sandbox";
import { compileInDocker, runInDocker } from "../sandbox/dockerRunner";

export class JavaAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage = "java";
    readonly displayName = "Java (OpenJDK 17/21)";
    readonly fileExtension = ".java";
    readonly defaultTimeoutMs = 3000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        if (await shouldUseDockerSandbox()) {
            return compileInDocker("java", [
                "javac",
                "Solution.java"
            ], { folderPath, outputBinaryName: "Solution.class" });
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

        const compilerCmd = "javac";
        const compilerArgs = [sourceFilePath];

        return new Promise((resolve) => {
            let stderr = "";
            try {
                const child = spawn(compilerCmd, compilerArgs, {
                    cwd: folderPath,
                    env: getSanitizedEnv()
                });

                child.stderr?.on("data", (chunk: any) => {
                    stderr += chunk.toString();
                });

                child.on("error", (err: any) => {
                    resolve({
                        success: false,
                        errorMessage: `javac compiler not available: ${err.message}`
                    });
                });

                child.on("exit", (code: number) => {
                    if (code === 0) {
                        resolve({ success: true, executablePath: path.join(folderPath, "Solution.class") });
                    } else {
                        resolve({
                            success: false,
                            errorMessage: `Java Compilation Error: ${stderr.trim() || `javac exited with code ${code}`}`
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
        // Submissions are method bodies (e.g. `public int[] twoSum(...) { ... }`); wrap
        // them in `class Solution` unless the source already declares a class (some
        // problems ship full `class Solution` skeletons or a `Driver` harness).
        let source = options.codeWithDriver || "";
        if (!/\b(?:public\s+)?class\s+(?:Solution|Driver)\b/.test(source)) {
            source = `class Solution {\n${source}\n}`;
        }

        const sourcePath = path.join(options.folderPath, `Solution${this.fileExtension}`);
        fs.writeFileSync(sourcePath, source);

        const compilation = await this.compile(options.folderPath, sourcePath);
        if (!compilation.success) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                verdict: "CE",
                error: compilation.errorMessage || "Java Compilation Failed"
            };
        }

        // Prefer the problem harness (Driver) when present, else fall back to Solution
        // (standalone programs with their own `public static void main`).
        const mainClassName = fs.existsSync(path.join(options.folderPath, "Driver.class")) ? "Driver" : "Solution";

        if (await shouldUseDockerSandbox()) {
            return runInDocker("java", [
                "java",
                `-Xmx${options.memoryLimitMb || 256}m`,
                "-cp",
                "/sandbox",
                mainClassName
            ], { ...options, languageKey: this.key });
        }

        const cmd = "java";
        const args = [
            `-Xmx${options.memoryLimitMb}m`,
            "-cp",
            options.folderPath,
            mainClassName
        ];

        return runProcessSafely(cmd, args, { ...options, languageKey: this.key });
    }
}
