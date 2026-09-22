"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  compileLinearGradient,
  generateScaleFromAnchor,
  getWcagLevel,
  isValidHex,
  regenerateScaleStep,
  resolveColorValue,
  syncResolvedColorTokens,
} from "@/lib/colorScale";
import type { EditorDesignSystem } from "@/lib/codeGen";
import {
  DEMO_BORDER_RADIUS_TOKENS,
  DEMO_COLOR_TOKENS,
  DEMO_COMPONENT_TOKENS,
  DEMO_SHADOW_TOKENS,
  DEMO_SPACING_TOKENS,
  DEMO_TYPOGRAPHY_TOKENS,
} from "@/lib/demoTokens";
import {
  getEditorNamespace,
  getEditorPreviewThemeId,
  patchEditorMeta,
} from "@/lib/systemStorage";
import {
  composeEmbedFontValue,
  DEFAULT_EMBED_FALLBACK_STACK,
  DEFAULT_PRESET_FONT_STACK,
} from "@/lib/fontEmbedParser";
import {
  resolveDesignTokenValue,
  syncResolvedDesignTokens,
} from "@/lib/tokenRefs";
import {
  normalizeThemes,
  seedDefaultThemes,
  slugifyThemeId,
} from "@/lib/themeResolve";
import type {
  BorderRadiusToken,
  CodeTab,
  ColorGradient,
  ColorScaleStep,
  ColorScaleStepNumber,
  ColorToken,
  DesignToken,
  ShadowToken,
  SpacingToken,
  Theme,
  ThemeMode,
  TokenCategory,
  TypographyToken,
} from "@/types/tokens";

/** Store keys for all 7 editor categories (theme/component ↔ rail themes/components). */
export type TokenStoreCategory =
  | "color"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow"
  | "theme"
  | "component";

/**
 * Undo stack entry.
 * `nextValue` is required for redo (extends the requested {category,id,field,prevValue} shape).
 */
export interface TokenHistoryEntry {
  category: TokenStoreCategory;
  id: string;
  field: string;
  prevValue: string;
  nextValue: string;
}

export type PreviewStatus = "live" | "updating" | "error";

export interface TokenStoreState {
  color: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  radius: BorderRadiusToken[];
  shadow: ShadowToken[];
  /** Light/dark theme entities (not flat DesignTokens). */
  theme: Theme[];
  component: DesignToken[];
  selectedColorId: string | null;
  selectedTypographyId: string | null;
  selectedSpacingId: string | null;
  selectedRadiusId: string | null;
  selectedShadowId: string | null;
  selectedComponentId: string | null;
  selectedThemeId: string | null;
  /**
   * Live Preview theme only — independent of Themes panel `selectedThemeId`.
   * Persisted per system via `df_editor_{systemId}`.
   */
  previewThemeId: string | null;
  /** Rail selection — TokenCategory uses `themes` / `components`. */
  activeCategory: TokenCategory;
  codeTab: CodeTab;
  namespace: string;
  /** Shared Live Preview pill status (topbar + preview header). */
  previewStatus: PreviewStatus;
  history: TokenHistoryEntry[];
  historyIndex: number;
}

/** Spacing scale multipliers relative to spacing-base (default 4px). */
export const SPACING_SCALE_MULTIPLIERS: { id: string; multiplier: number }[] = [
  { id: "space-1", multiplier: 1 },
  { id: "space-2", multiplier: 2 },
  { id: "space-3", multiplier: 3 },
  { id: "space-4", multiplier: 4 },
  { id: "space-5", multiplier: 5 },
  { id: "space-6", multiplier: 6 },
  { id: "space-8", multiplier: 8 },
  { id: "space-10", multiplier: 10 },
  { id: "space-12", multiplier: 12 },
  { id: "space-16", multiplier: 16 },
];

const MAX_HISTORY = 50;

function cloneGradient(g: ColorGradient): ColorGradient {
  return {
    angle: g.angle,
    from: { ...g.from },
    to: { ...g.to },
    ...(g.manual ? { manual: true } : {}),
  };
}

function cloneColors(): ColorToken[] {
  return syncResolvedColorTokens(
    DEMO_COLOR_TOKENS.map((t) => ({
      ...t,
      usedBy: [...t.usedBy],
      scale: t.scale?.map((s) => ({ ...s })),
      refOf: t.refOf,
      gradient: t.gradient ? cloneGradient(t.gradient) : undefined,
    }))
  );
}

function cloneColorToken(token: ColorToken): ColorToken {
  return {
    ...token,
    usedBy: [...token.usedBy],
    scale: token.scale?.map((s) => ({ ...s })),
    refOf: token.refOf,
    gradient: token.gradient ? cloneGradient(token.gradient) : undefined,
  };
}

function withCompiledGradient(
  token: ColorToken,
  gradient: ColorGradient
): ColorToken {
  return {
    ...token,
    gradient: cloneGradient(gradient),
    value: compileLinearGradient(gradient),
    wcag: getWcagLevel(gradient.from.color),
  };
}

/** Snapshot field used for undo/redo of primary scale mutations. */
const COLOR_SNAPSHOT_FIELD = "$colorSnapshot";
/** History field for add/remove color tokens (empty prev = not yet added). */
const ADD_COLOR_FIELD = "$addColor";

function snapshotColor(token: ColorToken): string {
  return JSON.stringify(cloneColorToken(token));
}

function parseColorSnapshot(raw: string): ColorToken | null {
  try {
    return JSON.parse(raw) as ColorToken;
  } catch {
    return null;
  }
}

function withSyncedRefs(colors: ColorToken[]): ColorToken[] {
  return syncResolvedColorTokens(colors);
}

function replaceColor(
  colors: ColorToken[],
  id: string,
  next: ColorToken
): ColorToken[] {
  return withSyncedRefs(colors.map((t) => (t.id === id ? next : t)));
}

function applyPrimaryAnchor(
  primary: ColorToken,
  hex500: string
): ColorToken {
  const scale = generateScaleFromAnchor(hex500, primary.scale);
  return {
    ...primary,
    value: hex500,
    wcag: getWcagLevel(hex500),
    scale,
  };
}

function applyScaleStepEdit(
  primary: ColorToken,
  step: ColorScaleStepNumber,
  hex: string
): ColorToken {
  const scale = (primary.scale ?? generateScaleFromAnchor(primary.value)).map(
    (s) =>
      s.step === step
        ? {
            step,
            value: hex,
            overridden: step === 500 ? false : true,
          }
        : s
  );
  if (step === 500) {
    return applyPrimaryAnchor({ ...primary, scale }, hex);
  }
  return {
    ...primary,
    scale,
    wcag: getWcagLevel(primary.value),
  };
}

