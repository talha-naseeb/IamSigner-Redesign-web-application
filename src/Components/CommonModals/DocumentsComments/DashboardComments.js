import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import { Button, Form, InputGroup, ListGroup, Offcanvas } from "react-bootstrap";
import { useUser } from "@/Context/UserContext";
import "./DashboardComments.css";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import uploadFlowService from "@/services/uploadFlowService";

const DashboardComments = ({ registerSignID }) => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedText, setEditedText] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const { user } = useUser();
  const handleCloseOffcanvas = () => setShowOffcanvas(false);

  const handleComments = () => {
    setShowOffcanvas(true);
  };

  // Function to get initials from email or name
  const getInitials = (email, name) => {
    if (name) {
      // If name is available, use name initials
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    } else if (email) {
      // If only email is available, use email initials
      const emailPart = email.split("@")[0];
      if (emailPart.includes(".")) {
        return emailPart
          .split(".")
          .map((part) => part.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("");
      } else {
        return emailPart.substring(0, 2).toUpperCase();
      }
    }
    return "U"; // Default fallback
  };

  // Function to generate avatar color based on email
  const getAvatarColor = (email) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];
    const hash = email ? email.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    return colors[hash % colors.length];
  };

  // new comment input handlers
  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleNewCommentKeyDown = (e) => {
    // prevent parent/global handlers (e.g., Offcanvas) from interfering with Space
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!newComment || newComment.trim() === "") return;
      addComment();
    }
  };

  const addComment = async () => {
    if (!newComment) {
      return;
    }

    const requestBody = {
      Comments: newComment,
      AdhockUserID: process.env.REACT_APP_STATIC_ADHOCK_USER_ID,
      CommentPostedBy: user.fullName,
      CreatedBy: user.email,
      MasterDocID: null,
      RegisterSignID: registerSignID,
    };

    setIsLoading(true);

    try {
      const response = await uploadFlowService.createDocComments(requestBody);
      if (response.status === 200) {
        getComments();
        setNewComment("");
        setIsLoading(false);
        toast.success(t("uploadDocFlow.commentAdded"));
      } else {
        setIsLoading(false);
        toast.error(t("uploadDocFlow.failedToAdd"));
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("uploadDocFlow.failedToAdd"));
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

  const saveEditedComment = async (id) => {
    const updatedText = editedText;

    const requestBody = {
      DocCommentsID: id,
      Comments: updatedText,
    };

    setIsLoading(true);
    try {
      const response = await uploadFlowService.updateDocComments(requestBody);

      if (response.status === 200) {
        const updatedComments = [...comments];
        const index = updatedComments.findIndex((comment) => comment.docCommentsID === id);

        if (index !== -1) {
          updatedComments[index].comments = updatedText;

          setComments(updatedComments);
          setEditingIndex(-1);
        }
        toast.success(t("uploadDocFlow.commentUpdate"));
        setIsLoading(false);
      } else {
        toast.error(t("uploadDocFlow.failedToUpdate"));
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("uploadDocFlow.failedToUpdate"));
    }
  };

  const getComments = () => {
    setIsLoading(true);
    try {
      uploadFlowService.getDocComments(registerSignID).then((response) => {
        if (response.status === 200) {
          setComments(response.data.response);
        }
        setIsLoading(false);
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getComments();
  }, []);

  // comments delete confirmation modal
  const handleShowConfirmModal = (docCommentsID) => {
    setDeletingCommentId(docCommentsID);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleDeleteComment = async (docCommentsID) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.deleteDocComments({ DocCommentsID: docCommentsID });

      if (response.status === 200) {
        const updatedComments = [...comments];

        setComments(updatedComments.filter((comment) => comment.docCommentsID !== docCommentsID));
        setIsLoading(false);
        toast.success(t("uploadDocFlow.commentDeleted"));
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("uploadDocFlow.failedTodelete"));
    } finally {
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <div className='d-flex gap-2 align-items-center' onClick={() => handleComments()}>
        <Icons.Comments size={22} />
        <span>{t("Comments.Comments")}</span>
      </div>

      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("Comments.allComments")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='commentsOffcanvas'>
          <div className=''>
            <ListGroup className='comment-list overflow-y-scroll' style={{ height: "75vh" }}>
              {comments.map((comment, index) => (
                <ListGroup.Item key={comment.docCommentsID} className='comment-body'>
                  {editingIndex === index ? (
                    // Editing mode
                    <>
                      <Form.Control
                        as='textarea'
                        rows={3}
                        value={editedText}
                        placeholder={t("Comments.addCommentHere")}
                        onChange={(e) => setEditedText(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (editedText && editedText.trim() !== "" && editedText.trim() !== (comments[index]?.comments || "").trim()) {
                              saveEditedComment(comment.docCommentsID);
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        className='comment-save-input mb-2'
                      />
                      <div className='d-flex align-items-center justify-content-between'>
                        <div className='d-flex gap-2'>
                          <Button variant='none' className='ImageCancelBtn' onClick={cancelEdit} disabled={isLoading}>
                            {t("uploadDocFlow.cancel")}
                          </Button>
                          <Button
                            variant='none'
                            className='ImageDoneBtn'
                            onClick={() => saveEditedComment(comment.docCommentsID)}
                            disabled={isLoading || !editedText || editedText.trim() === "" || editedText.trim() === (comments[index]?.comments || "").trim()}
                          >
                            {t("addComment.save")}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Viewing mode
                    <>
                      <div className='signature-comment-body'>
                        <div className='comment-header mb-0 p-0 d-flex align-items-center justify-content-between'>
                          <div className='d-flex align-items-center gap-2'>
                            <div
                              className='avatar-circle d-flex align-items-center justify-content-center'
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: getAvatarColor(comment.createdBy || user.email),
                                color: "white",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {getInitials(comment.createdBy || user.email, comment.commentPostedBy || user.fullName)}
                            </div>
                            <div className='user-info'>
                              <div className='user-name fw-semibold' style={{ fontSize: "14px" }}>
                                {comment.fullName || user.fullName}
                              </div>
                              <div className='user-email text-muted' style={{ fontSize: "12px" }}>
                                {comment.createdBy || user.email}
                              </div>
                            </div>
                          </div>
                          {comment.createdBy === user.email ? (
                            // Not in editing mode
                            <div>
                              <Button variant='none' style={{color:"var(--text-primary)"}} className='action-button px-1 py-0' onClick={() => toggleEdit(index)}>
                                <Icons.PenEdit size={16} />
                              </Button>
                              <Button variant='none' style={{color:"var(--text-primary)"}} className='action-button px-1 py-0' onClick={() => handleShowConfirmModal(comment.docCommentsID)}>
                                <Icons.DeleteAction size={16} color='#dc3545' />
                              </Button>
                            </div>
                          ) : // In editing mode
                          null}
                        </div>
                        <div className='comment-text text-start m-0'>{comment.comments}</div>
                        <small className='timestamp text-start'>
                          {comment.createdDate}
                          <span className='mx-1'></span>
                          {comment.createdTime}
                          {comment.modifiedOn !== null && <span className='edited-label mx-2 fw-normal'>{t("addComment.edit")}</span>}
                        </small>
                      </div>
                    </>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>

            <DeleteConfirmationModal
              show={showConfirmModal}
              onHide={handleCloseConfirmModal}
              title={t("Folder.deleteConfirmation")}
              subtitle={t("Comments.deleteComment")}
              warningText={t("uploadDocFlow.deleteComment")}
              itemTitle={t("Comments.comment")}
              itemName={(comments.find((c) => c.docCommentsID === deletingCommentId) || {}).comments || ""}
              onConfirm={() => handleDeleteComment(deletingCommentId)}
              confirmText={t("uploadDocFlow.delete")}
              cancelText={t("uploadDocFlow.cancel")}
              headerIcon={<Icons.DeleteAction size={20} color='#dc3545' />}
              itemIcon={<Icons.Comments size={25} />}
            />
          </div>

          <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
            <InputGroup className='new-comment'>
              <Form.Control
                type='text'
                placeholder={t("Comments.addCommentHere")}
                value={newComment}
                onChange={handleNewCommentChange}
                onKeyDown={handleNewCommentKeyDown}
                className='comment-input py-2'
              />
            </InputGroup>
            <Button onClick={addComment} className='comment-button ms-1 py-2 d-flex align-items-center justify-content-center'>
              <Icons.Send size={20} />
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default DashboardComments;
