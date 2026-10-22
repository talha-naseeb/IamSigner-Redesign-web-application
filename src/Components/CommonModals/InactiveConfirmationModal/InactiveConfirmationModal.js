import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import dashboardService from "@/services/dashboardService";
import { AppConfirmModal } from "@/Components/Common/AppModal";
import { Ban } from "lucide-react";

const InactiveConfirmationModal = ({ show, onHide, selectedRow, onSuccess }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleInactivateDocument = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.changeDocStatusInActive({
        RegisterSignID: selectedRow?.registerSignID,
      });

      if (response.data?.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.inactivateSuccess"));
        if (onSuccess) onSuccess();
      } else {
        toast.error(t("dashboardCardStatuses.failedToInactivate"));
      }
    } catch (error) {
      toast.error(t("dashboardCardStatuses.internalErrorTryLater"));
      console.error("Error", error);
    } finally {
      setIsLoading(false);
      onHide();
    }
  };

  return (
    <AppConfirmModal
      open={show}
      onClose={onHide}
      onConfirm={handleInactivateDocument}
      title={t("dashboardCardStatuses.confirmInactivate")}
      message={t("dashboardCardStatuses.sureInActiveNotification")}
      confirmText={t("dashboardCardStatuses.confirm")}
      cancelText={t("dashboardCardStatuses.cancel")}
      variant="warning"
      isLoading={isLoading}
      icon={Ban}
    />
  );
};

export default InactiveConfirmationModal;
