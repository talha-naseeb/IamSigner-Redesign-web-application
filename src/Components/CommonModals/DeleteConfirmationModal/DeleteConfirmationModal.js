import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteConfirmationModal = ({
  show,
  onHide,
  title,
  subtitle,
  warningText,
  itemTitle,
  itemName,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  headerIconSrc,
  itemIconSrc,
  headerIcon,
  itemIcon,
  className,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      dialogClassName={`custom-modal-width ${className}`}
    >
      <Modal.Header closeButton className="pb-2">
        <div className="header-content">
          {(headerIcon || headerIconSrc) && (
            <div className="header-icon
">
              {headerIcon ? (
                headerIcon
              ) : typeof headerIconSrc === "string" ? (
                <img src={headerIconSrc} alt="Headericon" />
              ) : (
                React.createElement(headerIconSrc, { size: 22 })
              )}
            </div>
          )}
          <div className="header-text">
            <Modal.Title>{title}</Modal.Title>
            {/* {subtitle && <p className='header-subtitle'>{subtitle}</p>} */}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        {/* {(itemTitle || itemName || itemIcon || itemIconSrc) && (
          <div className='document-info mb-3'>
            {(itemIcon || itemIconSrc) && (
              <div className='document-icon'>
                {itemIcon ? itemIcon : typeof itemIconSrc === "string" ? <img src={itemIconSrc} alt={itemTitle || "Item"} height={20} width={20} /> : React.createElement(itemIconSrc, { size: 20 })}
              </div>
            )}
            <div className='document-details'>
              {itemTitle && <h6 className='document-title'>{itemTitle}</h6>}
              {itemName && <p className='document-name'>{itemName}</p>}
            </div>
          </div>
        )} */}
        <p className="mb-0">{warningText}</p>

        {/* {warningText && (
          <div className='transfer-warning'>
            <div className='warning-text'>
              <p>{warningText}</p>
            </div>
          </div>
        )} */}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="none" className="modalCancelButton" onClick={onHide}>
          {cancelText}
        </Button>
        <Button variant="none" className="applyBtn" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
