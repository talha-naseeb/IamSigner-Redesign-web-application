import React from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ShareDetailsModal = ({ show, handleClose, shareWith }) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={handleClose} dialogClassName='custom-modal-width'>
      <Modal.Header>
        <Modal.Title>{t("Folder.ShareDetails")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='p-3'>
        {shareWith && shareWith.length > 0 ? (
          <ul>
            {shareWith.split(",").map((shareItem, index) => (
              <li key={index}>{shareItem.trim()}</li>
            ))}
          </ul>
        ) : (
          <p>{t("Folder.shareInfo")}</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ShareDetailsModal;
