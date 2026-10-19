import React, { useState, useEffect } from "react";
import templateService from "@/services/templateService";
import { Offcanvas, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "./templates.css";
import Loader from "@/Components/CommonModals/Loader/Loader";

const EditTemplateNameOffcanvas = ({ originalTemplateName, show, onHide, templateID, onSave }) => {
  const { t } = useTranslation();
  const [editedTemplateName, setEditedTemplateName] = useState(originalTemplateName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedTemplateName(originalTemplateName);
  }, [originalTemplateName]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await templateService.updateTemplate({
        TemplateID: templateID,
        TemplateName: editedTemplateName,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("editTemplateNameModal.updateTempNameSuccess"));
        onSave(editedTemplateName);
        onHide();
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("editTemplateNameModal.errUpdateTempNameSuccess"));
    }
  };

  const isDisabled = editedTemplateName.trim() === "";

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Offcanvas show={show} onHide={onHide} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("editTemplateNameModal.editTemplateName")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr style={{ margin: " auto 0", borderColor: "black" }} />
        <Offcanvas.Body style={{ padding: "10px" }}>
          <Form.Group controlId='formEditedTemplateName'>
            <Form.Label>
              {t("editTemplateNameModal.templateName")}
              <span className='text-danger mx-1'>*</span>
            </Form.Label>
            <Form.Control type='text' value={editedTemplateName} onChange={(e) => setEditedTemplateName(e.target.value)} placeholder={t("editTemplateNameModal.enterTemplateName")} />
          </Form.Group>
          <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
            <Button variant='none' className='modalCancelButton' onClick={onHide}>
              {t("editTemplateNameModal.cancel")}
            </Button>
            <Button variant='none' className='applyBtn' disabled={isDisabled} onClick={handleSave}>
              {t("editTemplateNameModal.save")}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default EditTemplateNameOffcanvas;
