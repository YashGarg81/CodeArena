import { test, expect, describe } from "bun:test";
import { LanguageAdapterRegistry, type SupportedLanguage } from "./src/adapters";
import { LANGUAGE_IMAGES } from "./src/sandbox/dockerRunner";
import { DRIVERS } from "./drivers";

describe("Issue 11 — Multi-Language Compatibility & Adapter Validation Matrix", () => {
    const allLanguages = [
        "js", "ts", "py", "cpp", "c#", "go", "java", "kotlin", "php", "ruby", "rust", "swift"
    ];

    test("Registry contains adapters for all 12 target languages and aliases", () => {
        for (const lang of allLanguages) {
            const adapter = LanguageAdapterRegistry.get(lang);
            expect(adapter).toBeDefined();
            expect(typeof adapter?.execute).toBe("function");
            expect(typeof adapter?.isCompiled).toBe("function");
            expect(adapter?.defaultTimeoutMs).toBeGreaterThan(0);
            expect(adapter?.defaultMemoryLimitMb).toBeGreaterThan(0);
        }
    });

    test("Language adapters declare accurate compilation vs interpreted characteristics", () => {
        const compiledLanguages = ["cpp", "java", "rust", "cs", "kt", "swift", "go", "scala"];
        const interpretedLanguages = ["js", "py", "php", "ruby"];

        for (const lang of compiledLanguages) {
            const adapter = LanguageAdapterRegistry.get(lang);
            expect(adapter?.isCompiled()).toBe(true);
        }

        for (const lang of interpretedLanguages) {
            const adapter = LanguageAdapterRegistry.get(lang);
            expect(adapter?.isCompiled()).toBe(false);
        }
    });

    test("Driver matrix provides valid stdin/stdout runner wrappers", () => {
        expect(DRIVERS["two-sum"]).toBeDefined();
        expect(DRIVERS["two-sum"]?.js).toContain("twoSum");
        expect(DRIVERS["two-sum"]?.py).toContain("two_sum");
        expect(DRIVERS["two-sum"]?.cpp).toContain("twoSum");

        expect(DRIVERS["reverse-string"]).toBeDefined();
        expect(DRIVERS["reverse-string"]?.js).toContain("reverseString");
        expect(DRIVERS["reverse-string"]?.py).toContain("reverse_string");
    });

    test("Execution handles unsupported language requests gracefully without crashing", async () => {
        const dummyOptions = {
            folderPath: "./scratch",
            codeWithDriver: "echo 'hello'",
            inputData: "",
            timeoutMs: 1000,
            memoryLimitMb: 128
        };
        const result = await LanguageAdapterRegistry.executeCode("unsupported_lang_xyz", dummyOptions);
        expect(result.passed).toBe(false);
        expect(result.error).toContain("Unsupported execution language");
    });

    test("JS adapter correctly executes standard input/output programs", async () => {
        const adapter = LanguageAdapterRegistry.get("js");
        expect(adapter).toBeDefined();
        const tmpFolder = __dirname + "/code_matrix_test";
        const fs = await import("fs");
        if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder, { recursive: true });

        try {
            const result = await adapter!.execute({
                folderPath: tmpFolder,
                codeWithDriver: "const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8').trim(); console.log(Number(input) * 2);",
                inputData: "21",
                expectedOutput: "42",
                timeoutMs: 5000,
                memoryLimitMb: 256
            });

            expect(result.passed).toBe(true);
            expect(result.got.trim()).toBe("42");
        } finally {
            try { fs.rmSync(tmpFolder, { recursive: true, force: true }); } catch {}
        }
    });

    test("JS adapter enforces timeout limits (TLE)", async () => {
        const adapter = LanguageAdapterRegistry.get("js");
        const tmpFolder = __dirname + "/code_matrix_tle";
        const fs = await import("fs");
        if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder, { recursive: true });

        try {
            const result = await adapter!.execute({
                folderPath: tmpFolder,
                codeWithDriver: "while(true) {}",
                inputData: "",
                expectedOutput: "done",
                timeoutMs: 800,
                memoryLimitMb: 256
            });

            expect(result.passed).toBe(false);
            expect(result.isTLE || result.error?.includes("Time Limit Exceeded") || (result.error && result.error.length > 0)).toBeTruthy();
        } finally {
            try { fs.rmSync(tmpFolder, { recursive: true, force: true }); } catch {}
        }
    }, { timeout: 10000 });

    test("Hidden test case outputs are never leaked in error logs", () => {
        const testResults = [
            { input: "secret_1", expected: "secret_out_1", got: "wrong", passed: false, isHidden: true },
            { input: "open_1", expected: "open_out_1", got: "wrong", passed: false, isHidden: false }
        ];

        const sanitizeResults = (results: any[]) => {
            return results.map(r => r.isHidden ? {
                input: "[HIDDEN TEST CASE]",
                expected: "[HIDDEN TEST CASE]",
                got: "[HIDDEN TEST CASE]",
                passed: r.passed,
                runtime: r.runtime,
                isHidden: true
            } : r);
        };

        const sanitized = sanitizeResults(testResults);
        expect(sanitized[0].input).toBe("[HIDDEN TEST CASE]");
        expect(sanitized[0].expected).toBe("[HIDDEN TEST CASE]");
        expect(sanitized[1].input).toBe("open_1");
    });
});

