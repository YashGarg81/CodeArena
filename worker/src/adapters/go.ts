// worker/src/adapters/go.ts
import fs from "fs";
import path from "path";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, SupportedLanguage } from "./types";
import { runProcessSafely } from "./base";

export class GoAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage = "go";
    readonly displayName = "Go (Golang)";
    readonly fileExtension = ".go";
    readonly defaultTimeoutMs = 3000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return false;
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const filePath = path.join(options.folderPath, `main${this.fileExtension}`);
        fs.writeFileSync(filePath, options.codeWithDriver);

        const cmd = "go";
        const args = ["run", `main${this.fileExtension}`];

        return runProcessSafely(cmd, args, { ...options, languageKey: this.key });
    }
}
