import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "@/Components/CommonModals/SearchFilters/SharedFilterDrawer";

function RecentDocsFilter({
  startDate,
  endDate,
  docStatus,
  referenceNo,
  docName,
  setStartDate,
  setEndDate,
  setDocStatus,
  setReferenceNo,
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
      name: "referenceNo",
      label: t("searchFilter.refNum"),
      value: referenceNo,
      onChange: (val) => setReferenceNo(val),
    },
    {
      type: "select",
      name: "docStatus",
      label: t("searchFilter.status"),
      value: docStatus,
      onChange: (val) => setDocStatus(val),
      placeholder: t("createTeam.choose"),
      options: [
        { value: "draft", label: "Draft" },
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
        { value: "bulk", label: "Bulk" },
        { value: "recalled", label: "Recalled" },
        { value: "declined", label: "Declined" },
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
      panelClassName="home-filter-offcanvas"
      fields={fields}
      onApply={handleSearch}
      onReset={clearSearch}
    />
  );
}

export default RecentDocsFilter;
