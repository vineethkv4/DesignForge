import { generateDesignMarkdown } from "@/lib/export/designMarkdown";
import { parseFontEmbed } from "@/lib/fontEmbedParser";
import { sanitizeParsedEmbed } from "@/lib/fontEmbedSanitizer";
import { resolveThemeToken } from "@/lib/themeResolve";
import type {
  BorderRadiusToken,
  CodeTab,
  ColorToken,
  DesignToken,
  ShadowToken,
  SpacingToken,
  Theme,
  TypographyToken,
} from "@/types/tokens";
import { CORE_THEME_SEMANTICS } from "@/types/tokens";

/** Full design-system shape for editor state / export (7 visible categories). */
export interface EditorDesignSystem {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius: BorderRadiusToken[];
  shadows: ShadowToken[];
  themes: Theme[];
  /** Phase 1 placeholder — no demo tokens yet */
  components: DesignToken[];
}

function tokenToCssVar(name: string, namespace: string): string {
  return `--${namespace}-${name.replace(/\./g, "-")}`;
}

function tokenToTailwindKey(name: string): string {
  return name.replace(/\./g, "-");
}

function tokenToTsKey(name: string): string {
  return name.replace(/\./g, "_");
}

/** Gradients are editor-only previews — omit from exported code bundles. */
function exportableColors(colors: ColorToken[]): ColorToken[] {
  return colors.filter((t) => !t.gradient);
}

function flatTokens(system: EditorDesignSystem): DesignToken[] {
  return [
    ...exportableColors(system.colors),
    ...system.typography,
    ...system.spacing,
    ...system.borderRadius,
    ...system.shadows,
    ...system.components,
  ];
}

const TOKEN_CATEGORY_SECTIONS: {
  key: Exclude<keyof EditorDesignSystem, "themes">;
  label: string;
}[] = [
  { key: "colors", label: "Colors" },
  { key: "typography", label: "Typography" },
  { key: "spacing", label: "Spacing" },
  { key: "borderRadius", label: "Border radius" },
  { key: "shadows", label: "Shadows" },
  { key: "components", label: "Components" },
];

function generateThemeCssBlock(
  system: EditorDesignSystem,
  namespace: string
): string {
  if (!system.themes.length) {
    return `  /* Themes — no themes yet */`;
  }
  return system.themes
    .map((theme) => {
      const lines = CORE_THEME_SEMANTICS.map((name) => {
        const value = resolveThemeToken(name, theme, system.colors);
        return `  ${tokenToCssVar(`theme.${theme.id}.${name}`, namespace)}: ${value};`;
      }).join("\n");
      return `  /* Theme: ${theme.name} (${theme.baseMode}) */\n${lines}`;
    })
    .join("\n\n");
}

/**
 * Emit sanitized @import / @font-face blocks above :root, once per family.
 * Link embeds → `@import url("…")`; raw @font-face → sanitized CSS block.
 */
function generateFontEmbedPreamble(typography: TypographyToken[]): string {
  const seen = new Set<string>();
  const blocks: string[] = [];

  for (const t of typography) {
    if (t.source !== "embed" || !t.embedCode?.trim()) continue;
    const familyKey = (t.resolvedFamily ?? "").trim().toLowerCase();
    if (!familyKey || seen.has(familyKey)) continue;

    const parsed = parseFontEmbed(t.embedCode);
    if (!parsed.ok) continue;
    const sanitized = sanitizeParsedEmbed(parsed.kind, t.embedCode);
    if (!sanitized.ok) continue;

    seen.add(familyKey);
    if (parsed.kind === "link" && "href" in sanitized) {
      blocks.push(
        `/* Embedded: ${t.resolvedFamily?.trim() || parsed.family} */\n@import url("${sanitized.href}");`
      );
    } else if ("css" in sanitized) {
      blocks.push(
        `/* Embedded: ${t.resolvedFamily?.trim() || parsed.family} */\n${sanitized.css}`
      );
    }
  }

  if (!blocks.length) return "";
  return `${blocks.join("\n\n")}\n\n`;
}

