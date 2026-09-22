/**
 * Human-readable Markdown documentation export (design spec, not code).
 * Same `EditorDesignSystem` input as the CSS / DTCG exports so docs and code
 * can never drift. Output is deterministic — no timestamps — so a generated
 * `design-system.md` can be committed and diffed.
 */
import type { EditorDesignSystem } from "@/lib/codeGen";
import { COLOR_CATEGORY_META } from "@/lib/config/recommendedColorTokens";
import { parseFontEmbed } from "@/lib/fontEmbedParser";
import { sanitizeParsedEmbed } from "@/lib/fontEmbedSanitizer";
import { resolveThemeToken } from "@/lib/themeResolve";
import type {
  ColorToken,
  DesignToken,
  Theme,
  TypographyToken,
} from "@/types/tokens";
import { CORE_THEME_SEMANTICS } from "@/types/tokens";

const TYPOGRAPHY_GROUPS: { group: TypographyToken["group"]; label: string }[] = [
  { group: "family", label: "Font families" },
  { group: "size", label: "Font sizes" },
  { group: "weight", label: "Font weights" },
  { group: "lineHeight", label: "Line height" },
  { group: "letterSpacing", label: "Letter spacing" },
];

function cssVar(name: string, namespace: string): string {
  return `--${namespace}-${name.replace(/\./g, "-")}`;
}

/** Pipes break GFM table cells even inside code spans. */
function cell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function code(value: string): string {
  return `\`${cell(value)}\``;
}

/** GitHub-style heading anchor. */
function anchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type NotesFn<T extends DesignToken> = (token: T) => string;

