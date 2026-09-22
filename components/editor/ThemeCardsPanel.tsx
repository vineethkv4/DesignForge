"use client";

import { useMemo, useState } from "react";
import {
  autoFlip,
  resolveThemeToken,
  themeSemanticGroup,
} from "@/lib/themeResolve";
import {
  CORE_THEME_SEMANTICS,
  type CoreThemeSemantic,
  type ThemeMode,
} from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

function isHex(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v.trim());
}

const SEMANTIC_GROUPS = [
  "background",
  "surface",
  "text",
  "border",
  "icon",
  "interactive",
] as const;

/**
 * Themes → Tokens tab: theme list + every CORE_THEME_SEMANTICS entry
 * with resolved value and auto / overridden badge.
 */
export function ThemeCardsPanel() {
  const {
    state,
    selectedTheme,
    selectTheme,
    addTheme,
    setThemeOverride,
    resetCategory,
  } = useTokenStore();

  const [newName, setNewName] = useState("");
  const [newMode, setNewMode] = useState<ThemeMode>("light");
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return SEMANTIC_GROUPS.map((group) => ({
      group,
      label: themeSemanticGroup(group),
      tokens: CORE_THEME_SEMANTICS.filter((t) => t.startsWith(`${group}.`)),
    })).filter((g) => g.tokens.length > 0);
  }, []);

  if (state.theme.length === 0) {
    return (
      <div>
        <div className="ed-section-lbl">Themes</div>
        <p
          style={{
            fontSize: 12,
            color: "var(--ed-text-muted)",
            marginBottom: 12,
          }}
        >
          No themes yet. Reset to restore Light, Dark, and High Contrast.
        </p>
        <button
          type="button"
          className="ed-btn-ghost"
          style={{ fontSize: 12, padding: "6px 12px" }}
          onClick={() => resetCategory("theme")}
        >
          Reset themes
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="ed-section-lbl">Themes</div>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 12,
          color: "var(--ed-text-muted)",
          lineHeight: 1.45,
          maxWidth: 460,
        }}
      >
        Light and Dark auto-flip neutrals. High Contrast rides light mode and
        boosts borders/text via overrides only. Select a theme, then edit
        semantics below.
      </p>

      {state.theme.map((theme) => (
        <div
          key={theme.id}
          className={`ed-tok-card${
            theme.id === state.selectedThemeId ? " active" : ""
          }`}
          data-token-id={theme.id}
        >
          <div
            className="ed-tc-top"
            role="button"
            tabIndex={0}
            onClick={() => selectTheme(theme.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectTheme(theme.id);
              }
            }}
          >
            <div
              className="ed-tc-swatch"
              style={{
                background: resolveThemeToken(
                  "surface.base",
                  theme,
                  state.color
                ),
                border: `1px solid ${resolveThemeToken(
                  "border.default",
                  theme,
                  state.color
                )}`,
              }}
            />
            <div className="ed-tc-info">
              <div className="ed-tc-name">{theme.name}</div>
              <div className="ed-tc-var">{theme.baseMode} mode</div>
            </div>
            <div className="ed-tc-badges">
              <span className="ed-val-pill">
                {Object.keys(theme.overrides).length} overrides
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="ed-section-lbl" style={{ marginTop: 18 }}>
        Add theme
      </div>
      <div className="ed-exp-row" style={{ marginBottom: 16 }}>
        <input
          className="ed-num-inp"
          placeholder="Theme name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          aria-label="New theme name"
        />
        <select
          className="ed-sel-inp"
          value={newMode}
          onChange={(e) => setNewMode(e.target.value as ThemeMode)}
          aria-label="Base mode"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <button
          type="button"
          className="ed-btn-ghost"
          style={{ fontSize: 12, padding: "4px 10px" }}
          disabled={!newName.trim()}
          onClick={() => {
            addTheme(newName.trim(), newMode);
            setNewName("");
          }}
        >
          Add
        </button>
      </div>

      {selectedTheme && (
        <>
          <div className="ed-section-lbl">
            Tokens · {selectedTheme.name}
          </div>
          {grouped.map(({ group, label, tokens }) => (
            <div key={group}>
              <div className="ed-section-lbl" style={{ marginTop: 10 }}>
                {label}
              </div>
              {tokens.map((tokenName) => (
                <ThemeSemanticCard
                  key={tokenName}
                  tokenName={tokenName}
                  themeName={selectedTheme.name}
                  baseMode={selectedTheme.baseMode}
                  resolved={resolveThemeToken(
                    tokenName,
                    selectedTheme,
                    state.color
                  )}
                  auto={autoFlip(
                    tokenName,
                    selectedTheme.baseMode,
                    state.color
                  )}
                  overrideValue={selectedTheme.overrides[tokenName]}
                  active={expandedToken === tokenName}
                  onSelect={() =>
                    setExpandedToken((cur) =>
                      cur === tokenName ? null : tokenName
                    )
                  }
                  onOverride={(value) => setThemeOverride(tokenName, value)}
                />
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function ThemeSemanticCard({
  tokenName,
  themeName,
  baseMode,
  resolved,
  auto,
  overrideValue,
  active,
  onSelect,
  onOverride,
}: {
  tokenName: CoreThemeSemantic;
  themeName: string;
  baseMode: ThemeMode;
  resolved: string;
  auto: string;
  overrideValue: string | undefined;
  active: boolean;
  onSelect: () => void;
  onOverride: (value: string | null) => void;
}) {
  const hasOverride = overrideValue != null && overrideValue !== "";

  return (
    <div
      className={`ed-tok-card${active ? " active" : ""}`}
      data-token-id={tokenName}
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
          style={{
            background: resolved,
            border: "0.5px solid var(--ed-border)",
          }}
        />
        <div className="ed-tc-info">
          <div className="ed-tc-name">{tokenName}</div>
          <div className="ed-tc-var">{resolved}</div>
        </div>
        <div className="ed-tc-badges">
          <span className={`ed-val-pill${hasOverride ? " ed-val-pill--warn" : ""}`}>
            {hasOverride ? "overridden" : "auto"}
          </span>
        </div>
      </div>

      {active && (
        <div className="ed-tc-expanded">
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Theme</span>
            <span className="ed-alias-text">
              {themeName} · {baseMode}
            </span>
          </div>
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Resolved</span>
            <div
              className="ed-exp-swatch"
              style={{ background: resolved, cursor: "default" }}
            />
            <input
              className="ed-hex-inp"
              value={resolved}
              readOnly={!hasOverride}
              spellCheck={false}
              aria-label={`${tokenName} value`}
              onChange={(e) => {
                if (!hasOverride) return;
                const v = e.target.value;
                onOverride(v || null);
              }}
            />
            {!hasOverride && <span className="ed-ref-hint">from {baseMode}</span>}
          </div>
          {hasOverride ? (
            <>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Override</span>
                <input
                  className="ed-hex-inp"
                  value={overrideValue ?? ""}
                  spellCheck={false}
                  aria-label={`Override ${tokenName}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || isHex(v) || v.startsWith("rgba")) {
                      onOverride(v || null);
                    } else {
                      onOverride(v);
                    }
                  }}
                />
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Mode</span>
                <button
                  type="button"
                  className="ed-btn-ghost"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                  onClick={() => onOverride(null)}
                >
                  Reset to auto ({baseMode})
                </button>
              </div>
            </>
          ) : (
            <div className="ed-exp-row">
              <span className="ed-exp-lbl">Mode</span>
              <button
                type="button"
                className="ed-btn-ghost"
                style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => onOverride(auto)}
              >
                Override with custom value
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
