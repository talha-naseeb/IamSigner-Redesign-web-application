import React, { useState, useEffect, useCallback, useRef } from "react";
import uploadFlowService from "@/services/uploadFlowService";
import { commentsManager } from "./commentsManager";
import CommentsOffcanvas from "./CommentsOffcanvas";

export const DashboardCommentsHost = () => {
  const [modalState, setModalState] = useState(commentsManager.getState());
  const activeFetchIdRef = useRef(null);

  useEffect(() => {
    const unsubscribe = commentsManager.subscribe((newState) => {
      setModalState(newState);
    });
    return unsubscribe;
  }, []);

  const fetchComments = useCallback(async (registerSignId) => {
    if (!registerSignId) {
      commentsManager.setComments([]);
      return;
    }

    const currentFetchId = `${registerSignId}-${Date.now()}`;
    activeFetchIdRef.current = currentFetchId;

    try {
      const response = await uploadFlowService.getDocComments(registerSignId);
      if (activeFetchIdRef.current !== currentFetchId) return;

      if (response?.status === 200 && Array.isArray(response.data?.response)) {
        commentsManager.setComments(response.data.response);
      } else {
        commentsManager.setComments([]);
      }
    } catch (err) {
      if (activeFetchIdRef.current !== currentFetchId) return;
      console.error("fetchComments error:", err);
      commentsManager.setError(err?.message || "Failed to load comments");
    }
  }, []);

  useEffect(() => {
    if (modalState.isOpen && modalState.registerSignID) {
      fetchComments(modalState.registerSignID);
    }
  }, [modalState.isOpen, modalState.registerSignID, fetchComments]);

  return (
    <CommentsOffcanvas
      show={modalState.isOpen}
      onHide={() => commentsManager.close()}
      registerSignID={modalState.registerSignID}
      comments={modalState.comments}
      isLoading={modalState.isLoading}
      onRefresh={() => {
        if (modalState.registerSignID) {
          fetchComments(modalState.registerSignID);
        }
      }}
    />
  );
};

export default DashboardCommentsHost;
