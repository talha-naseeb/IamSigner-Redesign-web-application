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
        <div className="flex w-full justify-between items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onHide}
            className="modalCancelButton btn btn-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t("signaturePage.no")}
          </button>
          <button
            type="button"
            onClick={onClick}
            className="applyBtn btn btn-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t("signaturePage.yes")}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-2 gap-3">
        <div className="inline-flex items-center justify-center p-3 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="m-0 text-base font-semibold text-[var(--modern-text,#0f172a)]">
            {t("signaturePage.confirmCompleted")}
          </h3>
          <p className="m-0 text-sm text-[var(--modern-muted,#64748b)]">
            {t("signaturePage.proceed")}
          </p>
        </div>
      </div>
    </AppModal>
  );
};

export default ConfirmationModal;
