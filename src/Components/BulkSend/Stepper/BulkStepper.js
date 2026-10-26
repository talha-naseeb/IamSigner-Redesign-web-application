import React from "react";
import DocumentStepper from "@/Components/DocumentPreparation/Stepper/DocumentStepper";
import { STEPPER_FLOWS } from "@/Components/DocumentPreparation/Stepper/stepperConfig";

/**
 * BulkStepper - BulkSend wrapper around unified DocumentStepper (ENG-01)
 */
const BulkStepper = ({ activeStep, completedSteps, t }) => {
  return (
    <DocumentStepper
      activeStep={activeStep}
      completedSteps={completedSteps}
      t={t}
      flowType={STEPPER_FLOWS.BULK}
    />
  );
};

export default BulkStepper;
