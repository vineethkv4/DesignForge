"use client";

import {
  IconAlertTriangle,
  IconBorderAll,
  IconChartBar,
  IconClick,
  IconIcons,
  IconLayersIntersect,
  IconLayoutBoard,
  IconPalette,
  IconPlus,
  IconSearch,
  IconTypography,
  IconX,
} from "@tabler/icons-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  getWcagLevel,
  generateScaleFromAnchor,
  isValidHex,
  resolveColorValue,
} from "@/lib/colorScale";
import {
  COLOR_CATEGORY_META,
  RECOMMENDED_COLOR_TOKENS,
  isRecommendedTokenPresent,
  resolveRefTargetId,
  slugifyTokenLabel,
  type RecommendedColorToken,
} from "@/lib/config/recommendedColorTokens";
import type { ColorToken, ColorTokenGroup } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

type Mode = "reference" | "value";

const CATEGORY_ICONS: Record<(typeof COLOR_CATEGORY_META)[number]["icon"], ReactNode> = {
  palette: <IconPalette size={13} />,
  layout: <IconLayoutBoard size={13} />,
  typography: <IconTypography size={13} />,
  border: <IconBorderAll size={13} />,
  icons: <IconIcons size={13} />,
  alert: <IconAlertTriangle size={13} />,
  click: <IconClick size={13} />,
  layers: <IconLayersIntersect size={13} />,
  chart: <IconChartBar size={13} />,
};

function buildFromRecommendation(
  entry: RecommendedColorToken,
  colors: ColorToken[],
  mode: Mode,
  refOf: string | null,
  solidValue: string
): ColorToken {
  const preferRef = mode === "reference";
  const targetId = preferRef
    ? resolveRefTargetId(refOf ?? entry.defaultRefOf, colors)
    : null;

  if (targetId) {
    const target = colors.find((c) => c.id === targetId)!;
    const resolved = resolveColorValue(
      {
        id: entry.id,
        name: entry.name,
        value: solidValue,
        alias: target.name.replace(/^color\./, ""),
        wcag: "aa",
        group: entry.category,
        usedBy: [],
        refOf: targetId,
      },
      colors
    );
    return {
      id: entry.id,
      name: entry.name,
      value: resolved,
      alias: target.name.replace(/^color\./, ""),
      wcag: getWcagLevel(resolved),
      group: entry.category,
      usedBy: [],
      refOf: targetId,
    };
  }

  const value = isValidHex(solidValue) || solidValue.startsWith("rgba")
    ? solidValue
    : entry.defaultValue;

  const token: ColorToken = {
    id: entry.id,
    name: entry.name,
    value,
    alias: entry.label.toLowerCase().replace(/\s+/g, "."),
    wcag: getWcagLevel(value),
    group: entry.category,
    usedBy: [],
  };

  // Foundation hues get a full scale so gradients can read 500 / 600.
  if (
    entry.id === "primary" ||
    entry.id === "secondary" ||
    entry.id === "tertiary" ||
    entry.id === "brand" ||
    entry.id === "accent"
  ) {
    const hex = value.startsWith("#") ? value.slice(0, 7) : entry.defaultValue;
    if (isValidHex(hex)) {
      token.scale = generateScaleFromAnchor(hex);
      token.value = hex;
    }
  }
  return token;
}

