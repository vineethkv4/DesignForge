const STEPS = [
  {
    num: "STEP 01",
    title: "Build your system",
    description:
      "Walk through the guided builder. Pick a preset, customise every token — colors, type, spacing, radius, shadows. Full design system in under 10 minutes.",
    code: `/* Rounded preset */
--color-primary: #7C3AED;
--radius-md: 8px;
--font-size-base: 16px;
/* 47 tokens total */`,
    tags: ["Color scales", "Type ramp", "Spacing grid", "AI suggestions"],
  },
  {
    num: "STEP 02",
    title: "Preview & validate",
    description:
      "Every change renders live across real components. WCAG contrast ratios checked automatically. Toggle light/dark side by side. No surprises after you ship.",
    code: `/* Contrast check */
primary on white: 7.2:1 AAA ✓
text on surface: 15.3:1 AAA ✓
status: ready to ship`,
    tags: ["Live preview", "WCAG AA/AAA", "Dark mode"],
  },
  {
    num: "STEP 03",
    title: "Publish. Ships itself.",
    description:
      "Click publish. GitHub PR opens. CDN URL refreshes. npm package releases. All within 30 seconds. Zero manual steps.",
    code: `// PR auto-opened
chore: update tokens v1.2.0
↗ acme/app · PR #42 open
↗ CDN refreshed in 3s`,
    tags: ["GitHub PR", "CDN", "npm", "Android + iOS"],
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="border-t px-10 py-[100px]" style={{ borderColor: "var(--lp-border)" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-[72px] text-center">
          <div className="landing-section-tag justify-center">
            <span className="landing-section-dot h-1 w-1 rounded-full" />
            How it works
          </div>
          <h2 className="landing-section-h2 text-center">
            Three steps to
            <br />
            <em className="font-normal not-italic" style={{ color: "var(--lp-text-muted)" }}>production-ready.</em>
          </h2>
          <p className="landing-section-p mx-auto text-center">
            From signup to a live design system syncing to your codebase — in under 10 minutes.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[20px] md:grid-cols-3" style={{ background: "var(--lp-border)", gap: "2px" }}>
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="p-9 transition-colors hover:bg-[var(--lp-bg3)]"
              style={{ background: "var(--lp-bg2)" }}
            >
              <div
                className="mb-7 flex items-center gap-2.5 text-[13px] font-bold tracking-widest"
                style={{ color: "var(--lp-text-faint)", fontFamily: "var(--font-inter-tight)" }}
              >
                {step.num}
                <span className="h-px max-w-[60px] flex-1" style={{ background: "var(--lp-border)" }} />
              </div>
              <h3
                className="mb-3 text-[22px] font-bold leading-tight tracking-tight"
                style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}
              >
                {step.title}
              </h3>
              <p className="mb-5 text-sm font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>
                {step.description}
              </p>
              <pre
                className="rounded-[10px] border p-4 font-mono text-[11px] leading-[1.9]"
                style={{ background: "var(--lp-grey1)", borderColor: "var(--lp-border)", color: "var(--lp-text-muted)" }}
              >
                {step.code}
              </pre>
              <div className="mt-4 flex flex-wrap gap-2">
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border px-3.5 py-1.5 text-xs font-medium"
                    style={{ borderColor: "var(--lp-border)", color: "var(--lp-text-muted)", background: "var(--lp-grey1)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
