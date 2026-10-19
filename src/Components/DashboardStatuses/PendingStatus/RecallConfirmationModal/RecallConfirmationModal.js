import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FiRefreshCw } from "react-icons/fi";
import Loader from "@/Components/CommonModals/Loader/Loader";
import dashboardService from "@/services/dashboardService";
import { Icons } from "@/assets/Icons";

const RecallConfirmationModal = ({ show, onHide, selectedRow, onSuccess }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleRecallDocument = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.recallSignature({
        RegisterSignID: selectedRow?.registerSignID,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.recallSuccess"));
        if (onSuccess) onSuccess();
      } else {
        toast.error(t("dashboardCardStatuses.objectRefErr"));
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(t("dashboardCardStatuses.internalErrorTryLater"));
      console.error("Error", error);
      setIsLoading(false);
    } finally {
      onHide();
    }
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Modal show={show} backdrop='static' keyboard={false} onHide={onHide} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <FiRefreshCw size={22} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("dashboardCardStatuses.confirmRecall")}</Modal.Title>
              {/* <p className='header-subtitle'>{t("dashboardCardStatuses.recallNotificationSubtitle")}</p> */}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-4 py-3'>
          {/* {selectedRow && (
            <div className='document-info'>
              <div className='document-icon'>
                <Icons.PDFs size={22} />
              </div>
              <div className='document-details'>
                <h6 className='document-title'>{t("dashboardCardStatuses.document")}</h6>
                <p className='document-name'>{selectedRow.docName}</p>
              </div>
            </div>
          )}

          <div className='transfer-warning'>
            <div className="warning-text">
            <p>{t("dashboardCardStatuses.sureRecallNotification")}</p>
            </div>
          </div> */}
          <p className='mb-0'>{t("dashboardCardStatuses.SureRecall")}</p>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={onHide}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button className='applyBtn' variant='none' onClick={handleRecallDocument}>
            {t("dashboardCardStatuses.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RecallConfirmationModal;
