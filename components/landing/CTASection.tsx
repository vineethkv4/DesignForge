"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSignUpPath } from "@/lib/routes";

const TRUST_ITEMS = [
  "No Figma needed",
  "Ships to GitHub automatically",
  "WCAG built-in",
  "Cancel anytime",
];

export function CTASection() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const signUpPath = getSignUpPath();

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    router.push(signUpPath);
  };

  return (
    <section id="cta" className="relative overflow-hidden border-t px-10 py-[120px] text-center" style={{ borderColor: "var(--lp-border)" }}>
      <div className="landing-glow-radial pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 blur-[60px]" aria-hidden />

      <div className="relative mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--lp-accent-text)", background: "var(--lp-brand-dim)", borderColor: "var(--lp-brand-border)" }}>
        <span className="landing-pulse-dot-brand h-[5px] w-[5px] animate-pulse-dot rounded-full" aria-hidden />
        Free account · No credit card required
      </div>

      <h2 className="relative mb-[18px] leading-[0.96] tracking-[-0.04em]" style={{ fontFamily: "var(--font-inter-tight)", fontSize: "clamp(48px, 6.5vw, 88px)", fontWeight: 800, color: "var(--lp-fg)" }}>
        Generate your<br />
        <em className="gradient-text font-normal not-italic">design system</em><br />
        in minutes.
      </h2>

      <p className="landing-section-p relative mx-auto mb-11 max-w-[420px] text-center">
        Create your free account. Pick a preset. Your complete design system is ready before your next meeting. No designer, no Figma, no credit card.
      </p>

      <div className="relative mx-auto mb-4 flex max-w-[440px] flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          id="cta-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          aria-label="Email address"
          className="flex-1 rounded-[11px] border px-[18px] py-3.5 text-[15px] outline-none backdrop-blur-sm transition-colors focus:border-[var(--ac)]"
          style={{ background: "var(--lp-grey1)", borderColor: "var(--lp-border2)", color: "var(--lp-fg)" }}
        />
        <button type="button" onClick={() => handleSubmit()} className="landing-btn-brand-lg flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] px-6 py-3.5 text-sm font-semibold tracking-tight hover:-translate-y-px">
          Create free account
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <p className="relative text-[13px]" style={{ color: "var(--lp-text-faint)" }}>No credit card · Free plan forever · Setup in 10 minutes</p>

      <div className="relative mt-3.5 flex items-center justify-center gap-4">
        <div className="h-px max-w-[120px] flex-1" style={{ background: "var(--lp-border)" }} />
        <span className="text-xs tracking-wide" style={{ color: "var(--lp-text-faint)" }}>or sign up with</span>
        <div className="h-px max-w-[120px] flex-1" style={{ background: "var(--lp-border)" }} />
      </div>

      <div className="relative mt-3 flex flex-wrap justify-center gap-2.5">
        <Link href={`${signUpPath}?strategy=oauth_google`} className="landing-oauth-btn">
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
            <path fill="#FBBC05" d="M11.68 28.18A13.96 13.96 0 0 1 10.8 24c0-1.45.25-2.86.88-4.18v-5.7H4.34A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.56 10.74l7.12-6.56z" />
            <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.09 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.26l7.34 5.56C13.42 13.62 18.27 9.75 24 9.75z" />
          </svg>
          Google
        </Link>
        <Link href={`${signUpPath}?strategy=oauth_github`} className="landing-oauth-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </Link>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
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
    </section>
  );
}
