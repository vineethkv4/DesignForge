"use client";

import { IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ColorDotPicker } from "@/components/shared/ColorDotPicker";
import { isValidHex } from "@/lib/colorScale";
import { MODAL_COLOR_PRESETS } from "@/lib/demoData";
import type { NewSystemData } from "@/types/dashboard";

interface NewSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewSystemData) => void;
}

function normalizeHexInput(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function NewSystemModal({ isOpen, onClose, onCreate }: NewSystemModalProps) {
  const [name, setName] = useState("");
  const [brandColor, setBrandColor] = useState("#7733FF");
  const [localHex, setLocalHex] = useState("");

  if (!isOpen) return null;

  const displayHex = localHex || brandColor;
  const canCreate = Boolean(name.trim()) && isValidHex(brandColor);

  const applyColor = (value: string) => {
    const normalized = normalizeHexInput(value);
    if (isValidHex(normalized)) {
      setBrandColor(normalized.slice(0, 7));
    }
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), brandColor });
    setName("");
    setBrandColor("#7733FF");
    setLocalHex("");
  };

  return (
    <div className="app-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="app-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-system-title"
      >
        <div className="app-panel-header">
          <span id="new-system-title" className="app-panel-title">
            New design system
          </span>
          <button type="button" className="app-icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "var(--app-text-secondary)" }}
            >
              System name
            </label>
            <input
              className="app-modal-input"
              placeholder="e.g. Acme Corp, MyApp…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium"
              style={{ color: "var(--app-text-secondary)" }}
            >
              Primary color
            </label>
            <div className="app-modal-color-row">
              <div className="app-modal-swatch" style={{ background: brandColor }}>
                <input
                  type="color"
                  value={isValidHex(brandColor) ? brandColor : "#7733FF"}
                  aria-label="Primary color picker"
                  onChange={(e) => {
                    applyColor(e.target.value);
                    setLocalHex("");
                  }}
                />
              </div>
              <input
                className="app-modal-input app-modal-hex"
                value={displayHex}
                spellCheck={false}
                placeholder="#7733FF"
                aria-label="Primary color hex"
                onChange={(e) => {
                  setLocalHex(e.target.value);
                  applyColor(e.target.value);
                }}
                onBlur={() => {
                  if (
                    localHex === "" ||
                    isValidHex(normalizeHexInput(localHex))
                  ) {
                    setLocalHex("");
                  }
                }}
              />
            </div>
            <div className="mt-2.5">
              <ColorDotPicker
                colors={MODAL_COLOR_PRESETS}
                selected={brandColor}
                onSelect={(c) => {
                  setBrandColor(c);
                  setLocalHex("");
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="flex justify-end gap-2 border-t p-3.5 px-5"
          style={{ borderColor: "var(--app-border)" }}
        >
          <button type="button" className="app-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="app-btn-primary"
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Create system
          </button>
        </div>
      </div>
    </div>
  );
}
