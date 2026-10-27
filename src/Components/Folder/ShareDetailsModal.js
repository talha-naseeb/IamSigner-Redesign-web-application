import React from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Users, Mail } from "lucide-react";

const ShareDetailsModal = ({ show, handleClose, shareWith }) => {
  const { t } = useTranslation();

  const members = shareWith && typeof shareWith === "string" 
    ? shareWith.split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(shareWith)
    ? shareWith
    : [];

  return (
    <Modal show={show} onHide={handleClose} dialogClassName='custom-modal-width'>
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)]'>
            <Users size={20} />
          </div>
          <div>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("Folder.ShareDetails")}
            </Modal.Title>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='p-5 space-y-3'>
        {members.length > 0 ? (
          <div className='space-y-2 max-h-64 overflow-y-auto'>
            {members.map((shareItem, index) => (
              <div
                key={index}
                className='flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-sm text-[var(--modern-text)]'
              >
                <Mail size={16} className='text-[var(--modern-muted)] shrink-0' />
                <span className='truncate'>{shareItem}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-[var(--modern-muted)] m-0'>{t("Folder.shareInfo")}</p>
        )}
      </Modal.Body>
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          onClick={handleClose}
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none'
        >
          {t("common.close")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareDetailsModal;
