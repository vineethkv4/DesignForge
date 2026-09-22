"use client";

import { genScale, slugifySystemName } from "@/lib/colorScale";
import { FONT_PAIRINGS, RADIUS_STYLES, SPACING_DENSITIES } from "@/lib/onboardingData";
import type { WizardState } from "@/types/onboarding";

interface WizardStep5PreviewProps {
  state: Pick<
    WizardState,
    "systemName" | "brandColor" | "radiusStyle" | "spacingDensity" | "fontPairing"
  >;
}

export function WizardStep5Preview({ state }: WizardStep5PreviewProps) {
  const scale = genScale(state.brandColor);
  const slug = slugifySystemName(state.systemName);
  const radius = RADIUS_STYLES[state.radiusStyle];
  const font = FONT_PAIRINGS[state.fontPairing];

  const tokens = [
    { name: "color.primary", value: state.brandColor, swatch: state.brandColor },
    { name: "color.primary.50", value: scale[0], swatch: scale[0] },
    { name: "color.success", value: "#10b981", swatch: "#10b981" },
    { name: "color.warning", value: "#f59e0b", swatch: "#f59e0b" },
    { name: "color.text.primary", value: "var(--t1)", swatch: "#111110" },
  ];

  const summary = [
    { label: "System name", value: state.systemName },
    { label: "Brand color", value: state.brandColor, isColor: true },
    { label: "Style", value: radius.name },
    { label: "Density", value: SPACING_DENSITIES[state.spacingDensity].name },
    { label: "Font", value: font.name.split(" + ")[0] },
  ];

  return (
    <>
      <div className="wizard-tag">Step 5 — Review</div>
      <h1 className="wizard-h">Your system is ready</h1>
      <p className="wizard-sub">
        Every token is editable inside the editor. This is just the starting point — your system
        grows with your product.
      </p>

      <div className="wizard-preview-grid">
        <div>
          <div className="wizard-ns-label" style={{ marginBottom: 10 }}>
            Color tokens
          </div>
          <div className="flex flex-col gap-1.5">
            {tokens.map((token) => (
              <div
                key={token.name}
                className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                style={{ borderColor: "var(--wiz-bdr)", background: "var(--wiz-surface2)" }}
              >
                <span
                  className="h-[18px] w-[18px] shrink-0 rounded border"
                  style={{ background: token.swatch, borderColor: "var(--wiz-bdr2)" }}
                />
                <span className="flex-1 text-[11px] font-medium" style={{ color: "var(--wiz-t1)" }}>
                  {token.name}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "var(--wiz-t3)" }}>
                  {token.value}
                </span>
              </div>
            ))}
          </div>

          <div className="wizard-ns-label" style={{ marginTop: 14, marginBottom: 10 }}>
            Export preview
          </div>
          <pre
            className="rounded-lg border p-3 font-mono text-[10px] leading-relaxed"
            style={{
              borderColor: "var(--wiz-bdr)",
              background: "var(--wiz-surface2)",
              color: "var(--wiz-t2)",
            }}
          >
            <span style={{ color: "var(--ac3)" }}>--{slug}-primary</span>: {state.brandColor};{"\n"}
            <span style={{ color: "var(--ac3)" }}>--{slug}-primary-50</span>: {scale[0]};{"\n"}
            <span style={{ color: "var(--ac3)" }}>--{slug}-radius-md</span>: {radius.r}px;{"\n"}
            <span style={{ color: "var(--ac3)" }}>--{slug}-success</span>: #10b981;
          </pre>
        </div>

        <div>
          <div className="wizard-ns-label" style={{ marginBottom: 10 }}>
            Component preview
          </div>
          <div
            className="flex flex-col gap-2.5 rounded-xl border p-3.5"
            style={{ borderColor: "var(--wiz-bdr)", background: "var(--wiz-surface)" }}
          >
            <div className="flex flex-wrap gap-1.5">
              <span
                className="text-[11px] font-medium px-3 py-1.5 text-white"
                style={{ background: state.brandColor, borderRadius: radius.btnR }}
              >
                Primary
              </span>
              <span
                className="text-[11px] font-medium px-3 py-1.5"
                style={{
                  border: `1.5px solid ${state.brandColor}`,
                  color: state.brandColor,
                  borderRadius: radius.btnR,
                }}
              >
                Outline
              </span>
              <span
                className="text-[11px] font-medium px-3 py-1.5"
                style={{
                  background: "var(--wiz-ac-bg)",
                  color: "var(--wiz-ac)",
                  border: "0.5px solid var(--wiz-ac-bdr)",
                  borderRadius: radius.btnR,
                }}
              >
                Ghost
              </span>
            </div>
            <input
              readOnly
              placeholder="Input field…"
              className="w-full text-[11px] px-2.5 py-1.5 outline-none"
              style={{
                borderRadius: radius.inputR,
                background: "var(--wiz-surface2)",
                border: "0.5px solid var(--wiz-bdr2)",
                color: "var(--wiz-t1)",
              }}
            />
            <div
              className="border p-2.5"
              style={{
                borderRadius: radius.r + 2,
                borderColor: "var(--wiz-bdr)",
                background: "var(--wiz-surface2)",
              }}
            >
              <div className="text-xs font-semibold" style={{ color: "var(--wiz-t1)" }}>
                Token card
              </div>
              <div className="text-[11px]" style={{ color: "var(--wiz-t2)" }}>
                Components update live as you edit tokens.
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: "Success", bg: "rgba(16,185,129,.1)", color: "#065f46" },
                { label: "Warning", bg: "rgba(245,158,11,.1)", color: "#92400e" },
                { label: "Error", bg: "rgba(239,68,68,.1)", color: "#7f1d1d" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="text-[10px] font-medium px-2 py-0.5 rounded"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          <div className="wizard-ns-label" style={{ marginTop: 14, marginBottom: 10 }}>
            System summary
          </div>
          <div
            className="rounded-xl border p-3.5"
            style={{ borderColor: "var(--wiz-bdr)", background: "var(--wiz-surface)" }}
          >
            {summary.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-1 text-xs"
                style={{ borderBottom: "0.5px solid var(--wiz-bdr)" }}
              >
                <span style={{ color: "var(--wiz-t3)" }}>{row.label}</span>
                {"isColor" in row && row.isColor ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 rounded"
                      style={{ background: row.value as string }}
                    />
                    <span className="font-mono text-[11px]" style={{ color: "var(--wiz-t1)" }}>
                      {row.value}
                    </span>
                  </span>
                ) : (
                  <span className="font-medium" style={{ color: "var(--wiz-t1)" }}>
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
