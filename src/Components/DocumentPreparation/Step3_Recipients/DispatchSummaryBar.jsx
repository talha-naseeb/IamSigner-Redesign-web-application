import React from "react";
import { Button } from "@/Components/UI/shadcnCompat";

/**
 * DispatchSummaryBar - Standard bottom review & dispatch action bar for Step 3 (ENG-01)
 *
 * Provides back action, confirm / dispatch action, and compact spinning loading indicators.
 */
const DispatchSummaryBar = ({
  onBack,
  onConfirm,
  isLoading = false,
  isBackDisabled = false,
  isConfirmDisabled = false,
  backLabel,
  confirmLabel,
  t,
}) => {
  const translate = (key, fallback) => (typeof t === "function" ? t(key) || fallback : fallback);

  return (
    <div
      className='fixed bottom-0 left-0 z-[1040] flex w-full items-center justify-between border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-5 py-2.5'
      data-testid='dispatch-summary-bar'
    >
      <Button
        variant='outline'
        className='min-h-10 px-5 font-semibold'
        id='hide_part_one'
        onClick={onBack}
        disabled={isLoading || isBackDisabled}
      >
        {backLabel || translate("uploadDocFlow.back", "Back")}
      </Button>

      <Button
        variant='primary'
        className='min-h-10 px-5 font-semibold'
        id='hide_part_one'
        onClick={onConfirm}
        disabled={isLoading || isConfirmDisabled}
      >
        {isLoading ? (
          <span className='flex items-center gap-2'>
            <span
              aria-hidden='true'
              className='inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin'
            />
            {confirmLabel || translate("uploadDocFlow.sendAndSign", "Send and Sign")}
          </span>
        ) : (
          confirmLabel || translate("uploadDocFlow.sendAndSign", "Send and Sign")
        )}
      </Button>
    </div>
  );
};

export default DispatchSummaryBar;
