/**
 * Step definitions and helper utilities for the Centralized Stepper Wizard Engine (ENG-01)
 */

export const STEPPER_FLOWS = {
  UPLOAD: "upload",
  BULK: "bulk",
  SELF_SIGN: "selfSign",
  TEMPLATES: "templates",
};

export const FLOW_STEP_DEFINITIONS = {
  [STEPPER_FLOWS.UPLOAD]: [
    { stepNumber: 1, labelKey: "Stepper.uploadDocument", defaultLabel: "Upload Document" },
    { stepNumber: 2, labelKey: "Stepper.AddSigners", defaultLabel: "Add Signers" },
    { stepNumber: 3, labelKey: "Stepper.placeSignatories", defaultLabel: "Place Signatories" },
    { stepNumber: 4, labelKey: "Stepper.sendAndSign", defaultLabel: "Send and Sign" },
  ],
  [STEPPER_FLOWS.BULK]: [
    { stepNumber: 1, labelKey: "Stepper.uploadDocument", defaultLabel: "Upload Document" },
    { stepNumber: 2, labelKey: "Stepper.AddSigners", defaultLabel: "Add Signers" },
    { stepNumber: 3, labelKey: "Stepper.placeSignatories", defaultLabel: "Place Signatories" },
    { stepNumber: 4, labelKey: "Stepper.sendAndSign", defaultLabel: "Send and Sign" },
  ],
  [STEPPER_FLOWS.SELF_SIGN]: [
    { stepNumber: 1, labelKey: "Stepper.uploadDocument", defaultLabel: "Upload Document" },
    { stepNumber: 2, labelKey: "Stepper.placeSignatories", defaultLabel: "Place Signatories" },
    { stepNumber: 3, labelKey: "Stepper.signandSave", defaultLabel: "Sign and Save" },
  ],
  [STEPPER_FLOWS.TEMPLATES]: [
    { stepNumber: 1, labelKey: "Stepper.uploadDocument", defaultLabel: "Upload Document" },
    { stepNumber: 2, labelKey: "Stepper.AddSigners", defaultLabel: "Add Signers" },
    { stepNumber: 3, labelKey: "Stepper.placeSignatories", defaultLabel: "Place Signatories" },
  ],
};

/**
 * Returns the array of steps for a given flow or fallback
 * @param {string} flowType - One of STEPPER_FLOWS ('upload', 'bulk', 'selfSign', 'templates')
 * @param {Array} customSteps - Optional custom steps override
 * @returns {Array} Array of step definition objects
 */
export function getStepsForFlow(flowType = STEPPER_FLOWS.UPLOAD, customSteps = null) {
  if (Array.isArray(customSteps) && customSteps.length > 0) {
    return customSteps;
  }
  return FLOW_STEP_DEFINITIONS[flowType] || FLOW_STEP_DEFINITIONS[STEPPER_FLOWS.UPLOAD];
}

/**
 * Checks if a step is marked as completed
 * @param {number} stepNumber
 * @param {Array<number>} completedSteps
 * @returns {boolean}
 */
export function isStepCompleted(stepNumber, completedSteps = []) {
  if (!Array.isArray(completedSteps)) return false;
  return completedSteps.includes(stepNumber);
}

/**
 * Checks if a step is currently active
 * @param {number} stepNumber
 * @param {number} activeStep
 * @returns {boolean}
 */
export function isStepActive(stepNumber, activeStep) {
  return activeStep === stepNumber;
}

/**
 * Determines step status: 'completed' | 'active' | 'pending'
 * @param {number} stepNumber
 * @param {number} activeStep
 * @param {Array<number>} completedSteps
 * @returns {'completed' | 'active' | 'pending'}
 */
export function getStepStatus(stepNumber, activeStep, completedSteps = []) {
  if (isStepCompleted(stepNumber, completedSteps)) {
    return "completed";
  }
  if (isStepActive(stepNumber, activeStep)) {
    return "active";
  }
  return "pending";
}

/**
 * Computes marker CSS class for a step based on its status
 * @param {string} status - 'completed' | 'active' | 'pending'
 * @returns {string} Tailwind CSS class string
 */
export function getMarkerClass(status) {
  const base = "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full px-0 py-1 text-sm font-normal";
  if (status === "completed") {
    return `${base} bg-[var(--modern-success)] text-white`;
  }
  if (status === "active") {
    return `${base} bg-[var(--modern-primary)] text-white`;
  }
  return `${base} bg-[var(--modern-raised)] text-foreground`;
}

/**
 * Computes connecting line CSS class between steps
 * @param {string} status - 'completed' | 'active' | 'pending'
 * @returns {string} Tailwind CSS class string
 */
export function getLineClass(status) {
  const base = "relative h-5 w-[3px] rounded-[5px] bg-[var(--modern-raised)]";
  if (status === "completed") {
    return `${base} bg-[var(--modern-success)]`;
  }
  if (status === "active") {
    return `${base} before:absolute before:left-0 before:top-0 before:h-1/2 before:w-full before:rounded-[5px] before:bg-[var(--modern-border-strong)] before:content-['']`;
  }
  return base;
}
