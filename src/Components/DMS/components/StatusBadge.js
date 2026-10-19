import { getStatusConfig } from "../constants/dmsConfig";
import { useTranslation } from "react-i18next";

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cfg = getStatusConfig(status);
  const labelMap = {
    Completed: t("DMS.statusCompleted"),
    Pending: t("DMS.statusPending"),
    Draft: t("DMS.statusDraft"),
    Declined: t("DMS.statusDeclined"),
    InActive: t("DMS.statusInActive"),
    Share: t("DMS.statusShare"),
    Recalled: t("DMS.statusRecalled"),
  };

  return (
    <span
      className="dms-status-badge"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}
    >
      {labelMap[status] || status}
    </span>
  );
};

export default StatusBadge;
