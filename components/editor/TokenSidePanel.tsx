"use client";

import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useMemo, useRef, useState } from "react";
import { FontSourceBadge } from "@/components/FontSourceBadge";
import { AddColorTokenPopover } from "@/components/editor/AddColorTokenPopover";
import { COLOR_CATEGORY_META } from "@/lib/config/recommendedColorTokens";
import { useTokenStore } from "@/stores/tokenStore";
import type { TypographyToken } from "@/types/tokens";

const GROUP_LABELS = COLOR_CATEGORY_META.map(({ key, label }) => ({
  key,
  label,
}));

const CAT_TITLES: Record<string, string> = {
  color: "Colors",
  typography: "Typography",
  spacing: "Spacing",
  radius: "Radius",
  shadow: "Shadows",
  themes: "Themes",
  components: "Components",
};

/** Always-on left token list — HTML mock layout. */
export function TokenSidePanel() {
  const {
    colorsByGroup,
    state,
    selectColor,
    selectTypography,
    selectSpacing,
    selectRadius,
    selectShadow,
    selectTheme,
    selectComponent,
    setActiveCategory,
  } = useTokenStore();
  const [filter, setFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const category = state.activeCategory;
  const q = filter.trim().toLowerCase();

  const colorGroups = useMemo(() => {
    return GROUP_LABELS.map(({ key, label }) => {
      const tokens = (colorsByGroup[key] ?? []).filter(
        (t) => !q || t.name.toLowerCase().includes(q)
      );
      return { key, label, tokens };
    }).filter((g) => g.tokens.length > 0);
  }, [colorsByGroup, q]);

  const otherTokens = useMemo(() => {
    if (category === "color") return [];
    if (category === "themes") {
      return state.theme
        .filter((t) => !q || t.name.toLowerCase().includes(q))
        .map((t) => ({
          id: t.id,
          name: t.name,
          value: t.baseMode,
          refOf: undefined as string | undefined,
        }));
    }
    const map: Record<
      string,
      {
        id: string;
        name: string;
        value: string;
        refOf?: string;
        source?: TypographyToken["source"];
        embedStatus?: TypographyToken["embedStatus"];
        embedCode?: string;
        resolvedFamily?: string;
      }[]
    > = {
      typography: state.typography,
      spacing: state.spacing,
      radius: state.radius,
      shadow: state.shadow,
      components: state.component,
    };
    return (map[category] ?? []).filter(
      (t) => !q || t.name.toLowerCase().includes(q)
    );
  }, [category, state, q]);

  return (
    <aside className="ed-token-panel">
      <div className="ed-tp-head">
        <span className="ed-tp-title">{CAT_TITLES[category] ?? "Tokens"}</span>
        <div className="ed-tp-add-wrap">
          <button
            ref={addBtnRef}
            type="button"
            className="ed-icon-btn"
            style={{ width: 24, height: 24 }}
            aria-label="Add token"
            aria-haspopup="dialog"
            aria-expanded={addOpen}
            disabled={category !== "color"}
            title={
              category === "color"
                ? "Add a recommended or custom color token"
                : "Add token is available for Colors"
            }
            onClick={() => {
              if (category !== "color") return;
              setAddOpen((v) => !v);
            }}
          >
            <IconPlus size={14} />
          </button>
          <AddColorTokenPopover
            open={addOpen && category === "color"}
            onClose={() => setAddOpen(false)}
            anchorRef={addBtnRef}
          />
        </div>
      </div>
      <div className="ed-tp-search">
        <IconSearch size={12} style={{ color: "var(--ed-text-muted)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Filter tokens…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="ed-token-list">
        {category === "color" ? (
          colorGroups.length === 0 ? (
            <div className="ed-tp-empty">No tokens match your search.</div>
          ) : (
            colorGroups.map(({ key, label, tokens }) => (
              <div key={key}>
                <div className="ed-token-group-label">{label}</div>
                {tokens.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    className={`ed-tp-item${state.selectedColorId === token.id ? " sel" : ""}`}
                    onClick={() => {
                      setActiveCategory("color");
                      selectColor(token.id);
                    }}
                  >
                    <span
                      className="ed-tok-dot"
                      style={{ background: token.value }}
                    />
                    <span className="ed-tok-label">
                      {token.name.split(".").pop()}
                    </span>
                    <span className="ed-tok-hex">
                      {token.refOf
                        ? `→ ${token.refOf}`
                        : token.gradient
                          ? `${token.gradient.angle}°`
                          : token.value.startsWith("#")
                            ? token.value.slice(0, 7)
                            : token.value.slice(0, 9)}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )
        ) : otherTokens.length === 0 ? (
          <div className="ed-tp-empty">No tokens match your search.</div>
        ) : (
          otherTokens.map((token) => {
            const selected =
              (category === "typography" &&
                state.selectedTypographyId === token.id) ||
              (category === "spacing" && state.selectedSpacingId === token.id) ||
              (category === "radius" && state.selectedRadiusId === token.id) ||
              (category === "shadow" && state.selectedShadowId === token.id) ||
              (category === "themes" && state.selectedThemeId === token.id) ||
              (category === "components" &&
                state.selectedComponentId === token.id);
            return (
              <button
                key={token.id}
                type="button"
                className={`ed-tp-item${selected ? " sel" : ""}`}
                onClick={() => {
                  setActiveCategory(category);
                  if (category === "typography") {
                    selectTypography(token.id);
                  } else if (category === "spacing") {
                    selectSpacing(token.id);
                  } else if (category === "radius") {
                    selectRadius(token.id);
                  } else if (category === "shadow") {
                    selectShadow(token.id);
                  } else if (category === "themes") {
                    selectTheme(token.id);
                  } else if (category === "components") {
                    selectComponent(token.id);
                  }
                }}
              >
                <span className="ed-tok-label">
                  {token.name.split(".").pop()}
                </span>
                {category === "typography" &&
                "source" in token &&
                token.source === "embed" ? (
                  <FontSourceBadge
                    token={token}
                    variant="icon"
                    className="ed-tok-hex-badge"
                  />
                ) : (
                  <span className="ed-tok-hex">
                    {token.refOf
                      ? `→ ${token.refOf}`
                      : String(token.value).slice(0, 9)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
