import {
  clearOnboardingCompleteCookie,
  setOnboardingCompleteCookie,
} from "@/lib/onboardingCookie";
import type {
  FontPairing,
  OnboardingPayload,
  RadiusStyle,
  SavedOnboardingData,
  SpacingDensity,
  WizardState,
} from "@/types/onboarding";
import {
  ONBOARDING_COMPLETE_STORAGE_KEY,
  WIZARD_STORAGE_KEY,
} from "@/types/onboarding";

export const WIZARD_STEPS = [
  { label: "System name", desc: "Naming your project" },
  { label: "Brand color", desc: "Color scale generation" },
  { label: "Visual style", desc: "Radius & spacing" },
  { label: "Typography", desc: "Font pairing" },
  { label: "Preview", desc: "Review & launch" },
] as const;

export const NAME_CHIPS = [
  "Acme Corp",
  "Startup Kit",
  "MyBrand",
  "DevKit",
  "Atlas UI",
] as const;

export const COLOR_PRESETS = [
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#dc2626",
  "#d97706",
  "#db2777",
  "#0891b2",
  "#ea580c",
] as const;

export const RADIUS_STYLES: Record<
  RadiusStyle,
  { name: string; desc: string; r: number; btnR: number; inputR: number }
> = {
  rounded: { name: "Rounded", desc: "Friendly & approachable", r: 8, btnR: 8, inputR: 8 },
  soft: { name: "Soft", desc: "Minimal & refined", r: 4, btnR: 6, inputR: 6 },
  sharp: { name: "Sharp", desc: "Bold & structured", r: 0, btnR: 2, inputR: 2 },
  pill: { name: "Pill", desc: "Playful & expressive", r: 20, btnR: 20, inputR: 20 },
};

export const SPACING_DENSITIES: Record<
  SpacingDensity,
  { name: string; heights: number[]; gap: number }
> = {
  compact: { name: "Compact", heights: [10, 14, 10], gap: 2 },
  default: { name: "Default", heights: [14, 20, 14], gap: 3 },
  relaxed: { name: "Relaxed", heights: [18, 26, 18], gap: 4 },
  airy: { name: "Airy", heights: [22, 32, 22], gap: 5 },
};

export const FONT_PAIRINGS: Record<
  FontPairing,
  { name: string; sample: string; googleFamilies: string }
> = {
  inter: {
    name: "Inter + Inter Tight",
    sample: "The quick brown fox jumps",
    googleFamilies: "Inter:wght@400;500;700|Inter+Tight:wght@600;700",
  },
  jakarta: {
    name: "Plus Jakarta Sans",
    sample: "Design with true intention",
    googleFamilies: "Plus+Jakarta+Sans:wght@400;500;700",
  },
  dm: {
    name: "DM Sans + DM Mono",
    sample: "Clean, technical, precise",
    googleFamilies: "DM+Sans:wght@400;500;700|DM+Mono:wght@400;500",
  },
  geist: {
    name: "Geist + Geist Mono",
    sample: "Developer-first clarity",
    googleFamilies: "Geist:wght@400;500;700|Geist+Mono:wght@400;500",
  },
};

export const DEMO_WIZARD_STATE: Omit<WizardState, "step" | "completed"> = {
  systemName: "Acme Corp",
  brandColor: "#7c3aed",
  radiusStyle: "rounded",
  spacingDensity: "default",
  fontPairing: "inter",
};

export function getInitialWizardState(): WizardState {
  return {
    systemName: "",
    brandColor: "#7c3aed",
    radiusStyle: "rounded",
    spacingDensity: "default",
    fontPairing: "inter",
    step: 0,
    completed: false,
  };
}

export function saveOnboardingToStorage(data: SavedOnboardingData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
}

export function markOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_COMPLETE_STORAGE_KEY, "1");
  setOnboardingCompleteCookie();
}

export function hasOnboardingCompleteInStorage(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_COMPLETE_STORAGE_KEY) === "1";
}

export function clearOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_COMPLETE_STORAGE_KEY);
  clearOnboardingCompleteCookie();
}

/** Sync cookie from localStorage when flag exists but cookie was cleared */
export function syncOnboardingCompleteCookie(): void {
  if (!hasOnboardingCompleteInStorage()) return;
  setOnboardingCompleteCookie();
}

export function loadOnboardingFromStorage(): SavedOnboardingData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedOnboardingData) : null;
  } catch {
    return null;
  }
}

export function wizardStateToSaved(state: WizardState): OnboardingPayload {
  return {
    systemName: state.systemName,
    brandColor: state.brandColor,
    radiusStyle: state.radiusStyle,
    spacingDensity: state.spacingDensity,
    fontPairing: state.fontPairing,
    completedAt: new Date().toISOString(),
  };
}
