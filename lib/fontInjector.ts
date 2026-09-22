/**
 * DOM injection for sanitized typography family embeds.
 * Dedupes by data-df-font-token so re-saves don't stack tags.
 */

export type InjectableFontEmbed =
  | { kind: "link"; href: string }
  | { kind: "font-face"; css: string; family: string };

export type FontEmbedLoadStatus = "loaded" | "failed";

const ATTR = "data-df-font-token";
const ATTR_KEY = "data-df-font-key";
const STYLE_FALLBACK_MS = 900;

function selectorFor(tokenId: string): string {
  // Token ids are slug-like; strip quotes to keep the attribute selector safe.
  const safe = tokenId.replace(/["\\]/g, "");
  return `[${ATTR}="${safe}"]`;
}

function embedKey(sanitized: InjectableFontEmbed): string {
  if (sanitized.kind === "link") return `link:${sanitized.href}`;
  return `face:${sanitized.family}\n${sanitized.css}`;
}

function removeNodes(tokenId: string): void {
  if (typeof document === "undefined") return;
  document.querySelectorAll(selectorFor(tokenId)).forEach((el) => el.remove());
}

/**
 * Create or update a head tag for this token's embed.
 * Link: onload/onerror → status callback.
 * Font-face: prefer FontFace.load(); fall back to <style> + timeout check.
 */
export function injectFontEmbed(
  tokenId: string,
  sanitized: InjectableFontEmbed,
  onStatus?: (status: FontEmbedLoadStatus) => void
): void {
  if (typeof document === "undefined") return;

  if (sanitized.kind === "link") {
    injectLink(tokenId, sanitized.href, onStatus);
    return;
  }

  injectFontFace(tokenId, sanitized.css, sanitized.family, onStatus);
}

export function removeFontEmbed(tokenId: string): void {
  removeNodes(tokenId);
}

/** Remove every DesignForge font-inject node (e.g. system switch). */
export function removeAllFontEmbeds(): void {
  if (typeof document === "undefined") return;
  document.querySelectorAll(`[${ATTR}]`).forEach((el) => el.remove());
}

function injectLink(
  tokenId: string,
  href: string,
  onStatus?: (status: FontEmbedLoadStatus) => void
): void {
  const key = embedKey({ kind: "link", href });
  const existing = document.querySelector(
    selectorFor(tokenId)
  ) as HTMLLinkElement | null;

  if (
    existing &&
    existing.tagName === "LINK" &&
    existing.getAttribute(ATTR_KEY) === key
  ) {
    return;
  }

  removeNodes(tokenId);

  const link = document.createElement("link");
  link.setAttribute(ATTR, tokenId);
  link.setAttribute(ATTR_KEY, key);
  link.rel = "stylesheet";
  link.href = href;
  if (onStatus) {
    link.onload = () => onStatus("loaded");
    link.onerror = () => onStatus("failed");
  }
  document.head.appendChild(link);
}

function injectFontFace(
  tokenId: string,
  css: string,
  family: string,
  onStatus?: (status: FontEmbedLoadStatus) => void
): void {
  const familyName = family.trim();
  const key = embedKey({ kind: "font-face", css, family: familyName });
  const existing = document.querySelector(selectorFor(tokenId));
  if (existing?.getAttribute(ATTR_KEY) === key) {
    return;
  }

  removeNodes(tokenId);

  const srcValue = extractSrcValue(css);

  if (srcValue && familyName && typeof FontFace !== "undefined") {
    try {
      const face = new FontFace(familyName, srcValue);
      // Marker node so removeFontEmbed / dedupe can find this token.
      const marker = document.createElement("style");
      marker.setAttribute(ATTR, tokenId);
      marker.setAttribute(ATTR_KEY, key);
      marker.setAttribute("data-df-font-mode", "fontface");
      marker.textContent = `/* df-font-face:${tokenId} */`;
      document.head.appendChild(marker);

      face
        .load()
        .then((loaded) => {
          document.fonts.add(loaded);
          onStatus?.("loaded");
        })
        .catch(() => {
          // Fall back to raw CSS if FontFace.load rejects.
          marker.remove();
          injectStyleFallback(tokenId, css, familyName, key, onStatus);
        });
      return;
    } catch {
      /* fall through to style tag */
    }
  }

  injectStyleFallback(tokenId, css, familyName, key, onStatus);
}

function injectStyleFallback(
  tokenId: string,
  css: string,
  family: string,
  key: string,
  onStatus?: (status: FontEmbedLoadStatus) => void
): void {
  removeNodes(tokenId);
  const style = document.createElement("style");
  style.setAttribute(ATTR, tokenId);
  style.setAttribute(ATTR_KEY, key);
  style.setAttribute("data-df-font-mode", "style");
  style.textContent = css;
  document.head.appendChild(style);

  if (!onStatus) return;

  window.setTimeout(() => {
    try {
      const quoted = family.includes(" ") ? `"${family.replace(/"/g, "")}"` : family;
      const ok =
        typeof document.fonts?.check === "function"
          ? document.fonts.check(`16px ${quoted}`)
          : true;
      onStatus(ok ? "loaded" : "failed");
    } catch {
      onStatus("failed");
    }
  }, STYLE_FALLBACK_MS);
}

/** Pull the `src:` declaration value for FontFace(source). */
function extractSrcValue(css: string): string | null {
  const m = css.match(/src\s*:\s*([^;]+);/i);
  const value = m?.[1]?.trim() ?? "";
  if (!value || !/url\s*\(/i.test(value)) return null;
  return value;
}
