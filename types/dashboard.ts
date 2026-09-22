export type SystemStatus = "published" | "draft";
export type SystemPlan = "free" | "pro";
export type SystemFilter = "all" | "published" | "draft" | "pro";

/** Persisted value shape for `df_systems[systemId]` (upgraded from bare name string). */
export interface StoredSystemMeta {
  name: string;
  status: SystemStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DesignSystem {
  id: string;
  name: string;
  status: SystemStatus;
  plan: SystemPlan;
  palette: string[];
  tokenCount: number;
  /** Display string (relative or formatted). */
  updatedAt: string;
  createdAt?: string;
  publishedAt?: string;
}

export interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

export interface DashboardStat {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  delta: string;
  deltaType: "up" | "down";
}

export interface NewSystemData {
  name: string;
  brandColor: string;
}

/** Frozen publish snapshot at `df_published_{systemId}` — not live editor keys. */
export interface PublishedSnapshot {
  tokens: unknown[];
  typography: unknown[];
  spacing: unknown[];
  radius: unknown[];
  shadow: unknown[];
  theme: unknown[];
  component: unknown[];
}
