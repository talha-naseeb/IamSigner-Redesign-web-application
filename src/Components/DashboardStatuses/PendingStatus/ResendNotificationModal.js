import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import "./TransferOwner/TransferOwnershipModal.css";

const ResendNotificationModal = ({ show, handleClose, onConfirm, docName, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={handleClose} dialogClassName='custom-modal-width' backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <div className='header-content'>
          <div className='header-icon'>
            <Icons.Resend size={22} />
          </div>
          <div className='header-text'>
            <Modal.Title>{t("dashboardCardStatuses.confirmResend")}</Modal.Title>
            {/* <p className="header-subtitle">{t("dashboardCardStatuses.resendNotificationSubtitle")}</p> */}
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='px-4 py-3'>
        {/* {docName && (
        
           <div className="document-info">
          <div className="document-icon">
            <img src={documentIcon} alt="Document" />
          </div>
          <div className="document-details">
            <h6 className="document-title">{t("dashboardCardStatuses.document")}</h6>
            <p className="document-name">{docName}</p>
          </div>
        </div>
        )}
        <div className="transfer-warning">
          <div className="warning-text">
            <p>{t("dashboardCardStatuses.sureResend")}</p>
          </div>
        </div> */}
        <p className='mb-0'>{t("dashboardCardStatuses.sureResend")}</p>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        <Button variant='none' className='modalCancelButton' onClick={handleClose} disabled={isLoading}>
          {t("dashboardCardStatuses.cancel")}
        </Button>
        <Button className='applyBtn' variant='none' onClick={onConfirm} disabled={isLoading}>
          {t("dashboardCardStatuses.confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResendNotificationModal;
