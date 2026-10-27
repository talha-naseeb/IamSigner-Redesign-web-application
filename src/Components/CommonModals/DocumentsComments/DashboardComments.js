import React, { useState, useCallback } from "react";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import { commentsManager } from "./commentsManager";
import CommentsOffcanvas from "./CommentsOffcanvas";
import DashboardCommentsHost from "./DashboardCommentsHost";
import uploadFlowService from "@/services/uploadFlowService";

/**
 * Helper to open document comments offcanvas from anywhere in the app.
 */
export const openCommentsModal = (registerSignID) => {
  commentsManager.open(registerSignID);
};

/**
 * DashboardComments
 * Trigger component designed to be safely placed inside `<Dropdown.Item>`.
 * Delegates offcanvas rendering to the persistent `DashboardCommentsHost` in `App.js`,
 * guaranteeing the drawer remains open when the parent dropdown closes.
 */
const DashboardComments = ({ registerSignID, className = "", children, onClick }) => {
  const { t } = useTranslation();

  // Local fallback if mounted without DashboardCommentsHost
  const [localOpen, setLocalOpen] = useState(false);
  const [localComments, setLocalComments] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  const fetchLocalComments = useCallback(async () => {
    if (!registerSignID) return;
    setLocalLoading(true);
    try {
      const response = await uploadFlowService.getDocComments(registerSignID);
      if (response?.status === 200 && Array.isArray(response.data?.response)) {
        setLocalComments(response.data.response);
      }
    } catch (err) {
      console.error("Local fetch comments error:", err);
    } finally {
      setLocalLoading(false);
    }
  }, [registerSignID]);

  const handleOpen = useCallback(
    (e) => {
      if (onClick) onClick(e);

      if (commentsManager.hasListeners()) {
        commentsManager.open(registerSignID);
      } else {
        setLocalOpen(true);
        fetchLocalComments();
      }
    },
    [onClick, registerSignID, fetchLocalComments]
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
            <Icons.Comments size={20} className='shrink-0' />
            <span>{t("Comments.Comments") || "Comments"}</span>
          </>
        )}
      </div>

      {/* Local fallback offcanvas if DashboardCommentsHost is not present */}
      {!commentsManager.hasListeners() && localOpen && (
        <CommentsOffcanvas
          show={localOpen}
          onHide={() => setLocalOpen(false)}
          registerSignID={registerSignID}
          comments={localComments}
          isLoading={localLoading}
          onRefresh={fetchLocalComments}
        />
      )}
    </>
  );
};

export default DashboardComments;
export { DashboardComments, CommentsOffcanvas, DashboardCommentsHost, commentsManager };
