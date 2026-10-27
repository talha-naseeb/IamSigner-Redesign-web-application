import React, { useEffect, useState } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";

const InactiveDocsDownloadModal = ({
  show,
  handleClose,
  docNameShow = [],
  selectedDocument,
  setSelectedDocument,
  handleFileDownload,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleCheckboxChange = (document) => {
    if (selectedDocument === document) {
      setSelectedDocument(null);
    } else {
      setSelectedDocument(document);
    }
  };

  const isDownloadButtonDisabled = () => {
    return !selectedDocument;
  };

  const handleDownload = async () => {
    if (isDownloadButtonDisabled()) {
      toast.error(t("dashboardCardStatuses.selectOne"));
      return;
    }

    setIsLoading(true);
    try {
      await handleFileDownload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setSelectedDocument(null);
    }
  }, [show, setSelectedDocument]);

  return (
    <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)]'>
            <Download size={20} />
          </div>
          <div>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("dashboardCardStatuses.downloadDoc")}
            </Modal.Title>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='px-5 py-4 space-y-4'>
        <div className='space-y-2'>
          {docNameShow.map((doc, index) => {
            const isSelected = selectedDocument === doc;
            return (
              <div
                key={index}
                onClick={() => handleCheckboxChange(doc)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-[var(--theme-color)] bg-[var(--modern-raised)] text-[var(--modern-text)]"
                    : "border-[var(--modern-border)] bg-[var(--modern-card)] hover:bg-[var(--modern-raised)] text-[var(--modern-text)]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-[var(--theme-color)] border-[var(--theme-color)] text-white"
                      : "border-[var(--modern-border-strong)] bg-[var(--modern-bg)]"
                  }`}
                >
                  {isSelected && <span className='text-xs font-bold'>✓</span>}
                </div>
                <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                  <FileText size={18} className={`shrink-0 ${isSelected ? "text-[var(--theme-color)]" : "text-[var(--modern-muted)]"}`} />
                  <div className='min-w-0 flex-1'>
                    <div className='text-sm font-medium truncate'>{doc.docName}</div>
                    <div className='text-xs text-[var(--modern-muted)]'>{t("dashboardCardStatuses.InactiveDoc")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isDownloadButtonDisabled() && (
          <div className='flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs'>
            <AlertCircle size={16} className='shrink-0 mt-0.5' />
            <span>{t("dashboardCardStatuses.selectOne") || "Please select a document to download"}</span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          onClick={handleClose}
          disabled={isLoading}
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors'
        >
          {t("dashboardCardStatuses.cancel")}
        </button>
        <button
          type='button'
          onClick={handleDownload}
          disabled={isDownloadButtonDisabled() || isLoading}
          className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity'
        >
          {isLoading ? (
            <Loader2 size={14} className='animate-spin' />
          ) : (
            <Download size={14} />
          )}
          <span>{t("dashboardCardStatuses.download")}</span>
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default InactiveDocsDownloadModal;
