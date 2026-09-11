import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api, API, getAuthHeaders } from "../../services/api";
import type { User } from "../../types";
import { CollaborativeEditor } from "../../components/CollaborativeEditor";


export function CollabStudioPage({ roomId: initialRoomId, user, onToast, onNavigate }: {
  roomId?: string;
  user: User | null;
  onToast: (m: string, t: string) => void;
  onNavigate: (p: string, s?: string) => void;
}) {
  const [roomId, setRoomId] = useState(initialRoomId || "");
  const [inRoom, setInRoom] = useState(!!initialRoomId);
  const [roomTitle, setRoomTitle] = useState("Collaborative Pair Studio");
  const [code, setCode] = useState("// Welcome to CodeArena Collaborative Studio\n// Start coding together in real-time!\n\nfunction solve(input) {\n  console.log('Running collaborative solution with input:', input);\n  return input * 2;\n}\n\nconsole.log(solve(21));\n");
  const [language, setLanguage] = useState("javascript");
  const [usersInRoom, setUsersInRoom] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [running, setRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [activeTab, setActiveTab] = useState<"output" | "chat">("output");

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId);
      setInRoom(true);
      fetchRoomDetails(initialRoomId);
    }
  }, [initialRoomId]);

  // Periodic room state & chat polling
  useEffect(() => {
    if (!inRoom || !roomId) return;
    const interval = setInterval(() => {
      fetchRoomDetails(roomId);
    }, 2500);
    return () => clearInterval(interval);
  }, [inRoom, roomId]);

  const fetchRoomDetails = async (rId: string) => {
    try {
      const res = await api.get(`/api/v1/collab/rooms/${rId}`);
      if (res.data.code && !code) setCode(res.data.code);
      if (res.data.language) setLanguage(res.data.language);
      if (res.data.users) setUsersInRoom(res.data.users);
      if (res.data.messages && Array.isArray(res.data.messages)) {
        setChatMessages(res.data.messages);
      }
    } catch {
      // Local state fallback
    }
  };

  const handleCreateRoom = async () => {
    try {
      const res = await api.post("/api/v1/collab/rooms", {
        language,
        title: roomTitle
      });
      setRoomId(res.data.roomId);
      setInRoom(true);
      if (res.data.messages) setChatMessages(res.data.messages);
      onToast("Collaborative Room created! 🎉", "success");
    } catch {
      const fallbackId = `room_${Date.now().toString(36)}`;
      setRoomId(fallbackId);
      setInRoom(true);
      onToast("Local Pair Studio initialized! 🚀", "info");
    }
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      onToast("Please enter a valid Room ID", "error");
      return;
    }
    setInRoom(true);
    fetchRoomDetails(roomId);
    onToast(`Joined room: ${roomId} ✅`, "success");
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/#collab/${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    onToast("Invite Link copied to clipboard! 📋", "success");
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const messageText = chatInput.trim();
    const senderName = user?.name || user?.username || "Anonymous Coder";
    const localMsg = {
      sender: senderName,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Immediate UI feedback
    setChatMessages(prev => [...prev, localMsg]);
    setChatInput("");

    if (roomId) {
      try {
        await api.post(`/api/v1/collab/rooms/${roomId}/messages`, {
          text: messageText,
          sender: senderName
        });
      } catch {
        // Keeps local optimistically
      }
    }
  };

  const handleRunSharedCode = async () => {
    setRunning(true);
    setActiveTab("output");
    setExecutionOutput("⏳ Executing code in isolated sandbox container...\n");
    try {
      const res = await api.post("/api/v1/execute", {
        code,
        language
      });
      setExecutionOutput(res.data.output || res.data.stdout || res.data.stderr || "Code executed successfully with zero output.");
      onToast("Code execution completed! ⚡", "success");
    } catch (e: any) {
      setExecutionOutput(`Execution Error: ${e.response?.data?.error || e.message || "Failed to execute sandbox run"}`);
    } finally {
      setRunning(false);
    }
  };

  if (!inRoom) {
    return (
      <div className="container" style={{ padding: "40px 24px", maxWidth: 760 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Real-Time Collaborative Coding Studio</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 540, margin: "8px auto 0" }}>
            Pair program with peers, conduct live technical interviews, or debug algorithms together with synchronous multi-user editing.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Create Room Card */}
          <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🚀</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Create New Room</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                Host a fresh collaborative session with your preferred programming language and invite teammates.
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Room Title</label>
                <input
                  className="input"
                  placeholder="e.g. Mock Interview with Alice"
                  value={roomTitle}
                  onChange={e => setRoomTitle(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Language</label>
                <select className="input" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (GCC 12)</option>
                  <option value="java">Java 17</option>
                  <option value="go">Go 1.20</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={handleCreateRoom}>
              Start Collaborative Room →
            </button>
          </div>

          {/* Join Room Card */}
          <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Join Existing Room</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                Enter a room code or paste an invitation token to jump directly into an ongoing session.
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Room ID / Token</label>
                <input
                  className="input"
                  placeholder="e.g. room_m2k9a_x7z"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-secondary w-full" onClick={handleJoinRoom}>
              Join Session →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Studio Top Bar */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setInRoom(false)}>← Leave</button>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
              <span>👥 {roomTitle}</span>
              <span className="badge badge-green" style={{ fontSize: 10 }}>🟢 Live Sync</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 8 }}>
              <span>Room: <code>{roomId}</code></span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Active Participants */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "#6366f1", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700
            }}>
              {(user?.name || "You").charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{user?.name || "You"} (Host)</span>
          </div>

          <select className="input" style={{ height: 32, fontSize: 12 }} value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={handleCopyInvite}>
            📋 Invite Link
          </button>

          <button className="btn btn-primary btn-sm" onClick={handleRunSharedCode} disabled={running}>
            {running ? "⏳ Running..." : "▶ Run Code"}
          </button>
        </div>
      </div>

      {/* Main Studio Body: Editor + Sidebar */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Code Editor Pane */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)" }}>
          <div style={{ flex: 1, display: "flex", position: "relative" }}>
            <textarea
              className="code-textarea"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              placeholder="// Write shared collaborative code here..."
              style={{
                width: "100%",
                height: "100%",
                padding: "16px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                lineHeight: 1.6,
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "none",
                outline: "none",
                resize: "none"
              }}
            />
          </div>
        </div>

        {/* Right Sidebar: Output / Room Chat */}
        <div style={{ width: 380, display: "flex", flexDirection: "column", background: "var(--bg-secondary)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
            <button
              style={{
                flex: 1, padding: "10px", fontSize: 12, fontWeight: 700,
                border: "none", background: activeTab === "output" ? "var(--bg-secondary)" : "transparent",
                color: activeTab === "output" ? "var(--accent-primary)" : "var(--text-muted)",
                cursor: "pointer", borderBottom: activeTab === "output" ? "2px solid var(--accent-primary)" : "none"
              }}
              onClick={() => setActiveTab("output")}
            >
              💻 Terminal Output
            </button>
            <button
              style={{
                flex: 1, padding: "10px", fontSize: 12, fontWeight: 700,
                border: "none", background: activeTab === "chat" ? "var(--bg-secondary)" : "transparent",
                color: activeTab === "chat" ? "var(--accent-primary)" : "var(--text-muted)",
                cursor: "pointer", borderBottom: activeTab === "chat" ? "2px solid var(--accent-primary)" : "none"
              }}
              onClick={() => setActiveTab("chat")}
            >
              💬 Room Chat ({chatMessages.length})
            </button>
          </div>

          {/* Tab 1: Terminal Output */}
          {activeTab === "output" && (
            <div style={{ flex: 1, padding: 16, overflowY: "auto", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.6 }}>
              {executionOutput ? (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>{executionOutput}</pre>
              ) : (
                <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: 40 }}>
                  Click <strong>▶ Run Code</strong> to execute the collaborative buffer.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Live Room Chat */}
          {activeTab === "chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {chatMessages.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: 40, fontSize: 12 }}>
                    👋 Welcome to the room chat! Send a message to your peers.
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ background: "var(--bg-tertiary)", padding: "8px 12px", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{msg.sender}</span>
                        <span style={{ color: "var(--text-muted)" }}>{msg.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{msg.text}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div style={{ padding: 10, borderTop: "1px solid var(--border)", display: "flex", gap: 6 }}>
                <input
                  className="input"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                  style={{ flex: 1, fontSize: 12, height: 32 }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SUBMISSION SHARE PAGE ──────────────────────────────────────────────────