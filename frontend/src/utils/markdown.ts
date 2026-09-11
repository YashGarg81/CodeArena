export const escHtml = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Strips dangerous HTML tags and event handlers (e.g. onerror, onclick, script, iframe, svg)
 */
function sanitizeHtml(rawHtml: string): string {
  // Strip script and style blocks including their inner contents
  let cleaned = rawHtml.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style\b[\s\S]*?<\/style>/gi, "");

  // Strip remaining dangerous HTML tags
  cleaned = cleaned.replace(/<\/?(script|style|iframe|object|embed|svg|form|base|link|meta|applet)\b[^>]*>/gi, "");

  // Strip inline event handlers (onerror, onload, onclick, onmouseover, etc.)
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // Strip javascript: and vbscript: URIs
  cleaned = cleaned.replace(/(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');
  cleaned = cleaned.replace(/(href|src)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, '$1="#"');

  return cleaned;
}

export function markdownToHtml(md: string): string {
  if (!md || typeof md !== "string") return "";

  // Step 1: Pre-sanitize raw input to disarm active script/event payloads
  const sanitizedInput = sanitizeHtml(md);

  // Step 2: Convert standard markdown elements with escaped contents
  let processed = sanitizedInput
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code class="lang-${escHtml(lang)}">${escHtml(code)}</code></pre>`)
    .replace(/`([^`]+)`/g, (_, c) => `<code>${escHtml(c)}</code>`)
    .replace(/^### (.+)$/gm, (_, t) => `<h3>${escHtml(t)}</h3>`)
    .replace(/^## (.+)$/gm, (_, t) => `<h2>${escHtml(t)}</h2>`)
    .replace(/^# (.+)$/gm, (_, t) => `<h2>${escHtml(t)}</h2>`)
    .replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong>${escHtml(t)}</strong>`)
    .replace(/\*(.+?)\*/g, (_, t) => `<em>${escHtml(t)}</em>`)
    .replace(/^- (.+)$/gm, (_, t) => `<li>${escHtml(t)}</li>`)
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^\d+\. (.+)$/gm, (_, t) => `<li>${escHtml(t)}</li>`)
    .replace(/\n\n/g, "<br/><br/>");

  // Step 3: Final sanitization pass over generated HTML to guarantee no payload bypass
  return sanitizeHtml(processed);
}
