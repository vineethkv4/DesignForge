function AppWindowMockup() {
  const styleItems = [
    { label: "Colors", color: "#7c3aed", active: true },
    { label: "Typography", color: "#3b82f6" },
    { label: "Spacing", color: "#10b981" },
    { label: "Radius", color: "#f59e0b" },
    { label: "Shadows", color: "#8b5cf6" },
  ];

  const publishItems = [
    { label: "GitHub sync", color: "#ef4444" },
    { label: "Export", color: "#f97316" },
    { label: "CDN delivery", color: "#06b6d4" },
  ];

  const tokens = [
    { name: "color.primary", var: "--color-primary", val: "#7C3AED", color: "#7c3aed", wcag: "AAA", selected: true },
    { name: "color.primary.hover", var: "--color-primary-h", val: "#6D28D9", color: "#6d28d9", wcag: "AA" },
    { name: "color.success", var: "--color-success", val: "#10B981", color: "#10b981", wcag: "AA" },
    { name: "color.warning", var: "--color-warning", val: "#F59E0B", color: "#f59e0b", wcag: "AA" },
    { name: "color.background", var: "--color-bg", val: "#0D0E12", color: "#0d0e12", border: true },
    { name: "color.border", var: "--color-border", val: "#E4E4E7", color: "#e4e4e7", border: true },
  ];

  const badges = [
    { label: "Success", bg: "rgba(16,185,129,.15)", color: "#6ee7b7" },
    { label: "Warning", bg: "rgba(245,158,11,.12)", color: "#fcd34d" },
    { label: "Info", bg: "var(--acl)", color: "var(--ac3)" },
    { label: "Error", bg: "rgba(239,68,68,.12)", color: "#fca5a5" },
  ];

  return (
    <div className="relative mx-auto mt-[72px] w-full max-w-[980px] animate-fade-up" style={{ animationDelay: "1.2s" }}>
      <div
        className="landing-glow-fade pointer-events-none absolute left-1/2 top-[-60px] h-[200px] w-[700px] -translate-x-1/2 blur-[40px]"
        aria-hidden
      />
      <div className="landing-hero-window overflow-hidden rounded-[20px] border backdrop-blur-[20px]">
        <div
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ borderColor: "var(--lp-border)", background: "var(--lp-grey1)" }}
        >
          <div className="flex gap-1.5" aria-hidden>
            <div className="h-[11px] w-[11px] rounded-full" style={{ background: "#ff6b6b" }} />
            <div className="h-[11px] w-[11px] rounded-full" style={{ background: "#f9c74f" }} />
            <div className="h-[11px] w-[11px] rounded-full" style={{ background: "#90be6d" }} />
          </div>
          <div className="text-xs font-medium tracking-wider" style={{ color: "var(--lp-text-muted)" }}>
            DESIGNFORGE — ACME CORP DESIGN SYSTEM v1.2.0
          </div>
          <div className="landing-live-badge">
            <span aria-hidden />
            Live preview
          </div>
        </div>

        <div className="hidden min-h-[320px] md:grid" style={{ gridTemplateColumns: "200px 1fr 260px" }}>
          <div className="border-r py-4" style={{ borderColor: "var(--lp-border)", background: "var(--lp-grey1)" }}>
            <div className="px-4 pb-2 pt-2 text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--lp-text-faint)" }}>Style</div>
            {styleItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-1.5 text-xs transition-colors"
                style={{
                  color: item.active ? "var(--ac3)" : "var(--lp-text-muted)",
                  background: item.active ? "var(--lp-violet-dim)" : "transparent",
                }}
              >
                <div className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
            <div className="mt-2 px-4 pb-2 pt-4 text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--lp-text-faint)" }}>Publish</div>
            {publishItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-4 py-1.5 text-xs" style={{ color: "var(--lp-text-muted)" }}>
                <div className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>

          <div className="border-r p-5" style={{ borderColor: "var(--lp-border)" }}>
            <div className="mb-4 text-[13px] font-semibold tracking-tight" style={{ color: "var(--lp-fg)" }}>Color tokens — Semantic</div>
            {tokens.map((token) => (
              <div
                key={token.name}
                className="mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                style={{
                  border: "1px solid",
                  borderColor: token.selected ? "var(--lp-violet-border)" : "transparent",
                  background: token.selected ? "var(--lp-violet-dim)" : "transparent",
                }}
              >
                <div className="h-[22px] w-[22px] shrink-0 rounded-[5px] border" style={{ background: token.color, borderColor: token.border ? "var(--lp-border2)" : "var(--lp-border)" }} />
                <span className="flex-1 text-xs font-medium" style={{ color: "var(--lp-text)" }}>{token.name}</span>
                <span className="shrink-0 font-mono text-[10px]" style={{ color: "var(--lp-text-faint)" }}>{token.var}</span>
                <span className="min-w-[70px] shrink-0 text-right font-mono text-[11px]" style={{ color: "var(--lp-text-muted)" }}>{token.val}</span>
                {token.wcag && (
                  <span className="shrink-0 rounded px-1 py-0.5 text-[8px] font-bold" style={{ background: token.wcag === "AAA" ? "var(--acl)" : "var(--emerald-dim)", color: token.wcag === "AAA" ? "var(--ac3)" : "var(--emerald)" }}>
                    {token.wcag}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="p-5" style={{ background: "var(--lp-grey1)" }}>
            <div className="mb-3.5 text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--lp-text-faint)" }}>Live component preview</div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button type="button" className="rounded-[7px] px-3 py-1.5 text-[11px] font-medium text-white" style={{ background: "var(--ac)" }}>Primary</button>
              <button type="button" className="rounded-[7px] border-[1.5px] px-3 py-1.5 text-[11px] font-medium" style={{ borderColor: "var(--ac)", color: "var(--ac)", background: "transparent" }}>Outline</button>
              <button type="button" className="rounded-[7px] border px-3 py-1.5 text-[11px] font-medium" style={{ borderColor: "var(--lp-border2)", color: "var(--lp-text-muted)", background: "var(--lp-grey1)" }}>Ghost</button>
            </div>
            <input readOnly placeholder="Input field…" className="mb-2 w-full rounded-[7px] border px-2.5 py-1.5 text-[11px] outline-none" style={{ borderColor: "var(--lp-border2)", background: "var(--lp-grey1)", color: "var(--lp-text)" }} />
            <div className="mb-2 rounded-[10px] border p-2.5" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface-inset)" }}>
              <div className="mb-0.5 text-[11px] font-semibold" style={{ color: "var(--lp-fg)" }}>Design token card</div>
              <div className="text-[10px] leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>Components update in real-time as you edit tokens.</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {badges.map((b) => (
                <span key={b.label} className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: b.bg, color: b.color }}>{b.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 md:hidden" style={{ background: "var(--lp-grey1)" }}>
          <p className="text-xs" style={{ color: "var(--lp-text-muted)" }}>
            Live token editor with color scales, semantic aliases, and component preview.
          </p>
        </div>
      </div>
    </div>
  );
}

