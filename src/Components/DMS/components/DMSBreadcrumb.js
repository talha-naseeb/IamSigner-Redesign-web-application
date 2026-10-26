import React from "react";
import { NavigateNextIcon as NavigateNextIcon } from "@/Components/UI/iconCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import { ALL_DOCUMENTS_ICON } from "../constants/dmsConfig";

const DMSBreadcrumb = ({ breadcrumb, onGoHome, onSelectFolder }) => {
  const { t } = useTranslation();

  return (
    <div className="dms-breadcrumb">
      <span className="dms-breadcrumb-home" onClick={onGoHome}>
        <ALL_DOCUMENTS_ICON size={14} /> {t("DMS.allDocuments")}
      </span>
      {breadcrumb.map((item, idx) => (
        <React.Fragment key={item.treeKey ?? item.id}>
          <NavigateNextIcon sx={{ fontSize: 14, color: "var(--text-secondary)" }} />
          <span
            className={`dms-breadcrumb-item${idx === breadcrumb.length - 1 ? " active" : ""}`}
            onClick={() => idx < breadcrumb.length - 1 && onSelectFolder(item)}
          >
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default DMSBreadcrumb;
