"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect, useId, useRef } from "react";
import { CompositeTokenGallery } from "@/components/editor/CompositeTokenGallery";

interface PreviewOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen read-only gallery. Reuses CompositeTokenGallery (same store
 * subscription as the sidebar). Never writes token state.
 * Phase 2: screenshot / share could hang off this surface.
 */
export function PreviewOverlay({ open, onClose }: PreviewOverlayProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ed-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="ed-preview-overlay-backdrop" onClick={onClose} />
      <div className="ed-preview-overlay-panel">
        <header className="ed-preview-overlay-head">
          <div>
            <h2 id={titleId} className="ed-preview-overlay-title">
              System preview
            </h2>
            <p className="ed-preview-overlay-sub">
              Read-only gallery · updates live from your tokens
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="ed-preview-overlay-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <IconX size={18} />
          </button>
        </header>
        <div className="ed-preview-overlay-body">
          <CompositeTokenGallery density="expanded" />
        </div>
      </div>
    </div>
  );
}
