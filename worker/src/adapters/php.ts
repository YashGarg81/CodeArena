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
        const sourceFileName = `solution.${this.fileExtension}`;
        const sourceFilePath = path.join(options.folderPath, sourceFileName);
        fs.writeFileSync(sourceFilePath, options.codeWithDriver, "utf-8");

        // Relative name (not absolute host path): the Docker sandbox mounts the
        // folder at /sandbox and runs with cwd=/sandbox, so a bare file name is
        // required for in-container resolution.
        return runProcessSafely("php", [sourceFileName], {
            ...options,
            languageKey: "php"
        });
    }
}
