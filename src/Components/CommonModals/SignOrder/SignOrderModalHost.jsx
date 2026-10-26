import React, { useState, useEffect, useCallback, useRef } from "react";
import dashboardService from "@/services/dashboardService";
import { signOrderManager } from "./signOrderManager";
import SignOrderModal from "./SignOrderModal";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const SignOrderModalHost = () => {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState(signOrderManager.getState());
  const activeFetchIdRef = useRef(null);

  useEffect(() => {
    const unsubscribe = signOrderManager.subscribe((newState) => {
      setModalState(newState);
    });
    return unsubscribe;
  }, []);

  const fetchSignOrder = useCallback(
    async (masterDocId) => {
      if (!masterDocId) {
        signOrderManager.setError(t("signOrderDaigram.notDocsFound") || "Document ID is missing");
        return;
      }

      const currentFetchId = `${masterDocId}-${Date.now()}`;
      activeFetchIdRef.current = currentFetchId;

      try {
        const response = await dashboardService.getSignatureOrder(masterDocId);

        // Discard if another request was triggered
        if (activeFetchIdRef.current !== currentFetchId) return;

        const resData = response?.data;
        const isSuccess =
          String(resData?.statusCode) === "1" ||
          resData?.statusCode === 1 ||
          resData?.successStatus === true ||
          resData?.successStatus === "true" ||
          (Array.isArray(resData?.response) && resData.response.length > 0) ||
          Array.isArray(resData);

        if (isSuccess) {
          signOrderManager.setData(resData);
        } else {
          const errorMsg =
            resData?.statusMessage ||
            t("signOrderDaigram.emptyDescription") ||
            "No signature order found for this document";
          signOrderManager.setError(errorMsg);
        }
      } catch (err) {
        if (activeFetchIdRef.current !== currentFetchId) return;
        const errorMsg =
          err?.response?.data?.statusMessage ||
          err?.message ||
          t("signOrderDaigram.failedToLoad") ||
          "Failed to load signature order";
        signOrderManager.setError(errorMsg);
        toast.error(errorMsg);
      }
    },
    [t]
  );

  useEffect(() => {
    if (modalState.isOpen && modalState.isLoading && modalState.masterDocID) {
      fetchSignOrder(modalState.masterDocID);
    }
  }, [modalState.isOpen, modalState.isLoading, modalState.masterDocID, fetchSignOrder]);

  return (
    <SignOrderModal
      show={modalState.isOpen}
      onHide={() => signOrderManager.close()}
      isLoading={modalState.isLoading}
      data={modalState.data}
      error={modalState.error}
      onRetry={() => {
        if (modalState.masterDocID) {
          signOrderManager.open(modalState.masterDocID);
        }
      }}
    />
  );
};

export default SignOrderModalHost;
