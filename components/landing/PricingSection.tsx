"use client";

import Link from "next/link";
import { getSignUpPath } from "@/lib/routes";

type PricingTier = "free" | "starter" | "team";

interface PricingCardProps {
  tier: PricingTier;
  price: string;
  priceSub?: string;
  description: string;
  features: string[];
  excludedFeatures: string[];
  isPopular?: boolean;
  onCTAClick?: () => void;
  ctaLabel: string;
  ctaFilled?: boolean;
  ctaHref?: string;
}

function PricingCard({
  price,
  priceSub = "/ month",
  description,
  features,
  excludedFeatures,
  isPopular,
  ctaLabel,
  ctaFilled,
  ctaHref,
}: PricingCardProps) {
  return (
    <div className={`landing-pricing-card ${isPopular ? "featured" : ""}`}>
      {isPopular && (
        <div className="landing-badge-brand absolute left-1/2 top-[-14px] -translate-x-1/2 rounded-full px-[18px] py-1 text-[11px] font-bold tracking-wide">
          Most popular
        </div>
      )}
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--lp-text-muted)" }}>
        {isPopular ? "Starter" : price === "₹0" ? "Free" : "Team"}
      </div>
      <div
        className="mb-2 leading-none tracking-[-0.05em]"
        style={{ fontFamily: "var(--font-inter-tight)", fontSize: "56px", fontWeight: 800, color: "var(--lp-fg)" }}
      >
        {price}{" "}
        <sub className="text-lg font-light tracking-normal" style={{ color: "var(--lp-text-muted)" }}>
          {priceSub}
        </sub>
      </div>
      <p className="mb-7 text-sm font-light leading-relaxed" style={{ color: "var(--lp-text-muted)" }}>
        {description}
      </p>
      <div className="mb-6 h-px" style={{ background: "var(--lp-border)" }} />
      {features.map((feat) => (
        <div key={feat} className="mb-2.5 flex items-center gap-2.5 text-[13px] tracking-tight" style={{ color: "var(--lp-text)" }}>
          <span style={{ color: "var(--emerald)" }}>✓</span>
          {feat}
        </div>
      ))}
      {excludedFeatures.map((feat) => (
        <div key={feat} className="mb-2.5 flex items-center gap-2.5 text-[13px] tracking-tight" style={{ color: "var(--lp-text-muted)" }}>
          <span className="opacity-25">—</span>
          {feat}
        </div>
      ))}
      <Link
        href={ctaHref ?? getSignUpPath()}
        className={`mt-7 block w-full rounded-[11px] py-3 text-center text-sm font-semibold tracking-tight transition-all ${
          ctaFilled
            ? "landing-btn-brand-lg hover:-translate-y-px"
            : "border hover:bg-[var(--lp-grey1)]"
        }`}
        style={
          ctaFilled
            ? undefined
            : { borderColor: "var(--lp-border2)", color: "var(--lp-text-muted)" }
        }
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

const PLANS: Omit<PricingCardProps, "onCTAClick">[] = [
  {
    tier: "free",
    price: "₹0",
    description: "Build and validate your first design system. No credit card required.",
    features: [
      "1 token set",
      "CSS + Tailwind export",
      "Live preview panel",
      "5 exports / month",
      "WCAG contrast check",
    ],
    excludedFeatures: ["GitHub PR sync", "AI suggestions"],
    ctaLabel: "Get started free →",
    ctaHref: "#cta",
  },
  {
    tier: "starter",
    price: "$7",
    description: "For solo devs and small teams shipping real products to production.",
    features: [
      "10 token sets",
      "All export formats",
      "GitHub PR sync",
      "CDN token delivery",
      "20 AI suggestions / month",
      "Dark mode themes",
    ],
    excludedFeatures: ["npm publish"],
    isPopular: true,
    ctaLabel: "Start building free",
    ctaFilled: true,
  },
  {
    tier: "team",
    price: "$19",
    description: "For growing teams shipping across web, mobile, and multiple platforms.",
    features: [
      "Unlimited token sets",
      "3 team members",
      "npm package publish",
      "Android XML + iOS Swift",
      "Unlimited AI suggestions",
      "Version history + rollback",
      "Auto-generated docs site",
    ],
    excludedFeatures: [],
    ctaLabel: "Create account",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-t px-10 py-[100px]" style={{ borderColor: "var(--lp-border)" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-[60px] text-center">
          <div className="landing-section-tag justify-center">
            <span className="landing-section-dot h-1 w-1 rounded-full" />
            Pricing
          </div>
          <h2 className="landing-section-h2 text-center">
            Start free.
            <br />
            <em className="font-normal not-italic" style={{ color: "var(--lp-text-muted)" }}>Pay when you ship.</em>
          </h2>
          <p className="landing-section-p mx-auto text-center">
            No credit card. No Figma licence. Free plan forever — upgrade only when you need production delivery.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.tier} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
