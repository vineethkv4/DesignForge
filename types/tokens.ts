export type WcagLevel = "aaa" | "aa" | "fail";

export type TokenCategory =
  | "color"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow"
  | "themes"
  | "components";

export type CodeTab =
  | "css"
  | "tailwind"
  | "json"
  | "typescript"
  | "markdown";

export interface DesignToken {
  id: string;
  name: string;
  value: string;
  /** Cosmetic / export label (e.g. brand.500) — does not drive resolution. */
  alias: string;
  group: string;
  /**
   * Placeholder usage chips in the editor (demo data). Not live-derived from the codebase.
   */
  usedBy: string[];
  /**
   * Token→token alias. Resolves live through the category resolver.
   * Prefer this over copying literal values.
   */
  refOf?: string;
}

/** Full primary scale steps (Tailwind-style, includes 950). */
export type ColorScaleStepNumber =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

export interface ColorScaleStep {
  step: ColorScaleStepNumber;
  value: string;
  /** When true, regenerating from the 500 anchor leaves this step alone. */
  overridden: boolean;
}

export interface GradientStop {
  color: string;
  /** 0–100 */
  opacity: number;
}

/** Editable linear gradient stored on semantic gradient tokens. */
export interface ColorGradient {
  angle: number;
  from: GradientStop;
  to: GradientStop;
  /**
   * When true, stop colors are user-owned (palette / hex edits).
   * Linked brand/cool gradients skip primary/secondary sync while set.
   */
  manual?: boolean;
}

/** Color token taxonomy — drives side list + Add Token catalog grouping. */
export type ColorTokenGroup =
  | "semantic"
  | "surface"
  | "text"
  | "border"
  | "icon"
  | "feedback"
  | "interactive"
  | "overlay"
  | "charts";

export interface ColorToken extends DesignToken {
  wcag: WcagLevel;
  group: ColorTokenGroup;
  /**
   * Present on anchor tokens (e.g. color.primary).
   * Step 500 is always exactly `value` (the user-picked anchor).
   */
  scale?: ColorScaleStep[];
  /**
   * Present on reference tokens (e.g. color.primary.hover / .subtle).
   * Resolves live to `scaleOf`'s scale step — not an independent hex.
   */
  stepRef?: ColorScaleStepNumber;
  /** Anchor token id for `stepRef` resolution. Defaults to `"primary"`. */
  scaleOf?: string;
  /**
   * Present on gradient tokens (semantic → Gradients section).
   * `value` is the compiled CSS `linear-gradient(...)` string.
   */
  gradient?: ColorGradient;
}

export type TypographyFamilySource = "preset" | "embed";
export type TypographyEmbedStatus = "unverified" | "loaded" | "failed";

export interface TypographyToken extends DesignToken {
  group: "family" | "size" | "weight" | "lineHeight" | "letterSpacing";
  /**
   * Family tokens only. Undefined / omitted ≡ `"preset"` (seed tokens).
   * When `"embed"`, `value` is computed as `${resolvedFamily}, ${fallbackStack}`.
   */
  source?: TypographyFamilySource;
  /** Raw pasted `<link>` or `@font-face` block (family + embed only). */
  embedCode?: string;
  /** Parsed font-family name from embedCode (user-confirmable). */
  resolvedFamily?: string;
  /** Required when source === "embed". Default `"system-ui, sans-serif"`. */
  fallbackStack?: string;
  /** Embed load badge — set `"unverified"` on save; injection updates it. */
  embedStatus?: TypographyEmbedStatus;
  /**
   * Last preset-mode CSS stack for family tokens.
   * Written whenever `source !== "embed"` and `value` changes; used by clear.
   */
  lastPresetValue?: string;
}

export interface SpacingToken extends DesignToken {
  group: "base" | "scale";
}

export interface BorderRadiusToken extends DesignToken {
  group: "scale";
}

export interface ShadowToken extends DesignToken {
  group: "elevation";
}

export interface MotionToken extends DesignToken {
  group: "duration" | "easing";
}

export type ThemeMode = "light" | "dark";

/**
 * A theme entity (light/dark mode + sparse semantic overrides).
 * Not a flat DesignToken — resolution is via `resolveThemeToken`.
 */
export interface Theme {
  id: string;
  name: string;
  baseMode: ThemeMode;
  /**
   * Sparse map: semantic token name → manual CSS color.
   * Only tokens that diverge from the auto neutral-scale flip.
   */
  overrides: Record<string, string>;
}

/** Alias used by the Themes editor — same shape as `Theme`. */
export type ThemeToken = Theme;

/**
 * Theme-sensitive semantic slots (auto-flip + optional override).
 * Feedback colors are intentionally omitted — theme-invariant unless overridden later.
 */
export const CORE_THEME_SEMANTICS = [
  "background.base",
  "background.subtle",
  "surface.base",
  "surface.raised",
  "surface.overlay",
  "text.primary",
  "text.secondary",
  "text.tertiary",
  "text.brand",
  "text.inverse",
  "border.default",
  "border.strong",
  "border.focus",
  "icon.primary",
  "icon.secondary",
  "interactive.primary",
  "interactive.hover",
  "interactive.pressed",
  "interactive.focus",
] as const;

export type CoreThemeSemantic = (typeof CORE_THEME_SEMANTICS)[number];

export interface DemoDesignSystem {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius: BorderRadiusToken[];
  shadows: ShadowToken[];
  motion: MotionToken[];
}

export interface TokenChange {
  tokenId: string;
  previousValue: string;
  newValue: string;
  timestamp: number;
  category: TokenCategory;
}
