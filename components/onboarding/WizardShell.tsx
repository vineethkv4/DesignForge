"use client";

import { IconCheck, IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Logo } from "@/components/landing/Logo";
import { WIZARD_STEPS } from "@/lib/onboardingData";
import type { WizardState } from "@/types/onboarding";

interface WizardShellProps {
  state: WizardState;
  brandColor: string;
  isSubmitting: boolean;
  error: string | null;
  canContinue: boolean;
  showDemoShortcut: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onJumpStep: (step: WizardState["step"]) => void;
  onLoadDemo: () => void;
  onGoToDashboard: () => void;
  children: React.ReactNode;
}

export function WizardShell({
  state,
  brandColor,
  isSubmitting,
  error,
  canContinue,
  showDemoShortcut,
  onPrev,
  onNext,
  onSkip,
  onJumpStep,
  onLoadDemo,
  onGoToDashboard,
  children,
}: WizardShellProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const progress = state.completed ? 100 : ((state.step + 1) / WIZARD_STEPS.length) * 100;
  const isDark = resolvedTheme === "dark";

  return (
    <div className="onboarding-page">
      <div className="wizard">
        <aside className="wizard-left">
          <div className="wizard-logo">
            <Logo size={28} />
            <span className="wizard-brand">DesignForge</span>
          </div>

          <nav className="wizard-steps" aria-label="Onboarding steps">
            {WIZARD_STEPS.map((step, index) => {
              const done = state.completed || index < state.step;
              const active = index === state.step && !state.completed;
              const stepKey = index as WizardState["step"];

              return (
                <div key={step.label}>
                  <button
                    type="button"
                    className={`wizard-step-item${active ? " active" : ""}${done ? " done" : ""}`}
                    onClick={() => onJumpStep(stepKey)}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="wizard-step-circle">
                      {done ? <IconCheck size={12} stroke={2.5} /> : index + 1}
                    </span>
                    <span>
                      <div className="wizard-step-label">{step.label}</div>
                      <div className="wizard-step-desc">{step.desc}</div>
                    </span>
                  </button>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="wizard-step-connector" aria-hidden />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="wizard-left-footer">
            <button
              type="button"
              className="wizard-theme-btn"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {mounted && isDark ? <IconSun size={14} /> : <IconMoon size={14} />}
              {mounted && isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </aside>

        <div className="wizard-right">
          <div className="wizard-topbar">
            <span className="wizard-stepinfo">
              {state.completed ? "Complete" : `Step ${state.step + 1} of ${WIZARD_STEPS.length}`}
              {showDemoShortcut && state.step === 0 && (
                <button type="button" className="wizard-demo-shortcut" onClick={onLoadDemo}>
                  Try with sample data →
                </button>
              )}
            </span>
            <div className="wizard-prog-track">
              <div
                className="wizard-prog-fill"
                style={{ width: `${progress}%`, background: brandColor }}
              />
            </div>
            {!state.completed && state.step < 4 && (
              <button type="button" className="wizard-skip" onClick={onSkip}>
                Skip to preview →
              </button>
            )}
          </div>

          <div className="wizard-body">
            {state.completed ? (
              <WizardSuccessView
                systemName={state.systemName}
                brandColor={brandColor}
                onGoToDashboard={onGoToDashboard}
              />
            ) : (
              <div className="wizard-fade-up" key={state.step}>
                {children}
              </div>
            )}
          </div>

          {!state.completed && (
            <div className="wizard-footer">
              <button
                type="button"
                className="wizard-btn-back"
                onClick={onPrev}
                style={{ visibility: state.step === 0 ? "hidden" : "visible" }}
              >
                ← Back
              </button>
              <div>
                {error && <p className="wizard-error">{error}</p>}
                <button
                  type="button"
                  className="wizard-btn-next"
                  style={{ background: brandColor }}
                  onClick={onNext}
                  disabled={!canContinue || isSubmitting}
                >
                  {isSubmitting
                    ? "Launching…"
                    : state.step === 4
                      ? "Launch dashboard →"
                      : "Continue →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WizardSuccessView({
  systemName,
  brandColor,
  onGoToDashboard,
}: {
  systemName: string;
  brandColor: string;
  onGoToDashboard: () => void;
}) {
  return (
    <div className="wizard-success wizard-fade-up">
      <div className="wizard-success-ring">✓</div>
      <h2 className="wizard-h">System created!</h2>
      <p className="wizard-sub" style={{ margin: "0 auto 20px" }}>
        Your <strong>{systemName}</strong> design system is ready. Opening your dashboard now…
      </p>
      <div className="wizard-success-progress">
        <div
          className="wizard-success-progress-fill"
          style={{ background: brandColor }}
        />
      </div>
      <button type="button" className="wizard-success-btn" onClick={onGoToDashboard}>
        Open dashboard →
      </button>
    </div>
  );
}
