import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "@/Components/CommonModals/SearchFilters/SharedFilterDrawer";

function FolderFilter({
  fromDate,
  toDate,
  folderName,
  docName,
  setFromDate,
  setToDate,
  setFolderName,
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
      name: "folderName",
      label: t("Folder.folderName"),
      value: folderName,
      onChange: (val) => setFolderName(val),
    },
    {
      type: "dateRange",
      name: "dateRange",
      label: t("searchFilter.FilterRange"),
      startDate: fromDate,
      endDate: toDate,
      onStartDateChange: setFromDate,
      onEndDateChange: setToDate,
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

export default FolderFilter;
