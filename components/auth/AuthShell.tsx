import Link from "next/link";
import { AuthNav } from "@/components/auth/AuthNav";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { AuthTabSwitcher } from "@/components/auth/AuthTabSwitcher";
import { AuthThemeToggle } from "@/components/auth/AuthThemeToggle";

type AuthMode = "sign-in" | "sign-up";

interface AuthShellProps {
  mode: AuthMode;
  children: React.ReactNode;
}

const COPY: Record<
  AuthMode,
  { badge: string; title: string; subtitle: React.ReactNode }
> = {
  "sign-up": {
    badge: "Free account · No credit card",
    title: "Create your account",
    subtitle: (
      <>
        Already have one? <Link href="/sign-in">Sign in →</Link>
      </>
    ),
  },
  "sign-in": {
    badge: "Welcome back",
    title: "Sign in",
    subtitle: (
      <>
        No account yet? <Link href="/sign-up">Create one free →</Link>
      </>
    ),
  },
};

export function AuthShell({ mode, children }: AuthShellProps) {
  const copy = COPY[mode];

  return (
    <div className="auth-page">
      <AuthNav />

      <div className="auth-page-wrap">
        <div className="auth-orb auth-orb-1 animate-orb-1" aria-hidden />
        <div className="auth-orb auth-orb-2 animate-orb-2" aria-hidden />
        <div className="auth-orb auth-orb-3 animate-orb-3" aria-hidden />
        <div className="auth-dot-grid" aria-hidden />

        <div className="auth-layout">
          <AuthSidePanel />

          <div className="auth-wrap">
            <div className="auth-glow" aria-hidden />
            <div className="auth-card">
              <AuthTabSwitcher active={mode} />

              <div className="auth-card-badge">
                <span
                  className="h-1 w-1 rounded-full animate-pulse-dot"
                  style={{ background: "var(--ac3)" }}
                  aria-hidden
                />
                {copy.badge}
              </div>

              <h1 className="auth-card-title">{copy.title}</h1>
              <p className="auth-card-sub">{copy.subtitle}</p>

              {children}
            </div>
          </div>
        </div>
      </div>

      <AuthThemeToggle />
    </div>
  );
}
