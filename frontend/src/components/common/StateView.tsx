import React, { useEffect } from "react";
import { Icons } from "../ui/Icons";

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────

export function Toast({ msg, type, onClose }: { msg: string; type: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span>
        {type === "success" ? <Icons.CheckCircle size={16} className="text-emerald-400" /> : type === "error" ? <Icons.Alert size={16} className="text-rose-400" /> : <Icons.Help size={16} className="text-blue-400" />}
      </span>
      <span style={{ fontSize: "13px" }}>{msg}</span>
      <button onClick={onClose} aria-label="Close notification" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16 }}>×</button>
    </div>
  );
}

// ─── CONSISTENT STATUS & ERROR VIEW COMPONENT ─────────────────────────────────

export function StateView({
  type = "empty",
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: {
  type?: "loading" | "empty" | "error" | "offline" | "unauthorized" | "forbidden" | "404";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  const configs = {
    loading: { icon: "⏳", defaultTitle: "Loading Content...", defaultDesc: "Fetching the latest algorithmic data from the server." },
    empty: { icon: "📦", defaultTitle: "No Data Found", defaultDesc: "There are no records matching your current filter criteria." },
    error: { icon: "⚠️", defaultTitle: "Something Went Wrong", defaultDesc: "An unexpected network or engine error occurred." },
    offline: { icon: "📡", defaultTitle: "Offline Mode", defaultDesc: "You appear to be offline. Reconnect to the internet to resume live syncing." },
    unauthorized: { icon: "🔒", defaultTitle: "Authentication Required", defaultDesc: "Please sign in to access your saved solution submissions and rating." },
    forbidden: { icon: "🛡️", defaultTitle: "Access Restricted", defaultDesc: "You do not have the required permissions to view this resource." },
    "404": { icon: "🧭", defaultTitle: "Page Not Found", defaultDesc: "The requested route does not exist or has been moved." }
  };

  const current = configs[type] || configs.empty;

  return (
    <div className="state-container" role={type === "error" || type === "offline" ? "alert" : "status"}>
      <div className="state-icon">{current.icon}</div>
      <div className="state-title">{title || current.defaultTitle}</div>
      <div className="state-desc">{description || current.defaultDesc}</div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="state-actions">
          {actionLabel && onAction && (
            <button className="btn btn-primary btn-sm" onClick={onAction}>
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button className="btn btn-secondary btn-sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}