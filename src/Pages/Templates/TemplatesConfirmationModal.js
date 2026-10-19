import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const TemplatesConfirmationModal = ({
  show,
  handleClose,
  handleConfirm,
  title,
  button,
  subtitle,
  warningText,
  // itemTitle,
  // itemName,
  headerIconSrc,
  // itemIconSrc,
  headerIcon,
  // itemIcon,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();

  const resolvedCancelText = cancelText || t("templateConfirmationModal.cancel");
  const resolvedConfirmText = confirmText || `${t("templateConfirmationModal.yes")}, ${button || t("templateConfirmationModal.delete")}`;
  // const resolvedSubtitle = subtitle || t("templateConfirmationModal.proceed");
  const resolvedWarning = warningText || t("templateConfirmationModal.proceed");

  return (
    <Modal show={show} backdrop='static' keyboard={false} onHide={handleClose} dialogClassName='custom-modal-width'>
      <Modal.Header closeButton>
        <div className='header-content'>
          {(headerIcon || headerIconSrc) && <div className='header-icon'>{headerIcon ? headerIcon : <img src={headerIconSrc} alt='icon' />}</div>}
          <div className='header-text'>
            <Modal.Title>{title}</Modal.Title>
            {/* {resolvedSubtitle && <p className='header-subtitle'>{resolvedSubtitle}</p>} */}
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='px-4 py-3'>
        {/* {(itemTitle || itemName) && (
          <div className='document-info'>
            {itemIconSrc && (
              <div className='document-icon'>
                <img src={itemIconSrc} alt='item-icon' />
              </div>
            )}
            <div className='document-details'>
              {itemTitle && <h6 className='document-title'>{itemTitle}</h6>}
              {itemName && <p className='document-name'>{itemName}</p>}
            </div>
          </div>
        )}

        {resolvedWarning && (
          <div className='transfer-warning'>
            <div className='warning-text'>
              <p>{resolvedWarning}</p>
            </div>
          </div>
        )} */}
        <p>{resolvedWarning}</p>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        <Button variant='none' className='modalCancelButton' onClick={handleClose}>
          {resolvedCancelText}
        </Button>
        <Button variant='none' className='applyBtn' onClick={handleConfirm}>
          {resolvedConfirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TemplatesConfirmationModal;
