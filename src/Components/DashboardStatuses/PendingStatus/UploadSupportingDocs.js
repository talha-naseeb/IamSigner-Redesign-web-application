import React, { useEffect, useState } from "react";
import { Dropdown, Offcanvas, Modal, Button } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import { useDropzone } from "react-dropzone";
import { AlertCircle, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { Icons } from "@/assets/Icons/index";
import UploadSourceCard from "@/Components/Common/CloudPickers/UploadSourceCard";

const UploadSupportingDocs = ({ show, onClose, masterDocID, registerSignID }) => {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const [documentPath, setDocumentPath] = useState(null);
  const [isSupported, setIsSupported] = useState();
  const [showModal, setShowModal] = useState(false);
  const [supportingDocIDs, setSupportingDocIDs] = useState([]);
  const [deletingSupportingDocID, setDeletingSupportingDocID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [fileModal, setFileModal] = useState(false);

  const navigate = useNavigate();

  // Fetch supporting documents when Offcanvas is opened (show is true)
  useEffect(() => {
    if (show) {
      setIsLoading(true);
      try {
        uploadFlowService.getSupportingDocs(registerSignID).then((response) => {
          if (response.status === 200) {
            if (Array.isArray(response.data.response)) {
              const uploadedDocs = response.data.response.map((doc) => doc.supportingDocName);
              setUploadedFiles(uploadedDocs);

              const supportingID = response.data.response.map((doc) => doc.supportingDocID);
              setSupportingDocIDs(supportingID);
            }
          }
        });
      } catch (error) {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [show, registerSignID, navigate, t]);

  const handleFileUpload = async (files) => {
    const allowedFormats = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/plain",
    ];

    const newFiles = Array.from(files);
    const allowedFiles = newFiles.filter((file) => allowedFormats.includes(file.type));

    if (allowedFiles.length === 0) {
      setErrorMessage(t("uploadDocFlow.fileFormatSupport"));
      setIsLoading(false);
    } else {
      setErrorMessage("");
      const base64Files = [];
      for (const file of allowedFiles) {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64Data = e.target.result.split(",")[1];
          base64Files.push({
            name: file.name,
            base64: base64Data,
            MasterDocID: null,
          });

          if (base64Files.length === allowedFiles.length) {
            const uploadedFileNames = uploadedFiles.map((fileName) => fileName);
            const duplicateFiles = base64Files.filter((allowedfile) => uploadedFileNames.includes(allowedfile.name));

            if (duplicateFiles.length > 0) {
              setErrorMessage(t("uploadDocFlow.filewithSameNameExits"));
              toast.error(t("uploadDocFlow.filewithSameNameExits"));
              setIsLoading(false);
            } else {
              const fileExtension = file.name.split(".").pop();
              const requestBody = {
                CreatedBy: user.email,
                MasterDocID: masterDocID,
                registerSignID: registerSignID,
                SupportingDocName: file.name,
                SupportingDocExtension: fileExtension,
                SupportingDocFile: base64Data,
              };

              setIsLoading(true);
              try {
                const response = await uploadFlowService.uploadSupportingDoc(requestBody);

                if (response.data.successStatus) {
                  setUploadedFiles([...uploadedFiles, ...base64Files.map((allowFile) => allowFile.name)]);
                  setSupportingDocIDs((prevIDs) => [...prevIDs, response.data.response.supportingDocID]);

                  toast.success(t("uploadDocFlow.DocUploadedsuccess"));
                  setIsLoading(false);
                } else {
                  toast.error(t("uploadDocFlow.failedUpload"));
                  setIsLoading(false);
                }
              } catch (error) {
                setIsLoading(false);
                toast.error(t("uploadDocFlow.failedUpload"));
              }
            }
          }
        };

        reader.readAsDataURL(file);
      }
    }
  };

  // Dropzone configuration for file upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx",
    onDrop: handleFileUpload,
    multiple: true,
  });

  const handleFileview = async (supportingDocID) => {
    try {
      const response = await uploadFlowService.getSingleSupportingDoc(supportingDocID);

      setDocumentPath(response.data.response.supportingDocPath);
      const documentExtension = response.data.response.supportingDocPath.split(".").pop(); // Extract the extension

      if (documentExtension === "docx" || documentExtension === "xlsx" || documentExtension === "ppt") {
        setIsSupported(false);
      } else {
        setIsSupported(true);
      }

      setShowModal(true);
    } catch (error) {
      toast.error(t("uploadDocFlow.filecantView"));
    } finally {
      setIsLoading(false);
    }
  };

  const DeleteFileModal = (supportingDocID, index) => {
    setDeletingSupportingDocID(supportingDocID);
    setDeletingIndex(index);
    setFileModal(true);
  };

  useEffect(() => {}, [deletingIndex, deletingSupportingDocID]);

  const handleFileDownload = (file) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = file;
    downloadLink.download = "file";
    downloadLink.click();
  };

  const handleFileCloseModal = () => {
    setFileModal(false);
  };

  const handleFileDelete = async (supportingDocID, index) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.deleteSupportingDoc({
        SupportingDocID: supportingDocID,
      });

      if (response.data.successStatus) {
        // Remove the file at the specified index from the frontend state
        const updatedUploadedFiles = [...uploadedFiles];
        updatedUploadedFiles.splice(index, 1);
        setUploadedFiles(updatedUploadedFiles);

        // Remove the corresponding masterDocID from the frontend state
        const updatedsupportingDocIDs = [...supportingDocIDs];
        updatedsupportingDocIDs.splice(index, 1);
        setSupportingDocIDs(updatedsupportingDocIDs);

        setIsLoading(false);
      }

      toast.success(t("uploadDocFlow.fileDeleted"));
    } catch (error) {
      toast.error(t("uploadDocFlow.errdeleteFile"));
      setIsLoading(false);
    } finally {
      handleFileCloseModal();
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setErrorMessage("");
    onClose();
  };

  return (
    <>
      <Offcanvas show={show} onHide={onClose} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("uploadDocFlow.UploadsupportedDocument")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>

          <UploadSourceCard {...getRootProps()}>
            <input {...getInputProps()} className="sr-only" />
            <Icons.UploadCloud size={32} className="text-[var(--modern-primary,#6366f1)]" />
            <span className="text-sm font-medium">{t("uploadDocFlow.UploadsupportedDoc")}</span>
            <span className="text-sm font-medium text-[var(--modern-primary,#6366f1)] underline underline-offset-2">
              {t("uploadDocFlow.here")}
            </span>
          </UploadSourceCard>
          {errorMessage && (
            <p className="mt-2 flex items-start gap-2 text-sm text-[var(--modern-danger,#ef4444)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </p>
          )}
          <div className='mt-3 space-y-2' id='upload_file_bx'>
            {uploadedFiles.map((fileName, index) => (
              <div
                key={index}
                className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] px-3 py-2 text-[var(--modern-text,#0f172a)]"
              >
                <p className='m-0 flex min-w-0 items-center gap-2 break-words text-sm'>
                  <Icons.PDFs size={20} />
                  {fileName}
                </p>
                <Dropdown>
                  <Dropdown.Toggle as={CustomToggle} />
                  <Dropdown.Menu align='end'>
                    <Dropdown.Item className='flex items-center gap-2' onClick={() => handleFileview(supportingDocIDs[index])}>
                      <Icons.View size={20} />
                      {t("uploadDocFlow.view")}
                    </Dropdown.Item>
                    <Dropdown.Item className='flex items-center gap-2' onClick={() => DeleteFileModal(supportingDocIDs[index], index)}>
                      <Icons.DeleteAction size={20} />
                      {t("uploadDocFlow.delete")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ))}
          </div>
          <div className='newComment d-flex align-items-center justify-content-center w-100 p-3 py-4'>
            <button variant='secondary' className='resetBtn w-100' onClick={handleCloseModal}>
              {t("uploadDocFlow.close")}
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* View modal */}
      <Modal keyboard={false} backdrop='static' show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("uploadDocFlow.viewFile")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isSupported ? (
            <iframe title='Document Viewer' src={documentPath} alt="can't preview file" width='100%' height='500' className='overflow-x-none'></iframe>
          ) : (
            <p>
              {t("uploadDocFlow.previewfile")}
              <Button className='applyBtn' variant='none' onClick={() => handleFileDownload(documentPath)}>
                <Download size={18} />
              </Button>
            </p>
          )}
        </Modal.Body>
      </Modal>

      {/* file delete modal */}
      <DeleteConfirmationModal
        show={fileModal}
        onHide={handleFileCloseModal}
        title={t("uploadDocFlow.confirmDelete")}
        subtitle={t("uploadDocFlow.supportingDocuments")}
        warningText={t("uploadDocFlow.deleteFile")}
        itemTitle={t("uploadDocFlow.supportingDocuments")}
        itemName={uploadedFiles[deletingIndex] || ""}
        onConfirm={() => handleFileDelete(deletingSupportingDocID, deletingIndex)}
        confirmText={t("uploadDocFlow.delete")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIconSrc={Icons.DeleteAction}
        itemIconSrc={Icons.PDFs}
      />
    </>
  );
};

export default UploadSupportingDocs;
