import type { TokenCategory } from "@/types/tokens";

/**
 * Editor rail scope — all TokenCategory values except motion
 * (motion is Phase 2 and is not a TokenCategory member).
 *
 * Order: Colors → Typography → Spacing → Radius → Shadows → Themes → Components
 */
export const ENABLED_CATEGORIES = [
  "color",
  "typography",
  "spacing",
  "radius",
  "shadow",
  "themes",
  "components",
] as const satisfies readonly TokenCategory[];

export type EnabledTokenCategory = (typeof ENABLED_CATEGORIES)[number];

export function isEnabledCategory(
  category: TokenCategory
): category is EnabledTokenCategory {
  return (ENABLED_CATEGORIES as readonly TokenCategory[]).includes(category);
}
