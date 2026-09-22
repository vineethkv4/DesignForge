"use client";

import { useEffect, useState } from "react";
import {
  IconLetterSpacing,
  IconLineHeight,
  IconPencil,
  IconTextSize,
} from "@tabler/icons-react";
import { FontSourceBadge } from "@/components/FontSourceBadge";
import {
  DEFAULT_EMBED_FALLBACK_STACK,
  parseFontEmbed,
} from "@/lib/fontEmbedParser";
import { sanitizeParsedEmbed } from "@/lib/fontEmbedSanitizer";
import type { InjectableFontEmbed } from "@/lib/fontInjector";
import { injectFontEmbed, removeFontEmbed } from "@/lib/fontInjector";
import type { TypographyToken } from "@/types/tokens";
import { useTokenStore } from "@/stores/tokenStore";

const SECTIONS: { group: TypographyToken["group"]; label: string }[] = [
  { group: "family", label: "Font families" },
  { group: "size", label: "Font sizes" },
  { group: "weight", label: "Font weights" },
  { group: "lineHeight", label: "Line height" },
  { group: "letterSpacing", label: "Letter spacing" },
];

const FAMILY_OPTIONS = [
  "Inter, system-ui, -apple-system, sans-serif",
  "Inter Tight, system-ui, sans-serif",
  "Plus Jakarta Sans, system-ui, sans-serif",
  "DM Sans, system-ui, sans-serif",
  "Georgia, 'Times New Roman', serif",
  "ui-monospace, 'Cascadia Code', monospace",
  "JetBrains Mono, monospace",
];

const WEIGHTS = [300, 400, 500, 600, 700];

function sizeRange(id: string): { min: number; max: number } {
  if (id === "text-5xl") return { min: 8, max: 96 };
  if (id === "text-3xl") return { min: 8, max: 72 };
  if (id === "text-2xl") return { min: 8, max: 64 };
  return { min: 8, max: 48 };
}

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 16;
}

function familyLabel(value: string): string {
  return value.split(",")[0]?.replace(/['"]/g, "").trim() || value;
}

function PreviewChip({ token }: { token: TypographyToken }) {
  if (token.group === "family") {
    return (
      <span
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "var(--ed-text)",
          fontFamily: token.value,
        }}
      >
        Aa
      </span>
    );
  }
  if (token.group === "size") {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--ed-primary)",
          fontFamily: "var(--ed-mono)",
        }}
      >
        {parseInt(token.value, 10) || "—"}
      </span>
    );
  }
  if (token.group === "weight") {
    return (
      <span style={{ fontWeight: Number(token.value) || 400, fontSize: 15, color: "var(--ed-text)" }}>
        Aa
      </span>
    );
  }
  if (token.group === "lineHeight") {
    return <IconLineHeight size={15} style={{ color: "var(--ed-primary)" }} />;
  }
  if (token.group === "letterSpacing") {
    return <IconLetterSpacing size={15} style={{ color: "var(--ed-primary)" }} />;
  }
  return <IconTextSize size={15} style={{ color: "var(--ed-primary)" }} />;
}

