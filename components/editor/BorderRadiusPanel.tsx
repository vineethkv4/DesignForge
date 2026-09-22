"use client";

import { useMemo } from "react";
import type { BorderRadiusToken } from "@/types/tokens";

const RADIUS_ORDER = [
  "radius-none",
  "radius-sm",
  "radius-md",
  "radius-lg",
  "radius-xl",
  "radius-2xl",
  "radius-3xl",
  "radius-full",
] as const;

const FULL_VALUE = "9999px";

interface BorderRadiusPanelProps {
  tokens: BorderRadiusToken[];
  onUpdate: (tokenId: string, value: string) => void;
}

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function formatRadiusValue(px: number): string {
  return px === 0 ? "0" : `${px}px`;
}

function displayName(id: string): string {
  return id.replace(/^radius-/, "");
}

function tokenValue(tokens: BorderRadiusToken[], id: string, fallback: string): string {
  return tokens.find((t) => t.id === id)?.value ?? fallback;
}

function cssRadius(value: string): string {
  if (value === "0" || value === "0px") return "0";
  if (/^\d+(\.\d+)?$/.test(value)) return `${value}px`;
  return value;
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

export function BorderRadiusPanel({ tokens, onUpdate }: BorderRadiusPanelProps) {
  const ordered = useMemo(() => {
    return RADIUS_ORDER.map(
      (id) => tokens.find((t) => t.id === id)
    ).filter(Boolean) as BorderRadiusToken[];
  }, [tokens]);

  const radiusSm = cssRadius(tokenValue(tokens, "radius-sm", "2px"));
  const radiusMd = cssRadius(tokenValue(tokens, "radius-md", "4px"));
  const radiusLg = cssRadius(tokenValue(tokens, "radius-lg", "8px"));
  const radiusFull = cssRadius(tokenValue(tokens, "radius-full", FULL_VALUE));

  const handleChange = (tokenId: string, raw: string) => {
    if (tokenId === "radius-full") return;
    const next = parseInt(raw, 10);
    if (!Number.isFinite(next) || next < 0) return;
    onUpdate(tokenId, formatRadiusValue(next));
  };

  return (
    <div className="ed-typography-panel ed-radius-panel">
      <div className="ed-panel-header" style={{ padding: "0 0 16px", border: "none" }}>
        <h2 className="ed-panel-title">Border radius tokens</h2>
        <p className="ed-panel-subtitle">Scale from none through full</p>
      </div>

      <Section title="Radius scale">
        {ordered.map((token) => {
          const isFull = token.id === "radius-full";
          const px = isFull ? 9999 : parsePx(token.value);
          const previewRadius = cssRadius(isFull ? FULL_VALUE : token.value);

          return (
            <div key={token.id} className="ed-radius-row">
              <span className="ed-typo-scale-name">{displayName(token.id)}</span>
              <div className="ed-typo-scale-input-wrap">
                {isFull ? (
                  <input
                    type="text"
                    className="ed-typo-scale-input ed-radius-input-locked"
                    value="9999"
                    disabled
                    readOnly
                    aria-label="full radius (locked)"
                  />
                ) : (
                  <input
                    type="number"
                    className="ed-typo-scale-input"
                    value={px}
                    min={0}
                    max={128}
                    step={1}
                    onChange={(e) => handleChange(token.id, e.target.value)}
                    aria-label={`${displayName(token.id)} radius`}
                  />
                )}
                <span className="ed-typo-scale-unit">px</span>
              </div>
              <div
                className="ed-radius-swatch"
                style={{ borderRadius: previewRadius }}
                title={token.value}
                aria-hidden
              />
            </div>
          );
        })}
      </Section>

      <Section title="Preview shapes">
        <div className="ed-radius-shapes">
          <button
            type="button"
            className="ed-radius-shape-btn"
            style={{ borderRadius: radiusMd }}
          >
            Button
          </button>

          <div className="ed-radius-shape-card" style={{ borderRadius: radiusLg }}>
            <div className="ed-radius-shape-card-title">Card</div>
            <div className="ed-radius-shape-card-text">
              Uses radius.lg · edit lg above to update
            </div>
          </div>

          <div className="ed-radius-shape-row">
            <div
              className="ed-radius-shape-avatar"
              style={{ borderRadius: radiusFull }}
              aria-label="Avatar with radius.full"
            >
              AV
            </div>
            <span
              className="ed-radius-shape-badge"
              style={{ borderRadius: radiusSm }}
            >
              Badge
            </span>
          </div>

          <p className="ed-space-base-hint">
            button → md · card → lg · avatar → full · badge → sm
          </p>
        </div>
      </Section>
    </div>
  );
}
