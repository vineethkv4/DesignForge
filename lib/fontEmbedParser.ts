/**
 * Pure parser for typography "Embed code" pastes.
 * Does not execute, inject, or sanitize for DOM — string extraction only.
 */

export type ParseFontEmbedResult =
  | { ok: true; family: string; kind: "link" | "font-face" }
  | { ok: false; error: string };

const DEFAULT_EMBED_FALLBACK = "system-ui, sans-serif";

/** Safe CSS stack used when clearing an embed back to preset. */
export const DEFAULT_PRESET_FONT_STACK =
  "Inter, system-ui, -apple-system, sans-serif";

export const DEFAULT_EMBED_FALLBACK_STACK = DEFAULT_EMBED_FALLBACK;

/** Compose the CSS stack stored on `token.value` for embed sources. */
export function composeEmbedFontValue(
  resolvedFamily: string,
  fallbackStack: string = DEFAULT_EMBED_FALLBACK
): string {
  const family = resolvedFamily.trim();
  const fallback = fallbackStack.trim() || DEFAULT_EMBED_FALLBACK;
  if (!family) return fallback;
  // Quote multi-word family names for valid CSS stacks.
  const needsQuotes = /\s/.test(family) && !/^["'].*["']$/.test(family);
  const head = needsQuotes ? `"${family.replace(/"/g, "")}"` : family;
  return `${head}, ${fallback}`;
}

/**
 * Extract a single font-family name from pasted embed code.
 * Accepts Google Fonts–style `<link href="...family=...">` or a raw `@font-face` block.
 */
export function parseFontEmbed(raw: string): ParseFontEmbedResult {
  const input = raw?.trim() ?? "";
  if (!input) {
    return { ok: false, error: "Paste a <link> tag or @font-face block." };
  }

  if (/<link\b/i.test(input) || /fonts\.googleapis\.com/i.test(input)) {
    return parseLinkEmbed(input);
  }

  if (/@font-face\b/i.test(input)) {
    return parseFontFaceEmbed(input);
  }

  return {
    ok: false,
    error:
      "Could not recognize embed code. Paste a Google Fonts <link> tag or a CSS @font-face block.",
  };
}

function parseLinkEmbed(input: string): ParseFontEmbedResult {
  // Prefer href="..." / href='...' on a link tag; else any fonts.googleapis.com URL in the paste.
  const hrefMatch =
    input.match(
      /<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/i
    ) ??
    input.match(
      /(https?:\/\/fonts\.googleapis\.com\/css2?\?[^\s"'<>]+)/i
    );

  if (!hrefMatch?.[1]) {
    return {
      ok: false,
      error:
        "Found a link-style paste but could not extract an href URL with a family= parameter.",
    };
  }

  let href = hrefMatch[1].trim();
  // Tolerate HTML entities in pasted markup.
  href = href
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return {
      ok: false,
      error: "The link href is not a valid URL.",
    };
  }

  const host = url.hostname.toLowerCase();
  const isGoogle =
    host === "fonts.googleapis.com" || host.endsWith(".googleapis.com");
  // Allow non-Google hosts only if they clearly expose family= (Fontshare-style, etc.).
  const familyParams = url.searchParams.getAll("family");
  if (!familyParams.length) {
    return {
      ok: false,
      error: isGoogle
        ? "Google Fonts URL is missing a family= query parameter."
        : "Link URL has no family= query parameter — cannot extract a font name.",
    };
  }

  // Use the first family= segment only (multi-family URLs are ambiguous for one token).
  const familyRaw = familyParams[0] ?? "";
  const family = normalizeGoogleFamilyParam(familyRaw);
  if (!family) {
    return {
      ok: false,
      error: "Could not parse a font-family name from the family= parameter.",
    };
  }

  return { ok: true, family, kind: "link" };
}

/**
 * Google CSS2: `Family+Name:wght@400;700` or `Family:ital,wght@0,400;1,700`
 * Strip axis/weight suffix after the first `:`, turn `+` into spaces.
 */
function normalizeGoogleFamilyParam(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.replace(/\+/g, "%20"));
  } catch {
    decoded = raw.replace(/\+/g, " ");
  }
  // Weight / italic axis specs follow the first colon.
  const colon = decoded.indexOf(":");
  const namePart = (colon === -1 ? decoded : decoded.slice(0, colon)).trim();
  if (!namePart) return null;
  // Reject if it still looks like a weight axis, not a name.
  if (/^wght@/i.test(namePart) || /^ital,/i.test(namePart)) return null;
  return namePart;
}

function parseFontFaceEmbed(input: string): ParseFontEmbedResult {
  // First @font-face { ... } block only.
  const blockMatch = input.match(/@font-face\s*\{([\s\S]*?)\}/i);
  if (!blockMatch) {
    return {
      ok: false,
      error: "Found @font-face but could not read a complete { ... } block.",
    };
  }

  const body = blockMatch[1] ?? "";
  const familyMatch = body.match(
    /font-family\s*:\s*([^;]+);/i
  );
  if (!familyMatch?.[1]) {
    return {
      ok: false,
      error: "@font-face block is missing a font-family declaration.",
    };
  }

  const family = stripCssFamilyName(familyMatch[1]);
  if (!family) {
    return {
      ok: false,
      error: "Could not read a font-family name from the @font-face block.",
    };
  }

  return { ok: true, family, kind: "font-face" };
}

/** Take the first family in a CSS font-family list; strip quotes. */
function stripCssFamilyName(raw: string): string | null {
  const first = raw.split(",")[0]?.trim() ?? "";
  if (!first) return null;
  const unquoted = first.replace(/^["']|["']$/g, "").trim();
  if (!unquoted || unquoted === "inherit" || unquoted === "initial") {
    return null;
  }
  return unquoted;
}
