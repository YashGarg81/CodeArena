// worker/src/adapters/javascript.ts
import fs from "fs";
import path from "path";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, SupportedLanguage } from "./types";
import { runProcessSafely } from "./base";

export class JavaScriptAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage = "js";
    readonly displayName = "JavaScript (Bun)";
    readonly fileExtension = ".js";
    readonly defaultTimeoutMs = 3000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return false;
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const filePath = path.join(options.folderPath, `solution${this.fileExtension}`);
        fs.writeFileSync(filePath, options.codeWithDriver);

        const cmd = "bun";
        const args = [
            "--no-warnings",
            `solution${this.fileExtension}`
        ];

        return runProcessSafely(cmd, args, { ...options, languageKey: this.key });
    }
}
