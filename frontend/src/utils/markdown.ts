export const escHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function markdownToHtml(md: string): string {
  if (!md) return "";
  const hasHtml = /<\/?(strong|em|code|pre|p|h\d|ul|ol|li|span|div|table|tr|td|th)\b/i.test(md);

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
    .replace(/^\d+\. (.+)$/gm, (_, t) => `<li>${escHtml(t)}</li>`);

  if (!hasHtml) {
    processed = processed
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(?!<[hup]|<li|<pre|<ul)(.+)$/gm, (_, t) => `<p>${escHtml(t)}</p>`);
  } else {
    processed = processed.replace(/\n\n/g, "<br/><br/>");
  }

  return processed;
}
