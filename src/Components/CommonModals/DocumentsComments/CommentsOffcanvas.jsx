import React, { useState, useRef, useEffect } from "react";
import { Offcanvas, Button } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { Send, Pencil, Trash2, MessageSquare, Loader2, X } from "lucide-react";

export const CommentsOffcanvas = ({
  show = false,
  onHide,
  registerSignID,
  comments = [],
  isLoading = false,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (show && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 250);
    }
  }, [show]);

  const getInitials = (email, name) => {
    if (name) {
      return name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }
    if (email) {
      const part = email.split("@")[0] || "";
      return part.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getAvatarBg = (email) => {
    const colors = [
      "#6366f1",
      "#8b5cf6",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#3b82f6",
      "#14b8a6",
    ];
    const hash = (email || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const requestBody = {
      Comments: trimmed,
      AdhockUserID: process.env.REACT_APP_STATIC_ADHOCK_USER_ID,
      CommentPostedBy: user?.fullName || "User",
      CreatedBy: user?.email || "",
      MasterDocID: null,
      RegisterSignID: registerSignID,
    };

    try {
      const response = await uploadFlowService.createDocComments(requestBody);
      if (response?.status === 200 || response?.data?.statusCode === "1") {
        setNewComment("");
        toast.success(t("uploadDocFlow.commentAdded") || "Comment added successfully");
        if (onRefresh) onRefresh();
      } else {
        toast.error(t("uploadDocFlow.failedToAdd") || "Failed to add comment");
      }
    } catch (err) {
      console.error("Add comment error:", err);
      toast.error(t("uploadDocFlow.failedToAdd") || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingId(comment.docCommentsID);
    setEditedText(comment.comments || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedText("");
  };

  const handleSaveEdit = async (id) => {
    const trimmed = editedText.trim();
    if (!trimmed || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const response = await uploadFlowService.updateDocComments({
        DocCommentsID: id,
        Comments: trimmed,
      });

      if (response?.status === 200 || response?.data?.statusCode === "1") {
        toast.success(t("uploadDocFlow.commentUpdate") || "Comment updated");
        setEditingId(null);
        setEditedText("");
        if (onRefresh) onRefresh();
      } else {
        toast.error(t("uploadDocFlow.failedToUpdate") || "Failed to update comment");
      }
    } catch (err) {
      console.error("Update comment error:", err);
      toast.error(t("uploadDocFlow.failedToUpdate") || "Failed to update comment");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingId) return;

    try {
      const response = await uploadFlowService.deleteDocComments({
        DocCommentsID: deletingId,
      });

      if (response?.status === 200 || response?.data?.statusCode === "1") {
        toast.success(t("uploadDocFlow.commentDeleted") || "Comment deleted");
        if (onRefresh) onRefresh();
      } else {
        toast.error(t("uploadDocFlow.failedTodelete") || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Delete comment error:", err);
      toast.error(t("uploadDocFlow.failedTodelete") || "Failed to delete comment");
    } finally {
      setShowConfirmModal(false);
      setDeletingId(null);
    }
  };

  const deletingCommentItem = comments.find((c) => c.docCommentsID === deletingId);

  return (
    <>
      <Offcanvas
        show={show}
        onHide={onHide}
        placement={isRtl ? "start" : "end"}
        className='comments-offcanvas border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] w-full max-w-md shadow-none'
      >
        {/* Modern Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-[var(--modern-border)] bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-primary)] shrink-0'>
              <MessageSquare size={18} />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='text-base font-semibold text-[var(--modern-text)] m-0 leading-tight'>
                  {t("Comments.allComments") || "Comments & Discussion"}
                </h3>
                {comments.length > 0 && (
                  <span className='px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--modern-raised)] text-[var(--modern-muted)] border border-[var(--modern-border)]'>
                    {comments.length}
                  </span>
                )}
              </div>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                {t("Comments.subTitle") || "Notes and updates on this document"}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onHide}
            aria-label='Close comments'
            className='w-8 h-8 rounded-lg flex items-center justify-center text-[var(--modern-muted)] hover:text-[var(--modern-text)] hover:bg-[var(--modern-raised)] border border-transparent transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* Comment Stream Body */}
        <div className='flex-1 overflow-y-auto p-4 md:p-5 space-y-3.5 custom-table-scrollbar'>
          {isLoading && (
            <div className='flex flex-col items-center justify-center py-16 gap-3 text-[var(--modern-muted)]'>
              <Loader2 size={24} className='animate-spin text-[var(--modern-primary)]' />
              <span className='text-xs font-medium'>
                {t("Comments.loading") || "Loading discussion..."}
              </span>
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 px-4 text-center space-y-3'>
              <div className='w-12 h-12 rounded-2xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-muted)]'>
                <MessageSquare size={22} />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-semibold text-[var(--modern-text)] m-0'>
                  {t("Comments.noComments") || "No comments yet"}
                </p>
                <p className='text-xs text-[var(--modern-muted)] m-0 max-w-xs'>
                  {t("Comments.startConversation") ||
                    "Leave a note, question, or update for collaborators on this document."}
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            comments.map((comment, index) => {
              const isEditing = editingId === comment.docCommentsID;
              const isOwner = comment.createdBy === user?.email;
              const avatarColor = getAvatarBg(comment.createdBy || user?.email);
              const initials = getInitials(
                comment.createdBy || user?.email,
                comment.commentPostedBy || comment.fullName || user?.fullName
              );

              return (
                <div
                  key={comment.docCommentsID || index}
                  className='p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] transition-colors'
                >
                  {isEditing ? (
                    // Inline Edit Form
                    <div className='space-y-2.5'>
                      <textarea
                        rows={3}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className='w-full p-2.5 text-sm rounded-lg bg-[var(--modern-card)] border border-[var(--modern-border)] text-[var(--modern-text)] focus:border-[var(--modern-primary)] focus:outline-none resize-none'
                        placeholder={t("Comments.addCommentHere") || "Edit your comment..."}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveEdit(comment.docCommentsID);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            handleCancelEdit();
                          }
                        }}
                      />
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={handleCancelEdit}
                          disabled={isSavingEdit}
                          className='px-3 py-1 text-xs'
                        >
                          {t("uploadDocFlow.cancel") || "Cancel"}
                        </Button>
                        <Button
                          variant='default'
                          size='sm'
                          onClick={() => handleSaveEdit(comment.docCommentsID)}
                          disabled={isSavingEdit || !editedText.trim()}
                          className='px-3 py-1 text-xs bg-[var(--modern-primary)] text-white'
                        >
                          {isSavingEdit ? (
                            <Loader2 size={13} className='animate-spin' />
                          ) : (
                            t("addComment.save") || "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Standard Comment View
                    <div className='space-y-2'>
                      {/* Comment Header */}
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex items-center gap-2.5 min-w-0'>
                          <div
                            className='w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0'
                            style={{ backgroundColor: avatarColor }}
                          >
                            {initials}
                          </div>
                          <div className='min-w-0'>
                            <div className='text-xs font-semibold text-[var(--modern-text)] truncate'>
                              {comment.commentPostedBy || comment.fullName || user?.fullName || "User"}
                            </div>
                            <div className='text-[10px] text-[var(--modern-muted)] truncate'>
                              {comment.createdBy || user?.email}
                            </div>
                          </div>
                        </div>

                        {/* Owner Actions */}
                        {isOwner && (
                          <div className='flex items-center gap-1 shrink-0'>
                            <button
                              type='button'
                              onClick={() => handleStartEdit(comment)}
                              className='p-1 rounded-md text-[var(--modern-muted)] hover:text-[var(--modern-text)] hover:bg-[var(--modern-card)] transition-colors'
                              title={t("addComment.edit") || "Edit"}
                              aria-label='Edit comment'
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type='button'
                              onClick={() => {
                                setDeletingId(comment.docCommentsID);
                                setShowConfirmModal(true);
                              }}
                              className='p-1 rounded-md text-[var(--modern-muted)] hover:text-rose-500 hover:bg-[var(--modern-card)] transition-colors'
                              title={t("uploadDocFlow.delete") || "Delete"}
                              aria-label='Delete comment'
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Comment Content */}
                      <p className='text-xs md:text-sm text-[var(--modern-text)] leading-relaxed m-0 whitespace-pre-wrap break-words pl-9.5'>
                        {comment.comments}
                      </p>

                      {/* Footer Timestamps */}
                      <div className='flex items-center gap-2 text-[10px] text-[var(--modern-muted)] pl-9.5'>
                        <span>{comment.createdDate}</span>
                        {comment.createdTime && <span>{comment.createdTime}</span>}
                        {comment.modifiedOn && (
                          <span className='italic text-[10px] text-[var(--modern-muted)]'>
                            ({t("addComment.edit") || "edited"})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          <div ref={commentsEndRef} />
        </div>

        {/* Sticky Input Footer */}
        <div className='p-3.5 md:p-4 border-t border-[var(--modern-border)] bg-[var(--modern-card)]'>
          <div className='flex items-end gap-2 p-1.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] focus-within:border-[var(--modern-primary)] transition-colors'>
            <textarea
              ref={textareaRef}
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("Comments.addCommentHere") || "Write a comment..."}
              className='flex-1 p-1.5 text-xs md:text-sm bg-transparent border-0 text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none resize-none'
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button
              type='button'
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
              className='p-2 rounded-lg bg-[var(--modern-primary)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0'
              aria-label='Send comment'
            >
              {isSubmitting ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Send size={16} style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
              )}
            </Button>
          </div>
          <p className='text-[10px] text-[var(--modern-muted)] m-0 mt-1.5 text-center'>
            {t("Comments.pressEnter") || "Press Enter to submit, Shift+Enter for new line"}
          </p>
        </div>
      </Offcanvas>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setDeletingId(null);
        }}
        title={t("Folder.deleteConfirmation") || "Delete Comment"}
        subtitle={t("Comments.deleteComment") || "Are you sure you want to delete this comment?"}
        warningText={t("uploadDocFlow.deleteComment") || "This action cannot be undone."}
        itemTitle={t("Comments.comment") || "Comment"}
        itemName={deletingCommentItem?.comments || ""}
        onConfirm={handleDeleteComment}
        confirmText={t("uploadDocFlow.delete") || "Delete"}
        cancelText={t("uploadDocFlow.cancel") || "Cancel"}
        headerIcon={<Trash2 size={20} className='text-rose-500' />}
        itemIcon={<MessageSquare size={22} className='text-[var(--modern-muted)]' />}
      />
    </>
  );
};

export default CommentsOffcanvas;
