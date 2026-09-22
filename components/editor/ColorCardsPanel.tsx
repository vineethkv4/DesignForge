"use client";

import { IconPencil, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import {
  buildGradientFromFoundations,
  generateScaleFromAnchor,
  isValidHex,
  SCALE_STEPS,
} from "@/lib/colorScale";
import { COLOR_CATEGORY_META } from "@/lib/config/recommendedColorTokens";
import type {
  ColorGradient,
  ColorScaleStepNumber,
  ColorToken,
  WcagLevel,
} from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

const GROUPS = COLOR_CATEGORY_META.map(({ key, label }) => ({
  key,
  label: `${label} tokens`,
}));

function wcagClass(level: WcagLevel): string {
  return level;
}

function safeHex(v: string): string {
  return v.startsWith("#") && v.length >= 7 ? v.slice(0, 7) : "#7c3aed";
}

function isGradientToken(token: ColorToken): boolean {
  return token.gradient != null;
}

/** Center expandable color cards — matches design_forge_editor.html */
export function ColorCardsPanel() {
  const {
    state,
    colorsByGroup,
    selectColor,
    updateColorValue,
    updateGradient,
    updateScaleStep,
    resetScaleStep,
    updateStepRef,
    updateColorRef,
    setPreviewStatus,
  } = useTokenStore();
  const selectedId = state.selectedColorId;
  const ns = state.namespace;
  const primary = state.color.find((t) => t.id === "primary") ?? null;
  const allColors = state.color;

  return (
    <div>
      {GROUPS.map(({ key, label }) => {
        const tokens = colorsByGroup[key] ?? [];
        if (!tokens.length) return null;

        const solids = tokens.filter((t) => !isGradientToken(t));
        const gradients = tokens.filter(isGradientToken);

        return (
          <div key={key}>
            <div className="ed-section-lbl">{label}</div>
            {solids.map((token) => (
              <ColorCard
                key={token.id}
                token={token}
                primary={primary}
                allColors={allColors}
                namespace={ns}
                active={token.id === selectedId}
                onSelect={() => selectColor(token.id)}
                onUpdate={(value) => updateColorValue(token.id, value)}
                onScaleStep={(step, value) => updateScaleStep(step, value)}
                onResetStep={(step) => resetScaleStep(step)}
                onStepRef={(step) => updateStepRef(token.id, step)}
                onColorRef={(refOf) => updateColorRef(token.id, refOf)}
                onParseError={() => setPreviewStatus("error")}
                onParseOk={() => setPreviewStatus("live")}
              />
            ))}

            {key === "semantic" && gradients.length > 0 && (
              <>
                <div className="ed-section-lbl" style={{ marginTop: 14 }}>
                  Gradients
                </div>
                {gradients.map((token) => (
                  <GradientCard
                    key={token.id}
                    token={token}
                    namespace={ns}
                    active={token.id === selectedId}
                    onSelect={() => selectColor(token.id)}
                    onChange={(g) => updateGradient(token.id, g)}
                    allColors={allColors}
                    hasSecondary={allColors.some((c) => c.id === "secondary")}
                  />
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GradientCard({
  token,
  namespace,
  active,
  onSelect,
  onChange,
  allColors,
  hasSecondary,
}: {
  token: ColorToken;
  namespace: string;
  active: boolean;
  onSelect: () => void;
  onChange: (gradient: ColorGradient) => void;
  allColors: ColorToken[];
  hasSecondary: boolean;
}) {
  const g = token.gradient!;
  const cssVar = `--${namespace}-${token.name.replace(/\./g, "-")}`;
  const linkable =
    token.id === "gradient-brand" || token.id === "gradient-cool";
  const isManual = Boolean(g.manual);
  const sourceHint =
    token.id === "gradient-brand"
      ? "primary 500 → 600"
      : hasSecondary
        ? "secondary 500 → 600"
        : "primary 500 → 600 @ 50%";

  /** Angle-only edits keep the linked source when not manual. */
  const patchAngle = (angle: number) => onChange({ ...g, angle });

  /** Palette / hex / opacity edits mark the gradient as manually owned. */
  const patchStops = (next: ColorGradient) =>
    onChange({ ...next, manual: true });

  const resetToSource = () => {
    const kind = token.id === "gradient-brand" ? "brand" : "cool";
    const primary = allColors.find((c) => c.id === "primary");
    const secondary = allColors.find((c) => c.id === "secondary");
    const built = buildGradientFromFoundations(
      kind,
      primary,
      secondary,
      g.angle,
      allColors
    );
    if (built) onChange({ ...built, manual: false });
  };

  return (
    <div
      className={`ed-tok-card${active ? " active" : ""}`}
      data-token-id={token.id}
    >
      <div
        className="ed-tc-top"
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div
          className="ed-tc-swatch"
          style={{ background: token.value }}
          aria-hidden
        />
        <div className="ed-tc-info">
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{cssVar}</div>
        </div>
        <div className="ed-tc-badges">
          {linkable && (
            <span className="ed-val-pill">
              {isManual ? "manual" : `→ ${sourceHint}`}
            </span>
          )}
          <span className="ed-val-pill">{g.angle}°</span>
        </div>
        <button
          type="button"
          className="ed-tc-edit-btn"
          aria-label={`Edit ${token.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <IconPencil size={14} />
        </button>
      </div>

      {active && (
        <div className="ed-tc-expanded">
          <div
            className="ed-grad-preview"
            style={{ background: token.value }}
            aria-label="Gradient preview"
          />

          {linkable && (
            <div className="ed-exp-row">
              <span className="ed-exp-lbl">Source</span>
              <span className="ed-ref-hint">
                {isManual
                  ? "Custom colors — primary/secondary sync paused"
                  : sourceHint}
              </span>
              {isManual && (
                <button
                  type="button"
                  className="ed-btn-ghost"
                  style={{ fontSize: 11, padding: "4px 10px", marginLeft: "auto" }}
                  onClick={resetToSource}
                >
                  Reset to {sourceHint}
                </button>
              )}
            </div>
          )}

          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Angle</span>
            <input
              className="ed-num-inp"
              type="number"
              min={0}
              max={360}
              value={g.angle}
              onChange={(e) => patchAngle(Number(e.target.value) || 0)}
              aria-label="Gradient angle"
            />
            <input
              className="ed-rng-inp"
              type="range"
              min={0}
              max={360}
              value={g.angle}
              onChange={(e) => patchAngle(Number(e.target.value))}
              aria-label="Gradient angle slider"
            />
            <span className="ed-grad-unit">deg</span>
          </div>

          <GradientStopRow
            label="From"
            stop={g.from}
            onChange={(from) => patchStops({ ...g, from })}
          />
          <GradientStopRow
            label="To"
            stop={g.to}
            onChange={(to) => patchStops({ ...g, to })}
          />

          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Used by</span>
            <div className="ed-alias-chips">
              {(token.usedBy.length
                ? token.usedBy
                : ["hero.bg", "cta.bg"]
              ).map((u) => (
                <span key={u} className="ed-alias-chip">
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GradientStopRow({
  label,
  stop,
  onChange,
}: {
  label: string;
  stop: ColorGradient["from"];
  onChange: (stop: ColorGradient["from"]) => void;
}) {
  const [localHex, setLocalHex] = useState("");
  const hex = safeHex(stop.color);
  const displayHex = localHex !== "" ? localHex : stop.color;

  return (
    <div className="ed-exp-row ed-grad-stop-row">
      <span className="ed-exp-lbl">{label}</span>
      <div className="ed-exp-swatch" style={{ background: hex }}>
        <input
          type="color"
          value={hex}
          aria-label={`${label} color`}
          onChange={(e) => {
            onChange({ ...stop, color: e.target.value });
            setLocalHex("");
          }}
        />
      </div>
      <input
        className="ed-hex-inp"
        value={displayHex}
        spellCheck={false}
        aria-label={`${label} hex`}
        onChange={(e) => {
          setLocalHex(e.target.value);
          if (isValidHex(e.target.value)) {
            onChange({ ...stop, color: e.target.value });
          }
        }}
        onBlur={() => {
          if (localHex === "" || isValidHex(localHex)) setLocalHex("");
        }}
      />
      <input
        className="ed-opacity-inp"
        type="number"
        min={0}
        max={100}
        value={stop.opacity}
        aria-label={`${label} opacity`}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange({
            ...stop,
            opacity: Number.isFinite(n)
              ? Math.min(100, Math.max(0, n))
              : stop.opacity,
          });
        }}
      />
      <input
        className="ed-rng-inp ed-grad-opacity-rng"
        type="range"
        min={0}
        max={100}
        value={stop.opacity}
        aria-label={`${label} opacity slider`}
        onChange={(e) =>
          onChange({ ...stop, opacity: Number(e.target.value) })
        }
      />
      <span className="ed-grad-unit">%</span>
    </div>
  );
}

function ColorCard({
  token,
  primary,
  allColors,
  namespace,
  active,
  onSelect,
  onUpdate,
  onScaleStep,
  onResetStep,
  onStepRef,
  onColorRef,
  onParseError,
  onParseOk,
}: {
  token: ColorToken;
  primary: ColorToken | null;
  allColors: ColorToken[];
  namespace: string;
  active: boolean;
  onSelect: () => void;
  onUpdate: (value: string) => void;
  onScaleStep: (step: ColorScaleStepNumber, value: string) => void;
  onResetStep: (step: ColorScaleStepNumber) => void;
  onStepRef: (step: ColorScaleStepNumber) => void;
  onColorRef: (refOf: string | null) => void;
  onParseError: () => void;
  onParseOk: () => void;
}) {
  const [localHex, setLocalHex] = useState("");
  const isStepRef = token.stepRef != null;
  const isAliasRef = Boolean(token.refOf);
  const isRef = isStepRef || isAliasRef;
  const isPrimary = token.id === "primary";
  const hex = safeHex(token.value);
  const displayHex = localHex !== "" ? localHex : token.value;
  const cssVar = `--${namespace}-${token.name.replace(/\./g, "-")}`;
  const scale =
    isPrimary
      ? token.scale ?? generateScaleFromAnchor(token.value)
      : primary?.scale ?? generateScaleFromAnchor(primary?.value ?? hex);
  const refTargets = allColors.filter(
    (c) => c.id !== token.id && !c.gradient
  );

  const apply = (value: string) => {
    if (isRef) return;
    if (isValidHex(value) || value.startsWith("rgba")) {
      onUpdate(value);
      // Primary 500 cascade owns previewStatus (updating → live).
      if (!isPrimary) onParseOk();
      return;
    }
    if (value.trim() !== "") {
      onParseError();
    }
  };

  return (
    <div
      className={`ed-tok-card${active ? " active" : ""}`}
      data-token-id={token.id}
    >
      <div
        className="ed-tc-top"
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div className="ed-tc-swatch" style={{ background: token.value }}>
          {!isRef && (
            <input
              type="color"
              value={hex}
              aria-label={`${token.name} color picker`}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                apply(e.target.value);
                setLocalHex("");
              }}
            />
          )}
        </div>
        <div className="ed-tc-info">
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{cssVar}</div>
        </div>
        <div className="ed-tc-badges">
          {isAliasRef && (
            <span className="ed-val-pill">→ {token.refOf}</span>
          )}
          {isStepRef && (
            <span className="ed-val-pill">→ {token.stepRef}</span>
          )}
          <span className={`ed-wcag ${wcagClass(token.wcag ?? "fail")}`}>
            {(token.wcag ?? "fail") === "fail"
              ? "Fail"
              : (token.wcag ?? "fail").toUpperCase()}
          </span>
        </div>
        <button
          type="button"
          className="ed-tc-edit-btn"
          aria-label={`Edit ${token.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <IconPencil size={14} />
        </button>
      </div>

      {active && (
        <div className="ed-tc-expanded">
          {isAliasRef ? (
            <>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Hex</span>
                <div
                  className="ed-exp-swatch"
                  style={{ background: token.value, cursor: "default" }}
                />
                <input
                  className="ed-hex-inp"
                  value={token.value}
                  readOnly
                  spellCheck={false}
                  aria-label={`${token.name} resolved hex`}
                />
                <span className="ed-ref-hint">from token</span>
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Reference</span>
                <select
                  className="ed-sel-inp"
                  value={token.refOf}
                  onChange={(e) => onColorRef(e.target.value || null)}
                  aria-label={`${token.name} token reference`}
                >
                  {refTargets.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Mode</span>
                <button
                  type="button"
                  className="ed-btn-ghost"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => onColorRef(null)}
                >
                  Detach to color value
                </button>
              </div>
            </>
          ) : isStepRef ? (
            <>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Hex</span>
                <div
                  className="ed-exp-swatch"
                  style={{ background: token.value, cursor: "default" }}
                />
                <input
                  className="ed-hex-inp"
                  value={token.value}
                  readOnly
                  spellCheck={false}
                  aria-label={`${token.name} resolved hex`}
                />
                <span className="ed-ref-hint">from scale</span>
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Step</span>
                <select
                  className="ed-sel-inp"
                  value={token.stepRef}
                  onChange={(e) =>
                    onStepRef(Number(e.target.value) as ColorScaleStepNumber)
                  }
                  aria-label={`${token.name} scale step`}
                >
                  {SCALE_STEPS.map((step) => (
                    <option key={step} value={step}>
                      {step}
                      {step === 500
                        ? " (anchor)"
                        : ` — ${getScaleStepPreview(scale, step)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Alias</span>
                <span className="ed-alias-text">{token.alias}</span>
              </div>
            </>
          ) : (
            <>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Hex</span>
                <div className="ed-exp-swatch" style={{ background: token.value }}>
                  <input
                    type="color"
                    value={hex}
                    aria-label="Color picker"
                    onChange={(e) => {
                      apply(e.target.value);
                      setLocalHex("");
                    }}
                  />
                </div>
                <input
                  className="ed-hex-inp"
                  value={displayHex}
                  spellCheck={false}
                  onChange={(e) => {
                    setLocalHex(e.target.value);
                    apply(e.target.value);
                  }}
                  onBlur={() => {
                    // Keep invalid draft visible; only clear when it matches store.
                    if (
                      localHex === "" ||
                      isValidHex(localHex) ||
                      localHex.startsWith("rgba")
                    ) {
                      setLocalHex("");
                    }
                  }}
                />
                <input
                  className="ed-opacity-inp"
                  value="100%"
                  readOnly
                  aria-label="Opacity"
                />
              </div>
              {!isPrimary && refTargets.length > 0 && (
                <div className="ed-exp-row">
                  <span className="ed-exp-lbl">Reference</span>
                  <select
                    className="ed-sel-inp"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) onColorRef(e.target.value);
                    }}
                    aria-label={`Alias ${token.name} to another token`}
                  >
                    <option value="">Color value (no alias)</option>
                    {refTargets.map((c) => (
                      <option key={c.id} value={c.id}>
                        → {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Alias</span>
                <span className="ed-alias-text">{token.alias}</span>
              </div>
            </>
          )}

          {isPrimary && (
            <div className="ed-exp-row ed-exp-row--scale">
              <span className="ed-exp-lbl">Scale</span>
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
                        onUpdate(hexValue);
                      } else {
                        onScaleStep(step.step, hexValue);
                      }
                    }}
                    onReset={() => onResetStep(step.step)}
                    onParseError={onParseError}
                    onParseOk={onParseOk}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Used by</span>
            <div className="ed-alias-chips">
              {(token.usedBy.length
                ? token.usedBy
                : ["button.bg", "input.focus", "link.color"]
              ).map((u) => (
                <span key={u} className="ed-alias-chip">
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getScaleStepPreview(
  scale: { step: ColorScaleStepNumber; value: string }[],
  step: ColorScaleStepNumber
): string {
  const found = scale.find((s) => s.step === step);
  return found?.value ?? "";
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
      // Anchor (500) cascade owns previewStatus; other steps clear error here.
      if (!isAnchor) onParseOk();
      return;
    }
    if (next.trim() !== "") onParseError();
  };

  return (
    <div className={`ed-scale-step${overridden ? " overridden" : ""}${isAnchor ? " anchor" : ""}`}>
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
