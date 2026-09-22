import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasOnboardingCookie, ONBOARDING_COOKIE } from "@/lib/onboardingCookie";
import { API_ROUTES, ROUTES } from "@/lib/routes";

const isPublicRoute = createRouteMatcher([
  ROUTES.landing,
  `${ROUTES.signIn}(.*)`,
  `${ROUTES.signUp}(.*)`,
]);

const isOnboardingRoute = createRouteMatcher([`${ROUTES.onboarding}(.*)`]);
const isOnboardingCompleteApi = createRouteMatcher([API_ROUTES.onboardingComplete]);
const isLogoutApi = createRouteMatcher([API_ROUTES.logout]);

function readOnboardingComplete(
  sessionClaims: Record<string, unknown> | null | undefined,
  cookieValue: string | undefined
): boolean {
  if (hasOnboardingCookie(cookieValue)) {
    return true;
  }

  const publicMetadata = sessionClaims?.publicMetadata as
    | { onboardingComplete?: boolean }
    | undefined;
  if (publicMetadata?.onboardingComplete === true) {
    return true;
  }

  const metadata = sessionClaims?.metadata as { onboardingComplete?: boolean } | undefined;
  return metadata?.onboardingComplete === true;
}

export default clerkMiddleware(async (auth, req) => {
  const authResult = await auth();

  if (!isPublicRoute(req)) {
    authResult.protect();
  }

  const { userId, sessionClaims } = authResult;

  if (!userId || isPublicRoute(req)) {
    return;
  }

  if (isOnboardingCompleteApi(req) || isLogoutApi(req)) {
    return;
  }

  const cookieValue = req.cookies.get(ONBOARDING_COOKIE)?.value;
  const onboardingComplete = readOnboardingComplete(
    sessionClaims as Record<string, unknown> | null | undefined,
    cookieValue
  );

  if (!onboardingComplete && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL(ROUTES.onboarding, req.url));
  }

  if (onboardingComplete && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
  }
});
