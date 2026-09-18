// worker/check_compilers.ts
//
// Compiler/runtime presence & smoke test for every supported language.
// For each canonical language it writes a self-contained "cat" probe using the
// exact file name + toolchain the adapter expects, runs it through the
// LanguageAdapterRegistry (which executes inside the Docker sandbox), and
// reports PASS/FAIL per language.
//
// Usage:
//   bun run check_compilers.ts            # full check (requires a running Docker engine)
//   bun run check_compilers.ts --images   # list image presence only
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { LanguageAdapterRegistry } from "./src/adapters";
import { isDockerAvailable } from "./src/sandbox";
import { LANGUAGE_IMAGES } from "./src/sandbox/dockerRunner";

const INPUT = "hello compiler";

// Definition of the entry-point the JVM actually executes is resolved from the adapter, not guessed.
const PROBES: Record<string, string> = {
  js: `let out = "";\nprocess.stdin.on("data", (d) => { out += d.toString(); });\nprocess.stdin.on("end", () => { process.stdout.write(out); });\n`,
  ts: `let out = "";\nprocess.stdin.on("data", (d) => { out += d.toString(); });\nprocess.stdin.on("end", () => { process.stdout.write(out); });\n`,
  py: `import sys\nsys.stdout.write(sys.stdin.read())\n`,
  cpp: `#include <iostream>\n#include <iterator>\nint main() {\n  std::string s((std::istreambuf_iterator<char>(std::cin)), std::istreambuf_iterator<char>());\n  std::cout << s;\n  return 0;\n}\n`,
  c: `#include <stdio.h>\nint main() {\n  int c;\n  while ((c = getchar()) != EOF) putchar(c);\n  return 0;\n}\n`,
  java: `class Driver {\n  public static void main(String[] args) throws Exception {\n    byte[] buf = new byte[65536];\n    int n = System.in.read(buf);\n    if (n > 0) System.out.print(new String(buf, 0, n, java.nio.charset.StandardCharsets.UTF_8));\n  }\n}\n`,
  go: `package main\nimport (\n  "os"\n  "io"\n)\nfunc main() { io.Copy(os.Stdout, os.Stdin) }\n`,
  rust: `use std::io::Read;\nfn main() {\n  let mut s = String::new();\n  std::io::stdin().read_to_string(&mut s).unwrap();\n  print!("{}", s);\n}\n`,
  cs: `class Program {\n  static void Main() {\n    System.Console.Write(System.Console.In.ReadToEnd());\n  }\n}\n`,
  kt: `fun main(args: Array<String>) { print(System.\`in\`.readBytes().toString(Charsets.UTF_8)) }\n`,
  ruby: `print $stdin.read\n`,
  php: `<?php echo file_get_contents("php://stdin");\n`,
  swift: `import Foundation\nlet data = FileHandle.standardInput.readDataToEndOfFile()\nFileHandle.standardOutput.write(data)\n`,
  scala: `import scala.io.Source\n@main def go(): Unit = print(Source.stdin.mkString)\n`,
  dart: `import 'dart:io';\nvoid main() {\n  final sb = StringBuffer();\n  stdin.transform(SystemEncoding().decoder).listen(\n    sb.write,\n    onDone: () { stdout.write(sb.toString()); exit(0); },\n  );\n}\n`,
  r: `input <- readLines("stdin", warn = FALSE)\ncat(paste(input, collapse = "\\n"))\n`,
  perl: `my $s = do { local $/; <STDIN> };\nprint $s;\n`,
  bash: `cat\n`,
  hs: `import System.IO\nmain = do { s <- getContents; putStr s }\n`,
  ex: `IO.write(:stdio, IO.read(:stdio, :all))\n`,
  erl: `#!/usr/bin/env escript\nmain(_) ->\n  io:format("~ts", [io:get_chars("", 1048576)]).\n`,
  clj: `(print (slurp *in*))\n(flush)\n(System/exit 0)\n`,
  groovy: `print System.in.getText()\n`,
  jl: `print(read(stdin, String))\n`,
  nim: `import std/syncio\nlet input = stdin.readAll()\nstdout.write(input)\n`,
};

