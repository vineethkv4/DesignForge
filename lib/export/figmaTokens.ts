/**
 * W3C Design Tokens Community Group (DTCG) / Figma Tokens JSON export.
 * Pure client-side transform off EditorDesignSystem — same input shape as CSS export.
 *
 * Theme modes use `$extensions.mode` (Tokens Brücke / Cobalt-compatible) so
 * Figma Variable collections can import Light / Dark / High Contrast as modes.
 */
import type { EditorDesignSystem } from "@/lib/codeGen";
import { resolveThemeToken } from "@/lib/themeResolve";
import type {
  BorderRadiusToken,
  ColorToken,
  ShadowToken,
  SpacingToken,
  Theme,
  TypographyToken,
} from "@/types/tokens";
import { CORE_THEME_SEMANTICS } from "@/types/tokens";

/** DTCG leaf token. */
export interface DtcgToken {
  $type: string;
  $value: unknown;
  $description?: string;
  /** Figma / Tokens Brücke multi-mode values keyed by mode display name. */
  $extensions?: {
    mode?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export type DtcgGroup = { [key: string]: DtcgToken | DtcgGroup };

/** Composite shadow value (DTCG `$type: "shadow"`). */
export interface DtcgShadowComposite {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

type DimensionValue = { value: number; unit: string };

/** Figma / DTCG structured color `$value` (sRGB floats + hex echo). */
export interface DtcgColorValue {
  colorSpace: "srgb";
  components: [number, number, number];
  alpha: number;
  hex: string;
}

function leaf(
  type: string,
  value: unknown,
  description?: string
): DtcgToken {
  const t: DtcgToken = { $type: type, $value: value };
  if (description) t.$description = description;
  return t;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function channelToHexByte(n: number): string {
  return Math.round(clamp01(n) * 255)
    .toString(16)
    .padStart(2, "0");
}

function rgbFloatsToHex(r: number, g: number, b: number): string {
  return `#${channelToHexByte(r)}${channelToHexByte(g)}${channelToHexByte(b)}`;
}

function dtcgColorValue(
  r: number,
  g: number,
  b: number,
  alpha: number,
  hex?: string
): DtcgColorValue {
  const components: [number, number, number] = [
    clamp01(r),
    clamp01(g),
    clamp01(b),
  ];
  return {
    colorSpace: "srgb",
    components,
    alpha: clamp01(alpha),
    hex: (hex ?? rgbFloatsToHex(components[0], components[1], components[2])).toLowerCase(),
  };
}

/**
 * Convert a CSS color string (hex or rgba/rgb) into Figma's DTCG color object.
 * Hex: `#rgb` / `#rrggbb` / `#rrggbbaa`. RGBA: `rgba(0,0,0,0.08)` and `rgb(...)`.
 * Unparseable values fall back to opaque black with the raw string as `hex`.
 */
export function hexToDtcgColorValue(
  color: string,
  alpha = 1
): DtcgColorValue {
  const raw = color.trim();

  // rgba(...) / rgb(...) — deliberate edge case (e.g. color.border = "rgba(0,0,0,0.08)")
  const rgbaMatch = raw.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i
  );
  if (rgbaMatch) {
    const r = Number(rgbaMatch[1]) / 255;
    const g = Number(rgbaMatch[2]) / 255;
    const b = Number(rgbaMatch[3]) / 255;
    const a =
      rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : alpha;
    return dtcgColorValue(r, g, b, a);
  }

  const clean = raw.replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(clean)) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return dtcgColorValue(r, g, b, alpha);
  }
  if (/^[0-9a-f]{6}$/i.test(clean)) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return dtcgColorValue(r, g, b, alpha, `#${clean.toLowerCase()}`);
  }
  if (/^[0-9a-f]{8}$/i.test(clean)) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const a = parseInt(clean.substring(6, 8), 16) / 255;
    return dtcgColorValue(r, g, b, a, `#${clean.substring(0, 6).toLowerCase()}`);
  }

  // Fallback — keep export resilient; importer may still reject this leaf.
  return dtcgColorValue(0, 0, 0, alpha, raw.toLowerCase());
}

function dtcgColor(value: string, description?: string): DtcgToken {
  return leaf("color", hexToDtcgColorValue(value), description);
}

function parseDimension(raw: string): DimensionValue | string {
  const m = String(raw)
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|deg)?$/i);
  if (!m) return raw;
  return {
    value: Number(m[1]),
    unit: (m[2] || "px").toLowerCase(),
  };
}

function dimensionToken(raw: string, description?: string): DtcgToken {
  return leaf("dimension", parseDimension(raw), description);
}

function sanitizeKey(name: string): string {
  return name
    .replace(/^(color|typography|spacing|borderRadius|shadow)\./, "")
    .replace(/\./g, "-");
}