function tokenTable<T extends DesignToken>(
  tokens: T[],
  namespace: string,
  notesFor: NotesFn<T>
): string {
  const rows = tokens.map(
    (t) =>
      `| ${code(t.name)} | ${code(cssVar(t.name, namespace))} | ${code(
        t.value
      )} | ${notesFor(t)} |`
  );
  return [
    "| Token | CSS variable | Value | Notes |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

function joinNotes(parts: string[]): string {
  return parts.length ? parts.join(" · ") : "—";
}

function baseNotes(token: DesignToken): string {
  return joinNotes(token.refOf ? [`Alias of ${code(token.refOf)}`] : []);
}

function colorNotes(token: ColorToken): string {
  const parts: string[] = [];
  if (token.refOf) {
    parts.push(`Alias of ${code(token.refOf)}`);
  } else if (token.stepRef != null) {
    parts.push(
      `Step ${token.stepRef} of ${code(token.scaleOf ?? "primary")} scale`
    );
  }
  if (token.wcag) {
    parts.push(
      token.wcag === "fail"
        ? "Contrast: fail"
        : `Contrast: ${token.wcag.toUpperCase()}`
    );
  }
  return joinNotes(parts);
}

interface EmbedDoc {
  family: string;
  kind: "link" | "font-face";
  host: string;
  snippet: string;
  lang: "css";
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Re-run the same parse → sanitize pipeline the CSS export uses, so the doc
 * only ever shows embed code that would actually be emitted.
 */
function describeEmbed(token: TypographyToken): EmbedDoc | null {
  if (token.source !== "embed" || !token.embedCode?.trim()) return null;

  const parsed = parseFontEmbed(token.embedCode);
  if (!parsed.ok) return null;
  const sanitized = sanitizeParsedEmbed(parsed.kind, token.embedCode);
  if (!sanitized.ok) return null;

  const family = token.resolvedFamily?.trim() || parsed.family;

  if (parsed.kind === "link" && "href" in sanitized) {
    return {
      family,
      kind: "link",
      host: hostOf(sanitized.href),
      snippet: `@import url("${sanitized.href}");`,
      lang: "css",
    };
  }
  if ("css" in sanitized) {
    const urlMatch = sanitized.css.match(/url\s*\(\s*['"]?(https:\/\/[^'")\s]+)/i);
    return {
      family,
      kind: "font-face",
      host: urlMatch?.[1] ? hostOf(urlMatch[1]) : "",
      snippet: sanitized.css,
      lang: "css",
    };
  }
  return null;
}

function typographyNotes(
  token: TypographyToken,
  embeds: Map<string, EmbedDoc>
): string {
  const parts: string[] = [];
  if (token.refOf) parts.push(`Alias of ${code(token.refOf)}`);

  if (token.source === "embed") {
    const embed = embeds.get(token.id);
    parts.push(embed?.host ? `Embedded · ${embed.host}` : "Embedded");
    if (token.embedStatus === "failed") parts.push("**Load failed**");
    if (token.fallbackStack) parts.push(`Fallback ${code(token.fallbackStack)}`);
  }
  return joinNotes(parts);
}

function colorsSection(
  colors: ColorToken[],
  namespace: string
): string | null {
  const solids = colors.filter((t) => !t.gradient);
  const gradients = colors.filter((t) => t.gradient);
  if (!solids.length && !gradients.length) return null;

  const blocks: string[] = ["## Colors"];

  for (const { key, label } of COLOR_CATEGORY_META) {
    const group = solids.filter((t) => t.group === key);
    if (!group.length) continue;
    blocks.push(`### ${label}`, tokenTable(group, namespace, colorNotes));
  }

  // Groups added outside the known catalog still need to show up.
  const known = new Set(COLOR_CATEGORY_META.map((m) => m.key));
  const other = solids.filter((t) => !known.has(t.group));
  if (other.length) {
    blocks.push("### Other", tokenTable(other, namespace, colorNotes));
  }

  if (gradients.length) {
    blocks.push(
      "### Gradients",
      "Editor-only previews — excluded from the CSS / Tailwind / JSON code exports.",
      tokenTable(gradients, namespace, (t) =>
        joinNotes(t.gradient ? [`${t.gradient.angle}° linear`] : [])
      )
    );
  }

  return blocks.join("\n\n");
}

function typographySection(
  typography: TypographyToken[],
  namespace: string,
  embeds: Map<string, EmbedDoc>
): string | null {
  if (!typography.length) return null;

  const blocks: string[] = ["## Typography"];

  for (const { group, label } of TYPOGRAPHY_GROUPS) {
    const tokens = typography.filter((t) => t.group === group);
    if (!tokens.length) continue;
    blocks.push(
      `### ${label}`,
      tokenTable(tokens, namespace, (t) => typographyNotes(t, embeds))
    );
  }

  const embedded = typography
    .map((t) => embeds.get(t.id))
    .filter((e): e is EmbedDoc => Boolean(e));

  if (embedded.length) {
    const seen = new Set<string>();
    const parts: string[] = [
      "### Embedded fonts",
      "Add these to your app's global CSS — the CSS export already includes them above `:root`.",
    ];
    for (const embed of embedded) {
      const key = embed.family.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const origin = embed.host ? ` — served from \`${embed.host}\`` : "";
      parts.push(
        `**${embed.family}**${origin}`,
        `\`\`\`${embed.lang}\n${embed.snippet}\n\`\`\``
      );
    }
    blocks.push(parts.join("\n\n"));
  }

  return blocks.join("\n\n");
}

function simpleSection<T extends DesignToken>(
  heading: string,
  tokens: T[],
  namespace: string
): string | null {
  if (!tokens.length) return null;
  return [`## ${heading}`, tokenTable(tokens, namespace, baseNotes)].join("\n\n");
}

function themesSection(themes: Theme[], colors: ColorToken[]): string | null {
  if (!themes.length) return null;

  const blocks: string[] = [
    "## Themes",
    "Semantic slots resolve automatically from the neutral scale unless overridden.",
  ];

  for (const theme of themes) {
    const rows = CORE_THEME_SEMANTICS.map((name) => {
      const value = resolveThemeToken(name, theme, colors);
      const overridden = Object.prototype.hasOwnProperty.call(
        theme.overrides,
        name
      );
      return `| ${code(name)} | ${code(value)} | ${
        overridden ? "Override" : "Auto"
      } |`;
    });
    blocks.push(
      `### ${theme.name} (${theme.baseMode})`,
      [
        "| Semantic | Value | Source |",
        "| --- | --- | --- |",
        ...rows,
      ].join("\n")
    );
  }

  return blocks.join("\n\n");
}

/** Build the full Markdown design spec for a token set. */
export function generateDesignMarkdown(
  system: EditorDesignSystem,
  namespace: string
): string {
  const ns = namespace.trim() || "acme";

  const embeds = new Map<string, EmbedDoc>();
  for (const token of system.typography) {
    const embed = describeEmbed(token);
    if (embed) embeds.set(token.id, embed);
  }

  const sections: { heading: string; body: string }[] = [];
  const push = (heading: string, body: string | null) => {
    if (body) sections.push({ heading, body });
  };

  push("Colors", colorsSection(system.colors, ns));
  push("Typography", typographySection(system.typography, ns, embeds));
  push("Spacing", simpleSection("Spacing", system.spacing, ns));
  push("Border radius", simpleSection("Border radius", system.borderRadius, ns));
  push("Shadows", simpleSection("Shadows", system.shadows, ns));
  push("Components", simpleSection("Components", system.components, ns));
  push("Themes", themesSection(system.themes, system.colors));

  const tokenCount =
    system.colors.length +
    system.typography.length +
    system.spacing.length +
    system.borderRadius.length +
    system.shadows.length +
    system.components.length;

  const header = [
    `# ${ns} design system`,
    tokenCount
      ? `${tokenCount} tokens across ${sections.length} section${
          sections.length === 1 ? "" : "s"
        }. Every token is exposed as a CSS custom property prefixed \`--${ns}-\`.`
      : "No tokens yet — add tokens in the editor and export again.",
  ];

  if (!sections.length) return `${header.join("\n\n")}\n`;

  const contents = [
    "## Contents",
    sections
      .map((s) => `- [${s.heading}](#${anchor(s.heading)})`)
      .join("\n"),
  ].join("\n\n");

  return `${[...header, contents, ...sections.map((s) => s.body)].join(
    "\n\n"
  )}\n`;
}
