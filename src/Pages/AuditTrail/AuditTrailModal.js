import React, { useEffect } from "react";
import { Button, Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import "./AuditTrail.css";

const AuditTrailModal = ({ show, handleClose, auditTrailURL, className }) => {
  const { t } = useTranslation();

  useEffect(() => {
    //console.log(targetRef);
  });

  return (
    <Modal show={show} onHide={handleClose} className={`audit-trail-modal overflow-hidden ${className || ""}`}>
      <Modal.Header closeButton className='audit-trail-modal-header'>
        <Modal.Title>{t("auditTrailModal.auditTrail")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='audit-trail-modal-body p-0'>
        <iframe title={t("auditTrailModal.auditTrail")} src={auditTrailURL} width='100%' height='500px' style={{ border: "none", backgroundColor: "transparent" }} />
      </Modal.Body>
      <Modal.Footer className='audit-trail-modal-footer'>
        <Button variant='none' className='applyBtn text-white w-25' onClick={handleClose}>
          {t("auditTrailModal.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuditTrailModal;
