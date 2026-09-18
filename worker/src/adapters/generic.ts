// worker/src/adapters/generic.ts
//
// Generic, config-driven language adapters. Adding a language that follows the
// classic "read stdin / write stdout" contract now requires only a declarative
// spec (see `languages.ts`) instead of a bespoke class.
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import type {
    ILanguageAdapter,
    SupportedLanguage,
    ExecutionOptions,
    ExecutionResult,
    CompilationResult,
} from "./types";
import { runProcessSafely, getSanitizedEnv } from "./base";
import { shouldUseDockerSandbox } from "../sandbox";
import { compileInDocker, runInDocker } from "../sandbox/dockerRunner";

interface GenericBaseSpec {
    key: SupportedLanguage;
    displayName: string;
    /** File extension without a leading dot, e.g. "c", "scala". */
    fileExtension: string;
    /** Override the default `solution.<ext>` file name. */
    fileName?: string;
    defaultTimeoutMs?: number;
    defaultMemoryLimitMb?: number;
    aliases?: string[];
    /** Extra files written alongside the solution (e.g. project manifests). */
    extraFiles?: Record<string, string>;
}

export interface InterpretedSpec extends GenericBaseSpec {
    type: "interpreted";
    /** Host command, e.g. "python3". */
    command: string;
    /** Args for the host command. Tokens: $SOURCE, $BINARY, $BINARY_PATH. */
    args?: string[];
    /** Docker command binary (defaults to `command`). */
    dockerCommand?: string;
    /** Args inside Docker (defaults to `args`). */
    dockerArgs?: string[];
}

export interface CompiledSpec extends GenericBaseSpec {
    type: "compiled";
    /** Host compiler command, e.g. "gcc". */
    compileCommand: string;
    /** Compiler args. Tokens: $SOURCE, $BINARY, $BINARY_PATH. */
    compileArgs: string[];
    /** Docker compiler command (defaults to `compileCommand`). */
    dockerCompileCommand?: string;
    /** Docker compiler args (defaults to `compileArgs`). */
    dockerCompileArgs?: string[];
    /** Args used to run the produced binary. Tokens: $BINARY_PATH (host) / $BINARY (docker). */
    runArgs?: string[];
    compileTimeoutMs?: number;
}

export type GenericSpec = InterpretedSpec | CompiledSpec;

function defaultBinaryName(): string {
    return process.platform === "win32" ? "solution.exe" : "solution";
}

