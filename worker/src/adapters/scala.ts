// worker/src/adapters/scala.ts
import path from "path";
import fs from "fs";
import type { ILanguageAdapter, ExecutionOptions, ExecutionResult, CompilationResult, SupportedLanguage } from "./types";
import { runProcessSafely } from "./base";
import { shouldUseDockerSandbox } from "../sandbox";
import { compileInDocker, runInDocker } from "../sandbox/dockerRunner";

const CLASSES_DIR = "scala-classes";
const MAINCLASS_FILE = ".scala-main";
const DETECT_SCRIPT_NAME = "detect.sh";

// Compiles `solution.scala` with scalac, detects the runnable entry point by
// scanning emitted classes with javap (handles `@main def foo`, `object Main`
// and packaged variants uniformly), and records it in `.scala-main` for the
// run phase. Split measured: ~4s compile + ~1s run, versus ~10-20s for the
// `scala <script>` runner which re-does everything per invocation.
// NOTE: the detector runs as a script FILE, not `sh -c`, because multi-line
// shell (loops, quoting) does not survive the host→docker→dash quoting layers
// when inlined as a single argv string.
const DETECT_SCRIPT = `mkdir -p scala-classes
scalac -d scala-classes solution.scala
mainclass=""
for f in $(find scala-classes -name '*.class' | grep -v '[$]'); do
  cls=$(echo "$f" | sed 's|^scala-classes/||; s|\\.class$||; s|/|.|g')
  if javap -cp scala-classes "$cls" 2>/dev/null | grep -q 'public static void main'; then
    mainclass="$cls"
    break
  fi
done
if [ -z "$mainclass" ]; then echo 'No runnable main method found (expected @main or an object with def main)' >&2; exit 1; fi
echo "$mainclass" > .scala-main
`;

function readMainClass(folderPath: string): string | null {
  try {
    const raw = fs.readFileSync(path.join(folderPath, MAINCLASS_FILE), "utf-8").trim().split(/\s+/)[0] ?? "";
    return /^[A-Za-z0-9_.]+$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

export class ScalaAdapter implements ILanguageAdapter {
    readonly key: SupportedLanguage = "scala";
    readonly displayName = "Scala 3";
    readonly fileExtension = "scala";
    readonly defaultTimeoutMs = 15000;
    readonly defaultMemoryLimitMb = 512;

    isCompiled(): boolean {
        return true;
    }

    async compile(folderPath: string, sourceFilePath: string): Promise<CompilationResult> {
        if (await shouldUseDockerSandbox()) {
            fs.writeFileSync(path.join(folderPath, DETECT_SCRIPT_NAME), DETECT_SCRIPT, "utf-8");
            const res = await compileInDocker(
                "scala",
                ["sh", DETECT_SCRIPT_NAME],
                { folderPath, timeoutMs: 60000, outputBinaryName: CLASSES_DIR }
            );
            if (!res.success) return res;
            const mainClass = readMainClass(folderPath);
            if (!mainClass) {
                return { success: false, errorMessage: "Scala compilation failed: no runnable main method found." };
            }
            return { success: true, executablePath: path.join(folderPath, CLASSES_DIR) };
        }

        const classesDir = path.join(folderPath, CLASSES_DIR);
        fs.mkdirSync(classesDir, { recursive: true });
        const compileRes = await runProcessSafely("scalac", ["-d", classesDir, sourceFilePath], {
            folderPath,
            codeWithDriver: "",
            inputData: "",
            timeoutMs: 60000,
            memoryLimitMb: 512
        });

        if (compileRes.error) {
            return { success: false, errorMessage: compileRes.error || compileRes.got || "Scala compilation failed" };
        }
        return { success: true, executablePath: classesDir };
    }

    async execute(options: ExecutionOptions): Promise<ExecutionResult> {
        const sourceFilePath = path.join(options.folderPath, `solution.${this.fileExtension}`);
        fs.writeFileSync(sourceFilePath, options.codeWithDriver, "utf-8");

        // Host fallback (dev only): script mode, no main-class detection needed.
        if (!(await shouldUseDockerSandbox())) {
            return runProcessSafely("scala", [sourceFilePath], {
                ...options,
                languageKey: this.key
            });
        }

        const comp = await this.compile(options.folderPath, sourceFilePath);
        if (!comp.success || !comp.executablePath) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                verdict: "CE",
                error: comp.errorMessage || "Scala Compilation error"
            };
        }

        const mainClass = readMainClass(options.folderPath);
        if (!mainClass) {
            return {
                passed: false,
                got: "",
                expected: options.expectedOutput || "",
                runtime: 0,
                isCompileError: true,
                verdict: "CE",
                error: "Scala compilation failed: no runnable main method found."
            };
        }
        return runInDocker("scala", ["scala", "-cp", CLASSES_DIR, mainClass], { ...options, languageKey: this.key });
    }
}
