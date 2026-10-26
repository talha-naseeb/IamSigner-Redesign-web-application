import React from "react";
import DocumentStepper from "@/Components/DocumentPreparation/Stepper/DocumentStepper";
import { STEPPER_FLOWS } from "@/Components/DocumentPreparation/Stepper/stepperConfig";

/**
 * SelfSignStepper - SelfSignature wrapper around unified DocumentStepper (ENG-01)
 */
const SelfSignStepper = ({ activeStep, t, completedSteps }) => {
  return (
    <DocumentStepper
      activeStep={activeStep}
      t={t}
      completedSteps={completedSteps}
      flowType={STEPPER_FLOWS.SELF_SIGN}
    />
  );
};

export default SelfSignStepper;
