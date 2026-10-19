import React, { useState, useEffect } from "react";
import { Form, Col, Button, Container, InputGroup, ListGroup, Modal, Row, Dropdown, Accordion } from "react-bootstrap";
import { useUser } from "@/Context/UserContext";
import "./Thirdstep.css";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import { useNavigate } from "react-router-dom";
import CCEmail from "./CCEmail";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Loader from "@/Components/CommonModals/Loader/Loader";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import FolderSelection from "./FolderSelection";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";
import { startOfToday } from "date-fns";

const Thirdstep = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();

  const storedRegisterSignID = localStorage.getItem("registerSignID");
  const navigate = useNavigate();
  const [selectedFolderID, setSelectedFolderID] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState("");
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedText, setEditedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [docCommentsIDs, setDocCommentsIDs] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileModal, setFileModal] = useState(false);
  const [commentToDeleteIndex, setCommentToDeleteIndex] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [supportingDocIDs, setSupportingDocIDs] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [deletingSupportingDocID, setDeletingSupportingDocID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [documentPath, setDocumentPath] = useState(null);
  const [isSupported, setIsSupported] = useState();
  const { user, userAccess } = useUser();
  const [initialPermissions, setInitialPermissions] = useState(null);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    AllSignatories: false,
    InitiatorOnly: false,
    OwnSignatureOnly: true,
    NoNotifications: false,
  });

  const handleNotificationChange = (key) => {
    setNotificationSettings({
      AllSignatories: false,
      InitiatorOnly: false,
      OwnSignatureOnly: false,
      NoNotifications: false,
      [key]: true,
    });
  };

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
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];
    const index = (name || "").length % colors.length;
    return colors[index];
  };

  const handleSelectFolder = (folderID, folderName) => {
    setSelectedFolderID(folderID);
    setSelectedFolderName(folderName);
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await uploadFlowService.getRegisterSignPermission();
        if (response.status === 200 && response.data.response) {
          setInitialPermissions(response.data.response);
        }
      } catch (error) {
        console.error("Failed to fetch permissions", error);
      }
    };

    fetchPermissions();
  }, []);

  // Fetch Notification Settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await uploadFlowService.getRegisterSignNotificationSetting();
        if (response.status === 200 && response.data.response) {
          const settings = response.data.response;

          // Check if all notification settings are false or null
          const allFalseOrNull = !settings.allSignatories && !settings.initiatorOnly && !settings.ownSignatureOnly && !settings.noNotifications;

          // If all are false or null, set OwnSignatureOnly as default
          if (allFalseOrNull) {
            setNotificationSettings({
              AllSignatories: false,
              InitiatorOnly: false,
              OwnSignatureOnly: true,
              NoNotifications: false,
            });
          } else {
            // Use the fetched settings
            setNotificationSettings({
              AllSignatories: settings.allSignatories || false,
              InitiatorOnly: settings.initiatorOnly || false,
              OwnSignatureOnly: settings.ownSignatureOnly || false,
              NoNotifications: settings.noNotifications || false,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch notification settings", error);
        // On error, keep the default OwnSignatureOnly: true
      }
    };

    fetchNotificationSettings();
  }, []);

  const { register, watch, reset, setValue } = useForm({
    defaultValues: {
      IsAllowTransfer: true,
      IsAllowDeclined: true,
      IsAllowPrint: false,
      IsAllowDownload: true,
      IsAttachCompletedDoc: true,
      CanAddComment: true,
      CanAddSupportingDocument: true,
      CanDownloadAuditTrail: true,
      IsAttachAuditTrialDoc: true,
      SetReminderBefore1Day: false,
      AutoReminderInDays: "",
      SetExpiryDate: "",
    },
  });

  useEffect(() => {
    if (initialPermissions) {
      reset({
        IsAllowTransfer: initialPermissions.isAllowTransfer,
        IsAllowDeclined: initialPermissions.isAllowDeclined,
        IsAllowPrint: initialPermissions.isAllowPrint,
        IsAllowDownload: initialPermissions.isAllowDownload,
        IsAttachCompletedDoc: initialPermissions.isAttachCompletedDoc,
        CanAddComment: initialPermissions.canAddComment,
        CanAddSupportingDocument: initialPermissions.canAddSupportingDocument,
        CanDownloadAuditTrail: initialPermissions.canDownloadAuditTrail,
        IsAttachAuditTrialDoc: initialPermissions.isAttachAuditTrialDoc,
        SetReminderBefore1Day: initialPermissions.setReminderBefore1Day,
        AutoReminderInDays: initialPermissions.autoReminderInDays || "",
        SetExpiryDate: "",
        // add other fields as needed
      });
    }
  }, [initialPermissions, reset]);

  const expiryDate = watch("SetExpiryDate");

  const handleDateChange = (date) => {
    if (date) {
      setValue("SetExpiryDate", date.format("YYYY-MM-DD"));
    } else {
      setValue("SetExpiryDate", "");
    }
  };

  const dateValue = expiryDate ? new DateObject(expiryDate) : null;

  const handleFileUpload = async (files) => {
    const allowedFormats = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/plain",
    ];

    const newFiles = Array.from(files);

    const allowedFiles = newFiles.filter((file) => allowedFormats.includes(file.type));

    if (allowedFiles.length === 0) {
      setErrorMessage(t("uploadDocFlow.fileFormatSupport"));
      setIsLoading(false);
    } else {
      setErrorMessage("");
      const base64Files = [];
      for (const file of allowedFiles) {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64Data = e.target.result.split(",")[1];
          base64Files.push({
            name: file.name,
            base64: base64Data,
            MasterDocID: null,
          });

          if (base64Files.length === allowedFiles.length) {
            const uploadedFileNames = uploadedFiles.map((fileName) => fileName);

            const duplicateFiles = base64Files.filter((allowedfile) => uploadedFileNames.includes(allowedfile.name));

            if (duplicateFiles.length > 0) {
              setErrorMessage(t("uploadDocFlow.filewithSameNameExits"));
              toast.error(t("uploadDocFlow.filewithSameNameExits"));
              setIsLoading(false);
            } else {
              const fileExtension = file.name.split(".").pop();

              const requestBody = {
                CreatedBy: user.email,
                registerSignID: storedRegisterSignID,
                MasterDocID: null,
                SupportingDocName: file.name,
                SupportingDocExtension: fileExtension,
                SupportingDocFile: base64Data,
              };

              setIsLoading(true);
              try {
                const response = await uploadFlowService.uploadSupportingDoc(requestBody);

                if (response.data.successStatus) {
                  setUploadedFiles([...uploadedFiles, ...base64Files.map((allowFile) => allowFile.name)]);

                  setSupportingDocIDs((prevIDs) => [...prevIDs, response.data.response.supportingDocID]);
                  toast.success(t("uploadDocFlow.DocUploadedsuccess"));
                  setIsLoading(false);
                } else {
                  toast.error(t("uploadDocFlow.failedUpload"));
                  setIsLoading(false);
                }
              } catch (error) {
                toast.error(t("uploadDocFlow.failedUpload"));
                setIsLoading(false);
              }
            }
          }
        };

        reader.readAsDataURL(file);

        reader.onerror = (error) => {
          setIsLoading(false);
        };
      }
    }
  };

  useEffect(() => {}, [uploadedFiles, supportingDocIDs, userAccess]);

  useEffect(() => {
    setIsLoading(true);
    uploadFlowService
      .getSupportingDocs(storedRegisterSignID)
      .then((response) => {
        if (response.status === 200) {
          if (Array.isArray(response.data.response)) {
            const uploadedDocs = response.data.response.map((doc) => doc.supportingDocName);
            setUploadedFiles(uploadedDocs);

            const supportingID = response.data.response.map((doc) => doc.supportingDocID);
            setSupportingDocIDs(supportingID);
          }
        }
      })
      .catch((error) => {
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate, storedRegisterSignID]);

  const handleFileview = async (supportingDocID) => {
    try {
      const response = await uploadFlowService.getSingleSupportingDoc(supportingDocID);

      setDocumentPath(response.data.response.supportingDocPath);
      const documentExtension = response.data.response.supportingDocPath.split(".").pop(); // Extract the extension

      if (documentExtension === "docx" || documentExtension === "xlsx" || documentExtension === "ppt") {
        setIsSupported(false);
      } else {
        setIsSupported(true);
      }

      setShowModal(true);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDownload = (file) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = file;
    downloadLink.download = "file";
    downloadLink.click();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDocumentPath("");
  };

  const DeleteFileModal = (supportingDocID, index) => {
    setDeletingSupportingDocID(supportingDocID);
    setDeletingIndex(index);
    setFileModal(true);
  };

  useEffect(() => {}, [deletingIndex, deletingSupportingDocID]);

  const handleFileCloseModal = () => {
    setFileModal(false);
  };

  const handleFileDelete = async (supportingDocID, index) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.deleteSupportingDoc({
        SupportingDocID: supportingDocID,
      });

      if (response.data.successStatus) {
        // Remove the file at the specified index from the frontend state
        const updatedUploadedFiles = [...uploadedFiles];
        updatedUploadedFiles.splice(index, 1);
        setUploadedFiles(updatedUploadedFiles);

        // Remove the corresponding masterDocID from the frontend state
        const updatedsupportingDocIDs = [...supportingDocIDs];
        updatedsupportingDocIDs.splice(index, 1);
        setSupportingDocIDs(updatedsupportingDocIDs);

        setIsLoading(false);
      }

      toast.success(t("uploadDocFlow.fileDeleted"));
    } catch (error) {
      toast.error(t("uploadDocFlow.errdeleteFile"));
      setIsLoading(false);
    } finally {
      handleFileCloseModal();
      setIsLoading(false);
    }
  };

  // comment section - improved handlers for robust key behavior
  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleNewCommentKeyDown = (e) => {
    // Avoid parent/global handlers eating Space or Enter
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!newComment || newComment.trim() === "") {
        toast.error(t("uploadDocFlow.enterComment"));
        return;
      }
      setErrorMessage("");
      addComment();
    }
  };

  const addComment = async () => {
    if (!newComment) {
      toast.error(t("uploadDocFlow.enterComment"));
      return;
    }

    setErrorMessage("");
    const requestBody = {
      Comments: newComment,
      AdhockUserID: process.env.REACT_APP_STATIC_ADHOCK_USER_ID,
      CommentPostedBy: user.fullName,
      CreatedBy: user.email,
      MasterDocID: null,
      RegisterSignID: storedRegisterSignID,
    };

    setIsLoading(true);

    try {
      const response = await uploadFlowService.createDocComments(requestBody);
      if (response.status === 200) {
        const currentDate = new Date();
        setComments([
          ...comments,
          {
            text: newComment,
            time: `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`,
            date: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`,
            edited: false,
          },
        ]);
        setDocCommentsIDs([...docCommentsIDs, response.data.response]);

        setNewComment("");
        setIsLoading(false);
        toast.success(t("uploadDocFlow.commentAdded"));
      } else {
        setIsLoading(false);
        toast.error(t("uploadDocFlow.failedToAdd"));
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (docCommentsID, index) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.deleteDocComments({ DocCommentsID: docCommentsID });

      if (response.status === 200) {
        const updatedComments = [...comments];
        updatedComments.splice(index, 1);
        const updatedDocCommentsIDs = [...docCommentsIDs];
        updatedDocCommentsIDs.splice(index, 1);
        setComments(updatedComments);
        setDocCommentsIDs(updatedDocCommentsIDs);
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

  const toggleEdit = (index) => {
    setEditingIndex(index);
    setEditedText(comments[index].text);
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditedText("");
  };

  const saveEditedComment = async (index) => {
    const docCommentsID = docCommentsIDs[index];
    const updatedText = editedText;

    const requestBody = {
      DocCommentsID: docCommentsID,
      Comments: updatedText,
    };

    setIsLoading(true);
    try {
      const response = await uploadFlowService.updateDocComments(requestBody);

      if (response.status === 200) {
        const updatedComments = [...comments];
        updatedComments[index].text = updatedText;
        updatedComments[index].edited = true;
        updatedComments[index].timestamp = new Date().toLocaleString();
        setComments(updatedComments);
        setEditingIndex(-1);
        setIsLoading(false);
        toast.success(t("uploadDocFlow.commentUpdate"));
      } else {
        toast.error(t("uploadDocFlow.failedToUpdate"));
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    uploadFlowService
      .getDocComments(storedRegisterSignID)
      .then((response) => {
        if (response.status === 200) {
          const responseData = response.data.response;
          const allComments = responseData.map((comment) => ({
            text: comment.comments,
            date: comment.createdDate,
            time: comment.createdTime,
            edited: comment.modifiedOn ? true : false,
          }));
          setComments(allComments);
          setDocCommentsIDs(responseData.map((comment) => comment.docCommentsID));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate, storedRegisterSignID, t]);

  // comments delete confirmation modal
  const handleShowConfirmModal = (docCommentsID, index) => {
    setDeletingCommentId(docCommentsID);
    setCommentToDeleteIndex(index);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  // send and sign button modalss
  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const openSuccessModal = () => {
    setIsSuccessModalOpen(true);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    localStorage.clear();
    navigate("/home");
  };

  const handleYesButton = async () => {
    const formData = watch();

    // Call the Notification Api
    await sendNotificationSettings();

    // Call the API to send the custom message
    await sendCustomMessage(formData);

    closeConfirmationModal();
    setIsLoading(true);

    const requestBody = {
      RegisterSignID: storedRegisterSignID,
      MasterDocID: process.env.React_APP_STATIC_MASTERDOC_ID,
      SignatoriesID: process.env.React_APP_STATIC_SIGNATORIES_ID,
      ActivityStatus: "GenerateLink",
      Remarks: "Remarks",
    };

    try {
      const response = await uploadFlowService.sendAndSign(requestBody);

      if (response.data.successStatus) {
        openSuccessModal();
        setIsLoading(false);
      }

      if (response.data.response.isSuccess) {
        const StepData = {
          SignWorkFlowActivityName: "EmailSent",
          SignWorkFlowActivityRef: "",
          SignWorkFlowActivityClass: "RED",
          RegisterSignID: storedRegisterSignID,
          IsMobile: false,
        };

        try {
          setIsLoading(true);
          await uploadFlowService.createWorkflowActivity(StepData);
          setCompletedSteps((prevSteps) => [...prevSteps, 4]);

          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something wrong. Try later");

      if (error?.response?.data?.statusCode === 2 || error?.response?.data?.statusCode === 4) {
        sessionStorage.removeItem("token");
        localStorage.clear();
        setIsLoading(false);
        navigate("/");
        toast.info(t("uploadDocFlow.sessionExpire"));
      }
    }
  };

  const handleBack = async () => {
    const StepData = {
      SignWorkFlowActivityName: "Place Signatories",
      SignWorkFlowActivityRef: "2",
      SignWorkFlowActivityClass: "RED",
      RegisterSignID: storedRegisterSignID,
      IsMobile: false,
    };

    try {
      setIsLoading(true);
      const response = await uploadFlowService.createWorkflowActivity(StepData);

      setIsLoading(false);

      if (response.data.successStatus) {
        setActiveStep(3);
        setCompletedSteps([1, 2]);
      } else {
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx",
    onDrop: handleFileUpload,
    multiple: true,
  });

  // Send Notification Settings
  const sendNotificationSettings = async () => {
    const registerSignId = localStorage.getItem("registerSignID");
    if (!registerSignId) return;

    try {
      await uploadFlowService.upsertRegisterSignNotificationSetting({
        RegisterSignID: registerSignId,
        ...notificationSettings,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Send Custom Message

  const sendCustomMessage = async (data) => {
    setIsLoading(true);
    const registerSignId = localStorage.getItem("registerSignID");

    try {
      const apiBody = {
        RegisterSignID: registerSignId || null,
        CompletedFolderID: selectedFolderID || null,
        IsAllowTransfer: data.IsAllowTransfer || false,
        IsAllowPrint: data.IsAllowPrint || false,
        IsAllowDownload: data.IsAllowDownload || false,
        IsAllowDeclined: data.IsAllowDeclined || false,
        IsAttachAuditTrialDoc: data.IsAttachAuditTrialDoc || false,
        IsAttachCompletedDoc: data.IsAttachCompletedDoc || false,
        CanAddComment: data.CanAddComment || false,
        CanAddSupportingDocument: data.CanAddSupportingDocument || false,
        CanDownloadAuditTrail: data.CanDownloadAuditTrail || false,
        SetReminderBefore1Day: data.SetReminderBefore1Day || false,
        SetExpiryDate: data.SetExpiryDate ? data.SetExpiryDate : null,
        AutoReminderInDays: data.AutoReminderInDays || null,
        CustomSubject: data.CustomSubject || null,
        CustomEmailMessage: data.CustomEmailMessage || null,
      };

      const response = await uploadFlowService.upsertRegisterSignPermission(apiBody);
      if (response.data.statusCode === "1") {
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add custom message !");
    } finally {
      setIsLoading(false);
    }
  };

  const currentDateExpiry = new Date().toISOString().split("T")[0];

  return (
    <Container className='upload-container-thirdStep'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      <div className='upload_body' id='part_one'>
        <div>
          {userAccess.supportDocs === true ? (
            <>
              <div style={{ marginTop: "1rem" }}>
                <Row>
                  <Col>
                    <div className='uplad_box'>
                      <Form.Group controlId='file-input-add' className='file-upload_temp'>
                        <div {...getRootProps({ className: "dropzoneUploadFile" })}>
                          <input {...getInputProps()} className='temp_file-input-additional d-none' />
                          <Icons.UploadCloud size={40} color='var(--theme-color)' />
                          <br />
                          <div className='upload_doc_part'>
                            <Form.Label>{t("uploadDocFlow.UploadsupportedDoc")}</Form.Label>
                            <Form.Label style={{ color: "var(--theme-color)", margin: "0px 5px", textDecoration: "underline" }}>{t("uploadDocFlow.here")}</Form.Label>
                          </div>
                        </div>
                      </Form.Group>
                    </div>
                  </Col>
                </Row>
                {errorMessage && (
                  <p className='error-message'>
                    <Icons.AlertCircle className='mb-1 mx-2' />
                    {errorMessage}
                  </p>
                )}
                <div className='upload_file_box' id='upload_file_bx '>
                  {uploadedFiles.map((fileName, index, file) => (
                    <div key={index} className='mb-2 uploaded-file d-flex align-items-center justify-content-between px-3 border-bottom '>
                      <p className='m-0 d-flex align-items-center gap-2'>
                        <Icons.PDFs size={22} />
                        {fileName}
                      </p>
                      <Dropdown>
                        <Dropdown.Toggle as={CustomToggle}>
                          <Dropdown.Menu>
                            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileview(supportingDocIDs[index])}>
                              <Icons.View size={18} />
                              {t("uploadDocFlow.view")}
                            </Dropdown.Item>
                            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => DeleteFileModal(supportingDocIDs[index], index)}>
                              <Icons.DeleteAction size={18} />
                              {t("uploadDocFlow.delete")}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown.Toggle>
                      </Dropdown>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <></>
          )}

          {/* Message to Recipients */}

          <Accordion defaultActiveKey='0'>
            <Accordion.Item eventKey='0'>
              <Accordion.Header className='m-0'>
                <div className='d-flex align-items-center gap-2'>
                  <Icons.customEmail size={30} />
                  <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("uploadDocFlow.MessageRecipients")}</label>
                </div>
              </Accordion.Header>
              <Accordion.Body className='p-3'>
                <Form onSubmit={sendCustomMessage}>
                  <Form.Group className='mb-3' controlId='formSubject'>
                    <Form.Label className='mb-2'>{t("Comments.Subject")}</Form.Label>
                    <Form.Control type='text' placeholder={t("Comments.addSubject")} {...register("CustomSubject")} />
                  </Form.Group>
                  <Form.Group className='mb-3' controlId='formMessage'>
                    <Form.Label className='mb-2'>{t("Comments.message")}</Form.Label>
                    <Form.Control as='textarea' rows={5} placeholder={t("Comments.CustomMessage")} {...register("CustomEmailMessage")} />
                  </Form.Group>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Comment Input */}
          <div className='my-3 '>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='2'>
                <Accordion.Header className='m-0'>
                  <div className='d-flex align-items-center gap-2'>
                    <Icons.customMessage size={30} />
                    <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("uploadDocFlow.sendCopy")}</label>
                  </div>
                </Accordion.Header>

                <Accordion.Body className='p-3'>
                  <div>
                    {/* Email CC */}
                    <CCEmail />
                    {/* Comment */}
                    <label className='mt-3 mb-2'>{t("uploadDocFlow.comment")}</label>
                    <div className='d-flex align-items-center justify-content-between mb-3 gap-2'>
                      <InputGroup>
                        <Form.Control
                          type='text'
                          placeholder={t("Comments.addCommentHere")}
                          value={newComment}
                          onChange={handleNewCommentChange}
                          onKeyDown={handleNewCommentKeyDown}
                          className='comment-input py-2'
                        />
                      </InputGroup>
                      <Button onClick={addComment} className='comment-button'>
                        <Icons.Send />
                      </Button>
                    </div>
                    <ListGroup>
                      {comments.map((comment, index) => (
                        <ListGroup.Item key={index} className='comment-list-third'>
                          <Row>
                            <Col md={6} className='pe-0 d-flex align-items-center gap-3'>
                              {/* User Avatar - Initials Only */}
                              <div
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  backgroundColor: getAvatarColor(user.fullName),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "14px",
                                  fontWeight: "700",
                                  flexShrink: 0,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {getInitials(user.fullName)}
                              </div>
                              <div className='comment-header mb-0'>
                                {user.fullName}
                                <span className='timestamp'>
                                  {comment.date}
                                  <span className='mx-2'></span>
                                  {comment.time}
                                </span>
                                {comment.edited && <span className='edited-label mx-2 fw-normal'>updated</span>}
                              </div>
                            </Col>
                            <Col md={6} className='d-flex justify-content-end gap-2'>
                              {editingIndex !== index ? (
                                <>
                                  <Icons.PenEdit className='ThirdStepEdit' onClick={() => toggleEdit(index)} />
                                  <Icons.DeleteAction className='ThirdStepEdit' onClick={() => handleShowConfirmModal(docCommentsIDs[index], index)} />
                                </>
                              ) : null}
                            </Col>
                            <Col className='my-3'>
                              {editingIndex === index ? (
                                // Editing mode
                                <div className='d-flex align-items-center gap-3'>
                                  <Form.Control
                                    type='text'
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    onKeyDown={(e) => {
                                      e.stopPropagation();
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (editedText && editedText.trim() !== "" && editedText.trim() !== (comments[index]?.text || "").trim()) {
                                          saveEditedComment(index);
                                        }
                                      } else if (e.key === "Escape") {
                                        e.preventDefault();
                                        cancelEdit();
                                      }
                                    }}
                                  />
                                  <div className='d-flex align-items-center gap-2'>
                                    <Button
                                      variant='none'
                                      className='applyBtn'
                                      onClick={() => saveEditedComment(index)}
                                      disabled={!editedText || editedText.trim() === "" || editedText.trim() === (comments[index]?.text || "").trim()}
                                    >
                                      {t("uploadDocFlow.save")}
                                    </Button>
                                    <Button variant='outline-secondary' className='ImageCancelBtn' onClick={cancelEdit}>
                                      {t("uploadDocFlow.cancel")}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // Viewing mode
                                <>
                                  <div className='comment-body'>
                                    <div className='comment-text'>{comment.text}</div>
                                  </div>
                                </>
                              )}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          {/*Advanced Settings  */}

          <div className='ThirdpaginationDivs my-3 '>
            <Accordion defaultActiveKey='0' className='comments-container'>
              <Accordion.Item eventKey='2'>
                <Accordion.Header className='m-0'>
                  <div className='d-flex align-items-center gap-2'>
                    <Icons.advancedSettings size={30} />
                    <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("uploadDocFlow.AdvancedSettings")}</label>
                  </div>
                </Accordion.Header>
                <Accordion.Body className='p-3'>
                  <Form>
                    <div className='mb-3'>
                      <Icons.SignatureOutline size={23} />
                      <label className='fw-bold mb-2 mx-2'>{t("uploadDocFlow.SigningSettings")}</label>
                      <Form.Check type='checkbox' label={t("uploadDocFlow.allowReject")} {...register("IsAllowDeclined")} />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.CanAddComment")} {...register("CanAddComment")} />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.CanAddSupportingDocument")} {...register("CanAddSupportingDocument")} />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.allowDownload")} {...register("IsAllowDownload")} />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.allowTransfer")} {...register("IsAllowTransfer")} />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.CanDownloadAuditTrail")} {...register("CanDownloadAuditTrail")} />
                    </div>

                    {/* Notification Settings */}
                    <hr />
                    <div className='mb-3'>
                      <Icons.NotificationAdd size={23} />
                      <label className='fw-bold mb-2 mx-2'>{t("uploadDocFlow.notificationSettings")}</label>
                      <Form.Check
                        type='checkbox'
                        label={t("uploadDocFlow.OwnSignatureOnly")}
                        checked={notificationSettings.OwnSignatureOnly}
                        onChange={() => handleNotificationChange("OwnSignatureOnly")}
                      />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.sendtoAll")} checked={notificationSettings.AllSignatories} onChange={() => handleNotificationChange("AllSignatories")} />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.initiatorsOnly")} checked={notificationSettings.InitiatorOnly} onChange={() => handleNotificationChange("InitiatorOnly")} />
                      <Form.Check
                        type='checkbox'
                        label={t("uploadDocFlow.NoNotifications")}
                        checked={notificationSettings.NoNotifications}
                        onChange={() => handleNotificationChange("NoNotifications")}
                      />
                    </div>

                    {/*Sending Settings */}
                    <hr />
                    <div className='mb-3'>
                      <Icons.DocumentAttach size={23} />
                      <label className='fw-bold mb-2 mx-2'>{t("uploadDocFlow.SendingSettings")}</label>
                      <Form.Check type='checkbox' label={t("uploadDocFlow.attachCompletedDocuments")} {...register("IsAttachCompletedDoc")} />
                      <Form.Check type='checkbox' label={t("uploadDocFlow.attachAuditTrial")} {...register("IsAttachAuditTrialDoc")} />
                    </div>
                    <hr />

                    {/* Reminder Settings */}
                    <div className='mb-3'>
                      <Icons.LockPerson size={23} />
                      <label className='fw-bold mb-2 mx-2'>{t("uploadDocFlow.ReminderSettings")}</label>
                      <Form.Group className=' d-flex align-items-center gap-3 mb-2' controlId='formAutoReminderInDays'>
                        <Form.Label>{t("uploadDocFlow.autoReminder")}</Form.Label>
                        <Form.Control style={{ width: "15%" }} type='number' {...register("AutoReminderInDays")} className='form-control-sm' />
                      </Form.Group>
                    </div>
                    <div className='d-flex align-items-center gap-3 mb-3'>
                      <Form.Label className='m-0'>{t("uploadDocFlow.signatureExpires")}</Form.Label>
                      <div style={{ width: "200px" }}>
                        <DateRangePicker value={dateValue} onChange={handleDateChange} minDate={startOfToday()} range={false} containerClassName='delegation-date-picker' />
                      </div>
                    </div>
                    {expiryDate && <Form.Check type='checkbox' className='mb-2' label={t("uploadDocFlow.remindBeforeExpiry")} {...register("SetReminderBefore1Day")} />}
                    <hr />
                    <Icons.FolderOpen size={23} />
                    <label className='fw-bold mx-2 mb-2'>{t("uploadDocFlow.archivingDocuments")}</label>
                    {/* Display the selected folder name */}
                    {selectedFolderName ? (
                      <p>
                        {t("uploadDocFlow.documentGoesTo")}{" "}
                        <strong>
                          {selectedFolderName} {t("uploadDocFlow.Sfolders")}{" "}
                        </strong>
                        {t("uploadDocFlow.afterSigning")}
                      </p>
                    ) : (
                      <p>{t("uploadDocFlow.noFolderSelected")}</p>
                    )}
                    {/* Button to open Folder Selection Offcanvas */}
                    <Button onClick={() => setIsCanvasVisible(true)} className='selectFolder'>
                      {t("uploadDocFlow.SelectFolder")}
                    </Button>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          <div className=' fixed-button-container'>
            <Button className='backBtn' id='hide_part_one' onClick={handleBack}>
              {t("uploadDocFlow.back")}
            </Button>
            <Button className='Continue-btn' id='hide_part_one' onClick={openConfirmationModal}>
              {t("uploadDocFlow.sendAndSign")}
            </Button>
          </div>

          {/* supportin file delete modal */}
          <DeleteConfirmationModal
            show={fileModal}
            onHide={handleFileCloseModal}
            title={t("uploadDocFlow.confirmDelete")}
            subtitle={t("uploadDocFlow.supportingDocuments")}
            warningText={t("uploadDocFlow.deleteFile")}
            itemTitle={t("uploadDocFlow.supportingDocuments")}
            itemName={uploadedFiles[deletingIndex] || ""}
            onConfirm={() => handleFileDelete(deletingSupportingDocID, deletingIndex)}
            confirmText={t("uploadDocFlow.delete")}
            cancelText={t("uploadDocFlow.cancel")}
            headerIcon={<Icons.DeleteAction size={25} />}
            itemIcon={<Icons.PDFs size={25} />}
          />

          {/* supporting file view */}
          <Modal keyboard={false} backdrop='static' show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>{t("uploadDocFlow.viewFile")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {isSupported ? (
                <iframe title='Document Viewer' src={documentPath} alt='cant preview file' width='100%' height='500' className='overflow-x-none'></iframe>
              ) : (
                <p>
                  {t("uploadDocFlow.previewfile")}
                  <Button className='applyBtn' variant='none' onClick={() => handleFileDownload(documentPath)}>
                    <Icons.DownloadAction size={18} />
                  </Button>
                </p>
              )}
            </Modal.Body>
          </Modal>

          {/* Confirmation Modal (reused component) */}
          <DeleteConfirmationModal
            show={isConfirmationModalOpen}
            onHide={closeConfirmationModal}
            title={t("uploadDocFlow.confirmSend")}
            subtitle={t("uploadDocFlow.proceed")}
            warningText={t("uploadDocFlow.proceed")}
            itemTitle={t("uploadDocFlow.sendAndSign")}
            itemName={t("uploadDocFlow.docSend")}
            onConfirm={handleYesButton}
            confirmText={t("uploadDocFlow.yes")}
            itemIcon={<Icons.PDFs size={25} />}
            cancelText={t("uploadDocFlow.no")}
            headerIcon={<Icons.CheckCircle size={25} />}
          />

          {/* Success Modal */}
          <Modal keyboard={false} backdrop='static' show={isSuccessModalOpen} onHide={closeSuccessModal} dialogClassName='custom-modal-width'>
            <Modal.Header>
              <Modal.Title>{t("uploadDocFlow.requestSent")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='px-3 py-2'>{t("uploadDocFlow.requestProceed")}</Modal.Body>
            <Modal.Footer>
              <Button onClick={closeSuccessModal} className='applyBtn'>
                {t("uploadDocFlow.close")}
              </Button>
            </Modal.Footer>
          </Modal>

          <DeleteConfirmationModal
            show={showConfirmModal}
            onHide={handleCloseConfirmModal}
            title={t("Folder.deleteConfirmation")}
            subtitle={t("Comments.deleteComment")}
            warningText={t("uploadDocFlow.deleteComment")}
            itemTitle={t("Comments.comment")}
            itemName={comments[commentToDeleteIndex]?.text || ""}
            onConfirm={() => handleDeleteComment(deletingCommentId, commentToDeleteIndex)}
            confirmText={t("uploadDocFlow.delete")}
            cancelText={t("uploadDocFlow.cancel")}
            headerIcon={<Icons.DeleteAction size={25} />}
            itemIcon={<Icons.Comments size={25} color='var(--theme-color)' />}
          />
        </div>
      </div>

      <FolderSelection show={isCanvasVisible} onClose={() => setIsCanvasVisible(false)} onSelectFolder={handleSelectFolder} />
    </Container>
  );
};

export default Thirdstep;
