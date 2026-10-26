import React from "react";
import { Button } from "@/Components/UI/shadcnCompat";
import PageNavigations from "./PageNavigations";

/**
 * CanvasStepBar - Standard bottom navigation bar for Step 2 Canvas Placement (ENG-01)
 *
 * Provides page navigations, back action, and forward action with accessible loading spinners.
 */
const CanvasStepBar = ({
  onBack,
  onContinue,
  imagesData,
  selectedImage,
  setSelectedImage,
  onImageSelect,
  isLoading = false,
  backLabel,
  continueLabel,
  t,
}) => {
  const translate = (key, fallback) => (typeof t === "function" ? t(key) || fallback : fallback);

  return (
    <div
      className='fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 border-t border-[var(--modern-border)] bg-[var(--modern-card)]'
      data-testid='canvas-step-bar'
    >
      <Button
        variant='outline'
        id='hide_part_one'
        onClick={onBack}
        disabled={isLoading}
      >
        {backLabel || translate("uploadDocFlow.back", "Back")}
      </Button>

      {imagesData && (
        <PageNavigations
          imagesData={imagesData}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onImageSelect={onImageSelect}
        />
      )}

      <Button
        variant='primary'
        id='hide_part_one'
        onClick={onContinue}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className='flex items-center gap-2'>
            <span className='inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
            {continueLabel || translate("uploadDocFlow.Continue", "Continue")}
          </span>
        ) : (
          continueLabel || translate("uploadDocFlow.Continue", "Continue")
        )}
      </Button>
    </div>
  );
};

export default CanvasStepBar;
