import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import verificationService from "@/services/verificationService";
import Loader from "@/Components/CommonModals/Loader/Loader";

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
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Modal show={show} onHide={handleClose} dialogClassName='custom-modal-width'>
        <Modal.Header>
          <h4>{t("viewModal.downloadDoc")}</h4>
        </Modal.Header>
        <Modal.Body className='p-3'>
          <strong>{t("viewModal.selectDoc")}</strong>

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
              <label className='form-check-label' htmlFor='AuditTrail'>
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

        <Modal.Footer>
          <button className='modalCancelButton ' onClick={handleClose} style={{ height: "40px", width: "45%" }}>
            {t("viewModal.close")}
          </button>
          <button className='applyBtn' onClick={handleDownload} disabled={isDownloadButtonDisabled()}>
            {t("viewModal.download")}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShareDownloadModal;