function roleFromColorName(name: string): string {
  // color.primary → primary; color.primary.hover → primary-hover
  return name.replace(/^color\./, "").replace(/\./g, "-");
}

/**
 * Parse a CSS box-shadow string into a DTCG composite.
 * Multi-layer shadows: only the first layer is mapped (see extension point below).
 *
 * EXTENSION POINT — flattened-string fallback:
 * Some importers lack composite `$type: "shadow"` support. When that becomes a
 * problem, prefer emitting `{ $type: "string", $value: rawCss }` (or dual-write)
 * instead of dropping the token. Do not implement that fallback here yet.
 */
export function parseCssBoxShadow(value: string): DtcgShadowComposite | null {
  const v = value.trim();
  if (!v || v === "none") return null;

  // Split layers on commas not inside parentheses (rgba / hsl).
  const layer = v.split(/,(?![^(]*\))/)[0]?.trim();
  if (!layer) return null;

  const inset = /^inset\s+/i.test(layer);
  const rest = layer.replace(/^inset\s+/i, "").trim();

  const match = rest.match(
    /^(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)(?:\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?))?\s+(.+)$/i
  );
  if (!match) return null;

  const [, offsetX, offsetY, blur, spread, color] = match;
  return {
    offsetX,
    offsetY,
    blur,
    spread: spread ?? "0px",
    color: color.trim(),
    ...(inset ? { inset: true } : {}),
  };
}

function exportColors(colors: ColorToken[]): DtcgGroup {
  const out: DtcgGroup = {};

  for (const token of colors) {
    if (token.gradient) continue; // editor-only previews — same as CSS export

    const role = roleFromColorName(token.name);

    if (token.scale?.length) {
      // Figma's native importer is unreliable with nested groups whose only
      // children are numeric keys (`primary/50` … `primary/950`) and there is
      // no leaf named `primary`. Flatten to sibling leaves instead:
      //   primary          → anchor (token.value / 500)
      //   primary-50 … 950 → full scale
      out[role] = dtcgColor(token.value);
      for (const step of token.scale) {
        out[`${role}-${step.step}`] = dtcgColor(
          step.value,
          // TODO: migrate overridden flag to `$extensions["com.designforge"].overridden`
          // for programmatic detection — `$description` is a temporary signal only.
          step.overridden ? "Manually overridden" : undefined
        );
      }
      continue;
    }

    out[role] = dtcgColor(token.value);
  }

  return out;
}

function exportTypography(tokens: TypographyToken[]): DtcgGroup {
  const fontFamily: DtcgGroup = {};
  const fontSize: DtcgGroup = {};
  const fontWeight: DtcgGroup = {};
  const lineHeight: DtcgGroup = {};
  const letterSpacing: DtcgGroup = {};

  for (const t of tokens) {
    const key = sanitizeKey(t.name);
    switch (t.group) {
      case "family":
        // DTCG / Figma Variables only accept a fontFamily string — there is no
        // slot for embedCode / resolvedFamily / fallbackStack. Embed metadata
        // is preserved in CSS (@import/@font-face preamble) and JSON/TS exports
        // instead; $value here remains the resolved CSS stack so consumers that
        // only speak DTCG still get a usable family list.
        fontFamily[key] = leaf("fontFamily", t.value);
        break;
      case "size":
        fontSize[key] = dimensionToken(t.value);
        break;
      case "weight": {
        const n = Number(t.value);
        fontWeight[key] = leaf(
          "number",
          Number.isFinite(n) ? n : t.value
        );
        break;
      }
      case "lineHeight":
        // unitless ratios stay as number; px/em as dimension
        if (/^-?\d+(\.\d+)?$/.test(t.value.trim())) {
          lineHeight[key] = leaf("number", Number(t.value));
        } else {
          lineHeight[key] = dimensionToken(t.value);
        }
        break;
      case "letterSpacing":
        letterSpacing[key] = dimensionToken(t.value);
        break;
      default:
        break;
    }
  }

  const out: DtcgGroup = {};
  if (Object.keys(fontFamily).length) out.fontFamily = fontFamily;
  // Keep fontSize (dimension) and fontWeight (number) as separate groups — do not merge.
  if (Object.keys(fontSize).length) out.fontSize = fontSize;
  if (Object.keys(fontWeight).length) out.fontWeight = fontWeight;
  if (Object.keys(lineHeight).length) out.lineHeight = lineHeight;
  if (Object.keys(letterSpacing).length) out.letterSpacing = letterSpacing;
  return out;
}

function exportSpacing(tokens: SpacingToken[]): DtcgGroup {
  const out: DtcgGroup = {};
  for (const t of tokens) {
    out[sanitizeKey(t.name)] = dimensionToken(t.value);
  }
  return out;
}

