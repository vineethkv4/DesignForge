import {
  IconCoin,
  IconEye,
  IconGitPullRequest,
  IconStack,
  type Icon,
} from "@tabler/icons-react";
import type { DashboardStat } from "@/types/dashboard";

const STAT_ICONS: Record<string, Icon> = {
  stack: IconStack,
  coin: IconCoin,
  "git-pull-request": IconGitPullRequest,
  eye: IconEye,
};

interface StatCardsRowProps {
  stats: DashboardStat[];
}

export function StatCardsRow({ stats }: StatCardsRowProps) {
  return (
    <div className="dash-stat-row">
      {stats.map((stat) => {
        const Icon = STAT_ICONS[stat.icon] ?? IconStack;

        return (
          <div key={stat.id} className="dash-stat-card">
            <div className="mb-2 flex items-center justify-between">
              <div
                className="flex h-[30px] w-[30px] items-center justify-center rounded-lg"
                style={{ background: stat.iconBg }}
              >
                <Icon size={15} style={{ color: stat.iconColor }} />
              </div>
              <span
                className={`dash-delta dash-delta-${stat.deltaType === "up" ? "up" : "down"}`}
              >
                {stat.delta}
              </span>
            </div>
            <div className="dash-stat-val">{stat.value}</div>
            <div className="dash-stat-lbl">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
