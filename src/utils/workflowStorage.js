export const WORKFLOW_STORAGE_KEYS = [
  "registerSignID",
  "signatoriesID",
  "activeStep",
  "completedSteps",
  "templateID",
  "documentName",
  "savedSignature",
  "parsedData",
  "fileName",
  "base64CSV",
  "activeStepBulk",
  "completedStepsBulk",
];

export const clearWorkflowStorage = () => {
  try {
    WORKFLOW_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch (_) {
    // Fail silently if storage is unavailable or restricted
  }
};
