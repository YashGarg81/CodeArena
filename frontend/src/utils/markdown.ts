import DOMPurify from "dompurify";

export const escHtml = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Strips dangerous HTML tags and event handlers (e.g. onerror, onclick, script, iframe, svg)
 * in headless/SSR environments when browser DOM is absent.
 */
function sanitizeStructuralHtml(rawHtml: string): string {
  let cleaned = rawHtml.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style\b[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<\/?(script|style|iframe|object|embed|svg|form|base|link|meta|applet)\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");
  cleaned = cleaned.replace(/(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');
  cleaned = cleaned.replace(/(href|src)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, '$1="#"');
  return cleaned;
}

export function markdownToHtml(md: string): string {
  if (!md || typeof md !== "string") return "";

  // Convert standard markdown elements with escaped code blocks/inline code
  let processed = md
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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
      const safeUrl = /^(?:https?:\/\/|mailto:|\/|#)/i.test(url.trim()) ? escHtml(url.trim()) : "#";
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${escHtml(text)}</a>`;
    })
    .replace(/\n\n/g, "<br/><br/>");

  // DOMPurify with strict allowlist to eliminate stored and reflected XSS vectors in browser runtime
  if (typeof window !== "undefined" && typeof DOMPurify.sanitize === "function") {
    return DOMPurify.sanitize(processed, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "br", "hr", "strong", "em", "b", "i", "u", "s",
        "code", "pre", "ul", "ol", "li", "blockquote",
        "a", "table", "thead", "tbody", "tr", "th", "td",
        "span", "div"
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "class", "title"],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }

  // Fallback for SSR and headless unit test environments
  return sanitizeStructuralHtml(processed);
}
