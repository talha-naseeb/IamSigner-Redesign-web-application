import React from "react";
import DocumentStepper from "@/Components/DocumentPreparation/Stepper/DocumentStepper";
import { STEPPER_FLOWS } from "@/Components/DocumentPreparation/Stepper/stepperConfig";

/**
 * Stepper - Upload Flow wrapper around unified DocumentStepper (ENG-01)
 */
const Stepper = ({ activeStep, t, completedSteps }) => {
  return (
    <DocumentStepper
      activeStep={activeStep}
      t={t}
      completedSteps={completedSteps}
      flowType={STEPPER_FLOWS.UPLOAD}
    />
  );
};

export default Stepper;
