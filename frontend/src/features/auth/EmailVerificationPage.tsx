import React, { useState, useEffect } from "react";
import axios from "axios";
import { Icons } from "../../components/ui/Icons";
import { StateView } from "../../components/common/StateView";
import { API } from "../../services/api";
import type { User } from "../../types";

export function EmailVerificationPage({ token, email, user, onNavigate, onToast }: {
  token?: string; email?: string; user: User | null; onNavigate: (p: string) => void; onToast: (m: string, t: string) => void;
}) {
  const [inputToken, setInputToken] = useState(token || "");
  const [targetEmail, setTargetEmail] = useState(email || user?.email || "");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (tokToVerify?: string) => {
    const tok = (tokToVerify || inputToken).trim();
    if (!tok) {
      setError("Please provide a valid email verification token.");
      return;
    }
    setVerifying(true); setError(""); setMessage("");
    try {
      const { data } = await axios.post(`${API}/api/v1/auth/verify-email`, { token: tok });
      if (data.success) {
        setVerified(true);
        setMessage(data.message || "Email address has been verified successfully!");
        onToast("Email verified successfully! 🚀", "success");
      } else {
        setError(data.message || "Failed to verify email token.");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.error || "Invalid or expired verification token.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!targetEmail.trim()) {
      setError("Please enter your account email address.");
      return;
    }
    setResending(true); setError(""); setMessage("");
    try {
      const { data } = await axios.post(`${API}/api/v1/auth/resend-verification`, { email: targetEmail.trim() });
      setMessage(data.message || "Verification email has been resent! Please check your inbox.");
      onToast("Verification link sent! ✉️", "info");
      if (data.verificationToken) {
        setInputToken(data.verificationToken);
      }
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: 580 }}>
      <div className="card" style={{ padding: "32px 28px", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: verified ? "rgba(63,185,80,0.15)" : "rgba(99,102,241,0.15)",
          color: verified ? "var(--accent-green)" : "var(--accent-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, margin: "0 auto 18px"
        }}>
          {verified ? "✅" : "✉️"}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          {verified ? "Email Verified! 🎉" : "Verify Your Email Address"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5, marginBottom: 24 }}>
          {verified 
            ? "Your account email has been verified. You have unlocked all platform features."
            : "Confirm your email to secure your account, receive contest updates, and access collaborative features."}
        </p>

        {error && (
          <div style={{ color: "var(--accent-red)", fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "rgba(248,81,73,0.1)", borderRadius: 6, textAlign: "left" }}>
            ❌ {error}
          </div>
        )}

        {message && (
          <div style={{ color: "var(--accent-green)", fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "rgba(63,185,80,0.1)", borderRadius: 6, textAlign: "left" }}>
            ✅ {message}
          </div>
        )}

        {!verified ? (
          <div style={{ textAlign: "left" }}>
            <div className="form-group">
              <label className="label">Verification Token</label>
              <input
                className="input"
                placeholder="Paste 64-character verification token"
                value={inputToken}
                onChange={e => { setInputToken(e.target.value); setError(""); }}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              style={{ marginBottom: 16 }}
              onClick={() => handleVerify()}
              disabled={verifying}
            >
              {verifying ? "⏳ Verifying..." : "Confirm & Verify Email"}
            </button>

            <div className="auth-divider" style={{ margin: "20px 0" }}>
              <div className="auth-divider-line" />
              <span>Didn't receive an email?</span>
              <div className="auth-divider-line" />
            </div>

            <div className="form-group">
              <label className="label">Account Email</label>
              <input
                className="input"
                placeholder="you@example.com"
                value={targetEmail}
                onChange={e => setTargetEmail(e.target.value)}
              />
            </div>

            <button
              className="btn btn-secondary w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "⏳ Sending..." : "Resend Verification Email"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => onNavigate("problems")}>
              Explore Problems ⚡
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate("dashboard")}>
              Go to Dashboard 📊
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 404 NOT FOUND PAGE ──────────────────────────────────────────────────────