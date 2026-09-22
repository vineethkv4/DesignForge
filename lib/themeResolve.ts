import { resolveColorValue } from "@/lib/colorScale";
import type {
  ColorToken,
  CoreThemeSemantic,
  Theme,
  ThemeMode,
} from "@/types/tokens";
import { CORE_THEME_SEMANTICS } from "@/types/tokens";

/**
 * Built-in neutral ramp for theme auto-flip.
 * Demo color tokens do not ship a `neutral.*` scale — this is the flip source.
 */
export const NEUTRAL_SCALE: Record<number, string> = {
  0: "#ffffff",
  50: "#f8f8f6",
  100: "#f0efed",
  200: "#e4e3df",
  300: "#c9c8c2",
  400: "#a0a09a",
  500: "#787770",
  600: "#52524e",
  700: "#3a3a37",
  800: "#242422",
  900: "#111110",
  950: "#0a0a09",
};

/** High Contrast — rides light autoFlip; differs only via overrides. */
export function highContrastTheme(): Theme {
  return {
    id: "theme-high-contrast",
    name: "High Contrast",
    baseMode: "light",
    overrides: {
      "border.default": NEUTRAL_SCALE[900],
      "border.focus": "#000000",
      "text.secondary": NEUTRAL_SCALE[900],
      "icon.secondary": NEUTRAL_SCALE[900],
    },
  };
}

/** Default themes seeded on system creation (Light / Dark / High Contrast). */
export function seedDefaultThemes(): Theme[] {
  return [
    {
      id: "theme-light",
      name: "Light",
      baseMode: "light",
      overrides: {},
    },
    {
      id: "theme-dark",
      name: "Dark",
      baseMode: "dark",
      overrides: {},
    },
    highContrastTheme(),
  ];
}

export function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<Theme>;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    (t.baseMode === "light" || t.baseMode === "dark") &&
    t.overrides != null &&
    typeof t.overrides === "object"
  );
}

/** Migrate legacy shapes → real themes; ensure High Contrast exists. */
export function normalizeThemes(raw: unknown): Theme[] {
  if (!Array.isArray(raw) || raw.length === 0) return seedDefaultThemes();
  const themes = raw.filter(isTheme).map((t) => ({
    id: t.id,
    name: t.name,
    baseMode: t.baseMode,
    overrides: { ...t.overrides },
  }));
  if (themes.length === 0) return seedDefaultThemes();
  if (!themes.some((t) => t.id === "theme-high-contrast")) {
    themes.push(highContrastTheme());
  }
  return themes;
}

function colorById(colors: ColorToken[], id: string): string | undefined {
  const token = colors.find((c) => c.id === id);
  if (!token) return undefined;
  return resolveColorValue(token, colors);
}

/**
 * Auto-resolved value for a semantic slot from `baseMode` + optional brand colors.
 * Light: light neutrals for surfaces, dark for text. Dark: reversed.
 * Brand / interactive slots read primary scale when present.
 */
export function autoFlip(
  tokenName: string,
  baseMode: ThemeMode,
  colors: ColorToken[] = []
): string {
  const primary = colorById(colors, "primary") ?? "#7733FF";
  const primaryHover = colorById(colors, "primary-hover") ?? primary;

  if (
    tokenName === "interactive.primary" ||
    tokenName === "text.brand" ||
    tokenName === "interactive.focus" ||
    tokenName === "border.focus"
  ) {
    return primary;
  }
  if (
    tokenName === "interactive.hover" ||
    tokenName === "interactive.pressed"
  ) {
    return primaryHover;
  }

  const light: Record<string, string> = {
    "background.base": NEUTRAL_SCALE[0],
    "background.subtle": NEUTRAL_SCALE[50],
    "surface.base": NEUTRAL_SCALE[0],
    "surface.raised": NEUTRAL_SCALE[50],
    "surface.overlay": "rgba(17, 17, 16, 0.45)",
    "text.primary": NEUTRAL_SCALE[900],
    "text.secondary": NEUTRAL_SCALE[600],
    "text.tertiary": NEUTRAL_SCALE[400],
    "text.inverse": NEUTRAL_SCALE[0],
    "border.default": NEUTRAL_SCALE[200],
    "border.strong": NEUTRAL_SCALE[400],
    "icon.primary": NEUTRAL_SCALE[900],
    "icon.secondary": NEUTRAL_SCALE[500],
  };
  const dark: Record<string, string> = {
    "background.base": NEUTRAL_SCALE[950],
    "background.subtle": NEUTRAL_SCALE[900],
    "surface.base": NEUTRAL_SCALE[900],
    "surface.raised": NEUTRAL_SCALE[800],
    "surface.overlay": "rgba(0, 0, 0, 0.55)",
    "text.primary": NEUTRAL_SCALE[0],
    "text.secondary": NEUTRAL_SCALE[300],
    "text.tertiary": NEUTRAL_SCALE[500],
    "text.inverse": NEUTRAL_SCALE[900],
    "border.default": NEUTRAL_SCALE[700],
    "border.strong": NEUTRAL_SCALE[500],
    "icon.primary": NEUTRAL_SCALE[0],
    "icon.secondary": NEUTRAL_SCALE[400],
  };

  const table = baseMode === "light" ? light : dark;
  return (
    table[tokenName] ??
    (baseMode === "light" ? NEUTRAL_SCALE[0] : NEUTRAL_SCALE[900])
  );
}

/**
 * Resolve a semantic token for the active theme:
 * `theme.overrides[tokenName] ?? autoFlip(tokenName, theme.baseMode)`.
 */
export function resolveThemeToken(
  tokenName: string,
  theme: Theme,
  colors: ColorToken[] = []
): string {
  const override = theme.overrides[tokenName];
  if (override != null && override !== "") return override;
  return autoFlip(tokenName, theme.baseMode, colors);
}

/** Resolve all core semantics for preview / panels. */
export function resolveCoreThemeMap(
  theme: Theme,
  colors: ColorToken[] = []
): Record<CoreThemeSemantic, string> {
  const map = {} as Record<CoreThemeSemantic, string>;
  for (const name of CORE_THEME_SEMANTICS) {
    map[name] = resolveThemeToken(name, theme, colors);
  }
  return map;
}

export function slugifyThemeId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base ? `theme-${base}` : `theme-${Date.now()}`;
}

/** Group label for Tokens / Aliases lists. */
export function themeSemanticGroup(tokenName: string): string {
  const root = tokenName.split(".")[0] ?? tokenName;
  return root.charAt(0).toUpperCase() + root.slice(1);
}
