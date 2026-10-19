import React, { useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./AuditTrail.css";

const AuditTrailModal = ({ show, handleClose, auditTrailURL, className }) => {
  const { t } = useTranslation();

  useEffect(() => {
    //console.log(targetRef);
  });

  return (
    <Modal show={show} onHide={handleClose} className={`overflow-hidden ${className}`}>
      <Modal.Header closeButton style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)" }}>
        <Modal.Title style={{ color: "var(--text-primary)" }}>{t("auditTrailModal.auditTrail")}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "var(--bg-primary)", padding: 0 }}>
        <iframe title={t("auditTrailModal.auditTrail")} src={auditTrailURL} width='100%' height='500px' style={{ border: "none", backgroundColor: "transparent" }} />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: "var(--bg-primary)", borderTop: "1px solid var(--border-color)" }}>
        <Button variant='none' className='applyBtn text-white w-25' onClick={handleClose}>
          {t("auditTrailModal.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuditTrailModal;
