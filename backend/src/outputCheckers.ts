// backend/src/outputCheckers.ts

export type CheckerMode =
  | "exact"
  | "trimmed"
  | "case_insensitive"
  | "floating_point"
  | "token_array"
  | "custom";

export interface CheckerOptions {
  mode?: CheckerMode;
  floatEpsilon?: number; // e.g. 1e-5 or 1e-6
  ignoreTrailingNewline?: boolean;
}

export interface CheckerResult {
  matched: boolean;
  expected: string;
  actual: string;
  difference?: string;
}

/**
 * Compare actual judge output against expected output using configurable evaluation strategies.
 */
export function evaluateOutput(
  actual: string,
  expected: string,
  options: CheckerOptions = {}
): CheckerResult {
  const mode = options.mode || "trimmed";
  const floatEpsilon = options.floatEpsilon || 1e-5;

  if (mode === "exact") {
    const matched = actual === expected;
    return {
      matched,
      expected,
      actual,
      difference: matched ? undefined : "Exact string mismatch",
    };
  }

  const cleanActual = actual.replace(/\r\n/g, "\n").trim();
  const cleanExpected = expected.replace(/\r\n/g, "\n").trim();

  if (mode === "trimmed") {
    const matched = cleanActual === cleanExpected;
    return {
      matched,
      expected: cleanExpected,
      actual: cleanActual,
      difference: matched ? undefined : `Expected '${cleanExpected}', received '${cleanActual}'`,
    };
  }

  if (mode === "case_insensitive") {
    const matched = cleanActual.toLowerCase() === cleanExpected.toLowerCase();
    return {
      matched,
      expected: cleanExpected,
      actual: cleanActual,
      difference: matched ? undefined : "Case-insensitive mismatch",
    };
  }

  if (mode === "floating_point") {
    const actualTokens = cleanActual.split(/\s+/).filter(Boolean);
    const expectedTokens = cleanExpected.split(/\s+/).filter(Boolean);

    if (actualTokens.length !== expectedTokens.length) {
      return {
        matched: false,
        expected: cleanExpected,
        actual: cleanActual,
        difference: `Token count mismatch: expected ${expectedTokens.length}, got ${actualTokens.length}`,
      };
    }

    for (let i = 0; i < expectedTokens.length; i++) {
      const expStr = expectedTokens[i]!;
      const actStr = actualTokens[i]!;

      const expNum = parseFloat(expStr);
      const actNum = parseFloat(actStr);

      if (!isNaN(expNum) && !isNaN(actNum)) {
        if (Math.abs(expNum - actNum) > floatEpsilon) {
          return {
            matched: false,
            expected: cleanExpected,
            actual: cleanActual,
            difference: `Float mismatch at index ${i}: expected ~${expNum}, got ${actNum} (diff > ${floatEpsilon})`,
          };
        }
      } else {
        if (expStr !== actStr) {
          return {
            matched: false,
            expected: cleanExpected,
            actual: cleanActual,
            difference: `String token mismatch at index ${i}: expected '${expStr}', got '${actStr}'`,
          };
        }
      }
    }

    return { matched: true, expected: cleanExpected, actual: cleanActual };
  }

  if (mode === "token_array") {
    const actualTokens = cleanActual.split(/\s+/).filter(Boolean);
    const expectedTokens = cleanExpected.split(/\s+/).filter(Boolean);
    const matched =
      actualTokens.length === expectedTokens.length &&
      actualTokens.every((t, i) => t === expectedTokens[i]);

    return {
      matched,
      expected: cleanExpected,
      actual: cleanActual,
      difference: matched ? undefined : "Token array mismatch",
    };
  }

  // Default to standard trim comparison
  return {
    matched: cleanActual === cleanExpected,
    expected: cleanExpected,
    actual: cleanActual,
  };
}
