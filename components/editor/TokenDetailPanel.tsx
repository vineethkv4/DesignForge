"use client";

import { useState } from "react";
import { useTokenStore } from "@/stores/tokenStore";

/** Colors detail editor — reads selected token + writes via TokenStore. */
export function TokenDetailPanel() {
  const { selectedColor: token, updateColorValue } = useTokenStore();
  const [localValue, setLocalValue] = useState("");

  if (!token) {
    return (
      <div className="ed-token-detail">
        <p style={{ color: "var(--ed-text-muted)", fontSize: 13 }}>
          Select a token to edit
        </p>
      </div>
    );
  }

  const displayValue = localValue || token.value;
  const pickerValue = token.value.startsWith("#") ? token.value : "#7733FF";

  const handleChange = (value: string) => {
    setLocalValue(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value) || value.startsWith("rgba")) {
      updateColorValue(token.id, value);
    }
  };

  return (
    <div className="ed-token-detail">
      <div className="ed-detail-header">
        <div
          className="ed-detail-swatch"
          style={{ background: token.value }}
        />
        <div>
          <div className="ed-detail-title">{token.name}</div>
          <div className="ed-detail-meta">
            Alias: {token.alias} · WCAG {(token.wcag ?? "fail").toUpperCase()}
          </div>
          <div className="ed-detail-used">
            {(token.usedBy ?? []).map((u) => (
              <span key={u} className="ed-used-chip">
                {u}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="ed-color-input-row">
        <input
          type="color"
          className="ed-color-picker"
          value={pickerValue}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Pick color"
        />
        <input
          type="text"
          className="ed-color-input"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setLocalValue("")}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
