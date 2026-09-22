"use client";

import { useMemo, useState } from "react";
import type { TypographyToken } from "@/types/tokens";

const PREVIEW_TEXT = "The quick brown fox";
const WEIGHT_PREVIEW_TEXT = "Typography sets the voice of your design system";

const SIZE_ORDER = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-5xl",
] as const;

const FAMILY_ORDER = ["font-sans", "font-serif", "font-mono"] as const;

const WEIGHT_ORDER = [
  "weight-light",
  "weight-regular",
  "weight-medium",
  "weight-semibold",
  "weight-bold",
] as const;

const LINE_HEIGHT_ORDER = ["leading-tight", "leading-normal", "leading-relaxed"] as const;

const LETTER_SPACING_ORDER = ["tracking-tight", "tracking-normal", "tracking-wide"] as const;

interface TypographyPanelProps {
  tokens: TypographyToken[];
  tokensByGroup: Record<string, TypographyToken[]>;
  onUpdate: (tokenId: string, value: string) => void;
}

function tokenValue(tokens: TypographyToken[], id: string, fallback = ""): string {
  return tokens.find((t) => t.id === id)?.value ?? fallback;
}

function displaySizeLabel(id: string): string {
  return id.replace("text-", "");
}

function displayWeightLabel(id: string): string {
  return id.replace("weight-", "");
}

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 16;
}

function parseLineHeight(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 1.5;
}

function parseLetterSpacingEm(value: string): number {
  if (value.endsWith("em")) return parseFloat(value) || 0;
  return parseFloat(value) || 0;
}

