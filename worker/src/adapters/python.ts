// worker/src/adapters/python.ts
import fs from "fs";
import path from "path";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, SupportedLanguage } from "./types";
import { runProcessSafely } from "./base";

export class PythonAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage = "py";
    readonly displayName = "Python 3";
    readonly fileExtension = ".py";
    readonly defaultTimeoutMs = 4000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return false;
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const filePath = path.join(options.folderPath, `solution${this.fileExtension}`);
        fs.writeFileSync(filePath, options.codeWithDriver);

        const cmd = process.platform === "win32" ? "python" : "python3";
        const args = ["-I", "-u", "-B", `solution${this.fileExtension}`];

        return runProcessSafely(cmd, args, { ...options, languageKey: this.key });
    }
}
