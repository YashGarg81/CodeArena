// worker/src/adapters/kt.ts
import path from "path";
import fs from "fs";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult } from "./types";
import { runProcessSafely } from "./base";

export class KtAdapter implements ILanguageAdapter {
    readonly key = "kt" as const;
    readonly displayName = "Kotlin";
    readonly fileExtension = "kt";
    readonly defaultTimeoutMs = 6000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        const jarPath = path.join(folderPath, "Solution.jar");
        const compileRes = await runProcessSafely("kotlinc", [sourceFilePath, "-include-runtime", "-d", jarPath], {
            folderPath,
            codeWithDriver: "",
            inputData: "",
            timeoutMs: 20000,
            memoryLimitMb: 512
        });

        if (compileRes.error || !fs.existsSync(jarPath)) {
            return {
                success: false,
                errorMessage: compileRes.error || compileRes.got || "Kotlin compilation failed"
            };
        }
        return { success: true, executablePath: jarPath };
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const sourceFilePath = path.join(options.folderPath, `Solution.${this.fileExtension}`);
        fs.writeFileSync(sourceFilePath, options.codeWithDriver, "utf-8");

        const comp = await this.compile(options.folderPath, sourceFilePath);
        if (!comp.success || !comp.executablePath) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                error: comp.errorMessage || "Kotlin Compilation error"
            };
        }

        return runProcessSafely("java", ["-jar", comp.executablePath], {
            ...options,
            languageKey: "kt"
        });
    }
}
