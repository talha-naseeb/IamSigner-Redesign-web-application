import React from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { AppDrawer } from "@/Components/Common/AppDrawer";

const CreateIntegration = ({
  show,
  onHide,
  appName,
  expiryInSecond,
  handleAppNameChange,
  handleExpiryChange,
  handleSubmit,
  handleCancel,
}) => {
  const { t } = useTranslation();

  return (
    <AppDrawer
      open={show}
      onClose={onHide}
      title={t("AuthIntegration.Api&key")}
      footer={
        <div className="flex items-center justify-between w-full pt-4 border-t border-[var(--modern-border,#e2e8f0)]">
          <Button variant="none" className="resetBtn btn" onClick={handleCancel}>
            {t("AuthIntegration.Cancel")}
          </Button>
          <Button
            variant="none"
            className="applyBtn btn"
            onClick={handleSubmit}
            disabled={!appName || !appName.trim()}
          >
            {t("AuthIntegration.Create")}
          </Button>
        </div>
      }
    >
      <Form onSubmit={handleSubmit} className="space-y-4 py-2">
        <Form.Group controlId="appName">
          <Form.Label className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
            {t("AuthIntegration.AppName")}
            <span className="text-danger mx-1">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder={t("AuthIntegration.EnterAppName")}
            value={appName}
            onChange={handleAppNameChange}
            autoFocus
          />
        </Form.Group>

        <Form.Group className="mt-3" controlId="expiryInSecond">
          <Form.Label className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
            {t("AuthIntegration.ExpiryTime")}
            <span className="text-danger mx-1">*</span>
          </Form.Label>
          <Form.Control
            type="number"
            placeholder={t("AuthIntegration.EnterExpiryTime")}
            value={expiryInSecond}
            onChange={handleExpiryChange}
          />
        </Form.Group>
      </Form>
    </AppDrawer>
  );
};

export default CreateIntegration;
