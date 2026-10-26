import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "@/Components/CommonModals/SearchFilters/SharedFilterDrawer";

function TemplatesSearchFilters({
  templateName,
  setTemplateName,
  handleSearch,
  clearSearch,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  Scope,
  setScope,
}) {
  const { t } = useTranslation();

  const handleReset = () => {
    setTemplateName("");
    setStartDate("");
    setEndDate("");
    if (setScope) setScope("");
    if (typeof clearSearch === "function") clearSearch();
  };

  const fields = [
    {
      name: "templateName",
      label: t("templateUploadFlow.TemplateName"),
      placeholder: t("editTemplateNameModal.enterTemplateName"),
      value: templateName,
      onChange: (val) => setTemplateName(val),
    },
    {
      type: "radio",
      name: "Scope",
      label: t("tablesLabel.scope"),
      value: Scope,
      onChange: (val) => setScope(val),
      options: [
        { id: "individual", value: "I", label: t("templateUploadFlow.Individual") },
        { id: "company", value: "B", label: t("templateUploadFlow.Company") },
      ],
    },
    {
      type: "dateRange",
      name: "dateRange",
      label: t("searchFilter.FilterRange"),
      startDate,
      endDate,
      onStartDateChange: setStartDate,
      onEndDateChange: setEndDate,
    },
  ];

  return (
    <SharedFilterDrawer
      title={t("templateUploadFlow.Filter")}
      resetLabel={t("templateUploadFlow.Reset")}
      applyLabel={t("templateUploadFlow.Apply")}
      fields={fields}
      onApply={handleSearch}
      onReset={handleReset}
    />
  );
}

export default TemplatesSearchFilters;
