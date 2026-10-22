import React from "react";
import { AppModal } from "@/Components/Common/AppModal";
import { Trash2 } from "lucide-react";

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
        <div className="flex w-full justify-between items-center gap-2 pt-2">
          <button
            type="button"
            className="modalCancelButton btn btn-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={onHide}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="applyBtn btn btn-danger px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-w-[90px] transition-colors"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-2 gap-3">
        <div className="p-3 rounded-full border bg-red-500/10 text-red-500 border-red-500/20">
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
          <h3 className="text-base font-semibold text-[var(--modern-text,#0f172a)]">{title}</h3>
          {(itemTitle || itemName) && (
            <p className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
              {itemTitle} {itemName ? ` - ${itemName}` : ""}
            </p>
          )}
          {warningText && <p className="text-sm text-[var(--modern-muted,#64748b)]">{warningText}</p>}
          {subtitle && <p className="text-xs text-[var(--modern-muted,#64748b)]">{subtitle}</p>}
        </div>
      </div>
    </AppModal>
  );
};

export default DeleteConfirmationModal;
