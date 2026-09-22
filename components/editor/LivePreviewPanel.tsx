"use client";

import { CompositeTokenGallery } from "@/components/editor/CompositeTokenGallery";
import { useTokenStore } from "@/stores/tokenStore";

function pxNum(v: string | undefined, fallback = 16): number {
  if (!v) return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function typo(
  map: Record<string, string>,
  id: string,
  fallback: string
): string {
  return map[id] ?? fallback;
}

/**
 * Persistent preview — switches composition by active rail category.
 * Not remounted when category changes (same component instance).
 */
const PREVIEW_PILL: Record<
  "live" | "updating" | "error",
  { label: string; className: string }
> = {
  live: { label: "Live preview", className: "" },
  updating: { label: "Updating…", className: " is-updating" },
  error: { label: "Preview error", className: " is-error" },
};

function themeToggleLabel(name: string): string {
  if (name === "High Contrast") return "HC";
  return name;
}

export function LivePreviewPanel() {
  const {
    typographyTokenMap,
    state,
    selectedTypography,
    selectedSpacing,
    selectedRadius,
    selectedShadow,
    setPreviewTheme,
  } = useTokenStore();

  const category = state.activeCategory;
  const pill = PREVIEW_PILL[state.previewStatus] ?? PREVIEW_PILL.live;
  const previewThemeId = state.previewThemeId;

  return (
    <aside className="ed-preview">
      <div className="ed-preview-header">
        <div className="ed-preview-header-left">
          <span
            className={`ed-preview-label${pill.className}`}
            title={pill.label}
          >
            <span className="ed-preview-live-dot" aria-hidden />
            Live preview
          </span>
          {state.theme.length > 0 && (
            <div
              className="ed-preview-theme-toggle"
              role="group"
              aria-label="Preview theme"
            >
              {state.theme.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`ed-preview-theme-btn${
                    previewThemeId === theme.id ? " on" : ""
                  }`}
                  aria-pressed={previewThemeId === theme.id}
                  title={`${theme.name} (${theme.baseMode})`}
                  onClick={() => setPreviewTheme(theme.id)}
                >
                  {themeToggleLabel(theme.name)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="ed-preview-body">
        {category === "typography" ? (
          <TypographyPreview
            map={typographyTokenMap}
            selected={selectedTypography}
          />
        ) : category === "spacing" ? (
          <SpacingPreview selected={selectedSpacing} />
        ) : category === "radius" ? (
          <RadiusPreview selected={selectedRadius} />
        ) : category === "shadow" ? (
          <ShadowPreview selected={selectedShadow} />
        ) : (
          <CompositeTokenGallery density="compact" />
        )}
      </div>
    </aside>
  );
}

function TypographyPreview({
  map,
  selected,
}: {
  map: Record<string, string>;
  selected: ReturnType<typeof useTokenStore>["selectedTypography"];
}) {
  // Prefer the selected family token's computed `value` (works for embed stacks).
  const font =
    selected?.group === "family"
      ? selected.value
      : typo(map, "font-sans", "Inter, system-ui, sans-serif");
  const size =
    selected?.group === "size"
      ? selected.value
      : typo(map, selected?.id ?? "text-base", "16px");
  const weight =
    selected?.group === "weight"
      ? selected.value
      : typo(map, "weight-regular", "400");

  return (
    <div className="ed-pp-sec">
      <div className="ed-pp-lbl">Typography</div>
      <p
        style={{
          fontFamily: font,
          fontSize: size,
          fontWeight: Number(weight) || 400,
          color: "var(--ed-text)",
          lineHeight: 1.45,
          margin: 0,
        }}
      >
        The quick brown fox jumps over the lazy dog.
      </p>
      {selected && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: "var(--ed-text-muted)",
            fontFamily: "var(--ed-mono)",
          }}
        >
          {selected.name} · {selected.value}
        </div>
      )}
    </div>
  );
}

function SpacingPreview({
  selected,
}: {
  selected: ReturnType<typeof useTokenStore>["selectedSpacing"];
}) {
  const px = pxNum(selected?.value, 16);
  return (
    <div className="ed-pp-sec">
      <div className="ed-pp-lbl">Spacing</div>
      <div
        style={{
          height: px,
          background: "var(--ed-primary-dim)",
          border: "0.5px solid var(--ed-primary-border)",
          borderRadius: 4,
          maxWidth: "100%",
        }}
      />
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          color: "var(--ed-text-muted)",
          fontFamily: "var(--ed-mono)",
        }}
      >
        {selected?.name ?? "spacing"} · {selected?.value ?? "—"}
      </div>
    </div>
  );
}

function RadiusPreview({
  selected,
}: {
  selected: ReturnType<typeof useTokenStore>["selectedRadius"];
}) {
  const r = selected?.value ?? "8px";
  return (
    <div className="ed-pp-sec">
      <div className="ed-pp-lbl">Radius</div>
      <div
        style={{
          width: 72,
          height: 48,
          background: "var(--ed-surface2)",
          border: "0.5px solid var(--ed-border)",
          borderRadius: r,
        }}
      />
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          color: "var(--ed-text-muted)",
          fontFamily: "var(--ed-mono)",
        }}
      >
        {selected?.name ?? "radius"} · {r}
      </div>
    </div>
  );
}

function ShadowPreview({
  selected,
}: {
  selected: ReturnType<typeof useTokenStore>["selectedShadow"];
}) {
  const shadow = selected?.value ?? "none";
  return (
    <div className="ed-pp-sec">
      <div className="ed-pp-lbl">Shadow</div>
      <div
        style={{
          height: 56,
          borderRadius: 10,
          background: "var(--ed-surface)",
          border: "0.5px solid var(--ed-border)",
          boxShadow: shadow,
        }}
      />
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          color: "var(--ed-text-muted)",
          fontFamily: "var(--ed-mono)",
        }}
      >
        {selected?.name ?? "shadow"} · {shadow === "none" ? "none" : "custom"}
      </div>
    </div>
  );
}
