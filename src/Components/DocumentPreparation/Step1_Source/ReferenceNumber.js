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
    <div className="mb-3 space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-[var(--modern-text,#0f172a)]">
        {t("uploadDocFlow.referenceNumberOptional")}
      </label>
      <input
        id={inputId}
        type='text'
        placeholder=''
        className="h-10 w-full min-w-0 rounded-md border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] px-3 text-sm text-[var(--modern-text,#0f172a)] outline-none transition-colors placeholder:text-[var(--modern-muted,#64748b)] hover:border-[var(--modern-border-strong,#cbd5e1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]"
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
      <p className="text-sm text-[var(--modern-muted,#64748b)]">{t("uploadDocFlow.uploadDescription")}</p>
    </div>
  );
};

export default ReferenceNumber;
