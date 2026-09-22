// Phase 2 — not in TokenCategory / ENABLED_CATEGORIES, do not wire until animated preview is built

import type { MotionToken } from "@/types/tokens";

interface MotionPanelProps {
  tokensByGroup: Record<string, MotionToken[]>;
  selectedTokenId: string | null;
  onSelectToken: (id: string) => void;
}

const GROUP_LABELS: Record<string, string> = {
  duration: "Durations",
  easing: "Easing curves",
};

export function MotionPanel({}: MotionPanelProps) {
  return (
    <aside className="ed-token-panel">
      <div className="ed-panel-header">
        <h2 className="ed-panel-title">Motion tokens</h2>
        <p className="ed-panel-subtitle">Durations, easing & delays</p>
      </div>
      <div className="ed-token-list">
        {Object.entries(GROUP_LABELS).map(([group, label]) => (
          <div key={group}>
            <div className="ed-token-group-label">{label}</div>
            {/* Token cards — implementation pending */}
          </div>
        ))}
      </div>
    </aside>
  );
}
