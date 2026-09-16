import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../services/api";

export function ResetPasswordPage({
  token,
  email,
  onNavigate,
  onToast,
  onOpenLogin,
}: {
  token?: string;
  email?: string;
  onNavigate: (p: string) => void;
  onToast: (m: string, t: string) => void;
  onOpenLogin?: () => void;
}) {
  const [resetToken, setResetToken] = useState(token || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!resetToken && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const qToken = urlParams.get("token");
      if (qToken) {
        setResetToken(qToken);
      }
    }
  }, []);

  // Proactively verify token when provided
  useEffect(() => {
    if (resetToken && resetToken.length >= 10) {
      axios
        .get(`${API}/api/v1/auth/verify-reset-token?token=${encodeURIComponent(resetToken.trim())}`)
        .then((res) => {
          if (res.data?.valid) {
            setTokenValid(true);
            setError("");
          } else {
            setTokenValid(false);
            setError(res.data?.error || "This reset token is invalid or has expired.");
          }
        })
        .catch((err) => {
          setTokenValid(false);
          setError(err.response?.data?.error || "This reset token is invalid or has expired.");
        });
    }
  }, [resetToken]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!resetToken.trim()) {
      setError("Please provide a valid security reset token.");
      return;
    }
    if (!password || password.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${API}/api/v1/auth/reset-password`, {
        token: resetToken.trim(),
        newPassword: password,
      });

      if (data?.success) {
        setSuccess(true);
        onToast("Password has been reset successfully! 🛡️", "success");
      } else {
        setError(data?.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to reset password. Token may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 540, margin: "0 auto" }}>
      <div className="card" style={{ padding: "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: success ? "rgba(63,185,80,0.15)" : "rgba(99,102,241,0.15)",
              color: success ? "var(--accent-green)" : "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              margin: "0 auto 16px",
            }}
          >
            {success ? "✅" : "🔑"}
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
            {success ? "Password Updated! 🎉" : "Create New Password"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
            {success
              ? "Your password has been changed and all prior active sessions have been securely revoked."
              : "Enter your secure reset token and choose a strong new password for your CodeArena account."}
          </p>
        </div>

        {error && (
          <div
            style={{
              color: "var(--accent-red)",
              fontSize: 13,
              marginBottom: 16,
              padding: "10px 14px",
              background: "rgba(248,81,73,0.1)",
              borderRadius: 6,
              border: "1px solid rgba(248,81,73,0.2)",
            }}
          >
            ❌ {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              className="btn btn-primary w-full"
              style={{ marginBottom: 12, padding: "12px 20px", fontSize: 14 }}
              onClick={() => {
                if (onOpenLogin) onOpenLogin();
                else onNavigate("home");
              }}
            >
              Sign In to Your Account 🚀
            </button>
            <button className="btn btn-ghost w-full" onClick={() => onNavigate("problems")}>
              Explore Problems Catalog →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="label" htmlFor="reset-token-input">
                Security Reset Token
              </label>
              <input
                id="reset-token-input"
                className="input"
                placeholder="Paste 64-character token"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  setError("");
                }}
                disabled={loading}
              />
              {tokenValid === true && (
                <div style={{ color: "var(--accent-green)", fontSize: 11, marginTop: 4 }}>
                  ✓ Valid token verified
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="new-password-input">
                New Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="new-password-input"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 10,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "4px",
                    fontSize: 16,
                  }}
                  title={showPassword ? "Hide" : "Show"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="confirm-new-password-input">
                Confirm New Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="confirm-new-password-input"
                  className="input"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 10,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "4px",
                    fontSize: 16,
                  }}
                  title={showConfirmPassword ? "Hide" : "Show"}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ marginTop: 8, padding: "12px 20px", fontSize: 14 }}
              disabled={loading}
            >
              {loading ? "⏳ Updating Password..." : "Update Password & Revoke Sessions"}
            </button>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                  else onNavigate("home");
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
