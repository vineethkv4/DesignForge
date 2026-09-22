"use client";

import { useEffect, useMemo, useState } from "react";
import type { SpacingToken } from "@/types/tokens";

const BAR_CAP_PX = 200;

/** Scale step → multiplier of base unit (default base 4px) */
const SCALE_STEPS: { id: string; step: number; multiplier: number }[] = [
  { id: "space-1", step: 1, multiplier: 1 },
  { id: "space-2", step: 2, multiplier: 2 },
  { id: "space-3", step: 3, multiplier: 3 },
  { id: "space-4", step: 4, multiplier: 4 },
  { id: "space-5", step: 5, multiplier: 5 },
  { id: "space-6", step: 6, multiplier: 6 },
  { id: "space-8", step: 8, multiplier: 8 },
  { id: "space-10", step: 10, multiplier: 10 },
  { id: "space-12", step: 12, multiplier: 12 },
  { id: "space-16", step: 16, multiplier: 16 },
];

interface SpacingPanelProps {
  tokens: SpacingToken[];
  onUpdate: (tokenId: string, value: string) => void;
  onBatchUpdate: (updates: { tokenId: string; value: string }[]) => void;
}

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function tokenValue(tokens: SpacingToken[], id: string, fallback = "0px"): string {
  return tokens.find((t) => t.id === id)?.value ?? fallback;
}

function displayName(id: string): string {
  return id.replace(/^space-/, "spacing-");
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

export function SpacingPanel({ tokens, onUpdate, onBatchUpdate }: SpacingPanelProps) {
  const baseToken = tokens.find((t) => t.id === "spacing-base");
  const currentBasePx = parsePx(baseToken?.value ?? "4px") || 4;

  const [draftBase, setDraftBase] = useState(String(currentBasePx));
  const draftBasePx = parseFloat(draftBase);
  const hasValidDraft = Number.isFinite(draftBasePx) && draftBasePx > 0;
  const showRegenerate =
    hasValidDraft && Math.round(draftBasePx) !== Math.round(currentBasePx);

  // Keep draft in sync when undo/redo (or external) changes the base token
  useEffect(() => {
    setDraftBase(String(parsePx(baseToken?.value ?? "4px") || 4));
  }, [baseToken?.value]);

  const scaleTokens = useMemo(() => {
    return SCALE_STEPS.map((step) => {
      const token = tokens.find((t) => t.id === step.id);
      return { ...step, token };
    }).filter((row) => row.token) as Array<
      (typeof SCALE_STEPS)[number] & { token: SpacingToken }
    >;
  }, [tokens]);

  const gap4 = tokenValue(tokens, "space-4", "16px");
  const gap6 = tokenValue(tokens, "space-6", "24px");
  const gap8 = tokenValue(tokens, "space-8", "32px");

  const handleScaleChange = (tokenId: string, raw: string) => {
    const next = parseInt(raw, 10);
    if (!Number.isFinite(next) || next < 0) return;
    onUpdate(tokenId, `${next}px`);
  };

  const handleRegenerate = () => {
    if (!hasValidDraft) return;
    const unit = Math.round(draftBasePx);
    const updates: { tokenId: string; value: string }[] = [
      { tokenId: "spacing-base", value: `${unit}px` },
      ...SCALE_STEPS.map(({ id, multiplier }) => ({
        tokenId: id,
        value: `${unit * multiplier}px`,
      })),
    ];
    onBatchUpdate(updates);
    setDraftBase(String(unit));
  };

  return (
    <div className="ed-typography-panel ed-spacing-panel">
      <div className="ed-panel-header" style={{ padding: "0 0 16px", border: "none" }}>
        <h2 className="ed-panel-title">Spacing tokens</h2>
        <p className="ed-panel-subtitle">Base unit, scale steps & layout grid</p>
      </div>

      <Section title="Base unit">
        <div className="ed-space-base-row">
          <label className="ed-typo-label" htmlFor="spacing-base-input">
            Base
          </label>
          <div className="ed-typo-scale-input-wrap">
            <input
              id="spacing-base-input"
              type="number"
              className="ed-typo-scale-input"
              min={1}
              max={32}
              step={1}
              value={draftBase}
              onChange={(e) => setDraftBase(e.target.value)}
              aria-label="Base spacing unit"
            />
            <span className="ed-typo-scale-unit">px</span>
          </div>
          {showRegenerate && (
            <button
              type="button"
              className="ed-space-regen-btn"
              onClick={handleRegenerate}
            >
              Regenerate scale
            </button>
          )}
        </div>
        <p className="ed-space-base-hint">
          Default {currentBasePx}px · scale uses ×1–×16 multipliers
        </p>
      </Section>

      <Section title="Scale">
        {scaleTokens.map(({ id, token }) => {
          const px = parsePx(token.value);
          const barWidth = Math.min(px, BAR_CAP_PX);
          return (
            <div key={id} className="ed-space-row">
              <span className="ed-typo-scale-name">{displayName(id)}</span>
              <div className="ed-typo-scale-input-wrap">
                <input
                  type="number"
                  className="ed-typo-scale-input"
                  value={px}
                  min={0}
                  max={256}
                  step={1}
                  onChange={(e) => handleScaleChange(id, e.target.value)}
                  aria-label={`${displayName(id)} value`}
                />
                <span className="ed-typo-scale-unit">px</span>
              </div>
              <div className="ed-space-bar-track">
                <div
                  className="ed-space-bar-fill"
                  style={{ width: `${barWidth}px` }}
                  title={`${px}px`}
                />
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Live grid preview">
        {(
          [
            { id: "space-4", label: "spacing-4", gap: gap4 },
            { id: "space-6", label: "spacing-6", gap: gap6 },
            { id: "space-8", label: "spacing-8", gap: gap8 },
          ] as const
        ).map(({ id, label, gap }) => (
          <div key={id} className="ed-space-grid-block">
            <div className="ed-space-grid-meta">
              <span>
                {label} · gap {gap}
              </span>
            </div>
            <div
              className="ed-space-grid"
              style={{ gap }}
              aria-label={`Spacing grid with ${label} gap`}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="ed-space-grid-cell" />
              ))}
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
