import React, { useId } from "react";
import { useTranslation } from "react-i18next";

/**
 * Unified Document Description Component
 * Used across Upload Flow, Bulk Send, Self-Sign, and Templates.
 */
export const Description = ({ fetchedData, setFetchedData, setDescription }) => {
  const { t } = useTranslation();
  const descriptionId = useId();

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={descriptionId} className="text-xs font-semibold text-[var(--modern-text,#0f172a)]">
          {t("uploadDocFlow.descriptionupload", "Description")}
        </label>
        <span className="rounded-full bg-[var(--modern-raised,#f8fafc)] px-2 py-0.5 text-[10px] font-medium text-[var(--modern-muted,#64748b)] border border-[var(--modern-border,#e2e8f0)]">
          {t("common.optional", "Optional")}
        </span>
      </div>
      <textarea
        id={descriptionId}
        rows={2}
        placeholder={t("uploadDocFlow.descriptionPlaceholder", "Optional document description or notes...")}
        value={fetchedData?.description || ""}
        className="w-full min-w-0 resize-y rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-3 py-2 text-xs text-[var(--modern-text,#0f172a)] outline-none transition-colors placeholder:text-[var(--modern-muted,#64748b)] hover:border-[var(--modern-border-strong,#cbd5e1)] focus:border-[var(--modern-primary,#4d8dff)]"
        onChange={(e) => {
          if (setFetchedData && fetchedData) {
            setFetchedData({
              ...fetchedData,
              description: e.target.value,
            });
          }
          if (setDescription) {
            setDescription(e.target.value);
          }
        }}
      />
    </div>
  );
};

export default Description;
