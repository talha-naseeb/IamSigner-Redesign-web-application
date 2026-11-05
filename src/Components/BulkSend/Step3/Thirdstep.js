import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, InputGroup, ListGroup, Modal, Row, Dropdown, Accordion } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import { useNavigate } from "react-router-dom";
import { CCEmail, DispatchSummaryBar } from "@/Components/DocumentPreparation";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { Icons } from "@/assets/Icons";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";
import { startOfToday } from "date-fns";
import UploadSourceCard from "@/Components/Common/CloudPickers/UploadSourceCard";

const Thirdstep = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();
  const storedRegisterSignID = localStorage.getItem("registerSignID");
  const navigate = useNavigate();

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

  const { register, watch, reset, setValue } = useForm({
    defaultValues: {
      //  im using IsAllowTransfer at the place of download supporting documents when tahir fix the backend change the key... (talha)
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
    const fetchSupportingDocs = async () => {
      setIsLoading(true);
      try {
        const response = await uploadFlowService.getSupportingDocs(storedRegisterSignID);
        if (response.status === 200) {
          if (Array.isArray(response.data.response)) {
            const uploadedDocs = response.data.response.map((doc) => doc.supportingDocName);
            setUploadedFiles(uploadedDocs);

            const supportingID = response.data.response.map((doc) => doc.supportingDocID);
            setSupportingDocIDs(supportingID);
          }
        }
      } catch (error) {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupportingDocs();
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
      toast.error(t("uploadDocFlow.filecantView"));
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

  // comment section
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);

    if (e.key === "Enter") {
      if (!e.target.value) {
        // setErrorMessage(t("uploadDocFlow.enterComment"));
        toast.error(t("uploadDocFlow.enterComment"));
        return;
      }
      setErrorMessage("");

      addComment(e);
    }
  };

  const addComment = async () => {
    if (!newComment) {
      // setErrorMessage(t("uploadDocFlow.enterComment"));
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
      toast.error(t("uploadDocFlow.failedToAdd"));
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
      toast.error(t("uploadDocFlow.failedToUpdate"));
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await uploadFlowService.getDocComments(storedRegisterSignID);
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
      } catch (error) {
        setIsLoading(false);
        toast.error(t("uploadDocFlow.sessionExpire"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [navigate, storedRegisterSignID]);

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
          toast.error(t("uploadDocFlow.sessionExpire"));
        }
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something wrong. Try later");
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
        reset();
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
    <div className='w-full max-w-5xl mx-auto space-y-6'>
      <div className='w-full flex flex-col gap-6' id='part_one'>
        <div>
          {userAccess.supportDocs === true ? (
            <div className='bg-[var(--modern-card,#ffffff)] border border-[var(--modern-border,rgba(52,40,100,0.14))] rounded-2xl p-6'>
              <div className='flex items-center gap-2 mb-4'>
                <Icons.UploadCloud size={24} className='text-[var(--modern-primary)]' />
                <h3 className='text-base font-semibold text-[var(--modern-text)] m-0'>
                  {t("uploadDocFlow.supportingDocuments", "Supporting Documents")}
                </h3>
              </div>
              <div>
                <UploadSourceCard {...getRootProps()}>
                  <input {...getInputProps()} className="sr-only" />
                  <Icons.UploadCloud size={32} className="text-[var(--modern-primary,#6366f1)]" />
                  <span className="text-sm font-medium">{t("uploadDocFlow.UploadsupportedDoc")}</span>
                  <span className="text-sm font-medium text-[var(--modern-primary,#6366f1)] underline underline-offset-2">
                    {t("uploadDocFlow.here")}
                  </span>
                </UploadSourceCard>
                {errorMessage && (
                  <p className="mt-2 flex items-start gap-2 text-sm text-[var(--modern-danger,#ef4444)]">
                    <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {errorMessage}
                  </p>
                )}
                <div className='mt-3 space-y-2' id='upload_file_bx '>
                  {uploadedFiles.map((fileName, index, file) => (
                    <div
                      key={index}
                      className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#fff)] px-4 py-2.5 text-[var(--modern-text,#0f172a)]"
                    >
                      <p className='m-0 flex min-w-0 items-center gap-2 break-words text-sm font-medium'>
                        <Icons.PDFs size={22} className='text-[var(--modern-primary)]' />
                        {fileName}
                      </p>
                      <Dropdown>
                        <Dropdown.Toggle as={CustomToggle} />
                        <Dropdown.Menu align='end'>
                          <Dropdown.Item className='flex items-center gap-2' onClick={() => handleFileview(supportingDocIDs[index])}>
                            <Icons.View size={18} />
                            {t("uploadDocFlow.view")}
                          </Dropdown.Item>
                          <Dropdown.Item className='flex items-center gap-2' onClick={() => DeleteFileModal(supportingDocIDs[index], index)}>
                            <Icons.DeleteAction size={18} />
                            {t("uploadDocFlow.delete")}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Message to Recipients */}
          <div className='my-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] overflow-hidden'>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='0' className='!border-0 !bg-transparent'>
                <Accordion.Header className='!border-0'>
                  <div className='flex items-center gap-2.5 py-1 text-[var(--modern-text)]'>
                    <Icons.customEmail size={22} className='text-[var(--modern-primary)]' />
                    <span className="text-base font-semibold">{t("uploadDocFlow.MessageRecipients")}</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className='p-6 pt-2'>
                  <Form onSubmit={sendCustomMessage}>
                    <Form.Group className='mb-4' controlId='formSubject'>
                      <Form.Label className='mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)]'>{t("Comments.Subject")}</Form.Label>
                      <Form.Control type='text' className='rounded-xl border-[var(--modern-border)] bg-[var(--modern-raised)] text-sm' placeholder={t("Comments.addSubject")} {...register("CustomSubject")} />
                    </Form.Group>
                    <Form.Group className='mb-2' controlId='formMessage'>
                      <Form.Label className='mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)]'>{t("Comments.message")}</Form.Label>
                      <Form.Control as='textarea' rows={4} className='rounded-xl border-[var(--modern-border)] bg-[var(--modern-raised)] text-sm' placeholder={t("Comments.CustomMessage")} {...register("CustomEmailMessage")} />
                    </Form.Group>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          {/* Comment Input */}
          <div className='my-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] overflow-hidden'>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='2' className='!border-0 !bg-transparent'>
                <Accordion.Header className='!border-0'>
                  <div className='flex items-center gap-2.5 py-1 text-[var(--modern-text)]'>
                    <Icons.customMessage size={22} className='text-[var(--modern-primary)]' />
                    <span className="text-base font-semibold">{t("uploadDocFlow.sendCopy")}</span>
                  </div>
                </Accordion.Header>

                <Accordion.Body className='p-6 pt-2'>
                  <div>
                    {/* Email CC */}
                    <CCEmail />
                    {/*Comment  */}
                    <div className='flex items-center justify-between mb-4 gap-2'>
                      <InputGroup className='flex-1'>
                        <Form.Control type='text' className='rounded-xl border-[var(--modern-border)] bg-[var(--modern-raised)] text-sm' placeholder={t("Comments.addCommentHere")} value={newComment} onChange={handleCommentChange} onKeyPress={handleCommentChange} />
                      </InputGroup>
                      <Button onClick={addComment} variant='primary' size='sm' className='min-h-[40px] px-4 rounded-xl'>
                        <Icons.Send size={16} />
                      </Button>
                    </div>
                    <ListGroup className='space-y-2'>
                      {comments.map((comment, index) => (
                        <ListGroup.Item key={index} className='!bg-[var(--modern-raised)] border border-[var(--modern-border)] rounded-xl p-3 text-[var(--modern-text)]'>
                          <Row className='items-center'>
                            <Col md={6} className='flex items-center gap-3'>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  backgroundColor: "var(--modern-primary, #6366f1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  flexShrink: 0,
                                  textTransform: "uppercase",
                                }}
                              >
                                {getInitials(user.fullName)}
                              </div>
                              <div className='text-xs font-semibold text-[var(--modern-text)]'>
                                {user.fullName}
                                <span className='text-[var(--modern-muted)] font-normal ms-2 text-[11px]'>
                                  {comment.date} {comment.time}
                                </span>
                                {comment.edited && <span className='text-[var(--modern-primary)] ms-2 text-[11px] font-normal'>updated</span>}
                              </div>
                            </Col>
                            <Col md={6} className='flex justify-end gap-2'>
                              {editingIndex !== index ? (
                                <>
                                  <Icons.PenEdit className='cursor-pointer text-[var(--modern-muted)] hover:text-[var(--modern-primary)]' size={18} onClick={() => toggleEdit(index)} />
                                  <Icons.DeleteAction className='cursor-pointer text-[var(--modern-danger,#ef4444)] hover:opacity-80' size={18} onClick={() => handleShowConfirmModal(docCommentsIDs[index], index)} />
                                </>
                              ) : null}
                            </Col>
                            <Col xs={12} className='mt-2'>
                              {editingIndex === index ? (
                                <div className='flex items-center gap-2'>
                                  <Form.Control
                                    type='text'
                                    className='rounded-lg text-xs bg-[var(--modern-card)]'
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
                                      variant=''
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
                                  <div className=''>
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

          {/* Advanced Settings */}
          <div className='my-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] overflow-hidden'>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='2' className='!border-0 !bg-transparent'>
                <Accordion.Header className='!border-0'>
                  <div className='flex items-center gap-2.5 py-1 text-[var(--modern-text)]'>
                    <Icons.advancedSettings size={22} className='text-[var(--modern-primary)]' />
                    <span className="text-base font-semibold">{t("uploadDocFlow.AdvancedSettings")}</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className='p-6 pt-2'>
                  <Form>
                    <div className='mb-4'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Icons.SignatureOutline size={18} className='text-[var(--modern-primary)]' />
                        <label className='font-semibold text-xs uppercase tracking-wider text-[var(--modern-muted)]'>{t("uploadDocFlow.SigningSettings")}</label>
                      </div>
                      <div className='space-y-2'>
                        <Form.Check type='checkbox' label={t("uploadDocFlow.allowReject")} {...register("IsAllowDeclined")} />
                        <Form.Check type='checkbox' label={t("uploadDocFlow.CanAddComment")} {...register("CanAddComment")} />
                        <Form.Check type='checkbox' label={t("uploadDocFlow.allowDownload")} {...register("IsAllowDownload")} />
                        <Form.Check type='checkbox' label={t("uploadDocFlow.allowTransfer")} {...register("IsAllowTransfer")} />
                        <Form.Check type='checkbox' label={t("uploadDocFlow.CanDownloadAuditTrail")} {...register("CanDownloadAuditTrail")} />
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <hr className='my-4 border-[var(--modern-border)]' />
                    <div className='mb-4'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Icons.NotificationAdd size={18} className='text-[var(--modern-primary)]' />
                        <label className='font-semibold text-xs uppercase tracking-wider text-[var(--modern-muted)]'>{t("uploadDocFlow.notificationSettings")}</label>
                      </div>
                      <div className='space-y-2'>
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
                    </div>

                    <hr className='my-4 border-[var(--modern-border)]' />

                    {/* Sending Settings */}
                    <div className='mb-4'>
                      <div className='flex items-center gap-2 mb-3'>
                        <Icons.DocumentAttach size={18} className='text-[var(--modern-primary)]' />
                        <label className='font-semibold text-xs uppercase tracking-wider text-[var(--modern-muted)]'>{t("uploadDocFlow.SendingSettings")}</label>
                      </div>
                      <div className='space-y-2'>
                        <Form.Check type='checkbox' label={t("uploadDocFlow.attachCompletedDocuments")} {...register("IsAttachCompletedDoc")} />
                        <Form.Check type='checkbox' label={t("uploadDocFlow.attachAuditTrial")} {...register("IsAttachAuditTrialDoc")} />
                      </div>
                    </div>

                    <hr className='my-4 border-[var(--modern-border)]' />

                    {/* Reminder Settings */}
                    <div>
                      <div className='flex items-center gap-2 mb-3'>
                        <Icons.LockPerson size={18} className='text-[var(--modern-primary)]' />
                        <label className='font-semibold text-xs uppercase tracking-wider text-[var(--modern-muted)]'>{t("uploadDocFlow.ReminderSettings")}</label>
                      </div>

                      <Form.Group className='flex items-center gap-3 mb-3' controlId='formAutoReminderInDays'>
                        <Form.Label className='text-sm text-[var(--modern-text)] m-0'>{t("uploadDocFlow.autoReminder")}</Form.Label>
                        <Form.Control style={{ width: "90px" }} type='number' {...register("AutoReminderInDays")} className='rounded-xl border-[var(--modern-border)] bg-[var(--modern-raised)] text-sm' />
                      </Form.Group>

                      <div className='flex flex-wrap items-center gap-3 mb-3'>
                        <Form.Label className='text-sm text-[var(--modern-text)] m-0'>{t("uploadDocFlow.signatureExpires")}</Form.Label>
                        <div style={{ width: "200px" }}>
                          <DateRangePicker value={dateValue} onChange={handleDateChange} minDate={startOfToday()} range={false} containerClassName='delegation-date-picker' />
                        </div>
                      </div>

                      {expiryDate && <Form.Check type='checkbox' className='mb-2' label={t("uploadDocFlow.remindBeforeExpiry")} {...register("SetReminderBefore1Day")} />}
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          <DispatchSummaryBar
            onBack={handleBack}
            onConfirm={openConfirmationModal}
            isLoading={isLoading}
            t={t}
          />

          {/* supporting file delete modal */}
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
            headerIconSrc={Icons.DeleteAction}
            itemIconSrc={Icons.PDFs}
          />

          <Modal keyboard={false} backdrop='static' show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton className='border-b border-[var(--modern-border)]'>
              <Modal.Title className='text-base font-semibold text-[var(--modern-text)]'>{t("uploadDocFlow.viewFile")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-4'>
              {isSupported ? (
                <iframe title='Document Viewer' src={documentPath} alt='cant preview file' width='100%' height='500' className='overflow-x-none rounded-xl border border-[var(--modern-border)]'></iframe>
              ) : (
                <p className='text-sm text-[var(--modern-muted)] flex items-center justify-between'>
                  <span>{t("uploadDocFlow.previewfile")}</span>
                  <Button className='rounded-full' variant='outline' onClick={() => handleFileDownload(documentPath)}>
                    <Icons.DownloadAction size={18} />
                  </Button>
                </p>
              )}
            </Modal.Body>
          </Modal>

          {/* Confirmation Modal */}
          <DeleteConfirmationModal
            show={isConfirmationModalOpen}
            onHide={closeConfirmationModal}
            variant='primary'
            title={t("uploadDocFlow.confirmSend")}
            subtitle={t("uploadDocFlow.revertedText")}
            warningText={t("uploadDocFlow.proceed")}
            itemTitle={t("uploadDocFlow.sendAndSign")}
            itemName={t("uploadDocFlow.docSend")}
            onConfirm={handleYesButton}
            confirmText={t("uploadDocFlow.yes")}
            itemIcon={<Icons.PDFs size={22} />}
            cancelText={t("uploadDocFlow.no")}
            headerIcon={<Icons.CheckCircle size={26} />}
          />

          {/* Success Modal */}
          <Modal keyboard={false} backdrop='static' show={isSuccessModalOpen} onHide={closeSuccessModal} dialogClassName='custom-modal-width'>
            <Modal.Header className='border-b border-[var(--modern-border)]'>
              <Modal.Title className='text-base font-semibold text-[var(--modern-text)]'>{t("uploadDocFlow.requestSent")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-5 text-sm text-[var(--modern-muted)]'>{t("uploadDocFlow.requestProceed")}</Modal.Body>
            <Modal.Footer className='border-t border-[var(--modern-border)] flex justify-end'>
              <Button onClick={closeSuccessModal} variant='primary' className='rounded-full px-6 font-semibold'>
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
            onConfirm={() => handleDeleteComment(deletingCommentId)}
            confirmText={t("uploadDocFlow.delete")}
            cancelText={t("uploadDocFlow.cancel")}
            headerIconSrc={Icons.DeleteAction}
            itemIconSrc={Icons.Comments}
          />
        </div>
      </div>
    </div>
  );
};

export default Thirdstep;
