import React, { useState, useEffect, useCallback } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";
import type { User, Note } from "../../types";
import { markdownToHtml } from "../../utils/markdown";

export function NotesPage({ user, onToast, onOpenAuth }: {
  user: User | null;
  onToast: (msg: string, type: string) => void;
  onOpenAuth: (m: "login" | "signup") => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get("/api/v1/notes")
      .then(r => {
        const fetched = r.data.notes || [];
        setNotes(fetched);
        if (fetched.length > 0 && !selectedNote) {
          setSelectedNote(fetched[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    try {
      const res = await api.post("/api/v1/notes", {
        title: "Untitled Note",
        content: "# New Note\n\nWrite your thoughts, algorithm notes, or code snippets here...",
        tags: ["general"],
        isPublic: false
      });
      const newNote = res.data.note;
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      onToast("New note created! 📝", "success");
    } catch (err: any) {
      onToast("Failed to create note", "error");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/v1/notes/${selectedNote.id}`, {
        title: selectedNote.title,
        content: selectedNote.content,
        tags: selectedNote.tags,
        isPublic: selectedNote.isPublic
      });
      const updated = res.data.note;
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      setSelectedNote(updated);
      onToast("Note saved! 💾", "success");
    } catch (err: any) {
      onToast("Failed to save note", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/api/v1/notes/${id}`);
      const remaining = notes.filter(n => n.id !== id);
      setNotes(remaining);
      setSelectedNote(remaining[0] || null);
      onToast("Note deleted", "info");
    } catch (err: any) {
      onToast("Failed to delete note", "error");
    }
  };

  if (!user) {
    return (
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div className="empty-state-icon">📝</div>
        <h3>Developer Notes</h3>
        <p>Sign in to create, organize, and search your personal programming notes.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => onOpenAuth("login")}>Sign In</button>
      </div>
    );
  }

  const allTags = ["All", ...Array.from(new Set(notes.flatMap(n => n.tags || [])))];
  const filteredNotes = notes.filter(n => {
    if (selectedTag !== "All" && !(n.tags ?? []).includes(selectedTag)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (n.title ?? "").toLowerCase().includes(q) || (n.content ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>📝 Developer Notes</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Markdown-powered developer notebook for algorithms, interview notes, and architecture diagrams.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleCreateNote}>
          + New Note
        </button>
      </div>

      <div className="notes-layout">
        {/* Left Sidebar Pane: Notes List */}
        <div className="notes-sidebar-pane">
          <input
            className="input"
            style={{ marginBottom: 12 }}
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {allTags.length > 1 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {allTags.map(t => (
                <button
                  key={t}
                  className={`badge ${selectedTag === t ? "badge-blue" : "badge-gray"}`}
                  style={{ border: "none", cursor: "pointer", fontSize: 11 }}
                  onClick={() => setSelectedTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: 8 }} />
              ))
            ) : filteredNotes.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 24, fontSize: 13 }}>
                No notes found.
              </div>
            ) : (
              filteredNotes.map(n => {
                const isActive = selectedNote?.id === n.id;
                return (
                  <div
                    key={n.id}
                    className={`note-item-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedNote(n)}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {n.title || "Untitled"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                      {n.tags.length > 0 && <span>#{n.tags[0]}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Note Editor / Preview */}
        <div className="notes-editor-pane">
          {selectedNote ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <input
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "var(--text-primary)", fontSize: 20, fontWeight: 800,
                    flex: 1, minWidth: 200
                  }}
                  placeholder="Note Title..."
                  value={selectedNote.title}
                  onChange={e => setSelectedNote({ ...selectedNote, title: e.target.value })}
                />

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    className={`btn btn-sm ${previewMode ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setPreviewMode(p => !p)}
                  >
                    {previewMode ? "✏️ Edit" : "👁️ Preview"}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveNote} disabled={saving}>
                    {saving ? "Saving..." : "💾 Save"}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: "var(--accent-red)" }}
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Tags:</span>
                <input
                  className="input"
                  style={{ height: 30, fontSize: 12, padding: "4px 10px" }}
                  placeholder="e.g. dsa, arrays, interview (comma-separated)"
                  value={selectedNote.tags.join(", ")}
                  onChange={e => {
                    const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                    setSelectedNote({ ...selectedNote, tags });
                  }}
                />
              </div>

              {previewMode ? (
                <div
                  className="markdown-article"
                  style={{ flex: 1, overflowY: "auto", padding: "12px 4px", borderTop: "1px solid var(--border-light)" }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedNote.content) }}
                />
              ) : (
                <textarea
                  className="code-textarea"
                  style={{
                    flex: 1, border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)",
                    padding: 16, fontFamily: "var(--font-mono)", fontSize: 13.5,
                    resize: "none", minHeight: 400
                  }}
                  placeholder="Write in Markdown..."
                  value={selectedNote.content}
                  onChange={e => setSelectedNote({ ...selectedNote, content: e.target.value })}
                />
              )}
            </>
          ) : (
            <div className="empty-state" style={{ margin: "auto" }}>
              <div className="empty-state-icon">📋</div>
              <h3>No note selected</h3>
              <p>Select a note from the left sidebar or create a new one.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={handleCreateNote}>+ Create Note</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}