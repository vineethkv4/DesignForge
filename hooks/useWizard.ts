"use client";

import { useCallback, useReducer, useState } from "react";
import { isClerkEnabled, reloadClerkSession } from "@/lib/clerkEnabled";
import { isDemoMode } from "@/lib/demoMode";
import {
  DEMO_WIZARD_STATE,
  getInitialWizardState,
  markOnboardingComplete,
  saveOnboardingToStorage,
  wizardStateToSaved,
} from "@/lib/onboardingData";
import { API_ROUTES, getDashboardPath } from "@/lib/routes";
import { seedSystemFromOnboarding } from "@/lib/systemStorage";
import type { WizardAction, WizardState } from "@/types/onboarding";

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "NEXT_STEP":
      return { ...state, step: Math.min(4, state.step + 1) as WizardState["step"] };
    case "PREV_STEP":
      return { ...state, step: Math.max(0, state.step - 1) as WizardState["step"] };
    case "SKIP_TO_PREVIEW":
      return { ...state, step: 4 };
    case "LOAD_DEMO":
      return { ...state, ...DEMO_WIZARD_STATE, step: 4 };
    case "COMPLETE":
      return { ...state, completed: true };
    case "UNCOMPLETE":
      return { ...state, completed: false };
    default:
      return state;
  }
}

export function useWizard() {
  const [state, dispatch] = useReducer(wizardReducer, getInitialWizardState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useCallback(() => {
    if (state.step === 0) {
      return state.systemName.trim().length >= 2;
    }
    return true;
  }, [state.step, state.systemName]);

  const goToDashboard = useCallback(async () => {
    window.location.assign(getDashboardPath());
  }, []);

  const complete = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    const systemId = String(Date.now());
    const saved = { ...wizardStateToSaved(state), systemId };
    saveOnboardingToStorage(saved);
    seedSystemFromOnboarding(saved);
    markOnboardingComplete();

    dispatch({ type: "COMPLETE" });

    window.setTimeout(async () => {
      try {
        if (isClerkEnabled()) {
          const res = await fetch(API_ROUTES.onboardingComplete, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(saved),
            credentials: "same-origin",
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error ?? "Failed to complete onboarding");
          }

          await reloadClerkSession();
        }

        await goToDashboard();
      } catch (err) {
        dispatch({ type: "UNCOMPLETE" });
        setError(err instanceof Error ? err.message : "Something went wrong");
        setIsSubmitting(false);
      }
    }, 1200);
  }, [goToDashboard, state]);

  const retryRedirect = useCallback(() => {
    void goToDashboard();
  }, [goToDashboard]);

  const handleNext = useCallback(() => {
    if (!canContinue()) return;

    if (state.step === 4) {
      void complete();
      return;
    }

    dispatch({ type: "NEXT_STEP" });
  }, [canContinue, complete, state.step]);

  const handlePrev = useCallback(() => {
    dispatch({ type: "PREV_STEP" });
  }, []);

  const jumpToStep = useCallback(
    (target: WizardState["step"]) => {
      if (target <= state.step || target === state.step + 1) {
        dispatch({ type: "SET_STEP", step: target });
      }
    },
    [state.step]
  );

  const loadDemo = useCallback(() => {
    dispatch({ type: "LOAD_DEMO" });
  }, []);

  const showDemoShortcut = isDemoMode();

  return {
    state,
    dispatch,
    isSubmitting,
    error,
    canContinue: canContinue(),
    handleNext,
    handlePrev,
    jumpToStep,
    loadDemo,
    showDemoShortcut,
    retryRedirect,
  };
}
