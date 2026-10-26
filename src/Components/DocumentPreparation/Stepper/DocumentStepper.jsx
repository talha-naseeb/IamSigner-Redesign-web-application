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