function applyScaleStepReset(
  primary: ColorToken,
  step: ColorScaleStepNumber
): ColorToken {
  if (step === 500) return primary;
  const auto = regenerateScaleStep(primary.value, step);
  const scale = (primary.scale ?? generateScaleFromAnchor(primary.value)).map(
    (s) =>
      s.step === step ? { step, value: auto, overridden: false } : s
  );
  return { ...primary, scale };
}
function cloneTypography(): TypographyToken[] {
  return syncResolvedDesignTokens(
    DEMO_TYPOGRAPHY_TOKENS.map((t) => ({
      ...t,
      usedBy: [...t.usedBy],
      ...(t.refOf ? { refOf: t.refOf } : {}),
    }))
  );
}
function cloneSpacing(): SpacingToken[] {
  return DEMO_SPACING_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}
function cloneRadius(): BorderRadiusToken[] {
  return DEMO_BORDER_RADIUS_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}
function cloneShadows(): ShadowToken[] {
  return syncResolvedDesignTokens(
    DEMO_SHADOW_TOKENS.map((t) => ({
      ...t,
      usedBy: [...t.usedBy],
      ...(t.refOf ? { refOf: t.refOf } : {}),
    }))
  );
}
function cloneThemes(): Theme[] {
  return seedDefaultThemes().map((t) => ({
    ...t,
    overrides: { ...t.overrides },
  }));
}
function cloneComponents(): DesignToken[] {
  return DEMO_COMPONENT_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}

function storageKey(systemId: string, kind: string) {
  return `df_${kind}_${systemId}`;
}

function loadThemes(systemId: string): Theme[] {
  if (typeof window === "undefined") return cloneThemes();
  try {
    const raw = localStorage.getItem(storageKey(systemId, "theme"));
    if (raw === null) return cloneThemes();
    return normalizeThemes(JSON.parse(raw));
  } catch {
    return cloneThemes();
  }
}

function normalizeScale(
  partial: Partial<ColorToken>,
  fallback: ColorToken,
  value: string
): ColorScaleStep[] | undefined {
  if (fallback.id !== "primary" && !fallback.scale && !partial.scale) {
    return undefined;
  }
  const existing = partial.scale ?? fallback.scale;
  if (fallback.id === "primary" || existing) {
    return generateScaleFromAnchor(value, existing);
  }
  return undefined;
}

function normalizeColor(partial: Partial<ColorToken>, fallback: ColorToken): ColorToken {
  const stepRef =
    partial.stepRef ??
    fallback.stepRef ??
    (fallback.id === "primary-hover"
      ? 600
      : fallback.id === "primary-subtle"
        ? 50
        : undefined);
  const scaleOf =
    partial.scaleOf ??
    fallback.scaleOf ??
    (stepRef != null ? "primary" : undefined);

  const gradientRaw = partial.gradient ?? fallback.gradient;
  const gradient = gradientRaw
    ? {
        angle: Number.isFinite(gradientRaw.angle) ? gradientRaw.angle : 135,
        from: {
          color: gradientRaw.from?.color ?? "#7733FF",
          opacity: Math.min(
            100,
            Math.max(0, Number(gradientRaw.from?.opacity ?? 100))
          ),
        },
        to: {
          color: gradientRaw.to?.color ?? "#ec4899",
          opacity: Math.min(
            100,
            Math.max(0, Number(gradientRaw.to?.opacity ?? 100))
          ),
        },
        ...(gradientRaw.manual ? { manual: true as const } : {}),
      }
    : undefined;

  const value = gradient
    ? compileLinearGradient(gradient)
    : (partial.value ?? fallback.value);
  const scale = normalizeScale(partial, fallback, value);
  const refOf = partial.refOf ?? fallback.refOf;

  return {
    id: partial.id ?? fallback.id,
    name: partial.name ?? fallback.name,
    value,
    alias: partial.alias ?? fallback.alias,
    wcag: partial.wcag ?? getWcagLevel(gradient?.from.color ?? value),
    group: partial.group ?? fallback.group,
    usedBy: partial.usedBy ?? [...(fallback.usedBy ?? [])],
    ...(scale ? { scale } : {}),
    // Token→token alias wins over scale-step refs in the editor model.
    ...(refOf
      ? { refOf }
      : stepRef != null
        ? { stepRef, scaleOf }
        : {}),
    ...(gradient ? { gradient } : {}),
  };
}

function colorFallbackFromPartial(partial: Partial<ColorToken>): ColorToken {
  const id = partial.id ?? "custom";
  const value = partial.value ?? "#4F4DFF";
  return {
    id,
    name: partial.name ?? `color.${id}`,
    value,
    alias: partial.alias ?? id,
    wcag: partial.wcag ?? getWcagLevel(value),
    group: partial.group ?? "semantic",
    usedBy: partial.usedBy ?? [],
    ...(partial.refOf ? { refOf: partial.refOf } : {}),
    ...(partial.stepRef != null
      ? { stepRef: partial.stepRef, scaleOf: partial.scaleOf ?? "primary" }
      : {}),
    ...(partial.scale ? { scale: partial.scale.map((s) => ({ ...s })) } : {}),
    ...(partial.gradient ? { gradient: cloneGradient(partial.gradient) } : {}),
  };
}

function normalizeDesignToken<T extends DesignToken>(
  partial: Partial<T>,
  fallback: T
): T {
  const refOf = partial.refOf ?? fallback.refOf;
  return {
    ...fallback,
    ...partial,
    id: partial.id ?? fallback.id,
    name: partial.name ?? fallback.name,
    value: partial.value ?? fallback.value,
    alias: partial.alias ?? fallback.alias,
    group: partial.group ?? fallback.group,
    usedBy: partial.usedBy ?? fallback.usedBy,
    ...(refOf ? { refOf } : { refOf: undefined }),
  };
}

function loadArray<T extends DesignToken>(
  systemId: string,
  kind: string,
  demos: T[],
  normalize: (p: Partial<T>, f: T) => T
): T[] {
  if (typeof window === "undefined") {
    return demos.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
  }
  try {
    const raw = localStorage.getItem(storageKey(systemId, kind));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<T>[];
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        const demoIds = new Set(demos.map((d) => d.id));
        const fromDemos = demos.map((fallback) => {
          const saved = parsed.find((t) => t.id === fallback.id);
          return saved
            ? normalize(saved, fallback)
            : { ...fallback, usedBy: [...fallback.usedBy] };
        });
        // Preserve user-added tokens that are not in the demo seed set.
        const extras = parsed
          .filter((p): p is Partial<T> & { id: string } => Boolean(p?.id) && !demoIds.has(p.id!))
          .map((p) => {
            if (kind === "tokens") {
              const fb = colorFallbackFromPartial(p as Partial<ColorToken>);
              return normalize(p, fb as unknown as T);
            }
            const fb = {
              id: p.id,
              name: p.name ?? p.id,
              value: p.value ?? "",
              alias: p.alias ?? p.id,
              group: p.group ?? "custom",
              usedBy: p.usedBy ?? [],
              ...(p.refOf ? { refOf: p.refOf } : {}),
            } as T;
            return normalize(p, fb);
          });
        return [...fromDemos, ...extras];
      }
    }
  } catch {
    /* ignore */
  }
  return demos.map((t) => ({
    ...t,
    usedBy: [...t.usedBy],
    ...(t.refOf ? { refOf: t.refOf } : {}),
  }));
}

