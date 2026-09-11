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

export * from "./types";
export * from "./base";
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

export class LanguageAdapterRegistry {
    private static adapters: Map<string, ILanguageAdapter> = new Map();

    static {
        this.register(new JavaScriptAdapter());
        this.register(new PythonAdapter());
        this.register(new CppAdapter());
        this.register(new JavaAdapter());
        this.register(new GoAdapter());
        this.register(new RustAdapter());
        this.register(new CsAdapter());
        this.register(new KtAdapter());
        this.register(new RubyAdapter());
        this.register(new PhpAdapter());
        this.register(new SwiftAdapter());
    }

    public static register(adapter: ILanguageAdapter): void {
        this.adapters.set(adapter.key.toLowerCase(), adapter);
        // Aliases
        if (adapter.key === "js") {
            this.adapters.set("javascript", adapter);
            this.adapters.set("ts", adapter);
            this.adapters.set("typescript", adapter);
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

    public static getSupportedLanguages(): string[] {
        return ["js", "ts", "py", "cpp", "java", "go", "rust", "cs", "kt", "ruby", "php", "swift"];
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
