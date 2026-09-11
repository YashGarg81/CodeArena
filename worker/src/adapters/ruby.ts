// worker/src/adapters/ruby.ts
import path from "path";
import fs from "fs";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult } from "./types";
import { runProcessSafely } from "./base";

export class RubyAdapter implements ILanguageAdapter {
    readonly key = "ruby" as const;
    readonly displayName = "Ruby";
    readonly fileExtension = "rb";
    readonly defaultTimeoutMs = 5000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return false;
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const sourceFilePath = path.join(options.folderPath, `solution.${this.fileExtension}`);
        fs.writeFileSync(sourceFilePath, options.codeWithDriver, "utf-8");

        return runProcessSafely("ruby", [sourceFilePath], {
            ...options,
            languageKey: "ruby"
        });
    }
}
