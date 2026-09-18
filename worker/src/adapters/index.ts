// worker/src/adapters/index.ts
import type { ILanguageAdapter, SupportedLanguage, ExecutionOptions, ExecutionResult } from "./types";
import { JavaScriptAdapter } from "./javascript";
import { PythonAdapter } from "./python";
import { CppAdapter } from "./cpp";
import { JavaAdapter } from "./java";
import { GoAdapter } from "./go";
import { RustAdapter } from "./rust";
import { CsAdapter } from "./cs";
import { KtAdapter } from "./kt";
import { RubyAdapter } from "./ruby";
import { PhpAdapter } from "./php";
import { SwiftAdapter } from "./swift";
import { ScalaAdapter } from "./scala";
import { createGenericAdapters } from "./languages";

export * from "./types";
export * from "./base";
export * from "./generic";
export { JavaScriptAdapter } from "./javascript";
export { PythonAdapter } from "./python";
export { CppAdapter } from "./cpp";
export { JavaAdapter } from "./java";
export { GoAdapter } from "./go";
export { RustAdapter } from "./rust";
export { CsAdapter } from "./cs";
export { KtAdapter } from "./kt";
export { RubyAdapter } from "./ruby";
export { PhpAdapter } from "./php";
export { SwiftAdapter } from "./swift";
export { ScalaAdapter } from "./scala";
export { GenericAdapter, type GenericSpec } from "./generic";
export { GENERIC_LANGUAGE_SPECS, createGenericAdapters } from "./languages";

export interface ExecutionBudgets {
    timeoutMs: number;
    memoryLimitMb: number;
}

export class LanguageAdapterRegistry {
    private static adapters: Map<string, ILanguageAdapter> = new Map();
    private static canonicalKeys: string[] = [];

    /**
     * Effective per-test-case budgets for the production judge path.
     *
     * The problem author's limits apply, raised to the toolchain's declared
     * minimum when the toolchain needs more (JVM boot, script runtimes,
     * single-file compilers). This is a floor, not a blanket increase:
     * languages whose adapters declare no special need keep the problem
     * budget untouched (js/py/cpp/java/go all stay at the problem limit).
     * Previously the production path used `problem.timeLimit || 4000`
     * unconditionally, which silently ignored these declared minimums and
     * guaranteed TLE for languages like Scala/Clojure/Groovy.
     */
    public static resolveBudgets(
        languageKey: string,
        problemTimeLimitMs?: number,
        problemMemoryLimitMb?: number
    ): ExecutionBudgets {
        const adapter = this.get(languageKey);
        return {
            timeoutMs: Math.max(problemTimeLimitMs || 4000, adapter?.defaultTimeoutMs || 0),
            memoryLimitMb: Math.max(problemMemoryLimitMb || 256, adapter?.defaultMemoryLimitMb || 0),
        };
    }

    static {
        const builtins: ILanguageAdapter[] = [
            new JavaScriptAdapter(),
            new PythonAdapter(),
            new CppAdapter(),
            new JavaAdapter(),
            new GoAdapter(),
            new RustAdapter(),
            new CsAdapter(),
            new KtAdapter(),
            new RubyAdapter(),
            new PhpAdapter(),
            new SwiftAdapter(),
            new ScalaAdapter(),
            ...createGenericAdapters(),
        ];
        for (const adapter of builtins) {
            this.register(adapter);
        }
    }

    public static register(adapter: ILanguageAdapter): void {
        this.adapters.set(adapter.key.toLowerCase(), adapter);
        this.canonicalKeys.push(adapter.key.toLowerCase());

        for (const alias of adapter.aliases ?? []) {
            this.adapters.set(alias.toLowerCase(), adapter);
        }

        // Legacy aliases for the built-in adapters.
        if (adapter.key === "js") {
            this.adapters.set("javascript", adapter);
        } else if (adapter.key === "py") {
            this.adapters.set("python", adapter);
            this.adapters.set("python3", adapter);
        } else if (adapter.key === "cpp") {
            this.adapters.set("c++", adapter);
        } else if (adapter.key === "go") {
            this.adapters.set("golang", adapter);
        } else if (adapter.key === "cs") {
            this.adapters.set("csharp", adapter);
            this.adapters.set("c#", adapter);
        } else if (adapter.key === "kt") {
            this.adapters.set("kotlin", adapter);
        } else if (adapter.key === "rust") {
            this.adapters.set("rs", adapter);
        }
    }

    public static get(languageKey: string): ILanguageAdapter | undefined {
        return this.adapters.get(languageKey.toLowerCase());
    }

    /** Canonical language keys (no aliases), in registration order. */
    public static getSupportedLanguages(): string[] {
        return [...new Set(this.canonicalKeys)];
    }

    public static async executeCode(languageKey: string, options: ExecutionOptions): Promise<ExecutionResult> {
        const adapter = this.get(languageKey);
        if (!adapter) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                error: `Unsupported execution language: '${languageKey}'. Supported languages: ${this.getSupportedLanguages().join(", ")}`
            };
        }
        return adapter.execute(options);
    }
}

export type { ILanguageAdapter, SupportedLanguage };
