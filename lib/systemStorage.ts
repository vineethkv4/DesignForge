import {
  compileLinearGradient,
  generateScaleFromAnchor,
  genScale,
  getScaleStepHex,
  getWcagLevel,
  slugifySystemName,
} from "@/lib/colorScale";
import { DEMO_SYSTEMS } from "@/lib/demoData";
import {
  DEMO_BORDER_RADIUS_TOKENS,
  DEMO_COLOR_TOKENS,
  DEMO_COMPONENT_TOKENS,
  DEMO_SHADOW_TOKENS,
  DEMO_SPACING_TOKENS,
  DEMO_TYPOGRAPHY_TOKENS,
  SYSTEM_NAMES,
} from "@/lib/demoTokens";
import { seedDefaultThemes } from "@/lib/themeResolve";
import type {
  DesignSystem,
  PublishedSnapshot,
  StoredSystemMeta,
  SystemStatus,
} from "@/types/dashboard";
import type { SavedOnboardingData } from "@/types/onboarding";
import type { ColorToken, DesignToken } from "@/types/tokens";

export const SYSTEMS_STORAGE_KEY = "df_systems";
export const DELETED_SYSTEMS_KEY = "df_deleted_systems";

function tokensKey(systemId: string) {
  return `df_tokens_${systemId}`;
}

function editorMetaKey(systemId: string) {
  return `df_editor_${systemId}`;
}

function categoryKey(kind: string, systemId: string) {
  return `df_${kind}_${systemId}`;
}

