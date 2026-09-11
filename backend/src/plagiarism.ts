// backend/src/plagiarism.ts
import crypto from "crypto";

export interface PlagiarismMatch {
  similarityScore: number; // 0.0 to 1.0 (e.g. 0.85 = 85% similar)
  isSuspicious: boolean;   // Flagged if > threshold (default 0.70)
  matchingFingerprints: number;
  totalFingerprints: number;
}

const KEYWORDS = new Set([
  "function", "return", "if", "else", "for", "while", "do", "break", "continue",
  "switch", "case", "default", "try", "catch", "finally", "throw", "class", "const",
  "let", "var", "new", "this", "typeof", "instanceof", "in", "of", "import", "export",
  "from", "as", "def", "elif", "and", "or", "not", "is", "none", "true", "false",
  "int", "float", "double", "char", "void", "bool", "auto", "public", "private",
  "protected", "static", "struct", "template", "typename", "vector", "map", "set",
  "string", "include", "null", "undefined", "true", "false"
]);

/**
 * Strips comments, string literals, and standardizes variable identifiers.
 */
export function normalizeSourceCode(code: string): string {
  if (!code || typeof code !== "string") return "";

  let cleaned = code
    // Remove multi-line comments /* ... */
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Remove single-line comments // ... or # ...
    .replace(/(\/\/|#).*$/gm, "")
    // Replace string literals with standard placeholder 'STR'
    .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "STR")
    // Replace numbers with standard placeholder 'NUM'
    .replace(/\b\d+(\.\d+)?\b/g, "NUM");

  // Normalize delimiters & operators
  cleaned = cleaned
    .replace(/[{}[\]();,.<>=!+\-*/%&|^~?: ]/g, (match) => ` ${match} `)
    .replace(/\s+/g, " ")
    .trim();

  // Abstract identifiers: keep language keywords, replace variables/functions with 'ID'
  const rawTokens = cleaned.split(" ").filter(Boolean);
  const normalizedTokens = rawTokens.map((tok) => {
    const lower = tok.toLowerCase();
    if (KEYWORDS.has(lower) || /^[0-9]+$/.test(tok) || tok === "STR" || tok === "NUM" || /^[^\w\s]$/.test(tok)) {
      return tok;
    }
    return "ID";
  });

  return normalizedTokens.join(" ");
}

/**
 * Generates n-gram k-shingle hashes from normalized code stream.
 */
export function generateFingerprints(normalizedCode: string, kShingleSize = 5): Set<string> {
  const tokens = normalizedCode.split(" ").filter(Boolean);
  const fingerprints = new Set<string>();

  if (tokens.length < kShingleSize) {
    if (tokens.length > 0) {
      const hash = crypto.createHash("md5").update(tokens.join("")).digest("hex").slice(0, 8);
      fingerprints.add(hash);
    }
    return fingerprints;
  }

  for (let i = 0; i <= tokens.length - kShingleSize; i++) {
    const shingle = tokens.slice(i, i + kShingleSize).join("");
    const hash = crypto.createHash("md5").update(shingle).digest("hex").slice(0, 8);
    fingerprints.add(hash);
  }

  return fingerprints;
}

/**
 * Calculates Jaccard similarity score between two source code submissions.
 */
export function compareSubmissions(
  codeA: string,
  codeB: string,
  threshold = 0.7
): PlagiarismMatch {
  const normA = normalizeSourceCode(codeA);
  const normB = normalizeSourceCode(codeB);

  const fpsA = generateFingerprints(normA);
  const fpsB = generateFingerprints(normB);

  if (fpsA.size === 0 && fpsB.size === 0) {
    return { similarityScore: 1.0, isSuspicious: true, matchingFingerprints: 0, totalFingerprints: 0 };
  }

  if (fpsA.size === 0 || fpsB.size === 0) {
    return { similarityScore: 0.0, isSuspicious: false, matchingFingerprints: 0, totalFingerprints: 0 };
  }

  let intersection = 0;
  for (const fp of fpsA) {
    if (fpsB.has(fp)) {
      intersection++;
    }
  }

  const union = new Set([...fpsA, ...fpsB]).size;
  const similarityScore = union > 0 ? Math.round((intersection / union) * 100) / 100 : 0;

  return {
    similarityScore,
    isSuspicious: similarityScore >= threshold,
    matchingFingerprints: intersection,
    totalFingerprints: union,
  };
}
