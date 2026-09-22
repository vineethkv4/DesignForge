"use client";

import {
  IconAdjustments,
  IconBrandGithub,
  IconFileDescription,
  IconHelpCircle,
  IconLayoutDashboard,
  IconPackage,
  IconPalette,
  IconSettings,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: Icon;
  badge?: string;
  match?: "exact" | "prefix";
}[] = [
  {
    href: ROUTES.dashboard,
    label: "Dashboard",
    icon: IconLayoutDashboard,
    badge: "3",
    match: "exact",
  },
  {
    href: ROUTES.systemsList,
    label: "Design systems",
    icon: IconPalette,
    match: "prefix",
  },
  { href: "/editor/1", label: "Token editor", icon: IconAdjustments },
  { href: ROUTES.dashboard, label: "Docs sites", icon: IconFileDescription },
];

const PUBLISH_ITEMS = [
  { href: ROUTES.dashboard, label: "GitHub sync", icon: IconBrandGithub },
  { href: ROUTES.dashboard, label: "Exports", icon: IconPackage, badge: "2" },
];

const TEAM_ITEMS = [{ href: ROUTES.dashboard, label: "Members", icon: IconUsers }];

const BOTTOM_ITEMS = [
  { href: ROUTES.settings, label: "Settings", icon: IconSettings },
  { href: ROUTES.dashboard, label: "Help", icon: IconHelpCircle },
];

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: string;
  label: string;
  icon: Icon;
  badge?: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={`app-sidebar-item${active ? " active" : ""}`}>
      <Icon size={16} stroke={1.75} />
      {label}
      {badge && <span className="app-sidebar-badge">{badge}</span>}
    </Link>
  );
}

function isActive(
  pathname: string,
  href: string,
  match?: "exact" | "prefix"
): boolean {
  if (match === "prefix") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (match === "exact") return pathname === href;
  return false;
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.label}
          href={item.href}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          active={isActive(pathname, item.href, item.match)}
        />
      ))}

      <div className="app-sidebar-label">Publish</div>
      {PUBLISH_ITEMS.map((item) => (
        <NavItem key={item.label} {...item} active={false} />
      ))}

      <div className="app-sidebar-label">Team</div>
      {TEAM_ITEMS.map((item) => (
        <NavItem key={item.label} {...item} active={false} />
      ))}

      <div className="app-sidebar-bottom">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} active={pathname === item.href} />
        ))}
      </div>
    </aside>
  );
}
