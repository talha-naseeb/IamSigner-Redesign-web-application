import React from "react";
import { useTranslation } from "react-i18next";
import SharedFilterDrawer from "@/Components/CommonModals/SearchFilters/SharedFilterDrawer";

function UserSearchFilter({
  fullName = "",
  emailID = "",
  role = "",
  isActive,
  department = "",
  setFullName,
  setEmailID,
  setRole,
  setIsActive,
  setDepartment,
  handleSearch,
  clearSearch,
  userRoles = [],
  departments = [],
  className,
}) {
  const { t } = useTranslation();

  const handleReset = () => {
    setFullName("");
    setEmailID("");
    setRole("");
    setDepartment("");
    setIsActive(undefined);
    if (typeof clearSearch === "function") clearSearch();
  };

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
      label: t("createTeam.email"),
      placeholder: t("logScreens.email"),
      value: emailID,
      onChange: (val) => setEmailID(val),
    },
    {
      type: "select",
      name: "role",
      label: t("createTeam.role"),
      placeholder: t("createTeam.choose"),
      disabledPlaceholder: true,
      value: role,
      onChange: (val) => setRole(val),
      options: (userRoles || []).map((r) => ({
        key: r.id,
        value: r.roleNameEn,
        label: r.roleNameEn,
      })),
    },
    {
      type: "select",
      name: "department",
      label: t("createTeam.department"),
      placeholder: t("createTeam.choose"),
      disabledPlaceholder: true,
      value: department,
      onChange: (val) => setDepartment(val),
      options: (departments || []).map((d) => ({
        key: d.departmentID,
        value: d.title,
        label: d.title,
      })),
    },
    {
      type: "radio",
      name: "isActive",
      label: t("tablesLabel.status"),
      value: isActive,
      onChange: (val) => setIsActive(val === "true" || val === true),
      options: [
        { id: "active", value: true, label: t("emailTemplates.active") },
        { id: "inactive", value: false, label: t("emailTemplates.inactive") },
      ],
    },
  ];

  return (
    <SharedFilterDrawer
      className={className}
      triggerClassName="user-report-filter-trigger"
      panelClassName={className ? `${className}-panel` : undefined}
      fields={fields}
      onApply={handleSearch}
      onReset={handleReset}
    />
  );
}

export default UserSearchFilter;
