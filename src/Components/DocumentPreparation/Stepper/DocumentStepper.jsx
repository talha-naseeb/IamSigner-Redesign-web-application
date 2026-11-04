import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useTheme } from "@/Context/ThemeContext";
import { Nav } from "@/Components/UI/shadcnCompat";
import {
  STEPPER_FLOWS,
  getStepsForFlow,
  getStepStatus,
  getMarkerClass,
  getLineClass,
} from "./stepperConfig";

/**
 * DocumentStepper - Centralized Stepper Wizard Navigation Engine (ENG-01)
 *
 * Consolidates Upload Flow, BulkSend, SelfSignature, and Templates into
 * a single responsive, theme-aware, RTL-compatible vertical sidebar navigation.
 */
const DocumentStepper = ({
  activeStep = 1,
  completedSteps = [],
  flowType,
  steps: customSteps,
  t: customT,
  className = "",
  variant = "sidebar",
  onStepClick,
}) => {
  const location = useLocation();
  const { theme } = useTheme();
  const { t: hookT } = useTranslation();
  const t = customT || hookT;

  // Auto-detect template flow if not explicitly defined and route matches template creation/editing
  let resolvedFlow = flowType;
  if (!resolvedFlow) {
    const isTemplateRoute =
      location?.pathname?.includes("/create-templates") ||
      location?.pathname?.includes("/edit-templates") ||
      location?.pathname?.includes("/createTemplates") ||
      location?.pathname?.includes("/editTemplates");
    resolvedFlow = isTemplateRoute ? STEPPER_FLOWS.TEMPLATES : STEPPER_FLOWS.UPLOAD;
  }

  const steps = getStepsForFlow(resolvedFlow, customSteps);

  const translateLabel = (key, fallback) => {
    if (typeof t === "function") {
      const translated = t(key);
      if (translated && translated !== key) return translated;
    }
    return fallback || key;
  };

  if (variant === "studio") {
    return (
      <div
        className={`sticky top-0 z-30 w-full border-b border-[var(--modern-border)] bg-[var(--modern-card)]/95 shadow-xs backdrop-blur-md ${className}`}
        data-testid='document-stepper'
      >
        <div className='mx-auto flex max-w-[1560px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5'>
          <Link
            to={resolvedFlow === STEPPER_FLOWS.TEMPLATES ? "/templates-page" : "/home"}
            className='relative z-10 inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-[var(--modern-text)] no-underline transition-colors hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)]'
          >
            <Icons.Back size={14} className='rtl:rotate-180' />
            <span className='hidden sm:inline'>
              {resolvedFlow === STEPPER_FLOWS.TEMPLATES
                ? translateLabel("templateUploadFlow.myTemplate", "Templates")
                : translateLabel("Sidebar.Home", "Home")}
            </span>
          </Link>

          <nav
            aria-label='Progress'
            style={{ justifyContent: "safe center" }}
            className='relative z-0 flex min-w-0 flex-1 max-w-[760px] items-center justify-start md:justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 px-1'
          >
            {steps.map((step, index) => {
              const status = getStepStatus(step.stepNumber, activeStep, completedSteps);
              const isLastStep = index === steps.length - 1;
              const isClickable = Boolean(
                onStepClick && (status === "completed" || step.stepNumber <= activeStep)
              );

              return (
                <React.Fragment key={step.stepNumber || index}>
                  <div
                    data-step-number={step.stepNumber}
                    data-step-status={status}
                    aria-current={status === "active" ? "step" : undefined}
                    role={isClickable ? "button" : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={() => isClickable && onStepClick?.(step.stepNumber)}
                    className={`inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-full select-none transition-all ${
                      isClickable ? "cursor-pointer" : "cursor-default"
                    } ${
                      status === "active"
                        ? "border border-[var(--modern-primary,#4d8dff)] bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))] px-2.5 sm:px-3 py-1 sm:py-1.5 font-semibold text-[var(--modern-text)]"
                        : status === "completed"
                        ? "border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-card)] p-1 md:px-3 md:py-1.5 font-medium text-[var(--modern-text)]"
                        : "border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card)]/80 p-1 md:px-3 md:py-1.5 font-medium text-[var(--modern-muted,#64748b)]"
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] sm:text-xs font-semibold transition-all ${
                        status === "completed"
                          ? "border border-[var(--modern-success,#10b981)] bg-[var(--modern-success,#10b981)] text-white"
                          : status === "active"
                          ? "border border-transparent bg-gradient-to-br from-[var(--modern-primary,#4d8dff)] to-[#5b5bf0] text-white ring-2 ring-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_25%,transparent)]"
                          : "border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-card)] text-[var(--modern-muted,#64748b)]"
                      }`}
                    >
                      {status === "completed" ? (
                        <Icons.Check size={13} />
                      ) : (
                        step.stepNumber
                      )}
                    </span>
                    <span
                      className={`transition-colors ${
                        status === "active"
                          ? "inline max-w-[110px] sm:max-w-none truncate text-xs sm:text-[13px] text-[var(--modern-text)] font-semibold"
                          : status === "completed"
                          ? "hidden md:inline text-xs sm:text-[13px] text-[var(--modern-text)] font-medium"
                          : "hidden md:inline text-xs sm:text-[13px] text-[var(--modern-muted,#64748b)] font-medium"
                      }`}
                    >
                      {translateLabel(step.labelKey, step.defaultLabel)}
                    </span>
                  </div>

                  {!isLastStep && (
                    <span
                      aria-hidden='true'
                      className={`h-[2px] min-w-[8px] sm:min-w-[14px] flex-1 max-w-[32px] sm:max-w-[64px] rounded-full transition-colors shrink-0 ${
                        status === "completed"
                          ? "bg-[var(--modern-success,#10b981)]"
                          : "bg-[var(--modern-border)]"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          <div className='relative z-10 flex shrink-0 items-center justify-end text-xs font-mono font-semibold text-[var(--modern-muted)]'>
            <span className='rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] px-2 sm:px-3 py-1 text-[11px] sm:text-xs text-[var(--modern-muted)]'>
              <span className='hidden sm:inline'>
                {translateLabel("uploadDocFlow.step", "STEP")}{" "}
              </span>
              {activeStep} / {steps.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Nav
      className={`fixed left-0 top-0 z-[1035] flex h-full w-[15%] flex-nowrap flex-col items-stretch gap-0 border-r border-border bg-background rtl:left-auto rtl:right-0 rtl:border-r-0 rtl:border-l ${className}`}
      data-testid='document-stepper'
    >
      <Nav.Item className='flex w-full justify-start border-b border-border p-[11px]'>
        <Nav.Link
          as={Link}
          to='/home'
          className='w-full justify-start rounded-none p-0 hover:bg-transparent'
          aria-label='IAMSigner Home'
        >
          {theme === "dark" ? (
            <Icons.IamSignerLightMode className='h-[30px] w-[100px]' />
          ) : (
            <Icons.StepperLogo className='h-[30px] w-[100px]' />
          )}
        </Nav.Link>
      </Nav.Item>

      {steps.map((step, index) => {
        const status = getStepStatus(step.stepNumber, activeStep, completedSteps);
        const isLastStep = index === steps.length - 1;

        return (
          <React.Fragment key={step.stepNumber || index}>
            <Nav.Item>
              <Nav.Link
                className='my-3 flex flex-wrap items-center gap-2.5'
                data-step-number={step.stepNumber}
                data-step-status={status}
              >
                <span className={getMarkerClass(status)}>
                  {status === "completed" ? (
                    <Icons.StepperCompleted />
                  ) : (
                    step.stepNumber
                  )}
                </span>
                <em className='text-sm font-medium not-italic text-foreground'>
                  {translateLabel(step.labelKey, step.defaultLabel)}
                </em>
              </Nav.Link>
            </Nav.Item>

            {!isLastStep && (
              <div className='flex h-5 w-[30%] items-center justify-center'>
                <div className={getLineClass(status)}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </Nav>
  );
};

export default DocumentStepper;
