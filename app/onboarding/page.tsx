import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Onboarding — DesignForge",
  description: "Set up your design system in minutes.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