function generateCss(system: EditorDesignSystem, namespace: string): string {
  const blocks = TOKEN_CATEGORY_SECTIONS.map(({ key, label }) => {
    const tokens =
      key === "colors" ? exportableColors(system.colors) : system[key];
    if (!tokens.length) {
      return `  /* ${label} — no tokens yet */`;
    }
    const lines = tokens
      .map((t) => `  ${tokenToCssVar(t.name, namespace)}: ${t.value};`)
      .join("\n");
    return `  /* ${label} */\n${lines}`;
  });

  blocks.push(generateThemeCssBlock(system, namespace));

  const preamble = generateFontEmbedPreamble(system.typography);
  return `${preamble}:root {\n${blocks.join("\n\n")}\n}`;
}

function isEmbedTypography(t: DesignToken): t is TypographyToken {
  return (
    "group" in t &&
    (t as TypographyToken).group === "family" &&
    (t as TypographyToken).source === "embed"
  );
}

function escapeTsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function nsTwKey(namespace: string, name: string): string {
  const ns = namespace.trim() || "acme";
  return `${ns}-${tokenToTailwindKey(name)}`;
}

/** Shared CSS custom-property name for a theme semantic (class strategy). */
function themeSemanticVar(namespace: string, tokenName: string): string {
  return tokenToCssVar(tokenName, namespace);
}

/** Prefer seeded Light; never use High Contrast as the :root default. */
function rootTheme(system: EditorDesignSystem): Theme | null {
  if (!system.themes.length) return null;
  return (
    system.themes.find((t) => t.id === "theme-light") ??
    system.themes.find(
      (t) => t.baseMode === "light" && t.id !== "theme-high-contrast"
    ) ??
    system.themes[0] ??
    null
  );
}

/**
 * Class-strategy theme scopes for Tailwind.
 * Light → `:root`; other themes → `.${theme.id}` (e.g. `.theme-dark`).
 * Not `prefers-color-scheme` — matches the editor's manual theme selector.
 */
function generateTailwindThemeCss(
  system: EditorDesignSystem,
  namespace: string
): string {
  const light = rootTheme(system);
  if (!light) {
    return `/* Theme scopes — no themes yet */`;
  }

  const blockFor = (theme: Theme, selector: string): string => {
    const lines = CORE_THEME_SEMANTICS.map((name) => {
      const value = resolveThemeToken(name, theme, system.colors);
      return `  ${themeSemanticVar(namespace, name)}: ${value};`;
    }).join("\n");
    return `${selector} {\n  /* ${theme.name} (${theme.baseMode}) */\n${lines}\n}`;
  };

  const parts = [blockFor(light, ":root")];
  for (const theme of system.themes) {
    if (theme.id === light.id) continue;
    parts.push(blockFor(theme, `.${theme.id}`));
  }
  return parts.join("\n\n");
}

function generateTailwind(
  system: EditorDesignSystem,
  namespace: string
): string {
  const colorEntries = exportableColors(system.colors)
    .map((t) => `      '${nsTwKey(namespace, t.name)}': '${t.value}',`)
    .join("\n");
  const themeColorEntries = CORE_THEME_SEMANTICS.map((name) => {
    const key = nsTwKey(namespace, name);
    const cssVar = themeSemanticVar(namespace, name);
    return `      '${key}': 'var(${cssVar})',`;
  }).join("\n");
  const spacingEntries = system.spacing
    .filter((t) => t.group === "scale")
    .map((t) => `      '${nsTwKey(namespace, t.name)}': '${t.value}',`)
    .join("\n");
  const radiusEntries = system.borderRadius
    .map((t) => `      '${nsTwKey(namespace, t.name)}': '${t.value}',`)
    .join("\n");
  const shadowEntries = system.shadows
    .map((t) => `      '${nsTwKey(namespace, t.name)}': '${t.value}',`)
    .join("\n");
  const fontSizeEntries = system.typography
    .filter((t) => t.group === "size")
    .map((t) => `      '${nsTwKey(namespace, t.name)}': '${t.value}',`)
    .join("\n");

  const themeScopes = generateTailwindThemeCss(system, namespace);
  const themeIds = system.themes
    .filter((t) => t.id !== rootTheme(system)?.id)
    .map((t) => `.${t.id}`)
    .join(", ");

  return `/* tailwind.config.js
 * darkMode: 'class' — toggle themes via class on <html>/<body>, NOT media.
 * Apply one of: ${themeIds || "(no alternate themes)"}
 * (Light values live on :root — see theme scopes CSS below.)
 */
darkMode: 'class',

theme: {
  extend: {
    colors: {
${colorEntries || "      // no color tokens"}
      // Theme semantics (CSS-var driven — swap with .theme-* classes)
${themeColorEntries || "      // no theme semantics"}
    },
    spacing: {
${spacingEntries || "      // no spacing tokens"}
    },
    borderRadius: {
${radiusEntries || "      // no radius tokens"}
    },
    boxShadow: {
${shadowEntries || "      // no shadow tokens"}
    },
    fontSize: {
${fontSizeEntries || "      // no font-size tokens"}
    },
    // Components — reserved namespace (${namespace})
  }
}

/* ── Theme scopes (class strategy) — paste into global CSS ── */
${themeScopes}`;
}

