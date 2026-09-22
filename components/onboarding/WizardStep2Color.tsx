"use client";

import { genScale, isValidHex, SCALE_LABELS } from "@/lib/colorScale";
import { COLOR_PRESETS } from "@/lib/onboardingData";

interface WizardStep2ColorProps {
  brandColor: string;
  onChange: (color: string) => void;
}

export function WizardStep2Color({ brandColor, onChange }: WizardStep2ColorProps) {
  const scale = genScale(brandColor);

  const handleHexChange = (value: string) => {
    const normalized = value.startsWith("#") ? value : `#${value}`;
    if (isValidHex(normalized)) {
      onChange(normalized);
    }
  };

  return (
    <>
      <div className="wizard-tag">Step 2 — Brand color</div>
      <h1 className="wizard-h">Pick your brand color</h1>
      <p className="wizard-sub">
        One color generates a full 9-step palette, semantic aliases, dark mode variants, and WCAG
        contrast checks — automatically.
      </p>

      <div className="wizard-field-label">Brand color</div>
      <div className="wizard-color-row">
        <div className="wizard-swatch-btn" style={{ background: brandColor }}>
          <input
            type="color"
            value={brandColor}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Color picker"
          />
        </div>
        <input
          className="wizard-hex-field"
          value={brandColor}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#7c3aed"
          spellCheck={false}
        />
        <span style={{ fontSize: 12, color: "var(--wiz-t3)" }}>Click swatch or type hex</span>
      </div>

      <div className="wizard-field-label" style={{ marginBottom: 4 }}>
        Quick presets
      </div>
      <div className="wizard-presets">
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            className={`wizard-color-dot${brandColor === color ? " active" : ""}`}
            style={{ background: color }}
            onClick={() => onChange(color)}
            title={color}
            aria-label={`Use ${color}`}
          />
        ))}
      </div>

      <div style={{ marginTop: 20, maxWidth: 480 }}>
        <div className="wizard-field-label" style={{ marginBottom: 0 }}>
          Generated 9-step scale
        </div>
        <div className="wizard-scale-row">
          {scale.map((color, i) => (
            <div key={SCALE_LABELS[i]} className="wizard-scale-cell">
              <div className="wizard-scale-swatch" style={{ background: color }} title={SCALE_LABELS[i]} />
              <span className="wizard-scale-label">{SCALE_LABELS[i]}</span>
            </div>
          ))}
        </div>
        <div className="wizard-scale-meta">
          <span className="wizard-scale-badge">Light mode palette ready</span>
          <span className="wizard-scale-badge">Dark mode palette ready</span>
          <span className="wizard-scale-badge">Semantic aliases mapped</span>
        </div>
      </div>
    </>
  );
}
