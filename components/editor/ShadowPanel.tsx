"use client";

import { useMemo } from "react";
import type { ShadowToken } from "@/types/tokens";

const SHADOW_ORDER = [
  "shadow-none",
  "shadow-sm",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
] as const;

interface ShadowParts {
  x: number;
  y: number;
  blur: number;
  spread: number;
  hex: string;
  opacity: number;
}

const DEFAULT_PARTS: ShadowParts = {
  x: 0,
  y: 4,
  blur: 6,
  spread: 0,
  hex: "#111110",
  opacity: 0.08,
};

interface ShadowPanelProps {
  tokens: ShadowToken[];
  onUpdate: (tokenId: string, value: string) => void;
}

function displayName(id: string): string {
  return id.replace(/^shadow-/, "");
}

function parsePxNum(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b };
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function buildShadow(parts: ShadowParts): string {
  const rgb = hexToRgb(parts.hex) ?? { r: 17, g: 17, b: 16 };
  const alpha = Math.max(0, Math.min(1, parts.opacity));
  const alphaStr = Number(alpha.toFixed(2));
  return `${parts.x}px ${parts.y}px ${parts.blur}px ${parts.spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaStr})`;
}

/** Parse the first layer of a box-shadow value into builder controls. */
function parseShadowParts(value: string): ShadowParts {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "none") {
    return { ...DEFAULT_PARTS };
  }

  // Use first layer only (ignore multi-layer tails)
  const firstLayer = trimmed.split(",")[0]?.trim() ?? trimmed;
  const withoutInset = firstLayer.replace(/^inset\s+/i, "").trim();

  const rgbaMatch = withoutInset.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i
  );
  const hexMatch = withoutInset.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);

  let hex = DEFAULT_PARTS.hex;
  let opacity = DEFAULT_PARTS.opacity;

  if (rgbaMatch) {
    hex = rgbToHex(
      parseInt(rgbaMatch[1], 10),
      parseInt(rgbaMatch[2], 10),
      parseInt(rgbaMatch[3], 10)
    );
    opacity = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
  } else if (hexMatch) {
    hex = `#${hexMatch[1]}`;
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    opacity = 1;
  }

  const lengthPart = withoutInset
    .replace(/rgba?\([^)]+\)/gi, "")
    .replace(/#[0-9a-fA-F]{3,8}\b/g, "")
    .trim();
  const lengths = lengthPart.split(/\s+/).filter(Boolean);

  return {
    x: lengths[0] !== undefined ? parsePxNum(lengths[0]) : DEFAULT_PARTS.x,
    y: lengths[1] !== undefined ? parsePxNum(lengths[1]) : DEFAULT_PARTS.y,
    blur: lengths[2] !== undefined ? parsePxNum(lengths[2]) : DEFAULT_PARTS.blur,
    spread: lengths[3] !== undefined ? parsePxNum(lengths[3]) : DEFAULT_PARTS.spread,
    hex,
    opacity: Number.isFinite(opacity) ? opacity : DEFAULT_PARTS.opacity,
  };
}

function cssShadow(value: string): string {
  return value.trim() === "" ? "none" : value;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="ed-typo-section">
      <h3 className="ed-typo-section-title">{title}</h3>
      <div className="ed-typo-card">{children}</div>
    </section>
  );
}

interface ShadowRowProps {
  token: ShadowToken;
  onUpdate: (tokenId: string, value: string) => void;
}

