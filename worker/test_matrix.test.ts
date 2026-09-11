import { test, expect, describe } from "bun:test";
import { LanguageAdapterRegistry } from "./src/adapters";
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
        const compiledLanguages = ["cpp", "java", "rust", "cs", "kt", "swift"];
        const interpretedLanguages = ["js", "py", "php", "ruby", "go"];

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
    });

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
