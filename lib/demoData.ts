import type { ActivityItem, DashboardStat, DesignSystem } from "@/types/dashboard";

export const DEMO_SYSTEMS: DesignSystem[] = [
  {
    id: "1",
    name: "Acme Corp",
    status: "published",
    plan: "pro",
    palette: ["#7733FF", "#c4b5fd", "#10b981", "#f59e0b"],
    tokenCount: 87,
    updatedAt: "2h ago",
  },
  {
    id: "2",
    name: "Startup Kit",
    status: "published",
    plan: "free",
    palette: ["#2563eb", "#93c5fd", "#10b981", "#e5e7eb"],
    tokenCount: 54,
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    name: "Atlas Design",
    status: "published",
    plan: "pro",
    palette: ["#dc2626", "#fca5a5", "#374151", "#d1d5db"],
    tokenCount: 106,
    updatedAt: "3h ago",
  },
];

export const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    icon: "git-pull-request",
    iconBg: "var(--app-green-bg)",
    iconColor: "#065f46",
    title: "PR #14 merged — Acme Corp",
    subtitle: "tokens.css updated · 3 min ago",
  },
  {
    id: "2",
    icon: "wand",
    iconBg: "var(--app-primary-dim)",
    iconColor: "var(--app-primary)",
    title: "AI adjusted 4 color tokens",
    subtitle: 'Acme Corp · "more trustworthy" · 1h ago',
  },
  {
    id: "3",
    icon: "plus",
    iconBg: "var(--app-amber-bg)",
    iconColor: "#92400e",
    title: "New system created",
    subtitle: "Atlas Design · 3h ago",
  },
  {
    id: "4",
    icon: "file-export",
    iconBg: "var(--app-red-bg)",
    iconColor: "#7f1d1d",
    title: "CSS export downloaded",
    subtitle: "Startup Kit · tailwind.config.js · 5h ago",
  },
  {
    id: "5",
    icon: "eye",
    iconBg: "var(--app-surface2)",
    iconColor: "var(--app-text-muted)",
    title: "Docs site visited · 48 views",
    subtitle: "Acme Corp · docs.acme.io · today",
  },
];

export const DEMO_STATS: DashboardStat[] = [
  {
    id: "systems",
    icon: "stack",
    iconBg: "var(--app-primary-dim)",
    iconColor: "var(--app-primary)",
    value: "3",
    label: "Design systems",
    delta: "+1 this wk",
    deltaType: "up",
  },
  {
    id: "tokens",
    icon: "coin",
    iconBg: "var(--app-green-bg)",
    iconColor: "#065f46",
    value: "247",
    label: "Tokens generated",
    delta: "+12%",
    deltaType: "up",
  },
  {
    id: "prs",
    icon: "git-pull-request",
    iconBg: "var(--app-amber-bg)",
    iconColor: "#92400e",
    value: "8",
    label: "GitHub PRs opened",
    delta: "+3",
    deltaType: "up",
  },
  {
    id: "views",
    icon: "eye",
    iconBg: "var(--app-red-bg)",
    iconColor: "#7f1d1d",
    value: "1.2k",
    label: "Docs page views",
    delta: "-2 today",
    deltaType: "down",
  },
];

export const MODAL_COLOR_PRESETS = [
  "#7733FF",
  "#2563eb",
  "#059669",
  "#dc2626",
  "#d97706",
  "#db2777",
] as const;

export const SYSTEM_TEMPLATES = [
  "Blank system",
  "SaaS product",
  "Marketing site",
  "Mobile app",
] as const;