interface AddColorTokenPopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function AddColorTokenPopover({
  open,
  onClose,
  anchorRef,
}: AddColorTokenPopoverProps) {
  const { state, addColor } = useTokenStore();
  const colors = state.color;
  const listId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [customGroup, setCustomGroup] = useState<ColorTokenGroup>("semantic");
  const [customMode, setCustomMode] = useState<Mode>("reference");
  const [customRefOf, setCustomRefOf] = useState("primary");
  const [customValue, setCustomValue] = useState("#4F4DFF");

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RECOMMENDED_COLOR_TOKENS.filter(
      (entry) =>
        !isRecommendedTokenPresent(entry, colors) &&
        (!q ||
          entry.label.toLowerCase().includes(q) ||
          entry.name.toLowerCase().includes(q) ||
          entry.category.includes(q) ||
          entry.description.toLowerCase().includes(q))
    );
  }, [colors, query]);

  const grouped = useMemo(() => {
    return COLOR_CATEGORY_META.map((meta) => ({
      ...meta,
      tokens: available.filter((t) => t.category === meta.key),
    })).filter((g) => g.tokens.length > 0);
  }, [available]);

  const flatItems = useMemo(() => {
    const items: { kind: "token"; entry: RecommendedColorToken }[] = [];
    for (const g of grouped) {
      for (const entry of g.tokens) items.push({ kind: "token", entry });
    }
    return items;
  }, [grouped]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    setCustomOpen(false);
    setCustomLabel("");
    setCustomMode("reference");
    setCustomRefOf(colors.find((c) => c.id === "primary") ? "primary" : colors[0]?.id ?? "");
    setCustomValue("#4F4DFF");
    const place = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 16);
      // Right-align under the + button so the menu sits beside it in the left rail.
      let left = r.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      const top = Math.min(r.bottom + 6, window.innerHeight - 24);
      setCoords({ top, left, width });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, colors, anchorRef]);

  useEffect(() => {
    if (activeIndex >= flatItems.length) {
      setActiveIndex(Math.max(0, flatItems.length - 1));
    }
  }, [activeIndex, flatItems.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const pop = document.getElementById(listId);
      if (pop?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (customOpen) setCustomOpen(false);
        else onClose();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, listId, anchorRef, customOpen]);

  const commitRecommended = useCallback(
    (entry: RecommendedColorToken) => {
      const preferRef = entry.defaultRefOf != null;
      const mode: Mode = preferRef ? "reference" : "value";
      const token = buildFromRecommendation(
        entry,
        colors,
        mode,
        entry.defaultRefOf,
        entry.defaultValue
      );
      // If reference preferred but no target exists, still create as solid.
      if (addColor(token)) onClose();
    },
    [addColor, colors, onClose]
  );

  const commitCustom = useCallback(() => {
    const label = customLabel.trim();
    if (!label) return;
    const base = slugifyTokenLabel(label);
    let id = base;
    let n = 2;
    while (colors.some((c) => c.id === id)) {
      id = `${base}-${n++}`;
    }
    const name = `color.${customGroup === "semantic" ? id : `${customGroup}.${id.replace(new RegExp(`^${customGroup}-`), "")}`}`;
    const entry: RecommendedColorToken = {
      id,
      name,
      label,
      category: customGroup,
      description: "Custom semantic color token.",
      defaultRefOf: customMode === "reference" ? customRefOf : null,
      defaultValue: customValue,
    };
    const token = buildFromRecommendation(
      entry,
      colors,
      customMode,
      customRefOf,
      customValue
    );
    if (addColor(token)) onClose();
  }, [
    addColor,
    colors,
    customGroup,
    customLabel,
    customMode,
    customRefOf,
    customValue,
    onClose,
  ]);

  const onListKeyDown = (e: KeyboardEvent) => {
    if (customOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flatItems.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) commitRecommended(item.entry);
    }
  };

  if (!open || !coords) return null;

  let runningIndex = -1;

  return (
    <div
      id={listId}
      className="ed-add-popover"
      role="dialog"
      aria-label="Add color token"
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
      }}
      onKeyDown={onListKeyDown}
    >
      <div className="ed-add-popover-head">
        <span>Add color token</span>
        <button
          type="button"
          className="ed-icon-btn"
          style={{ width: 24, height: 24 }}
          aria-label="Close"
          onClick={onClose}
        >
          <IconX size={14} />
        </button>
      </div>

      {!customOpen ? (
        <>
          <div className="ed-add-search">
            <IconSearch size={12} />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search recommended tokens…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              aria-controls={`${listId}-list`}
            />
          </div>

          <div className="ed-add-list" id={`${listId}-list`} role="listbox">
            {grouped.length === 0 ? (
              <div className="ed-add-empty">
                {query
                  ? "No matching tokens. Create a custom token below."
                  : "All recommended tokens are already in your system."}
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.key} className="ed-add-group">
                  <div className="ed-add-group-label">
                    <span className="ed-add-group-icon" aria-hidden>
                      {CATEGORY_ICONS[group.icon]}
                    </span>
                    {group.label}
                  </div>
                  {group.tokens.map((entry) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const refHint = resolveRefTargetId(entry.defaultRefOf, colors);
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        role="option"
                        aria-selected={idx === activeIndex}
                        title={entry.description}
                        className={`ed-add-item${idx === activeIndex ? " active" : ""}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => commitRecommended(entry)}
                      >
                        <span className="ed-add-item-main">
                          <span className="ed-add-item-label">{entry.label}</span>
                          <span className="ed-add-item-name">{entry.name}</span>
                        </span>
                        <span className="ed-add-item-meta">
                          {refHint ? `→ ${refHint}` : "value"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="ed-add-custom-btn"
            onClick={() => setCustomOpen(true)}
          >
            <IconPlus size={14} />
            Create Custom Token
          </button>
        </>
      ) : (
        <div className="ed-add-custom">
          <p className="ed-add-custom-hint">
            Prefer a token reference whenever you can — it keeps the system
            consistent when Primary (or another foundation) changes.
          </p>
          <label className="ed-add-field">
            <span>Name</span>
            <input
              className="ed-hex-inp"
              value={customLabel}
              placeholder="e.g. Navigation Active"
              onChange={(e) => setCustomLabel(e.target.value)}
              autoFocus
            />
          </label>
          <label className="ed-add-field">
            <span>Category</span>
            <select
              className="ed-sel-inp"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value as ColorTokenGroup)}
            >
              {COLOR_CATEGORY_META.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="ed-add-mode">
            <button
              type="button"
              className={customMode === "reference" ? "active" : ""}
              onClick={() => setCustomMode("reference")}
            >
              Token reference
            </button>
            <button
              type="button"
              className={customMode === "value" ? "active" : ""}
              onClick={() => setCustomMode("value")}
            >
              Color value
            </button>
          </div>
          {customMode === "reference" ? (
            <label className="ed-add-field">
              <span>References</span>
              <select
                className="ed-sel-inp"
                value={customRefOf}
                onChange={(e) => setCustomRefOf(e.target.value)}
              >
                {colors
                  .filter((c) => !c.gradient)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <label className="ed-add-field">
              <span>Hex / rgba</span>
              <input
                className="ed-hex-inp"
                value={customValue}
                spellCheck={false}
                onChange={(e) => setCustomValue(e.target.value)}
              />
            </label>
          )}
          <div className="ed-add-custom-actions">
            <button
              type="button"
              className="ed-btn-ghost"
              onClick={() => setCustomOpen(false)}
            >
              Back
            </button>
            <button
              type="button"
              className="ed-btn-primary"
              disabled={!customLabel.trim()}
              onClick={commitCustom}
            >
              Add token
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
