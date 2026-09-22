import Link from "next/link";
import { Logo } from "@/components/landing/Logo";

export function AuthNav() {
  return (
    <nav className="auth-nav">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size={28} />
        <span
          className="text-[17px] font-bold tracking-tight text-[var(--auth-text)]"
          style={{ fontFamily: "var(--font-inter-tight)" }}
        >
          DesignForge
        </span>
      </Link>
      <Link href="/" className="auth-back-btn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to home
      </Link>
    </nav>
  );
}
