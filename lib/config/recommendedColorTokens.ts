import type { ColorTokenGroup } from "@/types/tokens";

/**
 * Recommended semantic color tokens for the Add Token picker.
 * Only entries not already present in the store are shown.
 */
export interface RecommendedColorToken {
  id: string;
  /** DTCG-style name, e.g. color.border.focus */
  name: string;
  label: string;
  category: ColorTokenGroup;
  description: string;
  /**
   * Preferred alias target id when that token exists.
   * `null` = foundation / prefer a solid color value by default.
   */
  defaultRefOf: string | null;
  /** Fallback hex when created as a solid (no usable reference). */
  defaultValue: string;
  /**
   * Existing demo / legacy ids that count as “already created”
   * for this recommendation (different id, same role).
   */
  matchesExisting?: string[];
}

export const COLOR_CATEGORY_META: {
  key: ColorTokenGroup;
  label: string;
  /** Tabler icon name key used by the popover */
  icon: "palette" | "layout" | "typography" | "border" | "icons" | "alert" | "click" | "layers" | "chart";
}[] = [
  { key: "semantic", label: "Semantic", icon: "palette" },
  { key: "surface", label: "Surface", icon: "layout" },
  { key: "text", label: "Text", icon: "typography" },
  { key: "border", label: "Border", icon: "border" },
  { key: "icon", label: "Icon", icon: "icons" },
  { key: "feedback", label: "Feedback", icon: "alert" },
  { key: "interactive", label: "Interactive", icon: "click" },
  { key: "overlay", label: "Overlay", icon: "layers" },
  { key: "charts", label: "Charts", icon: "chart" },
];

const PRIMARY = "primary";
const SURFACE_PRIMARY = "surface-primary";
const TEXT_SECONDARY = "text-secondary";