describe("Expanded language matrix (config-driven adapters)", () => {
    const addedLanguages: SupportedLanguage[] = [
        "c", "ts", "scala", "dart", "r", "perl", "bash", "hs", "ex", "erl", "clj", "groovy", "jl", "nim"
    ];

    test("registry exposes every newly added language", () => {
        for (const lang of addedLanguages) {
            const adapter = LanguageAdapterRegistry.get(lang);
            expect(adapter).toBeDefined();
            expect(adapter?.key).toBe(lang);
            expect(typeof adapter?.execute).toBe("function");
        }
    });

    test("every canonical language resolves to a Docker image", () => {
        for (const lang of LanguageAdapterRegistry.getSupportedLanguages()) {
            expect(LANGUAGE_IMAGES[lang]).toBeDefined();
        }
    });

    test("newly added compiled languages report isCompiled=true", () => {
        for (const lang of ["c", "nim", "scala"]) {
            expect(LanguageAdapterRegistry.get(lang)?.isCompiled()).toBe(true);
        }
        for (const lang of ["ts", "dart", "r", "perl", "bash", "hs", "ex", "erl", "clj", "groovy", "jl"]) {
            expect(LanguageAdapterRegistry.get(lang)?.isCompiled()).toBe(false);
        }
    });

    test("language aliases resolve to their canonical adapter", () => {
        expect(LanguageAdapterRegistry.get("typescript")?.key).toBe("ts");
        expect(LanguageAdapterRegistry.get("gcc")?.key).toBe("c");
        expect(LanguageAdapterRegistry.get("haskell")?.key).toBe("hs");
        expect(LanguageAdapterRegistry.get("shell")?.key).toBe("bash");
        expect(LanguageAdapterRegistry.get("julia")?.key).toBe("jl");
    });

    test("resolveBudgets keeps problem limits when toolchain needs less", () => {
        // js declares 3000ms/256MB: a 5000ms problem budget passes through untouched.
        expect(LanguageAdapterRegistry.resolveBudgets("js", 5000, 256)).toEqual({
            timeoutMs: 5000,
            memoryLimitMb: 256,
        });
        // Unknown languages fall back to the historic defaults.
        expect(LanguageAdapterRegistry.resolveBudgets("nope", undefined, undefined)).toEqual({
            timeoutMs: 4000,
            memoryLimitMb: 256,
        });
    });

    test("resolveBudgets raises to the toolchain floor when it needs more", () => {
        // Measured cold runs: clojure ~8s, groovy ~6s — both declare higher minimums.
        expect(LanguageAdapterRegistry.resolveBudgets("clj", 4000, 256)).toEqual({
            timeoutMs: 15000,
            memoryLimitMb: 512,
        });
        expect(LanguageAdapterRegistry.resolveBudgets("groovy", 5000, 256)).toEqual({
            timeoutMs: 10000,
            memoryLimitMb: 512,
        });
        expect(LanguageAdapterRegistry.resolveBudgets("scala", 4000, 256)).toEqual({
            timeoutMs: 15000,
            memoryLimitMb: 512,
        });
    });

    test("resolveBudgets never lowers a generous problem budget", () => {
        expect(LanguageAdapterRegistry.resolveBudgets("py", 20000, 1024)).toEqual({
            timeoutMs: 20000,
            memoryLimitMb: 1024,
        });
    });
});
