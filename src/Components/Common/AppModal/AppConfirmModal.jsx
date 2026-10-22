import React from "react";
import { AppModal } from "./AppModal";
import { AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";

const variantStyles = {
  danger: {
    iconBg: "bg-red-500/10 text-red-500 border-red-500/20",
    confirmBtn: "btn btn-danger",
    Icon: AlertCircle,
  },
  warning: {
    iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    confirmBtn: "btn btn-warning",
    Icon: AlertTriangle,
  },
  primary: {
    iconBg: "bg-[var(--modern-primary,#6366f1)]/10 text-[var(--modern-primary,#6366f1)] border-[var(--modern-primary,#6366f1)]/20",
    confirmBtn: "btn btn-primary",
    Icon: Info,
  },
};

/**
 * AppConfirmModal: Standardized confirmation/delete modal with alert icon, loading state, and action buttons.
 */
export const AppConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon,
}) => {
  const currentVariant = variantStyles[variant] || variantStyles.danger;
  const VariantIcon = icon || currentVariant.Icon;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      size="sm"
      showClose={!isLoading}
      footer={
        <div className="flex w-full justify-end gap-2">
          <button
            type="button"
            className="btn btn-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${currentVariant.confirmBtn} px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-w-[90px] transition-colors`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-2 gap-3">
        <div className={`p-3 rounded-full border ${currentVariant.iconBg}`}>
          <VariantIcon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--modern-text,#0f172a)]">{title}</h3>
          <p className="text-sm text-[var(--modern-muted,#64748b)]">{message}</p>
        </div>
      </div>
    </AppModal>
  );
};

export default AppConfirmModal;
