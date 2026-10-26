import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "@/Components/CommonModals/SearchFilters/SharedFilterDrawer";

function DocStatusFilter({
  fullName,
  emailID,
  setFullName,
  setEmailID,
  handleSearch,
  clearSearch,
}) {
  const { t } = useTranslation();

  const fields = [
    {
      name: "fullName",
      label: t("createTeam.fullName"),
      placeholder: t("logScreens.name"),
      value: fullName,
      onChange: (val) => setFullName(val),
    },
    {
      name: "emailID",
      type: "email",
      label: t("createTeam.email"),
      placeholder: t("logScreens.email"),
      value: emailID,
      onChange: (val) => setEmailID(val),
    },
  ];

  return (
    <SharedFilterDrawer
      className="doc-report-filter"
      triggerClassName="doc-report-filter-trigger"
      panelClassName="doc-report-filter-panel"
      fields={fields}
      onApply={handleSearch}
      onReset={clearSearch}
    />
  );
}

export default DocStatusFilter;