type Action =
  | { type: "HYDRATE"; systemId: string }
  | { type: "SET_ACTIVE_CATEGORY"; category: TokenCategory }
  | { type: "SELECT_COLOR"; id: string | null }
  | { type: "SELECT_TYPOGRAPHY"; id: string | null }
  | { type: "SELECT_SPACING"; id: string | null }
  | { type: "SELECT_RADIUS"; id: string | null }
  | { type: "SELECT_SHADOW"; id: string | null }
  | { type: "SELECT_COMPONENT"; id: string | null }
  | { type: "SELECT_THEME"; id: string | null }
  | { type: "SET_PREVIEW_THEME"; id: string | null }
  | {
      type: "ADD_THEME";
      name: string;
      baseMode: ThemeMode;
    }
  | {
      type: "SET_THEME_OVERRIDE";
      themeId: string;
      tokenName: string;
      value: string | null;
    }
  | { type: "SET_CODE_TAB"; tab: CodeTab }
  | { type: "SET_NAMESPACE"; namespace: string }
  | { type: "SET_PREVIEW_STATUS"; status: PreviewStatus }
  | {
      type: "UPDATE_TOKEN_FIELD";
      category: TokenStoreCategory;
      id: string;
      field: string;
      value: string;
    }
  | {
      type: "BATCH_UPDATE";
      category: TokenStoreCategory;
      updates: { id: string; field: string; value: string }[];
    }
  | { type: "RESET_CATEGORY"; category: TokenStoreCategory }
  | { type: "RESET_ALL" }
  | {
      type: "REPLACE_COLOR";
      id: string;
      next: ColorToken;
    }
  | { type: "ADD_COLOR"; token: ColorToken }
  | {
      type: "SET_TYPOGRAPHY_EMBED";
      id: string;
      embedCode: string;
      resolvedFamily: string;
      fallbackStack: string;
    }
  | { type: "CLEAR_TYPOGRAPHY_EMBED"; id: string }
  | {
      type: "SET_TYPOGRAPHY_EMBED_STATUS";
      id: string;
      status: "loaded" | "failed" | "unverified";
    }
  | {
      type: "REPLACE_TYPOGRAPHY";
      id: string;
      next: TypographyToken;
    }
  | { type: "UNDO" }
  | { type: "REDO" };

function stripTypographyEmbedFields(
  token: TypographyToken
): TypographyToken {
  const {
    source: _s,
    embedCode: _e,
    resolvedFamily: _r,
    fallbackStack: _f,
    embedStatus: _st,
    ...rest
  } = token;
  return rest;
}

function getCategoryTokens(
  state: TokenStoreState,
  category: TokenStoreCategory
): DesignToken[] {
  switch (category) {
    case "color":
      return state.color;
    case "typography":
      return state.typography;
    case "spacing":
      return state.spacing;
    case "radius":
      return state.radius;
    case "shadow":
      return state.shadow;
    case "theme":
      // Themes are Theme[] — not edited via DesignToken patch paths.
      return [];
    case "component":
      return state.component;
  }
}

function setCategoryTokens(
  state: TokenStoreState,
  category: TokenStoreCategory,
  tokens: DesignToken[]
): TokenStoreState {
  switch (category) {
    case "color":
      return { ...state, color: withSyncedRefs(tokens as ColorToken[]) };
    case "typography":
      return {
        ...state,
        typography: syncResolvedDesignTokens(tokens as TypographyToken[]),
      };
    case "spacing":
      return { ...state, spacing: tokens as SpacingToken[] };
    case "radius":
      return { ...state, radius: tokens as BorderRadiusToken[] };
    case "shadow":
      return {
        ...state,
        shadow: syncResolvedDesignTokens(tokens as ShadowToken[]),
      };
    case "theme":
      return state;
    case "component":
      return { ...state, component: tokens };
  }
}

function patchToken(
  token: DesignToken,
  field: string,
  value: string,
  category: TokenStoreCategory
): DesignToken {
  if (category === "color") {
    const color = token as ColorToken;
    if (field === COLOR_SNAPSHOT_FIELD) {
      return parseColorSnapshot(value) ?? color;
    }
    if (field === "stepRef") {
      const step = Number(value) as ColorScaleStepNumber;
      if (!SCALE_STEP_SET.has(step)) return color;
      const next: ColorToken = {
        ...color,
        stepRef: step,
        scaleOf: color.scaleOf ?? "primary",
        refOf: undefined,
        alias:
          color.id === "primary-hover"
            ? `brand.${step}`
            : color.id === "primary-subtle"
              ? `brand.${step}`
              : color.alias,
      };
      return next;
    }
    if (field === "refOf") {
      if (!value) {
        const { refOf: _drop, ...rest } = color;
        return rest as ColorToken;
      }
      if (value === color.id) return color;
      const aliased: ColorToken = {
        ...color,
        refOf: value,
        stepRef: undefined,
        scaleOf: undefined,
      };
      return aliased;
    }
    if (field === "value") {
      if (color.stepRef != null || color.refOf) {
        // Reference tokens resolve from their target — ignore direct hex writes.
        return color;
      }
      if (color.id === "primary" || color.scale) {
        return applyPrimaryAnchor(color, value);
      }
      const next: ColorToken = {
        ...color,
        value,
        wcag: getWcagLevel(value),
      };
      return next;
    }
    if (field !== "value" && field in color) {
      return { ...color, [field]: value };
    }
    return color;
  }
  if (field === "refOf") {
    if (!value) {
      const { refOf: _drop, ...rest } = token;
      return rest as DesignToken;
    }
    if (value === token.id) return token;
    return { ...token, refOf: value };
  }
  if (field === "value") {
    if (token.refOf) return token;
    if (category === "typography") {
      const ty = token as TypographyToken;
      if (ty.group === "family" && ty.source !== "embed") {
        const next: TypographyToken = {
          ...ty,
          value,
          lastPresetValue: value,
        };
        return next;
      }
    }
    return { ...token, value };
  }
  if (field !== "value" && field in token) {
    return { ...token, [field]: value };
  }
  return { ...token, value };
}

