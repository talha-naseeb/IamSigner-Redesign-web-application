import React, { useEffect, useState } from "react";
import { Form, Dropdown, Offcanvas, Modal, Button } from "react-bootstrap";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import { useDropzone } from "react-dropzone";
import { BiErrorCircle } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useNavigate } from "react-router-dom";
import { AiOutlineDownload } from "react-icons/ai";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { Icons } from "@/assets/Icons/index";

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
          {isLoading && (
            <div className='loader-overlay'>
              <Loader />
            </div>
          )}

          <Form.Group controlId='file-input-add' className='file-upload-temp'>
            <div {...getRootProps({ className: "dropzoneUploadFile" })}>
              <input {...getInputProps()} className='temp-file-input-additional d-none' />
              <Icons.UploadCloud size={50} color='var(--theme-color)' />
              <br />
              <div className='upload-doc-part'>
                <Form.Label>{t("uploadDocFlow.UploadsupportedDoc")}</Form.Label>
                <Form.Label style={{ color: "var(--theme-color)", margin: "0px 5px", textDecoration: "underline" }}>{t("uploadDocFlow.here")}</Form.Label>
              </div>
            </div>
          </Form.Group>
          {errorMessage && (
            <p className='error-message'>
              <BiErrorCircle className='mb-1 mx-2' />
              {errorMessage}
            </p>
          )}
          <div className='upload_file_box' id='upload_file_bx'>
            {uploadedFiles.map((fileName, index) => (
              <div key={index} className='mb-2 uploaded-file d-flex align-items-center justify-content-between px-3 border-bottom'>
                <p className='m-0 d-flex align-items-center gap-2'>
                  <Icons.PDFs size={20} />
                  {fileName}
                </p>
                <Dropdown>
                  <Dropdown.Toggle as={CustomToggle}>
                    <Dropdown.Menu>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileview(supportingDocIDs[index])}>
                        <Icons.View size={20} />
                        {t("uploadDocFlow.view")}
                      </Dropdown.Item>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => DeleteFileModal(supportingDocIDs[index], index)}>
                        <Icons.DeleteAction size={20} />
                        {t("uploadDocFlow.delete")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Toggle>
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
                <AiOutlineDownload size={18} />
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
