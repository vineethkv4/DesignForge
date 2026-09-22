"use client";

import { useRouter } from "next/navigation";
import {
  IconAdjustments,
  IconBrandGithub,
  IconDownload,
  IconFileDescription,
} from "@tabler/icons-react";
import { Panel } from "@/components/shared/Panel";

const ACTIONS = [
  {
    title: "Open token editor",
    desc: "Edit colors, spacing, radius, typography ↗",
    icon: IconAdjustments,
    iconBg: "var(--app-primary-dim)",
    iconColor: "var(--app-primary)",
    href: "/editor/1",
  },
  {
    title: "Publish to GitHub",
    desc: "Open a PR with latest token changes ↗",
    icon: IconBrandGithub,
    iconBg: "var(--app-green-bg)",
    iconColor: "#065f46",
    href: "/dashboard",
  },
  {
    title: "Export tokens",
    desc: "CSS vars, Tailwind config, npm ↗",
    icon: IconDownload,
    iconBg: "var(--app-amber-bg)",
    iconColor: "#92400e",
    href: "/export",
  },
  {
    title: "View docs site",
    desc: "Your live token documentation ↗",
    icon: IconFileDescription,
    iconBg: "var(--app-red-bg)",
    iconColor: "#7f1d1d",
    href: "/dashboard",
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <Panel title="Quick actions">
      <div className="dash-quick-grid">
        {ACTIONS.map((action) => (
          <button
            key={action.title}
            type="button"
            className="dash-quick-item"
            onClick={() => router.push(action.href)}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[9px]"
              style={{ background: action.iconBg }}
            >
              <action.icon size={16} style={{ color: action.iconColor }} />
            </div>
            <div className="text-[13px] font-medium" style={{ color: "var(--app-text)" }}>
              {action.title}
            </div>
            <div className="text-[11px] leading-snug" style={{ color: "var(--app-text-muted)" }}>
              {action.desc}
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
