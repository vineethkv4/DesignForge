"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { DEMO_CREDENTIALS } from "@/lib/demoCredentials";
import { Logo } from "./Logo";
import { getSignInPath, getSignUpPath } from "@/lib/routes";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#formats", label: "Formats" },
  { href: "#pricing", label: "Pricing" },
];

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`landing-nav ${scrolled ? "scrolled" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link href="/" className="flex items-center gap-2.5">
        <Logo />
        <span
          className="text-[17px] font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-inter-tight)",
            color: "var(--lp-fg)",
          }}
        >
          DesignForge
        </span>
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="landing-nav-link">
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="landing-btn-ghost flex h-9 w-9 items-center justify-center p-0"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <IconSun size={16} />
          ) : (
            <IconMoon size={16} />
          )}
        </button>
        <div className="landing-signin-wrap hidden sm:block">
          <Link href={getSignInPath()} className="landing-btn-ghost">
            Sign in
          </Link>
          {IS_DEMO && (
            <div className="landing-signin-demo-tip" role="tooltip">
              <span className="landing-signin-demo-badge">Demo site</span>
              <span className="landing-signin-demo-text">
                Try the login flow — no backend required.
              </span>
              <span className="landing-signin-demo-creds">
                <code>{DEMO_CREDENTIALS.email}</code>
                <span aria-hidden>/</span>
                <code>{DEMO_CREDENTIALS.password}</code>
              </span>
            </div>
          )}
        </div>
        <Link href={getSignUpPath()} className="landing-btn-cta">
          Get started free →
        </Link>
      </div>
    </nav>
  );
}