function readField(token: DesignToken, field: string): string {
  if (field === COLOR_SNAPSHOT_FIELD && "wcag" in token) {
    return snapshotColor(token as ColorToken);
  }
  if (field === ADD_COLOR_FIELD && "wcag" in token) {
    return snapshotColor(token as ColorToken);
  }
  if (field === "value") return token.value;
  if (field === "stepRef") {
    const ref = (token as ColorToken).stepRef;
    return ref == null ? "" : String(ref);
  }
  if (field === "refOf") {
    return (token as ColorToken).refOf ?? "";
  }
  const v = (token as unknown as Record<string, unknown>)[field];
  return v == null ? token.value : String(v);
}

const SCALE_STEP_SET = new Set<number>([
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
]);

function pushHistory(
  state: TokenStoreState,
  entries: TokenHistoryEntry[]
): Pick<TokenStoreState, "history" | "historyIndex"> {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  const history = [...trimmed, ...entries].slice(-MAX_HISTORY);
  return { history, historyIndex: history.length - 1 };
}

function applyField(
  state: TokenStoreState,
  entry: TokenHistoryEntry,
  value: string
): TokenStoreState {
  if (entry.field === ADD_COLOR_FIELD && entry.category === "color") {
    if (!value) {
      const next = state.color.filter((t) => t.id !== entry.id);
      return {
        ...setCategoryTokens(state, "color", next),
        selectedColorId:
          state.selectedColorId === entry.id
            ? (next.find((t) => t.id === "primary")?.id ?? next[0]?.id ?? null)
            : state.selectedColorId,
      };
    }
    const token = parseColorSnapshot(value);
    if (!token) return state;
    if (state.color.some((t) => t.id === token.id)) {
      return setCategoryTokens(
        state,
        "color",
        state.color.map((t) => (t.id === token.id ? cloneColorToken(token) : t))
      );
    }
    return {
      ...setCategoryTokens(state, "color", [...state.color, cloneColorToken(token)]),
      selectedColorId: token.id,
    };
  }
  const tokens = getCategoryTokens(state, entry.category).map((t) =>
    t.id === entry.id ? patchToken(t, entry.field, value, entry.category) : t
  );
  return setCategoryTokens(state, entry.category, tokens);
}

function createInitialState(): TokenStoreState {
  return {
    color: cloneColors(),
    typography: cloneTypography(),
    spacing: cloneSpacing(),
    radius: cloneRadius(),
    shadow: cloneShadows(),
    theme: cloneThemes(),
    component: cloneComponents(),
    selectedColorId: "primary",
    selectedTypographyId: "text-base",
    selectedSpacingId: "space-4",
    selectedRadiusId: "radius-md",
    selectedShadowId: "shadow-md",
    selectedComponentId: "button-height-md",
    selectedThemeId: "theme-light",
    previewThemeId: "theme-light",
    activeCategory: "color",
    codeTab: "css",
    namespace: "acme",
    previewStatus: "live",
    history: [],
    historyIndex: -1,
  };
}

