import React, { useEffect, useCallback } from "react";
import "./Comments.css";
import { toast } from "react-toastify";
import verificationService from "@/services/verificationService";
import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { useTranslation } from "react-i18next";
import AddSupportingDocSignNow from "./AddSupportingDoc/AddSupportingDocSignNow";
import { Icons } from "@/assets/Icons";
import debounce from "lodash/debounce";

const Comments = ({
  registerSignID,
  signAuth,
  signatoryEmail,
  signatoryName,
  permissions,
}) => {
  const { t } = useTranslation();
  const [newComment, setNewComment] = useState("");
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
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
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
    if (!newComment || !newComment.trim()) {
      toast.error(t("addComment.enterValidValue"));
      return;
    }

    setIsSubmitting(true);

    const requestBody = {
      Comments: newComment,
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
        setDocCommentsIDs([...docCommentsIDs, response.data.response]);
        setNewComment("");
        toast.success(t("addComment.commentAdded"));

        try {
          await verificationService.createSignActivityVerification(
            {
              Status: t("addComment.newCommentAdded"),
              Message: `${signatoryName} ${t(
                "addComment.addedNewComment"
              )} [${newComment}]`,
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

  // ✅ Debounced version — fires immediately on first call, ignores subsequent calls within 500ms
  const debouncedAddComment = useCallback(
    debounce(addComment, 1000, { leading: true, trailing: false }),
    [newComment, signAuth, registerSignID]
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
    const updatedText = editedText;

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
        const allComments = response.data.response.docComments;
        setComments(allComments);
        setDocCommentsIDs(
          response.data.response.docComments.map(
            (comment) => comment.docCommentsID
          )
        );
        setSupportingDocs(response.data.response.supportingDocs);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (signAuth) {
      getSupportingDocs();
    }
  }, [signAuth]);

  // ✅ Cleanup debounce on unmount to avoid memory leaks
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
      downloadLink.download = doc.supportingDocName;
      downloadLink.click();

      try {
        await verificationService.createSignActivityVerification(
          {
            Status: "file downloaded",
            Message: `${signatoryName} downloaded ${doc.supportingDocName} file`,
          },
          signAuth
        );
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
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
    } catch (error) {
      console.log(error);
    }
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

  return (
    <>
      <h6 className="comments-heading">{t("Comments.Comments")}</h6>
      <div className="comment-section">
        <ListGroup className="comment-list">
          {comments.map((comment, index) => (
            <ListGroup.Item key={index} className="comment-body">
              {editingIndex === index ? (
                <>
                  <Form.Control
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (
                          editedText &&
                          editedText.trim() !== "" &&
                          editedText.trim() !==
                            (comments[index]?.comments || "").trim()
                        ) {
                          saveEditedComment(comment.docCommentsID);
                        }
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    className="comment-save-input"
                  />
                  <div className="d-flex gap-2 m-1">
                    <Button
                      variant="none"
                      className="py-1 px-2 applyBtn"
                      onClick={() => saveEditedComment(comment.docCommentsID)}
                      disabled={
                        !editedText ||
                        editedText.trim() === "" ||
                        editedText.trim() ===
                          (comments[index]?.comments || "").trim()
                      }
                    >
                      {t("addComment.save")}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      className="py-1 px-2 ImageCancelBtn"
                      onClick={cancelEdit}
                    >
                      {t("addComment.cancel")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="signature-comment-body">
                    <div className="comment-header mb-0 p-0 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: getAvatarColor(
                              comment.commentPostedBy || "no name"
                            ),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "700",
                            flexShrink: 0,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {getInitials(comment.commentPostedBy || "no name")}
                        </div>
                        <span>{comment.commentPostedBy || "no name"}</span>
                      </div>
                      {comment.createdBy === signatoryEmail ? (
                        <div>
                          <Button
                            variant="none"
                            className="action-button px-1 py-0"
                            onClick={() => toggleEdit(index)}
                          >
                            <Icons.PenEdit size={16} />
                          </Button>
                          <Button
                            variant="none"
                            className="action-button px-1 py-0"
                            onClick={() =>
                              handleShowConfirmModal(
                                docCommentsIDs[index],
                                index
                              )
                            }
                          >
                            <Icons.DeleteAction size={16} />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <div className="comment-text text-start m-0">
                      {comment.comments}
                    </div>
                    <small className="timestamp text-start">
                      {comment.createdDate}
                      <span className="mx-1"></span>
                      {comment.createdTime}
                      {comment.modifiedOn !== null && (
                        <span className="edited-label mx-2 fw-normal">
                          {t("addComment.edit")}
                        </span>
                      )}
                    </small>
                  </div>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>

        {permissions?.canAddComment && (
          <div className="d-flex align-items-center justify-content-between p-2">
            <InputGroup className="new-comment">
              <Form.Control
                type="text"
                placeholder={t("Comments.addCommentHere")}
                value={newComment}
                onChange={handleNewCommentChange}
                onKeyDown={handleNewCommentKeyDown}
                className="comment-input"
                disabled={isSubmitting} // ✅ prevent typing during submit
              />
            </InputGroup>
            <Button
              onClick={debouncedAddComment}
              className="comment-button mx-1"
              disabled={isSubmitting} // ✅ prevent clicking during submit
            >
              <Icons.Send size={18} />
            </Button>
          </div>
        )}
      </div>

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
        className="force-light-modal"
      />

      <div
        className="d-flex justify-content-between align-items-center"
        style={{ border: "1px solid #ccc" }}
      >
        <h6 className="m-0 py-3 ps-2 d-flex gap-2">
          {t("addComment.supportingDocuments")}
        </h6>
        <DropdownButton
          title=""
          id="doc-dropdown"
          variant="none"
          drop="down"
          align="end"
          container="parent"
        >
          <Dropdown.Item
            className="d-flex gap-2 align-items-center"
            onClick={() => {
              handleShowSupportingOffcanvas();
            }}
          >
            <Icons.Upload size={18} />
            {t("dashboardCardStatuses.AddSupportingDocs")}
          </Dropdown.Item>
        </DropdownButton>
      </div>

      <div className="supporting-docs">
        <div className="supporting-docs-list">
          {supportingDocs.map((doc, index) => (
            <div key={index} className="docs-name border-bottom d-flex">
              <p
                className="px-2 my-2 d-flex align-items-center flex-grow-1"
                style={{ minWidth: 0, overflow: "hidden" }}
              >
                <span style={{ flexShrink: 0 }}>{index + 1} -&nbsp;</span>
                <span className="text-truncate" title={doc.supportingDocName}>
                  {doc.supportingDocName}
                </span>
              </p>
              <DropdownButton title="" id="doc-dropdown" variant="none">
                {permissions && permissions.isAllowTransfer && (
                  <Dropdown.Item
                    className="d-flex justify-content-start align-items-center gap-2"
                    onClick={() => handleFileDownload(doc)}
                  >
                    <Icons.DownloadAction size={16} />
                    {t("addComment.download")}
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  className="d-flex justify-content-start align-items-center gap-2"
                  onClick={() => handleFileview(doc)}
                >
                  <Icons.View size={16} />
                  {t("addComment.view")}
                </Dropdown.Item>
              </DropdownButton>
            </div>
          ))}
        </div>
      </div>

      <AddSupportingDocSignNow
        show={showSupportingCanvas}
        onClose={handleCloseSupportingOffcanvas}
        signAuth={signAuth}
        getSupportingDocs={getSupportingDocs}
        className="force-light-offcanvas"
      />
    </>
  );
};

export default Comments;
