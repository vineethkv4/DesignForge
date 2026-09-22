import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { MarqueeSection } from "@/components/landing/MarqueeSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeatureSplitsSection } from "@/components/landing/FeatureSplitsSection";
import { FormatsSection } from "@/components/landing/FormatsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <HeroSection />
        <MarqueeSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FeatureSplitsSection />
        <FormatsSection />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  );
}
