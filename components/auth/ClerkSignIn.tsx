"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { AuthClerkLoading } from "@/components/auth/AuthClerkLoading";
import { CLERK_APPEARANCE } from "@/lib/clerkAppearance";
import { ROUTES } from "@/lib/routes";

export function ClerkSignIn() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <AuthClerkLoading />;
  }

  return (
    <SignIn
      appearance={CLERK_APPEARANCE}
      routing="path"
      path="/sign-in"
      signUpUrl={ROUTES.signUp}
      fallbackRedirectUrl={ROUTES.onboarding}
    />
  );
}
