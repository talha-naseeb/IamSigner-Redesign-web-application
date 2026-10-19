import { useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import {
  buildDmsDownloadFileName,
  resolveDmsDownloadBlobResponse,
  sanitizeDownloadFileName,
  triggerBrowserFileDownload,
} from "../utils/dmsHelpers";
import { useDmsRequestAbort } from "./useDmsRequestAbort";

export const useDmsDownloads = () => {
  const { t } = useTranslation();
  const { runWithAbort, isAxiosAbortError } = useDmsRequestAbort();

  const downloadDocument = useCallback(
    async (doc) => {
      const documentId = doc?.documentId ?? doc?.documentID ?? doc?.masterDocID ?? doc?.id ?? null;
      if (!documentId) {
        toast.info(t("DMS.downloadUnavailable"));
        return;
      }
      try {
        const result = await runWithAbort(`download-doc-${documentId}`, async (signal) => {
          const response = await userService.downloadDmsDocument(documentId, { signal });
          const fileBlob = await resolveDmsDownloadBlobResponse(
            response.data,
            response.headers?.["content-type"]
          );
          return fileBlob;
        });
        if (result?.aborted) return;
        triggerBrowserFileDownload(result, buildDmsDownloadFileName(doc));
        toast.success(t("dashboardCardStatuses.fileDownload"));
      } catch (error) {
        if (!isAxiosAbortError(error)) {
          toast.error(t("DMS.downloadUrlNotFound"));
        }
      }
    },
    [runWithAbort, isAxiosAbortError, t]
  );

  const downloadFolder = useCallback(
    async (folderOrId) => {
      const folder = typeof folderOrId === "object" && folderOrId != null ? folderOrId : null;
      const id = typeof folderOrId === "string" ? folderOrId : folderOrId?.id;
      if (!id) {
        toast.info(t("DMS.downloadUnavailable"));
        return;
      }
      try {
        const result = await runWithAbort(`download-folder-${id}`, async (signal) => {
          const response = await userService.downloadDmsFolderZip(id, { signal });
          return resolveDmsDownloadBlobResponse(
            response.data,
            response.headers?.["content-type"]
          );
        });
        if (result?.aborted) return;
        const base = sanitizeDownloadFileName(folder?.name, `folder-${id}`);
        triggerBrowserFileDownload(result, `${base}.zip`);
        toast.success(t("dashboardCardStatuses.fileDownload"));
      } catch (error) {
        if (!isAxiosAbortError(error)) {
          toast.error(t("DMS.downloadUrlNotFound"));
        }
      }
    },
    [runWithAbort, isAxiosAbortError, t]
  );

  return { downloadDocument, downloadFolder };
};
