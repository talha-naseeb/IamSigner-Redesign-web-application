import React from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "@/Components/Common/AppModal";
import { CheckCircle2 } from "lucide-react";

const ConfirmationModal = ({ show, onHide, onClick, className = "" }) => {
  const { t } = useTranslation();

  return (
    <AppModal
      open={show}
      onClose={onHide}
      size="sm"
      className={className}
      footer={
        <div className="flex w-full justify-between items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onHide}
            className="px-5 py-2 text-xs font-semibold rounded-full border border-[var(--modern-border)] text-[var(--modern-text)] bg-[var(--modern-card)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer appearance-none outline-none"
          >
            {t("signaturePage.no")}
          </button>
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold rounded-full border-0 shadow-none outline-none text-white bg-[var(--modern-primary,#4d8dff)] hover:opacity-90 active:scale-95 transition-all cursor-pointer appearance-none"
          >
            {t("signaturePage.yes")}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-2 gap-3">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl border bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_12%,transparent)] text-[var(--modern-primary,#4d8dff)] border-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_25%,transparent)]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="m-0 text-base font-bold text-[var(--modern-text,#0f172a)]">
            {t("signaturePage.confirmCompleted")}
          </h3>
          <p className="m-0 text-xs font-medium text-[var(--modern-muted,#64748b)]">
            {t("signaturePage.proceed")}
          </p>
        </div>
      </div>
    </AppModal>
  );
};

export default ConfirmationModal;
