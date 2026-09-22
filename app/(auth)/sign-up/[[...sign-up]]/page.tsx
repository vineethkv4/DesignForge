import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ClerkSignUpGate } from "@/components/auth/ClerkSignUpGate";
import { DemoAuthForm } from "@/components/auth/DemoAuthForm";
import { isClerkEnabled } from "@/lib/clerkEnabled";

export const metadata: Metadata = {
  title: "Create account — DesignForge",
  description: "Create your free DesignForge account.",
};

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      {isClerkEnabled() ? <ClerkSignUpGate /> : <DemoAuthForm mode="sign-up" />}
    </AuthShell>
  );
}
