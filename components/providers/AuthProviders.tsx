"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { isClerkEnabled } from "@/lib/clerkEnabled";
import { ROUTES } from "@/lib/routes";

interface AuthProvidersProps {
  children: React.ReactNode;
}

export function AuthProviders({ children }: AuthProvidersProps) {
  const themed = <ThemeProvider>{children}</ThemeProvider>;

  if (!isClerkEnabled()) {
    return themed;
  }

  return (
    <ClerkProvider
      signInFallbackRedirectUrl={ROUTES.dashboard}
      signUpFallbackRedirectUrl={ROUTES.onboarding}
    >
      {themed}
    </ClerkProvider>
  );
}
