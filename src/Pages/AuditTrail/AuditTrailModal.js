import React from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { History } from "lucide-react";
import "./AuditTrail.css";

const AuditTrailModal = ({ show, handleClose, auditTrailURL, className }) => {
  const { t } = useTranslation();

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size='xl'
      dialogClassName='custom-modal-width !max-w-none w-full'
      className={`audit-trail-modal overflow-hidden !max-w-[1440px] w-[96vw] ${className || ""}`}
    >
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)]'>
            <History size={20} />
          </div>
          <div>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("auditTrailModal.auditTrail")}
            </Modal.Title>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='audit-trail-modal-body p-0 bg-[var(--modern-card)]'>
        <iframe
          title={t("auditTrailModal.auditTrail")}
          src={auditTrailURL}
          width='100%'
          className='w-full border-0 bg-transparent h-[72vh] min-h-[560px]'
        />
      </Modal.Body>
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          onClick={handleClose}
          className='px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 transition-opacity'
        >
          {t("auditTrailModal.close") || t("common.close") || "Close"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuditTrailModal;
