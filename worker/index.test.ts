import { test, expect, describe } from "bun:test";

describe("Phase 1 — Online Judge Execution & Driver Harnesses", () => {
    test("JavaScript driver execution output matching", () => {
        const userFunction = `function twoSum(nums, target) {
            const map = new Map();
            for (let i = 0; i < nums.length; i++) {
                const diff = target - nums[i];
                if (map.has(diff)) return [map.get(diff), i];
                map.set(nums[i], i);
            }
            return [];
        }`;

        // Verify function execution
        const nums = [2, 7, 11, 15];
        const target = 9;
        const fn = new Function("nums", "target", `${userFunction}; return twoSum(nums, target);`);
        const result = fn(nums, target);

        expect(result).toEqual([0, 1]);
    });

    test("Verdict determination logic", () => {
        interface TestResult {
            passed: boolean;
            runtime: number;
            error?: string;
        }

        const evaluateVerdict = (results: TestResult[], hasTle: boolean, hasFailure: boolean, totalCases: number) => {
            if (hasTle) return "TLE";
            if (hasFailure) return "Failure";
            const passedCount = results.filter(r => r.passed).length;
            if (passedCount < totalCases) return "WrongAnswer";
            return "Success";
        };

        expect(evaluateVerdict([{ passed: true, runtime: 12 }], false, false, 1)).toBe("Success");
        expect(evaluateVerdict([{ passed: false, runtime: 10 }], false, false, 1)).toBe("WrongAnswer");
        expect(evaluateVerdict([{ passed: false, runtime: 5000, error: "TLE" }], true, false, 1)).toBe("TLE");
        expect(evaluateVerdict([{ passed: false, runtime: 5, error: "Runtime error" }], false, true, 1)).toBe("Failure");
    });
});
