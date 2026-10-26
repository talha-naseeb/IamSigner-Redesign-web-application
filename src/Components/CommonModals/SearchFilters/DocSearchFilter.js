import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "./SharedFilterDrawer";

function DocumentSearchFilters({
  startDate,
  endDate,
  referenceNo,
  docNumber,
  docName,
  setStartDate,
  setEndDate,
  setReferenceNo,
  setDocNumber,
  setDocName,
  handleSearch,
  clearSearch,
}) {
  const { t } = useTranslation();

  const fields = [
    {
      name: "docName",
      label: t("searchFilter.docName"),
      value: docName,
      onChange: (val) => setDocName(val),
    },
    {
      name: "docNumber",
      label: t("searchFilter.docNum"),
      value: docNumber,
      onChange: (val) => setDocNumber(val),
    },
    {
      name: "referenceNo",
      label: t("searchFilter.refNum"),
      value: referenceNo,
      onChange: (val) => setReferenceNo(val),
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
      fields={fields}
      onApply={handleSearch}
      onReset={clearSearch}
    />
  );
}

export default DocumentSearchFilters;
