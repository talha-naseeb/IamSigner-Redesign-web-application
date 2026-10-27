import React from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Send, Loader2 } from "lucide-react";

const ResendNotificationModal = ({ show, handleClose, onConfirm, docName, isLoading }) => {
  const { t } = useTranslation();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  return (
    <Modal show={show} onHide={handleClose} dialogClassName='custom-modal-width' backdrop='static' keyboard={false}>
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)]'>
            <Send size={18} style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
          </div>
          <div className='flex-1'>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("dashboardCardStatuses.confirmResend")}
            </Modal.Title>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='px-5 py-4'>
        <p className='text-sm text-[var(--modern-muted)] m-0 leading-relaxed'>
          {t("dashboardCardStatuses.sureResend")}
        </p>
      </Modal.Body>
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          onClick={handleClose}
          disabled={isLoading}
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors disabled:opacity-50'
        >
          {t("dashboardCardStatuses.cancel")}
        </button>
        <button
          type='button'
          onClick={onConfirm}
          disabled={isLoading}
          className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
        >
          {isLoading && <Loader2 size={14} className='animate-spin' />}
          <span>{t("dashboardCardStatuses.confirm")}</span>
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResendNotificationModal;
