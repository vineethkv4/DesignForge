"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { target: 47, suffix: "", label: "Design tokens in your\ncomplete system", sub: "Color · Type · Space · Radius · Shadow" },
  { target: 7, suffix: "", label: "Export formats from\na single source", sub: "CSS · Tailwind · JSON · Android · iOS +" },
  { target: 30, suffix: "s", label: "From publish to\nproduction-ready", sub: "GitHub PR · CDN · npm in one click" },
  { target: null as number | null, suffix: "", display: "—", label: "Designers needed to\nbuild your system", sub: "Guided UI · AI suggestions · Presets" },
];

function useCountUp(target: number | null, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target === null) return;
    let frame = 0;
    const total = 40;
    const timer = setInterval(() => {
      frame++;
      setValue(Math.round((target * frame) / total));
      if (frame >= total) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target, active]);

  return target === null ? "—" : value;
}

function StatCard({
  target,
  display,
  suffix = "",
  label,
  sub,
  active,
}: {
  target: number | null;
  display?: string;
  suffix?: string;
  label: string;
  sub: string;
  active: boolean;
}) {
  const count = useCountUp(target, active);
  const shown = display ?? count;

  return (
    <div className="landing-stat-card">
      <div className="landing-stat-num">
        <span className="accent-num">{shown}</span>
        {suffix && (
          <span style={{ fontSize: "0.5em", color: "var(--lp-stat-suffix)" }}>{suffix}</span>
        )}
      </div>
      <div className="whitespace-pre-line text-sm leading-snug tracking-tight" style={{ color: "var(--lp-text-muted)" }}>
        {label}
      </div>
      <div className="mt-1 text-xs" style={{ color: "var(--lp-text-faint)" }}>{sub}</div>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="flex justify-center px-10 py-[100px]">
      <div ref={ref} className="landing-stats-inner mx-auto w-full max-w-[1100px]">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} active={active} />
        ))}
      </div>
    </section>
  );
}