async function main(): Promise<void> {
  const imagesOnly = process.argv.includes("--images");
  const engineUp = await isDockerAvailable();

  console.log("Supported language adapter keys:");
  console.log("  " + LanguageAdapterRegistry.getSupportedLanguages().join(", "));
  console.log("");
  console.log("Compiler runtime images:");
  const { present, missing } = reportImageStatus();
  console.log(`  ${present} present, ${missing.length} missing`);
  console.log("");

  if (!engineUp) {
    console.log("Docker engine is NOT reachable. Compiler probes were skipped.");
    console.log("Start Docker Desktop (after enabling WSL2/Virtual Machine Platform), then re-run:");
    console.log("  bun run check_compilers.ts");
    process.exitCode = imagesOnly ? (missing.length ? 1 : 0) : 1;
    return;
  }

  if (imagesOnly) {
    process.exitCode = missing.length ? 1 : 0;
    return;
  }

  console.log(`Running ${LanguageAdapterRegistry.getSupportedLanguages().length} compiler probes (input: "${INPUT}")...`);
  console.log("");
  const results: { key: string; out: string }[] = [];
  let failures = 0;
  for (const key of LanguageAdapterRegistry.getSupportedLanguages()) {
    const out = await runProbe(key);
    results.push({ key, out });
    process.stdout.write(`  ${key.padEnd(8)} ${out}\n`);
    if (out.startsWith("FAIL") || out.startsWith("ERROR")) failures++;
  }

  console.log("");
  console.log(`Summary: ${results.length - failures}/${results.length} languages OK, ${failures} failing.`);
  if (failures > 0) {
    console.log("Failing languages:");
    for (const { key, out } of results) {
      if (out.startsWith("FAIL") || out.startsWith("ERROR")) console.log(`  - ${key}: ${out}`);
    }
  }
  process.exitCode = failures > 0 ? 1 : 0;
}

async function runProbe(key: string): Promise<string> {
  const prob = PROBES[key];
  if (!prob) return "NO-PROBE";
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), `check-${key}-`));
  try {
    const adapter = LanguageAdapterRegistry.get(key);
    const result = await LanguageAdapterRegistry.executeCode(key, {
      folderPath: folder,
      codeWithDriver: prob,
      inputData: INPUT,
      expectedOutput: INPUT,
      timeoutMs: 60000,
      memoryLimitMb: adapter?.defaultMemoryLimitMb ?? 256,
      languageKey: key,
    });
    if (result.passed) return `PASS  ${String(result.runtime).padStart(6)}ms`;
    const v = result.verdict || (result.isCompileError ? "CE" : "?");
    const detail = (result.error || `got=${JSON.stringify(result.got)}`).replace(/\s+/g, " ").slice(0, 220);
    return `FAIL  ${v}  ${detail}`;
  } catch (e: any) {
    return `ERROR  ${String(e?.message || e).replace(/\s+/g, " ").slice(0, 220)}`;
  } finally {
    if (!process.env.KEEP_SANDBOX_FILES) {
      try { fs.rmSync(folder, { recursive: true, force: true }); } catch {}
    }
  }
}

function docker(args: string[]): { ok: boolean; stdout: string; stderr: string } {
  const res = spawnSync("docker", args, { encoding: "utf8" });
  return {
    ok: res.status === 0,
    stdout: (res.stdout || "").trim(),
    stderr: (res.stderr || "").trim(),
  };
}

function reportImageStatus(): { present: number; missing: string[] } {
  const unique = [...new Set(Object.values(LANGUAGE_IMAGES).filter(Boolean))];
  const missing: string[] = [];
  let present = 0;
  for (const image of unique) {
    const insp = docker(["image", "inspect", image]);
    if (insp.ok) {
      present++;
      console.log(`  present   ${image}`);
    } else {
      missing.push(image);
      console.log(`  MISSING   ${image}`);
    }
  }
  return { present, missing };
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});