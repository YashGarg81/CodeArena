// worker/src/adapters/cpp.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult, SupportedLanguage } from "./types";
import { runProcessSafely, getSanitizedEnv } from "./base";

export class CppAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage = "cpp";
    readonly displayName = "C++ (g++ 17/20)";
    readonly fileExtension = ".cpp";
    readonly defaultTimeoutMs = 2000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        const outBinary = path.join(folderPath, process.platform === "win32" ? "solution.exe" : "solution");
        const compilerCmd = "g++";
        const compilerArgs = [
            "-O2",
            "-std=c++17",
            "-Wall",
            "-Wextra",
            sourceFilePath,
            "-o",
            outBinary
        ];

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
                        errorMessage: `g++ compiler error: ${err.message}`
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
        const sourcePath = path.join(options.folderPath, `solution${this.fileExtension}`);
        fs.writeFileSync(sourcePath, options.codeWithDriver);

        const compilation = await this.compile(options.folderPath, sourcePath);
        if (!compilation.success || !compilation.executablePath) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                error: compilation.errorMessage || "C++ Compilation Failed"
            };
        }

        return runProcessSafely(compilation.executablePath, [], { ...options, languageKey: this.key });
    }
}
