import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";

export function PlaygroundPage({ onToast }: { onToast: (m: string, t: string) => void }) {
  const [activeFile, setActiveFile] = useState("index.html");
  const [files, setFiles] = useState({
    "index.html": `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="card">\n    <h1>🚀 CodeArena Sandbox</h1>\n    <p>Live frontend workspace. Edit code to see instant updates!</p>\n    <button id="btn">Click Counter: <span id="count">0</span></button>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>`,
    "styles.css": `body {\n  font-family: sans-serif;\n  background: #0d1117;\n  color: #c9d1d9;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n.card {\n  background: #161b22;\n  border: 1px solid #30363d;\n  padding: 24px;\n  border-radius: 12px;\n  text-align: center;\n}\nbutton {\n  background: #58a6ff;\n  color: #000;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 6px;\n  font-weight: bold;\n  cursor: pointer;\n}`,
    "app.js": `let count = 0;\nconst btn = document.getElementById("btn");\nconst span = document.getElementById("count");\nbtn.addEventListener("click", () => {\n  count++;\n  span.textContent = count;\n});`
  });

  const getCombinedSrc = () => {
    return `
      ${files["index.html"]}
      <style>${files["styles.css"]}</style>
      <script>${files["app.js"]}<\/script>
    `;
  };

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>⚡ Web IDE & Project Playground</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Full multi-file sandbox workspace with real-time browser preview.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onToast("Project saved to your CodeArena portfolio! 💾", "success")}>Save Project</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 480 }}>
          <div style={{ display: "flex", background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-light)" }}>
            {Object.keys(files).map(f => (
              <button
                key={f}
                style={{
                  background: activeFile === f ? "var(--bg-primary)" : "transparent",
                  color: activeFile === f ? "var(--accent-primary)" : "var(--text-secondary)",
                  border: "none",
                  borderRight: "1px solid var(--border-light)",
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                onClick={() => setActiveFile(f)}
              >
                {f.endsWith(".html") ? "📄" : f.endsWith(".css") ? "🎨" : "⚡"} {f}
              </button>
            ))}
          </div>

          <textarea
            className="code-textarea"
            style={{ flex: 1, border: "none", borderRadius: 0, padding: 14, fontFamily: "var(--font-mono)", fontSize: 13 }}
            value={files[activeFile as keyof typeof files]}
            onChange={e => {
              const val = e.target.value;
              setFiles(prev => ({ ...prev, [activeFile]: val }));
            }}
          />
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 480 }}>
          <div style={{ padding: "8px 14px", background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-light)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)" }} />
            <span>LIVE BROWSER PREVIEW (http://sandbox.local)</span>
          </div>
          <iframe
            srcDoc={getCombinedSrc()}
            title="Sandbox Preview"
            style={{ width: "100%", height: "100%", border: "none", background: "#0d1117" }}
            sandbox="allow-scripts"
          />
        </div>
      </div>

      {/* Developer Tools Tabs */}
      <div style={{ marginTop: 28 }}>
        <PlaygroundToolsTabs />
      </div>
    </div>
  );
}

