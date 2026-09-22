import Link from "next/link";

type AuthMode = "sign-in" | "sign-up";

interface AuthTabSwitcherProps {
  active: AuthMode;
}

export function AuthTabSwitcher({ active }: AuthTabSwitcherProps) {
  return (
    <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
      <Link
        href="/sign-up"
        className={`auth-tab${active === "sign-up" ? " active" : ""}`}
        role="tab"
        aria-selected={active === "sign-up"}
      >
        Create account
      </Link>
      <Link
        href="/sign-in"
        className={`auth-tab${active === "sign-in" ? " active" : ""}`}
        role="tab"
        aria-selected={active === "sign-in"}
      >
        Sign in
      </Link>
    </div>
  );
}
