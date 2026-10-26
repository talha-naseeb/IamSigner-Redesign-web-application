import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "./SharedFilterDrawer";

function DocumentSearchFilters({
  startDate,
  endDate,
  referenceNo,
  docName,
  requestNo,
  setStartDate,
  setEndDate,
  setReferenceNo,
  setRequestNo,
  setDocName,
  handleSearch,
  clearSearch,
  hideRequestNo = false,
}) {
  const { t } = useTranslation();

  const fields = [
    {
      name: "docName",
      label: t("searchFilter.docName"),
      value: docName,
      onChange: (val) => setDocName(val),
    },
    !hideRequestNo && {
      name: "requestNo",
      label: t("searchFilter.requestNum"),
      value: requestNo,
      onChange: (val) => setRequestNo && setRequestNo(val),
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
  ].filter(Boolean);

  return (
    <SharedFilterDrawer
      fields={fields}
      onApply={handleSearch}
      onReset={clearSearch}
    />
  );
}

export default DocumentSearchFilters;
