import nodemailer, { type Transporter } from "nodemailer";
import { auditService } from "./audit";
import { IS_PROD } from "./config";

export type EmailProvider = "console" | "resend" | "smtp";

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

export function getConfiguredEmailProvider(): EmailProvider {
  if (process.env.EMAIL_PROVIDER) {
    const configured = process.env.EMAIL_PROVIDER.toLowerCase();
    if (configured === "smtp" || configured === "resend" || configured === "console") {
      return configured as EmailProvider;
    }
  }
  if (process.env.SMTP_HOST || process.env.SMTP_USER) {
    return "smtp";
  }
  if (process.env.RESEND_API_KEY) {
    return "resend";
  }
  return "console";
}

let cachedSmtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter {
  if (!cachedSmtpTransporter) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";

    cachedSmtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
  }
  return cachedSmtpTransporter;
}

function normalizeTextForHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<{
  success: boolean;
  provider: EmailProvider;
  messageId?: string;
  message: string;
}> {
  const provider = getConfiguredEmailProvider();
  const fromAddress = process.env.EMAIL_FROM || "no-reply@codearena.dev";

  try {
    // 1. SMTP Delivery (e.g., Gmail, Outlook, Brevo, AWS SES, Mailtrap)
    if (provider === "smtp") {
      const transporter = getSmtpTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html || `<p>${normalizeTextForHtml(payload.text)}</p>`,
      });

      try {
        await auditService.log("EMAIL_SENT", {
          metadata: {
            provider: "smtp",
            to: payload.to,
            subject: payload.subject,
            messageId: info.messageId,
            ...payload.metadata,
          },
        });
      } catch {}

      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
        message: "Email sent successfully via SMTP.",
      };
    }

    // 2. Resend API Delivery
    if (provider === "resend") {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error("RESEND_API_KEY must be configured when EMAIL_PROVIDER=resend");
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [payload.to],
          subject: payload.subject,
          text: payload.text,
          html: payload.html || `<p>${normalizeTextForHtml(payload.text)}</p>`,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.message || "Failed to send email through Resend");
      }

      try {
        await auditService.log("EMAIL_SENT", {
          metadata: {
            provider: "resend",
            to: payload.to,
            subject: payload.subject,
            messageId: data.id || null,
            ...payload.metadata,
          },
        });
      } catch {}

      return {
        success: true,
        provider: "resend",
        messageId: data.id,
        message: "Email sent successfully via Resend.",
      };
    }

    // 3. Local / Development Console Fallback
    console.info("══════════════════════════════════════════════════════════════");
    console.info(`📧 [EMAIL:CONSOLE] Outgoing Transactional Email`);
    console.info(`To: ${payload.to}`);
    console.info(`From: ${fromAddress}`);
    console.info(`Subject: ${payload.subject}`);
    console.info("──────────────────────────────────────────────────────────────");
    console.info(payload.text);
    console.info("══════════════════════════════════════════════════════════════");

    try {
      await auditService.log("EMAIL_SENT", {
        metadata: {
          provider: "console",
          to: payload.to,
          subject: payload.subject,
          ...payload.metadata,
        },
      });
    } catch {}

    return {
      success: true,
      provider: "console",
      message: "Email queued for local console delivery.",
    };
  } catch (error: any) {
    // In development mode, if SMTP/Resend fails, fallback to console so developer is never locked out
    if (!IS_PROD) {
      console.warn(`⚠️ [EMAIL:${provider}] Network delivery failed (${error?.message}). Falling back to console output:`);
      console.info("══════════════════════════════════════════════════════════════");
      console.info(`📧 [EMAIL:FALLBACK] Outgoing Transactional Email`);
      console.info(`To: ${payload.to}`);
      console.info(`Subject: ${payload.subject}`);
      console.info("──────────────────────────────────────────────────────────────");
      console.info(payload.text);
      console.info("══════════════════════════════════════════════════════════════");

      return {
        success: true,
        provider: "console",
        message: `Delivery failed (${error?.message || "network error"}), logged to console.`,
      };
    }

    try {
      await auditService.log("EMAIL_SEND_FAILED", {
        metadata: {
          provider,
          to: payload.to,
          subject: payload.subject,
          error: error?.message || "Unknown email send failure",
          ...payload.metadata,
        },
      });
    } catch {}

    return {
      success: false,
      provider,
      message: error?.message || "Unable to deliver email through the configured provider.",
    };
  }
}
