import React, { useState, useEffect } from "react";
import templateService from "@/services/templateService";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppDrawer } from "@/Components/Common/AppDrawer";
import { Loader2 } from "lucide-react";
import "./templates.css";

const EditTemplateNameOffcanvas = ({ originalTemplateName, show, onHide, templateID, onSave }) => {
  const { t } = useTranslation();
  const [editedTemplateName, setEditedTemplateName] = useState(originalTemplateName || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedTemplateName(originalTemplateName || "");
  }, [originalTemplateName]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await templateService.updateTemplate({
        TemplateID: templateID,
        TemplateName: editedTemplateName,
      });
      if (response.data?.statusCode === "1") {
        toast.success(t("editTemplateNameModal.updateTempNameSuccess"));
        if (onSave) onSave(editedTemplateName);
        onHide();
      } else {
        toast.error(t("editTemplateNameModal.errUpdateTempNameSuccess"));
      }
    } catch (error) {
      toast.error(t("editTemplateNameModal.errUpdateTempNameSuccess"));
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !editedTemplateName || editedTemplateName.trim() === "";

  return (
    <AppDrawer
      open={show}
      onClose={onHide}
      title={t("editTemplateNameModal.editTemplateName")}
      showClose={!isLoading}
      footer={
        <div className="flex items-center justify-between w-full pt-4 border-t border-[var(--modern-border,#e2e8f0)]">
          <Button variant="none" className="modalCancelButton" onClick={onHide} disabled={isLoading}>
            {t("editTemplateNameModal.cancel")}
          </Button>
          <Button
            variant="none"
            className="applyBtn d-flex align-items-center gap-2"
            disabled={isDisabled || isLoading}
            onClick={handleSave}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("editTemplateNameModal.save")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <Form.Group controlId="formEditedTemplateName">
          <Form.Label className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
            {t("editTemplateNameModal.templateName")}
            <span className="text-danger mx-1">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={editedTemplateName}
            onChange={(e) => setEditedTemplateName(e.target.value)}
            placeholder={t("editTemplateNameModal.enterTemplateName")}
            disabled={isLoading}
            autoFocus
          />
        </Form.Group>
      </div>
    </AppDrawer>
  );
};

export default EditTemplateNameOffcanvas;
