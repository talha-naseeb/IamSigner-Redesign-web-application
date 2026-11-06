import React, { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import verificationService from "@/services/verificationService";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { useTranslation } from "react-i18next";
import AddSupportingDocSignNow from "./AddSupportingDoc/AddSupportingDocSignNow";
import { Icons } from "@/assets/Icons";
import {
  MessageSquare,
  Paperclip,
  Plus,
  Eye,
  Download,
  FileText,
  Send,
  X,
  Check,
  Trash2,
  Edit3,
} from "lucide-react";
import debounce from "lodash/debounce";
import { formatCommentTime12Hour, getCommentDisplayName } from "@/utils/commentFormatters";

const Comments = ({
  registerSignID,
  signAuth,
  signatoryEmail,
  signatoryName,
  permissions,
  initialTab = "comments",
  variant = "tabs",
  onClose,
  onCountsChange,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [newComment, setNewComment] = useState("");
  const newCommentRef = useRef(newComment);

  useEffect(() => {
    newCommentRef.current = newComment;
  }, [newComment]);
  const [comments, setComments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedText, setEditedText] = useState("");
  const [docCommentsIDs, setDocCommentsIDs] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [commentToDeleteIndex, setCommentToDeleteIndex] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [showSupportingCanvas, setShowSupportingCanvas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "#4f46e5",
      "#0284c7",
      "#0d9488",
      "#16a34a",
      "#d97706",
      "#e11d48",
      "#7c3aed",
    ];
    const index = (name || "").length % colors.length;
    return colors[index];
  };

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleNewCommentKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!newComment || newComment.trim() === "") {
        toast.error(t("addComment.enterValidValue"));
        return;
      }
      debouncedAddComment();
    }
  };

  const addComment = async () => {
    const commentText = (newCommentRef.current || "").trim();
    if (!commentText) {
      toast.error(t("addComment.enterValidValue"));
      return;
    }

    setIsSubmitting(true);

    const requestBody = {
      Comments: commentText,
      AdhockUserID: process.env.REACT_APP_STATIC_ADHOCK_USER_ID,
      CommentPostedBy: signatoryName,
      CreatedBy: signatoryEmail,
      MasterDocID: null,
      RegisterSignID: registerSignID,
    };

    try {
      const response = await verificationService.createDocCommentsVerification(
        requestBody,
        signAuth
      );

      if (response.status === 200) {
        getSupportingDocs();
        setDocCommentsIDs((prev) => [...prev, response.data.response]);
        setNewComment("");
        toast.success(t("addComment.commentAdded"));

        try {
          await verificationService.createSignActivityVerification(
            {
              Status: t("addComment.newCommentAdded"),
              Message: `${signatoryName} ${t(
                "addComment.addedNewComment"
              )} [${commentText}]`,
            },
            signAuth
          );
        } catch (error) {}
      }
    } catch (error) {
      toast.error(t("addComment.failedToAdd"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debounced version — stable callback independent of typing re-renders
  const debouncedAddComment = useCallback(
    debounce(addComment, 1000, { leading: true, trailing: false }),
    [signAuth, registerSignID, signatoryName, signatoryEmail]
  );

  const handleDeleteComment = async (docCommentsID, index) => {
    const requestBody = {
      DocCommentsID: docCommentsID,
      ModifiedBy: signatoryEmail,
    };
    try {
      const response = await verificationService.deleteDocCommentsVerification(
        requestBody,
        signAuth
      );

      if (response.status === 200) {
        const updatedComments = [...comments];
        updatedComments.splice(index, 1);
        const updatedDocCommentsIDs = [...docCommentsIDs];
        updatedDocCommentsIDs.splice(index, 1);
        setComments(updatedComments);
        setDocCommentsIDs(updatedDocCommentsIDs);

        onCountsChange?.({
          commentsCount: updatedComments.length,
          supportingDocsCount: supportingDocs.length,
        });

        toast.success(t("addComment.commentDeleted"));

        try {
          await verificationService.createSignActivityVerification(
            {
              Status: "Comment deleted",
              Message: `${signatoryName} deleted a comment`,
            },
            signAuth
          );
        } catch (error) {}
      }
    } catch (error) {
      toast.error(t("addComment.failedTodelete"));
    } finally {
      setShowConfirmModal(false);
    }
  };

  const toggleEdit = (index) => {
    setEditingIndex(index);
    setEditedText(comments[index].comments);
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditedText("");
  };

  const saveEditedComment = async (docCommentsID) => {
    const updatedText = editedText.trim();
    if (!updatedText) return;

    const requestBody = {
      DocCommentsID: docCommentsID,
      Comments: updatedText,
      ModifiedBy: signatoryEmail,
    };

    try {
      const response = await verificationService.updateDocCommentsVerification(
        requestBody,
        signAuth
      );

      if (response.status === 200) {
        const updatedComments = [...comments];
        const index = updatedComments.findIndex(
          (comment) => comment.docCommentsID === docCommentsID
        );

        if (index !== -1) {
          updatedComments[index].comments = updatedText;
          setComments(updatedComments);
          setEditingIndex(-1);
          toast.success(t("addComment.commentUpdate"));

          try {
            await verificationService.createSignActivityVerification(
              {
                Status: "Comment edited",
                Message: `${signatoryName} edited comment as [${updatedText}]`,
              },
              signAuth
            );
          } catch (error) {}
        }
      }
    } catch (error) {
      toast.error(t("addComment.failedToUpdate"));
    }
  };

  const getSupportingDocs = async () => {
    try {
      const response =
        await verificationService.getSupportingDocAndDocCommentsVerification(
          signAuth
        );

      if (response.data.successStatus) {
        const allComments = response.data.response.docComments || [];
        const allDocs = response.data.response.supportingDocs || [];
        setComments(allComments);
        setDocCommentsIDs(allComments.map((comment) => comment.docCommentsID));
        setSupportingDocs(allDocs);

        onCountsChange?.({
          commentsCount: allComments.length,
          supportingDocsCount: allDocs.length,
        });
      }
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (signAuth) {
      getSupportingDocs();
    }
  }, [signAuth]);

  useEffect(() => {
    return () => {
      debouncedAddComment.cancel();
    };
  }, [debouncedAddComment]);

  const handleFileDownload = async (doc) => {
    try {
      const response = await fetch(doc.supportingDocPath);
      const blob = await response.blob();
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = doc.supportingDocName || "supporting-document";
      downloadLink.click();

      try {
        await verificationService.createSignActivityVerification(
          {
            Status: "file downloaded",
            Message: `${signatoryName} downloaded ${doc.supportingDocName} file`,
          },
          signAuth
        );
      } catch (error) {}
    } catch (error) {}
  };

  const handleFileview = async (doc) => {
    window.open(doc.supportingDocPath, "_blank");
    try {
      await verificationService.createSignActivityVerification(
        {
          Status: "file viewed",
          Message: `${signatoryName} viewed ${doc.supportingDocName} file`,
        },
        signAuth
      );
    } catch (error) {}
  };

  const handleShowConfirmModal = (docCommentsID, index) => {
    setDeletingCommentId(docCommentsID);
    setCommentToDeleteIndex(index);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleShowSupportingOffcanvas = () => {
    setShowSupportingCanvas(true);
  };

  const handleCloseSupportingOffcanvas = () => setShowSupportingCanvas(false);

  const renderCommentsList = () => {
    if (!comments || comments.length === 0) {
      return (
        <div className='py-8 text-center text-[var(--modern-muted)] flex flex-col items-center justify-center gap-2'>
          <MessageSquare size={28} className='opacity-25' />
          <p className='text-xs font-medium m-0'>
            {t("Comments.noCommentsYet", "No comments yet")}
          </p>
          <p className='text-[11px] text-[var(--modern-muted)] m-0'>
            {t("Comments.startConversation", "Leave a comment for other signatories")}
          </p>
        </div>
      );
    }

    return comments.map((comment, index) => {
      const isOwn = comment.createdBy === signatoryEmail;
      const isEditing = editingIndex === index;

      return (
        <div
          key={comment.docCommentsID || index}
          className='p-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]/50 hover:bg-[var(--modern-raised)] transition-all'
        >
          {isEditing ? (
            <div className='flex flex-col gap-2'>
              <input
                type='text'
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (editedText && editedText.trim() !== "") {
                      saveEditedComment(comment.docCommentsID);
                    }
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
                className='w-full px-3 py-1.5 rounded-lg text-xs border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] outline-none focus:border-[var(--modern-primary,#4d8dff)]'
                autoFocus
              />
              <div className='flex items-center gap-1.5 justify-end'>
                <button
                  type='button'
                  onClick={() => saveEditedComment(comment.docCommentsID)}
                  className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--modern-primary,#4d8dff)] text-white text-[11px] font-semibold hover:opacity-90 cursor-pointer border-0'
                >
                  <Check size={12} />
                  <span>{t("addComment.save", "Save")}</span>
                </button>
                <button
                  type='button'
                  onClick={cancelEdit}
                  className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] text-[11px] font-medium hover:bg-[var(--modern-raised)] cursor-pointer'
                >
                  <X size={12} />
                  <span>{t("addComment.cancel", "Cancel")}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className='flex items-center justify-between gap-2 mb-1.5'>
                <div className='flex items-center gap-2 min-w-0'>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: getAvatarColor(comment.commentPostedBy || "no name"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "700",
                      flexShrink: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {getInitials(comment.commentPostedBy || "no name")}
                  </div>
                  <span className='text-xs font-semibold text-[var(--modern-text)] truncate'>
                      {getCommentDisplayName(comment, t("Comments.anonymous", "Signatory"))}
                  </span>
                </div>

                {isOwn && (
                  <div className='flex items-center gap-1 shrink-0'>
                    <button
                      type='button'
                      onClick={() => toggleEdit(index)}
                      className='p-1 rounded text-[var(--modern-muted)] hover:text-[var(--modern-text)] hover:bg-[var(--modern-card)] transition-colors border-0 bg-transparent cursor-pointer'
                      title={t("addComment.edit", "Edit")}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleShowConfirmModal(docCommentsIDs[index], index)}
                      className='p-1 rounded text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors border-0 bg-transparent cursor-pointer'
                      title={t("uploadDocFlow.delete", "Delete")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <p className='text-xs text-[var(--modern-text)] whitespace-pre-wrap break-words m-0 leading-relaxed'>
                {comment.comments}
              </p>

              <div className='flex items-center justify-between mt-2 pt-1 border-t border-[var(--modern-border)]/50 text-[10px] text-[var(--modern-muted)]'>
                <span>
                  {comment.createdDate} {formatCommentTime12Hour(comment.createdTime)}
                </span>
                {comment.modifiedOn !== null && (
                  <span className='italic font-medium text-[var(--modern-muted)]'>
                    {t("addComment.edited", "edited")}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      );
    });
  };

  const renderCommentInput = () => {
    if (permissions?.canAddComment === false) return null;

    return (
      <div className='p-2.5 border-t border-[var(--modern-border)] bg-[var(--modern-card)] shrink-0'>
        <div className='flex items-center gap-1.5 p-1 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] focus-within:border-[var(--modern-primary,#4d8dff)] transition-all'>
          <input
            type='text'
            placeholder={t("Comments.addCommentHere", "Add a comment...")}
            value={newComment}
            onChange={handleNewCommentChange}
            onKeyDown={handleNewCommentKeyDown}
            disabled={isSubmitting}
            className='flex-1 bg-transparent px-2.5 py-1 text-xs text-[var(--modern-text)] placeholder-[var(--modern-muted)] outline-none border-0'
          />
          <button
            type='button'
            onClick={debouncedAddComment}
            disabled={isSubmitting || !newComment || !newComment.trim()}
            className='h-7 w-7 rounded-lg bg-[var(--modern-primary,#4d8dff)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border-0 shrink-0'
            title='Send comment'
            aria-label='Send comment'
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    );
  };

  const renderSupportingList = () => {
    if (!supportingDocs || supportingDocs.length === 0) {
      return (
        <div className='py-8 text-center text-[var(--modern-muted)] flex flex-col items-center justify-center gap-2'>
          <Paperclip size={28} className='opacity-25' />
          <p className='text-xs font-semibold text-[var(--modern-text)] m-0'>
            {t("dashboardCardStatuses.noSupportingDocuments", "No supporting documents")}
          </p>
        </div>
      );
    }

    return supportingDocs.map((doc, index) => (
      <div
        key={doc.supportingDocID || index}
        className='flex items-center justify-between p-2.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]/50 hover:bg-[var(--modern-raised)] transition-all'
      >
        <div className='flex items-center gap-2 min-w-0 flex-1 mr-2'>
          <div className='shrink-0 w-7 h-7 rounded-lg bg-[var(--modern-card)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-primary,#4d8dff)]'>
            <FileText size={14} />
          </div>
          <p
            className='text-xs font-medium text-[var(--modern-text)] truncate m-0'
            title={doc.supportingDocName}
          >
            {doc.supportingDocName}
          </p>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          <button
            type='button'
            onClick={() => handleFileview(doc)}
            className='inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-[11px] font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer'
            title={t("addComment.view", "View")}
          >
            <Eye size={12} />
          </button>
          {permissions && permissions.isAllowTransfer !== false && (
            <button
              type='button'
              onClick={() => handleFileDownload(doc)}
              className='inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-[11px] font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer'
              title={t("addComment.download", "Download")}
            >
              <Download size={12} />
            </button>
          )}
        </div>
      </div>
    ));
  };

  if (variant === "stacked") {
    return (
      <div className='flex flex-col gap-4 select-none w-full'>
        {/* Card 1: Comments */}
        <div className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col overflow-hidden shadow-xs'>
          <div className='p-3.5 border-b border-[var(--modern-border)] flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MessageSquare size={16} className='text-[var(--modern-primary,#4d8dff)]' />
              <h4 className='text-sm font-bold text-[var(--modern-text)] m-0'>
                {t("Comments.Comments", "Comments")}
              </h4>
            </div>
            {comments.length > 0 && (
              <span className='px-2 py-0.5 rounded-full bg-[var(--modern-raised)] text-[var(--modern-muted)] text-xs font-mono font-semibold'>
                {comments.length}
              </span>
            )}
          </div>

          {/* Comments List */}
          <div className='max-h-[300px] overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar'>
            {renderCommentsList()}
          </div>

          {/* Add Comment Input */}
          {renderCommentInput()}
        </div>

        {/* Card 2: Supporting Documents */}
        <div className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col overflow-hidden shadow-xs'>
          <div className='p-3.5 border-b border-[var(--modern-border)] flex flex-col gap-2.5'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <Paperclip size={14} className='text-[var(--modern-primary,#4d8dff)] shrink-0' />
                <h4 className='text-xs font-bold text-[var(--modern-text)] m-0 truncate'>
                  {t("addComment.supportingDocuments", "Supporting documents")}
                </h4>
              </div>
              <span className='px-2 py-0.5 rounded-full bg-[var(--modern-raised)] text-[var(--modern-muted)] text-[11px] font-mono font-semibold shrink-0'>
                {supportingDocs.length}{" "}
                {supportingDocs.length === 1
                  ? t("dashboardCardStatuses.document", "document")
                  : t("dashboardCardStatuses.documents", "documents")}
              </span>
            </div>

            {permissions?.canAddSupportingDocument !== false && (
              <button
                type='button'
                onClick={handleShowSupportingOffcanvas}
                className='w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--modern-primary,#4d8dff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer border-0 shadow-none'
              >
                <Plus size={13} />
                <span>{t("dashboardCardStatuses.AddSupportingDocs", "Add Docs")}</span>
              </button>
            )}
          </div>

          {/* Supporting Documents List */}
          <div className='max-h-[220px] overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar'>
            {renderSupportingList()}
          </div>
        </div>

        {/* Offcanvas Drawer for Uploading Supporting Documents */}
        <AddSupportingDocSignNow
          show={showSupportingCanvas}
          onClose={handleCloseSupportingOffcanvas}
          signAuth={signAuth}
          getSupportingDocs={getSupportingDocs}
          className='force-light-offcanvas'
        />

        {/* Delete Comment Modal */}
        <DeleteConfirmationModal
          show={showConfirmModal}
          onHide={handleCloseConfirmModal}
          title={t("Folder.deleteConfirmation")}
          subtitle={t("Comments.deleteComment")}
          warningText={t("uploadDocFlow.deleteComment")}
          itemTitle={t("Comments.comment")}
          itemName={
            (comments.find((c) => c.docCommentsID === deletingCommentId) || {})
              .comments || ""
          }
          onConfirm={() =>
            handleDeleteComment(deletingCommentId, commentToDeleteIndex)
          }
          confirmText={t("uploadDocFlow.delete")}
          cancelText={t("uploadDocFlow.cancel")}
          headerIcon={<Icons.DeleteAction size={25} />}
          itemIcon={<Icons.Comments size={20} />}
          className='force-light-modal'
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-[var(--modern-card)] text-[var(--modern-text)] overflow-hidden select-none'>
      {/* Top Header & Segmented Tab Switcher */}
      <div className='p-3 border-b border-[var(--modern-border)] bg-[var(--modern-card)] shrink-0'>
        <div className='flex items-center justify-between gap-2 mb-2'>
          <h6 className='text-xs font-bold uppercase tracking-wider text-[var(--modern-muted)] m-0'>
            {t("Comments.activityAndFiles", "Collaboration")}
          </h6>
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              className='lg:hidden p-1 rounded-lg text-[var(--modern-muted)] hover:text-[var(--modern-text)] hover:bg-[var(--modern-raised)] transition-colors'
              aria-label='Close sidebar'
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Segmented Switcher */}
        <div
          role='tablist'
          aria-label={t("Comments.activityAndFiles", "Collaboration")}
          className='flex p-1 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)]'
        >
          <button
            type='button'
            role='tab'
            id='tab-comments'
            aria-controls='panel-comments'
            aria-selected={activeTab === "comments"}
            onClick={() => setActiveTab("comments")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border-0 outline-none ${
              activeTab === "comments"
                ? "bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)] font-bold shadow-xs"
                : "text-[var(--modern-muted)] hover:text-[var(--modern-text)] bg-transparent"
            }`}
          >
            <MessageSquare size={14} className='shrink-0' />
            <span className='truncate'>{t("Comments.Comments", "Comments")}</span>
          </button>
          <button
            type='button'
            role='tab'
            id='tab-supporting'
            aria-controls='panel-supporting'
            aria-selected={activeTab === "supporting"}
            onClick={() => setActiveTab("supporting")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border-0 outline-none ${
              activeTab === "supporting"
                ? "bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)] font-bold shadow-xs"
                : "text-[var(--modern-muted)] hover:text-[var(--modern-text)] bg-transparent"
            }`}
          >
            <Paperclip size={14} className='shrink-0' />
            <span className='truncate'>{t("Comments.documents", "Documents")}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Comments Section */}
      {activeTab === "comments" && (
        <div id='panel-comments' role='tabpanel' aria-labelledby='tab-comments' className='flex-1 flex flex-col min-h-0 overflow-hidden'>
          {/* Scrollable Comments List */}
          <div className='flex-1 overflow-y-auto p-3 flex flex-col gap-2.5'>
            {renderCommentsList()}
          </div>

          {/* Add Comment Fixed Bottom Input */}
          {renderCommentInput()}
        </div>
      )}

      {/* Tab 2: Supporting Documents Section */}
      {activeTab === "supporting" && (
        <div id='panel-supporting' role='tabpanel' aria-labelledby='tab-supporting' className='flex-1 flex flex-col min-h-0 overflow-hidden'>
          {/* Action Header with Upload Button */}
          <div className='p-3 border-b border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col gap-2 shrink-0'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-xs font-bold text-[var(--modern-text)] m-0 truncate'>
                {t("addComment.supportingDocuments", "Supporting Documents")}
              </p>
              <p className='text-[11px] font-semibold text-[var(--modern-muted)] m-0 shrink-0'>
                {supportingDocs.length}{" "}
                {supportingDocs.length === 1
                  ? t("dashboardCardStatuses.document", "document")
                  : t("dashboardCardStatuses.documents", "documents")}
              </p>
            </div>

            {permissions?.canAddSupportingDocument !== false && (
              <button
                type='button'
                onClick={handleShowSupportingOffcanvas}
                className='w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--modern-primary,#4d8dff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer border-0 shadow-none'
              >
                <Plus size={13} />
                <span>{t("dashboardCardStatuses.AddSupportingDocs", "Add Docs")}</span>
              </button>
            )}
          </div>

          {/* Documents List */}
          <div className='flex-1 overflow-y-auto p-3 flex flex-col gap-2'>
            {renderSupportingList()}
          </div>
        </div>
      )}

      {/* Offcanvas Drawer for Uploading Supporting Documents */}
      <AddSupportingDocSignNow
        show={showSupportingCanvas}
        onClose={handleCloseSupportingOffcanvas}
        signAuth={signAuth}
        getSupportingDocs={getSupportingDocs}
        className='force-light-offcanvas'
      />

      {/* Delete Comment Modal */}
      <DeleteConfirmationModal
        show={showConfirmModal}
        onHide={handleCloseConfirmModal}
        title={t("Folder.deleteConfirmation")}
        subtitle={t("Comments.deleteComment")}
        warningText={t("uploadDocFlow.deleteComment")}
        itemTitle={t("Comments.comment")}
        itemName={
          (comments.find((c) => c.docCommentsID === deletingCommentId) || {})
            .comments || ""
        }
        onConfirm={() =>
          handleDeleteComment(deletingCommentId, commentToDeleteIndex)
        }
        confirmText={t("uploadDocFlow.delete")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIcon={<Icons.DeleteAction size={25} />}
        itemIcon={<Icons.Comments size={20} />}
        className='force-light-modal'
      />
    </div>
  );
};

export default Comments;
