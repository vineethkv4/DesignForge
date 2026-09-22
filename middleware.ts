import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { isClerkServerEnabled } from "@/lib/clerkEnabled";
import { isDemoMode } from "@/lib/demoMode";
import { hasOnboardingCookie, ONBOARDING_COOKIE } from "@/lib/onboardingCookie";
import { ROUTES } from "@/lib/routes";

const isPublicRoute = createRouteMatcher([
  ROUTES.landing,
  `${ROUTES.signIn}(.*)`,
  `${ROUTES.signUp}(.*)`,
]);

const isOnboardingRoute = createRouteMatcher([`${ROUTES.onboarding}(.*)`]);

/** Protected app surfaces — users must complete onboarding first */
const isAppRoute = createRouteMatcher([
  `${ROUTES.dashboard}(.*)`,
  `${ROUTES.systemsList}(.*)`,
  "/editor(.*)",
  `${ROUTES.colors}(.*)`,
  `${ROUTES.ai}(.*)`,
  `${ROUTES.export}(.*)`,
  `${ROUTES.settings}(.*)`,
]);

function resolveDemoOnboardingComplete(req: NextRequest): boolean {
  const cookieValue = req.cookies.get(ONBOARDING_COOKIE)?.value;
  return hasOnboardingCookie(cookieValue);
}

/**
 * Demo mode has no Clerk session — gate app routes via the onboarding
 * completion cookie (mirrored from localStorage on the client).
 */
function handleDemoOnboardingRouting(req: NextRequest): NextResponse | undefined {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return undefined;
  }

  if (isPublicRoute(req)) {
    return undefined;
  }

  const onboardingComplete = resolveDemoOnboardingComplete(req);

  if (onboardingComplete && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
  }

  if (!onboardingComplete && isAppRoute(req)) {
    return NextResponse.redirect(new URL(ROUTES.onboarding, req.url));
  }

  return undefined;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isClerkServerEnabled()) {
    const { default: clerkHandler } = await import("./middleware.clerk");
    return clerkHandler(request, event);
  }

  if (isDemoMode()) {
    const demoResponse = handleDemoOnboardingRouting(request);
    if (demoResponse) return demoResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