/** Expandable typography cards — HTML mock pattern */
export function TypographyCardsPanel() {
  const {
    state,
    selectTypography,
    updateTokenField,
    updateTokenRef,
    setTypographyEmbed,
    clearTypographyEmbed,
    setTypographyEmbedStatus,
  } = useTokenStore();
  const selectedId = state.selectedTypographyId;
  const ns = state.namespace;

  const byGroup = (group: TypographyToken["group"]) =>
    state.typography.filter((t) => t.group === group);

  return (
    <div>
      <div className="ed-section-lbl">Typography tokens</div>
      {SECTIONS.map(({ group, label }) => {
        const tokens = byGroup(group);
        if (!tokens.length) return null;
        return (
          <div key={group}>
            <div className="ed-section-lbl" style={{ marginTop: 12 }}>
              {label}
            </div>
            {tokens.map((token) => (
              <TypographyCard
                key={token.id}
                token={token}
                allTokens={state.typography}
                namespace={ns}
                active={token.id === selectedId}
                onSelect={() => selectTypography(token.id)}
                onUpdate={(value) =>
                  updateTokenField("typography", token.id, "value", value)
                }
                onTokenRef={(refOf) => {
                  if (token.source === "embed") {
                    removeFontEmbed(token.id);
                  }
                  updateTokenRef("typography", token.id, refOf);
                }}
                onSetEmbed={(embedCode, resolvedFamily, fallbackStack) => {
                  setTypographyEmbed(
                    token.id,
                    embedCode,
                    resolvedFamily,
                    fallbackStack
                  );
                }}
                onClearEmbed={() => {
                  clearTypographyEmbed(token.id);
                  removeFontEmbed(token.id);
                }}
                onEmbedStatus={(status) =>
                  setTypographyEmbedStatus(token.id, status)
                }
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function TypographyCard({
  token,
  allTokens,
  namespace,
  active,
  onSelect,
  onUpdate,
  onTokenRef,
  onSetEmbed,
  onClearEmbed,
  onEmbedStatus,
}: {
  token: TypographyToken;
  allTokens: TypographyToken[];
  namespace: string;
  active: boolean;
  onSelect: () => void;
  onUpdate: (value: string) => void;
  onTokenRef: (refOf: string | null) => void;
  onSetEmbed: (
    embedCode: string,
    resolvedFamily: string,
    fallbackStack: string
  ) => void;
  onClearEmbed: () => void;
  onEmbedStatus: (status: "loaded" | "failed") => void;
}) {
  const cssVar = `--${namespace}-${token.name.replace(/\./g, "-")}`;
  const isAliasRef = Boolean(token.refOf);
  const pill = isAliasRef
    ? `→ ${token.refOf}`
    : token.group === "family"
      ? familyLabel(token.resolvedFamily || token.value)
      : token.value;
  const refTargets = allTokens.filter(
    (t) => t.id !== token.id && t.group === token.group
  );

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
          <PreviewChip token={token} />
        </div>
        <div className="ed-tc-info">
          <div className="ed-tc-name">{token.name}</div>
          <div className="ed-tc-var">{token.alias || cssVar}</div>
        </div>
        <div className="ed-tc-badges">
          <span className="ed-val-pill">{pill}</span>
          <FontSourceBadge token={token} variant="full" />
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
                <span className="ed-exp-lbl">Value</span>
                <input
                  className="ed-num-inp"
                  value={token.value}
                  readOnly
                  spellCheck={false}
                  aria-label={`${token.name} resolved value`}
                />
                <span className="ed-ref-hint">from token</span>
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Reference</span>
                <select
                  className="ed-sel-inp"
                  value={token.refOf}
                  onChange={(e) => onTokenRef(e.target.value || null)}
                  aria-label={`${token.name} token reference`}
                >
                  {refTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
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
                  onClick={() => onTokenRef(null)}
                >
                  Detach to literal value
                </button>
              </div>
            </>
          ) : (
            <>
              {token.group === "size" && (
                <PxEditor token={token} onUpdate={onUpdate} />
              )}
              {token.group === "weight" && (
                <div className="ed-exp-row">
                  <span className="ed-exp-lbl">Weight</span>
                  <div className="ed-wt-row">
                    {WEIGHTS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        className={`ed-wt-opt${token.value === String(w) ? " sel" : ""}`}
                        style={{ fontWeight: w }}
                        onClick={() => onUpdate(String(w))}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {token.group === "lineHeight" && (
                <LhEditor token={token} onUpdate={onUpdate} />
              )}
              {token.group === "letterSpacing" && (
                <div className="ed-exp-row">
                  <span className="ed-exp-lbl">Value</span>
                  <input
                    className="ed-num-inp"
                    type="text"
                    value={token.value}
                    spellCheck={false}
                    onChange={(e) => onUpdate(e.target.value)}
                  />
                </div>
              )}
              {token.group === "family" && (
                <FamilySourceEditor
                  token={token}
                  refTargets={refTargets}
                  onUpdate={onUpdate}
                  onTokenRef={onTokenRef}
                  onSetEmbed={onSetEmbed}
                  onClearEmbed={onClearEmbed}
                  onEmbedStatus={onEmbedStatus}
                />
              )}
              {token.group !== "family" && refTargets.length > 0 && (
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
                    {refTargets.map((t) => (
                      <option key={t.id} value={t.id}>
                        → {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Used by</span>
            <div className="ed-alias-chips">
              {(token.usedBy.length
                ? token.usedBy
                : ["heading.font", "body.font", "label.font"]
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

function FamilySourceEditor({
  token,
  refTargets,
  onUpdate,
  onTokenRef,
  onSetEmbed,
  onClearEmbed,
  onEmbedStatus,
}: {
  token: TypographyToken;
  refTargets: TypographyToken[];
  onUpdate: (value: string) => void;
  onTokenRef: (refOf: string | null) => void;
  onSetEmbed: (
    embedCode: string,
    resolvedFamily: string,
    fallbackStack: string
  ) => void;
  onClearEmbed: () => void;
  onEmbedStatus: (status: "loaded" | "failed") => void;
}) {
  const isEmbed = token.source === "embed";
  const [mode, setMode] = useState<"preset" | "embed">(
    isEmbed ? "embed" : "preset"
  );
  const [embedCode, setEmbedCode] = useState(token.embedCode ?? "");
  const [resolvedFamily, setResolvedFamily] = useState(
    token.resolvedFamily ?? ""
  );
  const [fallbackStack, setFallbackStack] = useState(
    token.fallbackStack ?? DEFAULT_EMBED_FALLBACK_STACK
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedKind, setParsedKind] = useState<"link" | "font-face" | null>(
    null
  );
  const [readyToSave, setReadyToSave] = useState(false);

  useEffect(() => {
    setMode(isEmbed ? "embed" : "preset");
    setEmbedCode(token.embedCode ?? "");
    setResolvedFamily(token.resolvedFamily ?? "");
    setFallbackStack(token.fallbackStack ?? DEFAULT_EMBED_FALLBACK_STACK);
    setParseError(null);
    setReadyToSave(false);
    setParsedKind(null);
  }, [
    token.id,
    token.source,
    token.embedCode,
    token.resolvedFamily,
    token.fallbackStack,
    isEmbed,
  ]);

  const switchMode = (next: "preset" | "embed") => {
    if (next === mode) return;
    if (next === "preset") {
      if (isEmbed) onClearEmbed();
      setMode("preset");
      setParseError(null);
      setReadyToSave(false);
      setParsedKind(null);
      return;
    }
    setMode("embed");
    setParseError(null);
    setReadyToSave(false);
  };

  const runParse = () => {
    const parsed = parseFontEmbed(embedCode);
    if (!parsed.ok) {
      setParseError(parsed.error);
      setReadyToSave(false);
      setParsedKind(null);
      return;
    }
    const sanitized = sanitizeParsedEmbed(parsed.kind, embedCode);
    if (!sanitized.ok) {
      setParseError(sanitized.error);
      setReadyToSave(false);
      setParsedKind(null);
      return;
    }
    setParsedKind(parsed.kind);
    setResolvedFamily(parsed.family);
    setParseError(null);
    setReadyToSave(true);
  };

  const saveEmbed = () => {
    const family = resolvedFamily.trim();
    const fallback = fallbackStack.trim() || DEFAULT_EMBED_FALLBACK_STACK;
    if (!family || !readyToSave) return;

    const parsed = parseFontEmbed(embedCode);
    if (!parsed.ok) {
      setParseError(parsed.error);
      return;
    }
    const sanitized = sanitizeParsedEmbed(parsed.kind, embedCode);
    if (!sanitized.ok) {
      setParseError(sanitized.error);
      setReadyToSave(false);
      return;
    }

    onSetEmbed(embedCode, family, fallback);

    const payload: InjectableFontEmbed =
      parsed.kind === "link" && "href" in sanitized
        ? { kind: "link", href: sanitized.href }
        : {
            kind: "font-face",
            css: "css" in sanitized ? sanitized.css : "",
            family,
          };
    if (payload.kind === "font-face" && !payload.css) return;

    injectFontEmbed(token.id, payload, onEmbedStatus);
    setReadyToSave(false);
  };

  return (
    <>
      <div className="ed-exp-row">
        <span className="ed-exp-lbl">Source</span>
        <div
          className="ed-source-seg"
          role="group"
          aria-label={`${token.name} family source`}
        >
          <button
            type="button"
            className={`ed-source-seg-btn${mode === "preset" ? " on" : ""}`}
            aria-pressed={mode === "preset"}
            onClick={() => switchMode("preset")}
          >
            Preset
          </button>
          <button
            type="button"
            className={`ed-source-seg-btn${mode === "embed" ? " on" : ""}`}
            aria-pressed={mode === "embed"}
            onClick={() => switchMode("embed")}
          >
            Embed code
          </button>
        </div>
      </div>

      {mode === "preset" ? (
        <>
          <div className="ed-exp-row">
            <span className="ed-exp-lbl">Family</span>
            <select
              className="ed-sel-inp"
              value={
                FAMILY_OPTIONS.includes(token.value)
                  ? token.value
                  : FAMILY_OPTIONS[0]
              }
              onChange={(e) => onUpdate(e.target.value)}
            >
              {!FAMILY_OPTIONS.includes(token.value) && (
                <option value={token.value}>{familyLabel(token.value)}</option>
              )}
              {FAMILY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {familyLabel(f)}
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
                {refTargets.map((t) => (
                  <option key={t.id} value={t.id}>
                    → {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      ) : (
        <div className="ed-embed-panel">
          <div className="ed-exp-row ed-exp-row--stack">
            <span className="ed-exp-lbl">Embed</span>
            <textarea
              className="ed-embed-textarea"
              value={embedCode}
              spellCheck={false}
              rows={4}
              placeholder='<link href="https://fonts.googleapis.com/css2?family=…" rel="stylesheet"> or @font-face { … }'
              aria-label={`${token.name} embed code`}
              onChange={(e) => {
                setEmbedCode(e.target.value);
                setReadyToSave(false);
                setParseError(null);
              }}
            />
          </div>
          <div className="ed-exp-row">
            <span className="ed-exp-lbl" />
            <button
              type="button"
              className="ed-btn-ghost"
              style={{ fontSize: 12, padding: "4px 10px" }}
              onClick={runParse}
            >
              Parse
            </button>
            <button
              type="button"
              className="ed-btn-primary"
              style={{ fontSize: 12, padding: "4px 12px" }}
              disabled={!readyToSave || !resolvedFamily.trim()}
              onClick={saveEmbed}
            >
              Save embed
            </button>
            {parsedKind && (
              <span className="ed-embed-kind">{parsedKind}</span>
            )}
          </div>
          {parseError && (
            <div className="ed-embed-error" role="alert">
              {parseError}
            </div>
          )}
          {(readyToSave || isEmbed) && (
            <>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Family</span>
                <input
                  className="ed-num-inp ed-num-inp--wide"
                  type="text"
                  value={resolvedFamily}
                  spellCheck={false}
                  aria-label={`${token.name} resolved family`}
                  onChange={(e) => {
                    setResolvedFamily(e.target.value);
                    if (readyToSave && !e.target.value.trim()) {
                      /* keep ready flag; save disabled via trim check */
                    }
                  }}
                />
              </div>
              <div className="ed-exp-row">
                <span className="ed-exp-lbl">Fallback</span>
                <input
                  className="ed-num-inp ed-num-inp--wide"
                  type="text"
                  value={fallbackStack}
                  spellCheck={false}
                  aria-label={`${token.name} fallback stack`}
                  onChange={(e) => setFallbackStack(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function PxEditor({
  token,
  onUpdate,
}: {
  token: TypographyToken;
  onUpdate: (v: string) => void;
}) {
  const n = parsePx(token.value);
  const { min, max } = sizeRange(token.id);
  return (
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
  );
}

function LhEditor({
  token,
  onUpdate,
}: {
  token: TypographyToken;
  onUpdate: (v: string) => void;
}) {
  const n = parseFloat(token.value) || 1.5;
  return (
    <div className="ed-exp-row">
      <span className="ed-exp-lbl">Value</span>
      <input
        className="ed-num-inp"
        type="number"
        step={0.05}
        min={1}
        max={2.5}
        value={n}
        onChange={(e) => onUpdate(e.target.value)}
      />
      <input
        className="ed-rng-inp"
        type="range"
        min={1}
        max={2.5}
        step={0.05}
        value={n}
        onChange={(e) => onUpdate(e.target.value)}
      />
    </div>
  );
}
