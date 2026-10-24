import React, { useState, useRef, useCallback } from "react";
import { Form } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { registerDmsDocumentForUploadFlow } from "./utils/dmsSignBridge";
import { useUser } from "@/Context/UserContext";
import UploadSourceCard from "@/Components/Common/CloudPickers/UploadSourceCard";

const buildDocDisplayName = (doc) => {
  const raw = (doc?.fileName || doc?.name || "document").trim();
  if (/\\.[a-z0-9]+$/i.test(raw)) return raw;
  const ext = doc?.ext ? String(doc.ext).replace(/^\\./, "") : "pdf";
  return `${raw}.${ext}`;
};

export const useDmsDocumentUpload = ({
  uploadedFiles,
  setUploadedFiles,
  masterDocIDs,
  setMasterDocIDs,
  fileToggleStates,
  setFileToggleStates,
  registerSignID,
  setRegisterSignID,
  referenceNumber = "",
  description = "",
  setTotalPages,
  setIsTemplateApplied,
  handleGetTemplate,
  onComplete,
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [isDmsUploading, setIsDmsUploading] = useState(false);

  // Refs to always get current values without stale closures
  const uploadedFilesRef = useRef(uploadedFiles);
  uploadedFilesRef.current = uploadedFiles;

  const registerSignIDRef = useRef(registerSignID);
  registerSignIDRef.current = registerSignID;

  const referenceNumberRef = useRef(referenceNumber);
  referenceNumberRef.current = referenceNumber;

  const descriptionRef = useRef(description);
  descriptionRef.current = description;

  const handleGetTemplateRef = useRef(handleGetTemplate);
  handleGetTemplateRef.current = handleGetTemplate;

  const handleDmsDocumentSelected = useCallback(async (doc) => {
    const docName = buildDocDisplayName(doc);
    if (uploadedFilesRef.current.includes(docName)) {
      toast.error(t("uploadDocFlow.alreadyExits"));
      return;
    }

    onComplete?.();
    setIsDmsUploading(true);
    try {
      const result = await registerDmsDocumentForUploadFlow({
        doc,
        user,
        registerSignID: registerSignIDRef.current,
        referenceNumber: referenceNumberRef.current,
        description: descriptionRef.current,
      });

      const nextRegisterSignID = result.registerSignID;
      setRegisterSignID(nextRegisterSignID);
      localStorage.setItem("registerSignID", nextRegisterSignID);

      const masterDocId = result.masterDocs?.[0]?.masterDocIDs;
      const pages = result.totalPages;
      setMasterDocIDs((prevIDs) => [...prevIDs, masterDocId]);
      if (setTotalPages) {
        setTotalPages((prevPages) => [...prevPages, pages]);
      }
      setUploadedFiles((prev) => [...prev, docName]);
      setFileToggleStates((prevStates) => [...prevStates, false]);
      if (setIsTemplateApplied) {
        setIsTemplateApplied((prevStates) => [...prevStates, false]);
      }

      toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
      if (handleGetTemplateRef.current && masterDocId != null) {
        // Use functional update to get correct index (new length - 1)
        setUploadedFiles((prev) => {
          const newIndex = prev.length; // index of the newly added item
          handleGetTemplateRef.current?.(masterDocId, pages, newIndex, false);
          return prev;
        });
      }
    } catch (error) {
      console.error("DMS upload integration failed:", error);
    } finally {
      setIsDmsUploading(false);
    }
  }, [t, user, onComplete, setRegisterSignID, setMasterDocIDs, setTotalPages, setUploadedFiles, setFileToggleStates, setIsTemplateApplied]);

  return { handleDmsDocumentSelected, isDmsUploading };
};

const DmsUploadIntegration = ({ onOpenPicker, isDmsUploading = false }) => {
  const { t } = useTranslation();

  return (
    <>
      {isDmsUploading && (
        <div className="loader-overlay">
          <Loader />
        </div>
      )}
      <UploadSourceCard
        onClick={(e) => {
          e.stopPropagation();
          onOpenPicker?.();
        }}
      >
        <Icons.MacDrive size={28} color="var(--modern-primary)" />
        <Form.Group controlId="dms-file-input" className="space-y-0">
          <Form.Label className="m-0 cursor-pointer whitespace-nowrap text-sm font-medium">{t("uploadDocFlow.dmsDocuments")}</Form.Label>
        </Form.Group>
      </UploadSourceCard>
    </>
  );
};

export default DmsUploadIntegration;
