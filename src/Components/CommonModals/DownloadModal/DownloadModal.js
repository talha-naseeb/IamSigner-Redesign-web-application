import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import verificationService from "@/services/verificationService";
import { useParams } from "react-router-dom";
import { FiDownload, FiFile, FiFileText } from "react-icons/fi";
import { TiDocumentAdd } from "react-icons/ti";

const DownloadModal = ({ show, handleClose, dataRow }) => {
  const { docName: docNameFromParams } = useParams();
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

  const isDownloadButtonDisabled = () => {
    return !selectedCheckboxes.Document && !selectedCheckboxes.AuditTrail && !selectedCheckboxes.SupportingDocs;
  };

  const DownloadSupportingDocs = async () => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.downloadSupportingDocs(dataRow.registerSignID);
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/zip" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `supportingDocs.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success(t("dashboardCardStatuses.fileDownload"));
        setIsLoading(false);
      }
    } catch (error) {
      if (error && error.response && error.response.status === 404) {
        toast.info(t("dashboardCardStatuses.Nosupporting"));
      }
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloadButtonDisabled()) {
      toast.error(t("dashboardCardStatuses.selectOne"));
      return;
    }

    const documentName = dataRow.docName || docNameFromParams; // Use docName from dataRow or fallback to docNameFromParams

    if (selectedCheckboxes.Document) {
      setIsLoading(true);
      try {
        const response = await verificationService.downloadDocVerification(dataRow.signedDocKey);
        const fileUrl = response.data.response.document;
        const downloadedBlob = await downloadURL(fileUrl);
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(downloadedBlob);
        downloadLink.download = documentName || "document.pdf"; // Use documentName or fallback to a default name
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

        // Check if auditTrail is null or undefined
        if (!auditTrailUrl) {
          toast.info(t("dashboardCardStatuses.noAuditTrail")); // Display an info toast
        } else {
          const downloadedBlob = await downloadURL(auditTrailUrl);
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(downloadedBlob);
          downloadLink.download = `AuditTrail.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success(t("dashboardCardStatuses.fileDownload"));
        }
      } catch (error) {
        toast.info(t("dashboardCardStatuses.fileNotDownload"));
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
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <FiDownload size={18} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("viewModal.downloadDoc")}</Modal.Title>
              {/* <p className='header-subtitle'>{t("viewModal.selectDoc")}</p> */}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='transfer-modal-body'>
          {/* {dataRow && (
            <div className='document-info'>
              <div className='document-icon'>
                <img src={documentIcon} alt='Document' />
              </div>
              <div className='document-details'>
                <h6 className='document-title'>{t("dashboardCardStatuses.document")}</h6>
                <p className='document-name'>{dataRow.docName || t("tablesLabel.docName")}</p>
              </div>
            </div>
          )} */}

          <div className='download-options'>
            <div className='mb-3'>
              <Form.Check type='checkbox' id='downloadDocument' className='custom-checkbox'>
                <Form.Check.Input type='checkbox' checked={selectedCheckboxes.Document} onChange={() => handleCheckboxChange("Document")} />
                <Form.Check.Label className='d-flex align-items-start'>
                  <div
                    className='rounded d-flex align-items-center justify-content-center me-3'
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <FiFile size={16} />
                  </div>
                  <div>
                    <div className='fw-medium'>{t("viewModal.orgDoc")}</div>
                    <small className='text-muted'>{t("viewModal.orgDocSubtitle")}</small>
                  </div>
                </Form.Check.Label>
              </Form.Check>
            </div>

            <div className='mb-3'>
              <Form.Check type='checkbox' id='downloadAuditTrail' className='custom-checkbox'>
                <Form.Check.Input type='checkbox' checked={selectedCheckboxes.AuditTrail} onChange={() => handleCheckboxChange("AuditTrail")} />
                <Form.Check.Label className='d-flex align-items-start'>
                  <div
                    className='rounded d-flex align-items-center justify-content-center me-3'
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <FiFileText size={16} />
                  </div>
                  <div>
                    <div className='fw-medium'>{t("viewModal.auditTrail")}</div>
                    <small className='text-muted'>{t("viewModal.auditTrailSubtitle")}</small>
                  </div>
                </Form.Check.Label>
              </Form.Check>
            </div>

            <div>
              <Form.Check type='checkbox' id='downloadSupportingDocs' className='custom-checkbox'>
                <Form.Check.Input type='checkbox' checked={selectedCheckboxes.SupportingDocs} onChange={() => handleCheckboxChange("SupportingDocs")} />
                <Form.Check.Label className='d-flex align-items-start'>
                  <div
                    className='rounded d-flex align-items-center justify-content-center me-3'
                    style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <TiDocumentAdd size={18} />
                  </div>
                  <div>
                    <div className='fw-medium'>{t("viewModal.supportingDoc")}</div>
                    <small className='text-muted'>{t("viewModal.supportingDocSubtitle")}</small>
                  </div>
                </Form.Check.Label>
              </Form.Check>
            </div>
          </div>

          {isDownloadButtonDisabled() && (
            <div className='transfer-warning'>
              <div className='warning-text'>
                <p>{t("dashboardCardStatuses.selectOne")}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={handleClose} disabled={isLoading}>
            {t("viewModal.close")}
          </Button>
          <Button className='applyBtn' variant='none' onClick={handleDownload} disabled={isDownloadButtonDisabled() || isLoading}>
            <FiDownload className='me-2' size={16} />
            {t("viewModal.download")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DownloadModal;
