import React, { useState } from "react";
import axios from "axios";
import { API } from "../../services/api";
import type { User } from "../../types";

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────

export function AuthModal({ mode, onClose, onSuccess }: {
  mode: "login" | "signup"; onClose: () => void; onSuccess: (user: User, token: string) => void;
}) {
  const [tab, setTab] = useState<"login" | "signup" | "forgot" | "reset">(mode);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", username: "", resetToken: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async () => {
    if (tab === "forgot") {
      if (!form.email.trim()) {
        setError("Please enter your account email address.");
        return;
      }
      setLoading(true); setError(""); setSuccessMsg("");
      try {
        const { data } = await axios.post(`${API}/api/v1/auth/forgot-password`, { email: form.email.trim() });
        setSuccessMsg(data?.message || "Password reset instructions dispatched! Check your email.");
        if (data?.resetToken) {
          setForm(f => ({ ...f, resetToken: data.resetToken }));
        }
      } catch (e: any) {
        setError(e.response?.data?.error || "Failed to process reset request. Please try again.");
      } finally { setLoading(false); }
      return;
    }

    if (tab === "reset") {
      if (!form.resetToken.trim()) {
        setError("Please enter the security reset token.");
        return;
      }
      if (!form.password || form.password.length < 8) {
        setError("New password must be at least 8 characters long.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true); setError(""); setSuccessMsg("");
      try {
        const { data } = await axios.post(`${API}/api/v1/auth/reset-password`, {
          token: form.resetToken.trim(),
          newPassword: form.password
        });
        setSuccessMsg(data?.message || "Password reset successfully! You may now sign in.");
        setTimeout(() => {
          setTab("login");
          setSuccessMsg("Password updated! Please sign in with your new credentials.");
          setForm(f => ({ ...f, password: "", confirmPassword: "", resetToken: "" }));
        }, 1500);
      } catch (e: any) {
        setError(e.response?.data?.error || "Failed to reset password. Token may be expired.");
      } finally { setLoading(false); }
      return;
    }

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    if (tab === "signup") {
      if (!form.name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (form.confirmPassword && form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true); setError(""); setSuccessMsg("");
    try {
      const endpoint = tab === "signup" ? "/api/v1/auth/signup" : "/api/v1/auth/login";
      const payload = tab === "signup"
        ? {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            username: form.username.trim() || undefined
          }
        : {
            email: form.email.trim().toLowerCase(),
            password: form.password
          };
      const { data } = await axios.post(`${API}${endpoint}`, payload);
      if (data?.user && data?.token) {
        onSuccess(data.user, data.token);
      } else {
        setError(data?.error || "Authentication failed. Please check your credentials.");
      }
    } catch (e: any) {
      setError(e.response?.data?.error || "Authentication failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const handleSocialAuth = async (provider: "github" | "google") => {
    setLoading(true); setError(""); setSuccessMsg("");

    // Real OAuth UI Flow:
    // 1. Check for configured client IDs in environment or build define
    const GITHUB_CLIENT_ID = (typeof process !== "undefined" && process.env?.GITHUB_CLIENT_ID) ||
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GITHUB_CLIENT_ID) ||
      "";
    const GOOGLE_CLIENT_ID = (typeof process !== "undefined" && process.env?.GOOGLE_CLIENT_ID) || 
      (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) ||
      "";

    const clientId = provider === "github" ? GITHUB_CLIENT_ID : GOOGLE_CLIENT_ID;

    if (!clientId) {
      setLoading(false);
      setError(
        `${provider === "github" ? "GitHub" : "Google"} OAuth is not configured yet (${provider.toUpperCase()}_CLIENT_ID missing in environment). Please sign in using email and password.`
      );
      return;
    }

    // Fetch cryptographic CSRF state from backend
    let state = "";
    try {
      const stateRes = await axios.get(`${API}/api/v1/auth/oauth/state?provider=${provider}`);
      state = stateRes.data?.state || "";
    } catch {
      // Fallback state if offline
      state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // Build standard OAuth authorization redirect URL with state protection
    const redirectUri = window.location.origin;
    let authUrl = "";
    if (provider === "github") {
      authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${encodeURIComponent(state)}`;
    } else {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&state=${encodeURIComponent(state)}`;
    }

    // Open real provider OAuth popup
    const popup = window.open(authUrl, `${provider}_oauth`, "width=600,height=700,status=no,toolbar=no,menubar=no");
    if (!popup) {
      setLoading(false);
      setError("Failed to open OAuth popup window. Please allow popups for this domain.");
      return;
    }

    // Listen for OAuth token callback from popup
    const messageHandler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.provider === provider && event.data?.token) {
        window.removeEventListener("message", messageHandler);
        try {
          const { data } = await axios.post(`${API}/api/v1/auth/social`, {
            provider,
            oauthToken: event.data.token,
            state: event.data.state || state
          });
          if (data?.user && data?.token) {
            onSuccess(data.user, data.token);
          } else {
            setError(data?.error || "Social authentication failed.");
          }
        } catch (e: any) {
          setError(e.response?.data?.error || "Social authentication failed.");
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener("message", messageHandler);

    // Timeout watchdog for popup closure without completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageHandler);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation" aria-label="Close authentication modal">
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="modal-title" id="auth-modal-title">
              {tab === "login" ? "Welcome back 👋" :
               tab === "signup" ? "Join CodeArena 🚀" :
               tab === "forgot" ? "Reset Password 🔑" : "Create New Password 🛡️"}
            </div>
            <div className="modal-subtitle">
              {tab === "login" ? "Sign in to continue your journey" :
               tab === "signup" ? "Start solving, learning, competing" :
               tab === "forgot" ? "We'll send a secure reset token to your email" :
               "Choose a strong new password for your account"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)", padding: "4px" }} aria-label="Close modal">×</button>
        </div>

        {(tab === "login" || tab === "signup") && (
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}>Sign In</button>
            <button className={`tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setError(""); setSuccessMsg(""); }}>Sign Up</button>
          </div>
        )}

        {tab === "signup" && (
          <>
            <div className="form-group">
              <label className="label" htmlFor="auth-name">Full Name</label>
              <input id="auth-name" className="input" placeholder="Your full name" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(""); }} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="auth-username">Username (optional)</label>
              <input id="auth-username" className="input" placeholder="e.g. john_doe" value={form.username} onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError(""); }} />
            </div>
          </>
        )}

        {tab !== "reset" && (
          <div className="form-group">
            <label className="label" htmlFor="auth-email">Email</label>
            <input id="auth-email" className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(""); }} />
          </div>
        )}

        {tab === "reset" && (
          <div className="form-group">
            <label className="label" htmlFor="auth-reset-token">Security Reset Token</label>
            <input id="auth-reset-token" className="input" placeholder="Paste 64-character security token" value={form.resetToken} onChange={e => { setForm(f => ({ ...f, resetToken: e.target.value })); setError(""); }} />
          </div>
        )}

        {(tab === "login" || tab === "signup" || tab === "reset") && (
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label className="label" htmlFor="auth-password" style={{ marginBottom: 0 }}>
                {tab === "reset" ? "New Password" : "Password"}
              </label>
              {tab === "login" && (
                <button
                  type="button"
                  onClick={() => { setTab("forgot"); setError(""); setSuccessMsg(""); }}
                  style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: 12, cursor: "pointer", padding: 0 }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="auth-password"
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder={tab === "signup" ? "At least 8 characters" : "••••••••"}
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(""); }}
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: "absolute",
                  right: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
        )}

        {(tab === "signup" || tab === "reset") && (
          <div className="form-group">
            <label className="label" htmlFor="auth-confirm-password">Confirm Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="auth-confirm-password"
                className="input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setError(""); }}
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(p => !p)}
                style={{
                  position: "absolute",
                  right: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
        )}

        {error && <div style={{ color: "var(--accent-red)", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "rgba(248,81,73,0.1)", borderRadius: 6 }}>{error}</div>}
        {successMsg && (
          <div style={{ color: "var(--accent-green)", fontSize: 13, marginBottom: 12, padding: "10px 12px", background: "rgba(63,185,80,0.1)", borderRadius: 6, lineHeight: 1.4 }}>
            <div>{successMsg}</div>
            {tab === "forgot" && form.resetToken && (
              <button
                type="button"
                className="btn btn-primary btn-sm w-full"
                style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                onClick={() => { setTab("reset"); setError(""); setSuccessMsg(""); }}
              >
                Proceed to Set New Password →
              </button>
            )}
          </div>
        )}

        <button className="btn btn-primary w-full" style={{ marginBottom: 16 }} onClick={submit} disabled={loading}>
          {loading ? <span className="animate-spin">⚙</span> :
           tab === "login" ? "Sign In" :
           tab === "signup" ? "Create Account" :
           tab === "forgot" ? "Send Reset Instructions" : "Update Password & Revoke Sessions"}
        </button>

        {tab === "forgot" && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
              style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", padding: 0 }}
            >
              ← Back to Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("reset"); setError(""); setSuccessMsg(""); }}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
            >
              Have a token? Reset here →
            </button>
          </div>
        )}

        {tab === "reset" && (
          <div style={{ textAlign: "center", fontSize: 13, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
              style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", padding: 0 }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {(tab === "login" || tab === "signup") && (
          <>
            <div className="auth-divider"><div className="auth-divider-line" /><span>1-click social login</span><div className="auth-divider-line" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                onClick={() => handleSocialAuth("github")}
                disabled={loading}
                aria-label="Sign in with GitHub"
              >
                🐙 GitHub
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                onClick={() => handleSocialAuth("google")}
                disabled={loading}
                aria-label="Sign in with Google"
              >
                🔵 Google
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}