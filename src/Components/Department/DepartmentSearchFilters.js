import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "@/Components/CommonModals/SearchFilters/SharedFilterDrawer";

const DepartmentSearchFilters = ({
  title,
  setTitle,
  description,
  setDescription,
  isActive,
  setIsActive,
  handleSearch,
  clearSearch,
}) => {
  const { t } = useTranslation();

  const fields = [
    {
      name: "title",
      label: t("departmentList.title"),
      value: title,
      onChange: (val) => setTitle(val),
    },
    {
      name: "description",
      label: t("departmentList.description"),
      value: description,
      onChange: (val) => setDescription(val),
    },
    {
      type: "radio",
      name: "isActive",
      label: t("tablesLabel.status"),
      value: isActive,
      onChange: (val) => setIsActive(String(val)),
      options: [
        { id: "active", value: "true", label: t("emailTemplates.active") },
        { id: "inactive", value: "false", label: t("emailTemplates.inactive") },
      ],
    },
  ];

  return (
    <SharedFilterDrawer
      className="department-filter-navbar"
      triggerClassName="department-filter-trigger"
      panelClassName="department-filter-panel"
      fields={fields}
      onApply={handleSearch}
      onReset={clearSearch}
    />
  );
};

export default DepartmentSearchFilters;