const TRUST_ITEMS = [
  "No Figma needed",
  "No designer required",
  "Ships to production",
  "Free account in 30 seconds",
];

export function HeroSection() {
  return (
    <section id="top" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-10 pb-20 pt-[120px] text-center">
      <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[80px] animate-orb-1" style={{ background: "radial-gradient(circle, var(--lp-orb1) 0%, transparent 65%)" }} aria-hidden />
      <div className="pointer-events-none absolute bottom-[10%] left-[10%] h-[400px] w-[400px] rounded-full blur-[80px] animate-orb-2" style={{ background: "radial-gradient(circle, var(--lp-orb2) 0%, transparent 65%)" }} aria-hidden />
      <div className="pointer-events-none absolute bottom-[20%] right-[8%] h-[300px] w-[300px] rounded-full blur-[80px] animate-orb-3" style={{ background: "radial-gradient(circle, var(--lp-orb3) 0%, transparent 65%)" }} aria-hidden />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(var(--lp-hero-grid) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 80%)",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 80%)",
        }}
        aria-hidden
      />

      <div
        className="relative z-[2] mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--lp-accent-text)", background: "var(--lp-violet-dim)", borderColor: "var(--lp-violet-border)" }}
      >
        <span className="landing-pulse-dot-brand h-[5px] w-[5px] animate-pulse-dot rounded-full" aria-hidden />
        Now in early access · Free plan included
      </div>

      <h1
        className="relative z-[2] mb-0 leading-[0.96] tracking-[-0.04em]"
        style={{ fontFamily: "var(--font-inter-tight)", fontSize: "clamp(52px, 7vw, 96px)", fontWeight: 800, color: "var(--lp-fg)" }}
        aria-label="Your complete design system. Generated."
      >
        <span className="block overflow-hidden">
          <span className="inline-block animate-word-in opacity-0" style={{ animationDelay: "0.2s" }}>Your</span>
          &nbsp;
          <span className="inline-block animate-word-in opacity-0" style={{ animationDelay: "0.3s" }}>complete</span>
        </span>
        <span className="block overflow-hidden">
          <span className="gradient-text inline-block animate-word-in opacity-0" style={{ animationDelay: "0.4s" }}>design</span>
          &nbsp;
          <span className="gradient-text inline-block animate-word-in opacity-0" style={{ animationDelay: "0.5s" }}>system.</span>
        </span>
        <span className="block overflow-hidden">
          <span className="inline-block animate-word-in opacity-0" style={{ animationDelay: "0.6s" }}>Generated.</span>
        </span>
      </h1>

      <p className="relative z-[2] mx-auto mb-11 mt-7 max-w-[520px] animate-fade-up text-lg font-light leading-[1.75] tracking-tight" style={{ color: "var(--lp-text-muted)", animationDelay: "0.9s" }}>
        DesignForge builds your full design system from scratch — color scales, type ramps, spacing grids, component tokens, themes, and docs — then ships it to your codebase automatically.
      </p>

      <div className="relative z-[2] flex animate-fade-up flex-wrap justify-center gap-3" style={{ animationDelay: "1s" }}>
        <a href="#cta" className="landing-hero-btn-primary">
          Start building — it&apos;s free
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,.15)" }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5h6M4.5 1.5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </a>
        <a href="#how" className="landing-hero-btn-secondary">See how it works</a>
      </div>

      <div className="relative z-[2] mt-5 flex animate-fade-up flex-wrap items-center justify-center gap-6" style={{ animationDelay: "1.1s" }}>
        {TRUST_ITEMS.map((item, i) => (
          <span key={item} className="flex items-center gap-1.5">
            {i > 0 && <span className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--lp-border3)" }} aria-hidden />}
            <span className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--lp-text-faint)" }}>
              <span style={{ color: "var(--emerald)" }}>✓</span>
              {item}
            </span>
          </span>
        ))}
      </div>

      <AppWindowMockup />
    </section>
  );
}
