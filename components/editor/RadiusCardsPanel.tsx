"use client";

import { IconPencil } from "@tabler/icons-react";
import type { BorderRadiusToken } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function formatValue(n: number, id: string): string {
  if (id === "radius-full") return "9999px";
  if (id === "radius-none" || n === 0) return "0";
  return `${n}px`;
}

function displayPill(value: string, id: string): string {
  if (id === "radius-full" || parsePx(value) >= 9999) return "pill";
  return value === "0" ? "0px" : value;
}

/** Expandable radius cards — HTML mock pattern */
export function RadiusCardsPanel() {
  const { state, selectRadius, updateTokenField } = useTokenStore();
  const selectedId = state.selectedRadiusId;

  return (
    <div>
      <div className="ed-section-lbl">Radius tokens</div>
      {state.radius.map((token) => (
        <RadiusCard
          key={token.id}
          token={token}
          active={token.id === selectedId}
          onSelect={() => selectRadius(token.id)}
          onUpdate={(value) =>
            updateTokenField("radius", token.id, "value", value)
          }
        />
      ))}
    </div>
  );
}

function RadiusCard({
  token,
  active,
  onSelect,
  onUpdate,
}: {
  token: BorderRadiusToken;
  active: boolean;
  onSelect: () => void;
  onUpdate: (value: string) => void;
}) {
  const locked = token.id === "radius-full";
  const n = parsePx(token.value);
  const previewR = Math.min(n >= 9999 ? 13 : n, 13);

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
              height: 26,
              background: "var(--ed-primary)",
              borderRadius: previewR,
            }}
          />
        </div>
        <div className="ed-tc-info">
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{token.alias}</div>
        </div>
        <div className="ed-tc-badges">
          <span className="ed-val-pill">{displayPill(token.value, token.id)}</span>
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
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Value</span>
            <input
              className="ed-num-inp"
              type="number"
              value={locked ? 9999 : n}
              min={0}
              max={locked ? 9999 : 40}
              disabled={locked}
              onChange={(e) => {
                if (locked) return;
                onUpdate(formatValue(Number(e.target.value), token.id));
              }}
            />
            <input
              className="ed-rng-inp"
              type="range"
              min={0}
              max={locked ? 9999 : 40}
              value={locked ? 9999 : n}
              disabled={locked}
              onChange={(e) => {
                if (locked) return;
                onUpdate(formatValue(Number(e.target.value), token.id));
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "var(--ed-text-muted)",
                fontFamily: "var(--ed-mono)",
                width: 26,
              }}
            >
              px
            </span>
          </div>
          {locked && (
            <p
              style={{
                fontSize: 11,
                color: "var(--ed-text-muted)",
                margin: 0,
                paddingLeft: 60,
              }}
            >
              Full radius is locked at 9999px (pill).
            </p>
          )}
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Used by</span>
            <div className="ed-alias-chips">
              {(token.usedBy.length
                ? token.usedBy
                : ["button.radius", "card.radius", "input.radius"]
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