function tokenStoreReducer(state: TokenStoreState, action: Action): TokenStoreState {
  switch (action.type) {
    case "HYDRATE": {
      const color = loadArray(action.systemId, "tokens", DEMO_COLOR_TOKENS, normalizeColor);
      const typography = loadArray(
        action.systemId,
        "typography",
        DEMO_TYPOGRAPHY_TOKENS,
        normalizeDesignToken
      );
      const spacing = loadArray(
        action.systemId,
        "spacing",
        DEMO_SPACING_TOKENS,
        normalizeDesignToken
      );
      const radius = loadArray(
        action.systemId,
        "radius",
        DEMO_BORDER_RADIUS_TOKENS,
        normalizeDesignToken
      );
      const shadow = loadArray(
        action.systemId,
        "shadow",
        DEMO_SHADOW_TOKENS,
        normalizeDesignToken
      );
      const theme = loadThemes(action.systemId);
      const component = loadArray(
        action.systemId,
        "component",
        DEMO_COMPONENT_TOKENS,
        normalizeDesignToken
      );
      const namespace = getEditorNamespace(action.systemId) || state.namespace;
      const defaultThemeId =
        theme.find((t) => t.id === "theme-light")?.id ??
        theme[0]?.id ??
        null;
      const savedPreview = getEditorPreviewThemeId(action.systemId);
      const previewThemeId =
        (savedPreview && theme.some((t) => t.id === savedPreview)
          ? savedPreview
          : null) ?? defaultThemeId;
      return {
        ...state,
        color: withSyncedRefs(color),
        typography: syncResolvedDesignTokens(typography),
        spacing,
        radius,
        shadow: syncResolvedDesignTokens(shadow),
        theme,
        component,
        namespace,
        selectedThemeId: defaultThemeId,
        previewThemeId,
        selectedColorId: color.find((t) => t.id === "primary")?.id ?? color[0]?.id ?? null,
        selectedTypographyId:
          typography.find((t) => t.id === "text-base")?.id ??
          typography[0]?.id ??
          null,
        selectedSpacingId:
          spacing.find((t) => t.id === "space-4")?.id ?? spacing[0]?.id ?? null,
        selectedRadiusId:
          radius.find((t) => t.id === "radius-md")?.id ?? radius[0]?.id ?? null,
        selectedShadowId:
          shadow.find((t) => t.id === "shadow-md")?.id ?? shadow[0]?.id ?? null,
        selectedComponentId:
          component.find((t) => t.id === "button-height-md")?.id ??
          component[0]?.id ??
          null,
        history: [],
        historyIndex: -1,
      };
    }
    case "SET_ACTIVE_CATEGORY":
      return { ...state, activeCategory: action.category };
    case "SELECT_COLOR":
      return { ...state, selectedColorId: action.id };
    case "SELECT_TYPOGRAPHY":
      return { ...state, selectedTypographyId: action.id };
    case "SELECT_SPACING":
      return { ...state, selectedSpacingId: action.id };
    case "SELECT_RADIUS":
      return { ...state, selectedRadiusId: action.id };
    case "SELECT_SHADOW":
      return { ...state, selectedShadowId: action.id };
    case "SELECT_COMPONENT":
      return { ...state, selectedComponentId: action.id };
    case "SELECT_THEME":
      return { ...state, selectedThemeId: action.id };
    case "SET_PREVIEW_THEME": {
      if (action.id && !state.theme.some((t) => t.id === action.id)) {
        return state;
      }
      if (state.previewThemeId === action.id) return state;
      return { ...state, previewThemeId: action.id };
    }
    case "ADD_THEME": {
      const baseId = slugifyThemeId(action.name);
      let id = baseId;
      let n = 2;
      while (state.theme.some((t) => t.id === id)) {
        id = `${baseId}-${n}`;
        n += 1;
      }
      const next: Theme = {
        id,
        name: action.name.trim() || "Theme",
        baseMode: action.baseMode,
        overrides: {},
      };
      return {
        ...state,
        theme: [...state.theme, next],
        selectedThemeId: id,
        activeCategory: "themes",
      };
    }
    case "SET_THEME_OVERRIDE": {
      const theme = state.theme.find((t) => t.id === action.themeId);
      if (!theme) return state;
      const overrides = { ...theme.overrides };
      if (action.value == null || action.value === "") {
        delete overrides[action.tokenName];
      } else {
        if (overrides[action.tokenName] === action.value) return state;
        overrides[action.tokenName] = action.value;
      }
      return {
        ...state,
        theme: state.theme.map((t) =>
          t.id === action.themeId ? { ...t, overrides } : t
        ),
      };
    }
    case "SET_CODE_TAB":
      return { ...state, codeTab: action.tab };
    case "SET_NAMESPACE":
      return { ...state, namespace: action.namespace };
    case "SET_PREVIEW_STATUS":
      return state.previewStatus === action.status
        ? state
        : { ...state, previewStatus: action.status };
    case "UPDATE_TOKEN_FIELD": {
      const tokens = getCategoryTokens(state, action.category);
      const token = tokens.find((t) => t.id === action.id);
      if (!token) return state;
      const current = readField(token, action.field);
      if (current === action.value) return state;

      const next = tokens.map((t) =>
        t.id === action.id
          ? patchToken(t, action.field, action.value, action.category)
          : t
      );
      const entry: TokenHistoryEntry = {
        category: action.category,
        id: action.id,
        field: action.field,
        prevValue: current,
        nextValue: action.value,
      };
      return {
        ...setCategoryTokens(state, action.category, next),
        ...pushHistory(state, [entry]),
      };
    }
    case "BATCH_UPDATE": {
      const entries: TokenHistoryEntry[] = [];
      let working = state;
      for (const u of action.updates) {
        const tokens = getCategoryTokens(working, action.category);
        const token = tokens.find((t) => t.id === u.id);
        if (!token) continue;
        const current = readField(token, u.field);
        if (current === u.value) continue;
        entries.push({
          category: action.category,
          id: u.id,
          field: u.field,
          prevValue: current,
          nextValue: u.value,
        });
        working = setCategoryTokens(
          working,
          action.category,
          tokens.map((t) =>
            t.id === u.id ? patchToken(t, u.field, u.value, action.category) : t
          )
        );
      }
      if (entries.length === 0) return state;
      return { ...working, ...pushHistory(state, entries) };
    }
    case "RESET_CATEGORY": {
      if (action.category === "theme") {
        return {
          ...state,
          theme: cloneThemes(),
          selectedThemeId: "theme-light",
          history: [],
          historyIndex: -1,
        };
      }
      const clones: Record<
        Exclude<TokenStoreCategory, "theme">,
        () => DesignToken[]
      > = {
        color: cloneColors,
        typography: cloneTypography,
        spacing: cloneSpacing,
        radius: cloneRadius,
        shadow: cloneShadows,
        component: cloneComponents,
      };
      const next = setCategoryTokens(
        state,
        action.category,
        clones[action.category]()
      );
      return {
        ...next,
        selectedColorId:
          action.category === "color" ? "primary" : state.selectedColorId,
        selectedTypographyId:
          action.category === "typography"
            ? "text-base"
            : state.selectedTypographyId,
        selectedSpacingId:
          action.category === "spacing" ? "space-4" : state.selectedSpacingId,
        selectedRadiusId:
          action.category === "radius" ? "radius-md" : state.selectedRadiusId,
        selectedShadowId:
          action.category === "shadow" ? "shadow-md" : state.selectedShadowId,
        selectedComponentId:
          action.category === "component"
            ? "button-height-md"
            : state.selectedComponentId,
        history: [],
        historyIndex: -1,
      };
    }
    case "RESET_ALL":
      return {
        ...createInitialState(),
        namespace: state.namespace,
        activeCategory: state.activeCategory,
        codeTab: state.codeTab,
      };
    case "REPLACE_COLOR": {
      const prev = state.color.find((t) => t.id === action.id);
      if (!prev) return state;
      if (snapshotColor(prev) === snapshotColor(action.next)) return state;
      const nextColors = state.color.map((t) =>
        t.id === action.id ? cloneColorToken(action.next) : t
      );
      return {
        ...setCategoryTokens(state, "color", nextColors),
        ...pushHistory(state, [
          {
            category: "color",
            id: action.id,
            field: COLOR_SNAPSHOT_FIELD,
            prevValue: snapshotColor(prev),
            nextValue: snapshotColor(action.next),
          },
        ]),
      };
    }
    case "ADD_COLOR": {
      if (state.color.some((t) => t.id === action.token.id)) return state;
      if (state.color.some((t) => t.name === action.token.name)) return state;
      const token = cloneColorToken(action.token);
      const nextColors = withSyncedRefs([...state.color, token]);
      return {
        ...state,
        color: nextColors,
        selectedColorId: token.id,
        activeCategory: "color",
        ...pushHistory(state, [
          {
            category: "color",
            id: token.id,
            field: ADD_COLOR_FIELD,
            prevValue: "",
            nextValue: snapshotColor(token),
          },
        ]),
      };
    }
    case "SET_TYPOGRAPHY_EMBED": {
      const token = state.typography.find((t) => t.id === action.id);
      if (!token || token.group !== "family") return state;
      const family = action.resolvedFamily.trim();
      if (!family) return state;
      const fallback =
        action.fallbackStack.trim() || DEFAULT_EMBED_FALLBACK_STACK;
      // Persist last preset stack on the token so clears survive reload.
      const lastPresetValue =
        token.source !== "embed"
          ? token.value
          : (token.lastPresetValue ?? DEFAULT_PRESET_FONT_STACK);
      // Embed ⊥ refOf — drop the alias pointer (leave `alias` label untouched).
      const { refOf: _drop, ...withoutRef } = token;
      const next: TypographyToken = {
        ...withoutRef,
        source: "embed",
        embedCode: action.embedCode,
        resolvedFamily: family,
        fallbackStack: fallback,
        embedStatus: "unverified",
        lastPresetValue,
        value: composeEmbedFontValue(family, fallback),
      };
      return setCategoryTokens(
        state,
        "typography",
        state.typography.map((t) => (t.id === action.id ? next : t))
      );
    }
    case "CLEAR_TYPOGRAPHY_EMBED": {
      const token = state.typography.find((t) => t.id === action.id);
      if (!token || token.group !== "family") return state;
      if (token.source !== "embed" && !token.embedCode) return state;
      const base = stripTypographyEmbedFields(token);
      const restored =
        token.lastPresetValue ?? DEFAULT_PRESET_FONT_STACK;
      const next: TypographyToken = {
        ...base,
        source: "preset",
        value: restored,
        lastPresetValue: restored,
      };
      return setCategoryTokens(
        state,
        "typography",
        state.typography.map((t) => (t.id === action.id ? next : t))
      );
    }
    case "SET_TYPOGRAPHY_EMBED_STATUS": {
      const token = state.typography.find((t) => t.id === action.id);
      if (!token || token.group !== "family" || token.source !== "embed") {
        return state;
      }
      if (token.embedStatus === action.status) return state;
      const next: TypographyToken = {
        ...token,
        embedStatus: action.status,
      };
      return setCategoryTokens(
        state,
        "typography",
        state.typography.map((t) => (t.id === action.id ? next : t))
      );
    }
    case "REPLACE_TYPOGRAPHY": {
      if (!state.typography.some((t) => t.id === action.id)) return state;
      return setCategoryTokens(
        state,
        "typography",
        state.typography.map((t) =>
          t.id === action.id ? { ...action.next, usedBy: [...action.next.usedBy] } : t
        )
      );
    }
    case "UNDO": {
      if (state.historyIndex < 0) return state;
      const entry = state.history[state.historyIndex];
      return {
        ...applyField(state, entry, entry.prevValue),
        historyIndex: state.historyIndex - 1,
      };
    }
    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      const entry = state.history[nextIndex];
      return {
        ...applyField(state, entry, entry.nextValue),
        historyIndex: nextIndex,
      };
    }
    default:
      return state;
  }
}