export function publishedSnapshotKey(systemId: string) {
  return `df_published_${systemId}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Normalize old string entries and partial objects into StoredSystemMeta. */
export function normalizeStoredSystemMeta(raw: unknown): StoredSystemMeta {
  const now = nowIso();
  if (typeof raw === "string") {
    return {
      name: raw,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Partial<StoredSystemMeta> & { name?: string };
    const status: SystemStatus =
      o.status === "published" ? "published" : "draft";
    return {
      name: typeof o.name === "string" && o.name.trim() ? o.name : "My System",
      status,
      createdAt: typeof o.createdAt === "string" ? o.createdAt : now,
      updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : now,
      ...(typeof o.publishedAt === "string"
        ? { publishedAt: o.publishedAt }
        : status === "published"
          ? { publishedAt: o.updatedAt ?? now }
          : {}),
    };
  }
  return {
    name: "My System",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

function loadDeletedIdsArray(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_SYSTEMS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveDeletedIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DELETED_SYSTEMS_KEY, JSON.stringify(ids));
}

export function isSystemDeleted(systemId: string): boolean {
  return loadDeletedIdsArray().includes(systemId);
}

/** Removes a system from the dashboard and clears persisted token data. */
export function deleteSystem(systemId: string): void {
  if (typeof window === "undefined") return;

  const deleted = loadDeletedIdsArray();
  if (!deleted.includes(systemId)) {
    deleted.push(systemId);
    saveDeletedIds(deleted);
  }

  const systems = loadSystemsMap();
  if (systemId in systems) {
    delete systems[systemId];
    persistSystemsMap(systems);
  }

  localStorage.removeItem(tokensKey(systemId));
  localStorage.removeItem(editorMetaKey(systemId));
  localStorage.removeItem(publishedSnapshotKey(systemId));
  for (const kind of [
    "typography",
    "spacing",
    "radius",
    "shadow",
    "theme",
    "component",
  ]) {
    localStorage.removeItem(categoryKey(kind, systemId));
  }
}

export function loadDeletedSystemIds(): string[] {
  return loadDeletedIdsArray();
}

function persistSystemsMap(map: Record<string, StoredSystemMeta>): void {
  localStorage.setItem(SYSTEMS_STORAGE_KEY, JSON.stringify(map));
}

/**
 * Load df_systems as upgraded meta objects.
 * Plain-string legacy values are normalized in memory only; the upgraded shape
 * is persisted on the next write (upsertSystemMeta / deleteSystem / etc.).
 */
function loadSystemsMap(): Record<string, StoredSystemMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SYSTEMS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const out: Record<string, StoredSystemMeta> = {};
    for (const [id, value] of Object.entries(parsed)) {
      out[id] = normalizeStoredSystemMeta(value);
    }
    return out;
  } catch {
    return {};
  }
}

export function getSystemName(systemId: string): string {
  const fromStorage = loadSystemsMap()[systemId];
  if (fromStorage?.name) return fromStorage.name;
  return SYSTEM_NAMES[systemId] ?? "My System";
}

export function getSystemMeta(systemId: string): StoredSystemMeta | null {
  return loadSystemsMap()[systemId] ?? null;
}

/** Upsert a system meta record (new shape). Preserves createdAt when updating. */
export function upsertSystemMeta(
  systemId: string,
  patch: Partial<StoredSystemMeta> & { name: string }
): StoredSystemMeta {
  const systems = loadSystemsMap();
  const existing = systems[systemId];
  const now = nowIso();
  const next: StoredSystemMeta = {
    name: patch.name,
    status: patch.status ?? existing?.status ?? "draft",
    createdAt: existing?.createdAt ?? patch.createdAt ?? now,
    updatedAt: patch.updatedAt ?? now,
    ...(patch.publishedAt !== undefined
      ? { publishedAt: patch.publishedAt }
      : existing?.publishedAt
        ? { publishedAt: existing.publishedAt }
        : {}),
  };
  if (next.status === "published" && !next.publishedAt) {
    next.publishedAt = now;
  }
  systems[systemId] = next;
  persistSystemsMap(systems);
  return next;
}

/** @deprecated Prefer upsertSystemMeta — kept for callers that only set a name. */
export function saveSystemName(systemId: string, name: string): void {
  upsertSystemMeta(systemId, { name, updatedAt: nowIso() });
}

/** Status from df_systems; missing / legacy entries count as draft. */
export function getSystemStatus(systemId: string): SystemStatus {
  return getSystemMeta(systemId)?.status ?? "draft";
}

function readCategoryArray(systemId: string, kind: string): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const key =
      kind === "tokens" ? tokensKey(systemId) : categoryKey(kind, systemId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Live editor keys → publish blob shape (does not touch df_published_*). */
export function readLiveCategorySnapshot(systemId: string): PublishedSnapshot {
  return {
    tokens: readCategoryArray(systemId, "tokens"),
    typography: readCategoryArray(systemId, "typography"),
    spacing: readCategoryArray(systemId, "spacing"),
    radius: readCategoryArray(systemId, "radius"),
    shadow: readCategoryArray(systemId, "shadow"),
    theme: readCategoryArray(systemId, "theme"),
    component: readCategoryArray(systemId, "component"),
  };
}

export function loadPublishedSnapshot(
  systemId: string
): PublishedSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(publishedSnapshotKey(systemId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PublishedSnapshot>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [],
      typography: Array.isArray(parsed.typography) ? parsed.typography : [],
      spacing: Array.isArray(parsed.spacing) ? parsed.spacing : [],
      radius: Array.isArray(parsed.radius) ? parsed.radius : [],
      shadow: Array.isArray(parsed.shadow) ? parsed.shadow : [],
      theme: Array.isArray(parsed.theme) ? parsed.theme : [],
      component: Array.isArray(parsed.component) ? parsed.component : [],
    };
  } catch {
    return null;
  }
}

/**
 * Snapshot live category keys into df_published_{systemId} and mark published.
 * Editor keeps writing df_{kind}_{systemId}; this blob only updates on convert.
 */
export function convertToDesignSystem(
  systemId: string,
  liveSnapshot?: PublishedSnapshot
): StoredSystemMeta {
  if (typeof window === "undefined") {
    return {
      name: "My System",
      status: "published",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      publishedAt: nowIso(),
    };
  }

  const snapshot = liveSnapshot ?? readLiveCategorySnapshot(systemId);
  const blob: PublishedSnapshot = {
    tokens: snapshot.tokens ?? [],
    typography: snapshot.typography ?? [],
    spacing: snapshot.spacing ?? [],
    radius: snapshot.radius ?? [],
    shadow: snapshot.shadow ?? [],
    theme: snapshot.theme ?? [],
    component: snapshot.component ?? [],
  };

  // Single atomic write — avoids partial per-category published keys.
  localStorage.setItem(publishedSnapshotKey(systemId), JSON.stringify(blob));

  const now = nowIso();
  return upsertSystemMeta(systemId, {
    name: getSystemName(systemId),
    status: "published",
    updatedAt: now,
    publishedAt: now,
  });
}

/** Per-system editor chrome prefs (namespace, live-preview theme, …). */
export interface EditorMeta {
  namespace?: string;
  /** Live Preview theme only — not the Themes panel selection. */
  previewThemeId?: string;
}

export function getEditorMeta(systemId: string): EditorMeta {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(editorMetaKey(systemId));
    if (!raw) return {};
    const meta = JSON.parse(raw) as EditorMeta;
    return meta && typeof meta === "object" ? meta : {};
  } catch {
    return {};
  }
}

/** Merge-patch `df_editor_{systemId}` without wiping sibling keys. */
export function patchEditorMeta(systemId: string, patch: EditorMeta): void {
  if (typeof window === "undefined") return;
  try {
    const next = { ...getEditorMeta(systemId), ...patch };
    localStorage.setItem(editorMetaKey(systemId), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getEditorNamespace(systemId: string): string | null {
  return getEditorMeta(systemId).namespace ?? null;
}

export function getEditorPreviewThemeId(systemId: string): string | null {
  const id = getEditorMeta(systemId).previewThemeId;
  return typeof id === "string" && id ? id : null;
}

/**
 * Seed color tokens from a brand hex — same path onboarding uses.
 * Exported so the dashboard "New design system" flow can reuse it.
 */
export function buildTokensFromBrandColor(brandColor: string): ColorToken[] {
  const scale = generateScaleFromAnchor(brandColor);
  const primaryHover = getScaleStepHex(scale, 600) ?? brandColor;
  const primarySubtle = getScaleStepHex(scale, 50) ?? brandColor;
  const c500 = getScaleStepHex(scale, 500) ?? brandColor;
  const c600 = getScaleStepHex(scale, 600) ?? brandColor;

  return DEMO_COLOR_TOKENS.map((token) => {
    if (token.id === "primary") {
      return {
        ...token,
        value: brandColor,
        wcag: getWcagLevel(brandColor),
        scale,
        usedBy: [...token.usedBy],
      };
    }
    if (token.id === "primary-hover") {
      return {
        ...token,
        value: primaryHover,
        wcag: getWcagLevel(primaryHover),
        stepRef: 600 as const,
        scaleOf: "primary",
        usedBy: [...token.usedBy],
      };
    }
    if (token.id === "primary-subtle") {
      return {
        ...token,
        value: primarySubtle,
        wcag: getWcagLevel(primarySubtle),
        stepRef: 50 as const,
        scaleOf: "primary",
        usedBy: [...token.usedBy],
      };
    }
    if (token.id === "gradient-brand" && token.gradient) {
      const gradient = {
        angle: token.gradient.angle,
        from: { color: c500, opacity: 100 },
        to: { color: c600, opacity: 100 },
      };
      return {
        ...token,
        usedBy: [...token.usedBy],
        gradient,
        value: compileLinearGradient(gradient),
        wcag: getWcagLevel(c500),
      };
    }
    if (token.id === "gradient-cool" && token.gradient) {
      // No secondary at seed time → primary 500/600 at 50% opacity.
      const gradient = {
        angle: token.gradient.angle,
        from: { color: c500, opacity: 50 },
        to: { color: c600, opacity: 50 },
      };
      return {
        ...token,
        usedBy: [...token.usedBy],
        gradient,
        value: compileLinearGradient(gradient),
        wcag: getWcagLevel(c500),
      };
    }
    return {
      ...token,
      usedBy: [...token.usedBy],
      scale: token.scale?.map((s) => ({ ...s })),
      gradient: token.gradient
        ? {
            angle: token.gradient.angle,
            from: { ...token.gradient.from },
            to: { ...token.gradient.to },
          }
        : undefined,
    };
  });
}

function cloneDemoList<T extends DesignToken>(tokens: T[]): T[] {
  return tokens.map((t) => ({ ...t, usedBy: [...t.usedBy] }));
}

/** Write all category keys for a system (colors from brand; others from demo defaults). */
function seedAllCategoryKeys(systemId: string, brandColor: string): void {
  const colors = buildTokensFromBrandColor(brandColor);
  localStorage.setItem(tokensKey(systemId), JSON.stringify(colors));
  localStorage.setItem(
    categoryKey("typography", systemId),
    JSON.stringify(cloneDemoList(DEMO_TYPOGRAPHY_TOKENS))
  );
  localStorage.setItem(
    categoryKey("spacing", systemId),
    JSON.stringify(cloneDemoList(DEMO_SPACING_TOKENS))
  );
  localStorage.setItem(
    categoryKey("radius", systemId),
    JSON.stringify(cloneDemoList(DEMO_BORDER_RADIUS_TOKENS))
  );
  localStorage.setItem(
    categoryKey("shadow", systemId),
    JSON.stringify(cloneDemoList(DEMO_SHADOW_TOKENS))
  );
  localStorage.setItem(
    categoryKey("theme", systemId),
    JSON.stringify(seedDefaultThemes())
  );
  localStorage.setItem(
    categoryKey("component", systemId),
    JSON.stringify(cloneDemoList(DEMO_COMPONENT_TOKENS))
  );
}

/** Creates token + metadata entries for a new system from onboarding choices. */
export function seedSystemFromOnboarding(data: SavedOnboardingData): string {
  const systemId = data.systemId ?? String(Date.now());

  if (typeof window === "undefined") return systemId;

  seedAllCategoryKeys(systemId, data.brandColor);
  localStorage.setItem(
    editorMetaKey(systemId),
    JSON.stringify({ namespace: slugifySystemName(data.systemName) })
  );
  upsertSystemMeta(systemId, {
    name: data.systemName,
    status: "draft",
    updatedAt: nowIso(),
  });

  return systemId;
}

/**
 * Lightweight post-onboarding create path — not the full wizard.
 * Seeds tokens via buildTokensFromBrandColor and opens as draft.
 */
export function createDraftDesignSystem(input: {
  name: string;
  brandColor: string;
}): { systemId: string; system: DesignSystem } {
  const systemId = String(Date.now());
  const name = input.name.trim() || "Untitled system";
  const brandColor = input.brandColor;

  if (typeof window !== "undefined") {
    seedAllCategoryKeys(systemId, brandColor);
    localStorage.setItem(
      editorMetaKey(systemId),
      JSON.stringify({ namespace: slugifySystemName(name) })
    );
    upsertSystemMeta(systemId, {
      name,
      status: "draft",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  const tokens = buildTokensFromBrandColor(brandColor);
  const system: DesignSystem = {
    id: systemId,
    name,
    status: "draft",
    plan: "free",
    palette: buildPaletteFromColorTokens(tokens),
    tokenCount: tokens.length,
    updatedAt: "Just now",
    createdAt: nowIso(),
  };

  return { systemId, system };
}

/** Load persisted color tokens for a system (editor writes `df_tokens_{id}`). */
export function loadColorTokensForSystem(systemId: string): ColorToken[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(tokensKey(systemId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ColorToken[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Dashboard swatch strip from live editor colors.
 * Order: primary → subtle/scale-200 → success → warning.
 */
export function buildPaletteFromColorTokens(tokens: ColorToken[]): string[] {
  const byId = (id: string) => tokens.find((t) => t.id === id);

  const primary = byId("primary");
  const primaryHex = primary?.value?.startsWith("#")
    ? primary.value.slice(0, 7)
    : "#7733FF";

  const fromScale =
    getScaleStepHex(primary?.scale, 200) ??
    byId("primary-subtle")?.value ??
    genScale(primaryHex)[2];

  const subtle = (fromScale ?? "#c4b5fd").startsWith("#")
    ? (fromScale ?? "#c4b5fd").slice(0, 7)
    : "#c4b5fd";

  const success = (byId("success")?.value ?? "#10b981").slice(0, 7);
  const warning = (byId("warning")?.value ?? "#f59e0b").slice(0, 7);

  return [primaryHex, subtle, success, warning];
}

/** Relative label for ISO timestamps (dashboard + published view). */
export function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return "Just now";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "Just now";
  const diffMs = Date.now() - t;
  if (diffMs < 60_000) return "Just now";
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  if (diffMs < 172_800_000) return "Yesterday";
  return new Date(t).toLocaleDateString();
}

function formatUpdatedLabel(iso: string | undefined): string {
  return formatRelativeTime(iso);
}

/** True when status is published and a frozen snapshot blob exists. */
export function canViewPublishedSystem(systemId: string): boolean {
  return (
    getSystemStatus(systemId) === "published" &&
    loadPublishedSnapshot(systemId) !== null
  );
}

/** Overlay palette / token count from editor storage when present. */
export function hydrateSystemFromTokenStorage(
  system: DesignSystem
): DesignSystem {
  const tokens = loadColorTokensForSystem(system.id);
  const meta = getSystemMeta(system.id);

  let tokenCount = system.tokenCount;
  if (tokens?.length) {
    tokenCount = tokens.length;
    for (const kind of ["typography", "spacing", "radius", "shadow"] as const) {
      try {
        const raw = localStorage.getItem(categoryKey(kind, system.id));
        if (raw) {
          const arr = JSON.parse(raw) as unknown[];
          if (Array.isArray(arr)) tokenCount += arr.length;
        }
      } catch {
        /* ignore */
      }
    }
  }

  return {
    ...system,
    name: meta?.name ?? system.name,
    status: meta?.status ?? system.status,
    createdAt: meta?.createdAt ?? system.createdAt,
    publishedAt: meta?.publishedAt ?? system.publishedAt,
    updatedAt: meta?.updatedAt
      ? formatUpdatedLabel(meta.updatedAt)
      : system.updatedAt,
    palette: tokens?.length
      ? buildPaletteFromColorTokens(tokens)
      : system.palette,
    tokenCount,
  };
}

/** User-created systems persisted in localStorage (from onboarding or new-system modal). */
export function loadStoredSystems(): DesignSystem[] {
  if (typeof window === "undefined") return [];

  const systemsMap = loadSystemsMap();

  return Object.entries(systemsMap).map(([id, meta]) => {
    const tokens = loadColorTokensForSystem(id);
    const primaryHex =
      tokens?.find((t) => t.id === "primary")?.value?.slice(0, 7) ?? "#7733FF";

    return hydrateSystemFromTokenStorage({
      id,
      name: meta.name,
      status: meta.status,
      plan: "free" as const,
      palette: [
        primaryHex,
        genScale(primaryHex)[2] ?? "#c4b5fd",
        "#10b981",
        "#f59e0b",
      ],
      tokenCount: tokens?.length ?? 0,
      updatedAt: formatUpdatedLabel(meta.updatedAt),
      createdAt: meta.createdAt,
      publishedAt: meta.publishedAt,
    });
  });
}

/** Same merge the dashboard uses: stored + demo, minus deleted, with live palettes. */
export function loadMergedDashboardSystems(): DesignSystem[] {
  if (typeof window === "undefined") return DEMO_SYSTEMS;
  const deleted = new Set(loadDeletedSystemIds());
  const stored = loadStoredSystems();
  const storedIds = new Set(stored.map((s) => s.id));
  const merged = [
    ...stored,
    ...DEMO_SYSTEMS.filter((s) => !storedIds.has(s.id)),
  ].filter((s) => !deleted.has(s.id));
  return merged.map(hydrateSystemFromTokenStorage);
}

/**
 * Published systems that have a frozen snapshot — for the design-system switcher.
 * Drafts and published-without-snapshot are excluded.
 */
export function loadPublishedSwitcherSystems(): DesignSystem[] {
  return loadMergedDashboardSystems().filter(
    (s) => s.status === "published" && canViewPublishedSystem(s.id)
  );
}
