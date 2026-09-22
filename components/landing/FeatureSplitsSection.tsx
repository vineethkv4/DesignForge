import { LiveBadge } from "./LiveBadge";
import { Logo } from "./Logo";

const SPLITS = [
  {
    num: "01",
    title: <>Visual builder for<br /><em className="font-normal not-italic" style={{ color: "var(--ac3)" }}>non-designers.</em></>,
    description: "No Figma. No design-ops. No jargon. DesignForge's guided UI walks any developer through building a complete, professional design system — color palette, type scale, spacing grid, and component tokens.",
    tags: ["Guided presets", "Live preview", "WCAG built-in", "No design knowledge"],
    reverse: false,
    visualTitle: "COLOR TOKENS — SEMANTIC TAB",
    visualBadge: "Auto-saved",
    visual: "builder",
  },
  {
    num: "02",
    title: <>GitHub PR on<br /><em className="font-normal not-italic" style={{ color: "var(--ac3)" }}>every publish.</em></>,
    description: "Click publish and a PR opens automatically in your GitHub repo. The diff shows exactly what changed. Your team reviews it. CI runs. It merges. Design tokens are in production. No manual steps, ever.",
    tags: ["GitHub App auth", "Auto-opens PR", "Token diff table", "Idempotent"],
    reverse: true,
    visualTitle: "GITHUB SYNC · LAST PR",
    visualBadge: "Connected",
    visualBadgeColor: "#6ee7b7",
    visual: "github",
  },
  {
    num: "03",
    title: <>Living docs site,<br /><em className="font-normal not-italic" style={{ color: "var(--ac3)" }}>always in sync.</em></>,
    description: "Every design system gets an auto-generated documentation site. Token values, component previews, usage code snippets, and a changelog — always up to date. Share the URL with your whole team.",
    tags: ["Auto-generated", "Always in sync", "Shareable URL", "Version history"],
    reverse: false,
    visualTitle: "DOCS.DESIGNFORGE.IO/ACME",
    visualBadge: "v1.2.0",
    visual: "docs",
  },
];

const SCALE_COLORS = ["#ede9fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#2e1065"];

function BuilderVisual() {
  return (
    <>
      <div className="mb-3.5 flex h-6 gap-[3px]">
        {SCALE_COLORS.map((c, i) => (
          <div key={c} className="flex-1 rounded transition-transform hover:scale-y-125" style={{ background: c, outline: i === 4 ? `2px solid ${c}` : undefined, outlineOffset: i === 4 ? "2px" : undefined }} />
        ))}
      </div>
      <p className="mb-4 text-center font-mono text-[10px]" style={{ color: "var(--lp-text-faint)" }}>9-step brand scale · auto-generated</p>
      {[
        { color: "#7c3aed", name: "color.primary", alias: "→ brand.500", highlight: true },
        { color: "#6d28d9", name: "color.primary.hover", alias: "→ brand.600" },
        { color: "#10b981", name: "color.success", alias: "AA ✓", aliasColor: "var(--emerald)" },
      ].map((row) => (
        <div key={row.name} className="mb-1.5 flex items-center gap-2 rounded-[7px] border px-2.5 py-2" style={{ borderColor: row.highlight ? "var(--lp-violet-border)" : "var(--lp-border)", background: row.highlight ? "var(--lp-violet-dim)" : "var(--lp-surface-inset)" }}>
          <div className="h-4 w-4 shrink-0 rounded" style={{ background: row.color }} />
          <span className="font-mono text-[11px]" style={{ color: "var(--lp-text-muted)" }}>{row.name}</span>
          <span className="ml-auto text-[9px]" style={{ color: row.aliasColor ?? (row.highlight ? "var(--ac3)" : "var(--lp-text-faint)") }}>{row.alias}</span>
        </div>
      ))}
    </>
  );
}

