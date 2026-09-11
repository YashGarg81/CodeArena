// frontend/src/components/Terminal.tsx
import React, { useState, useRef, useEffect } from "react";

interface CommandLog {
  id: string;
  type: "input" | "output" | "error";
  text: string;
}

export function SandboxedTerminal({ initialCwd = "~/project" }: { initialCwd?: string }) {
  const [cwd, setCwd] = useState(initialCwd);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandLog[]>([
    { id: "1", type: "output", text: "CodeArena Sandboxed Web Terminal v1.0.0" },
    { id: "2", type: "output", text: "Type 'help' for a list of available commands." }
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const newLogs: CommandLog[] = [...history, { id: String(Date.now()), type: "input", text: `${cwd} $ ${cmd}` }];
    const parts = cmd.split(" ");
    const commandName = (parts[0] || "").toLowerCase();
    const args = parts.slice(1);

    switch (commandName) {
      case "help":
        newLogs.push({
          id: String(Date.now() + 1),
          type: "output",
          text: "Available commands:\n  help      Show this help menu\n  pwd       Print current working directory\n  ls        List files in directory\n  cd        Change directory\n  cat       Display file content\n  clear     Clear terminal output\n  python    Simulate Python 3 execution\n  node      Simulate Node.js execution"
        });
        break;

      case "pwd":
        newLogs.push({ id: String(Date.now() + 1), type: "output", text: cwd });
        break;

      case "ls":
        newLogs.push({ id: String(Date.now() + 1), type: "output", text: "index.js  package.json  README.md  src/  tests/" });
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "cd":
        if (!args[0] || args[0] === "~") {
          setCwd("~/project");
        } else {
          setCwd(`${cwd}/${args[0]}`);
        }
        break;

      case "cat":
        if (args[0] === "package.json") {
          newLogs.push({ id: String(Date.now() + 1), type: "output", text: '{\n  "name": "codearena-app",\n  "version": "1.0.0"\n}' });
        } else {
          newLogs.push({ id: String(Date.now() + 1), type: "error", text: `cat: ${args[0] || 'file'}: No such file or directory` });
        }
        break;

      default:
        newLogs.push({ id: String(Date.now() + 1), type: "error", text: `bash: ${commandName}: command not found` });
    }

    setHistory(newLogs);
    setInput("");
  };

  return (
    <div style={{ background: "#0f172a", color: "#f8fafc", fontFamily: "monospace", borderRadius: 8, padding: 16, border: "1px solid #1e293b", minHeight: 280, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e293b", paddingBottom: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>🖥️ Sandboxed Terminal — {cwd}</span>
        <button onClick={() => setHistory([])} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 12 }}>Clear</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", fontSize: 13, lineHeight: 1.6 }}>
        {history.map(log => (
          <div key={log.id} style={{ color: log.type === "error" ? "#f87171" : log.type === "input" ? "#38bdf8" : "#e2e8f0", whiteSpace: "pre-wrap" }}>
            {log.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleCommand} style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <span style={{ color: "#38bdf8", fontWeight: 700 }}>{cwd} $</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, background: "none", border: "none", color: "#f8fafc", fontFamily: "monospace", outline: "none", fontSize: 13 }}
          placeholder="Type a command..."
          autoFocus
        />
      </form>
    </div>
  );
}
