export const ONBOARDING_COOKIE = "df_onboarding_complete";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function hasOnboardingCookie(cookieValue: string | undefined): boolean {
  return cookieValue === "1";
}

/** Client-only — mirrors localStorage flag so middleware can read it in demo mode */
export function setOnboardingCompleteCookie(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ONBOARDING_COOKIE}=1; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearOnboardingCompleteCookie(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ONBOARDING_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