export function PlaygroundToolsTabs() {
  const [activeDevTab, setActiveDevTab] = useState<"visualizer" | "collab" | "terminal">("visualizer");

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        display: "flex",
        background: "var(--bg-tertiary)",
        borderBottom: "1px solid var(--border-light)"
      }}>
        {([
          { key: "visualizer" as const, label: "✨ Algorithm Visualizer" },
          { key: "collab" as const, label: "🤝 Collaborative Editor" },
          { key: "terminal" as const, label: "🖥️ Terminal" },
        ]).map(t => (
          <button
            key={t.key}
            style={{
              background: activeDevTab === t.key ? "var(--bg-primary)" : "transparent",
              color: activeDevTab === t.key ? "var(--accent-primary)" : "var(--text-secondary)",
              border: "none",
              borderRight: "1px solid var(--border-light)",
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => setActiveDevTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 20 }}>
        {activeDevTab === "visualizer" && <AlgorithmVisualizer />}
        {activeDevTab === "collab" && (
          <CollaborativeEditor
            roomId="playground-demo"
            userId="local-user"
            username="you"
          />
        )}
        {activeDevTab === "terminal" && <SandboxedTerminal />}
      </div>
    </div>
  );
}

// ─── LESSON CODE RUNNER WIDGET ────────────────────────────────────────────────

export function LessonCodeRunner({ lessonId }: { lessonId: string }) {
  const [code, setCode] = useState("// Write your solution here\nconsole.log('Hello CodeArena!');");
  const [language, setLanguage] = useState("js");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleRun = async () => {
    setRunning(true);
    setOutput("");
    setTestResults([]);
    try {
      const res = await api.post(`/api/v1/lessons/${lessonId}/execute`, { code, language });
      setOutput(res.data?.output || "(no output)");
      setTestResults(res.data?.testResults || []);
    } catch (err: any) {
      setOutput(err.response?.data?.error || "Execution failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{
      margin: "32px 0",
      borderRadius: 12,
      border: "1px solid var(--border-light)",
      overflow: "hidden",
      background: "var(--bg-card)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border-light)",
        background: "var(--bg-tertiary)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>💻 Exercise Code Runner</span>
          <select
            className="select select-sm"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{ fontSize: 12 }}
          >
            <option value="js">JavaScript</option>
            <option value="py">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>
        </div>
        <button
          className={`btn btn-sm ${running ? "btn-secondary" : "btn-primary"}`}
          onClick={handleRun}
          disabled={running}
        >
          {running ? "⏳ Running..." : "▶ Run Code"}
        </button>
      </div>

      <textarea
        className="code-textarea"
        value={code}
        onChange={e => setCode(e.target.value)}
        style={{
          width: "100%",
          minHeight: 160,
          border: "none",
          borderRadius: 0,
          padding: 14,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          resize: "vertical"
        }}
        spellCheck={false}
      />

      {(output || testResults.length > 0) && (
        <div style={{
          borderTop: "1px solid var(--border-light)",
          padding: "12px 16px",
          background: "var(--bg-secondary)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>
            Output
          </div>
          <pre style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            lineHeight: 1.5,
            color: "var(--text-main)",
            margin: 0,
            whiteSpace: "pre-wrap"
          }}>
            {output}
          </pre>
          {testResults.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {testResults.map((tr: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: tr.passed ? "rgba(63, 185, 80, 0.1)" : "rgba(248, 81, 73, 0.1)",
                    border: `1px solid ${tr.passed ? "rgba(63, 185, 80, 0.3)" : "rgba(248, 81, 73, 0.3)"}`,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  <span>{tr.passed ? "✅" : "❌"} Test {idx + 1}:</span>
                  <span style={{ marginLeft: 8, color: "var(--text-secondary)" }}>
                    Expected: {tr.expected} | Got: {tr.got}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
import { AlgorithmVisualizer } from "../../components/AlgorithmVisualizer";
import { CollaborativeEditor } from "../../components/CollaborativeEditor";
import { SandboxedTerminal } from "../../components/Terminal";

const PROBLEM_STATUSES = ["Draft", "Review", "Published", "Archived"];
const DIFFICULTIES_LIST = ["Easy", "Medium", "Hard"];
const CATEGORIES_LIST = [
  "Arrays","Strings","Linked List","Trees","Graphs","Dynamic Programming",
  "Stack","Queue","Heap","Hashing","Binary Search","Math","Backtracking",
  "Greedy","Bit Manipulation","Sorting","Design","SQL","Shell","Database"
];
const COMPANIES_ALL = ["Google","Amazon","Microsoft","Meta","Apple","Netflix","Uber","Adobe","Bloomberg","Twitter","LinkedIn","Airbnb"];
const LANG_OPTIONS = [
  { key: "js", label: "JavaScript" }, { key: "py", label: "Python" },
  { key: "cpp", label: "C++" }, { key: "java", label: "Java" },
  { key: "go", label: "Go" }, { key: "ts", label: "TypeScript" }
];

interface AdminProblem {
  id: string; title: string; slug: string; difficulty: string; category: string;
  status: string; isPremium: boolean; version: number; authorId: string | null;
  solveCount: number; attemptCount: number; createdAt: string; updatedAt: string;
  _count: { testCasesRel: number; revisions: number; submissions: number };
}

interface AdminTestCase {
  id: string; problemId: string; input: string; expectedOutput: string;
  isHidden: boolean; order: number; explanation: string | null;
}

interface AdminRevision {
  id: string; version: number; message: string | null; authorId: string | null; createdAt: string;
}

const defaultFormState = () => ({
  id: "", title: "", difficulty: "Easy", category: "Arrays",
  tags: "", companies: "", description: "",
  constraints: "", inputFormat: "", outputFormat: "",
  hints: "", editorial: "", solutions: "",
  templates_js: "", templates_py: "", templates_cpp: "", templates_java: "", templates_go: "",
  languages: ["js", "py", "cpp", "java", "go"],
  timeLimit: 5000, memoryLimit: 256,
  isPremium: false, status: "Draft"
});
