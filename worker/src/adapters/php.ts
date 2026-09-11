// worker/src/adapters/php.ts
import path from "path";
import fs from "fs";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult } from "./types";
import { runProcessSafely } from "./base";

export class PhpAdapter implements ILanguageAdapter {
    readonly key = "php" as const;
    readonly displayName = "PHP";
    readonly fileExtension = "php";
    readonly defaultTimeoutMs = 5000;
    readonly defaultMemoryLimitMb = 256;

    isCompiled(): boolean {
        return false;
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const sourceFilePath = path.join(options.folderPath, `solution.${this.fileExtension}`);
        fs.writeFileSync(sourceFilePath, options.codeWithDriver, "utf-8");

        return runProcessSafely("php", [sourceFilePath], {
            ...options,
            languageKey: "php"
        });
    }
}
