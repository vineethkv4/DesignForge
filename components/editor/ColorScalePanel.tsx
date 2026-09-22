"use client";

import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import {
  generateScaleFromAnchor,
  isValidHex,
} from "@/lib/colorScale";
import type { ColorScaleStepNumber } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

function safeHex(v: string): string {
  return v.startsWith("#") && v.length >= 7 ? v.slice(0, 7) : "#7c3aed";
}

/** Full primary color scale editor — Scale tab for Colors. */
export function ColorScalePanel() {
  const {
    state,
    updateColorValue,
    updateScaleStep,
    resetScaleStep,
    setPreviewStatus,
  } = useTokenStore();

  const primary = state.color.find((t) => t.id === "primary");
  if (!primary) {
    return (
      <div className="ed-section-lbl" style={{ opacity: 0.7 }}>
        Add a primary color token to edit its scale.
      </div>
    );
  }

  const scale =
    primary.scale ?? generateScaleFromAnchor(primary.value);

  return (
    <div>
      <div className="ed-section-lbl">Primary scale</div>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "var(--ed-text-muted)",
          lineHeight: 1.45,
          maxWidth: 420,
        }}
      >
        Step 500 is the anchor. Other steps regenerate from it unless overridden.
      </p>
      <div className="ed-scale-editor">
        {scale.map((step) => (
          <ScaleStepRow
            key={step.step}
            step={step.step}
            value={step.value}
            overridden={step.overridden}
            isAnchor={step.step === 500}
            onChange={(hexValue) => {
              if (step.step === 500) {
                updateColorValue(primary.id, hexValue);
              } else {
                updateScaleStep(step.step, hexValue);
              }
            }}
            onReset={() => resetScaleStep(step.step)}
            onParseError={() => setPreviewStatus("error")}
            onParseOk={() => {
              if (step.step !== 500) setPreviewStatus("live");
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ScaleStepRow({
  step,
  value,
  overridden,
  isAnchor,
  onChange,
  onReset,
  onParseError,
  onParseOk,
}: {
  step: ColorScaleStepNumber;
  value: string;
  overridden: boolean;
  isAnchor: boolean;
  onChange: (hex: string) => void;
  onReset: () => void;
  onParseError: () => void;
  onParseOk: () => void;
}) {
  const [local, setLocal] = useState("");
  const hex = safeHex(value);
  const display = local !== "" ? local : value;

  const apply = (next: string) => {
    if (isValidHex(next)) {
      onChange(next);
      if (!isAnchor) onParseOk();
      return;
    }
    if (next.trim() !== "") onParseError();
  };

  return (
    <div
      className={`ed-scale-step${overridden ? " overridden" : ""}${
        isAnchor ? " anchor" : ""
      }`}
    >
      <span className="ed-scale-step-lbl">{step}</span>
      <div className="ed-exp-swatch" style={{ background: value }}>
        <input
          type="color"
          value={hex}
          aria-label={`Scale ${step} picker`}
          onChange={(e) => {
            apply(e.target.value);
            setLocal("");
          }}
        />
      </div>
      <input
        className="ed-hex-inp ed-scale-step-hex"
        value={display}
        spellCheck={false}
        aria-label={`Scale ${step} hex`}
        onChange={(e) => {
          setLocal(e.target.value);
          apply(e.target.value);
        }}
        onBlur={() => {
          if (local === "" || isValidHex(local)) setLocal("");
        }}
      />
      {isAnchor ? (
        <span className="ed-scale-step-meta">anchor</span>
      ) : overridden ? (
        <button
          type="button"
          className="ed-scale-reset"
          onClick={onReset}
          title="Reset to auto"
        >
          <IconRefresh size={12} />
          Reset to auto
        </button>
      ) : (
        <span className="ed-scale-step-meta">auto</span>
      )}
    </div>
  );
}
