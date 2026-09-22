"use client";

import { IconCheck } from "@tabler/icons-react";
import { RADIUS_STYLES, SPACING_DENSITIES } from "@/lib/onboardingData";
import type { RadiusStyle, SpacingDensity } from "@/types/onboarding";

interface WizardStep3StyleProps {
  radiusStyle: RadiusStyle;
  spacingDensity: SpacingDensity;
  brandColor: string;
  onRadiusChange: (style: RadiusStyle) => void;
  onDensityChange: (density: SpacingDensity) => void;
}

export function WizardStep3Style({
  radiusStyle,
  spacingDensity,
  brandColor,
  onRadiusChange,
  onDensityChange,
}: WizardStep3StyleProps) {
  return (
    <>
      <div className="wizard-tag">Step 3 — Visual style</div>
      <h1 className="wizard-h">Choose a visual style</h1>
      <p className="wizard-sub">
        Sets border radius globally across all components. Fine-tune individual tokens later inside
        the editor.
      </p>

      <div className="wizard-field-label">Border radius</div>
      <div className="wizard-style-grid">
        {(Object.entries(RADIUS_STYLES) as [RadiusStyle, (typeof RADIUS_STYLES)[RadiusStyle]][]).map(
          ([key, style]) => {
            const selected = radiusStyle === key;
            return (
              <button
                key={key}
                type="button"
                className={`wizard-style-card${selected ? " sel" : ""}`}
                onClick={() => onRadiusChange(key)}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                  <span
                    className="text-[10px] font-medium px-3 py-1"
                    style={{
                      borderRadius: style.btnR,
                      background: "var(--wiz-ac-bg)",
                      color: "var(--wiz-ac)",
                      border: "0.5px solid var(--wiz-ac-bdr)",
                    }}
                  >
                    Button
                  </span>
                  <span
                    className="inline-block h-[22px] w-20"
                    style={{
                      borderRadius: style.inputR,
                      background: "var(--wiz-surface2)",
                      border: "0.5px solid var(--wiz-bdr2)",
                    }}
                  />
                </div>
                <div className="text-[13px] font-semibold" style={{ color: "var(--wiz-t1)" }}>
                  {style.name}
                  {selected && (
                    <IconCheck size={12} className="ml-1 inline" style={{ color: brandColor }} />
                  )}
                </div>
                <div className="text-[11px]" style={{ color: "var(--wiz-t2)" }}>
                  {style.desc}
                </div>
              </button>
            );
          }
        )}
      </div>

      <div className="wizard-field-label">Spacing density</div>
      <div className="wizard-density-row">
        {(Object.entries(SPACING_DENSITIES) as [SpacingDensity, (typeof SPACING_DENSITIES)[SpacingDensity]][]).map(
          ([key, density]) => (
            <button
              key={key}
              type="button"
              className={`wizard-density-card${spacingDensity === key ? " sel" : ""}`}
              onClick={() => onDensityChange(key)}
            >
              <div
                className="flex items-end justify-center"
                style={{ gap: density.gap, height: 28, marginBottom: 7 }}
              >
                {density.heights.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: h,
                      background: brandColor,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
              <div className="text-[11px] font-medium" style={{ color: "var(--wiz-t1)" }}>
                {density.name}
              </div>
            </button>
          )
        )}
      </div>
    </>
  );
}
