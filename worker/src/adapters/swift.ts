// worker/src/adapters/swift.ts
import path from "path";
import fs from "fs";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult } from "./types";
import { runProcessSafely } from "./base";
import { shouldUseDockerSandbox } from "../sandbox";
import { compileInDocker, runInDocker } from "../sandbox/dockerRunner";

export class SwiftAdapter implements ILanguageAdapter {
    readonly key = "swift" as const;
    readonly displayName = "Swift";
    readonly fileExtension = "swift";
    readonly defaultTimeoutMs = 6000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        const exeName = process.platform === "win32" ? "solution.exe" : "solution";

        if (await shouldUseDockerSandbox()) {
            return compileInDocker(
                "swift",
                ["swiftc", "main.swift", "-o", "solution"],
                { folderPath, timeoutMs: 60000, outputBinaryName: "solution" }
            );
        }

        const exePath = path.join(folderPath, exeName);
        const compileRes = await runProcessSafely("swiftc", [sourceFilePath, "-o", exePath], {
            folderPath,
            codeWithDriver: "",
            inputData: "",
            timeoutMs: 60000,
            memoryLimitMb: 512
        });

        if (compileRes.error || !fs.existsSync(exePath)) {
            return {
                success: false,
                errorMessage: compileRes.error || compileRes.got || "Swift compilation failed"
            };
        }
        return { success: true, executablePath: exePath };
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
                error: comp.errorMessage || "Swift Compilation error"
            };
        }

        if (await shouldUseDockerSandbox()) {
            return runInDocker("swift", ["./solution"], { ...options, languageKey: "swift" });
        }

        return runProcessSafely(comp.executablePath, [], {
            ...options,
            languageKey: "swift"
        });
    }
}
