"use client";

import { IconComponents, IconPencil } from "@tabler/icons-react";
import type { DesignToken } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

const SECTIONS: { group: string; label: string }[] = [
  { group: "button", label: "Buttons" },
  { group: "input", label: "Inputs" },
  { group: "badge", label: "Badges" },
  { group: "avatar", label: "Avatars" },
  { group: "card", label: "Cards" },
  { group: "nav", label: "Nav" },
  { group: "sidebar", label: "Sidebar" },
  { group: "toggle", label: "Toggles" },
];

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function rangeFor(token: DesignToken): { min: number; max: number } {
  if (token.group === "sidebar") return { min: 160, max: 360 };
  if (token.group === "nav") return { min: 40, max: 80 };
  if (token.group === "toggle") return { min: 12, max: 56 };
  if (token.id.includes("font")) return { min: 9, max: 16 };
  if (token.group === "avatar") return { min: 20, max: 72 };
  if (token.group === "badge") return { min: 16, max: 32 };
  return { min: 24, max: 64 };
}

/** Expandable component-dimension tokens — same card pattern as spacing/radius. */
export function ComponentCardsPanel() {
  const { state, selectComponent, updateTokenField } = useTokenStore();
  const selectedId = state.selectedComponentId;

  return (
    <div>
      <div className="ed-section-lbl">Component tokens</div>
      {SECTIONS.map(({ group, label }) => {
        const tokens = state.component.filter((t) => t.group === group);
        if (!tokens.length) return null;
        return (
          <div key={group}>
            <div className="ed-section-lbl" style={{ marginTop: 12 }}>
              {label}
            </div>
            {tokens.map((token) => (
              <ComponentCard
                key={token.id}
                token={token}
                active={token.id === selectedId}
                onSelect={() => selectComponent(token.id)}
                onUpdate={(value) =>
                  updateTokenField("component", token.id, "value", value)
                }
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ComponentCard({
  token,
  active,
  onSelect,
  onUpdate,
}: {
  token: DesignToken;
  active: boolean;
  onSelect: () => void;
  onUpdate: (value: string) => void;
}) {
  const n = parsePx(token.value);
  const { min, max } = rangeFor(token);

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
          <IconComponents size={14} style={{ color: "var(--ed-text-muted)" }} />
        </div>
        <div className="ed-tc-info">
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{token.value}</div>
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
              onChange={(e) => onUpdate(`${Number(e.target.value)}px`)}
            />
            <input
              className="ed-rng-inp"
              type="range"
              min={min}
              max={max}
              value={Math.min(Math.max(n, min), max)}
              onChange={(e) => onUpdate(`${Number(e.target.value)}px`)}
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
            <span className="ed-exp-lbl">Used by</span>
            <div className="ed-alias-chips">
              {(token.usedBy.length ? token.usedBy : [token.group]).map((u) => (
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
