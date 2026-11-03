import React from "react";
import { AppModal } from "@/Components/Common/AppModal";
import { Trash2, Loader2 } from "lucide-react";

const DeleteConfirmationModal = ({
  show,
  onHide,
  title = "Delete Confirmation",
  subtitle,
  warningText,
  itemTitle,
  itemName,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  headerIconSrc,
  itemIconSrc,
  headerIcon,
  itemIcon,
  className = "",
  isLoading = false,
}) => {
  return (
    <AppModal
      open={show}
      onClose={onHide}
      size="sm"
      className={className}
      showClose={!isLoading}
      footer={
        <div className="flex w-full justify-end items-center gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors disabled:opacity-50"
            onClick={onHide}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 transition-colors"
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
        <div className="inline-flex items-center justify-center p-3 rounded-full border bg-red-500/10 text-red-500 border-red-500/20">
          {headerIcon ? (
            headerIcon
          ) : typeof headerIconSrc === "string" ? (
            <img src={headerIconSrc} alt="Header icon" className="h-6 w-6 object-contain" />
          ) : headerIconSrc ? (
            React.createElement(headerIconSrc, { size: 24 })
          ) : (
            <Trash2 className="h-6 w-6" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="m-0 text-base font-semibold text-[var(--modern-text,#0f172a)]">{title}</h3>
          {(itemTitle || itemName) && (
            <p className="m-0 text-sm font-medium text-[var(--modern-text,#0f172a)]">
              {itemTitle} {itemName ? ` - ${itemName}` : ""}
            </p>
          )}
          {warningText && <p className="m-0 text-sm text-[var(--modern-muted,#64748b)]">{warningText}</p>}
          {subtitle && <p className="m-0 text-xs text-[var(--modern-muted,#64748b)]">{subtitle}</p>}
        </div>
      </div>
    </AppModal>
  );
};

export default DeleteConfirmationModal;
