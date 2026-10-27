import React, { useState } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { RefreshCw, Loader2 } from "lucide-react";
import dashboardService from "@/services/dashboardService";

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
    <Modal show={show} backdrop='static' keyboard={false} onHide={onHide} dialogClassName='custom-modal-width'>
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'>
            <RefreshCw size={20} />
          </div>
          <div>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("dashboardCardStatuses.confirmRecall")}
            </Modal.Title>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='px-5 py-4'>
        <p className='text-sm text-[var(--modern-muted)] m-0 leading-relaxed'>
          {t("dashboardCardStatuses.SureRecall")}
        </p>
      </Modal.Body>
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          onClick={onHide}
          disabled={isLoading}
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none disabled:opacity-50'
        >
          {t("dashboardCardStatuses.cancel")}
        </button>
        <button
          type='button'
          onClick={handleRecallDocument}
          disabled={isLoading}
          className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white border-0 hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-none'
        >
          {isLoading && <Loader2 size={14} className='animate-spin' />}
          <span>{t("dashboardCardStatuses.confirm")}</span>
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecallConfirmationModal;
