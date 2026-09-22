/**
 * Client-only design-system downloads.
 * Reuses `generateDesignSystemCode` / DTCG export — do not duplicate string building here.
 */
import {
  generateDesignSystemCode,
  type EditorDesignSystem,
} from "@/lib/codeGen";
import { downloadDTCG } from "@/lib/export/figmaTokens";
import type { CodeTab } from "@/types/tokens";

export type ExportDownloadFormat = CodeTab | "figma";

const FORMAT_META: Record<
  ExportDownloadFormat,
  { label: string; mime: string; ext: string }
> = {
  css: { label: "CSS vars", mime: "text/css", ext: "css" },
  tailwind: {
    label: "Tailwind",
    mime: "text/javascript",
    ext: "js",
  },
  json: { label: "JSON", mime: "application/json", ext: "json" },
  typescript: {
    label: "TypeScript",
    mime: "text/typescript",
    ext: "ts",
  },
  markdown: {
    label: "Markdown docs",
    mime: "text/markdown",
    ext: "md",
  },
  figma: {
    label: "Figma Token",
    mime: "application/json",
    ext: "tokens.json",
  },
};

export const EXPORT_DOWNLOAD_OPTIONS: {
  id: ExportDownloadFormat;
  label: string;
}[] = (
  ["css", "tailwind", "json", "typescript", "markdown", "figma"] as const
).map((id) => ({ id, label: FORMAT_META[id].label }));

export function exportFilename(
  namespace: string,
  format: ExportDownloadFormat
): string {
  const ns = namespace.trim() || "tokens";
  if (format === "figma") return `${ns}.tokens.json`;
  if (format === "css") return `${ns}-tokens.css`;
  if (format === "tailwind") return `${ns}-tailwind.config.js`;
  if (format === "typescript") return `${ns}-tokens.ts`;
  if (format === "markdown") return `${ns}-design-system.md`;
  return `${ns}-tokens.json`;
}

function triggerBlobDownload(
  content: string,
  filename: string,
  mime: string
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Triggers a browser download for one export format. Returns the filename used. */
export function downloadDesignSystemExport(
  designSystem: EditorDesignSystem,
  namespace: string,
  format: ExportDownloadFormat
): string {
  if (format === "figma") {
    return downloadDTCG(designSystem, namespace);
  }

  const meta = FORMAT_META[format];
  const body = generateDesignSystemCode(designSystem, namespace, format);
  const filename = exportFilename(namespace, format);
  const content = body.endsWith("\n") ? body : `${body}\n`;
  triggerBlobDownload(content, filename, meta.mime);
  return filename;
}

/** @deprecated Prefer downloadDesignSystemExport(..., "css") */
export function exportCssFilename(namespace: string): string {
  return exportFilename(namespace, "css");
}

/** @deprecated Prefer downloadDesignSystemExport(..., "css") */
export function downloadDesignSystemCss(
  designSystem: EditorDesignSystem,
  namespace: string
): string {
  return downloadDesignSystemExport(designSystem, namespace, "css");
}
