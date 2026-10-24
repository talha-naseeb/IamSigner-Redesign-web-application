import React from "react";
import { Modal, Button } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";

const ResendNotificationModal = ({ show, handleClose, onConfirm, docName, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={handleClose} dialogClassName='custom-modal-width' backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--modern-raised)] text-[var(--modern-text)] border border-[var(--modern-border)]'>
            <Icons.Resend size={20} />
          </div>
          <div className='flex-1'>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>{t("dashboardCardStatuses.confirmResend")}</Modal.Title>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='px-4 py-4'>
        <p className='text-sm text-[var(--modern-muted)] mb-0'>{t("dashboardCardStatuses.sureResend")}</p>
      </Modal.Body>
      <Modal.Footer className='flex justify-between pt-3 border-t border-[var(--modern-border)]'>
        <Button variant='outline' onClick={handleClose} disabled={isLoading}>
          {t("dashboardCardStatuses.cancel")}
        </Button>
        <Button variant='primary' onClick={onConfirm} disabled={isLoading}>
          {t("dashboardCardStatuses.confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResendNotificationModal;
