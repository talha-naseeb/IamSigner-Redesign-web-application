import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Download, File } from "lucide-react";

const InactiveDocsDownloadModal = ({ show, handleClose, docNameShow, selectedDocument, setSelectedDocument, handleFileDownload }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleCheckboxChange = (document) => {
    if (selectedDocument === document) {
      setSelectedDocument(null); // Uncheck if already selected
    } else {
      setSelectedDocument(document); // Check if not selected
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
    <>
      <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <Download size={18} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("dashboardCardStatuses.downloadDoc")}</Modal.Title>
              {/* <p className='header-subtitle'>{t("dashboardCardStatuses.selectDownload")}</p> */}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='transfer-modal-body'>
          <div className='download-options'>
            {docNameShow.map((doc, index) => (
              <div className='mb-3' key={index}>
                <Form.Check type='checkbox' id={`downloadDoc${index}`} className='custom-checkbox'>
                  <Form.Check.Input type='checkbox' checked={selectedDocument === doc} onChange={() => handleCheckboxChange(doc)} />
                  <Form.Check.Label className='d-flex align-items-start'>
                    <div
                      className='rounded d-flex align-items-center justify-content-center me-3'
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      <File size={16} />
                    </div>
                    <div>
                      <div className='fw-medium'>{doc.docName}</div>
                      <small className='text-muted'>{t("dashboardCardStatuses.InactiveDoc")}</small>
                    </div>
                  </Form.Check.Label>
                </Form.Check>
              </div>
            ))}
          </div>

          {isDownloadButtonDisabled() && (
            <div className='transfer-warning'>
              <div className='warning-text'>
                <p>Please select a document to download</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={handleClose} disabled={isLoading}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button className='applyBtn' variant='none' onClick={handleDownload} disabled={isDownloadButtonDisabled() || isLoading}>
            <Download className='me-2' size={16} />
            {t("dashboardCardStatuses.download")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InactiveDocsDownloadModal;
