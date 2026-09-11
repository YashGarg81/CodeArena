// worker/src/adapters/cs.ts
import path from "path";
import fs from "fs";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult } from "./types";
import { runProcessSafely } from "./base";

export class CsAdapter implements ILanguageAdapter {
    readonly key = "cs" as const;
    readonly displayName = "C# (.NET)";
    readonly fileExtension = "cs";
    readonly defaultTimeoutMs = 5000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        const exePath = path.join(folderPath, process.platform === "win32" ? "Solution.exe" : "Solution");
        const compileRes = await runProcessSafely("csc", ["-out:" + exePath, sourceFilePath], {
            folderPath,
            codeWithDriver: "",
            inputData: "",
            timeoutMs: 15000,
            memoryLimitMb: 512
        });

        if (compileRes.error || !fs.existsSync(exePath)) {
            return {
                success: false,
                errorMessage: compileRes.error || compileRes.got || "C# compilation failed"
            };
        }
        return { success: true, executablePath: exePath };
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const sourceFilePath = path.join(options.folderPath, `Program.${this.fileExtension}`);
        fs.writeFileSync(sourceFilePath, options.codeWithDriver, "utf-8");

        const comp = await this.compile(options.folderPath, sourceFilePath);
        if (!comp.success || !comp.executablePath) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                error: comp.errorMessage || "C# Compilation error"
            };
        }

        return runProcessSafely(comp.executablePath, [], {
            ...options,
            languageKey: "cs"
        });
    }
}
