import { auditService } from "./audit";
import { IS_PROD } from "./config";

export type EmailProvider = "console" | "resend";

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

export function getConfiguredEmailProvider(): EmailProvider {
  const configured = (process.env.EMAIL_PROVIDER || (IS_PROD ? "resend" : "console")).toLowerCase();
  return configured === "resend" ? "resend" : "console";
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
    if (provider === "console" || !IS_PROD) {
      console.info(`[email:${provider}] ${payload.subject} -> ${payload.to}`);
      console.info(payload.text);
      try {
        await auditService.log("EMAIL_SENT", {
          metadata: {
            provider,
            to: payload.to,
            subject: payload.subject,
            ...payload.metadata,
          },
        });
      } catch {
        // Best-effort audit logging; local/dev should never block email delivery.
      }
      return {
        success: true,
        provider,
        message: "Email queued for local or console delivery.",
      };
    }

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
          provider,
          to: payload.to,
          subject: payload.subject,
          messageId: data.id || null,
          ...payload.metadata,
        },
      });
    } catch {
      // Best effort
    }

    return {
      success: true,
      provider,
      messageId: data.id,
      message: "Email sent successfully via Resend.",
    };
  } catch (error: any) {
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
    } catch {
      // Ignore audit issues on failure.
    }

    return {
      success: false,
      provider,
      message: error?.message || "Unable to deliver email through the configured provider.",
    };
  }
}
