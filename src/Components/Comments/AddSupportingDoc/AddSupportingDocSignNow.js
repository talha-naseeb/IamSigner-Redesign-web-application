import React, { useEffect, useState } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import verificationService from "@/services/verificationService";
import { Paperclip, Loader2 } from "lucide-react";

const AddSupportingDocSignNow = ({ show, onClose, signAuth, getSupportingDocs, className }) => {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const masterDocID = sessionStorage.getItem("masterDocID");

  // Fetch supporting documents when modal is opened (show is true)
  useEffect(() => {
    if (show) {
      setErrorMessage("");
      getSupportingDocs?.();
    }
  }, [show, masterDocID, signAuth, navigate]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
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
            const duplicateFiles = base64Files.filter((allowedFile) =>
              uploadedFileNames.includes(allowedFile.SupportingDocName)
            );

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
                  handleCloseModal();
                  getSupportingDocs?.();
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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .png, .jpg, .jpeg, .txt",
    onDrop: handleFileUpload,
    multiple: true,
  });

  const handleCloseModal = () => {
    setErrorMessage("");
    onClose?.();
  };

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      centered
      dialogClassName="!max-w-[480px]"
      className={className}
    >
      <Modal.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_12%,transparent)] text-[var(--modern-primary,#4d8dff)] flex items-center justify-center shrink-0">
            <Paperclip size={18} />
          </div>
          <div>
            <Modal.Title className="text-base font-bold text-[var(--modern-text)] m-0 leading-tight">
              {t("uploadDocFlow.UploadsupportedDocument", "Upload Supporting Document")}
            </Modal.Title>
            <p className="text-xs text-[var(--modern-muted)] m-0 mt-0.5">
              {t("addComment.supportingDocuments", "Supporting Documents")}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-5 space-y-4">
        <div
          {...getRootProps()}
          className={`group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragActive
              ? "border-[var(--modern-primary,#4d8dff)] bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))]"
              : "border-[var(--modern-border-strong)] hover:border-[var(--modern-primary,#4d8dff)] bg-[var(--modern-raised)]/50 hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_4%,var(--modern-card))]"
          }`}
        >
          <input {...getInputProps()} className="sr-only" />
          <div className="h-14 w-14 rounded-2xl bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_10%,transparent)] text-[var(--modern-primary,#4d8dff)] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Icons.UploadCloud size={30} />
          </div>
          <p className="text-sm font-semibold text-[var(--modern-text)] m-0">
            {t("uploadDocFlow.UploadsupportedDoc", "Drop your files here, or")}{" "}
            <span className="text-[var(--modern-primary,#4d8dff)] underline underline-offset-2">
              {t("uploadDocFlow.here", "browse")}
            </span>
          </p>
          <p className="text-xs text-[var(--modern-muted)] mt-1.5 m-0">
            {t("uploadDocFlow.supportedFormatsHint", "Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 25MB)")}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2.5 py-2 text-xs font-medium text-[var(--modern-primary,#4d8dff)]">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--modern-primary,#4d8dff)]" />
            <span>{t("uploadDocFlow.uploading", "Uploading document...")}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3">
        <button
          type="button"
          className="px-5 py-2 text-xs font-semibold rounded-full border border-[var(--modern-border)] text-[var(--modern-text)] bg-[var(--modern-card)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer outline-none"
          onClick={handleCloseModal}
          disabled={isLoading}
        >
          {t("uploadDocFlow.close", "Close")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSupportingDocSignNow;
