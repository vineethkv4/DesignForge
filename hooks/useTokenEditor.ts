"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { getWcagLevel } from "@/lib/colorScale";
import {
  DEMO_BORDER_RADIUS_TOKENS,
  DEMO_COLOR_TOKENS,
  DEMO_SHADOW_TOKENS,
  DEMO_SPACING_TOKENS,
  DEMO_TYPOGRAPHY_TOKENS,
} from "@/lib/demoTokens";
import { getEditorNamespace } from "@/lib/systemStorage";
import type {
  BorderRadiusToken,
  CodeTab,
  ColorToken,
  DesignToken,
  ShadowToken,
  SpacingToken,
  TokenCategory,
  TokenChange,
  TypographyToken,
} from "@/types/tokens";

const MAX_HISTORY = 50;

interface EditorState {
  tokens: ColorToken[];
  typographyTokens: TypographyToken[];
  spacingTokens: SpacingToken[];
  borderRadiusTokens: BorderRadiusToken[];
  shadowTokens: ShadowToken[];
  selectedTokenId: string | null;
  category: TokenCategory;
  codeTab: CodeTab;
  namespace: string;
  history: TokenChange[];
  historyIndex: number;
}

type EditorAction =
  | { type: "SET_TOKENS"; tokens: ColorToken[] }
  | { type: "SET_TYPOGRAPHY_TOKENS"; tokens: TypographyToken[] }
  | { type: "SET_SPACING_TOKENS"; tokens: SpacingToken[] }
  | { type: "SET_BORDER_RADIUS_TOKENS"; tokens: BorderRadiusToken[] }
  | { type: "SET_SHADOW_TOKENS"; tokens: ShadowToken[] }
  | { type: "SELECT_TOKEN"; id: string | null }
  | { type: "SET_CATEGORY"; category: TokenCategory }
  | { type: "SET_CODE_TAB"; tab: CodeTab }
  | { type: "SET_NAMESPACE"; namespace: string }
  | { type: "UPDATE_TOKEN"; tokenId: string; value: string }
  | { type: "UPDATE_TYPOGRAPHY_TOKEN"; tokenId: string; value: string }
  | { type: "UPDATE_SPACING_TOKEN"; tokenId: string; value: string }
  | {
      type: "BATCH_UPDATE_SPACING";
      updates: { tokenId: string; value: string }[];
    }
  | { type: "UPDATE_BORDER_RADIUS_TOKEN"; tokenId: string; value: string }
  | { type: "UPDATE_SHADOW_TOKEN"; tokenId: string; value: string }
  | { type: "RESET_CATEGORY"; category: TokenCategory }
  | { type: "RESET_ALL" }
  | { type: "UNDO" }
  | { type: "REDO" };

function cloneDemoColors(): ColorToken[] {
  return DEMO_COLOR_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}

function cloneDemoTypography(): TypographyToken[] {
  return DEMO_TYPOGRAPHY_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}

function cloneDemoSpacing(): SpacingToken[] {
  return DEMO_SPACING_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}

function cloneDemoBorderRadius(): BorderRadiusToken[] {
  return DEMO_BORDER_RADIUS_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}

function cloneDemoShadows(): ShadowToken[] {
  return DEMO_SHADOW_TOKENS.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}

function storageKey(systemId: string) {
  return `df_tokens_${systemId}`;
}

function typographyStorageKey(systemId: string) {
  return `df_typography_${systemId}`;
}

function spacingStorageKey(systemId: string) {
  return `df_spacing_${systemId}`;
}

function borderRadiusStorageKey(systemId: string) {
  return `df_radius_${systemId}`;
}

function shadowStorageKey(systemId: string) {
  return `df_shadow_${systemId}`;
}

function normalizeToken(partial: Partial<ColorToken>, fallback: ColorToken): ColorToken {
  const value = partial.value ?? fallback.value;
  return {
    id: partial.id ?? fallback.id,
    name: partial.name ?? fallback.name,
    value,
    alias: partial.alias ?? fallback.alias,
    wcag: partial.wcag ?? getWcagLevel(value),
    group: partial.group ?? fallback.group,
    usedBy: partial.usedBy ?? fallback.usedBy,
  };
}

