"use client";

import { slugifySystemName } from "@/lib/colorScale";
import { NAME_CHIPS } from "@/lib/onboardingData";

interface WizardStep1NameProps {
  systemName: string;
  onChange: (name: string) => void;
}

const PREVIEW_TOKENS = [
  { key: "color.primary", val: "#7c3aed" },
  { key: "spacing.md", val: "16px" },
  { key: "radius.lg", val: "12px" },
  { key: "font.body", val: "Inter" },
];

export function WizardStep1Name({ systemName, onChange }: WizardStep1NameProps) {
  const slug = slugifySystemName(systemName || "my-system");

  return (
    <>
      <div className="wizard-tag">Step 1 — System identity</div>
      <h1 className="wizard-h">Name your design system</h1>
      <p className="wizard-sub">
        This becomes your project identifier across the dashboard, docs site, GitHub commits, and
        exported token namespaces.
      </p>

      <label className="wizard-field-label" htmlFor="system-name">
        System name
      </label>
      <input
        id="system-name"
        className="wizard-input"
        value={systemName}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Acme Corp, MyApp…"
        autoFocus
      />

      <div className="wizard-chip-row">
        {NAME_CHIPS.map((name) => (
          <button key={name} type="button" className="wizard-chip" onClick={() => onChange(name)}>
            {name}
          </button>
        ))}
      </div>

      <div className="wizard-ns-preview">
        <div className="wizard-ns-label">Token namespace preview</div>
        {PREVIEW_TOKENS.map((token) => (
          <div key={token.key} className="wizard-ns-token">
            <span className="wizard-ns-name">--{slug}-{token.key}</span>
            <span className="wizard-ns-val">{token.val}</span>
          </div>
        ))}
      </div>
    </>
  );
}
