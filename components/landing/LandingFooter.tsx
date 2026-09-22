import Link from "next/link";
import { Logo } from "./Logo";

const FOOTER_LINKS = {
  Product: [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#formats", label: "Export formats" },
    { href: "#pricing", label: "Pricing" },
  ],
  Resources: [
    { href: "#", label: "Documentation" },
    { href: "#", label: "Changelog" },
    { href: "#", label: "GitHub" },
    { href: "#", label: "Design system presets" },
  ],
  Company: [
    { href: "#", label: "About" },
    { href: "mailto:hello@designforge.io", label: "Contact" },
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t px-10 pb-10 pt-[60px]" style={{ borderColor: "var(--lp-border)", background: "var(--lp-bg2)" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-[60px] grid gap-[60px] md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <Logo size={26} />
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "var(--font-inter-tight)", color: "var(--lp-fg)" }}
              >
                DesignForge
              </span>
            </div>
            <p className="max-w-[220px] text-sm font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>
              Now in early access · Free plan included for dev-led teams. No Figma. No designer. Ships to production.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--lp-text-faint)" }}>
                {title}
              </div>
              <div className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm tracking-tight transition-colors hover:text-[var(--lp-fg)]"
                    style={{ color: "var(--lp-text-muted)" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row"
          style={{ borderColor: "var(--lp-border)" }}
        >
          <span className="text-[13px]" style={{ color: "var(--lp-text-faint)" }}>
            © 2025 DesignForge. Built for dev-led teams who don&apos;t use Figma.
          </span>
          <span className="text-[13px]" style={{ color: "var(--lp-text-faint)" }}>
            hello@designforge.io
          </span>
        </div>
      </div>
    </footer>
  );
}
