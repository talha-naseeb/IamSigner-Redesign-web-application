import { useState, useCallback } from "react";
import uploadFlowService from "@/services/uploadFlowService";

export const useStudioPreview = () => {
  const [previewState, setPreviewState] = useState({
    uploadedFiles: [],
    masterDocIDs: [],
    selectedMasterDocID: null,
    selectedDocName: "",
    imagesData: [],
    selectedImage: null,
    masterDocPagesId: null,
    isLoadingPages: false,
    recipients: [],
  });

  const fetchPreviewPages = useCallback(async (masterDocID, docName = "") => {
    if (!masterDocID) {
      setPreviewState((prev) => ({
        ...prev,
        selectedMasterDocID: null,
        selectedDocName: "",
        imagesData: [],
        selectedImage: null,
        masterDocPagesId: null,
        isLoadingPages: false,
      }));
      return;
    }

    setPreviewState((prev) => ({
      ...prev,
      selectedMasterDocID: masterDocID,
      selectedDocName: docName || prev.selectedDocName,
      isLoadingPages: true,
    }));

    try {
      const response = await uploadFlowService.getMasterDocPages(masterDocID);
      if (response?.data?.successStatus && Array.isArray(response.data.response)) {
        const pages = response.data.response;
        setPreviewState((prev) => ({
          ...prev,
          selectedMasterDocID: masterDocID,
          selectedDocName: docName || prev.selectedDocName,
          imagesData: pages,
          selectedImage: pages[0]?.pagesPath || null,
          masterDocPagesId: pages[0]?.masterDocPagesID || null,
          isLoadingPages: false,
        }));
      } else {
        setPreviewState((prev) => ({ ...prev, isLoadingPages: false }));
      }
    } catch (error) {
      setPreviewState((prev) => ({ ...prev, isLoadingPages: false }));
    }
  }, []);

  const handlePreviewSync = useCallback(
    (updates) => {
      setPreviewState((prev) => {
        const next = { ...prev, ...updates };
        const nextMasterDocIDs = updates.masterDocIDs ?? prev.masterDocIDs;
        const nextFiles = updates.uploadedFiles ?? prev.uploadedFiles;

        if (Array.isArray(nextMasterDocIDs)) {
          if (nextMasterDocIDs.length === 0) {
            next.selectedMasterDocID = null;
            next.selectedDocName = "";
            next.imagesData = [];
            next.selectedImage = null;
            next.masterDocPagesId = null;
          } else if (
            !prev.selectedMasterDocID ||
            !nextMasterDocIDs.some((id) => String(id) === String(prev.selectedMasterDocID))
          ) {
            const firstId = nextMasterDocIDs[0];
            const firstName = nextFiles?.[0] || "";
            setTimeout(() => fetchPreviewPages(firstId, firstName), 0);
          }
        }
        return next;
      });
    },
    [fetchPreviewPages]
  );

  return {
    previewState,
    setPreviewState,
    fetchPreviewPages,
    handlePreviewSync,
  };
};

export default useStudioPreview;
