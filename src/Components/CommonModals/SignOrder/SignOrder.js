import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { signOrderManager } from "./signOrderManager";
import SignOrderModal from "./SignOrderModal";
import SignOrderModalHost from "./SignOrderModalHost";
import dashboardService from "@/services/dashboardService";
import { toast } from "react-toastify";

/**
 * Convenience helper to open the Sign Order modal programmatically from anywhere.
 */
export const openSignOrderModal = (masterDocID) => {
  const resolved =
    typeof masterDocID === "object"
      ? masterDocID?.masterDocID || masterDocID?.MasterDocID || masterDocID?.id
      : masterDocID;
  signOrderManager.open(resolved);
};

/**
 * SignOrder trigger component.
 * Can be placed directly inside `<Dropdown.Item>` or used as a standalone action button.
 * Delegates modal rendering to the persistent `SignOrderModalHost` mounted in `App.js`,
 * which ensures the modal remains visible and unaffected when dropdown menus unmount on click.
 */
const SignOrder = ({ masterDocID, className = "", children, onClick }) => {
  const { t } = useTranslation();

  // Fallback state if mounted without a registered SignOrderModalHost
  const [localOpen, setLocalOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [localError, setLocalError] = useState(null);

  const resolvedMasterDocID =
    typeof masterDocID === "object"
      ? masterDocID?.masterDocID || masterDocID?.MasterDocID || masterDocID?.id
      : masterDocID;

  const handleOpen = useCallback(
    async (e) => {
      if (onClick) onClick(e);

      if (signOrderManager.hasListeners()) {
        // Preferred route: open via persistent root host so closing the dropdown doesn't unmount the modal
        signOrderManager.open(resolvedMasterDocID);
      } else {
        // Fallback route: manage modal locally
        setLocalOpen(true);
        setLocalLoading(true);
        setLocalError(null);

        try {
          const response = await dashboardService.getSignatureOrder(resolvedMasterDocID);
          const resData = response?.data;
          const isSuccess =
            String(resData?.statusCode) === "1" ||
            resData?.statusCode === 1 ||
            resData?.successStatus === true ||
            resData?.successStatus === "true" ||
            (Array.isArray(resData?.response) && resData.response.length > 0) ||
            Array.isArray(resData);

          if (isSuccess) {
            setLocalData(resData);
          } else {
            setLocalError(
              resData?.statusMessage ||
                t("signOrderDaigram.emptyDescription") ||
                "Failed to load signature order"
            );
          }
        } catch (err) {
          const msg =
            err?.response?.data?.statusMessage ||
            err?.message ||
            t("signOrderDaigram.failedToLoad") ||
            "Failed to load signature order";
          setLocalError(msg);
          toast.error(msg);
        } finally {
          setLocalLoading(false);
        }
      }
    },
    [onClick, resolvedMasterDocID, t]
  );

  return (
    <>
      <div
        className={`d-flex gap-2 align-items-center w-full cursor-pointer ${className}`.trim()}
        onClick={handleOpen}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen(e);
          }
        }}
      >
        {children || (
          <>
            <Icons.SignOrder size={20} className='shrink-0' />
            <span>{t("signOrderDaigram.Signorder") || "Sign Order"}</span>
          </>
        )}
      </div>

      {/* Local fallback modal only rendered when host is absent */}
      {!signOrderManager.hasListeners() && localOpen && (
        <SignOrderModal
          show={localOpen}
          onHide={() => setLocalOpen(false)}
          isLoading={localLoading}
          data={localData}
          error={localError}
          onRetry={() => handleOpen()}
        />
      )}
    </>
  );
};

export default SignOrder;
export { SignOrder, SignOrderModal, SignOrderModalHost, signOrderManager };
