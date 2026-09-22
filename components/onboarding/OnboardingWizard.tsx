"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/onboarding/WizardShell";
import { WizardStep1Name } from "@/components/onboarding/WizardStep1Name";
import { WizardStep2Color } from "@/components/onboarding/WizardStep2Color";
import { WizardStep3Style } from "@/components/onboarding/WizardStep3Style";
import { WizardStep4Font } from "@/components/onboarding/WizardStep4Font";
import { WizardStep5Preview } from "@/components/onboarding/WizardStep5Preview";
import { useWizard } from "@/hooks/useWizard";
import {
  hasOnboardingCompleteInStorage,
  syncOnboardingCompleteCookie,
} from "@/lib/onboardingData";
import { ROUTES } from "@/lib/routes";

export function OnboardingWizard() {
  const router = useRouter();
  const {
    state,
    dispatch,
    isSubmitting,
    error,
    canContinue,
    handleNext,
    handlePrev,
    jumpToStep,
    loadDemo,
    showDemoShortcut,
    retryRedirect,
  } = useWizard();

  useEffect(() => {
    if (!hasOnboardingCompleteInStorage()) return;
    syncOnboardingCompleteCookie();
    router.replace(ROUTES.dashboard);
  }, [router]);

  return (
    <WizardShell
      state={state}
      brandColor={state.brandColor}
      isSubmitting={isSubmitting}
      error={error}
      canContinue={canContinue}
      showDemoShortcut={showDemoShortcut}
      onPrev={handlePrev}
      onNext={handleNext}
      onSkip={() => dispatch({ type: "SKIP_TO_PREVIEW" })}
      onJumpStep={jumpToStep}
      onLoadDemo={loadDemo}
      onGoToDashboard={retryRedirect}
    >
      {state.step === 0 && (
        <WizardStep1Name
          systemName={state.systemName}
          onChange={(value) => dispatch({ type: "SET_FIELD", field: "systemName", value })}
        />
      )}
      {state.step === 1 && (
        <WizardStep2Color
          brandColor={state.brandColor}
          onChange={(value) => dispatch({ type: "SET_FIELD", field: "brandColor", value })}
        />
      )}
      {state.step === 2 && (
        <WizardStep3Style
          radiusStyle={state.radiusStyle}
          spacingDensity={state.spacingDensity}
          brandColor={state.brandColor}
          onRadiusChange={(value) =>
            dispatch({ type: "SET_FIELD", field: "radiusStyle", value })
          }
          onDensityChange={(value) =>
            dispatch({ type: "SET_FIELD", field: "spacingDensity", value })
          }
        />
      )}
      {state.step === 3 && (
        <WizardStep4Font
          fontPairing={state.fontPairing}
          brandColor={state.brandColor}
          onChange={(value) => dispatch({ type: "SET_FIELD", field: "fontPairing", value })}
        />
      )}
      {state.step === 4 && <WizardStep5Preview state={state} />}
    </WizardShell>
  );
}
