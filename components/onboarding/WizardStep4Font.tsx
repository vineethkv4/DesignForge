"use client";

import { IconCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import { FONT_PAIRINGS } from "@/lib/onboardingData";
import type { FontPairing } from "@/types/onboarding";

interface WizardStep4FontProps {
  fontPairing: FontPairing;
  brandColor: string;
  onChange: (font: FontPairing) => void;
}

export function WizardStep4Font({ fontPairing, brandColor, onChange }: WizardStep4FontProps) {
  useEffect(() => {
    const families = Object.values(FONT_PAIRINGS)
      .map((f) => f.googleFamilies)
      .join("&family=");

    const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    const existing = document.querySelector(`link[data-onboarding-fonts]`);

    if (existing) {
      existing.setAttribute("href", href);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-onboarding-fonts", "true");
    document.head.appendChild(link);
  }, []);

  return (
    <>
      <div className="wizard-tag">Step 4 — Typography</div>
      <h1 className="wizard-h">Choose a font pairing</h1>
      <p className="wizard-sub">
        All pairings use Google Fonts — free, production-ready, and optimised for UI rendering at
        all sizes.
      </p>

      <div className="wizard-field-label">Font pairing</div>
      <div className="wizard-font-list">
        {(Object.entries(FONT_PAIRINGS) as [FontPairing, (typeof FONT_PAIRINGS)[FontPairing]][]).map(
          ([key, font]) => {
            const selected = fontPairing === key;
            return (
              <button
                key={key}
                type="button"
                className={`wizard-font-card${selected ? " sel" : ""}`}
                onClick={() => onChange(key)}
              >
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--wiz-t1)" }}>
                    {font.name}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--wiz-t2)" }}>
                    {font.sample}
                  </div>
                </div>
                {selected && <IconCheck size={15} style={{ color: brandColor }} />}
              </button>
            );
          }
        )}
      </div>
    </>
  );
}
