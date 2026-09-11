// worker/src/adapters/java.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult, SupportedLanguage } from "./types";
import { runProcessSafely, getSanitizedEnv } from "./base";

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
                        resolve({ success: true });
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
        // Find main class name or default to Solution / Main
        const sourcePath = path.join(options.folderPath, `Solution${this.fileExtension}`);
        fs.writeFileSync(sourcePath, options.codeWithDriver);

        const compilation = await this.compile(options.folderPath, sourcePath);
        if (!compilation.success) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                error: compilation.errorMessage || "Java Compilation Failed"
            };
        }

        const cmd = "java";
        const args = [
            `-Xmx${options.memoryLimitMb}m`,
            "-cp",
            options.folderPath,
            "Solution"
        ];

        return runProcessSafely(cmd, args, { ...options, languageKey: this.key });
    }
}
