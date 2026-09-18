// worker/src/adapters/languages.ts
//
// Declarative specs for config-driven languages. To add a new language:
//   1. Add its key to `SupportedLanguage` in types.ts.
//   2. Add an image entry to LANGUAGE_IMAGES in ../sandbox/dockerRunner.ts.
//   3. Add a spec below.
// No bespoke adapter class required.
import { GenericAdapter, type GenericSpec } from "./generic";

export const GENERIC_LANGUAGE_SPECS: GenericSpec[] = [
    {
        type: "compiled",
        key: "c",
        displayName: "C (gcc 17)",
        fileExtension: "c",
        defaultTimeoutMs: 2000,
        compileCommand: "gcc",
        compileArgs: ["-O2", "-std=c17", "-Wall", "-Wextra", "$SOURCE", "-o", "$BINARY"],
        compileTimeoutMs: 15000,
        aliases: ["gcc"],
    },
    {
        type: "interpreted",
        key: "ts",
        displayName: "TypeScript (Bun)",
        fileExtension: "ts",
        defaultTimeoutMs: 5000,
        command: "bun",
        args: ["run", "$SOURCE"],
        aliases: ["typescript"],
    },

    {
        type: "interpreted",
        key: "dart",
        displayName: "Dart",
        fileExtension: "dart",
        defaultTimeoutMs: 8000,
        command: "dart",
        args: ["run", "$SOURCE"],
    },
    {
        type: "interpreted",
        key: "r",
        displayName: "R",
        fileExtension: "r",
        defaultTimeoutMs: 8000,
        command: "Rscript",
        args: ["$SOURCE"],
        aliases: ["rscript"],
    },
    {
        type: "interpreted",
        key: "perl",
        displayName: "Perl 5",
        fileExtension: "pl",
        defaultTimeoutMs: 5000,
        command: "perl",
        args: ["$SOURCE"],
        aliases: ["pl"],
    },
    {
        type: "interpreted",
        key: "bash",
        displayName: "Bash / Shell",
        fileExtension: "sh",
        defaultTimeoutMs: 5000,
        command: "bash",
        args: ["$SOURCE"],
        aliases: ["sh", "shell"],
    },
    {
        type: "interpreted",
        key: "hs",
        displayName: "Haskell",
        fileExtension: "hs",
        defaultTimeoutMs: 10000,
        defaultMemoryLimitMb: 512,
        command: "runghc",
        args: ["$SOURCE"],
        aliases: ["haskell"],
    },
    {
        type: "interpreted",
        key: "ex",
        displayName: "Elixir",
        fileExtension: "exs",
        defaultTimeoutMs: 10000,
        defaultMemoryLimitMb: 512,
        command: "elixir",
        args: ["$SOURCE"],
        aliases: ["elixir"],
    },
    {
        type: "interpreted",
        key: "erl",
        displayName: "Erlang (escript)",
        fileExtension: "escript",
        defaultTimeoutMs: 10000,
        command: "escript",
        args: ["$SOURCE"],
        aliases: ["erlang"],
    },
    {
        type: "interpreted",
        key: "clj",
        displayName: "Clojure",
        fileExtension: "clj",
        defaultTimeoutMs: 15000,
        defaultMemoryLimitMb: 512,
        command: "clojure",
        args: ["$SOURCE"],
        // The `clojure` CLI resolves org.clojure/clojure from $HOME/.m2, which is
        // root-owned in the official image and unreadable when the sandbox runs as
        // uid 1000 with no network. The bundled clojure-tools uberjar already embeds
        // clojure.core, so run scripts directly through it offline.
        dockerCommand: "sh",
        dockerArgs: [
            "-c",
            'exec java -cp /usr/local/lib/clojure/libexec/clojure-tools-*.jar clojure.main "$0"',
            "$SOURCE",
        ],
        aliases: ["clojure"],
    },
    {
        type: "interpreted",
        key: "groovy",
        displayName: "Groovy",
        fileExtension: "groovy",
        defaultTimeoutMs: 10000,
        defaultMemoryLimitMb: 512,
        command: "groovy",
        args: ["$SOURCE"],
    },
    {
        type: "interpreted",
        key: "jl",
        displayName: "Julia",
        fileExtension: "jl",
        defaultTimeoutMs: 10000,
        defaultMemoryLimitMb: 512,
        command: "julia",
        args: ["$SOURCE"],
        aliases: ["julia"],
    },
    {
        type: "compiled",
        key: "nim",
        displayName: "Nim",
        fileExtension: "nim",
        defaultTimeoutMs: 5000,
        compileCommand: "nim",
        compileArgs: ["c", "-d:release", "--hints:off", "--warnings:off", "--out:$BINARY", "$SOURCE"],
        compileTimeoutMs: 30000,
    },
];

export function createGenericAdapters(): GenericAdapter[] {
    return GENERIC_LANGUAGE_SPECS.map((spec) => new GenericAdapter(spec));
}