export const RECOMMENDED_COLOR_TOKENS: RecommendedColorToken[] = [
  // Semantic
  {
    id: "primary",
    name: "color.primary",
    label: "Primary",
    category: "semantic",
    description: "Brand core. Foundation for CTAs, links, and focus rings.",
    defaultRefOf: null,
    defaultValue: "#4F4DFF",
  },
  {
    id: "secondary",
    name: "color.secondary",
    label: "Secondary",
    category: "semantic",
    description: "Supporting brand color for secondary actions and accents.",
    defaultRefOf: null,
    defaultValue: "#6366f1",
  },
  {
    id: "tertiary",
    name: "color.tertiary",
    label: "Tertiary",
    category: "semantic",
    description: "Third-tier brand accent for rare emphasis.",
    defaultRefOf: null,
    defaultValue: "#8b5cf6",
  },
  {
    id: "brand",
    name: "color.brand",
    label: "Brand",
    category: "semantic",
    description: "Canonical brand fill — usually aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "accent",
    name: "color.accent",
    label: "Accent",
    category: "semantic",
    description: "Highlight color for badges, sparklines, and moments of emphasis.",
    defaultRefOf: null,
    defaultValue: "#ec4899",
  },
  {
    id: "neutral",
    name: "color.neutral",
    label: "Neutral",
    category: "semantic",
    description: "Neutral foundation for gray UI chrome.",
    defaultRefOf: null,
    defaultValue: "#737373",
  },
  {
    id: "inverse",
    name: "color.inverse",
    label: "Inverse",
    category: "semantic",
    description: "Color used on inverted surfaces (e.g. dark hero on light UI).",
    defaultRefOf: null,
    defaultValue: "#111110",
  },
  {
    id: "subtle",
    name: "color.subtle",
    label: "Subtle",
    category: "semantic",
    description: "Soft tint of the brand for backgrounds and quiet emphasis.",
    defaultRefOf: "primary-subtle",
    defaultValue: "#f5f3ff",
  },

  // Surface
  {
    id: "surface-primary",
    name: "color.surface.primary",
    label: "Primary",
    category: "surface",
    description: "Default page / canvas background.",
    defaultRefOf: null,
    defaultValue: "#ffffff",
    matchesExisting: ["bg-primary"],
  },
  {
    id: "surface-secondary",
    name: "color.surface.secondary",
    label: "Secondary",
    category: "surface",
    description: "Secondary surface — cards, sidebars. Prefer aliasing Surface Primary.",
    defaultRefOf: SURFACE_PRIMARY,
    defaultValue: "#f8f8f6",
    matchesExisting: ["bg-secondary"],
  },
  {
    id: "surface-tertiary",
    name: "color.surface.tertiary",
    label: "Tertiary",
    category: "surface",
    description: "Tertiary wash for nested panels and wells.",
    defaultRefOf: SURFACE_PRIMARY,
    defaultValue: "#f0efed",
    matchesExisting: ["bg-tertiary"],
  },
  {
    id: "surface-elevated",
    name: "color.surface.elevated",
    label: "Elevated",
    category: "surface",
    description: "Raised surfaces (modals, popovers) above the canvas.",
    defaultRefOf: SURFACE_PRIMARY,
    defaultValue: "#ffffff",
  },
  {
    id: "surface-overlay",
    name: "color.surface.overlay",
    label: "Overlay",
    category: "surface",
    description: "Surface tint used under floating layers.",
    defaultRefOf: SURFACE_PRIMARY,
    defaultValue: "#ffffff",
  },
  {
    id: "surface-hover",
    name: "color.surface.hover",
    label: "Hover",
    category: "surface",
    description: "Row / card hover wash.",
    defaultRefOf: "surface-secondary",
    defaultValue: "#f8f8f6",
  },
  {
    id: "surface-selected",
    name: "color.surface.selected",
    label: "Selected",
    category: "surface",
    description: "Selected row or nav item background.",
    defaultRefOf: "primary-subtle",
    defaultValue: "#f5f3ff",
  },
  {
    id: "surface-disabled",
    name: "color.surface.disabled",
    label: "Disabled",
    category: "surface",
    description: "Disabled control background.",
    defaultRefOf: "surface-tertiary",
    defaultValue: "#f0efed",
  },

  // Text
  {
    id: "text-primary",
    name: "color.text.primary",
    label: "Primary",
    category: "text",
    description: "Default body / heading text.",
    defaultRefOf: null,
    defaultValue: "#111110",
  },
  {
    id: "text-secondary",
    name: "color.text.secondary",
    label: "Secondary",
    category: "text",
    description: "Supporting copy and metadata.",
    defaultRefOf: null,
    defaultValue: "#52524e",
  },
  {
    id: "text-tertiary",
    name: "color.text.tertiary",
    label: "Tertiary",
    category: "text",
    description: "Quiet labels and captions.",
    defaultRefOf: null,
    defaultValue: "#a0a09a",
  },
  {
    id: "text-inverse",
    name: "color.text.inverse",
    label: "Inverse",
    category: "text",
    description: "Text on dark / inverse surfaces.",
    defaultRefOf: "surface-primary",
    defaultValue: "#ffffff",
  },
  {
    id: "text-disabled",
    name: "color.text.disabled",
    label: "Disabled",
    category: "text",
    description: "Disabled label color.",
    defaultRefOf: "text-tertiary",
    defaultValue: "#a0a09a",
  },
  {
    id: "text-placeholder",
    name: "color.text.placeholder",
    label: "Placeholder",
    category: "text",
    description: "Input placeholder text.",
    defaultRefOf: "text-tertiary",
    defaultValue: "#a0a09a",
  },
  {
    id: "text-link",
    name: "color.text.link",
    label: "Link",
    category: "text",
    description: "Inline link color — aliases Primary by default.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "text-brand",
    name: "color.text.brand",
    label: "Brand",
    category: "text",
    description: "Brand-colored text — aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },

  // Border
  {
    id: "border-default",
    name: "color.border.default",
    label: "Default",
    category: "border",
    description: "Default hairline borders and dividers.",
    defaultRefOf: null,
    defaultValue: "rgba(0,0,0,0.08)",
    matchesExisting: ["border"],
  },
  {
    id: "border-strong",
    name: "color.border.strong",
    label: "Strong",
    category: "border",
    description: "Higher-contrast borders for emphasis.",
    defaultRefOf: "border-default",
    defaultValue: "rgba(0,0,0,0.16)",
  },
  {
    id: "border-subtle",
    name: "color.border.subtle",
    label: "Subtle",
    category: "border",
    description: "Barely-there separators.",
    defaultRefOf: "border-default",
    defaultValue: "rgba(0,0,0,0.05)",
  },
  {
    id: "border-divider",
    name: "color.border.divider",
    label: "Divider",
    category: "border",
    description: "Section dividers between content blocks.",
    defaultRefOf: "border-default",
    defaultValue: "rgba(0,0,0,0.08)",
  },
  {
    id: "border-focus",
    name: "color.border.focus",
    label: "Focus",
    category: "border",
    description: "Focus ring / outline — aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "border-selected",
    name: "color.border.selected",
    label: "Selected",
    category: "border",
    description: "Selected control border — aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "border-disabled",
    name: "color.border.disabled",
    label: "Disabled",
    category: "border",
    description: "Disabled control border.",
    defaultRefOf: "border-subtle",
    defaultValue: "rgba(0,0,0,0.05)",
  },

  // Icon
  {
    id: "icon-primary",
    name: "color.icon.primary",
    label: "Primary",
    category: "icon",
    description: "Default icon color — aliases Text Primary.",
    defaultRefOf: "text-primary",
    defaultValue: "#111110",
  },
  {
    id: "icon-secondary",
    name: "color.icon.secondary",
    label: "Secondary",
    category: "icon",
    description: "Secondary icons — aliases Text Secondary.",
    defaultRefOf: TEXT_SECONDARY,
    defaultValue: "#52524e",
  },
  {
    id: "icon-tertiary",
    name: "color.icon.tertiary",
    label: "Tertiary",
    category: "icon",
    description: "Quiet decorative icons.",
    defaultRefOf: "text-tertiary",
    defaultValue: "#a0a09a",
  },
  {
    id: "icon-disabled",
    name: "color.icon.disabled",
    label: "Disabled",
    category: "icon",
    description: "Disabled icon color.",
    defaultRefOf: "text-disabled",
    defaultValue: "#a0a09a",
  },
  {
    id: "icon-brand",
    name: "color.icon.brand",
    label: "Brand",
    category: "icon",
    description: "Brand-tinted icons — aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "icon-inverse",
    name: "color.icon.inverse",
    label: "Inverse",
    category: "icon",
    description: "Icons on inverse / dark surfaces.",
    defaultRefOf: "text-inverse",
    defaultValue: "#ffffff",
  },

  // Feedback
  {
    id: "success",
    name: "color.success",
    label: "Success",
    category: "feedback",
    description: "Positive status, success alerts, and confirmations.",
    defaultRefOf: null,
    defaultValue: "#10b981",
  },
  {
    id: "warning",
    name: "color.warning",
    label: "Warning",
    category: "feedback",
    description: "Cautionary status and warning alerts.",
    defaultRefOf: null,
    defaultValue: "#f59e0b",
  },
  {
    id: "error",
    name: "color.error",
    label: "Error",
    category: "feedback",
    description: "Destructive / error status.",
    defaultRefOf: null,
    defaultValue: "#ef4444",
    matchesExisting: ["danger"],
  },
  {
    id: "info",
    name: "color.info",
    label: "Info",
    category: "feedback",
    description: "Informational status and tips.",
    defaultRefOf: null,
    defaultValue: "#3b82f6",
  },

  // Interactive
  {
    id: "interactive-hover",
    name: "color.interactive.hover",
    label: "Hover",
    category: "interactive",
    description: "Interactive hover accent — aliases Primary Hover when present.",
    defaultRefOf: "primary-hover",
    defaultValue: "#4338ca",
  },
  {
    id: "interactive-active",
    name: "color.interactive.active",
    label: "Active",
    category: "interactive",
    description: "Active / current interactive state — aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "interactive-pressed",
    name: "color.interactive.pressed",
    label: "Pressed",
    category: "interactive",
    description: "Pressed state for buttons and controls.",
    defaultRefOf: "primary-hover",
    defaultValue: "#4338ca",
  },
  {
    id: "interactive-focus",
    name: "color.interactive.focus",
    label: "Focus",
    category: "interactive",
    description: "Focus indicator fill — aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "interactive-selected",
    name: "color.interactive.selected",
    label: "Selected",
    category: "interactive",
    description: "Selected control accent — aliases Primary.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "interactive-disabled",
    name: "color.interactive.disabled",
    label: "Disabled",
    category: "interactive",
    description: "Disabled interactive chrome.",
    defaultRefOf: "text-tertiary",
    defaultValue: "#a0a09a",
  },

  // Overlay
  {
    id: "overlay",
    name: "color.overlay",
    label: "Overlay",
    category: "overlay",
    description: "Dimmed layer over content (modals, drawers).",
    defaultRefOf: null,
    defaultValue: "rgba(17,17,16,0.45)",
  },
  {
    id: "backdrop",
    name: "color.backdrop",
    label: "Backdrop",
    category: "overlay",
    description: "Full-screen backdrop behind dialogs.",
    defaultRefOf: "overlay",
    defaultValue: "rgba(17,17,16,0.45)",
  },
  {
    id: "scrim",
    name: "color.scrim",
    label: "Scrim",
    category: "overlay",
    description: "Gradient / edge scrim for media and sheets.",
    defaultRefOf: "overlay",
    defaultValue: "rgba(17,17,16,0.32)",
  },
  {
    id: "glass",
    name: "color.glass",
    label: "Glass",
    category: "overlay",
    description: "Translucent glassmorphism panel fill.",
    defaultRefOf: null,
    defaultValue: "rgba(255,255,255,0.72)",
  },

  // Charts
  {
    id: "chart-1",
    name: "color.chart.1",
    label: "Chart 1",
    category: "charts",
    description: "First series color in data visualizations.",
    defaultRefOf: PRIMARY,
    defaultValue: "#4F4DFF",
  },
  {
    id: "chart-2",
    name: "color.chart.2",
    label: "Chart 2",
    category: "charts",
    description: "Second series color.",
    defaultRefOf: null,
    defaultValue: "#10b981",
  },
  {
    id: "chart-3",
    name: "color.chart.3",
    label: "Chart 3",
    category: "charts",
    description: "Third series color.",
    defaultRefOf: null,
    defaultValue: "#f59e0b",
  },
  {
    id: "chart-4",
    name: "color.chart.4",
    label: "Chart 4",
    category: "charts",
    description: "Fourth series color.",
    defaultRefOf: null,
    defaultValue: "#ef4444",
  },
  {
    id: "chart-5",
    name: "color.chart.5",
    label: "Chart 5",
    category: "charts",
    description: "Fifth series color.",
    defaultRefOf: null,
    defaultValue: "#3b82f6",
  },
  {
    id: "chart-6",
    name: "color.chart.6",
    label: "Chart 6",
    category: "charts",
    description: "Sixth series color.",
    defaultRefOf: null,
    defaultValue: "#ec4899",
  },
];

/** True when a recommended entry is already represented in the token list. */
export function isRecommendedTokenPresent(
  entry: RecommendedColorToken,
  colors: { id: string; name: string }[]
): boolean {
  const ids = new Set(colors.map((c) => c.id));
  const names = new Set(colors.map((c) => c.name));
  if (ids.has(entry.id) || names.has(entry.name)) return true;
  return (entry.matchesExisting ?? []).some((id) => ids.has(id));
}

/** Resolve which existing id “owns” a recommendation (for hide logic). */
export function resolveExistingId(
  entry: RecommendedColorToken,
  colors: { id: string; name: string }[]
): string | null {
  const byId = colors.find((c) => c.id === entry.id);
  if (byId) return byId.id;
  const byName = colors.find((c) => c.name === entry.name);
  if (byName) return byName.id;
  for (const id of entry.matchesExisting ?? []) {
    if (colors.some((c) => c.id === id)) return id;
  }
  return null;
}

export function slugifyTokenLabel(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "custom"
  );
}

/**
 * Map a preferred reference id onto an id that actually exists
 * (handles legacy demo ids via `matchesExisting`).
 */
export function resolveRefTargetId(
  preferredId: string | null | undefined,
  colors: { id: string }[]
): string | null {
  if (!preferredId) return null;
  if (colors.some((c) => c.id === preferredId)) return preferredId;
  const entry = RECOMMENDED_COLOR_TOKENS.find((e) => e.id === preferredId);
  for (const id of entry?.matchesExisting ?? []) {
    if (colors.some((c) => c.id === id)) return id;
  }
  if (preferredId !== "primary" && colors.some((c) => c.id === "primary")) {
    return "primary";
  }
  return null;
}
