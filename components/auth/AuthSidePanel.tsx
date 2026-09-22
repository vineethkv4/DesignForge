import { LiveBadge } from "@/components/landing/LiveBadge";
import { Logo } from "@/components/landing/Logo";

const FEATURES = [
  "Complete design system in minutes",
  "Ships to GitHub automatically",
  "AI colour suggestions built-in",
  "Free plan, forever",
];

const TOKENS = [
  { color: "#7c3aed", name: "color.primary", val: "#7C3AED" },
  { color: "#10b981", name: "color.success", val: "#10B981" },
  { color: "#f59e0b", name: "color.warning", val: "#F59E0B" },
  { color: "transparent", name: "radius.md", val: "8px", border: true },
];

export function AuthSidePanel() {
  return (
    <div className="hidden flex-1 flex-col gap-4 lg:flex" style={{ animation: "auth-card-in 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div>
        <h2
          className="text-[clamp(26px,3vw,36px)] font-extrabold leading-[1.08] tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-inter-tight)", color: "var(--auth-text)" }}
        >
          Your design system,
          <br />
          <em className="font-normal not-italic" style={{ color: "var(--ac3)" }}>generated.</em>
        </h2>
        <p className="mt-3 max-w-[280px] text-sm font-light leading-relaxed" style={{ color: "var(--auth-text-muted)" }}>
          Join developers building complete design systems without Figma. Tokens, themes, docs — all in one place.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {FEATURES.map((feature) => (
          <div key={feature} className="flex items-center gap-2.5 text-[13.5px]" style={{ color: "var(--auth-text-muted)" }}>
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px]"
              style={{ background: "var(--emerald-dim)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)" }}
            >
              ✓
            </div>
            {feature}
          </div>
        ))}
      </div>

      <div
        className="auth-side-float rounded-[14px] border p-4"
        style={{ borderColor: "var(--auth-border)", background: "var(--auth-card-bg)" }}
      >
        <div className="mb-3 flex items-center gap-2 border-b pb-2.5" style={{ borderColor: "var(--auth-border)" }}>
          <Logo size={20} />
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--auth-text-muted)" }}>ACME CORP · v1.2.0</span>
          <div className="ml-auto">
            <LiveBadge label="Live" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {TOKENS.map((token) => (
            <div key={token.name} className="flex items-center gap-2">
              <div
                className="h-3.5 w-3.5 shrink-0 rounded-[3px] border"
                style={{
                  background: token.color,
                  borderColor: token.border ? "var(--auth-border2)" : "transparent",
                }}
              />
              <span className="flex-1 font-mono text-[10px]" style={{ color: "var(--auth-text-muted)" }}>{token.name}</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--auth-text-faint)" }}>{token.val}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1">
          {["CSS vars", "Tailwind", "GitHub PR", "npm pkg"].map((pill, i) => (
            <span
              key={pill}
              className="rounded-[5px] border px-2 py-0.5 text-[9px]"
              style={{
                borderColor: i < 2 ? "var(--auth-violet-border)" : "var(--auth-border)",
                background: i < 2 ? "var(--auth-violet-dim)" : "var(--auth-input-bg)",
                color: i < 2 ? "var(--ac3)" : "var(--auth-text-faint)",
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
