// frontend/src/components/CollaborativeEditor.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";

interface RemoteUser {
  socketId: string;
  userId: string;
  username: string;
  color: string;
  cursor?: { lineNumber: number; column: number };
}

interface CollaborativeEditorProps {
  roomId: string;
  userId: string;
  username: string;
  initialCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
}

export function CollaborativeEditor({
  roomId,
  userId,
  username,
  initialCode = "// Start collaborating!\nconsole.log('Hello from CodeArena!');\n",
  language = "js",
  onCodeChange,
}: CollaborativeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [connected, setConnected] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simulated WebSocket connection for collaborative editing
  // In production this would connect to the collaboration.ts backend via Socket.IO
  useEffect(() => {
    // Simulate connection
    const connectTimer = setTimeout(() => {
      setConnected(true);
      // Simulate remote users joining
      setRemoteUsers([
        {
          socketId: "sim-1",
          userId: "user-demo-1",
          username: "alice_dev",
          color: "#ef4444",
          cursor: { lineNumber: 2, column: 8 },
        },
        {
          socketId: "sim-2",
          userId: "user-demo-2",
          username: "bob_coder",
          color: "#3b82f6",
          cursor: { lineNumber: 4, column: 15 },
        },
      ]);
    }, 800);

    return () => clearTimeout(connectTimer);
  }, [roomId]);

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      setCode(newCode);
      onCodeChange?.(newCode);
    },
    [onCodeChange]
  );

  const handleCursorMove = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const pos = textarea.selectionStart;
      const lines = textarea.value.substring(0, pos).split("\n");
      const line = lines.length;
      const col = (lines[lines.length - 1]?.length ?? 0) + 1;
      setCursorPos({ line, col });
    },
    []
  );

  const codeLines = code.split("\n");

  return (
    <div
      className="collaborative-editor"
      style={{
        background: "var(--bg-card)",
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#10b981" : "#f59e0b",
              boxShadow: connected
                ? "0 0 6px rgba(16,185,129,0.5)"
                : "0 0 6px rgba(245,158,11,0.5)",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
            🤝 Collaborative Editor
          </span>
          <span
            className="badge badge-blue"
            style={{ fontSize: 10 }}
          >
            Room: {roomId}
          </span>
        </div>

        {/* Remote Users Presence */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {remoteUsers.map((u) => (
            <div
              key={u.socketId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 6,
                background: `${u.color}20`,
                border: `1px solid ${u.color}40`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: u.color,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: u.color }}>
                {u.username}
              </span>
            </div>
          ))}

          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {remoteUsers.length + 1} online
          </span>
        </div>
      </div>

      {/* Editor Area */}
      <div style={{ display: "flex", flex: 1, minHeight: 350 }}>
        {/* Line Numbers Gutter */}
        <div
          style={{
            padding: "12px 8px",
            background: "var(--bg-tertiary)",
            borderRight: "1px solid var(--border-color)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: "1.5",
            color: "var(--text-muted)",
            textAlign: "right",
            userSelect: "none",
            minWidth: 42,
          }}
        >
          {codeLines.map((_, i) => (
            <div key={i} style={{ position: "relative" }}>
              {i + 1}
              {/* Remote cursor indicators on line gutter */}
              {remoteUsers
                .filter((u) => u.cursor?.lineNumber === i + 1)
                .map((u) => (
                  <span
                    key={u.socketId}
                    style={{
                      position: "absolute",
                      right: -4,
                      top: 2,
                      width: 3,
                      height: 14,
                      background: u.color,
                      borderRadius: 2,
                    }}
                    title={`${u.username}'s cursor`}
                  />
                ))}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            spellCheck={false}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: "1.5",
              padding: "12px",
              resize: "none",
              tabSize: 2,
            }}
          />

          {/* Remote cursor labels overlay */}
          {remoteUsers.map((u) => {
            if (!u.cursor) return null;
            const topPx = (u.cursor.lineNumber - 1) * 19.5 + 12;
            return (
              <div
                key={u.socketId}
                style={{
                  position: "absolute",
                  top: topPx,
                  left: 12 + u.cursor.column * 7.8,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    width: 2,
                    height: 18,
                    background: u.color,
                    borderRadius: 1,
                  }}
                />
                <div
                  style={{
                    background: u.color,
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 4px",
                    borderRadius: 3,
                    whiteSpace: "nowrap",
                    marginTop: -2,
                  }}
                >
                  {u.username}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 14px",
          borderTop: "1px solid var(--border-color)",
          background: "var(--bg-tertiary)",
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span style={{ textTransform: "capitalize" }}>{language}</span>
          <span>UTF-8</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span>{connected ? "🟢 Connected" : "🟡 Connecting..."}</span>
          <span>{codeLines.length} lines</span>
        </div>
      </div>
    </div>
  );
}