function exportRadius(tokens: BorderRadiusToken[]): DtcgGroup {
  const out: DtcgGroup = {};
  for (const t of tokens) {
    out[sanitizeKey(t.name)] = dimensionToken(t.value);
  }
  return out;
}

function exportShadows(tokens: ShadowToken[]): DtcgGroup {
  const out: DtcgGroup = {};
  for (const t of tokens) {
    const key = sanitizeKey(t.name);
    if (t.value.trim() === "none") {
      out[key] = leaf("shadow", {
        offsetX: "0px",
        offsetY: "0px",
        blur: "0px",
        spread: "0px",
        color: "rgba(0,0,0,0)",
      } satisfies DtcgShadowComposite);
      continue;
    }

    const composite = parseCssBoxShadow(t.value);
    if (composite) {
      const multi = t.value.includes(",") && /,(?![^(]*\))/.test(t.value);
      out[key] = leaf(
        "shadow",
        composite,
        multi
          ? "First shadow layer only — multi-layer CSS not fully represented"
          : undefined
      );
    }
    // Unparseable shadows are skipped; see flattened-string fallback extension point above.
  }
  return out;
}

function isDtcgLeaf(node: DtcgToken | DtcgGroup): node is DtcgToken {
  return (
    typeof node === "object" &&
    node != null &&
    "$type" in node &&
    "$value" in node
  );
}

/** Nest `surface.base` → `{ surface: { base: token } }`. */
function setNestedToken(
  root: DtcgGroup,
  path: string[],
  token: DtcgToken
): void {
  let cur = root;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    const next = cur[key];
    if (!next || isDtcgLeaf(next)) {
      cur[key] = {};
    }
    cur = cur[key] as DtcgGroup;
  }
  cur[path[path.length - 1]!] = token;
}

function defaultThemeForModes(themes: Theme[]): Theme {
  return (
    themes.find((t) => t.id === "theme-light") ??
    themes.find((t) => t.baseMode === "light") ??
    themes[0]!
  );
}

/**
 * Theme semantics as a DTCG group with Figma Variable modes.
 * `$value` = Light (default mode); `$extensions.mode` = all theme names.
 */
function exportThemes(system: EditorDesignSystem): DtcgGroup {
  if (!system.themes.length) return {};

  const defaultTheme = defaultThemeForModes(system.themes);
  const out: DtcgGroup = {};

  for (const tokenName of CORE_THEME_SEMANTICS) {
    const modeValues: Record<string, DtcgColorValue> = {};
    for (const theme of system.themes) {
      const resolved = resolveThemeToken(tokenName, theme, system.colors);
      modeValues[theme.name] = hexToDtcgColorValue(resolved);
    }

    const defaultResolved = resolveThemeToken(
      tokenName,
      defaultTheme,
      system.colors
    );
    const token: DtcgToken = {
      $type: "color",
      $value: hexToDtcgColorValue(defaultResolved),
      $extensions: {
        mode: modeValues,
      },
    };

    setNestedToken(out, tokenName.split("."), token);
  }

  return out;
}

/**
 * Convert the live editor design-system snapshot into a W3C DTCG JSON document.
 * `namespace` becomes the root group key (same namespace as CSS vars / code panel).
 */
export function exportAsDTCG(
  system: EditorDesignSystem,
  namespace: string
): DtcgGroup {
  const ns = namespace.trim() || "acme";

  const color = exportColors(system.colors);
  const typography = exportTypography(system.typography);
  const spacing = exportSpacing(system.spacing);
  const radius = exportRadius(system.borderRadius);
  const shadow = exportShadows(system.shadows);
  const theme = exportThemes(system);

  const bundle: DtcgGroup = {};
  if (Object.keys(color).length) bundle.color = color;
  if (Object.keys(typography).length) bundle.typography = typography;
  if (Object.keys(spacing).length) bundle.spacing = spacing;
  if (Object.keys(radius).length) bundle.radius = radius;
  if (Object.keys(shadow).length) bundle.shadow = shadow;
  if (Object.keys(theme).length) bundle.theme = theme;

  return { [ns]: bundle };
}

export function exportDtcgFilename(namespace: string): string {
  const ns = namespace.trim();
  return ns ? `${ns}.tokens.json` : "tokens.tokens.json";
}

/**
 * Blob download matching `downloadDesignSystemCss` — same object-URL + `<a>` pattern.
 */
export function downloadDTCG(
  system: EditorDesignSystem,
  namespace: string
): string {
  const doc = exportAsDTCG(system, namespace);
  const json = `${JSON.stringify(doc, null, 2)}\n`;
  const filename = exportDtcgFilename(namespace);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return filename;
}
