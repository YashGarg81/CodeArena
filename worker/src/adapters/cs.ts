// worker/src/adapters/cs.ts
import path from "path";
import fs from "fs";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult } from "./types";
import { runProcessSafely } from "./base";
import { shouldUseDockerSandbox } from "../sandbox";
import { compileInDocker, runInDocker } from "../sandbox/dockerRunner";

export class CsAdapter implements ILanguageAdapter {
    readonly key = "cs" as const;
    readonly displayName = "C# (Mono/.NET)";
    readonly fileExtension = "cs";
    readonly defaultTimeoutMs = 5000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        const exePath = path.join(folderPath, process.platform === "win32" ? "Solution.exe" : "Solution");

        if (await shouldUseDockerSandbox()) {
            // Inside the mono image, compile Program.cs and emit Solution.exe in
            // the mounted /sandbox directory, then run with `mono Solution.exe`.
            return compileInDocker(
                "cs",
                ["mcs", "-out:Solution.exe", "Program.cs"],
                { folderPath, outputBinaryName: "Solution.exe", timeoutMs: 30000 }
            );
        }

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

        if (await shouldUseDockerSandbox()) {
            return runInDocker("cs", ["mono", "Solution.exe"], { ...options, languageKey: "cs" });
        }

        return runProcessSafely(comp.executablePath, [], {
            ...options,
            languageKey: "cs"
        });
    }
}
