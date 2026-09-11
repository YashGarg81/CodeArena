import React, { useState, useEffect } from "react";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { api } from "../../services/api";
import type { User, ForumPost, ForumPostDetail } from "../../types";
import { markdownToHtml } from "../../utils/markdown";

export function CommunityPage({ user, onToast }: { user: User | null; onToast: (msg: string, type: string) => void }) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<ForumPostDetail | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["All", "General", "Interviews", "Solutions", "System Design", "Questions"];

  const fetchPosts = () => {
    const cat = selectedCategory !== "All" ? `?category=${selectedCategory}` : "";
    api.get(`/api/v1/forum/posts${cat}`)
      .then(r => { setPosts(r.data?.posts || []); setLoading(false); })
      .catch(() => { setPosts([]); setLoading(false); });
  };

  useEffect(() => { fetchPosts(); }, [selectedCategory]);

  const createPost = async () => {
    if (!user) { onToast("Sign in to create posts", "error"); return; }
    if (!newPost.title || !newPost.content) { onToast("Title and content required", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/v1/forum/posts", newPost);
      fetchPosts(); setShowCreate(false); setNewPost({ title: "", content: "", category: "General" });
      onToast("Post published!", "success");
    } catch { onToast("Failed to create post", "error"); }
    setSubmitting(false);
  };

  const openPost = (id: string) => {
    api.get(`/api/v1/forum/posts/${id}`).then(r => setSelectedPost(r.data.post));
  };

  const addComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;
    try {
      await api.post(`/api/v1/forum/posts/${selectedPost.id}/comments`, { content: newComment });
      openPost(selectedPost.id); setNewComment(""); onToast("Comment added", "success");
    } catch { onToast("Failed to add comment", "error"); }
  };

  if (selectedPost) {
    return (
      <div className="container" style={{ padding: "28px 24px", maxWidth: 860 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => setSelectedPost(null)}>← Back to Discussions</button>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <span className={`badge badge-${selectedPost.category === "Interviews" ? "blue" : selectedPost.category === "Solutions" ? "easy" : "gray"}`}>{selectedPost.category}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{selectedPost.title}</h1>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            <span>👤 {selectedPost.user.name}</span>
            <span>🕐 {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
            <span>👁 {selectedPost.views} views</span>
          </div>
          <div style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{selectedPost.content}</div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>💬 {selectedPost.comments.length} Comments</h3>
        {selectedPost.comments.map(c => (
          <div key={c.id} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div className="user-avatar-lb" style={{ width: 32, height: 32, fontSize: 12 }}>{c.user.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.user.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.content}</div>
            </div>
          </div>
        ))}

        {user && (
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <div className="user-avatar-lb" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>{user.name[0]}</div>
            <div style={{ flex: 1 }}>
              <textarea className="input" placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} style={{ resize: "vertical", marginBottom: 8 }} />
              <button className="btn btn-primary btn-sm" onClick={addComment}>Post Comment</button>
            </div>
          </div>
        )}
        {!user && <div className="hint-box" style={{ marginTop: 16 }}>Sign in to join the discussion</div>}
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>💬 Community</h1>
        {user && <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={() => setShowCreate(true)}>+ New Post</button>}
      </div>

      <div className="forum-layout">
        <div>
          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            {categories.map(c => (
              <button key={c} className={`btn btn-sm ${selectedCategory === c ? "btn-primary" : "btn-secondary"}`} onClick={() => setSelectedCategory(c)}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 10 }} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">💬</div><h3>No posts yet</h3><p>Be the first to start a discussion!</p></div>
          ) : (
            posts.map(p => (
              <div key={p.id} className="forum-post-item" onClick={() => openPost(p.id)}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span className={`badge badge-${p.category === "Interviews" ? "blue" : p.category === "Solutions" ? "easy" : "gray"}`}>{p.category}</span>
                </div>
                <div className="forum-post-title">{p.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.content}</div>
                <div className="forum-meta">
                  <span>👤 {p.user.name}</span>
                  <span>🕐 {new Date(p.createdAt).toLocaleDateString()}</span>
                  <span>💬 {p._count.comments}</span>
                  <span>👁 {p.views}</span>
                  <span>❤️ {p.upvotes}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Community Guidelines</h3>
            {["Be respectful and constructive", "Share your own work only", "Tag problems with spoiler warnings", "Upvote helpful answers", "Keep discussions on topic"].map(g => (
              <div key={g} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                <span>✓</span><span>{g}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔥 Popular Tags</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["#dynamic-programming", "#graph", "#two-pointers", "#system-design", "#interview-exp", "#google", "#amazon"].map(t => (
                <span key={t} className="badge badge-blue" style={{ cursor: "pointer" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Create Post</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>
            <div className="form-group">
              <label className="label">Title</label>
              <input className="input" placeholder="What's your question or topic?" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Category</label>
              <select className="select w-full" value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}>
                {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Content</label>
              <textarea className="input" rows={6} placeholder="Share your thoughts, code, or question..." value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} style={{ resize: "vertical" }} />
            </div>
            <button className="btn btn-primary w-full" onClick={createPost} disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}