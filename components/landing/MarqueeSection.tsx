const MARQUEE_ITEMS = [
  { label: "CSS Variables", highlight: true },
  { label: "Tailwind Config" },
  { label: "JSON W3C Format" },
  { label: "GitHub PR Sync", highlight: true },
  { label: "npm Package" },
  { label: "Android XML" },
  { label: "iOS Swift", highlight: true },
  { label: "CDN Delivery" },
  { label: "SCSS Variables" },
  { label: "AI Color Suggestions", highlight: true },
  { label: "WCAG Contrast Check" },
  { label: "Dark Mode Themes" },
  { label: "Semantic Alias Tokens", highlight: true },
  { label: "Version History" },
  { label: "Living Docs Site" },
];

export function MarqueeSection() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      className="overflow-hidden border-y py-7"
      style={{ borderColor: "var(--lp-border)", background: "var(--lp-grey1)" }}
      aria-label="Export formats and features"
    >
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex w-max">
          {items.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap px-9 text-[13px] font-medium tracking-tight"
              style={{ color: item.highlight ? "var(--ac3)" : "var(--lp-text-muted)" }}
            >
              <span className="landing-section-dot h-1 w-1 shrink-0 rounded-full" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
