"use client";

import { genScale } from "@/lib/colorScale";
import {
  resolveCoreThemeMap,
  seedDefaultThemes,
} from "@/lib/themeResolve";
import { useTokenStore } from "@/stores/tokenStore";

function safeHex(v: string | undefined): string {
  if (v && v.startsWith("#") && v.length >= 7) return v.slice(0, 7);
  return "#7c3aed";
}

function pxNum(v: string | undefined, fallback = 16): number {
  if (!v) return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

const TYPE_SCALE_IDS = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-5xl",
] as const;

export type GalleryDensity = "compact" | "expanded";

/**
 * Shared read-only component gallery used by the sidebar LivePreviewPanel
 * and the topbar PreviewOverlay. Subscribes to the token store — never writes.
 */
export function CompositeTokenGallery({
  density = "compact",
}: {
  density?: GalleryDensity;
}) {
  const { tokenMap, typographyTokenMap, shadowTokenMap, state } =
    useTokenStore();
  const expanded = density === "expanded";
  const isUpdating = state.previewStatus === "updating";

  /** Preview theme only — never Themes-panel `selectedThemeId`. */
  const activeTheme =
    state.theme.find((t) => t.id === state.previewThemeId) ??
    state.theme.find((t) => t.id === "theme-light") ??
    state.theme[0] ??
    seedDefaultThemes()[0];
  const themeMap = resolveCoreThemeMap(activeTheme, state.color);

  const selected =
    state.color.find((t) => t.id === state.selectedColorId) ?? state.color[0];
  const primaryToken = state.color.find((t) => t.id === "primary");
  const primary = safeHex(
    themeMap["interactive.primary"] ?? tokenMap.primary ?? "#7c3aed"
  );
  const hover = safeHex(
    themeMap["interactive.hover"] ?? tokenMap["primary-hover"] ?? primary
  );
  const subtle = safeHex(tokenMap["primary-subtle"] ?? primary);
  const c = safeHex(selected?.value ?? primary);
  const surface = themeMap["surface.base"] ?? themeMap["background.base"];
  const textPrimary = themeMap["text.primary"];
  const textSecondary = themeMap["text.secondary"] ?? textPrimary;
  const borderDefault = themeMap["border.default"];
  const textBrand = themeMap["text.brand"];
  /** Theme border.focus / interactive.focus first so High Contrast overrides show. */
  const focusAccent = safeHex(
    themeMap["border.focus"] ??
      themeMap["interactive.focus"] ??
      tokenMap["border-focus"] ??
      tokenMap["interactive-focus"] ??
      primary
  );
  const scale =
    primaryToken?.scale?.map((s) => s.value) ?? genScale(primary);

  const success = tokenMap.success ?? "#10b981";
  const warning = tokenMap.warning ?? "#f59e0b";
  const info = tokenMap.info ?? "#3b82f6";
  const danger = tokenMap.danger ?? "#ef4444";

  const radius = expanded ? 10 : 10;
  const font =
    typographyTokenMap["font-body"] ??
    typographyTokenMap["font-sans"] ??
    "Inter, system-ui, sans-serif";
  const cardShadow =
    shadowTokenMap["shadow-card"] ??
    shadowTokenMap["shadow-md"] ??
    "0 4px 6px -1px rgba(17, 17, 16, 0.08), 0 2px 4px -2px rgba(17, 17, 16, 0.06)";
  const btnPad = expanded ? "10px 18px" : "7px 12px";
  const btnFont = expanded ? 14 : 12;
  const inputPad = expanded ? "10px 14px" : "7px 10px";
  const inputFont = expanded ? 14 : 12;

  const typeSteps = TYPE_SCALE_IDS.map((id) => {
    const token = state.typography.find((t) => t.id === id);
    return {
      id,
      name: token?.name ?? id,
      size: pxNum(typographyTokenMap[id] ?? token?.value, 16),
    };
  });

  /** Only show when the user has a gradient token selected / is editing it. */
  const activeGradient = selected?.gradient != null ? selected : null;

  return (
    <div
      className={`ed-gallery${expanded ? " ed-gallery--expanded" : ""}`}
      aria-hidden={false}
      style={{
        background: themeMap["background.base"] ?? surface,
        color: textPrimary,
        borderRadius: expanded ? 12 : 8,
        padding: expanded ? 12 : 8,
        border: `0.5px solid ${borderDefault}`,
        transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
      }}
      key={activeTheme.id}
    >
      <section className="ed-pp-sec">
        <div className="ed-pp-lbl" style={{ color: textPrimary, opacity: 0.55 }}>
          Buttons · {activeTheme.name}
        </div>
        <div className={expanded ? "ed-gallery-btn-row" : "ed-pp-btn-stack"}>
          <div
            className="ed-pp-btn"
            style={{
              background: primary,
              color: "#fff",
              borderRadius: radius,
              padding: btnPad,
              fontSize: btnFont,
            }}
          >
            Primary
          </div>
          <div
            className="ed-pp-outline"
            style={{
              border: `1.5px solid ${primary}`,
              color: textBrand,
              borderRadius: radius,
              padding: btnPad,
              fontSize: btnFont,
            }}
          >
            Outline
          </div>
          <div
            className="ed-pp-ghost"
            style={{
              background: subtle,
              color: textBrand,
              border: `0.5px solid ${borderDefault}`,
              borderRadius: radius,
              padding: btnPad,
              fontSize: btnFont,
            }}
          >
            Ghost
          </div>
          {expanded && (
            <div
              className="ed-pp-btn"
              style={{
                background: hover,
                color: "#fff",
                borderRadius: radius,
                padding: btnPad,
                fontSize: btnFont,
              }}
            >
              Hover
            </div>
          )}
        </div>
      </section>

      {activeGradient && (
        <section className="ed-pp-sec">
          <div className="ed-pp-lbl">
            Gradients · {activeGradient.name.split(".").pop()}
          </div>
          <div
            className="ed-pp-grad-hero"
            style={{
              background: activeGradient.value,
              height: expanded ? 72 : 44,
            }}
          />
        </section>
      )}

      <section className="ed-pp-sec">
        <div className="ed-pp-lbl">Form inputs</div>
        <div className={expanded ? "ed-gallery-input-row" : undefined}>
          <input
            className="ed-pp-input"
            placeholder="Default input…"
            readOnly
            tabIndex={-1}
            style={{
              background: surface,
              border: `0.5px solid ${borderDefault}`,
              color: textPrimary,
              borderRadius: radius,
              padding: inputPad,
              fontSize: inputFont,
            }}
          />
          <input
            className={`ed-pp-input ed-pp-input--focused${isUpdating ? " is-updating" : ""}`}
            placeholder="Focused input…"
            readOnly
            tabIndex={-1}
            style={{
              background: surface,
              border: `1.5px solid ${focusAccent}`,
              borderLeft: `${isUpdating ? 4 : 1.5}px solid ${focusAccent}`,
              color: textPrimary,
              borderRadius: radius,
              boxShadow: `0 0 0 3px ${focusAccent}22`,
              padding: inputPad,
              fontSize: inputFont,
              transition:
                "border-color 0.2s ease, border-left-width 0.2s ease, box-shadow 0.2s ease",
            }}
          />
        </div>
      </section>

      <section className="ed-pp-sec">
        <div className="ed-pp-lbl">Card</div>
        <div
          className="ed-pp-card"
          style={{
            background: surface,
            border: `0.5px solid ${borderDefault}`,
            borderLeft: `2.5px solid ${c}`,
            borderRadius: expanded ? "0 12px 12px 0" : "0 9px 9px 0",
            padding: expanded ? 16 : 10,
            boxShadow: cardShadow,
          }}
        >
          <div
            style={{
              fontSize: expanded ? 15 : 12,
              fontWeight: 600,
              color: textPrimary,
              marginBottom: 4,
              fontFamily: font,
            }}
          >
            Product update
          </div>
          <div
            style={{
              fontSize: expanded ? 14 : 11,
              color: textSecondary,
              lineHeight: 1.5,
              fontFamily: font,
            }}
          >
            Live preview follows the selected theme ({activeTheme.name}). Surface,
            text, and interactive colors resolve from theme mode + overrides.
          </div>
        </div>
      </section>

      <section className="ed-pp-sec">
        <div className="ed-pp-lbl">Badges</div>
        <div className="ed-pp-badge-row">
          <span
            className="ed-pp-badge"
            style={{
              background: subtle,
              color: primary,
              fontSize: expanded ? 12 : 10,
              padding: expanded ? "4px 10px" : undefined,
            }}
          >
            Info
          </span>
          <span
            className="ed-pp-badge"
            style={{
              background: `${success}26`,
              color: success,
              fontSize: expanded ? 12 : 10,
              padding: expanded ? "4px 10px" : undefined,
            }}
          >
            Success
          </span>
          <span
            className="ed-pp-badge"
            style={{
              background: `${warning}26`,
              color: warning,
              fontSize: expanded ? 12 : 10,
              padding: expanded ? "4px 10px" : undefined,
            }}
          >
            Warning
          </span>
          <span
            className="ed-pp-badge"
            style={{
              background: `${danger}26`,
              color: danger,
              fontSize: expanded ? 12 : 10,
              padding: expanded ? "4px 10px" : undefined,
            }}
          >
            Error
          </span>
          {!expanded && (
            <span
              className="ed-pp-badge"
              style={{ background: `${info}26`, color: info }}
            >
              Primary
            </span>
          )}
        </div>
      </section>

      <section className="ed-pp-sec">
        <div className="ed-pp-lbl">Avatars</div>
        <div className="ed-pp-avatar-row">
          {(
            [
              { initials: "AC", bg: `${c}22`, fg: c },
              {
                initials: "JD",
                bg: "var(--ed-green-bg)",
                fg: "var(--ed-green-text)",
              },
              {
                initials: "MK",
                bg: "var(--ed-amber-bg)",
                fg: "var(--ed-amber-text)",
              },
            ] as const
          ).map((a) => (
            <div
              key={a.initials}
              className="ed-pp-avatar"
              style={{
                background: a.bg,
                color: a.fg,
                width: expanded ? 40 : 28,
                height: expanded ? 40 : 28,
                fontSize: expanded ? 13 : 11,
              }}
            >
              {a.initials}
            </div>
          ))}
        </div>
      </section>

      {expanded && (
        <section className="ed-pp-sec ed-gallery-type">
          <div className="ed-pp-lbl">Type scale</div>
          <div className="ed-gallery-type-list">
            {typeSteps.map((step) => (
              <div key={step.id} className="ed-gallery-type-row">
                <span className="ed-gallery-type-meta">
                  {step.name.replace(/^typography\./, "")} · {step.size}px
                </span>
                <div
                  style={{
                    fontFamily: font,
                    fontSize: step.size,
                    fontWeight: step.size >= 24 ? 700 : 400,
                    lineHeight: 1.25,
                    color: "var(--ed-text)",
                  }}
                >
                  The quick brown fox
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ed-pp-sec">
        <div className="ed-pp-lbl">Color scale</div>
        <div className={`ed-scale-strip${expanded ? " ed-scale-strip--lg" : ""}`}>
          {scale.map((sc, i) => (
            <div
              key={`${sc}-${i}`}
              className="ed-ss-cell"
              style={{ background: sc }}
              title={sc}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
