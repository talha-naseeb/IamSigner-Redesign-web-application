import React from "react";
import { AppModal } from "@/Components/Common/AppModal";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  variant,
}) => {
  // Auto-detect variant: "primary" for send/save/confirm flows, "danger" for deletions
  const isExplicitPrimary = variant === "primary";
  const isDetectedPrimary =
    !variant &&
    (title?.toLowerCase().includes("send") ||
      itemTitle?.toLowerCase().includes("send") ||
      confirmText?.toLowerCase().includes("send"));
  const isPrimary = isExplicitPrimary || isDetectedPrimary;

  const isSuccess = variant === "success";
  const isDanger = variant === "danger" || (!isPrimary && !isSuccess);

  const iconWrapperClass = isPrimary
    ? "bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_12%,transparent)] text-[var(--modern-primary,#4d8dff)] border-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_25%,transparent)]"
    : isSuccess
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    : "bg-rose-500/10 text-rose-500 border-rose-500/20";

  const confirmBtnClass = isPrimary
    ? "bg-[var(--modern-primary,#4d8dff)] text-white hover:opacity-90 active:scale-95"
    : isSuccess
    ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
    : "bg-rose-600 text-white hover:bg-rose-700 active:scale-95";

  // Prevent duplicate text if subtitle and warningText are identical or convey the same confirmation prompt
  const cleanSubtitle = subtitle?.trim();
  const cleanWarning = warningText?.trim();
  const hasDistinctSubtitle =
    cleanSubtitle &&
    cleanSubtitle.toLowerCase() !== cleanWarning?.toLowerCase() &&
    !(
      cleanSubtitle.toLowerCase().includes("sure you want to proceed") &&
      cleanWarning?.toLowerCase().includes("sure you want to proceed")
    );

  return (
    <AppModal
      open={show}
      onClose={onHide}
      size="sm"
      className={cn("!rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]", className)}
      showClose={!isLoading}
      footer={
        <div className="flex w-full justify-between items-center gap-3 pt-2">
          <button
            type="button"
            className="px-5 py-2 text-xs font-semibold rounded-xl border border-[var(--modern-border)] text-[var(--modern-text)] bg-[var(--modern-card)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all disabled:opacity-50 cursor-pointer appearance-none outline-none"
            onClick={onHide}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold rounded-xl border-0 shadow-none outline-none disabled:opacity-40 transition-all cursor-pointer appearance-none",
              confirmBtnClass
            )}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-2 gap-3">
        <div className={cn("inline-flex items-center justify-center h-14 w-14 rounded-2xl border", iconWrapperClass)}>
          {headerIcon ? (
            headerIcon
          ) : typeof headerIconSrc === "string" ? (
            <img src={headerIconSrc} alt="Header icon" className="h-6 w-6 object-contain" />
          ) : headerIconSrc ? (
            React.createElement(headerIconSrc, { size: 24 })
          ) : isDanger ? (
            <Trash2 className="h-6 w-6" />
          ) : (
            <AlertCircle className="h-6 w-6" />
          )}
        </div>
        <div className="w-full space-y-2">
          <h3 className="m-0 text-base font-bold text-[var(--modern-text,#0f172a)]">{title}</h3>

          {(itemTitle || itemName) && (
            <div className="rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] px-4 py-2.5 text-center">
              {itemTitle && (
                <div className="text-xs font-bold text-[var(--modern-text)]">{itemTitle}</div>
              )}
              {itemName && (
                <div className="text-xs text-[var(--modern-muted)] mt-0.5">{itemName}</div>
              )}
            </div>
          )}

          {warningText && (
            <p className="m-0 text-xs font-medium text-[var(--modern-muted,#64748b)]">{warningText}</p>
          )}
          {hasDistinctSubtitle && (
            <p className="m-0 text-xs text-[var(--modern-muted,#64748b)] opacity-80">{subtitle}</p>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default DeleteConfirmationModal;
