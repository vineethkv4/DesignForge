"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { AuthClerkLoading } from "@/components/auth/AuthClerkLoading";
import { CLERK_APPEARANCE } from "@/lib/clerkAppearance";
import { ROUTES } from "@/lib/routes";

export function ClerkSignUp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <AuthClerkLoading />;
  }

  return (
    <SignUp
      appearance={CLERK_APPEARANCE}
      routing="path"
      path="/sign-up"
      signInUrl={ROUTES.signIn}
      fallbackRedirectUrl={ROUTES.onboarding}
    />
  );
}
