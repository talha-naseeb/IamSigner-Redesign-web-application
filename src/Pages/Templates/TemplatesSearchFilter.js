import React, { useState } from "react";
import { AppDrawer } from "@/Components/Common/AppDrawer";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";
import "./TemplateFilter.css";

function TemplatesSearchFilters({
  templateName,
  setTemplateName,
  handleSearch,
  clearSearch,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  docStatus,
  setDocStatus,
  Scope,
  setScope,
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0].format("YYYY-MM-DD"));
      setEndDate(dates[1].format("YYYY-MM-DD"));
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  const dateValue = startDate && endDate ? [new DateObject(startDate), new DateObject(endDate)] : [];

  // Enable Apply when ANY filter has a value
  const canApply = Boolean(
    (templateName && templateName.trim() !== "") ||
      (startDate && startDate !== "") ||
      (endDate && endDate !== "") ||
      (Scope && Scope !== "") ||
      (docStatus && docStatus !== "")
  );

  const handleReset = () => {
    setTemplateName("");
    setStartDate("");
    setEndDate("");
    setScope("");
    setDocStatus("");
    if (typeof clearSearch === "function") clearSearch();
  };

  const onApply = () => {
    handleSearch();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="filterOpenBtn btn p-0 border-0 bg-transparent"
        onClick={() => setIsOpen(true)}
        aria-label={t("templateUploadFlow.Filter")}
      >
        <Icons.Filter />
      </button>

      <AppDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("templateUploadFlow.Filter")}
        footer={
          <div className="flex items-center justify-between w-full pt-4 border-t border-[var(--modern-border,#e2e8f0)]">
            <button type="button" className="resetBtn btn" onClick={handleReset}>
              {t("templateUploadFlow.Reset")}
            </button>
            <button
              type="button"
              className="applyBtn btn"
              onClick={onApply}
              disabled={!canApply}
            >
              {t("templateUploadFlow.Apply")}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--modern-text,#0f172a)]">
              {t("templateUploadFlow.TemplateName")}
            </label>
            <input
              name="templateName"
              type="text"
              placeholder={t("editTemplateNameModal.enterTemplateName")}
              className={`input-field form-control ${templateName ? "active" : ""}`}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--modern-text,#0f172a)]">
              {t("tablesLabel.scope")}
            </label>
            <div className="flex gap-4">
              <div className="radio-container flex items-center gap-2">
                <input
                  id="individual"
                  name="Scope"
                  type="radio"
                  className="input-radio"
                  checked={Scope === "I"}
                  value="I"
                  onChange={(e) => setScope(e.target.value)}
                />
                <label htmlFor="individual" className="radio-label text-sm m-0">
                  {t("templateUploadFlow.Individual")}
                </label>
              </div>
              <div className="radio-container flex items-center gap-2">
                <input
                  id="company"
                  name="Scope"
                  type="radio"
                  className="input-radio"
                  checked={Scope === "B"}
                  value="B"
                  onChange={(e) => setScope(e.target.value)}
                />
                <label htmlFor="company" className="radio-label text-sm m-0">
                  {t("templateUploadFlow.Company")}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--modern-text,#0f172a)]">
              {t("searchFilter.FilterRange")}
            </label>
            <DateRangePicker value={dateValue} onChange={handleDateChange} />
          </div>
        </div>
      </AppDrawer>
    </>
  );
}

export default TemplatesSearchFilters;
