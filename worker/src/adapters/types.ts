// worker/src/adapters/types.ts

export type SupportedLanguage = "js" | "ts" | "py" | "cpp" | "java" | "go" | "rust" | "cs" | "kt" | "ruby" | "php" | "swift";

export interface ExecutionOptions {
    folderPath: string;
    codeWithDriver: string;
    inputData: string;
    expectedOutput?: string;
    timeoutMs: number;
    memoryLimitMb: number;
    maxOutputBytes?: number;
    languageKey?: string;
}

export interface ExecutionResult {
    passed: boolean;
    got: string;
    expected: string;
    runtime: number; // milliseconds
    memoryMb?: number;
    error?: string;
    isTLE?: boolean;
    isMLE?: boolean;
    isCompileError?: boolean;
}

export interface CompilationResult {
    success: boolean;
    executablePath?: string;
    errorMessage?: string;
}

export interface ILanguageAdapter {
    readonly key: SupportedLanguage;
    readonly displayName: string;
    readonly fileExtension: string;
    readonly defaultTimeoutMs: number;
    readonly defaultMemoryLimitMb: number;

    isCompiled(): boolean;
    compile?(folderPath: string, sourceFilePath: string): Promise<CompilationResult>;
    execute(options: ExecutionOptions): Promise<ExecutionResult>;
}