type JsonTokenExport = {
  value: string;
  embedCode?: string;
  resolvedFamily?: string;
  fallbackStack?: string;
};

function generateJson(
  system: EditorDesignSystem,
  namespace: string
): string {
  const ns = namespace.trim() || "acme";
  const obj: Record<string, Record<string, JsonTokenExport>> = {
    [ns]: {},
  };
  for (const t of flatTokens(system)) {
    if (isEmbedTypography(t)) {
      obj[ns][t.name] = {
        value: t.value,
        embedCode: t.embedCode,
        resolvedFamily: t.resolvedFamily,
        fallbackStack: t.fallbackStack,
      };
    } else {
      obj[ns][t.name] = { value: t.value };
    }
  }
  for (const theme of system.themes) {
    for (const name of CORE_THEME_SEMANTICS) {
      obj[ns][`theme.${theme.id}.${name}`] = {
        value: resolveThemeToken(name, theme, system.colors),
      };
    }
  }
  return JSON.stringify(obj, null, 2);
}

function generateTypeScript(
  system: EditorDesignSystem,
  namespace: string
): string {
  const ns = (namespace.trim() || "acme").replace(/[^a-zA-Z0-9_]/g, "_");
  const entries = flatTokens(system)
    .map((t) => {
      if (isEmbedTypography(t)) {
        return [
          `  ${tokenToTsKey(t.name)}: {`,
          `    value: '${escapeTsString(t.value)}',`,
          `    embedCode: '${escapeTsString(t.embedCode ?? "")}',`,
          `    resolvedFamily: '${escapeTsString(t.resolvedFamily ?? "")}',`,
          `    fallbackStack: '${escapeTsString(t.fallbackStack ?? "")}',`,
          `  },`,
        ].join("\n");
      }
      return `  ${tokenToTsKey(t.name)}: '${escapeTsString(t.value)}',`;
    })
    .join("\n");
  const themeEntries = system.themes
    .flatMap((theme) =>
      CORE_THEME_SEMANTICS.map((name) => {
        const value = escapeTsString(
          resolveThemeToken(name, theme, system.colors)
        );
        return `  ${tokenToTsKey(`theme.${theme.id}.${name}`)}: '${value}',`;
      })
    )
    .join("\n");
  const reserved = !system.components.length
    ? "  // components: reserved — no tokens yet"
    : "";
  const body = [entries, themeEntries, reserved].filter(Boolean).join("\n");
  return `export const ${ns} = {\n${body}\n} as const;`;
}

/** @deprecated Prefer generateDesignSystemCode — kept for color-only callers */
export function generateTokenCode(
  tokens: ColorToken[],
  namespace: string,
  tab: CodeTab
): string {
  return generateDesignSystemCode(
    {
      colors: tokens,
      typography: [],
      spacing: [],
      borderRadius: [],
      shadows: [],
      themes: [],
      components: [],
    },
    namespace,
    tab
  );
}

export function generateDesignSystemCode(
  system: EditorDesignSystem,
  namespace: string,
  tab: CodeTab
): string {
  const ns = namespace.trim() || "acme";
  switch (tab) {
    case "css":
      return generateCss(system, ns);
    case "tailwind":
      return generateTailwind(system, ns);
    case "json":
      return generateJson(system, ns);
    case "typescript":
      return generateTypeScript(system, ns);
    case "markdown":
      return generateDesignMarkdown(system, ns);
    default:
      return "";
  }
}
