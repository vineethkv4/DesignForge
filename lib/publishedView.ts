import type { EditorDesignSystem } from "@/lib/codeGen";
import type { PublishedSnapshot } from "@/types/dashboard";
import { normalizeThemes } from "@/lib/themeResolve";
import type {
  BorderRadiusToken,
  ColorToken,
  DesignToken,
  ShadowToken,
  SpacingToken,
  TypographyToken,
} from "@/types/tokens";

/** Map frozen publish blob → code-gen / display shape (read-only). */
export function publishedToEditorSystem(
  snap: PublishedSnapshot
): EditorDesignSystem {
  return {
    colors: (snap.tokens ?? []) as ColorToken[],
    typography: (snap.typography ?? []) as TypographyToken[],
    spacing: (snap.spacing ?? []) as SpacingToken[],
    borderRadius: (snap.radius ?? []) as BorderRadiusToken[],
    shadows: (snap.shadow ?? []) as ShadowToken[],
    themes: normalizeThemes(snap.theme),
    components: (snap.component ?? []) as DesignToken[],
  };
}

export type DesignSystemSectionId =
  | "overview"
  | "colors"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow"
  | "components"
  | "forms"
  | "toggles"
  | "guidelines"
  | "export";

export const DESIGN_SYSTEM_SECTIONS: {
  id: DesignSystemSectionId;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Radius" },
  { id: "shadow", label: "Shadow" },
  { id: "components", label: "Components" },
  { id: "forms", label: "Forms" },
  { id: "toggles", label: "Toggles" },
  { id: "guidelines", label: "Guidelines" },
  { id: "export", label: "Export" },
];

/** Resolve a component token value from the published snapshot. */
export function compToken(
  components: DesignToken[],
  id: string,
  fallback: string
): string {
  return components.find((t) => t.id === id)?.value ?? fallback;
}

export function colorToken(
  colors: ColorToken[],
  id: string,
  fallback: string
): string {
  return colors.find((t) => t.id === id)?.value ?? fallback;
}

export function radiusToken(
  radii: BorderRadiusToken[],
  id: string,
  fallback: string
): string {
  return radii.find((t) => t.id === id)?.value ?? fallback;
}
