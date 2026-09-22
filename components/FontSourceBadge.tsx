"use client";

import { IconAlertTriangle, IconWorld } from "@tabler/icons-react";
import type { TypographyToken } from "@/types/tokens";

/** Extract a hostname from pasted embed markup / CSS for tooltip display. */
export function extractEmbedHost(embedCode: string | undefined): string {
  const raw = embedCode?.trim() ?? "";
  if (!raw) return "";

  const hrefMatch =
    raw.match(/\bhref\s*=\s*["']([^"']+)["']/i) ??
    raw.match(/(https?:\/\/[^\s"'<>]+)/i);
  if (hrefMatch?.[1]) {
    try {
      return new URL(
        hrefMatch[1].replace(/&amp;/g, "&")
      ).hostname.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
  }

  const urlMatch = raw.match(
    /url\s*\(\s*['"]?(https?:\/\/[^'")\s]+)/i
  );
  if (urlMatch?.[1]) {
    try {
      return new URL(urlMatch[1]).hostname.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
  }

  return "";
}

function truncate(text: string, max = 48): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export type FontSourceBadgeProps = {
  token: Pick<
    TypographyToken,
    "source" | "embedStatus" | "resolvedFamily" | "embedCode" | "value"
  >;
  /** `"full"` = icon + label (card); `"icon"` = icon only (sidebar). */
  variant?: "full" | "icon";
  className?: string;
};

/**
 * Source badge for family tokens with `source === "embed"`.
 * Renders nothing for preset / undefined source.
 */
export function FontSourceBadge({
  token,
  variant = "full",
  className = "",
}: FontSourceBadgeProps) {
  if (token.source !== "embed") return null;

  const failed = token.embedStatus === "failed";
  // unverified shares the loaded look — avoid a flash while the load promise settles.
  const tone = failed ? "failed" : "ok";
  const family =
    token.resolvedFamily?.trim() ||
    token.value.split(",")[0]?.replace(/['"]/g, "").trim() ||
    "Embedded font";
  const host = extractEmbedHost(token.embedCode);
  const tip = truncate(host ? `${family} · ${host}` : family, 64);

  const Icon = failed ? IconAlertTriangle : IconWorld;

  return (
    <span
      className={`ed-font-src-badge ed-font-src-badge--${tone}${
        variant === "icon" ? " ed-font-src-badge--icon" : ""
      }${className ? ` ${className}` : ""}`}
      title={tip}
      aria-label={tip}
    >
      <Icon size={variant === "icon" ? 12 : 11} stroke={1.75} aria-hidden />
      {variant === "full" && <span className="ed-font-src-badge-lbl">Embedded</span>}
    </span>
  );
}
