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
    <div className="py-3">
      <label htmlFor={descriptionId} className="mb-2 block text-sm font-medium text-[var(--modern-text,#0f172a)]">
        {t("uploadDocFlow.descriptionupload")}
      </label>
      <textarea
        id={descriptionId}
        rows={5}
        placeholder={t("uploadDocFlow.descriptionPlaceholder")}
        value={fetchedData?.description || ""}
        className="w-full min-w-0 resize-y rounded-md border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] px-3 py-2 text-sm text-[var(--modern-text,#0f172a)] outline-none transition-colors placeholder:text-[var(--modern-muted,#64748b)] hover:border-[var(--modern-border-strong,#cbd5e1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]"
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
