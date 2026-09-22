"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_CREDENTIALS } from "@/lib/demoCredentials";
import { hasOnboardingCompleteInStorage } from "@/lib/onboardingData";
import { ROUTES } from "@/lib/routes";

type AuthMode = "sign-in" | "sign-up";

interface DemoAuthFormProps {
  mode: AuthMode;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.68 28.18A13.96 13.96 0 0 1 10.8 24c0-1.45.25-2.86.88-4.18v-5.7H4.34A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.56 10.74l9.12-6.56z" />
      <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.09 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.26l7.34 5.56C13.42 13.62 18.27 9.75 24 9.75z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function SubmitArrow() {
  return (
    <span className="auth-btn-arrow" aria-hidden>
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M1.5 4.5h6M4.5 1.5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function DemoAuthForm({ mode }: DemoAuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo =
    mode === "sign-up"
      ? ROUTES.onboarding
      : hasOnboardingCompleteInStorage()
        ? ROUTES.dashboard
        : ROUTES.onboarding;

  const handleSocial = () => {
    setLoading(true);
    router.push(redirectTo);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    if (mode === "sign-in") {
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");

      if (
        email !== DEMO_CREDENTIALS.email ||
        password !== DEMO_CREDENTIALS.password
      ) {
        setError(
          `Use demo credentials: ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`
        );
        setLoading(false);
        return;
      }
    } else {
      const terms = form.get("terms");
      if (!terms) {
        setError("Please accept the terms to continue.");
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    window.setTimeout(() => router.push(redirectTo), 900);
  };

  if (success) {
    return (
      <div className="auth-success-state">
        <div className="auth-success-icon">✓</div>
        <div className="auth-success-title">
          {mode === "sign-up" ? "Account created!" : "Welcome back!"}
        </div>
        <p className="auth-success-sub">
          {mode === "sign-up"
            ? "Redirecting you to set up your design system…"
            : "Redirecting you to your dashboard…"}
        </p>
        <Link href={redirectTo} className="auth-success-btn">
          Continue
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M2.5 6.5h8M6.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="auth-demo-hint">
        <span className="auth-demo-hint-label">Demo login</span>
        <code>{DEMO_CREDENTIALS.email}</code>
        <span className="auth-demo-hint-sep">/</span>
        <code>{DEMO_CREDENTIALS.password}</code>
      </div>

      <div className="auth-social-row">
        <button type="button" className="auth-social-btn-native" onClick={handleSocial} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>
        <button type="button" className="auth-social-btn-native auth-social-btn-github" onClick={handleSocial} disabled={loading}>
          <GitHubIcon />
          GitHub
        </button>
      </div>

      <div className="auth-divider">
        <div className="auth-div-line" />
        <span className="auth-div-text">
          {mode === "sign-up" ? "or continue with email" : "or sign in with email"}
        </span>
        <div className="auth-div-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {mode === "sign-up" && (
          <div className="auth-form-grid">
            <div className="auth-form-group">
              <label className="auth-form-label-native" htmlFor="fname">
                First name <span>*</span>
              </label>
              <input id="fname" name="fname" type="text" className="auth-form-input-native" placeholder="Rahul" required autoComplete="given-name" />
            </div>
            <div className="auth-form-group">
              <label className="auth-form-label-native" htmlFor="lname">
                Last name
              </label>
              <input id="lname" name="lname" type="text" className="auth-form-input-native" placeholder="Kumar" autoComplete="family-name" />
            </div>
          </div>
        )}

        <div className="auth-form-group">
          <label className="auth-form-label-native" htmlFor="email">
            {mode === "sign-up" ? "Work email" : "Email address"} <span>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-form-input-native"
            placeholder="you@company.com"
            defaultValue={mode === "sign-in" ? DEMO_CREDENTIALS.email : ""}
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-form-group">
          {mode === "sign-in" ? (
            <div className="auth-forgot-row">
              <label className="auth-form-label-native" htmlFor="password" style={{ marginBottom: 0 }}>
                Password <span>*</span>
              </label>
              <span className="auth-forgot-link">Forgot password?</span>
            </div>
          ) : (
            <label className="auth-form-label-native" htmlFor="password">
              Password <span>*</span>
            </label>
          )}

          <div className="auth-input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="auth-form-input-native"
              placeholder={mode === "sign-up" ? "Min. 8 characters" : "Your password"}
              defaultValue={mode === "sign-in" ? DEMO_CREDENTIALS.password : ""}
              required
              minLength={mode === "sign-up" ? 8 : undefined}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              style={mode === "sign-in" ? { marginTop: 6 } : undefined}
            />
            <button
              type="button"
              className="auth-toggle-pw"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {mode === "sign-up" ? (
          <label className="auth-check-row">
            <input type="checkbox" name="terms" className="auth-check-input" />
            <span className="auth-check-label">
              I agree to the Terms of Service and Privacy Policy
            </span>
          </label>
        ) : (
          <label className="auth-check-row">
            <input type="checkbox" name="remember" className="auth-check-input" defaultChecked />
            <span className="auth-check-label">Remember me for 30 days</span>
          </label>
        )}

        {error && (
          <p className="auth-form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="auth-submit-btn-native" disabled={loading}>
          {loading ? (
            <span className="auth-btn-spinner" aria-hidden />
          ) : (
            <>
              <span>
                {mode === "sign-up" ? "Create free account" : "Sign in to DesignForge"}
              </span>
              <SubmitArrow />
            </>
          )}
        </button>
      </form>
    </>
  );
}
