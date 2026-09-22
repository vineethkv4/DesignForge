import {
  IconEye,
  IconFileExport,
  IconGitPullRequest,
  IconPlus,
  IconWand,
  type Icon,
} from "@tabler/icons-react";
import { Panel } from "@/components/shared/Panel";
import type { ActivityItem } from "@/types/dashboard";

const ACTIVITY_ICONS: Record<string, Icon> = {
  "git-pull-request": IconGitPullRequest,
  wand: IconWand,
  plus: IconPlus,
  "file-export": IconFileExport,
  eye: IconEye,
};

interface ActivityPanelProps {
  items: ActivityItem[];
}

export function ActivityPanel({ items }: ActivityPanelProps) {
  return (
    <Panel
      title="Recent activity"
      action={
        <button type="button" className="app-panel-action">
          View all
        </button>
      }
    >
      <div>
        {items.map((item) => {
          const Icon = ACTIVITY_ICONS[item.icon] ?? IconEye;
          return (
            <div key={item.id} className="dash-act-item">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: item.iconBg }}
              >
                <Icon size={14} style={{ color: item.iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium leading-snug" style={{ color: "var(--app-text)" }}>
                  {item.title}
                </div>
                <div className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