export function railToStoreCategory(rail: TokenCategory): TokenStoreCategory {
  if (rail === "themes") return "theme";
  if (rail === "components") return "component";
  return rail;
}

function toMap(tokens: DesignToken[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of tokens) map[t.id] = resolveDesignTokenValue(t, tokens);
  return map;
}

function toColorMap(colors: ColorToken[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of colors) map[t.id] = resolveColorValue(t, colors);
  return map;
}

interface TokenStoreContextValue {
  state: TokenStoreState;
  hydrated: boolean;
  canUndo: boolean;
  canRedo: boolean;
  selectedColor: ColorToken | null;
  selectedTypography: TypographyToken | null;
  selectedSpacing: SpacingToken | null;
  selectedRadius: BorderRadiusToken | null;
  selectedShadow: ShadowToken | null;
  selectedComponent: DesignToken | null;
  selectedTheme: Theme | null;
  colorsByGroup: Record<string, ColorToken[]>;
  designSystem: EditorDesignSystem;
  tokenMap: Record<string, string>;
  typographyTokenMap: Record<string, string>;
  spacingTokenMap: Record<string, string>;
  radiusTokenMap: Record<string, string>;
  shadowTokenMap: Record<string, string>;
  setActiveCategory: (category: TokenCategory) => void;
  selectColor: (id: string | null) => void;
  selectTypography: (id: string | null) => void;
  selectSpacing: (id: string | null) => void;
  selectRadius: (id: string | null) => void;
  selectShadow: (id: string | null) => void;
  selectComponent: (id: string | null) => void;
  selectTheme: (id: string | null) => void;
  /** Live Preview theme only — does not change Themes panel selection. */
  setPreviewTheme: (id: string | null) => void;
  addTheme: (name: string, baseMode: ThemeMode) => void;
  setThemeOverride: (
    tokenName: string,
    value: string | null,
    themeId?: string
  ) => void;
  setCodeTab: (tab: CodeTab) => void;
  setNamespace: (namespace: string) => void;
  updateTokenField: (
    category: TokenStoreCategory,
    id: string,
    field: string,
    value: string
  ) => void;
  updateColorValue: (id: string, value: string) => void;
  updateGradient: (id: string, gradient: ColorGradient) => void;
  updateScaleStep: (step: ColorScaleStepNumber, value: string) => void;
  resetScaleStep: (step: ColorScaleStepNumber) => void;
  updateStepRef: (id: string, step: ColorScaleStepNumber) => void;
  /** Set or clear a token→token color alias (`refOf`). */
  updateColorRef: (id: string, refOf: string | null) => void;
  /** Set or clear a typography/shadow token→token alias (`refOf`). */
  updateTokenRef: (
    category: "typography" | "shadow",
    id: string,
    refOf: string | null
  ) => void;
  /** Family token: paste embed → computed CSS stack on `value` (clears `refOf`). */
  setTypographyEmbed: (
    id: string,
    embedCode: string,
    resolvedFamily: string,
    fallbackStack: string
  ) => void;
  /** Family token: leave embed mode; restore `lastPresetValue` when present. */
  clearTypographyEmbed: (id: string) => void;
  /** Update embed load badge after injection onload/onerror / FontFace. */
  setTypographyEmbedStatus: (
    id: string,
    status: "loaded" | "failed" | "unverified"
  ) => void;
  /** Append a new color token (recommended catalog or custom). */
  addColor: (token: ColorToken) => boolean;
  /** Cascade spacing-base → full scale (signals previewStatus updating). */
  updateSpacingBase: (value: string) => void;
  setPreviewStatus: (status: PreviewStatus) => void;
  /** Run a multi-token recompute while flashing previewStatus to updating. */
  runPreviewCascade: (fn: () => void) => void;
  batchUpdate: (
    category: TokenStoreCategory,
    updates: { id: string; field: string; value: string }[]
  ) => void;
  resetCategory: (category: TokenStoreCategory) => void;
  resetAll: () => void;
  undo: () => void;
  redo: () => void;
}

const TokenStoreContext = createContext<TokenStoreContextValue | null>(null);

