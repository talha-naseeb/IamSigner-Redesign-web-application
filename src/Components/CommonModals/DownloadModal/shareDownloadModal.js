import React, { useEffect, useState } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import verificationService from "@/services/verificationService";
import { Download, Loader2 } from "lucide-react";

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

  return (
    <>

      <Modal show={show} onHide={handleClose} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
          <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
            {t("viewModal.downloadDoc")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-5 space-y-3 text-[var(--modern-text)]'>
          <p className='text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2'>
            {t("viewModal.selectDoc")}
          </p>

          {dataRow && dataRow.isDocShared && (
            <div className='form-check mt-3'>
              <input type='checkbox' className='form-check-input' id='downloadDocument' checked={selectedCheckboxes.Document} onChange={() => handleCheckboxChange("Document")} />
              <label className='form-check-label' htmlFor='downloadDocument'>
                {t("viewModal.orgDoc")}
              </label>
            </div>
          )}

          {dataRow && dataRow.isAuditTrailDocShared && (
            <div className='form-check'>
              <input type='checkbox' className='form-check-input' id='downloadAuditTrail' checked={selectedCheckboxes.AuditTrail} onChange={() => handleCheckboxChange("AuditTrail")} />
              <label className='form-check-label' htmlFor='downloadAuditTrail'>
                {t("viewModal.auditTrail")}
              </label>
            </div>
          )}

          {dataRow && dataRow.isSupportingDocShared && (
            <div className='form-check'>
              <input type='checkbox' className='form-check-input' id='downloadSupportingDocs' checked={selectedCheckboxes.SupportingDocs} onChange={() => handleCheckboxChange("SupportingDocs")} />
              <label className='form-check-label' htmlFor='downloadSupportingDocs'>
                {t("viewModal.supportingDoc")}
              </label>
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
    </>
  );
};

export default ShareDownloadModal;