function ShadowRow({ token, onUpdate }: ShadowRowProps) {
  const parts = useMemo(() => parseShadowParts(token.value), [token.value]);
  const isNone = token.value.trim() === "none";

  const patchParts = (patch: Partial<ShadowParts>) => {
    onUpdate(token.id, buildShadow({ ...parts, ...patch }));
  };

  return (
    <div className="ed-shadow-row">
      <div className="ed-shadow-row-main">
        <div className="ed-shadow-row-meta">
          <span className="ed-typo-scale-name">{displayName(token.id)}</span>
          <textarea
            className="ed-shadow-textarea"
            rows={2}
            value={token.value}
            spellCheck={false}
            onChange={(e) => onUpdate(token.id, e.target.value)}
            aria-label={`${displayName(token.id)} box-shadow`}
          />
        </div>
        <div className="ed-shadow-card-stage">
          <div
            className="ed-shadow-card"
            style={{ boxShadow: cssShadow(token.value) }}
            title={token.value}
          />
        </div>
      </div>

      <div className="ed-shadow-builder">
        <div className="ed-shadow-builder-label">Shadow builder</div>
        <div className="ed-shadow-builder-grid">
          <label className="ed-shadow-field">
            <span>X</span>
            <input
              type="number"
              className="ed-typo-scale-input"
              value={parts.x}
              step={1}
              onChange={(e) => patchParts({ x: parsePxNum(e.target.value) })}
              aria-label={`${displayName(token.id)} X offset`}
            />
          </label>
          <label className="ed-shadow-field">
            <span>Y</span>
            <input
              type="number"
              className="ed-typo-scale-input"
              value={parts.y}
              step={1}
              onChange={(e) => patchParts({ y: parsePxNum(e.target.value) })}
              aria-label={`${displayName(token.id)} Y offset`}
            />
          </label>
          <label className="ed-shadow-field">
            <span>Blur</span>
            <input
              type="number"
              className="ed-typo-scale-input"
              value={parts.blur}
              min={0}
              step={1}
              onChange={(e) => patchParts({ blur: Math.max(0, parsePxNum(e.target.value)) })}
              aria-label={`${displayName(token.id)} blur`}
            />
          </label>
          <label className="ed-shadow-field">
            <span>Spread</span>
            <input
              type="number"
              className="ed-typo-scale-input"
              value={parts.spread}
              step={1}
              onChange={(e) => patchParts({ spread: parsePxNum(e.target.value) })}
              aria-label={`${displayName(token.id)} spread`}
            />
          </label>
          <label className="ed-shadow-field ed-shadow-field-color">
            <span>Color</span>
            <div className="ed-shadow-color-wrap">
              <input
                type="color"
                className="ed-shadow-color-picker"
                value={parts.hex.length === 7 ? parts.hex : "#111110"}
                onChange={(e) => patchParts({ hex: e.target.value })}
                aria-label={`${displayName(token.id)} color`}
              />
              <input
                type="text"
                className="ed-typo-scale-input ed-shadow-hex-input"
                value={parts.hex}
                spellCheck={false}
                onChange={(e) => {
                  let next = e.target.value.trim();
                  if (!next.startsWith("#")) next = `#${next}`;
                  if (/^#[0-9a-fA-F]{6}$/.test(next)) {
                    patchParts({ hex: next.toLowerCase() });
                  }
                }}
                aria-label={`${displayName(token.id)} hex`}
              />
            </div>
          </label>
          <label className="ed-shadow-field ed-shadow-field-opacity">
            <span>Opacity {Math.round(parts.opacity * 100)}%</span>
            <input
              type="range"
              className="ed-typo-slider"
              min={0}
              max={1}
              step={0.01}
              value={parts.opacity}
              onChange={(e) => patchParts({ opacity: parseFloat(e.target.value) })}
              aria-label={`${displayName(token.id)} opacity`}
            />
          </label>
        </div>
        {isNone && (
          <p className="ed-space-base-hint">
            Currently <code>none</code> — adjust builder fields to generate a shadow.
          </p>
        )}
      </div>
    </div>
  );
}

export function ShadowPanel({ tokens, onUpdate }: ShadowPanelProps) {
  const ordered = useMemo(() => {
    return SHADOW_ORDER.map((id) => tokens.find((t) => t.id === id)).filter(
      Boolean
    ) as ShadowToken[];
  }, [tokens]);

  return (
    <div className="ed-typography-panel ed-shadow-panel">
      <div className="ed-panel-header" style={{ padding: "0 0 16px", border: "none" }}>
        <h2 className="ed-panel-title">Shadow tokens</h2>
        <p className="ed-panel-subtitle">Elevation from none through 2xl</p>
      </div>

      <Section title="Elevation">
        {ordered.map((token) => (
          <ShadowRow key={token.id} token={token} onUpdate={onUpdate} />
        ))}
      </Section>

      <Section title="Elevation stack">
        <div className="ed-shadow-stack">
          {ordered.map((token) => (
            <div key={token.id} className="ed-shadow-stack-item">
              <div
                className="ed-shadow-stack-card"
                style={{ boxShadow: cssShadow(token.value) }}
              />
              <span className="ed-shadow-stack-label">{displayName(token.id)}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
