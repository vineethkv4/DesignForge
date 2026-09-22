"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import type { DesignSystem } from "@/types/dashboard";

interface TokenUsageChartProps {
  systems: DesignSystem[];
}

export function TokenUsageChart({ systems }: TokenUsageChartProps) {
  const [animated, setAnimated] = useState(false);
  const max = Math.max(...systems.map((s) => s.tokenCount), 1);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimated(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Panel title="Token usage by system">
      <div className="flex flex-col gap-2.5 px-[18px] py-3.5">
        {systems.map((system) => {
          const width = Math.round((system.tokenCount / max) * 100);
          const color = system.palette[0] ?? "var(--app-primary)";
          return (
            <div key={system.id} className="dash-tu-row">
              <span className="dash-tu-label">{system.name}</span>
              <div className="dash-tu-track">
                <div
                  className="dash-tu-fill"
                  style={{
                    width: animated ? `${width}%` : "0%",
                    background: color,
                  }}
                />
              </div>
              <span className="min-w-8 text-right text-[11px] font-medium" style={{ color: "var(--app-text-secondary)" }}>
                {system.tokenCount}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