function formatLetterSpacingEm(n: number): string {
  return `${n}em`;
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

export function TypographyPanel({ tokens, tokensByGroup, onUpdate }: TypographyPanelProps) {
  const [selectedWeightId, setSelectedWeightId] = useState<string>("weight-regular");

  const families = useMemo(() => {
    const group = tokensByGroup.family ?? [];
    return FAMILY_ORDER.map(
      (id) => group.find((t) => t.id === id) ?? tokens.find((t) => t.id === id)
    ).filter(Boolean) as TypographyToken[];
  }, [tokens, tokensByGroup.family]);

  const sizes = useMemo(() => {
    const group = tokensByGroup.size ?? [];
    return SIZE_ORDER.map(
      (id) => group.find((t) => t.id === id) ?? tokens.find((t) => t.id === id)
    ).filter(Boolean) as TypographyToken[];
  }, [tokens, tokensByGroup.size]);

  const weights = useMemo(() => {
    const group = tokensByGroup.weight ?? [];
    return WEIGHT_ORDER.map(
      (id) => group.find((t) => t.id === id) ?? tokens.find((t) => t.id === id)
    ).filter(Boolean) as TypographyToken[];
  }, [tokens, tokensByGroup.weight]);

  const lineHeights = useMemo(() => {
    const group = tokensByGroup.lineHeight ?? [];
    return LINE_HEIGHT_ORDER.map(
      (id) => group.find((t) => t.id === id) ?? tokens.find((t) => t.id === id)
    ).filter(Boolean) as TypographyToken[];
  }, [tokens, tokensByGroup.lineHeight]);

  const letterSpacings = useMemo(() => {
    const group = tokensByGroup.letterSpacing ?? [];
    return LETTER_SPACING_ORDER.map(
      (id) => group.find((t) => t.id === id) ?? tokens.find((t) => t.id === id)
    ).filter(Boolean) as TypographyToken[];
  }, [tokens, tokensByGroup.letterSpacing]);

  const sansFamily = tokenValue(tokens, "font-sans", "Inter, system-ui, sans-serif");
  const selectedWeight = tokenValue(tokens, selectedWeightId, "400");

  return (
    <div className="ed-typography-panel">
      <div className="ed-panel-header" style={{ padding: "0 0 16px", border: "none" }}>
        <h2 className="ed-panel-title">Typography tokens</h2>
        <p className="ed-panel-subtitle">Families, scale, weights, line height & letter spacing</p>
      </div>

      <Section title="Font family">
        <div className="ed-typo-family-row">
          {families.map((token) => {
            const familyKey = token.id.replace("font-", "");
            return (
              <div key={token.id} className="ed-typo-family-item">
                <span className="ed-typo-label">{familyKey}</span>
                <div className="ed-typo-input-wrap">
                  <input
                    type="text"
                    className="ed-typo-input"
                    value={token.value}
                    onChange={(e) => onUpdate(token.id, e.target.value)}
                    spellCheck={false}
                    aria-label={`${familyKey} font family`}
                  />
                  <div
                    className="ed-typo-preview"
                    style={{ fontFamily: token.value }}
                  >
                    {PREVIEW_TEXT}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Type scale">
        {sizes.map((token) => {
          const px = parsePx(token.value);
          return (
            <div key={token.id} className="ed-typo-scale-row">
              <span className="ed-typo-scale-name">{displaySizeLabel(token.id)}</span>
              <div className="ed-typo-scale-input-wrap">
                <input
                  type="number"
                  className="ed-typo-scale-input"
                  value={px}
                  min={8}
                  max={96}
                  step={1}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    if (Number.isFinite(next) && next > 0) {
                      onUpdate(token.id, `${next}px`);
                    }
                  }}
                  aria-label={`${displaySizeLabel(token.id)} font size`}
                />
                <span className="ed-typo-scale-unit">px</span>
              </div>
              <div
                className="ed-typo-scale-preview"
                style={{ fontSize: token.value, fontFamily: sansFamily }}
              >
                {PREVIEW_TEXT}
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Font weight">
        <div className="ed-typo-pills" role="listbox" aria-label="Font weight preview">
          {weights.map((token) => (
            <button
              key={token.id}
              type="button"
              role="option"
              aria-selected={selectedWeightId === token.id}
              className={`ed-typo-pill${selectedWeightId === token.id ? " active" : ""}`}
              onClick={() => setSelectedWeightId(token.id)}
            >
              {displayWeightLabel(token.id)} ({token.value})
            </button>
          ))}
        </div>
        <div
          className="ed-typo-weight-preview"
          style={{ fontFamily: sansFamily, fontWeight: selectedWeight }}
        >
          {WEIGHT_PREVIEW_TEXT}
        </div>
      </Section>

      <Section title="Line height">
        {lineHeights.map((token) => {
          const lh = parseLineHeight(token.value);
          return (
            <div key={token.id} className="ed-typo-slider-row">
              <span className="ed-typo-slider-name">
                {token.id.replace("leading-", "")}
              </span>
              <input
                type="range"
                className="ed-typo-slider"
                min={1}
                max={2}
                step={0.05}
                value={lh}
                onChange={(e) => onUpdate(token.id, e.target.value)}
                aria-label={`${token.id} line height`}
              />
              <input
                type="number"
                className="ed-typo-num-input"
                min={1}
                max={2}
                step={0.05}
                value={lh}
                onChange={(e) => {
                  const next = parseFloat(e.target.value);
                  if (Number.isFinite(next)) onUpdate(token.id, String(next));
                }}
                aria-label={`${token.id} line height value`}
              />
            </div>
          );
        })}
      </Section>

      <Section title="Letter spacing">
        {letterSpacings.map((token) => {
          const em = parseLetterSpacingEm(token.value);
          return (
            <div key={token.id} className="ed-typo-slider-row">
              <span className="ed-typo-slider-name">
                {token.id.replace("tracking-", "")}
              </span>
              <input
                type="range"
                className="ed-typo-slider"
                min={-0.1}
                max={0.15}
                step={0.005}
                value={em}
                onChange={(e) =>
                  onUpdate(token.id, formatLetterSpacingEm(parseFloat(e.target.value)))
                }
                aria-label={`${token.id} letter spacing`}
              />
              <input
                type="number"
                className="ed-typo-num-input"
                min={-0.1}
                max={0.15}
                step={0.005}
                value={em}
                onChange={(e) => {
                  const next = parseFloat(e.target.value);
                  if (Number.isFinite(next)) {
                    onUpdate(token.id, formatLetterSpacingEm(next));
                  }
                }}
                aria-label={`${token.id} letter spacing value`}
              />
            </div>
          );
        })}
      </Section>
    </div>
  );
}
