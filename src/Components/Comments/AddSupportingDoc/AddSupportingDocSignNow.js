import React, { useEffect, useState } from "react";
import { Offcanvas } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import verificationService from "@/services/verificationService";
import UploadSourceCard from "@/Components/Common/CloudPickers/UploadSourceCard";

const AddSupportingDocSignNow = ({ show, onClose, signAuth, getSupportingDocs, className }) => {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const masterDocID = sessionStorage.getItem("masterDocID");

  // Fetch supporting documents when Offcanvas is opened (show is true)
  useEffect(() => {
    if (show) {
      getSupportingDocs();
    }
  }, [show, masterDocID, signAuth, navigate]);

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
          const base64Data = e.target.result.split(",")[1]; // Extract base64 content

          base64Files.push({
            SupportingDocName: file.name,
            SupportingDocExtension: file.name.split(".").pop(), // Extract file extension
            SupportingDocFile: base64Data,
            MasterDocID: masterDocID, // Attach MasterDocID for this file
          });

          if (base64Files.length === allowedFiles.length) {
            const uploadedFileNames = uploadedFiles.map((fileName) => fileName);
            const duplicateFiles = base64Files.filter((allowedFile) => uploadedFileNames.includes(allowedFile.SupportingDocName));

            if (duplicateFiles.length > 0) {
              setErrorMessage(t("uploadDocFlow.filewithSameNameExits"));
              toast.error(t("uploadDocFlow.filewithSameNameExits"));
              setIsLoading(false);
            } else {
              const requestBody = {
                RegisterSignID: null,
                SupportingDocs: base64Files,
              };

              setIsLoading(true);
              try {
                const response = await verificationService.addSupportingDocsVerification(requestBody, signAuth);

                if (response.data.successStatus) {
                  setUploadedFiles([...uploadedFiles, ...base64Files.map((allowFile) => allowFile.SupportingDocName)]);

                  toast.success(t("uploadDocFlow.DocUploadedsuccess"));
                  handleCloseModal(getSupportingDocs());
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

  const handleCloseModal = () => {
    setErrorMessage("");
    onClose();
  };

  return (
    <>
      <Offcanvas show={show} onHide={onClose} placement={document.documentElement.dir === "rtl" ? "start" : "end"} className={className}>
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
              <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </p>
          )}

          <div className='newComment d-flex align-items-center justify-content-center w-100 p-3 py-4'>
            <button variant='secondary' className='resetBtn w-100' onClick={handleCloseModal}>
              {t("uploadDocFlow.close")}
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AddSupportingDocSignNow;
