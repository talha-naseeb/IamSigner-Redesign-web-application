import React from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";

const ViewModal = ({ show, handleClose, previewUrl, mimeType = "application/pdf", pdfUrl }) => {
  const { t } = useTranslation();
  const url = previewUrl || pdfUrl;
  const type = (mimeType || "application/pdf").toLowerCase().split(";")[0].trim();
  const isImage = type.startsWith("image/");
  const isHtml = type === "text/html" || type === "application/xhtml+xml";

  return (
    <Modal
      show={show}
      keyboard={false}
      backdrop="static"
      onHide={handleClose}
      size="xl"
      dialogClassName="custom-modal-width !max-w-none w-full"
      className="overflow-hidden !max-w-[1100px] w-[94vw]"
    >
      <Modal.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)] shrink-0">
            <Eye size={20} />
          </div>
          <div>
            <Modal.Title className="text-base font-semibold text-[var(--modern-text)] m-0">
              {t("viewModal.viewDocument")}
            </Modal.Title>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="p-0 bg-[var(--modern-card)]">
        {url ? (
          isImage ? (
            <div className="p-4 flex items-center justify-center bg-[var(--modern-bg)]">
              <img
                src={url}
                alt=""
                className="w-full max-h-[72vh] object-contain rounded-lg"
              />
            </div>
          ) : isHtml ? (
            <iframe
              src={url}
              title={t("viewModal.viewDocument")}
              className="view-modal-html-frame w-full h-[72vh] min-h-[520px] border-0 bg-white"
              sandbox="allow-same-origin"
            />
          ) : (
            <embed
              src={url}
              type={type}
              width="100%"
              height="100%"
              className="w-full h-[72vh] min-h-[520px] block"
            />
          )
        ) : null}
      </Modal.Body>
      <Modal.Footer className="border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]">
        <button
          type="button"
          className="px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 transition-opacity"
          onClick={handleClose}
        >
          {t("viewModal.close")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewModal;
