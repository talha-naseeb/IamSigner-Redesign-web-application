import React, { useEffect, useState } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import verificationService from "@/services/verificationService";
import { Download, File, FileText, FilePlus, Loader2, AlertCircle } from "lucide-react";

const ShareDownloadModal = ({ show, handleClose, dataRow }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    Document: false,
    AuditTrail: false,
    SupportingDocs: false,
  });
  const { t } = useTranslation();

  const handleCheckboxChange = (checkbox) => {
    setSelectedCheckboxes((prevSelected) => ({
      ...prevSelected,
      [checkbox]: !prevSelected[checkbox],
    }));
  };

  useEffect(() => {
    setSelectedCheckboxes({
      Document: false,
      AuditTrail: false,
      SupportingDocs: false,
    });
  }, [show]);

  const DownloadSupportingDocs = async () => {
    setIsLoading(true);

    try {
      const response = await uploadFlowService.downloadSupportingDocs(dataRow.registerSignID);

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/zip" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "supportingDocs.zip";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success(t("dashboardCardStatuses.fileDownload"));
        setIsLoading(false);
      }
    } catch (error) {
      if (error && error.response && error.response.status === 404) {
        toast.error(t("dashboardCardStatuses.Nosupporting"));
      }
      setIsLoading(false);
    }
  };

  const isDownloadButtonDisabled = () => {
    return !selectedCheckboxes.Document && !selectedCheckboxes.AuditTrail && !selectedCheckboxes.SupportingDocs;
  };

  const handleDownload = async () => {
    if (isDownloadButtonDisabled()) {
      toast.error(t("dashboardCardStatuses.selectOne"));
      return;
    }
    if (selectedCheckboxes.Document) {
      setIsLoading(true);
      try {
        const response = await verificationService.downloadDocVerification(dataRow.signedDocKey);

        const fileUrl = response.data.response.document;

        const downloadedBlob = await downloadURL(fileUrl);

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(downloadedBlob);
        downloadLink.download = dataRow.docName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success(t("dashboardCardStatuses.fileDownload"));
      } catch (error) {
        toast.error(t("dashboardCardStatuses.fileNotDownload"));
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedCheckboxes.AuditTrail) {
      setIsLoading(true);
      try {
        const response = await verificationService.downloadDocVerification(dataRow.signedDocKey);

        const auditTrailUrl = response.data.response.auditTrail;

        const downloadedBlob = await downloadURL(auditTrailUrl);

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(downloadedBlob);
        downloadLink.download = "AuditTrail.pdf";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success(t("dashboardCardStatuses.fileDownload"));
      } catch (error) {
        toast.error(t("dashboardCardStatuses.fileNotDownload"));
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedCheckboxes.SupportingDocs) {
      await DownloadSupportingDocs();
    }
    handleClose();
  };

  async function downloadURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${t("dashboardCardStatuses.httpErr")} ${response.status}`);
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {}
  }

  const shareDownloadItems = [
    {
      key: "Document",
      id: "downloadDocument",
      visible: Boolean(dataRow && dataRow.isDocShared),
      icon: File,
      title: t("viewModal.orgDoc"),
      subtitle: t("viewModal.orgDocSubtitle"),
    },
    {
      key: "AuditTrail",
      id: "downloadAuditTrail",
      visible: Boolean(dataRow && dataRow.isAuditTrailDocShared),
      icon: FileText,
      title: t("viewModal.auditTrail"),
      subtitle: t("viewModal.auditTrailSubtitle"),
    },
    {
      key: "SupportingDocs",
      id: "downloadSupportingDocs",
      visible: Boolean(dataRow && dataRow.isSupportingDocShared),
      icon: FilePlus,
      title: t("viewModal.supportingDoc"),
      subtitle: t("viewModal.supportingDocSubtitle"),
    },
  ].filter((item) => item.visible);

  return (
    <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)] shrink-0'>
            <Download size={18} />
          </div>
          <div>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
              {t("viewModal.downloadDoc")}
            </Modal.Title>
            <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
              {t("viewModal.selectDoc")}
            </p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className='px-5 py-4 space-y-3 bg-[var(--modern-card)] text-[var(--modern-text)]'>
        <div className='space-y-2.5'>
          {shareDownloadItems.map(({ key, id, icon: ItemIcon, title, subtitle }) => {
            const isChecked = Boolean(selectedCheckboxes[key]);
            return (
              <label
                key={key}
                htmlFor={id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors m-0 ${
                  isChecked
                    ? "border-[var(--theme-color)] bg-[var(--modern-raised)] text-[var(--modern-text)]"
                    : "border-[var(--modern-border)] bg-[var(--modern-card)] hover:bg-[var(--modern-raised)] text-[var(--modern-text)]"
                }`}
              >
                <input
                  type='checkbox'
                  id={id}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(key)}
                  className='sr-only'
                />
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? "bg-[var(--theme-color)] border-[var(--theme-color)] text-white"
                      : "border-[var(--modern-border-strong)] bg-[var(--modern-bg)]"
                  }`}
                >
                  {isChecked && <span className='text-xs font-bold leading-none'>✓</span>}
                </div>
                <div className='w-8 h-8 rounded-lg bg-[var(--modern-bg)] border border-[var(--modern-border)] flex items-center justify-center shrink-0 text-[var(--theme-color)]'>
                  <ItemIcon size={16} />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-semibold text-[var(--modern-text)] leading-snug'>
                    {title}
                  </div>
                  {subtitle && (
                    <div className='text-xs text-[var(--modern-muted)] mt-0.5 leading-relaxed'>
                      {subtitle}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {isDownloadButtonDisabled() && (
          <div className='flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs'>
            <AlertCircle size={16} className='shrink-0 mt-0.5' />
            <span>{t("dashboardCardStatuses.selectOne")}</span>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
        <button
          type='button'
          className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none disabled:opacity-50'
          onClick={handleClose}
          disabled={isLoading}
        >
          {t("viewModal.close")}
        </button>
        <button
          type='button'
          className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition-all shadow-none'
          onClick={handleDownload}
          disabled={isDownloadButtonDisabled() || isLoading}
        >
          {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Download size={16} />}
          {t("viewModal.download")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareDownloadModal;
