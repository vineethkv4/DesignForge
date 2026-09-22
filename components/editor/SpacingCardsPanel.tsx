"use client";

import { IconArrowsMove, IconPencil } from "@tabler/icons-react";
import type { SpacingToken } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

const SECTIONS: { group: SpacingToken["group"]; label: string }[] = [
  { group: "base", label: "Base unit" },
  { group: "scale", label: "Spacing scale" },
];

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function sizeRange(id: string): { min: number; max: number } {
  if (id === "spacing-base") return { min: 1, max: 16 };
  if (id === "space-1") return { min: 0, max: 16 };
  if (id === "space-2") return { min: 0, max: 24 };
  if (id === "space-3") return { min: 0, max: 32 };
  if (id === "space-4") return { min: 0, max: 40 };
  if (id === "space-5") return { min: 0, max: 48 };
  if (id === "space-6") return { min: 0, max: 56 };
  if (id === "space-8") return { min: 0, max: 72 };
  if (id === "space-10") return { min: 0, max: 88 };
  if (id === "space-12") return { min: 0, max: 104 };
  if (id === "space-16") return { min: 0, max: 140 };
  return { min: 0, max: 160 };
}

/** Expandable spacing cards — HTML mock pattern */
export function SpacingCardsPanel() {
  const { state, selectSpacing, updateTokenField, updateSpacingBase } =
    useTokenStore();
  const selectedId = state.selectedSpacingId;

  return (
    <div>
      <div className="ed-section-lbl">Spacing tokens</div>
      {SECTIONS.map(({ group, label }) => {
        const tokens = state.spacing.filter((t) => t.group === group);
        if (!tokens.length) return null;
        return (
          <div key={group}>
            <div className="ed-section-lbl" style={{ marginTop: 12 }}>
              {label}
            </div>
            {tokens.map((token) => (
              <SpacingCard
                key={token.id}
                token={token}
                active={token.id === selectedId}
                onSelect={() => selectSpacing(token.id)}
                onUpdate={(value) => {
                  if (token.id === "spacing-base") {
                    updateSpacingBase(value);
                  } else {
                    updateTokenField("spacing", token.id, "value", value);
                  }
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SpacingCard({
  token,
  active,
  onSelect,
  onUpdate,
}: {
  token: SpacingToken;
  active: boolean;
  onSelect: () => void;
  onUpdate: (value: string) => void;
}) {
  const n = parsePx(token.value);
  const { min, max } = sizeRange(token.id);
  const barWidth = Math.min(Math.max(n, 2), 72);

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
          <IconArrowsMove size={15} style={{ color: "var(--ed-primary)" }} />
        </div>
        <div className="ed-tc-info">
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{token.alias}</div>
        </div>
        <div className="ed-tc-badges">
          <span className="ed-val-pill">{token.value}</span>
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
              value={n}
              min={min}
              max={max}
              onChange={(e) => onUpdate(`${e.target.value}px`)}
            />
            <input
              className="ed-rng-inp"
              type="range"
              min={min}
              max={max}
              value={n}
              onChange={(e) => onUpdate(`${e.target.value}px`)}
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
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Bar</span>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: "var(--ed-surface2)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: barWidth,
                  height: "100%",
                  borderRadius: 4,
                  background: "var(--ed-primary)",
                  transition: "width 0.15s",
                }}
              />
            </div>
          </div>
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Used by</span>
            <div className="ed-alias-chips">
              {(token.usedBy.length
                ? token.usedBy
                : ["stack.gap", "card.padding", "section.margin"]
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
