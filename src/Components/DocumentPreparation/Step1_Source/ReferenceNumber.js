import React, { useId } from "react";
import { useTranslation } from "react-i18next";

/**
 * Unified ReferenceNumber Component
 * Used across Upload Flow, Bulk Send, Self-Sign, and Templates.
 */
export const ReferenceNumber = ({ fetchedData, setFetchedData, setReferenceNumber }) => {
  const { t } = useTranslation();
  const inputId = useId();

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={inputId} className="text-xs font-semibold text-[var(--modern-text,#0f172a)]">
          {t("uploadDocFlow.referenceNumber", "Reference Number")}
        </label>
        <span className="rounded-full bg-[var(--modern-raised,#f8fafc)] px-2 py-0.5 text-[10px] font-medium text-[var(--modern-muted,#64748b)] border border-[var(--modern-border,#e2e8f0)]">
          {t("common.optional", "Optional")}
        </span>
      </div>
      <input
        id={inputId}
        type='text'
        placeholder={t("uploadDocFlow.referenceNumberPlaceholder", "e.g. REF-2026-001")}
        className="h-9 w-full min-w-0 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-3 text-xs text-[var(--modern-text,#0f172a)] outline-none transition-colors placeholder:text-[var(--modern-muted,#64748b)] hover:border-[var(--modern-border-strong,#cbd5e1)] focus:border-[var(--modern-primary,#4d8dff)]"
        value={fetchedData?.referenceNumber || ""}
        onChange={(e) => {
          if (setFetchedData && fetchedData) {
            setFetchedData({
              ...fetchedData,
              referenceNumber: e.target.value,
            });
          }
          if (setReferenceNumber) {
            setReferenceNumber(e.target.value);
          }
        }}
      />
    </div>
  );
};

export default ReferenceNumber;