export class GenericAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage;
    readonly displayName: string;
    readonly fileExtension: string;
    readonly defaultTimeoutMs: number;
    readonly defaultMemoryLimitMb: number;
    readonly aliases: string[];

    constructor(private readonly spec: GenericSpec) {
        this.key = spec.key;
        this.displayName = spec.displayName;
        this.fileExtension = spec.fileExtension;
        this.defaultTimeoutMs = spec.defaultTimeoutMs ?? 5000;
        this.defaultMemoryLimitMb = spec.defaultMemoryLimitMb ?? 256;
        this.aliases = spec.aliases ?? [];
    }

    isCompiled(): boolean {
        return this.spec.type === "compiled";
    }

    private get sourceName(): string {
        return this.spec.fileName ?? `solution.${this.spec.fileExtension}`;
    }

    private writeSource(options: ExecutionOptions): string {
        const sourcePath = path.join(options.folderPath, this.sourceName);
        fs.writeFileSync(sourcePath, options.codeWithDriver, "utf-8");
        if (this.spec.extraFiles) {
            for (const [name, content] of Object.entries(this.spec.extraFiles)) {
                const filePath = path.join(options.folderPath, name);
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, content, "utf-8");
            }
        }
        return sourcePath;
    }

    private buildArgs(template: string[] | undefined, folderPath: string, docker: boolean = false): string[] {
        const binary = defaultBinaryName();
        const binaryPath = path.join(folderPath, binary);
        return (template ?? ["$SOURCE"]).map((arg) =>
            arg
                .replace(/\$SOURCE/g, this.sourceName)
                // Inside the container the folder is mounted at /sandbox and cwd=/sandbox, so
                // an absolute host path for the produced binary would be unreachable.
                .replace(/\$BINARY_PATH/g, docker ? `./${binary}` : binaryPath)
                .replace(/\$BINARY/g, binary)
        );
    }

    async compile(folderPath: string, _sourceFilePath: string): Promise<CompilationResult> {
        if (this.spec.type !== "compiled") {
            return { success: true };
        }
        const spec = this.spec;
        const compileTimeoutMs = spec.compileTimeoutMs ?? 15000;

        if (await shouldUseDockerSandbox()) {
            return compileInDocker(
                this.key,
                [
                    spec.dockerCompileCommand ?? spec.compileCommand,
                    ...this.buildArgs(spec.dockerCompileArgs ?? spec.compileArgs, folderPath, true),
                ],
                { folderPath, timeoutMs: compileTimeoutMs, outputBinaryName: defaultBinaryName() }
            );
        }

        const isProd = process.env.NODE_ENV === "production";
        const isStrict = process.env.STRICT_SANDBOX === "true" || process.env.REQUIRE_DOCKER === "true";
        const allowProcess =
            process.env.ALLOW_PROCESS_SANDBOX === "true" ||
            (process.env.NODE_ENV === "test" && process.env.STRICT_SANDBOX !== "true");
        if ((isProd || isStrict) && !allowProcess) {
            return {
                success: false,
                errorMessage:
                    "Security Violation: Host compiler execution is strictly prohibited. Docker sandbox required.",
            };
        }

        const binaryPath = path.join(folderPath, defaultBinaryName());
        const args = this.buildArgs(spec.compileArgs, folderPath);

        return new Promise((resolve) => {
            let stderr = "";
            try {
                const child = spawn(spec.compileCommand, args, { cwd: folderPath, env: getSanitizedEnv() });
                child.stderr?.on("data", (chunk: any) => { stderr += chunk.toString(); });
                child.on("error", (err: any) =>
                    resolve({ success: false, errorMessage: `${spec.compileCommand} compiler error: ${err.message}` })
                );
                child.on("exit", (code: number) => {
                    if (code === 0 && fs.existsSync(binaryPath)) {
                        resolve({ success: true, executablePath: binaryPath });
                    } else {
                        resolve({
                            success: false,
                            errorMessage: `Compilation Error: ${stderr.trim() || `Compiler exited with code ${code}`}`,
                        });
                    }
                });
            } catch (e: any) {
                resolve({ success: false, errorMessage: `Compiler spawn exception: ${e.message}` });
            }
        });
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const sourcePath = this.writeSource(options);

        if (this.spec.type === "interpreted") {
            if (await shouldUseDockerSandbox()) {
                const dockerCmd = this.spec.dockerCommand ?? this.spec.command;
                const dockerArgs = this.buildArgs(this.spec.dockerArgs ?? this.spec.args, options.folderPath);
                return runInDocker(this.key, [dockerCmd, ...dockerArgs], { ...options, languageKey: this.key });
            }
            const args = this.buildArgs(this.spec.args, options.folderPath);
            return runProcessSafely(this.spec.command, args, { ...options, languageKey: this.key });
        }

        const compilation = await this.compile(options.folderPath, sourcePath);
        if (!compilation.success || !compilation.executablePath) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                verdict: "CE",
                error: compilation.errorMessage || `${this.displayName} compilation failed`,
            };
        }

        if (await shouldUseDockerSandbox()) {
            const runArgs = this.buildArgs(this.spec.runArgs ?? ["$BINARY"], options.folderPath);
            const binaryName = defaultBinaryName();
            const resolved = runArgs.map((a) => (a === binaryName ? `./${binaryName}` : a));
            return runInDocker(this.key, resolved, { ...options, languageKey: this.key });
        }

        const runArgs = this.buildArgs(this.spec.runArgs ?? [], options.folderPath);
        return runProcessSafely(compilation.executablePath, runArgs, { ...options, languageKey: this.key });
    }
}
