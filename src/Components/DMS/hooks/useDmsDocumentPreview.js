import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import {
  createBlobPreviewUrl,
  getDmsPreviewMimeType,
  revokeBlobPreviewUrl,
  resolveDmsDownloadBlobResponse,
} from "../utils/dmsHelpers";
import { useDmsRequestAbort } from "./useDmsRequestAbort";

export const useDmsDocumentPreview = () => {
  const { t } = useTranslation();
  const { runWithAbort, isAxiosAbortError } = useDmsRequestAbort();
  const [showDocViewModal, setShowDocViewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mimeType, setMimeType] = useState("application/pdf");
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef("");

  const clearPreview = useCallback(() => {
    revokeBlobPreviewUrl(blobUrlRef.current);
    blobUrlRef.current = "";
    setPreviewUrl("");
    setMimeType("application/pdf");
  }, []);

  useEffect(() => () => clearPreview(), [clearPreview]);

  const closePreview = useCallback(() => {
    setShowDocViewModal(false);
    clearPreview();
  }, [clearPreview]);

  const openPreview = useCallback(
    async (doc) => {
      const documentId = doc?.documentId ?? doc?.documentID ?? doc?.masterDocID ?? doc?.id ?? null;
      if (!documentId) return;

      clearPreview();
      setLoading(true);
      let createdBlobUrl = "";

      try {
        const result = await runWithAbort(`preview-${documentId}`, async (signal) => {
          const response = await userService.downloadDmsDocument(documentId, { signal });
          const fileBlob = await resolveDmsDownloadBlobResponse(
            response.data,
            response.headers?.["content-type"]
          );
          return { fileBlob, response };
        });

        if (result?.aborted) return;

        const { fileBlob, response } = result;
        const mime = getDmsPreviewMimeType(
          fileBlob.type || response.headers?.["content-type"],
          doc.ext
        );
        createdBlobUrl = createBlobPreviewUrl(fileBlob);
        blobUrlRef.current = createdBlobUrl;
        setPreviewUrl(createdBlobUrl);
        setMimeType(mime);
        setShowDocViewModal(true);
      } catch (error) {
        if (!isAxiosAbortError(error)) {
          toast.error(t("dashboardCardStatuses.fileNotDisplay"));
        }
      } finally {
        if (createdBlobUrl && blobUrlRef.current !== createdBlobUrl) {
          revokeBlobPreviewUrl(createdBlobUrl);
        }
        setLoading(false);
      }
    },
    [clearPreview, runWithAbort, isAxiosAbortError, t]
  );

  return {
    showDocViewModal,
    previewUrl,
    mimeType,
    loading,
    openPreview,
    closePreview,
  };
};
