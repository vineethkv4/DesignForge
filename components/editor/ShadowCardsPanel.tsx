"use client";

import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { isValidBoxShadow } from "@/lib/colorScale";
import type { ShadowToken } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

function shortValue(value: string): string {
  if (value === "none") return "none";
  return value.length > 18 ? `${value.slice(0, 16)}…` : value;
}

/** Expandable shadow cards — HTML mock pattern */
export function ShadowCardsPanel() {
  const { state, selectShadow, updateTokenField, updateTokenRef, setPreviewStatus } =
    useTokenStore();
  const selectedId = state.selectedShadowId;
  const presets = state.shadow;

  return (
    <div>
      <div className="ed-section-lbl">Shadow tokens</div>
      {state.shadow.map((token) => (
        <ShadowCard
          key={token.id}
          token={token}
          presets={presets}
          active={token.id === selectedId}
          onSelect={() => selectShadow(token.id)}
          onCommit={(value) => {
            updateTokenField("shadow", token.id, "value", value);
            setPreviewStatus("live");
          }}
          onTokenRef={(refOf) => updateTokenRef("shadow", token.id, refOf)}
          onParseError={() => setPreviewStatus("error")}
        />
      ))}
    </div>
  );
}

function ShadowCard({
  token,
  presets,
  active,
  onSelect,
  onCommit,
  onTokenRef,
  onParseError,
}: {
  token: ShadowToken;
  presets: ShadowToken[];
  active: boolean;
  onSelect: () => void;
  onCommit: (value: string) => void;
  onTokenRef: (refOf: string | null) => void;
  onParseError: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const isAliasRef = Boolean(token.refOf);
  const displayValue = draft !== null ? draft : token.value;
  const committedShadow = token.value === "none" ? "none" : token.value;
  const boxShadow = committedShadow;
  const refTargets = presets.filter((p) => p.id !== token.id);

  const handleRawChange = (raw: string) => {
    if (isAliasRef) return;
    setDraft(raw);
    if (isValidBoxShadow(raw)) {
      onCommit(raw.trim());
      setDraft(null);
    } else {
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
        <div className="ed-tc-swatch" style={{ background: "var(--ed-surface2)" }}>
          <div
            style={{
              width: 26,
              height: 20,
              background: "var(--ed-surface)",
              border: "0.5px solid var(--ed-border)",
              borderRadius: 5,
              boxShadow,
            }}
          />
        </div>
        <div className="ed-tc-info">
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{token.alias}</div>
        </div>
        <div className="ed-tc-badges">
          {isAliasRef ? (
            <span className="ed-val-pill">→ {token.refOf}</span>
          ) : (
            <span className="ed-val-pill">{shortValue(token.value)}</span>
          )}
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
                <span className="ed-exp-lbl">Reference</span>
                <select
                  className="ed-sel-inp"
                  value={token.refOf}
                  onChange={(e) => onTokenRef(e.target.value || null)}
                  aria-label={`${token.name} token reference`}
                >
                  {refTargets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.alias}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ed-exp-row" style={{ alignItems: "flex-start" }}>
                <span className="ed-exp-lbl" style={{ paddingTop: 6 }}>
                  CSS
                </span>
                <textarea
                  className="ed-shadow-textarea"
                  value={token.value}
                  readOnly
                  spellCheck={false}
                  rows={3}
                  aria-label={`${token.name} resolved box-shadow`}
                />
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Mode</span>
                <button
                  type="button"
                  className="ed-btn-ghost"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => onTokenRef(null)}
                >
                  Detach to literal value
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Preset</span>
                <select
                  className="ed-sel-inp"
                  value={
                    presets.find((p) => p.value === token.value && !p.refOf)
                      ?.id ?? ""
                  }
                  onChange={(e) => {
                    const preset = presets.find((p) => p.id === e.target.value);
                    if (!preset) return;
                    onCommit(preset.value);
                    setDraft(null);
                  }}
                >
                  <option value="">Custom CSS</option>
                  {presets
                    .filter((p) => !p.refOf)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.alias}
                      </option>
                    ))}
                </select>
              </div>
              {refTargets.length > 0 && (
                <div className="ed-exp-row">
                  <span className="ed-exp-lbl">Reference</span>
                  <select
                    className="ed-sel-inp"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) onTokenRef(e.target.value);
                    }}
                    aria-label={`Alias ${token.name} to another token`}
                  >
                    <option value="">Literal value (no alias)</option>
                    {refTargets.map((p) => (
                      <option key={p.id} value={p.id}>
                        → {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="ed-exp-row" style={{ alignItems: "flex-start" }}>
                <span className="ed-exp-lbl" style={{ paddingTop: 6 }}>
                  CSS
                </span>
                <textarea
                  className="ed-shadow-textarea"
                  value={displayValue}
                  spellCheck={false}
                  rows={3}
                  onChange={(e) => handleRawChange(e.target.value)}
                  aria-label={`${token.name} box-shadow`}
                />
              </div>
            </>
          )}
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Preview</span>
            <div
              style={{
                flex: 1,
                height: 48,
                borderRadius: 8,
                background: "var(--ed-surface)",
                border: "0.5px solid var(--ed-border)",
                boxShadow,
                transition: "box-shadow 0.15s",
              }}
            />
          </div>
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Used by</span>
            <div className="ed-alias-chips">
              {(token.usedBy.length
                ? token.usedBy
                : ["card.elevation", "dropdown"]
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
