import type {
  ColorGradient,
  ColorScaleStep,
  ColorScaleStepNumber,
  ColorToken,
} from "@/types/tokens";

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, Math.round(l * 100)];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }

  return [Math.round((h / 6) * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * (light - c))
      .toString(16)
      .padStart(2, "0");
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Full Tailwind-style scale steps including 950. */
export const SCALE_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const satisfies readonly ColorScaleStepNumber[];

export const SCALE_LABELS = SCALE_STEPS.map(String);

/** Dark-side lightness offsets from the 500 pivot (percentage points). */
const DARK_OFFSETS: Record<number, number> = {
  600: 11,
  700: 20,
  800: 28,
  900: 36,
  950: 42,
};

/** Light-side blend toward ~97% — weight by how far the step is from 500. */
const LIGHT_BLEND: Record<number, number> = {
  50: 1,
  100: 0.88,
  200: 0.7,
  300: 0.5,
  400: 0.28,
};

function clampLightness(l: number): number {
  return Math.min(97, Math.max(4, l));
}

/** Lightness for one step relative to the 500 pivot (500 is always exact). */
export function lightnessForStep(
  step: ColorScaleStepNumber,
  l500: number
): number {
  if (step === 500) return l500;
  if (step in DARK_OFFSETS) {
    return clampLightness(l500 - DARK_OFFSETS[step]);
  }
  const blend = LIGHT_BLEND[step] ?? 0.5;
  return clampLightness(l500 + (97 - l500) * blend);
}

/** Auto-generated hex for every scale step from an exact 500 anchor. */
export function computeScaleHexes(
  hex500: string
): Record<ColorScaleStepNumber, string> {
  const [h, s, l] = hexToHsl(hex500);
  const sat = Math.min(s, 86);
  const out = {} as Record<ColorScaleStepNumber, string>;
  for (const step of SCALE_STEPS) {
    if (step === 500) {
      out[step] = hex500.startsWith("#") ? hex500.slice(0, 7) : hex500;
    } else {
      out[step] = hslToHex(h, sat, lightnessForStep(step, l));
    }
  }
  return out;
}

/**
 * Build / refresh a scale from a 500 anchor.
 * Preserves steps where `overridden` is true; regenerates all others.
 * Step 500 is always exactly `hex500` and never marked overridden.
 */
export function generateScaleFromAnchor(
  hex500: string,
  existing?: ColorScaleStep[]
): ColorScaleStep[] {
  const anchor = hex500.startsWith("#") ? hex500.slice(0, 7) : hex500;
  const generated = computeScaleHexes(anchor);
  return SCALE_STEPS.map((step) => {
    const prev = existing?.find((s) => s.step === step);
    if (step === 500) {
      return { step, value: anchor, overridden: false };
    }
    if (prev?.overridden) {
      return { ...prev, step };
    }
    return { step, value: generated[step], overridden: false };
  });
}

/** Regenerate a single non-overridden step from the current 500. */
export function regenerateScaleStep(
  hex500: string,
  step: ColorScaleStepNumber
): string {
  return computeScaleHexes(hex500)[step];
}

/**
 * Legacy helper — returns hex array for 50–950 (index 0 = 50, index 5 = 500).
 * Prefer `generateScaleFromAnchor` for persisted scales.
 */
export function genScale(hex: string): string[] {
  const map = computeScaleHexes(hex);
  return SCALE_STEPS.map((step) => map[step]);
}

export function getScaleStepHex(
  scale: ColorScaleStep[] | undefined,
  step: ColorScaleStepNumber
): string | undefined {
  return scale?.find((s) => s.step === step)?.value;
}

/**
 * Resolve a color token's display/export value.
 * Order: token→token `refOf` (cycle-safe) → scale `stepRef` → stored `value`.
 */
export function resolveColorValue(
  token: ColorToken,
  colors: ColorToken[],
  seen: Set<string> = new Set()
): string {
  if (token.refOf) {
    if (seen.has(token.id)) return token.value;
    seen.add(token.id);
    const target = colors.find((t) => t.id === token.refOf);
    if (target) return resolveColorValue(target, colors, seen);
  }
  if (token.stepRef != null) {
    const anchorId = token.scaleOf ?? "primary";
    const anchor = colors.find((t) => t.id === anchorId);
    const fromScale = getScaleStepHex(anchor?.scale, token.stepRef);
    if (fromScale) return fromScale;
  }
  return token.value;
}

/** Apply resolved hex + WCAG onto reference tokens for consumers that read `.value`. */
export function syncResolvedColorTokens(colors: ColorToken[]): ColorToken[] {
  const withRefs = colors.map((token) => {
    if (token.stepRef == null && !token.refOf) return token;
    const resolved = resolveColorValue(token, colors);
    const wcag = getWcagLevel(resolved);
    if (token.value === resolved && token.wcag === wcag) return token;
    return { ...token, value: resolved, wcag };
  });
  return syncDerivedGradients(withRefs);
}

/** Hex pair for scale steps 500 / 600 from a foundation token (or generated scale). */
export function scaleSteps500and600(
  token: ColorToken | undefined,
  colors: ColorToken[] = []
): { c500: string; c600: string } | null {
  if (!token || token.gradient) return null;
  const pool = colors.length ? colors : [token];
  const resolved = resolveColorValue(token, pool);
  const anchor = resolved.startsWith("#") ? resolved.slice(0, 7) : null;
  if (!anchor || !isValidHex(anchor)) return null;

  if (token.scale?.length) {
    return {
      c500: getScaleStepHex(token.scale, 500) ?? anchor,
      c600: getScaleStepHex(token.scale, 600) ?? anchor,
    };
  }

  const scale = generateScaleFromAnchor(anchor);
  return {
    c500: getScaleStepHex(scale, 500) ?? anchor,
    c600: getScaleStepHex(scale, 600) ?? anchor,
  };
}

/**
 * Brand gradient: primary 500 → primary 600.
 * Cool / secondary gradient: secondary 500 → 600 when present;
 * otherwise primary 500 → 600 at 50% opacity.
 */
export function buildGradientFromFoundations(
  kind: "brand" | "cool",
  primary: ColorToken | undefined,
  secondary: ColorToken | undefined,
  angle: number,
  colors: ColorToken[] = []
): ColorGradient | null {
  const primarySteps = scaleSteps500and600(primary, colors);
  if (!primarySteps) return null;

  if (kind === "brand") {
    return {
      angle,
      from: { color: primarySteps.c500, opacity: 100 },
      to: { color: primarySteps.c600, opacity: 100 },
    };
  }

  const secondarySteps = scaleSteps500and600(secondary, colors);
  if (secondarySteps) {
    return {
      angle,
      from: { color: secondarySteps.c500, opacity: 100 },
      to: { color: secondarySteps.c600, opacity: 100 },
    };
  }

  return {
    angle,
    from: { color: primarySteps.c500, opacity: 50 },
    to: { color: primarySteps.c600, opacity: 50 },
  };
}

function gradientsEqual(a: ColorGradient, b: ColorGradient): boolean {
  return (
    a.angle === b.angle &&
    a.from.color === b.from.color &&
    a.from.opacity === b.from.opacity &&
    a.to.color === b.to.color &&
    a.to.opacity === b.to.opacity
  );
}

/** Keep built-in gradient tokens aligned with primary / secondary scales. */
export function syncDerivedGradients(colors: ColorToken[]): ColorToken[] {
  const primary = colors.find((t) => t.id === "primary");
  const secondary = colors.find((t) => t.id === "secondary");

  return colors.map((token) => {
    const kind =
      token.id === "gradient-brand"
        ? ("brand" as const)
        : token.id === "gradient-cool"
          ? ("cool" as const)
          : null;
    if (!kind || !token.gradient) return token;
    // Manual palette edits win until the user resets to the linked source.
    if (token.gradient.manual) return token;

    const nextGrad = buildGradientFromFoundations(
      kind,
      primary,
      secondary,
      token.gradient.angle,
      colors
    );
    if (!nextGrad) return token;
    const linked: ColorGradient = { ...nextGrad, manual: false };
    if (gradientsEqual(token.gradient, linked) && !token.gradient.manual) {
      return token;
    }

    const value = compileLinearGradient(linked);
    return {
      ...token,
      gradient: linked,
      value,
      wcag: getWcagLevel(linked.from.color),
    };
  });
}

export function slugifySystemName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-") || "my-system";
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export function hexToRgba(hex: string, opacityPct: number): string {
  const cleaned = hex.replace("#", "").slice(0, 6);
  if (cleaned.length < 6) return `rgba(0, 0, 0, ${opacityPct / 100})`;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  const a = Math.min(1, Math.max(0, opacityPct / 100));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Compile a stored gradient definition to a CSS linear-gradient value. */
export function compileLinearGradient(gradient: ColorGradient): string {
  const from = hexToRgba(gradient.from.color, gradient.from.opacity);
  const to = hexToRgba(gradient.to.color, gradient.to.opacity);
  return `linear-gradient(${gradient.angle}deg, ${from} 0%, ${to} 100%)`;
}

/** True when `value` is a usable CSS box-shadow (keeps last-good on failure). */
export function isValidBoxShadow(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v === "none") return true;
  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("box-shadow", v);
  }
  return /^(inset\s+)?-?\d/.test(v) || /\b(?:rgb|rgba|hsl|hsla)\(/i.test(v);
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return s;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseColorToRgb(color: string): [number, number, number] | null {
  if (color.startsWith("#") && color.length >= 7) {
    return hexToRgb(color);
  }
  const rgba = color.match(/rgba?\(([^)]+)\)/);
  if (rgba) {
    const parts = rgba[1].split(",").map((p) => parseFloat(p.trim()));
    return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
  }
  return null;
}

export function getWcagLevel(
  foreground: string,
  background = "#ffffff"
): "aaa" | "aa" | "fail" {
  const fg = parseColorToRgb(foreground);
  const bg = parseColorToRgb(background);
  if (!fg || !bg) return "fail";

  const l1 = getRelativeLuminance(...fg);
  const l2 = getRelativeLuminance(...bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  if (ratio >= 7) return "aaa";
  if (ratio >= 4.5) return "aa";
  return "fail";
}
