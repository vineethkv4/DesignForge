import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ClerkSignInGate } from "@/components/auth/ClerkSignInGate";
import { DemoAuthForm } from "@/components/auth/DemoAuthForm";
import { isClerkEnabled } from "@/lib/clerkEnabled";

export const metadata: Metadata = {
  title: "Sign in — DesignForge",
  description: "Sign in to your DesignForge account.",
};

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      {isClerkEnabled() ? <ClerkSignInGate /> : <DemoAuthForm mode="sign-in" />}
    </AuthShell>
  );
}
