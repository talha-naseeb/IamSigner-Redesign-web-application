import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Loader from "@/Components/CommonModals/Loader/Loader";
import dashboardService from "@/services/dashboardService";
import { Icons } from "@/assets/Icons";

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
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Modal show={show} backdrop='static' keyboard={false} onHide={onHide} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton className='pb-2'>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.InactiveAction size={22} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("dashboardCardStatuses.confirmInactivate")}</Modal.Title>
              {/* <p className='header-subtitle'>{t("dashboardCardStatuses.inActiveNotificationSubtitle")}</p> */}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-4 py-3'>
          {/* {selectedRow && (
            <div className='document-info'>
              <div className='document-icon'>
                <img src={documentIcon} alt={t("dashboardCardStatuses.document")} />
              </div>
              <div className='document-details'>
                <h6 className='document-title'>{t("dashboardCardStatuses.document")}</h6>
                <p className='document-name'>{selectedRow.docName}</p>
              </div>
            </div>
          )} */}

          {/* <div className='transfer-warning'>
            <div className='warning-text'>
              <p>{t("dashboardCardStatuses.sureInActiveNotification")}</p>
            </div>
          </div> */}
          <p className='mb-0'>{t("dashboardCardStatuses.sureInActiveNotification")}</p>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={onHide}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button className='applyBtn' variant='none' onClick={handleInactivateDocument}>
            {t("dashboardCardStatuses.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InactiveConfirmationModal;
