"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DemoCard } from "@/components/design-system/DemoSnippet";
import {
  generateDesignSystemCode,
  type EditorDesignSystem,
} from "@/lib/codeGen";
import {
  colorToken,
  compToken,
  radiusToken,
  type DesignSystemSectionId,
} from "@/lib/publishedView";
import type { CodeTab, ColorToken } from "@/types/tokens";

interface DesignSystemDocumentProps {
  systemId: string;
  systemName: string;
  publishedAtLabel: string;
  designSystem: EditorDesignSystem;
  namespace: string;
  onNamespaceChange: (ns: string) => void;
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: DesignSystemSectionId;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={`ds-sec-${id}`} className="ds-doc-section">
      <header className="ds-section-head">
        <h2 className="ds-section-title">{title}</h2>
        {subtitle ? <p className="ds-section-sub">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function DesignSystemDocument({
  systemName,
  publishedAtLabel,
  designSystem: ds,
  namespace,
  onNamespaceChange,
}: DesignSystemDocumentProps) {
  const brand = colorToken(ds.colors, "primary", "#7733FF");

  return (
    <article className="ds-document" style={{ ["--ds-brand" as string]: brand }}>
      <OverviewSection
        systemName={systemName}
        publishedAtLabel={publishedAtLabel}
        ds={ds}
      />
      <ColorsSection colors={ds.colors} />
      <TypographySection tokens={ds.typography} />
      <SpacingSection tokens={ds.spacing} />
      <RadiusSection tokens={ds.borderRadius} />
      <ShadowSection tokens={ds.shadows} />
      <ComponentsSection ds={ds} namespace={namespace} />
      <FormsSection ds={ds} namespace={namespace} />
      <TogglesSection ds={ds} namespace={namespace} />
      <GuidelinesSection />
      <ExportSection
        designSystem={ds}
        namespace={namespace}
        onNamespaceChange={onNamespaceChange}
      />
    </article>
  );
}

function OverviewSection({
  systemName,
  publishedAtLabel,
  ds,
}: {
  systemName: string;
  publishedAtLabel: string;
  ds: EditorDesignSystem;
}) {
  const primary = colorToken(ds.colors, "primary", "#7733FF");
  const stats = [
    { label: "Colors", value: ds.colors.filter((c) => !c.gradient).length },
    { label: "Typography", value: ds.typography.length },
    { label: "Spacing", value: ds.spacing.length },
    { label: "Radius", value: ds.borderRadius.length },
    { label: "Shadows", value: ds.shadows.length },
  ];

  return (
    <Section
      id="overview"
      title={systemName}
      subtitle="Published design system — frozen snapshot. Editor drafts do not appear here until you convert again."
    >
      <div className="ds-overview-hero">
        <div className="ds-overview-swatch" style={{ background: primary }} />
        <div>
          <div className="ds-overview-name">{systemName}</div>
          <div className="ds-overview-meta">
            Updated {publishedAtLabel} · primary {primary}
          </div>
        </div>
      </div>
      <div className="ds-stat-row">
        {stats.map((c) => (
          <div key={c.label} className="ds-stat">
            <div className="ds-stat-value">{c.value}</div>
            <div className="ds-stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ColorsSection({ colors }: { colors: ColorToken[] }) {
  const primary = colors.find((c) => c.id === "primary");
  const scale = primary?.scale ?? [];
  const semanticIds = [
    "primary",
    "primary-hover",
    "primary-subtle",
    "success",
    "warning",
    "danger",
    "info",
    "bg-primary",
  ];
  const semantic = semanticIds
    .map((id) => colors.find((c) => c.id === id))
    .filter(Boolean) as ColorToken[];

  return (
    <Section
      id="colors"
      title="Colors"
      subtitle="Primary scale and semantic tokens from this system's published snapshot."
    >
      {scale.length > 0 && (
        <div className="ds-block">
          <h3 className="ds-block-title">Primary scale</h3>
          <div className="ds-scale-strip">
            {scale.map((step) => (
              <div key={step.step} className="ds-scale-cell">
                <div
                  className="ds-scale-swatch"
                  style={{ background: step.value }}
                />
                <span className="ds-scale-lbl">{step.step}</span>
                <span className="ds-scale-hex">{step.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="ds-block">
        <h3 className="ds-block-title">Semantic</h3>
        <div className="ds-color-grid">
          {semantic.map((t) => (
            <div key={t.id} className="ds-color-card">
              <div
                className="ds-color-swatch"
                style={{ background: t.value }}
              />
              <div className="ds-token-name">{t.name}</div>
              <div className="ds-token-val">{t.value}</div>
              <div className="ds-token-val">{t.alias}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function TypographySection({
  tokens,
}: {
  tokens: EditorDesignSystem["typography"];
}) {
  const families = tokens.filter((t) => t.group === "family");
  const sizes = tokens.filter((t) => t.group === "size");

  return (
    <Section
      id="typography"
      title="Typography"
      subtitle="Font families and type scale from the published snapshot."
    >
      <div className="ds-block">
        <h3 className="ds-block-title">Families</h3>
        <div className="ds-token-table">
          {families.map((t) => (
            <div key={t.id} className="ds-token-row">
              <div className="ds-token-name">{t.name}</div>
              <div className="ds-type-preview" style={{ fontFamily: t.value }}>
                The quick brown fox
              </div>
              <div className="ds-token-val">{t.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="ds-block">
        <h3 className="ds-block-title">Type scale</h3>
        <div className="ds-token-table">
          {sizes.map((t) => (
            <div key={t.id} className="ds-token-row">
              <div className="ds-token-name">{t.name}</div>
              <div className="ds-type-preview" style={{ fontSize: t.value }}>
                Design systems
              </div>
              <div className="ds-token-val">{t.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function SpacingSection({
  tokens,
}: {
  tokens: EditorDesignSystem["spacing"];
}) {
  const maxPx = Math.max(
    ...tokens.map((t) => parseFloat(t.value) || 0),
    1
  );

  return (
    <Section
      id="spacing"
      title="Spacing"
      subtitle="Scale steps with bars proportional to the largest value."
    >
      <div className="ds-space-list">
        {tokens.map((t) => {
          const px = parseFloat(t.value) || 0;
          const widthPct = Math.max((px / maxPx) * 100, 2);
          return (
            <div key={t.id} className="ds-space-row">
              <div className="ds-token-name">{t.name}</div>
              <div className="ds-space-bar-track">
                <div
                  className="ds-space-bar"
                  style={{
                    width: `${widthPct}%`,
                    background: "var(--ds-brand, var(--app-primary))",
                  }}
                />
              </div>
              <div className="ds-token-val">{t.value}</div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function RadiusSection({
  tokens,
}: {
  tokens: EditorDesignSystem["borderRadius"];
}) {
  return (
    <Section
      id="radius"
      title="Radius"
      subtitle="Corner radius steps from the published snapshot."
    >
      <div className="ds-radius-grid">
        {tokens.map((t) => {
          const n = parseFloat(t.value);
          const visual =
            t.id.includes("full") || n >= 999
              ? "999px"
              : `${Math.min(n || 0, 28)}px`;
          return (
            <div key={t.id} className="ds-radius-card">
              <div
                className="ds-radius-demo"
                style={{
                  borderRadius: visual,
                  background: "color-mix(in srgb, var(--ds-brand, #7733FF) 18%, transparent)",
                  borderColor: "var(--ds-brand, #7733FF)",
                }}
              />
              <div className="ds-token-name">{t.name}</div>
              <div className="ds-token-val">
                {t.id.includes("full") ? "full" : t.value}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ShadowSection({
  tokens,
}: {
  tokens: EditorDesignSystem["shadows"];
}) {
  return (
    <Section
      id="shadow"
      title="Shadow"
      subtitle="Elevation tokens from the published snapshot."
    >
      <div className="ds-shadow-grid">
        {tokens.map((t) => (
          <div key={t.id} className="ds-shadow-card">
            <div className="ds-shadow-demo" style={{ boxShadow: t.value }} />
            <div className="ds-token-name">{t.name}</div>
            <div className="ds-token-val ds-token-val-wrap">{t.value}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ComponentsSection({
  ds,
  namespace,
}: {
  ds: EditorDesignSystem;
  namespace: string;
}) {
  const primary = colorToken(ds.colors, "primary", "#7733FF");
  const surface = colorToken(ds.colors, "bg-primary", "#ffffff");
  const border = colorToken(ds.colors, "border", "#e5e4e0");
  const text = colorToken(ds.colors, "text-primary", "#111110");
  const success = colorToken(ds.colors, "success", "#10b981");
  const warning = colorToken(ds.colors, "warning", "#f59e0b");
  const radiusMd = radiusToken(ds.borderRadius, "radius-md", "8px");
  const radiusFull = radiusToken(ds.borderRadius, "radius-full", "9999px");
  const btnSm = compToken(ds.components, "button-height-sm", "32px");
  const btnMd = compToken(ds.components, "button-height-md", "40px");
  const btnLg = compToken(ds.components, "button-height-lg", "48px");
  const inputH = compToken(ds.components, "input-height", "40px");
  const inputPx = compToken(ds.components, "input-padding-x", "14px");
  const badgeH = compToken(ds.components, "badge-height", "22px");
  const badgeFs = compToken(ds.components, "badge-font-size", "11px");
  const avatarMd = compToken(ds.components, "avatar-size-md", "36px");
  const cardPad = compToken(ds.components, "card-padding", "20px");
  const cardR = compToken(ds.components, "card-radius", "12px");
  const ns = namespace || "ds";

  return (
    <Section
      id="components"
      title="Components"
      subtitle="Live demos using this system's published primary and component tokens."
    >
      <div className="ds-block">
        <h3 className="ds-block-title">Buttons</h3>
        <div className="ds-demo-grid">
          <DemoCard
            title="Primary"
            code={`height: var(--${ns}-button-height-md)`}
          >
            <button
              type="button"
              className="ds-demo-btn"
              style={{
                height: btnMd,
                background: primary,
                borderRadius: radiusMd,
                color: "#fff",
              }}
            >
              Primary
            </button>
          </DemoCard>
          <DemoCard title="Outline" code={`border-color: var(--${ns}-border)`}>
            <button
              type="button"
              className="ds-demo-btn"
              style={{
                height: btnMd,
                background: "transparent",
                border: `1.5px solid ${primary}`,
                borderRadius: radiusMd,
                color: primary,
              }}
            >
              Outline
            </button>
          </DemoCard>
          <DemoCard title="Ghost" code="background: transparent">
            <button
              type="button"
              className="ds-demo-btn"
              style={{
                height: btnSm,
                background: "transparent",
                border: `1px solid ${border}`,
                borderRadius: radiusMd,
                color: text,
              }}
            >
              Ghost
            </button>
          </DemoCard>
          <DemoCard
            title="Large"
            code={`height: var(--${ns}-button-height-lg)`}
          >
            <button
              type="button"
              className="ds-demo-btn"
              style={{
                height: btnLg,
                background: primary,
                borderRadius: radiusMd,
                color: "#fff",
              }}
            >
              Large
            </button>
          </DemoCard>
        </div>
      </div>

      <div className="ds-block">
        <h3 className="ds-block-title">Inputs · Badges · Avatar</h3>
        <div className="ds-demo-grid">
          <DemoCard
            title="Input"
            code={`height: var(--${ns}-input-height)`}
          >
            <input
              className="ds-demo-input"
              placeholder="Placeholder"
              readOnly
              style={{
                height: inputH,
                padding: `0 ${inputPx}`,
                borderRadius: radiusMd,
                borderColor: border,
                background: surface,
                color: text,
              }}
            />
          </DemoCard>
          <DemoCard
            title="Badges"
            code={`height: var(--${ns}-badge-height)`}
          >
            <div className="ds-badge-row">
              {(
                [
                  ["Primary", primary],
                  ["Success", success],
                  ["Warning", warning],
                ] as const
              ).map(([label, bg]) => (
                <span
                  key={label}
                  className="ds-demo-badge"
                  style={{
                    height: badgeH,
                    fontSize: badgeFs,
                    background: `${bg}22`,
                    color: bg,
                    borderRadius: radiusFull,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </DemoCard>
          <DemoCard
            title="Avatar"
            code={`size: var(--${ns}-avatar-size-md)`}
          >
            <div
              className="ds-demo-avatar"
              style={{
                width: avatarMd,
                height: avatarMd,
                background: primary,
                borderRadius: radiusFull,
              }}
            >
              A
            </div>
          </DemoCard>
        </div>
      </div>

      <div className="ds-block">
        <h3 className="ds-block-title">Card</h3>
        <DemoCard
          title="Surface card"
          code={`padding: var(--${ns}-card-padding)`}
        >
          <div
            className="ds-demo-surface-card"
            style={{
              padding: cardPad,
              borderRadius: cardR,
              border: `1px solid ${border}`,
              background: surface,
            }}
          >
            <div style={{ fontWeight: 600, color: text, marginBottom: 6 }}>
              Card title
            </div>
            <div style={{ fontSize: 13, color: `${text}99` }}>
              Built from this system&apos;s published tokens.
            </div>
          </div>
        </DemoCard>
      </div>
    </Section>
  );
}

function FormsSection({
  ds,
  namespace,
}: {
  ds: EditorDesignSystem;
  namespace: string;
}) {
  const primary = colorToken(ds.colors, "primary", "#7733FF");
  const error = colorToken(ds.colors, "danger", "#ef4444");
  const surface = colorToken(ds.colors, "bg-primary", "#ffffff");
  const border = colorToken(ds.colors, "border", "#e5e4e0");
  const text = colorToken(ds.colors, "text-primary", "#111110");
  const muted = colorToken(ds.colors, "text-tertiary", "#a0a09a");
  const radiusMd = radiusToken(ds.borderRadius, "radius-md", "8px");
  const inputH = compToken(ds.components, "input-height", "40px");
  const inputPx = compToken(ds.components, "input-padding-x", "14px");
  const ns = namespace || "ds";

  return (
    <Section
      id="forms"
      title="Forms"
      subtitle="Fields styled from this system's published color and input tokens."
    >
      <div className="ds-demo-grid">
        <DemoCard
          title="Text field"
          code={`height: var(--${ns}-input-height)`}
        >
          <label className="ds-form-label" style={{ color: text }}>
            Email
            <input
              className="ds-demo-input"
              placeholder="you@company.com"
              readOnly
              style={{
                height: inputH,
                padding: `0 ${inputPx}`,
                borderRadius: radiusMd,
                borderColor: border,
                background: surface,
                color: text,
                marginTop: 6,
              }}
            />
            <span className="ds-form-hint" style={{ color: muted }}>
              We&apos;ll never share your email.
            </span>
          </label>
        </DemoCard>

        <DemoCard title="Error state" code={`border-color: var(--${ns}-danger)`}>
          <label className="ds-form-label" style={{ color: text }}>
            Password
            <input
              className="ds-demo-input"
              defaultValue="short"
              readOnly
              style={{
                height: inputH,
                padding: `0 ${inputPx}`,
                borderRadius: radiusMd,
                borderColor: error,
                background: surface,
                color: text,
                marginTop: 6,
                boxShadow: `0 0 0 3px ${error}22`,
              }}
            />
            <span className="ds-form-hint" style={{ color: error }}>
              Must be at least 8 characters.
            </span>
          </label>
        </DemoCard>

        <DemoCard title="Textarea" code="min-height: 96px">
          <label className="ds-form-label" style={{ color: text }}>
            Notes
            <textarea
              className="ds-demo-textarea"
              readOnly
              defaultValue="Optional context for the request."
              style={{
                minHeight: 96,
                padding: inputPx,
                borderRadius: radiusMd,
                borderColor: border,
                background: surface,
                color: text,
                marginTop: 6,
              }}
            />
          </label>
        </DemoCard>

        <DemoCard
          title="Select"
          code={`height: var(--${ns}-input-height)`}
        >
          <label className="ds-form-label" style={{ color: text }}>
            Role
            <select
              className="ds-demo-input"
              defaultValue="designer"
              style={{
                height: inputH,
                padding: `0 ${inputPx}`,
                borderRadius: radiusMd,
                borderColor: border,
                background: surface,
                color: text,
                marginTop: 6,
              }}
            >
              <option value="designer">Designer</option>
              <option value="engineer">Engineer</option>
              <option value="pm">Product</option>
            </select>
          </label>
        </DemoCard>

        <DemoCard title="Checkbox" code={`accent-color: var(--${ns}-primary)`}>
          <label className="ds-form-check" style={{ color: text }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ accentColor: primary }}
            />
            Subscribe to product updates
          </label>
        </DemoCard>

        <DemoCard title="Radio" code={`accent-color: var(--${ns}-primary)`}>
          <div className="ds-form-radios" style={{ color: text }}>
            <label className="ds-form-check">
              <input
                type="radio"
                name="plan"
                defaultChecked
                style={{ accentColor: primary }}
              />
              Free
            </label>
            <label className="ds-form-check">
              <input
                type="radio"
                name="plan"
                style={{ accentColor: primary }}
              />
              Pro
            </label>
          </div>
        </DemoCard>
      </div>
    </Section>
  );
}

function ToggleSwitch({
  width,
  height,
  on,
  disabled,
  onColor,
  offColor,
}: {
  width: string;
  height: string;
  on: boolean;
  disabled?: boolean;
  onColor: string;
  offColor: string;
}) {
  const w = parseFloat(width) || 38;
  const h = parseFloat(height) || 22;
  const knob = Math.max(h - 4, 10);
  const travel = Math.max(w - knob - 4, 0);

  return (
    <div
      className={`ds-toggle${on ? " on" : ""}${disabled ? " disabled" : ""}`}
      style={{
        width: w,
        height: h,
        borderRadius: h,
        background: on ? onColor : offColor,
        opacity: disabled ? 0.45 : 1,
      }}
      role="switch"
      aria-checked={on}
      aria-disabled={disabled || undefined}
    >
      <span
        className="ds-toggle-knob"
        style={{
          width: knob,
          height: knob,
          transform: `translateX(${on ? travel : 0}px)`,
        }}
      />
    </div>
  );
}

function TogglesSection({
  ds,
  namespace,
}: {
  ds: EditorDesignSystem;
  namespace: string;
}) {
  const primary = colorToken(ds.colors, "primary", "#7733FF");
  const border = colorToken(ds.colors, "border", "#d4d4d0");
  const wMd = compToken(ds.components, "toggle-width-md", "38px");
  const hMd = compToken(ds.components, "toggle-height-md", "22px");
  const wSm = compToken(ds.components, "toggle-width-sm", "30px");
  const hSm = compToken(ds.components, "toggle-height-sm", "18px");
  const ns = namespace || "ds";

  return (
    <Section
      id="toggles"
      title="Toggles"
      subtitle="Switch sizes from published toggle.* tokens (with fallbacks if missing)."
    >
      <div className="ds-demo-grid">
        <DemoCard
          title="Default · On"
          code={`var(--${ns}-toggle-width-md)`}
        >
          <ToggleSwitch
            width={wMd}
            height={hMd}
            on
            onColor={primary}
            offColor={border}
          />
        </DemoCard>
        <DemoCard
          title="Default · Off"
          code={`var(--${ns}-toggle-height-md)`}
        >
          <ToggleSwitch
            width={wMd}
            height={hMd}
            on={false}
            onColor={primary}
            offColor={border}
          />
        </DemoCard>
        <DemoCard title="Default · Disabled" code="opacity: 0.45">
          <ToggleSwitch
            width={wMd}
            height={hMd}
            on
            disabled
            onColor={primary}
            offColor={border}
          />
        </DemoCard>
        <DemoCard
          title="Compact · On"
          code={`var(--${ns}-toggle-width-sm)`}
        >
          <ToggleSwitch
            width={wSm}
            height={hSm}
            on
            onColor={primary}
            offColor={border}
          />
        </DemoCard>
        <DemoCard
          title="Compact · Off"
          code={`var(--${ns}-toggle-height-sm)`}
        >
          <ToggleSwitch
            width={wSm}
            height={hSm}
            on={false}
            onColor={primary}
            offColor={border}
          />
        </DemoCard>
      </div>
    </Section>
  );
}

function GuidelinesSection() {
  const items = [
    "Use primary.600 (hover alias) for interactive hover — not 700.",
    "Prefer semantic aliases (success, danger) over raw hex in product UI.",
    "Keep text on surface pairs at AA contrast before shipping.",
    "Space components on the 4px grid from spacing.base.",
    "Re-convert after intentional token changes so docs stay in sync.",
  ];

  return (
    <Section
      id="guidelines"
      title="Guidelines"
      subtitle="Starter rules for consuming this system — not yet derived from usage analytics."
    >
      <ul className="ds-guide-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Section>
  );
}

function ExportSection({
  designSystem,
  namespace,
  onNamespaceChange,
}: {
  designSystem: EditorDesignSystem;
  namespace: string;
  onNamespaceChange: (ns: string) => void;
}) {
  const [tab, setTab] = useState<CodeTab>("css");
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => generateDesignSystemCode(designSystem, namespace, tab),
    [designSystem, namespace, tab]
  );

  return (
    <Section
      id="export"
      title="Export"
      subtitle="Generated from the published snapshot — not live editor drafts."
    >
      <div className="ds-export-toolbar">
        <label className="ds-ns-field">
          <span>Namespace</span>
          <input
            className="ds-ns-input"
            value={namespace}
            onChange={(e) => onNamespaceChange(e.target.value)}
            spellCheck={false}
          />
        </label>
        <div className="ds-export-tabs">
          {(["css", "tailwind", "json", "typescript", "markdown"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`ds-export-tab${tab === t ? " on" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="ds-btn-ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* ignore */
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="ds-export-code">{code}</pre>
    </Section>
  );
}
