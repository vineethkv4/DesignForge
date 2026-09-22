"use client";

import { useEffect, useRef } from "react";
import { parseFontEmbed } from "@/lib/fontEmbedParser";
import { sanitizeParsedEmbed } from "@/lib/fontEmbedSanitizer";
import {
  injectFontEmbed,
  removeAllFontEmbeds,
  removeFontEmbed,
  type InjectableFontEmbed,
} from "@/lib/fontInjector";
import { useTokenStore } from "@/stores/tokenStore";
import type { TypographyToken } from "@/types/tokens";

function embedFingerprint(t: TypographyToken): string {
  return [
    t.id,
    t.embedCode ?? "",
    t.resolvedFamily ?? "",
    t.fallbackStack ?? "",
  ].join("\0");
}

/**
 * After hydrate (and whenever embed tokens change), inject sanitized fonts
 * into document.head. Removes stale tags when embeds are cleared.
 */
export function useSyncTypographyFontEmbeds() {
  const { hydrated, state, setTypographyEmbedStatus } = useTokenStore();
  const injectedRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!hydrated) return;

    const nextFingerprints = new Map<string, string>();
    const embedTokens = state.typography.filter(
      (t) => t.group === "family" && t.source === "embed" && t.embedCode
    );

    for (const token of embedTokens) {
      const fp = embedFingerprint(token);
      nextFingerprints.set(token.id, fp);

      if (injectedRef.current.get(token.id) === fp) continue;

      const parsed = parseFontEmbed(token.embedCode!);
      if (!parsed.ok) continue;

      const sanitized = sanitizeParsedEmbed(parsed.kind, token.embedCode!);
      if (!sanitized.ok) continue;

      const family = (token.resolvedFamily ?? parsed.family).trim();
      let payload: InjectableFontEmbed;
      if (parsed.kind === "link" && "href" in sanitized) {
        payload = { kind: "link", href: sanitized.href };
      } else if ("css" in sanitized) {
        payload = { kind: "font-face", css: sanitized.css, family };
      } else {
        continue;
      }

      injectFontEmbed(token.id, payload, (status) => {
        setTypographyEmbedStatus(token.id, status);
      });
      injectedRef.current.set(token.id, fp);
    }

    for (const id of Array.from(injectedRef.current.keys())) {
      if (!nextFingerprints.has(id)) {
        removeFontEmbed(id);
        injectedRef.current.delete(id);
      }
    }
  }, [hydrated, state.typography, setTypographyEmbedStatus]);

  // Tear down all injected nodes when the editor unmounts / system changes.
  useEffect(() => {
    return () => {
      removeAllFontEmbeds();
      injectedRef.current.clear();
    };
  }, []);
}