export function TokenStoreProvider({
  systemId,
  children,
}: {
  systemId: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(tokenStoreReducer, undefined, createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: "HYDRATE", systemId });
    setHydrated(true);
  }, [systemId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey(systemId, "tokens"), JSON.stringify(state.color));
      localStorage.setItem(
        storageKey(systemId, "typography"),
        JSON.stringify(state.typography)
      );
      localStorage.setItem(storageKey(systemId, "spacing"), JSON.stringify(state.spacing));
      localStorage.setItem(storageKey(systemId, "radius"), JSON.stringify(state.radius));
      localStorage.setItem(storageKey(systemId, "shadow"), JSON.stringify(state.shadow));
      localStorage.setItem(storageKey(systemId, "theme"), JSON.stringify(state.theme));
      localStorage.setItem(
        storageKey(systemId, "component"),
        JSON.stringify(state.component)
      );
      if (state.previewThemeId) {
        patchEditorMeta(systemId, { previewThemeId: state.previewThemeId });
      }
    } catch {
      /* ignore */
    }
  }, [
    systemId,
    hydrated,
    state.color,
    state.typography,
    state.spacing,
    state.radius,
    state.shadow,
    state.theme,
    state.component,
    state.previewThemeId,
  ]);

  const selectedColor = useMemo(
    () => state.color.find((t) => t.id === state.selectedColorId) ?? null,
    [state.color, state.selectedColorId]
  );

  const selectedTypography = useMemo(
    () =>
      state.typography.find((t) => t.id === state.selectedTypographyId) ?? null,
    [state.typography, state.selectedTypographyId]
  );

  const selectedSpacing = useMemo(
    () => state.spacing.find((t) => t.id === state.selectedSpacingId) ?? null,
    [state.spacing, state.selectedSpacingId]
  );

  const selectedRadius = useMemo(
    () => state.radius.find((t) => t.id === state.selectedRadiusId) ?? null,
    [state.radius, state.selectedRadiusId]
  );

  const selectedShadow = useMemo(
    () => state.shadow.find((t) => t.id === state.selectedShadowId) ?? null,
    [state.shadow, state.selectedShadowId]
  );

  const selectedComponent = useMemo(
    () =>
      state.component.find((t) => t.id === state.selectedComponentId) ?? null,
    [state.component, state.selectedComponentId]
  );

  const selectedTheme = useMemo(
    () => state.theme.find((t) => t.id === state.selectedThemeId) ?? null,
    [state.theme, state.selectedThemeId]
  );

  const colorsByGroup = useMemo(() => {
    const groups: Record<string, ColorToken[]> = {
      semantic: [],
      surface: [],
      text: [],
      border: [],
      icon: [],
      feedback: [],
      interactive: [],
      overlay: [],
      charts: [],
    };
    for (const t of state.color) {
      if (groups[t.group]) groups[t.group].push(t);
      else groups.semantic.push(t);
    }
    return groups;
  }, [state.color]);

  const designSystem = useMemo<EditorDesignSystem>(
    () => ({
      colors: state.color,
      typography: state.typography,
      spacing: state.spacing,
      borderRadius: state.radius,
      shadows: state.shadow,
      themes: state.theme,
      components: state.component,
    }),
    [
      state.color,
      state.typography,
      state.spacing,
      state.radius,
      state.shadow,
      state.theme,
      state.component,
    ]
  );

  const tokenMap = useMemo(() => toColorMap(state.color), [state.color]);
  const typographyTokenMap = useMemo(() => toMap(state.typography), [state.typography]);
  const spacingTokenMap = useMemo(() => toMap(state.spacing), [state.spacing]);
  const radiusTokenMap = useMemo(() => toMap(state.radius), [state.radius]);
  const shadowTokenMap = useMemo(() => toMap(state.shadow), [state.shadow]);

  const setActiveCategory = useCallback((category: TokenCategory) => {
    dispatch({ type: "SET_ACTIVE_CATEGORY", category });
  }, []);

  const selectColor = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_COLOR", id });
  }, []);

  const selectTypography = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_TYPOGRAPHY", id });
  }, []);

  const selectSpacing = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_SPACING", id });
  }, []);

  const selectRadius = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_RADIUS", id });
  }, []);

  const selectShadow = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_SHADOW", id });
  }, []);

  const selectComponent = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_COMPONENT", id });
  }, []);

  const selectTheme = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_THEME", id });
  }, []);

  const setPreviewTheme = useCallback((id: string | null) => {
    dispatch({ type: "SET_PREVIEW_THEME", id });
  }, []);

  const addTheme = useCallback((name: string, baseMode: ThemeMode) => {
    dispatch({ type: "ADD_THEME", name, baseMode });
    dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
  }, []);

  const setThemeOverride = useCallback(
    (tokenName: string, value: string | null, themeId?: string) => {
      const id = themeId ?? state.selectedThemeId;
      if (!id) return;
      dispatch({
        type: "SET_THEME_OVERRIDE",
        themeId: id,
        tokenName,
        value,
      });
      dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
    },
    [state.selectedThemeId]
  );

  const setCodeTab = useCallback((tab: CodeTab) => {
    dispatch({ type: "SET_CODE_TAB", tab });
  }, []);

  const setNamespace = useCallback((namespace: string) => {
    dispatch({ type: "SET_NAMESPACE", namespace });
  }, []);

  const updateTokenField = useCallback(
    (category: TokenStoreCategory, id: string, field: string, value: string) => {
      dispatch({ type: "UPDATE_TOKEN_FIELD", category, id, field, value });
    },
    []
  );

  const setPreviewStatus = useCallback((status: PreviewStatus) => {
    dispatch({ type: "SET_PREVIEW_STATUS", status });
  }, []);

  const runPreviewCascade = useCallback((fn: () => void) => {
    dispatch({ type: "SET_PREVIEW_STATUS", status: "updating" });
    try {
      fn();
    } finally {
      // Defer live so updating can paint for at least one frame.
      requestAnimationFrame(() => {
        dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
      });
    }
  }, []);

  const updateColorValue = useCallback(
    (id: string, value: string) => {
      const apply = () => {
        dispatch({
          type: "UPDATE_TOKEN_FIELD",
          category: "color",
          id,
          field: "value",
          value,
        });
      };
      // Primary 500 edit regenerates the full scale → mark updating.
      if (id === "primary") {
        runPreviewCascade(apply);
      } else {
        apply();
        dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
      }
    },
    [runPreviewCascade]
  );

  const updateGradient = useCallback(
    (id: string, gradient: ColorGradient) => {
      const token = state.color.find((t) => t.id === id);
      if (!token?.gradient) return;
      dispatch({
        type: "REPLACE_COLOR",
        id,
        next: withCompiledGradient(token, gradient),
      });
      dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
    },
    [state.color]
  );

  const updateScaleStep = useCallback(
    (step: ColorScaleStepNumber, value: string) => {
      if (!isValidHex(value)) return;
      const primary = state.color.find((t) => t.id === "primary");
      if (!primary) return;
      const apply = () => {
        dispatch({
          type: "REPLACE_COLOR",
          id: "primary",
          next: applyScaleStepEdit(primary, step, value),
        });
      };
      // Editing 500 re-anchors the scale; other steps are single-token edits.
      if (step === 500) {
        runPreviewCascade(apply);
      } else {
        apply();
        dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
      }
    },
    [state.color, runPreviewCascade]
  );

  const resetScaleStep = useCallback(
    (step: ColorScaleStepNumber) => {
      const primary = state.color.find((t) => t.id === "primary");
      if (!primary) return;
      dispatch({
        type: "REPLACE_COLOR",
        id: "primary",
        next: applyScaleStepReset(primary, step),
      });
      dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
    },
    [state.color]
  );

  const updateStepRef = useCallback((id: string, step: ColorScaleStepNumber) => {
    dispatch({
      type: "UPDATE_TOKEN_FIELD",
      category: "color",
      id,
      field: "stepRef",
      value: String(step),
    });
    dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
  }, []);

  const updateColorRef = useCallback(
    (id: string, refOf: string | null) => {
      const token = state.color.find((t) => t.id === id);
      if (!token) return;
      if (refOf === id) return;
      if (refOf) {
        const target = state.color.find((t) => t.id === refOf);
        if (!target) return;
        const resolved = resolveColorValue(
          { ...token, refOf, stepRef: undefined, scaleOf: undefined },
          state.color
        );
        dispatch({
          type: "REPLACE_COLOR",
          id,
          next: {
            ...token,
            refOf,
            stepRef: undefined,
            scaleOf: undefined,
            value: resolved,
            wcag: getWcagLevel(resolved),
            alias: target.name.replace(/^color\./, ""),
          },
        });
      } else {
        const { refOf: _drop, ...rest } = token;
        dispatch({
          type: "REPLACE_COLOR",
          id,
          next: { ...rest },
        });
      }
      dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
    },
    [state.color]
  );

  const updateTokenRef = useCallback(
    (
      category: "typography" | "shadow",
      id: string,
      refOf: string | null
    ) => {
      const tokens =
        category === "typography" ? state.typography : state.shadow;
      const token = tokens.find((t) => t.id === id);
      if (!token) return;
      if (refOf === id) return;
      if (refOf) {
        const target = tokens.find((t) => t.id === refOf);
        if (!target) return;
        // Embed and alias are mutually exclusive on family tokens.
        if (
          category === "typography" &&
          (token as TypographyToken).group === "family" &&
          (token as TypographyToken).source === "embed"
        ) {
          const cleared = stripTypographyEmbedFields(token as TypographyToken);
          dispatch({
            type: "REPLACE_TYPOGRAPHY",
            id,
            next: {
              ...cleared,
              source: "preset",
              refOf,
              alias: target.alias || target.name,
              value: target.value,
            },
          });
        } else {
          dispatch({
            type: "BATCH_UPDATE",
            category,
            updates: [
              { id, field: "refOf", value: refOf },
              { id, field: "alias", value: target.alias || target.name },
            ],
          });
        }
      } else {
        dispatch({
          type: "UPDATE_TOKEN_FIELD",
          category,
          id,
          field: "refOf",
          value: "",
        });
      }
      dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
    },
    [state.typography, state.shadow]
  );

  const setTypographyEmbed = useCallback(
    (
      id: string,
      embedCode: string,
      resolvedFamily: string,
      fallbackStack: string
    ) => {
      dispatch({
        type: "SET_TYPOGRAPHY_EMBED",
        id,
        embedCode,
        resolvedFamily,
        fallbackStack,
      });
      dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
    },
    []
  );

  const clearTypographyEmbed = useCallback((id: string) => {
    dispatch({ type: "CLEAR_TYPOGRAPHY_EMBED", id });
    dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
  }, []);

  const setTypographyEmbedStatus = useCallback(
    (id: string, status: "loaded" | "failed" | "unverified") => {
      dispatch({ type: "SET_TYPOGRAPHY_EMBED_STATUS", id, status });
    },
    []
  );

  const addColor = useCallback((token: ColorToken): boolean => {
    if (
      state.color.some((t) => t.id === token.id || t.name === token.name)
    ) {
      return false;
    }
    dispatch({ type: "ADD_COLOR", token });
    dispatch({ type: "SET_PREVIEW_STATUS", status: "live" });
    return true;
  }, [state.color]);

  const updateSpacingBase = useCallback(
    (value: string) => {
      const unit = Math.round(parseFloat(value));
      if (!Number.isFinite(unit) || unit <= 0) return;
      runPreviewCascade(() => {
        const updates = [
          { id: "spacing-base", field: "value", value: `${unit}px` },
          ...SPACING_SCALE_MULTIPLIERS.map(({ id, multiplier }) => ({
            id,
            field: "value",
            value: `${unit * multiplier}px`,
          })),
        ];
        dispatch({ type: "BATCH_UPDATE", category: "spacing", updates });
      });
    },
    [runPreviewCascade]
  );

  const batchUpdate = useCallback(
    (
      category: TokenStoreCategory,
      updates: { id: string; field: string; value: string }[]
    ) => {
      dispatch({ type: "BATCH_UPDATE", category, updates });
    },
    []
  );

  const resetCategory = useCallback((category: TokenStoreCategory) => {
    dispatch({ type: "RESET_CATEGORY", category });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const value = useMemo<TokenStoreContextValue>(
    () => ({
      state,
      hydrated,
      canUndo: state.historyIndex >= 0,
      canRedo: state.historyIndex < state.history.length - 1,
      selectedColor,
      selectedTypography,
      selectedSpacing,
      selectedRadius,
      selectedShadow,
      selectedComponent,
      selectedTheme,
      colorsByGroup,
      designSystem,
      tokenMap,
      typographyTokenMap,
      spacingTokenMap,
      radiusTokenMap,
      shadowTokenMap,
      setActiveCategory,
      selectColor,
      selectTypography,
      selectSpacing,
      selectRadius,
      selectShadow,
      selectComponent,
      selectTheme,
      setPreviewTheme,
      addTheme,
      setThemeOverride,
      setCodeTab,
      setNamespace,
      updateTokenField,
      updateColorValue,
      updateGradient,
      updateScaleStep,
      resetScaleStep,
      updateStepRef,
      updateColorRef,
      updateTokenRef,
      setTypographyEmbed,
      clearTypographyEmbed,
      setTypographyEmbedStatus,
      addColor,
      updateSpacingBase,
      setPreviewStatus,
      runPreviewCascade,
      batchUpdate,
      resetCategory,
      resetAll,
      undo,
      redo,
    }),
    [
      state,
      hydrated,
      selectedColor,
      selectedTypography,
      selectedSpacing,
      selectedRadius,
      selectedShadow,
      selectedComponent,
      selectedTheme,
      colorsByGroup,
      designSystem,
      tokenMap,
      typographyTokenMap,
      spacingTokenMap,
      radiusTokenMap,
      shadowTokenMap,
      setActiveCategory,
      selectColor,
      selectTypography,
      selectSpacing,
      selectRadius,
      selectShadow,
      selectComponent,
      selectTheme,
      setPreviewTheme,
      addTheme,
      setThemeOverride,
      setCodeTab,
      setNamespace,
      updateTokenField,
      updateColorValue,
      updateGradient,
      updateScaleStep,
      resetScaleStep,
      updateStepRef,
      updateColorRef,
      updateTokenRef,
      setTypographyEmbed,
      clearTypographyEmbed,
      setTypographyEmbedStatus,
      addColor,
      updateSpacingBase,
      setPreviewStatus,
      runPreviewCascade,
      batchUpdate,
      resetCategory,
      resetAll,
      undo,
      redo,
    ]
  );

  return (
    <TokenStoreContext.Provider value={value}>{children}</TokenStoreContext.Provider>
  );
}

export function useTokenStore(): TokenStoreContextValue {
  const ctx = useContext(TokenStoreContext);
  if (!ctx) {
    throw new Error("useTokenStore must be used within TokenStoreProvider");
  }
  return ctx;
}
