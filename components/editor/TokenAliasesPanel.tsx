"use client";

import type { ColorToken, DesignToken } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

type AliasCategory = "color" | "typography" | "shadow";

function shortValue(value: string): string {
  if (value.length <= 36) return value;
  return `${value.slice(0, 34)}…`;
}

/**
 * Editable token→token aliases (`refOf`) for color / typography / shadow.
 * Scale step refs (`stepRef`) stay on color cards — not listed here.
 */
export function TokenAliasesPanel({ category }: { category: AliasCategory }) {
  const {
    state,
    updateColorRef,
    updateTokenRef,
    selectColor,
    selectTypography,
    selectShadow,
  } = useTokenStore();

  const tokens: DesignToken[] =
    category === "color"
      ? state.color.filter((t) => !(t as ColorToken).gradient)
      : category === "typography"
        ? state.typography
        : state.shadow;

  const selectedId =
    category === "color"
      ? state.selectedColorId
      : category === "typography"
        ? state.selectedTypographyId
        : state.selectedShadowId;

  const setRef = (id: string, refOf: string | null) => {
    if (category === "color") updateColorRef(id, refOf);
    else updateTokenRef(category, id, refOf);
  };

  const select = (id: string) => {
    if (category === "color") selectColor(id);
    else if (category === "typography") selectTypography(id);
    else selectShadow(id);
  };

  const aliased = tokens.filter((t) => Boolean(t.refOf));
  const literals = tokens.filter((t) => !t.refOf);

  return (
    <div>
      <div className="ed-section-lbl">Aliases</div>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "var(--ed-text-muted)",
          lineHeight: 1.45,
          maxWidth: 440,
        }}
      >
        Point a token at another token in this category. Resolved values update
        live when the source changes.
      </p>

      {aliased.length === 0 && (
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 12,
            color: "var(--ed-text-muted)",
          }}
        >
          No aliases yet — pick a reference below to create one.
        </p>
      )}

      {aliased.map((token) => (
        <AliasRow
          key={token.id}
          token={token}
          targets={tokens.filter((t) => t.id !== token.id)}
          active={token.id === selectedId}
          onSelect={() => select(token.id)}
          onRefChange={(refOf) => setRef(token.id, refOf)}
        />
      ))}

      {literals.length > 0 && (
        <>
          <div className="ed-section-lbl" style={{ marginTop: 18 }}>
            Create alias
          </div>
          {literals.map((token) => (
            <AliasRow
              key={token.id}
              token={token}
              targets={tokens.filter((t) => t.id !== token.id)}
              active={token.id === selectedId}
              onSelect={() => select(token.id)}
              onRefChange={(refOf) => setRef(token.id, refOf)}
              createMode
            />
          ))}
        </>
      )}
    </div>
  );
}

function AliasRow({
  token,
  targets,
  active,
  onSelect,
  onRefChange,
  createMode = false,
}: {
  token: DesignToken;
  targets: DesignToken[];
  active: boolean;
  onSelect: () => void;
  onRefChange: (refOf: string | null) => void;
  createMode?: boolean;
}) {
  const isAliased = Boolean(token.refOf);

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
        <div className="ed-tc-info" style={{ paddingLeft: 4 }}>
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{shortValue(token.value)}</div>
        </div>
        <div className="ed-tc-badges">
          {isAliased ? (
            <span className="ed-val-pill">→ {token.refOf}</span>
          ) : (
            <span className="ed-val-pill">literal</span>
          )}
        </div>
      </div>

      {(active || isAliased) && (
        <div className="ed-tc-expanded">
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Reference</span>
            <select
              className="ed-sel-inp"
              value={token.refOf ?? ""}
              onChange={(e) => onRefChange(e.target.value || null)}
              aria-label={`Alias ${token.name}`}
            >
              <option value="">
                {createMode ? "Select token…" : "No alias (literal value)"}
              </option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  → {t.name}
                </option>
              ))}
            </select>
          </div>
          {isAliased && (
            <div className="ed-exp-row">
              <span className="ed-exp-lbl">Mode</span>
              <button
                type="button"
                className="ed-btn-ghost"
                style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => onRefChange(null)}
              >
                Detach to literal value
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
