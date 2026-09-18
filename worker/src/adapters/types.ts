// worker/src/adapters/types.ts

export type SupportedLanguage =
    | "js" | "ts" | "py" | "cpp" | "java" | "go" | "rust" | "cs" | "kt" | "ruby" | "php" | "swift"
    | "c" | "scala" | "dart" | "r" | "perl" | "bash" | "hs" | "ex" | "erl" | "clj" | "groovy" | "jl" | "nim";

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

export type ExecutionVerdict = "AC" | "WA" | "TLE" | "MLE" | "OLE" | "RE" | "CE";

export interface ExecutionResult {
    passed: boolean;
    got: string;
    expected: string;
    runtime: number; // milliseconds
    memoryMb?: number;
    error?: string;
    verdict?: ExecutionVerdict;
    isTLE?: boolean;
    isMLE?: boolean;
    isOLE?: boolean;
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
    /** Optional alternative keys accepted by the registry (e.g. "golang" for "go"). */
    readonly aliases?: string[];

    isCompiled(): boolean;
    compile?(folderPath: string, sourceFilePath: string): Promise<CompilationResult>;
    execute(options: ExecutionOptions): Promise<ExecutionResult>;
}
