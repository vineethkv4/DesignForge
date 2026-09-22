const FORMATS = [
  {
    icon: "🎨",
    name: "CSS Variables",
    plan: "FREE",
    planColor: "var(--emerald)",
    planBg: "var(--emerald-dim)",
    description: "Drop into any codebase. Works with vanilla CSS, SCSS, and PostCSS pipelines.",
    code: ":root {\n  --color-primary: #7C3AED;\n  --radius-md: 8px;\n}",
  },
  {
    icon: "🌊",
    name: "Tailwind Config",
    plan: "FREE",
    planColor: "var(--emerald)",
    planBg: "var(--emerald-dim)",
    description: "Extend your Tailwind theme with generated color, spacing, and radius tokens.",
    code: "theme: {\n  extend: {\n    colors: { primary: '#7C3AED' }\n  }\n}",
  },
  {
    icon: "📋",
    name: "JSON W3C",
    plan: "STARTER",
    planColor: "var(--ac3)",
    planBg: "var(--lp-violet-dim)",
    description: "Style Dictionary compatible format for design token pipelines.",
    code: '{\n  "color": {\n    "primary": { "value": "#7C3AED" }\n  }\n}',
  },
  {
    icon: "🔀",
    name: "GitHub PR",
    plan: "STARTER",
    planColor: "var(--ac3)",
    planBg: "var(--lp-violet-dim)",
    description: "Auto-opens a PR in your repo on every publish. Review the diff, merge, done.",
    code: "chore: update tokens v1.2.0\n↗ acme/app · PR #42",
  },
];

export function FormatsSection() {
  return (
    <section id="formats" className="border-t px-10 py-[100px]" style={{ borderColor: "var(--lp-border)" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-[60px] text-center">
          <div className="landing-section-tag justify-center">
            <span className="landing-section-dot h-1 w-1 rounded-full" />
            Export formats
          </div>
          <h2 className="landing-section-h2 text-center">
            One source.
            <br />
            <em className="font-normal not-italic" style={{ color: "var(--lp-text-muted)" }}>Every platform.</em>
          </h2>
          <p className="landing-section-p mx-auto text-center">
            Export to CSS, Tailwind, JSON, GitHub, npm, Android XML, iOS Swift, and CDN — all from a single token source.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FORMATS.map((format) => (
            <div key={format.name} className="landing-format-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[22px]">{format.icon}</span>
                <span className="rounded px-2 py-0.5 text-[9px] font-bold tracking-wider" style={{ background: format.planBg, color: format.planColor }}>{format.plan}</span>
              </div>
              <h3 className="mb-1.5 text-base font-bold tracking-tight" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}>{format.name}</h3>
              <p className="mb-3.5 text-xs font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>{format.description}</p>
              <pre className="rounded-lg border p-3 font-mono text-[10px] leading-[1.8] whitespace-pre-wrap" style={{ borderColor: "var(--lp-border)", background: "var(--lp-code-bg)", color: "var(--lp-text-muted)" }}>
                {format.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
