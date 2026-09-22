"use client";

import { useEffect, useRef } from "react";

/**
 * Smooth-scroll the matching `.ed-tok-card[data-token-id]` into the
 * center panel when the selected token changes (e.g. side-list click).
 */
export function useScrollTokenCardIntoView(tokenId: string | null) {
  const prevId = useRef<string | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    // Skip the initial hydrate selection — only animate on later clicks.
    if (!ready.current) {
      ready.current = true;
      prevId.current = tokenId;
      return;
    }

    if (!tokenId || tokenId === prevId.current) {
      prevId.current = tokenId;
      return;
    }
    prevId.current = tokenId;

    const run = () => {
      const root = document.querySelector(".ed-center-scroll");
      if (!root) return;
      const el = root.querySelector<HTMLElement>(
        `[data-token-id="${CSS.escape(tokenId)}"]`
      );
      if (!el) return;
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    };

    // Wait a frame so the card can expand (`.active`) before measuring.
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
    return () => cancelAnimationFrame(frame);
  }, [tokenId]);
}
