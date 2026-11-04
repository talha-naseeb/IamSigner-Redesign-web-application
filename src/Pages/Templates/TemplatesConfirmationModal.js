import React from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "@/Components/Common/AppModal";
import { Button } from "@/Components/UI/shadcnCompat";
import { AlertCircle, Loader2 } from "lucide-react";

const TemplatesConfirmationModal = ({
  show,
  handleClose,
  handleConfirm,
  title,
  button,
  subtitle,
  warningText,
  headerIconSrc,
  headerIcon,
  confirmText,
  cancelText,
  className = "",
  isLoading = false,
  confirmVariant = "danger",
}) => {
  const { t } = useTranslation();

  const resolvedCancelText = cancelText || t("templateConfirmationModal.cancel");
  const resolvedConfirmText =
    confirmText || `${t("templateConfirmationModal.yes")}, ${button || t("templateConfirmationModal.delete")}`;
  const resolvedWarning = warningText || t("templateConfirmationModal.proceed");

  return (
    <AppModal
      open={show}
      onClose={handleClose}
      size="sm"
      className={className}
      showClose={!isLoading}
      footer={
        <div className="flex w-full justify-end items-center gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {resolvedCancelText}
          </Button>
          <Button
            variant={confirmVariant}
            className="inline-flex items-center justify-center gap-2 min-w-[90px]"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {resolvedConfirmText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-2 gap-3">
        <div className="inline-flex items-center justify-center p-3 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20">
          {headerIcon ? (
            headerIcon
          ) : typeof headerIconSrc === "string" ? (
            <img src={headerIconSrc} alt="icon" className="h-6 w-6 object-contain" />
          ) : headerIconSrc ? (
            React.createElement(headerIconSrc, { size: 24 })
          ) : (
            <AlertCircle className="h-6 w-6" />
          )}
        </div>
        <div className="space-y-1">
          {title && <h3 className="m-0 text-base font-semibold text-[var(--modern-text,#0f172a)]">{title}</h3>}
          {resolvedWarning && <p className="m-0 text-sm text-[var(--modern-muted,#64748b)]">{resolvedWarning}</p>}
          {subtitle && <p className="m-0 text-xs text-[var(--modern-muted,#64748b)]">{subtitle}</p>}
        </div>
      </div>
    </AppModal>
  );
};

export default TemplatesConfirmationModal;
