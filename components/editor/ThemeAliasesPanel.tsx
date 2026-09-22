"use client";

import {
  autoFlip,
  resolveThemeToken,
  themeSemanticGroup,
} from "@/lib/themeResolve";
import { CORE_THEME_SEMANTICS } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

/**
 * Themes → Aliases tab: per semantic, show the active theme and the
 * baseMode auto-flip fallback when not overridden (Colors refOf pattern,
 * adapted to mode fallback instead of a token/scale target).
 */
export function ThemeAliasesPanel() {
  const { state, selectedTheme, selectTheme, setThemeOverride } =
    useTokenStore();

  if (!selectedTheme) {
    return (
      <div>
        <div className="ed-section-lbl">Aliases</div>
        <p style={{ fontSize: 12, color: "var(--ed-text-muted)" }}>
          Select a theme to inspect baseMode fallbacks.
        </p>
      </div>
    );
  }

  const aliased = CORE_THEME_SEMANTICS.filter(
    (name) =>
      selectedTheme.overrides[name] != null &&
      selectedTheme.overrides[name] !== ""
  );
  const autos = CORE_THEME_SEMANTICS.filter(
    (name) =>
      selectedTheme.overrides[name] == null ||
      selectedTheme.overrides[name] === ""
  );

  return (
    <div>
      <div className="ed-section-lbl">Aliases · {selectedTheme.name}</div>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "var(--ed-text-muted)",
          lineHeight: 1.45,
          maxWidth: 460,
        }}
      >
        When not overridden, each semantic resolves from{" "}
        <code>baseMode: {selectedTheme.baseMode}</code> auto-flip — the theme
        equivalent of a Colors <code>refOf</code> target.
      </p>

      <div className="ed-exp-row" style={{ marginBottom: 14 }}>
        <span className="ed-exp-lbl">Theme</span>
        <select
          className="ed-sel-inp"
          value={selectedTheme.id}
          onChange={(e) => selectTheme(e.target.value)}
          aria-label="Theme being edited"
        >
          {state.theme.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.baseMode})
            </option>
          ))}
        </select>
      </div>

      {aliased.length > 0 && (
        <>
          <div className="ed-section-lbl">Overridden</div>
          {aliased.map((tokenName) => {
            const resolved = resolveThemeToken(
              tokenName,
              selectedTheme,
              state.color
            );
            const fallback = autoFlip(
              tokenName,
              selectedTheme.baseMode,
              state.color
            );
            return (
              <div
                key={tokenName}
                className="ed-tok-card active"
                data-token-id={tokenName}
              >
                <div className="ed-tc-top">
                  <div
                    className="ed-tc-swatch"
                    style={{ background: resolved }}
                  />
                  <div className="ed-tc-info">
                    <div className="ed-tc-name">{tokenName}</div>
                    <div className="ed-tc-var">
                      {themeSemanticGroup(tokenName)} · overridden
                    </div>
                  </div>
                  <div className="ed-tc-badges">
                    <span className="ed-val-pill">manual</span>
                  </div>
                </div>
                <div className="ed-tc-expanded">
                  <div className="ed-exp-row">
                    <span className="ed-exp-lbl">Value</span>
                    <input
                      className="ed-hex-inp"
                      value={resolved}
                      readOnly
                      spellCheck={false}
                    />
                  </div>
                  <div className="ed-exp-row">
                    <span className="ed-exp-lbl">Fallback</span>
                    <span className="ed-alias-text">
                      → {selectedTheme.baseMode} auto ({fallback})
                    </span>
                  </div>
                  <div className="ed-exp-row">
                    <span className="ed-exp-lbl">Mode</span>
                    <button
                      type="button"
                      className="ed-btn-ghost"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => setThemeOverride(tokenName, null)}
                    >
                      Detach to {selectedTheme.baseMode} auto
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="ed-section-lbl" style={{ marginTop: aliased.length ? 18 : 0 }}>
        Auto ({selectedTheme.baseMode})
      </div>
      {autos.map((tokenName) => {
        const resolved = resolveThemeToken(
          tokenName,
          selectedTheme,
          state.color
        );
        return (
          <div key={tokenName} className="ed-tok-card" data-token-id={tokenName}>
            <div className="ed-tc-top">
              <div className="ed-tc-swatch" style={{ background: resolved }} />
              <div className="ed-tc-info">
                <div className="ed-tc-name">{tokenName}</div>
                <div className="ed-tc-var">{resolved}</div>
              </div>
              <div className="ed-tc-badges">
                <span className="ed-val-pill">→ {selectedTheme.baseMode}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
