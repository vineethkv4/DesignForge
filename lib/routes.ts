/** Route paths aligned with designforge_sitemap.html */

export const ROUTES = {
  landing: "/",
  signUp: "/sign-up",
  signIn: "/sign-in",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  /** Full design-systems library (card grid). */
  systemsList: "/systems",
  editor: (systemId: string) => `/editor/${systemId}`,
  /** Published design-system view (read-only df_published_*). */
  systemView: (systemId: string) => `/design-system/${systemId}`,
  colors: "/colors",
  ai: "/ai",
  export: "/export",
  settings: "/settings",
} as const;

export const API_ROUTES = {
  onboardingComplete: "/api/onboarding/complete",
  logout: "/api/auth/logout",
} as const;

export function getSignUpPath(): string {
  return ROUTES.signUp;
}

export function getSignInPath(): string {
  return ROUTES.signIn;
}

export function getDashboardPath(): string {
  return ROUTES.dashboard;
}
