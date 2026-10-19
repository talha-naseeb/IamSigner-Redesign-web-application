import React from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ViewModal = ({ show, handleClose, previewUrl, mimeType = "application/pdf", pdfUrl }) => {
  const { t } = useTranslation();
  const url = previewUrl || pdfUrl;
  const type = (mimeType || "application/pdf").toLowerCase().split(";")[0].trim();
  const isImage = type.startsWith("image/");
  const isHtml = type === "text/html" || type === "application/xhtml+xml";

  return (
    <Modal show={show} keyboard={false} backdrop="static" onHide={handleClose}>
      <Modal.Header closeButton>
        <h4>{t("viewModal.viewDocument")}</h4>
      </Modal.Header>
      <Modal.Body>
        {url ? (
          isImage ? (
            <img
              src={url}
              alt=""
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          ) : isHtml ? (
            <iframe
              src={url}
              title={t("viewModal.viewDocument")}
              className="view-modal-html-frame"
              sandbox="allow-same-origin"
              style={{ width: "100%", height: "70vh", border: "none", background: "#fff" }}
            />
          ) : (
            <embed src={url} type={type} width="100%" height="500px" />
          )
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="applyBtn w-25" onClick={handleClose}>
          {t("viewModal.close")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewModal;
