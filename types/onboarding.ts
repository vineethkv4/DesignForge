export type RadiusStyle = "rounded" | "soft" | "sharp" | "pill";
export type SpacingDensity = "compact" | "default" | "relaxed" | "airy";
export type FontPairing = "inter" | "jakarta" | "dm" | "geist";

export interface WizardState {
  systemName: string;
  brandColor: string;
  radiusStyle: RadiusStyle;
  spacingDensity: SpacingDensity;
  fontPairing: FontPairing;
  step: 0 | 1 | 2 | 3 | 4;
  completed: boolean;
}

export type WizardAction =
  | {
      type: "SET_FIELD";
      field: keyof Omit<WizardState, "step" | "completed">;
      value: WizardState[keyof Omit<WizardState, "step" | "completed">];
    }
  | { type: "SET_STEP"; step: WizardState["step"] }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SKIP_TO_PREVIEW" }
  | { type: "LOAD_DEMO" }
  | { type: "COMPLETE" }
  | { type: "UNCOMPLETE" };

export const WIZARD_STORAGE_KEY = "df_onboarding";
export const ONBOARDING_COMPLETE_STORAGE_KEY = "df_onboarding_complete";

export interface SavedOnboardingData {
  systemId?: string;
  systemName: string;
  brandColor: string;
  radiusStyle: RadiusStyle;
  spacingDensity: SpacingDensity;
  fontPairing: FontPairing;
  completedAt: string;
}

export type OnboardingPayload = Omit<SavedOnboardingData, "systemId">;
