// Step 1: Document Source & Configuration
export { default as Description } from "./Step1_Source/Description";
export { default as ReferenceNumber } from "./Step1_Source/ReferenceNumber";
export { default as SignatoryOrientation } from "./Step1_Source/SignatoryOrientation";
export { default as DocumentSourceCards } from "./Step1_Source/DocumentSourceCards";
export { default as UploadedDocumentsTable } from "./Step1_Source/UploadedDocumentsTable";

// Step 2: Canvas & Drag-and-Drop Controls
export { DraggableButton, default as DraggableButtons } from "./Step2_Canvas/DraggableButtons";
export { default as ResizableButtons } from "./Step2_Canvas/ResizableButtons";
export { default as ControlsFotmatting } from "./Step2_Canvas/ControlsFotmatting";
export { default as ImageWithControls } from "./Step2_Canvas/ImageWithControls";
export { default as SearchControls } from "./Step2_Canvas/SearchControls";
export { default as PageNavigations } from "./Step2_Canvas/PageNavigations";
export { default as CanvasStepBar } from "./Step2_Canvas/CanvasStepBar";

// Step 3: Recipients & Workflow
export { default as CCEmail } from "./Step3_Recipients/CCEmail";
export { default as DispatchSummaryBar } from "./Step3_Recipients/DispatchSummaryBar";

// Stepper Wizard Navigation Engine (ENG-01)
export { default as DocumentStepper } from "./Stepper/DocumentStepper";
export {
  STEPPER_FLOWS,
  FLOW_STEP_DEFINITIONS,
  getStepsForFlow,
  getStepStatus,
  getMarkerClass,
  getLineClass,
} from "./Stepper/stepperConfig";
