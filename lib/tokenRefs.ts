import type { DesignToken } from "@/types/tokens";

/**
 * Resolve a design token value through `refOf` chains (cycle-safe).
 * Used for typography / shadow (and any category with token→token aliases).
 */
export function resolveDesignTokenValue<T extends DesignToken>(
  token: T,
  all: T[],
  seen: Set<string> = new Set()
): string {
  if (token.refOf) {
    if (seen.has(token.id)) return token.value;
    seen.add(token.id);
    const target = all.find((t) => t.id === token.refOf);
    if (target) return resolveDesignTokenValue(target, all, seen);
  }
  return token.value;
}

/** Sync `.value` on aliased tokens so consumers reading `.value` stay current. */
export function syncResolvedDesignTokens<T extends DesignToken>(tokens: T[]): T[] {
  return tokens.map((token) => {
    if (!token.refOf) return token;
    const resolved = resolveDesignTokenValue(token, tokens);
    if (token.value === resolved) return token;
    return { ...token, value: resolved };
  });
}
