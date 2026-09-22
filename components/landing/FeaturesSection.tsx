import { LiveBadge } from "./LiveBadge";

const COLOR_SCALE = [
  "#ede9fe", "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6",
  "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#2e1065",
];

const EXPORT_FORMATS = [
  { name: "CSS Variables", plan: "FREE", planColor: "var(--emerald)", planBg: "var(--emerald-dim)" },
  { name: "Tailwind Config", plan: "FREE", planColor: "var(--emerald)", planBg: "var(--emerald-dim)" },
  { name: "GitHub PR", plan: "STARTER", planColor: "var(--ac3)", planBg: "var(--lp-violet-dim)" },
  { name: "Android XML", plan: "TEAM", planColor: "var(--amber)", planBg: "rgba(245,158,11,.12)" },
  { name: "iOS Swift", plan: "TEAM", planColor: "var(--amber)", planBg: "rgba(245,158,11,.12)" },
];

function BentoTag({ color, dot, children }: { color: string; dot: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px] flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>
      <div className="h-[5px] w-[5px] rounded-full" style={{ background: dot }} />
      {children}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="px-10 pb-[100px]">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-[60px] grid items-end gap-20 md:grid-cols-2">
          <div>
            <div className="landing-section-tag">
              <span className="landing-section-dot h-1 w-1 rounded-full" />
              What you get
            </div>
            <h2 className="landing-section-h2">
              Not just tokens.
              <br />
              A <em className="font-normal not-italic" style={{ color: "var(--lp-text-muted)" }}>complete system.</em>
            </h2>
          </div>
          <p className="landing-section-p">
            DesignForge generates your entire design system in one guided flow — foundation tokens, semantic aliases, component styles, themes, and a living docs site.
          </p>
        </div>

        <div className="landing-bento-grid">
          {/* Color scale — wide */}
          <div className="landing-bento-card landing-bento-span8">
            <BentoTag color="#a78bfa" dot="#7c3aed">Foundation</BentoTag>
            <h3 className="mb-2.5 text-[22px] font-bold tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>
              Auto-generated color scale
            </h3>
            <p className="mb-5 max-w-[360px] text-sm font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>
              Pick one brand color. DesignForge generates the full 9-step palette, semantic aliases, dark mode variants, and contrast checks automatically.
            </p>
            <div className="flex h-8 gap-[3px]">
              {COLOR_SCALE.map((color, i) => (
                <div
                  key={color}
                  className="flex-1 rounded-[5px] transition-transform hover:scale-y-110"
                  style={{
                    background: color,
                    outline: i === 5 ? `2px solid ${color}` : undefined,
                    outlineOffset: i === 5 ? "3px" : undefined,
                  }}
                  title={i === 5 ? "500 — primary" : String(i * 100)}
                />
              ))}
            </div>
          </div>

          {/* Semantic layer */}
          <div className="landing-bento-card landing-bento-span4">
            <BentoTag color="#6ee7b7" dot="#10b981">Token hierarchy</BentoTag>
            <h3 className="mb-2.5 text-[22px] font-bold tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>Semantic layer</h3>
            <p className="mb-5 text-sm font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>
              Three-level token hierarchy. Change one primitive, every alias cascades.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {["brand.500", "color.primary", "button.bg"].map((node, i) => (
                <span key={node} className="flex items-center gap-2.5">
                  {i > 0 && <span style={{ color: "var(--lp-text-faint)" }}>→</span>}
                  <span
                    className="rounded-md border px-2.5 py-1 font-mono text-[11px]"
                    style={{
                      borderColor: i === 1 ? "var(--lp-violet-border)" : "var(--lp-border2)",
                      background: i === 1 ? "var(--lp-violet-dim)" : "var(--lp-surface-inset)",
                      color: i === 1 ? "var(--ac3)" : "var(--lp-text-muted)",
                    }}
                  >
                    {node}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="landing-bento-card landing-bento-span5">
            <BentoTag color="#fcd34d" dot="#f59e0b">Live preview</BentoTag>
            <h3 className="mb-4 text-[22px] font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>
              Real components.<br />Instant updates.
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex gap-1.5">
                <button type="button" className="rounded-[7px] px-3 py-1.5 text-[11px] font-medium text-white" style={{ background: "var(--ac)" }}>Primary</button>
                <button type="button" className="rounded-[7px] border-[1.5px] px-3 py-1.5 text-[11px] font-medium" style={{ borderColor: "var(--ac)", color: "var(--ac)", background: "transparent" }}>Outline</button>
                <button type="button" className="rounded-[7px] border px-3 py-1.5 text-[11px] font-medium" style={{ borderColor: "var(--lp-border2)", color: "var(--lp-text-muted)", background: "var(--lp-grey1)" }}>Ghost</button>
              </div>
              <input readOnly placeholder="Text input…" className="w-full rounded-[7px] border px-2.5 py-1.5 text-[11px] outline-none" style={{ borderColor: "var(--lp-border2)", background: "var(--lp-grey1)", color: "var(--lp-text)" }} />
              <div className="flex gap-1">
                {[
                  { l: "Success", bg: "rgba(16,185,129,.15)", c: "#6ee7b7" },
                  { l: "Warning", bg: "rgba(245,158,11,.12)", c: "#fcd34d" },
                  { l: "Error", bg: "rgba(239,68,68,.12)", c: "#fca5a5" },
                ].map((b) => (
                  <span key={b.l} className="rounded-[5px] px-2 py-0.5 text-[9px] font-semibold" style={{ background: b.bg, color: b.c }}>{b.l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* AI */}
          <div className="landing-bento-card landing-bento-span7">
            <BentoTag color="var(--ac3)" dot="var(--ac)">AI-powered</BentoTag>
            <h3 className="mb-2.5 text-[22px] font-bold tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>AI colour adjustments</h3>
            <p className="mb-4 max-w-[360px] text-sm font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>
              Type &quot;make this more trustworthy&quot; — AI suggests specific token changes with before/after diff, contrast ratios, and accept/reject controls.
            </p>
            <div className="rounded-xl border p-4" style={{ background: "var(--lp-violet-dim)", borderColor: "var(--lp-violet-border)" }}>
              <div className="mb-3 flex items-center gap-2">
                <span>✦</span>
                <span className="flex-1 text-xs font-semibold" style={{ color: "var(--ac3)" }}>Adjusting for &quot;trustworthy + professional&quot;</span>
                <LiveBadge label="Processing" />
              </div>
              {[
                { from: "#7c3aed", to: "#1d4ed8", reason: "color.primary — deeper blue reads more authoritative", impact: "HIGH" },
                { from: "#10b981", to: "#0f766e", reason: "color.secondary — cooler teal feels steadier", impact: "MED" },
              ].map((row) => (
                <div key={row.reason} className="mb-1.5 flex items-center gap-2 text-[11px]" style={{ color: "var(--lp-text-muted)" }}>
                  <div className="h-[18px] w-[18px] shrink-0 rounded border" style={{ background: row.from, borderColor: "var(--lp-border)" }} />
                  <span style={{ color: "var(--lp-text-faint)" }}>→</span>
                  <div className="h-[18px] w-[18px] shrink-0 rounded border" style={{ background: row.to, borderColor: "var(--lp-violet-border)" }} />
                  <span className="flex-1">{row.reason}</span>
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: row.impact === "HIGH" ? "rgba(239,68,68,.15)" : "rgba(245,158,11,.12)", color: row.impact === "HIGH" ? "#fca5a5" : "var(--amber)" }}>{row.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export list */}
          <div className="landing-bento-card landing-bento-span4">
            <BentoTag color="#6ee7b7" dot="#10b981">Export</BentoTag>
            <h3 className="mb-4 text-[22px] font-bold tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>Every format</h3>
            <div className="flex flex-col gap-1.5">
              {EXPORT_FORMATS.map((f) => (
                <div key={f.name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors hover:border-[var(--lp-border2)]" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface-inset)" }}>
                  <span className="font-medium" style={{ color: "var(--lp-text)" }}>{f.name}</span>
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide" style={{ background: f.planBg, color: f.planColor }}>{f.plan}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Docs */}
          <div className="landing-bento-card landing-bento-span4">
            <BentoTag color="#fca5a5" dot="#ef4444">Documentation</BentoTag>
            <h3 className="mb-4 text-[22px] font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>
              Auto-generated<br />docs site
            </h3>
            <div className="rounded-[10px] border p-3.5" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface-inset)" }}>
              <div className="mb-3 flex items-center gap-2 border-b pb-2.5" style={{ borderColor: "var(--lp-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--lp-fg)" }}>Acme Corp System</span>
                <LiveBadge label="v1.2.0" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  ["🎨 Colors", "30 tokens"],
                  ["Ƒ Typography", "14 tokens"],
                  ["⬚ Spacing", "9 tokens"],
                  ["📦 Components", "7 defined"],
                ].map(([title, meta]) => (
                  <div key={title} className="rounded-[7px] border p-2 text-[11px]" style={{ borderColor: "var(--lp-border)", background: "var(--lp-grey1)", color: "var(--lp-text-muted)" }}>
                    <strong className="mb-0.5 block font-medium" style={{ color: "var(--lp-text)" }}>{title}</strong>
                    {meta}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Publish */}
          <div
            className="landing-bento-card landing-bento-span4 accent"
          >
            <div className="gradient-text mb-2 text-[80px] font-extrabold leading-none tracking-tighter" style={{ fontFamily: "var(--font-inter-tight)" }}>01</div>
            <h3 className="mb-4 text-[22px] font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>
              Publish once.<br />Ships everywhere.
            </h3>
            {[
              { icon: "🔀", title: "chore: update tokens v1.2.0", meta: "acme/frontend · 28 seconds ago", status: "Open" },
              { icon: "🌐", title: "CDN refreshed · latest/tokens.css", meta: "Edge cache purged · Cloudflare", status: "Live" },
            ].map((pr) => (
              <div key={pr.title} className="mb-2 flex items-center gap-2.5 rounded-[10px] border p-3 transition-colors hover:bg-[var(--lp-grey1)]" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface-inset)" }}>
                <span>{pr.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium" style={{ color: "var(--lp-fg)" }}>{pr.title}</div>
                  <div className="text-[11px]" style={{ color: "var(--lp-text-muted)" }}>{pr.meta}</div>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>{pr.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
