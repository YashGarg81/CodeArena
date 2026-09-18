// frontend/src/utils/languages.ts
// Single source of truth for the languages exposed by the runner/worker.
// Keep in sync with worker/src/adapters/languages.ts.

export interface LanguageOption {
    key: string;
    label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { key: "js", label: "JavaScript" },
    { key: "ts", label: "TypeScript" },
    { key: "py", label: "Python 3" },
    { key: "cpp", label: "C++" },
    { key: "c", label: "C" },
    { key: "java", label: "Java" },
    { key: "go", label: "Go" },
    { key: "rust", label: "Rust" },
    { key: "cs", label: "C#" },
    { key: "kt", label: "Kotlin" },
    { key: "swift", label: "Swift" },
    { key: "ruby", label: "Ruby" },
    { key: "php", label: "PHP" },
    { key: "scala", label: "Scala" },
    { key: "dart", label: "Dart" },
    { key: "r", label: "R" },
    { key: "perl", label: "Perl" },
    { key: "bash", label: "Bash" },
    { key: "hs", label: "Haskell" },
    { key: "ex", label: "Elixir" },
    { key: "erl", label: "Erlang" },
    { key: "clj", label: "Clojure" },
    { key: "groovy", label: "Groovy" },
    { key: "jl", label: "Julia" },
    { key: "nim", label: "Nim" },
];

/** Languages that ship first-class starter templates / drivers by default. */
export const DEFAULT_PROBLEM_LANGUAGES = ["js", "py", "cpp", "c", "java", "go", "ts"];

export function languageLabel(key: string): string {
    return LANGUAGE_OPTIONS.find((l) => l.key === key)?.label ?? key;
}

const LANGUAGE_ALIASES: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    python3: "py",
    "c++": "cpp",
    cxx: "cpp",
    golang: "go",
    csharp: "cs",
    "c#": "cs",
    kotlin: "kt",
    rs: "rust",
    shell: "bash",
    sh: "bash",
    julia: "jl",
    haskell: "hs",
    elixir: "ex",
    erlang: "erl",
    clojure: "clj",
    rscript: "r",
    pl: "perl",
};

/** Normalize legacy/full language names to the canonical short key. */
export function normalizeLanguage(key: string | null | undefined): string {
    if (!key) return "";
    const lower = key.toLowerCase();
    return LANGUAGE_ALIASES[lower] ?? lower;
}