function normalizeTypographyToken(
  partial: Partial<TypographyToken>,
  fallback: TypographyToken
): TypographyToken {
  return {
    id: partial.id ?? fallback.id,
    name: partial.name ?? fallback.name,
    value: partial.value ?? fallback.value,
    alias: partial.alias ?? fallback.alias,
    group: partial.group ?? fallback.group,
    usedBy: partial.usedBy ?? fallback.usedBy,
  };
}

function normalizeSpacingToken(
  partial: Partial<SpacingToken>,
  fallback: SpacingToken
): SpacingToken {
  return {
    id: partial.id ?? fallback.id,
    name: partial.name ?? fallback.name,
    value: partial.value ?? fallback.value,
    alias: partial.alias ?? fallback.alias,
    group: partial.group ?? fallback.group,
    usedBy: partial.usedBy ?? fallback.usedBy,
  };
}

function normalizeBorderRadiusToken(
  partial: Partial<BorderRadiusToken>,
  fallback: BorderRadiusToken
): BorderRadiusToken {
  return {
    id: partial.id ?? fallback.id,
    name: partial.name ?? fallback.name,
    value: partial.value ?? fallback.value,
    alias: partial.alias ?? fallback.alias,
    group: partial.group ?? fallback.group,
    usedBy: partial.usedBy ?? fallback.usedBy,
  };
}

function normalizeShadowToken(
  partial: Partial<ShadowToken>,
  fallback: ShadowToken
): ShadowToken {
  return {
    id: partial.id ?? fallback.id,
    name: partial.name ?? fallback.name,
    value: partial.value ?? fallback.value,
    alias: partial.alias ?? fallback.alias,
    group: partial.group ?? fallback.group,
    usedBy: partial.usedBy ?? fallback.usedBy,
  };
}

