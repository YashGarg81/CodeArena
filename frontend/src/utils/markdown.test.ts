import { describe, it, expect } from "bun:test";
import { escHtml, markdownToHtml } from "./markdown";

describe("Frontend Markdown & XSS Sanitizer Suite", () => {
  it("escHtml properly escapes special HTML characters", () => {
    expect(escHtml('<script>alert("XSS")</script>')).toBe(
      "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
    );
    expect(escHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
  });

  it("markdownToHtml safely converts markdown headings and bold text", () => {
    const html = markdownToHtml("# Title\n\n**bold text**");
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<strong>bold text</strong>");
  });

  it("markdownToHtml disarms malicious script and event handler injection vectors", () => {
    const malicious = '<img src=x onerror=alert(1)> and <script>alert("hacked")</script>';
    const sanitized = markdownToHtml(malicious);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("onerror");
  });

  it("markdownToHtml disarms javascript: URI schemes", () => {
    const malicious = '[click here](javascript:alert("XSS"))';
    const sanitized = markdownToHtml(malicious);
    expect(sanitized).not.toContain("javascript:");
  });
});
