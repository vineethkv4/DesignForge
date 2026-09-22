import type { ReactNode } from "react";
import type { CodeTab } from "@/types/tokens";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Lightweight CSS / config highlighter — no extra deps */
export function highlightCode(code: string, tab: CodeTab): ReactNode {
  if (tab === "css") {
    return (
      <code
        className="ed-code-hl"
        dangerouslySetInnerHTML={{ __html: highlightCss(code) }}
      />
    );
  }
  if (tab === "json") {
    return (
      <code
        className="ed-code-hl"
        dangerouslySetInnerHTML={{ __html: highlightJson(code) }}
      />
    );
  }
  if (tab === "typescript") {
    return (
      <code
        className="ed-code-hl"
        dangerouslySetInnerHTML={{ __html: highlightTypescript(code) }}
      />
    );
  }
  if (tab === "markdown") {
    return (
      <code
        className="ed-code-hl"
        dangerouslySetInnerHTML={{ __html: highlightMarkdown(code) }}
      />
    );
  }
  // Tailwind config snippet — treat like JS/TS
  return (
    <code
      className="ed-code-hl"
      dangerouslySetInnerHTML={{ __html: highlightTypescript(code) }}
    />
  );
}

function highlightCss(code: string): string {
  const escaped = escapeHtml(code);
  return escaped
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="ed-tok-comment">$1</span>')
    .replace(/(:root)/g, '<span class="ed-tok-selector">$1</span>')
    .replace(
      /(^|\n)([ \t]*)(--[\w-]+)(\s*:)/gm,
      '$1$2<span class="ed-tok-property">$3</span>$4'
    )
    .replace(
      /(:)(\s*)([^;\n{]+?)(;)/g,
      '$1$2<span class="ed-tok-value">$3</span>$4'
    );
}

function highlightJson(code: string): string {
  const escaped = escapeHtml(code);
  return escaped
    .replace(
      /("(?:\\.|[^"\\])*")(\s*:)/g,
      '<span class="ed-tok-property">$1</span>$2'
    )
    .replace(
      /(:\s*)("(?:\\.|[^"\\])*")/g,
      '$1<span class="ed-tok-string">$2</span>'
    )
    .replace(
      /(:\s*)(-?\d+(?:\.\d+)?)(?=[,\s}\]])/g,
      '$1<span class="ed-tok-number">$2</span>'
    );
}

function highlightMarkdown(code: string): string {
  const escaped = escapeHtml(code);
  return escaped
    .replace(
      /(^|\n)(#{1,6} [^\n]*)/g,
      '$1<span class="ed-tok-keyword">$2</span>'
    )
    .replace(
      /(^|\n)(\|[ -]*(?:\|[ -]*)+\|)(?=\n|$)/g,
      '$1<span class="ed-tok-comment">$2</span>'
    )
    .replace(/(`[^`\n]+`)/g, '<span class="ed-tok-string">$1</span>')
    .replace(/(\*\*[^*\n]+\*\*)/g, '<span class="ed-tok-property">$1</span>');
}

function highlightTypescript(code: string): string {
  const escaped = escapeHtml(code);
  return escaped
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="ed-tok-comment">$1</span>')
    .replace(
      /(^|\n)([ \t]*)(\/\/[^\n]*)/g,
      '$1$2<span class="ed-tok-comment">$3</span>'
    )
    .replace(
      /\b(export|const|as|theme|extend|colors|spacing|borderRadius|boxShadow|fontSize)\b/g,
      '<span class="ed-tok-keyword">$1</span>'
    )
    .replace(/('(?:\\.|[^'\\])*')/g, '<span class="ed-tok-string">$1</span>');
}