function GitHubVisual() {
  return (
    <>
      <div className="mb-2.5 flex items-center gap-2.5 rounded-[10px] border p-3" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface-inset)" }}>
        <span>🔀</span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium" style={{ color: "var(--lp-fg)" }}>chore: update design tokens to v1.2.0</div>
          <div className="text-[11px]" style={{ color: "var(--lp-text-muted)" }}>acme/frontend · main ← designforge/update-tokens-v1.2.0</div>
        </div>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>Open #42</span>
      </div>
      <pre className="rounded-lg border p-3 font-mono text-[10px] leading-[1.9]" style={{ borderColor: "var(--lp-border)", background: "var(--lp-code-bg)", color: "var(--lp-text-muted)" }}>
        <span style={{ color: "#6ee7b7" }}>+</span> --color-primary: <span style={{ color: "#6ee7b7" }}>#7C3AED</span>;{"\n"}
        <span style={{ color: "#fca5a5" }}>-</span> --color-primary: <span style={{ color: "#fca5a5" }}>#6366F1</span>;{"\n"}
        <span style={{ color: "#6ee7b7" }}>+</span> --radius-md: <span style={{ color: "#6ee7b7" }}>8px</span>;{"\n"}
        <span style={{ color: "#fca5a5" }}>-</span> --radius-md: <span style={{ color: "#fca5a5" }}>6px</span>;{"\n"}
        <span style={{ color: "var(--lp-text-faint)" }}>  --font-size-base: 16px; (unchanged)</span>
      </pre>
      <div className="mt-2.5 flex gap-2">
        <div className="flex-1 rounded-lg border py-2 text-center text-[11px]" style={{ borderColor: "rgba(16,185,129,.2)", background: "rgba(16,185,129,.08)", color: "var(--emerald)" }}>✓ 3 CI checks passed</div>
        <div className="flex-1 rounded-lg border py-2 text-center text-[11px]" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface-inset)", color: "var(--lp-text-muted)" }}>2 files changed</div>
      </div>
    </>
  );
}

function DocsVisual() {
  return (
    <div className="rounded-[10px] border p-3.5" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface-inset)" }}>
      <div className="mb-3 flex items-center gap-2 border-b pb-2.5" style={{ borderColor: "var(--lp-border)" }}>
        <Logo size={22} />
        <span className="text-xs font-semibold" style={{ color: "var(--lp-fg)" }}>Acme Corp Design System</span>
        <span className="ml-auto font-mono text-[10px]" style={{ color: "var(--lp-text-faint)" }}>47 tokens · 2 themes</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          ["🎨 Colors", "30 tokens · AA ✓"],
          ["Ƒ Typography", "14 tokens · Inter"],
          ["⬚ Spacing", "9 tokens · 4px grid"],
          ["◫ Radius", "5 steps · sm→full"],
          ["📦 Components", "Btn · Input · Card"],
          ["🌗 Themes", "Light + Dark"],
        ].map(([title, meta]) => (
          <div key={title} className="rounded-[7px] border p-2 text-[11px]" style={{ borderColor: "var(--lp-border)", background: "var(--lp-grey1)", color: "var(--lp-text-muted)" }}>
            <strong className="mb-0.5 block font-medium" style={{ color: "var(--lp-text)" }}>{title}</strong>
            {meta}
          </div>
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[10px]" style={{ color: "var(--lp-text-faint)" }}>Last updated: 2 hours ago · Published by Rahul</p>
    </div>
  );
}

export function FeatureSplitsSection() {
  return (
    <section id="deep-features" className="border-t px-10" style={{ borderColor: "var(--lp-border)" }}>
      <div className="mx-auto max-w-[1100px]">
        {SPLITS.map((split) => (
          <div key={split.num} className={`landing-feat-split ${split.reverse ? "reverse" : ""}`}>
            <div>
              <div className="mb-[-20px] text-[96px] font-extrabold leading-[0.9] tracking-[-0.05em]" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-border3)", WebkitTextStroke: "1px var(--lp-border2)" }}>
                {split.num}
              </div>
              <h3 className="mb-4 text-[clamp(28px,3.5vw,44px)] font-extrabold leading-tight tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>
                {split.title}
              </h3>
              <p className="mb-6 text-[15px] font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>{split.description}</p>
              <div className="flex flex-wrap gap-2">
                {split.tags.map((tag) => (
                  <span key={tag} className="rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-[var(--lp-violet-border)] hover:bg-[var(--lp-violet-dim)] hover:text-[var(--ac3)]" style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-muted)", background: "var(--lp-grey1)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="landing-feat-visual">
              <div className="flex items-center justify-between border-b px-[18px] py-3.5" style={{ borderColor: "var(--lp-border)", background: "var(--lp-grey1)" }}>
                <span className="text-[11px] font-medium tracking-wider" style={{ color: "var(--lp-text-faint)" }}>{split.visualTitle}</span>
                <LiveBadge label={split.visualBadge} color={split.visualBadgeColor} />
              </div>
              <div className="p-5">
                {split.visual === "builder" && <BuilderVisual />}
                {split.visual === "github" && <GitHubVisual />}
                {split.visual === "docs" && <DocsVisual />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