function loadTokens(systemId: string): ColorToken[] {
  if (typeof window === "undefined") return cloneDemoColors();
  try {
    const raw = localStorage.getItem(storageKey(systemId));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<ColorToken>[];
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        return DEMO_COLOR_TOKENS.map((fallback) => {
          const saved = parsed.find((t) => t.id === fallback.id);
          return saved ? normalizeToken(saved, fallback) : fallback;
        });
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return cloneDemoColors();
}

function loadTypographyTokens(systemId: string): TypographyToken[] {
  if (typeof window === "undefined") return cloneDemoTypography();
  try {
    const raw = localStorage.getItem(typographyStorageKey(systemId));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<TypographyToken>[];
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        return DEMO_TYPOGRAPHY_TOKENS.map((fallback) => {
          const saved = parsed.find((t) => t.id === fallback.id);
          return saved ? normalizeTypographyToken(saved, fallback) : fallback;
        });
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return cloneDemoTypography();
}

function loadSpacingTokens(systemId: string): SpacingToken[] {
  if (typeof window === "undefined") return cloneDemoSpacing();
  try {
    const raw = localStorage.getItem(spacingStorageKey(systemId));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<SpacingToken>[];
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        return DEMO_SPACING_TOKENS.map((fallback) => {
          const saved = parsed.find((t) => t.id === fallback.id);
          return saved ? normalizeSpacingToken(saved, fallback) : fallback;
        });
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return cloneDemoSpacing();
}

function loadBorderRadiusTokens(systemId: string): BorderRadiusToken[] {
  if (typeof window === "undefined") return cloneDemoBorderRadius();
  try {
    const raw = localStorage.getItem(borderRadiusStorageKey(systemId));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<BorderRadiusToken>[];
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        return DEMO_BORDER_RADIUS_TOKENS.map((fallback) => {
          const saved = parsed.find((t) => t.id === fallback.id);
          return saved ? normalizeBorderRadiusToken(saved, fallback) : fallback;
        });
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return cloneDemoBorderRadius();
}

function loadShadowTokens(systemId: string): ShadowToken[] {
  if (typeof window === "undefined") return cloneDemoShadows();
  try {
    const raw = localStorage.getItem(shadowStorageKey(systemId));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as Partial<ShadowToken>[];
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return [];
        return DEMO_SHADOW_TOKENS.map((fallback) => {
          const saved = parsed.find((t) => t.id === fallback.id);
          return saved ? normalizeShadowToken(saved, fallback) : fallback;
        });
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return cloneDemoShadows();
}

function saveTokens(systemId: string, tokens: ColorToken[]) {
  try {
    localStorage.setItem(storageKey(systemId), JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}

function saveTypographyTokens(systemId: string, tokens: TypographyToken[]) {
  try {
    localStorage.setItem(typographyStorageKey(systemId), JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}

function saveSpacingTokens(systemId: string, tokens: SpacingToken[]) {
  try {
    localStorage.setItem(spacingStorageKey(systemId), JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}

function saveBorderRadiusTokens(systemId: string, tokens: BorderRadiusToken[]) {
  try {
    localStorage.setItem(borderRadiusStorageKey(systemId), JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}

function saveShadowTokens(systemId: string, tokens: ShadowToken[]) {
  try {
    localStorage.setItem(shadowStorageKey(systemId), JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}

function applyChangeValue(
  state: EditorState,
  change: TokenChange,
  value: string
): EditorState {
  if (change.category === "typography") {
    return {
      ...state,
      typographyTokens: state.typographyTokens.map((t) =>
        t.id === change.tokenId ? { ...t, value } : t
      ),
    };
  }
  if (change.category === "spacing") {
    return {
      ...state,
      spacingTokens: state.spacingTokens.map((t) =>
        t.id === change.tokenId ? { ...t, value } : t
      ),
    };
  }
  if (change.category === "radius") {
    return {
      ...state,
      borderRadiusTokens: state.borderRadiusTokens.map((t) =>
        t.id === change.tokenId ? { ...t, value } : t
      ),
    };
  }
  if (change.category === "shadow") {
    return {
      ...state,
      shadowTokens: state.shadowTokens.map((t) =>
        t.id === change.tokenId ? { ...t, value } : t
      ),
    };
  }
  return {
    ...state,
    tokens: state.tokens.map((t) =>
      t.id === change.tokenId ? { ...t, value, wcag: getWcagLevel(value) } : t
    ),
  };
}

function pushHistory(
  state: EditorState,
  change: TokenChange
): Pick<EditorState, "history" | "historyIndex"> {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  const history = [...trimmed, change].slice(-MAX_HISTORY);
  return { history, historyIndex: history.length - 1 };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_TOKENS":
      return { ...state, tokens: action.tokens };
    case "SET_TYPOGRAPHY_TOKENS":
      return { ...state, typographyTokens: action.tokens };
    case "SET_SPACING_TOKENS":
      return { ...state, spacingTokens: action.tokens };
    case "SET_BORDER_RADIUS_TOKENS":
      return { ...state, borderRadiusTokens: action.tokens };
    case "SET_SHADOW_TOKENS":
      return { ...state, shadowTokens: action.tokens };
    case "SELECT_TOKEN":
      return { ...state, selectedTokenId: action.id };
    case "SET_CATEGORY":
      return { ...state, category: action.category };
    case "SET_CODE_TAB":
      return { ...state, codeTab: action.tab };
    case "SET_NAMESPACE":
      return { ...state, namespace: action.namespace };
    case "UPDATE_TOKEN": {
      const token = state.tokens.find((t) => t.id === action.tokenId);
      if (!token || token.value === action.value) return state;

      const change: TokenChange = {
        tokenId: action.tokenId,
        previousValue: token.value,
        newValue: action.value,
        timestamp: Date.now(),
        category: "color",
      };

      const updated = state.tokens.map((t) =>
        t.id === action.tokenId
          ? { ...t, value: action.value, wcag: getWcagLevel(action.value) }
          : t
      );

      return {
        ...state,
        tokens: updated,
        ...pushHistory(state, change),
      };
    }
    case "UPDATE_TYPOGRAPHY_TOKEN": {
      const token = state.typographyTokens.find((t) => t.id === action.tokenId);
      if (!token || token.value === action.value) return state;

      const change: TokenChange = {
        tokenId: action.tokenId,
        previousValue: token.value,
        newValue: action.value,
        timestamp: Date.now(),
        category: "typography",
      };

      const updated = state.typographyTokens.map((t) =>
        t.id === action.tokenId ? { ...t, value: action.value } : t
      );

      return {
        ...state,
        typographyTokens: updated,
        ...pushHistory(state, change),
      };
    }
    case "UPDATE_SPACING_TOKEN": {
      const token = state.spacingTokens.find((t) => t.id === action.tokenId);
      if (!token || token.value === action.value) return state;

      const change: TokenChange = {
        tokenId: action.tokenId,
        previousValue: token.value,
        newValue: action.value,
        timestamp: Date.now(),
        category: "spacing",
      };

      const updated = state.spacingTokens.map((t) =>
        t.id === action.tokenId ? { ...t, value: action.value } : t
      );

      return {
        ...state,
        spacingTokens: updated,
        ...pushHistory(state, change),
      };
    }
    case "BATCH_UPDATE_SPACING": {
      const timestamp = Date.now();
      const newChanges: TokenChange[] = [];
      let updated = state.spacingTokens;

      for (const { tokenId, value } of action.updates) {
        const token = updated.find((t) => t.id === tokenId);
        if (!token || token.value === value) continue;

        newChanges.push({
          tokenId,
          previousValue: token.value,
          newValue: value,
          timestamp,
          category: "spacing",
        });
        updated = updated.map((t) => (t.id === tokenId ? { ...t, value } : t));
      }

      if (newChanges.length === 0) return state;

      const trimmed = state.history.slice(0, state.historyIndex + 1);
      const history = [...trimmed, ...newChanges].slice(-MAX_HISTORY);

      return {
        ...state,
        spacingTokens: updated,
        history,
        historyIndex: history.length - 1,
      };
    }
    case "UPDATE_BORDER_RADIUS_TOKEN": {
      const token = state.borderRadiusTokens.find((t) => t.id === action.tokenId);
      if (!token || token.value === action.value) return state;
      // full radius is locked
      if (token.id === "radius-full") return state;

      const change: TokenChange = {
        tokenId: action.tokenId,
        previousValue: token.value,
        newValue: action.value,
        timestamp: Date.now(),
        category: "radius",
      };

      const updated = state.borderRadiusTokens.map((t) =>
        t.id === action.tokenId ? { ...t, value: action.value } : t
      );

      return {
        ...state,
        borderRadiusTokens: updated,
        ...pushHistory(state, change),
      };
    }
    case "UPDATE_SHADOW_TOKEN": {
      const token = state.shadowTokens.find((t) => t.id === action.tokenId);
      if (!token || token.value === action.value) return state;

      const change: TokenChange = {
        tokenId: action.tokenId,
        previousValue: token.value,
        newValue: action.value,
        timestamp: Date.now(),
        category: "shadow",
      };

      const updated = state.shadowTokens.map((t) =>
        t.id === action.tokenId ? { ...t, value: action.value } : t
      );

      return {
        ...state,
        shadowTokens: updated,
        ...pushHistory(state, change),
      };
    }
    case "RESET_CATEGORY": {
      switch (action.category) {
        case "color":
          return {
            ...state,
            tokens: cloneDemoColors(),
            selectedTokenId: "primary",
            history: [],
            historyIndex: -1,
          };
        case "typography":
          return {
            ...state,
            typographyTokens: cloneDemoTypography(),
            history: [],
            historyIndex: -1,
          };
        case "spacing":
          return {
            ...state,
            spacingTokens: cloneDemoSpacing(),
            history: [],
            historyIndex: -1,
          };
        case "radius":
          return {
            ...state,
            borderRadiusTokens: cloneDemoBorderRadius(),
            history: [],
            historyIndex: -1,
          };
        case "shadow":
          return {
            ...state,
            shadowTokens: cloneDemoShadows(),
            history: [],
            historyIndex: -1,
          };
        default:
          return state;
      }
    }
    case "RESET_ALL":
      return {
        ...state,
        tokens: cloneDemoColors(),
        typographyTokens: cloneDemoTypography(),
        spacingTokens: cloneDemoSpacing(),
        borderRadiusTokens: cloneDemoBorderRadius(),
        shadowTokens: cloneDemoShadows(),
        selectedTokenId: "primary",
        history: [],
        historyIndex: -1,
      };
    case "UNDO": {
      if (state.historyIndex < 0) return state;
      let index = state.historyIndex;
      const first = state.history[index];
      let next = applyChangeValue(state, first, first.previousValue);
      index -= 1;

      // Undo regenerate as one step (shared timestamp + spacing category)
      while (
        index >= 0 &&
        first.category === "spacing" &&
        state.history[index].category === "spacing" &&
        state.history[index].timestamp === first.timestamp
      ) {
        next = applyChangeValue(next, state.history[index], state.history[index].previousValue);
        index -= 1;
      }

      return { ...next, historyIndex: index };
    }
    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      let index = state.historyIndex + 1;
      const first = state.history[index];
      let next = applyChangeValue(state, first, first.newValue);

      while (
        index + 1 < state.history.length &&
        first.category === "spacing" &&
        state.history[index + 1].category === "spacing" &&
        state.history[index + 1].timestamp === first.timestamp
      ) {
        index += 1;
        next = applyChangeValue(next, state.history[index], state.history[index].newValue);
      }

      return { ...next, historyIndex: index };
    }
    default:
      return state;
  }
}

const initialState: EditorState = {
  tokens: cloneDemoColors(),
  typographyTokens: cloneDemoTypography(),
  spacingTokens: cloneDemoSpacing(),
  borderRadiusTokens: cloneDemoBorderRadius(),
  shadowTokens: cloneDemoShadows(),
  selectedTokenId: "primary",
  category: "color",
  codeTab: "css",
  namespace: "acme",
  history: [],
  historyIndex: -1,
};

export function useTokenEditor(systemId: string) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: "SET_TOKENS", tokens: loadTokens(systemId) });
    dispatch({ type: "SET_TYPOGRAPHY_TOKENS", tokens: loadTypographyTokens(systemId) });
    dispatch({ type: "SET_SPACING_TOKENS", tokens: loadSpacingTokens(systemId) });
    dispatch({ type: "SET_BORDER_RADIUS_TOKENS", tokens: loadBorderRadiusTokens(systemId) });
    dispatch({ type: "SET_SHADOW_TOKENS", tokens: loadShadowTokens(systemId) });

    const namespace = getEditorNamespace(systemId);
    if (namespace) {
      dispatch({ type: "SET_NAMESPACE", namespace });
    }

    setHydrated(true);
  }, [systemId]);

  useEffect(() => {
    if (hydrated) saveTokens(systemId, state.tokens);
  }, [systemId, state.tokens, hydrated]);

  useEffect(() => {
    if (hydrated) saveTypographyTokens(systemId, state.typographyTokens);
  }, [systemId, state.typographyTokens, hydrated]);

  useEffect(() => {
    if (hydrated) saveSpacingTokens(systemId, state.spacingTokens);
  }, [systemId, state.spacingTokens, hydrated]);

  useEffect(() => {
    if (hydrated) saveBorderRadiusTokens(systemId, state.borderRadiusTokens);
  }, [systemId, state.borderRadiusTokens, hydrated]);

  useEffect(() => {
    if (hydrated) saveShadowTokens(systemId, state.shadowTokens);
  }, [systemId, state.shadowTokens, hydrated]);

  const selectedToken = useMemo(
    () => state.tokens.find((t) => t.id === state.selectedTokenId) ?? null,
    [state.tokens, state.selectedTokenId]
  );

  const tokensByGroup = useMemo(() => {
    const groups: Record<string, ColorToken[]> = {
      semantic: [],
      surface: [],
      text: [],
    };
    for (const t of state.tokens) {
      groups[t.group]?.push(t);
    }
    return groups;
  }, [state.tokens]);

  const typographyTokensByGroup = useMemo(() => {
    const groups: Record<string, TypographyToken[]> = {
      family: [],
      size: [],
      weight: [],
      lineHeight: [],
      letterSpacing: [],
    };
    for (const t of state.typographyTokens) {
      groups[t.group]?.push(t);
    }
    return groups;
  }, [state.typographyTokens]);

  const spacingTokensByGroup = useMemo(() => {
    const groups: Record<string, SpacingToken[]> = {
      base: [],
      scale: [],
    };
    for (const t of state.spacingTokens) {
      groups[t.group]?.push(t);
    }
    return groups;
  }, [state.spacingTokens]);

  const borderRadiusTokensByGroup = useMemo(() => {
    const groups: Record<string, BorderRadiusToken[]> = {
      scale: [],
    };
    for (const t of state.borderRadiusTokens) {
      groups[t.group]?.push(t);
    }
    return groups;
  }, [state.borderRadiusTokens]);

  const shadowTokensByGroup = useMemo(() => {
    const groups: Record<string, ShadowToken[]> = {
      elevation: [],
    };
    for (const t of state.shadowTokens) {
      groups[t.group]?.push(t);
    }
    return groups;
  }, [state.shadowTokens]);

  const tokenMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of state.tokens) map[t.id] = t.value;
    return map;
  }, [state.tokens]);

  const typographyTokenMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of state.typographyTokens) map[t.id] = t.value;
    return map;
  }, [state.typographyTokens]);

  const spacingTokenMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of state.spacingTokens) map[t.id] = t.value;
    return map;
  }, [state.spacingTokens]);

  const borderRadiusTokenMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of state.borderRadiusTokens) map[t.id] = t.value;
    return map;
  }, [state.borderRadiusTokens]);

  const shadowTokenMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of state.shadowTokens) map[t.id] = t.value;
    return map;
  }, [state.shadowTokens]);

  const canUndo = state.historyIndex >= 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const selectToken = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_TOKEN", id });
  }, []);

  const setCategory = useCallback((category: TokenCategory) => {
    dispatch({ type: "SET_CATEGORY", category });
  }, []);

  const setCodeTab = useCallback((tab: CodeTab) => {
    dispatch({ type: "SET_CODE_TAB", tab });
  }, []);

  const setNamespace = useCallback((namespace: string) => {
    dispatch({ type: "SET_NAMESPACE", namespace });
  }, []);

  const updateToken = useCallback((tokenId: string, value: string) => {
    dispatch({ type: "UPDATE_TOKEN", tokenId, value });
  }, []);

  const updateTypographyToken = useCallback((tokenId: string, value: string) => {
    dispatch({ type: "UPDATE_TYPOGRAPHY_TOKEN", tokenId, value });
  }, []);

  const updateSpacingToken = useCallback((tokenId: string, value: string) => {
    dispatch({ type: "UPDATE_SPACING_TOKEN", tokenId, value });
  }, []);

  const batchUpdateSpacingTokens = useCallback(
    (updates: { tokenId: string; value: string }[]) => {
      dispatch({ type: "BATCH_UPDATE_SPACING", updates });
    },
    []
  );

  const updateBorderRadiusToken = useCallback((tokenId: string, value: string) => {
    dispatch({ type: "UPDATE_BORDER_RADIUS_TOKEN", tokenId, value });
  }, []);

  const updateShadowToken = useCallback((tokenId: string, value: string) => {
    dispatch({ type: "UPDATE_SHADOW_TOKEN", tokenId, value });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const resetCategory = useCallback((category: TokenCategory) => {
    dispatch({ type: "RESET_CATEGORY", category });
  }, []);

  const resetAllTokens = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  /** Merged design system — single source for export + panel slices */
  const designSystem = useMemo(
    () => ({
      colors: state.tokens,
      typography: state.typographyTokens,
      spacing: state.spacingTokens,
      borderRadius: state.borderRadiusTokens,
      shadows: state.shadowTokens,
      themes: [],
      components: [] as DesignToken[],
    }),
    [
      state.tokens,
      state.typographyTokens,
      state.spacingTokens,
      state.borderRadiusTokens,
      state.shadowTokens,
    ]
  );

  return {
    ...state,
    designSystem,
    hydrated,
    selectedToken,
    tokensByGroup,
    typographyTokensByGroup,
    spacingTokensByGroup,
    borderRadiusTokensByGroup,
    shadowTokensByGroup,
    tokenMap,
    typographyTokenMap,
    spacingTokenMap,
    borderRadiusTokenMap,
    shadowTokenMap,
    canUndo,
    canRedo,
    selectToken,
    setCategory,
    setCodeTab,
    setNamespace,
    updateToken,
    updateTypographyToken,
    updateSpacingToken,
    batchUpdateSpacingTokens,
    updateBorderRadiusToken,
    updateShadowToken,
    undo,
    redo,
    resetCategory,
    resetAllTokens,
  };
}
