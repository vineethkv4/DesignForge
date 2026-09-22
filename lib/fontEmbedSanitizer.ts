/**
 * Allowlist + structural checks for pasted font embeds before DOM injection.
 * Pure string functions — no document access.
 */

/** Hosts permitted for `<link href>` and `@font-face` `url(...)` src. */
export const ALLOWED_FONT_EMBED_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com", // Google Fonts file CDN used inside @font-face
  "use.typekit.net",
  "api.fontshare.com",
  "cdn.fontshare.com",
] as const;

export type SanitizeLinkResult =
  | { ok: true; href: string }
  | { ok: false; error: string };

export type SanitizeFontFaceResult =
  | { ok: true; css: string }
  | { ok: false; error: string };

function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_FONT_EMBED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

/**
 * Accept a single `<link rel="stylesheet" href="https://…">` on an allowlisted host.
 */
export function sanitizeLinkEmbed(raw: string): SanitizeLinkResult {
  const input = raw?.trim() ?? "";
  if (!input) {
    return { ok: false, error: "Paste a single stylesheet <link> tag." };
  }

  const linkCount = (input.match(/<link\b/gi) ?? []).length;
  if (linkCount !== 1) {
    return {
      ok: false,
      error:
        linkCount === 0
          ? "Expected a single <link> tag."
          : "Only one <link> tag is allowed.",
    };
  }

  // Reject any other HTML tags (script, style, iframe, etc.).
  if (/<\/?(?!link\b)[a-z][\s\S]*?>/i.test(input)) {
    return {
      ok: false,
      error: "Embed must be a single <link> tag with no other HTML.",
    };
  }

  if (/\bon\w+\s*=/i.test(input)) {
    return {
      ok: false,
      error: "Link tag must not include event-handler attributes.",
    };
  }

  const tagMatch = input.match(/<link\b([^>]*)>/i);
  if (!tagMatch) {
    return { ok: false, error: "Could not parse the <link> tag." };
  }

  const attrs = tagMatch[1] ?? "";
  const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
  if (!hrefMatch?.[1]) {
    return { ok: false, error: "Link tag is missing a quoted href." };
  }

  const relMatch = attrs.match(/\brel\s*=\s*["']([^"']+)["']/i);
  const rel = (relMatch?.[1] ?? "").trim().toLowerCase();
  if (rel !== "stylesheet") {
    return {
      ok: false,
      error: 'Link tag must include rel="stylesheet".',
    };
  }

  const href = hrefMatch[1]
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { ok: false, error: "Link href is not a valid URL." };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "Font stylesheet href must use https." };
  }

  if (!isAllowedHost(url.hostname)) {
    return {
      ok: false,
      error: `Host "${url.hostname}" is not on the font embed allowlist.`,
    };
  }

  // Rebuild a clean absolute href (drops hash noise, keeps search).
  return { ok: true, href: url.toString() };
}

/**
 * Keep only the outermost `@font-face { … }` block; validate `url()` hosts.
 */
export function sanitizeFontFaceEmbed(raw: string): SanitizeFontFaceResult {
  const input = raw?.trim() ?? "";
  if (!input) {
    return { ok: false, error: "Paste an @font-face CSS block." };
  }

  if (/<script\b/i.test(input) || /expression\s*\(/i.test(input)) {
    return {
      ok: false,
      error: "Embed contains disallowed script or expression() content.",
    };
  }

  if (/<\/?[a-z][\s\S]*?>/i.test(input)) {
    return {
      ok: false,
      error: "@font-face embed must be CSS only — no HTML tags.",
    };
  }

  const blockMatch = input.match(/@font-face\s*\{([\s\S]*?)\}/i);
  if (!blockMatch) {
    return {
      ok: false,
      error: "Could not find a complete @font-face { … } block.",
    };
  }

  const body = blockMatch[1] ?? "";
  const css = `@font-face {${body}}`;

  // Collect every url(...) reference.
  const urlRe = /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
  let match: RegExpExecArray | null;
  let urlCount = 0;
  while ((match = urlRe.exec(body)) !== null) {
    urlCount += 1;
    const rawUrl = match[2]?.trim() ?? "";
    if (!rawUrl) {
      return { ok: false, error: "Empty url() in @font-face src." };
    }
    if (rawUrl.startsWith("data:")) {
      return {
        ok: false,
        error: "data: URLs are not allowed in @font-face embeds.",
      };
    }
    if (!/^https:\/\//i.test(rawUrl)) {
      return {
        ok: false,
        error: "All @font-face url() values must be absolute https URLs.",
      };
    }

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return { ok: false, error: `Invalid font url(): ${rawUrl}` };
    }

    if (url.protocol !== "https:") {
      return {
        ok: false,
        error: "All @font-face url() values must use https.",
      };
    }
    if (!isAllowedHost(url.hostname)) {
      return {
        ok: false,
        error: `Font file host "${url.hostname}" is not on the allowlist.`,
      };
    }
  }

  if (urlCount === 0) {
    return {
      ok: false,
      error: "@font-face block must include at least one url(...) source.",
    };
  }

  return { ok: true, css };
}

/** Run the kind-appropriate sanitizer after parseFontEmbed succeeds. */
export function sanitizeParsedEmbed(
  kind: "link" | "font-face",
  raw: string
): SanitizeLinkResult | SanitizeFontFaceResult {
  return kind === "link" ? sanitizeLinkEmbed(raw) : sanitizeFontFaceEmbed(raw);
}
