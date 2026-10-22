import React, { useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { AppDrawer } from "@/Components/Common/AppDrawer";
import { Loader2 } from "lucide-react";

function UpdateIntegrationModal({
  show,
  onHide,
  isLoading,
  appName,
  expiryInSecond,
  handleAppNameChange,
  handleExpiryChange,
  handleUpdate,
  handleCancel,
  AuthData,
  setAppName,
  setExpiryInSecond,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (show && AuthData) {
      setAppName(AuthData.appName || "");
      setExpiryInSecond(AuthData.expiryinSecond || "");
    }
  }, [show, AuthData, setAppName, setExpiryInSecond]);

  return (
    <AppDrawer
      open={show}
      onClose={onHide}
      title={t("AuthIntegration.UpdateIntegration")}
      showClose={!isLoading}
      footer={
        <div className="flex items-center justify-between w-full pt-4 border-t border-[var(--modern-border,#e2e8f0)]">
          <Button variant="none" className="resetBtn btn" onClick={handleCancel} disabled={isLoading}>
            {t("AuthIntegration.Cancel")}
          </Button>
          <Button
            variant="none"
            className="applyBtn btn d-flex align-items-center gap-2"
            onClick={handleUpdate}
            disabled={!appName || !appName.trim() || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Updating..." : t("AuthIntegration.UpdateKey")}
          </Button>
        </div>
      }
    >
      <Form onSubmit={handleUpdate} className="space-y-4 py-2">
        <Form.Group className="mb-3" controlId="appName">
          <Form.Label className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
            {t("AuthIntegration.AppName")}
            <span className="text-danger mx-1">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder={t("AuthIntegration.EnterAppName")}
            value={appName}
            onChange={handleAppNameChange}
            disabled={isLoading}
            autoFocus
          />
        </Form.Group>

        <Form.Group controlId="expiryInSecond">
          <Form.Label className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
            {t("AuthIntegration.ExpiryTime")}
            <span className="text-danger mx-1">*</span>
          </Form.Label>
          <Form.Control
            type="number"
            placeholder={t("AuthIntegration.EnterExpiryTime")}
            value={expiryInSecond}
            onChange={handleExpiryChange}
            disabled={isLoading}
          />
        </Form.Group>
      </Form>
    </AppDrawer>
  );
}

export default UpdateIntegrationModal;
