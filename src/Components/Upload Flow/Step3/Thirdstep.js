import React, { useState, useEffect } from "react";
import { Form, Col, Button, Container, InputGroup, ListGroup, Modal, Row, Dropdown, Accordion } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import { useNavigate } from "react-router-dom";
import { CCEmail, DispatchSummaryBar } from "@/Components/DocumentPreparation";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import FolderSelection from "./FolderSelection";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { DateObject } from "react-multi-date-picker";
import { startOfToday } from "date-fns";
import UploadSourceCard from "@/Components/Common/CloudPickers/UploadSourceCard";
import { tokenManager } from "@/services/tokenManager";
import { PALETTE_STORAGE_KEY } from "@/Context/themeUtils";

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
        const currentTheme = localStorage.getItem("theme");
        const currentPalette = localStorage.getItem(PALETTE_STORAGE_KEY);
        const currentLang = localStorage.getItem("i18nextLng");
        tokenManager.clearToken();
        localStorage.clear();
        if (currentTheme) localStorage.setItem("theme", currentTheme);
        if (currentPalette) localStorage.setItem(PALETTE_STORAGE_KEY, currentPalette);
        if (currentLang) localStorage.setItem("i18nextLng", currentLang);
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
    <div className='w-full max-w-5xl mx-auto space-y-6 pb-24'>
      {/* Step Header */}
      <div className='mb-2'>
        <small className='block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--modern-primary,#4d8dff)]'>
          {t("uploadDocFlow.step", "STEP")} 4 {t("uploadDocFlow.of", "OF")} 4
        </small>
        <h1 className='mt-1 text-2xl font-bold tracking-tight text-[var(--modern-text)]'>
          {t("uploadDocFlow.sendAndSign", "Send and Sign")}
        </h1>
        <p className='mt-1 text-sm text-[var(--modern-muted)]'>
          {t("uploadDocFlow.reviewAndSendSubtitle", "Review settings, customize recipient message, and dispatch your document.")}
        </p>
      </div>

      <div className='w-full flex flex-col gap-6' id='part_one'>
        <div>
          {/* Supporting Documents (conditional) */}
          {userAccess.supportDocs === true && (
            <div className='mb-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-6'>
              <div className='flex items-center gap-3 border-b border-[var(--modern-border)] pb-4 mb-4'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--modern-primary)_15%,transparent)] text-[var(--modern-primary)]'>
                  <Icons.UploadCloud size={20} />
                </div>
                <div>
                  <h3 className='text-base font-bold text-[var(--modern-text)] m-0'>
                    {t("uploadDocFlow.supportingDocuments", "Supporting Documents")}
                  </h3>
                  <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                    {t("uploadDocFlow.supportingDocsSubtitle", "Attach supplemental documentation for signers to reference")}
                  </p>
                </div>
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
                {uploadedFiles.length > 0 && (
                  <div className='mt-3 space-y-2' id='upload_file_bx '>
                    {uploadedFiles.map((fileName, index) => (
                      <div
                        key={index}
                        className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] px-4 py-2.5 text-[var(--modern-text)]"
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
                )}
              </div>
            </div>
          )}

          {/* Message to Recipients */}
          <div className='my-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-6'>
            <div className='flex items-center gap-3 border-b border-[var(--modern-border)] pb-4 mb-5'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--modern-primary)_15%,transparent)] text-[var(--modern-primary)]'>
                <Icons.customEmail size={20} />
              </div>
              <div>
                <h3 className='text-base font-bold text-[var(--modern-text)] m-0'>
                  {t("uploadDocFlow.MessageRecipients", "Message to Recipients")}
                </h3>
                <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                  {t("uploadDocFlow.customMessageSubtitle", "Customize the subject and invitation message sent to signers")}
                </p>
              </div>
            </div>

            <Form onSubmit={sendCustomMessage} className='space-y-4'>
              <div>
                <label className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--modern-muted)]'>
                  {t("Comments.Subject", "Subject")}
                </label>
                <input
                  type='text'
                  className='w-full rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] px-3.5 py-2.5 text-sm text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--modern-primary)] focus:outline-none transition-colors'
                  placeholder={t("Comments.addSubject", "Enter subject line...")}
                  {...register("CustomSubject")}
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--modern-muted)]'>
                  {t("Comments.message", "Message")}
                </label>
                <textarea
                  rows={4}
                  className='w-full rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] px-3.5 py-2.5 text-sm text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--modern-primary)] focus:outline-none transition-colors'
                  placeholder={t("Comments.CustomMessage", "Enter message to recipients...")}
                  {...register("CustomEmailMessage")}
                />
              </div>
            </Form>
          </div>

          {/* Send Copy (CC) & Comments */}
          <div className='my-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-6'>
            <div className='flex items-center gap-3 border-b border-[var(--modern-border)] pb-4 mb-5'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--modern-primary)_15%,transparent)] text-[var(--modern-primary)]'>
                <Icons.customMessage size={20} />
              </div>
              <div>
                <h3 className='text-base font-bold text-[var(--modern-text)] m-0'>
                  {t("uploadDocFlow.sendCopy", "Send a Copy (CC) & Comments")}
                </h3>
                <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                  {t("uploadDocFlow.sendCopySubtitle", "Add CC recipients and attach notes to the signing transaction")}
                </p>
              </div>
            </div>

            <div className='space-y-5'>
              {/* Email CC */}
              <CCEmail />

              {/* Comment Thread */}
              <div className='border-t border-[var(--modern-border)] pt-4'>
                <label className='mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--modern-muted)]'>
                  {t("Comments.comments", "Comments & Notes")}
                </label>

                <div className='flex items-center gap-2 mb-4'>
                  <input
                    type='text'
                    placeholder={t("Comments.addCommentHere", "Add a comment...")}
                    value={newComment}
                    onChange={handleNewCommentChange}
                    onKeyDown={handleNewCommentKeyDown}
                    className='flex-1 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] px-3.5 py-2.5 text-sm text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--modern-primary)] focus:outline-none transition-colors'
                  />
                  <Button
                    onClick={addComment}
                    variant='primary'
                    className='!h-10 px-4 rounded-xl shrink-0 font-semibold'
                  >
                    <Icons.Send size={16} />
                  </Button>
                </div>

                {comments.length > 0 && (
                  <div className='space-y-2.5'>
                    {comments.map((comment, index) => (
                      <div
                        key={index}
                        className='rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-3 text-[var(--modern-text)]'
                      >
                        <div className='flex items-center justify-between gap-2 mb-2'>
                          <div className='flex items-center gap-2.5'>
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
                                fontSize: "11px",
                                fontWeight: "700",
                                flexShrink: 0,
                                textTransform: "uppercase",
                              }}
                            >
                              {getInitials(user.fullName)}
                            </div>
                            <div>
                              <span className='block text-xs font-bold text-[var(--modern-text)] leading-tight'>
                                {user.fullName}
                              </span>
                              <span className='text-[11px] text-[var(--modern-muted)]'>
                                {comment.date} {comment.time}
                                {comment.edited && (
                                  <span className='text-[var(--modern-primary)] ms-1 font-semibold'>
                                    (updated)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {editingIndex !== index && (
                            <div className='flex items-center gap-1.5'>
                              <button
                                type='button'
                                onClick={() => toggleEdit(index)}
                                title={t("uploadDocFlow.edit", "Edit")}
                                className='inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-muted)] hover:text-[var(--modern-primary)] hover:border-[var(--modern-primary)] transition-colors cursor-pointer'
                              >
                                <Icons.PenEdit size={14} />
                              </button>
                              <button
                                type='button'
                                onClick={() => handleShowConfirmModal(docCommentsIDs[index], index)}
                                title={t("uploadDocFlow.delete", "Delete")}
                                className='inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-muted)] hover:text-[var(--modern-danger,#ef4444)] hover:border-[var(--modern-danger,#ef4444)] transition-colors cursor-pointer'
                              >
                                <Icons.DeleteAction size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingIndex === index ? (
                          <div className='flex items-center gap-2 mt-2'>
                            <input
                              type='text'
                              className='flex-1 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-3 py-1.5 text-xs text-[var(--modern-text)] focus:border-[var(--modern-primary)] focus:outline-none'
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
                            <Button
                              variant='primary'
                              size='sm'
                              className='!h-8 px-3 rounded-lg text-xs font-semibold'
                              onClick={() => saveEditedComment(index)}
                              disabled={!editedText || editedText.trim() === "" || editedText.trim() === (comments[index]?.text || "").trim()}
                            >
                              {t("uploadDocFlow.save")}
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              className='!h-8 px-3 rounded-lg text-xs font-semibold'
                              onClick={cancelEdit}
                            >
                              {t("uploadDocFlow.cancel")}
                            </Button>
                          </div>
                        ) : (
                          <div className='text-xs leading-relaxed rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] p-2.5 text-[var(--modern-text)]'>
                            {comment.text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className='my-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-6'>
            <div className='flex items-center gap-3 border-b border-[var(--modern-border)] pb-4 mb-5'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--modern-primary)_15%,transparent)] text-[var(--modern-primary)]'>
                <Icons.advancedSettings size={20} />
              </div>
              <div>
                <h3 className='text-base font-bold text-[var(--modern-text)] m-0'>
                  {t("uploadDocFlow.AdvancedSettings", "Advanced Settings")}
                </h3>
                <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                  {t("uploadDocFlow.advancedSettingsSubtitle", "Configure signing permissions, notification rules, expiration, and archiving")}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {/* 1. Signing Settings */}
              <div className='flex flex-col rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-4 space-y-3'>
                <div className='flex items-center gap-2 border-b border-[var(--modern-border)] pb-2.5'>
                  <span className='text-[var(--modern-primary)]'>
                    <Icons.SignatureOutline size={18} />
                  </span>
                  <label className='font-bold text-xs uppercase tracking-wider text-[var(--modern-muted)] m-0'>
                    {t("uploadDocFlow.SigningSettings")}
                  </label>
                </div>
                <div className='space-y-2.5 text-xs text-[var(--modern-text)]'>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("IsAllowDeclined")} />
                    <span>{t("uploadDocFlow.allowReject")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("CanAddComment")} />
                    <span>{t("uploadDocFlow.CanAddComment")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("CanAddSupportingDocument")} />
                    <span>{t("uploadDocFlow.CanAddSupportingDocument")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("IsAllowDownload")} />
                    <span>{t("uploadDocFlow.allowDownload")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("IsAllowTransfer")} />
                    <span>{t("uploadDocFlow.allowTransfer")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("CanDownloadAuditTrail")} />
                    <span>{t("uploadDocFlow.CanDownloadAuditTrail")}</span>
                  </label>
                </div>
              </div>

              {/* 2. Notification Settings */}
              <div className='flex flex-col rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-4 space-y-3'>
                <div className='flex items-center gap-2 border-b border-[var(--modern-border)] pb-2.5'>
                  <span className='text-[var(--modern-primary)]'>
                    <Icons.NotificationAdd size={18} />
                  </span>
                  <label className='font-bold text-xs uppercase tracking-wider text-[var(--modern-muted)] m-0'>
                    {t("uploadDocFlow.notificationSettings")}
                  </label>
                </div>
                <div className='space-y-2.5 text-xs text-[var(--modern-text)]'>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]'
                      checked={notificationSettings.OwnSignatureOnly}
                      onChange={() => handleNotificationChange("OwnSignatureOnly")}
                    />
                    <span>{t("uploadDocFlow.OwnSignatureOnly")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]'
                      checked={notificationSettings.AllSignatories}
                      onChange={() => handleNotificationChange("AllSignatories")}
                    />
                    <span>{t("uploadDocFlow.sendtoAll")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]'
                      checked={notificationSettings.InitiatorOnly}
                      onChange={() => handleNotificationChange("InitiatorOnly")}
                    />
                    <span>{t("uploadDocFlow.initiatorsOnly")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input
                      type='checkbox'
                      className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]'
                      checked={notificationSettings.NoNotifications}
                      onChange={() => handleNotificationChange("NoNotifications")}
                    />
                    <span>{t("uploadDocFlow.NoNotifications")}</span>
                  </label>
                </div>
              </div>

              {/* 3. Sending & Reminders */}
              <div className='flex flex-col rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-4 space-y-3'>
                <div className='flex items-center gap-2 border-b border-[var(--modern-border)] pb-2.5'>
                  <span className='text-[var(--modern-primary)]'>
                    <Icons.DocumentAttach size={18} />
                  </span>
                  <label className='font-bold text-xs uppercase tracking-wider text-[var(--modern-muted)] m-0'>
                    {t("uploadDocFlow.SendingSettings")} & {t("uploadDocFlow.ReminderSettings")}
                  </label>
                </div>
                <div className='space-y-3 text-xs text-[var(--modern-text)]'>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("IsAttachCompletedDoc")} />
                    <span>{t("uploadDocFlow.attachCompletedDocuments")}</span>
                  </label>
                  <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                    <input type='checkbox' className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]' {...register("IsAttachAuditTrialDoc")} />
                    <span>{t("uploadDocFlow.attachAuditTrial")}</span>
                  </label>
                  <div className='border-t border-[var(--modern-border)] pt-2.5 space-y-2.5'>
                    <div className='flex items-center justify-between gap-3'>
                      <label className='text-xs font-medium text-[var(--modern-text)] m-0'>
                        {t("uploadDocFlow.autoReminder")}
                      </label>
                      <div className='flex items-center gap-1.5'>
                        <input
                          type='number'
                          className='h-8 w-20 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] px-2 text-xs text-[var(--modern-text)] focus:border-[var(--modern-primary)] focus:outline-none'
                          {...register("AutoReminderInDays")}
                        />
                        <span className='text-xs text-[var(--modern-muted)]'>days</span>
                      </div>
                    </div>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <label className='text-xs font-medium text-[var(--modern-text)] m-0'>
                        {t("uploadDocFlow.signatureExpires")}
                      </label>
                      <div className='w-48'>
                        <DateRangePicker
                          value={dateValue}
                          onChange={handleDateChange}
                          minDate={startOfToday()}
                          range={false}
                          containerClassName='delegation-date-picker'
                        />
                      </div>
                    </div>
                    {expiryDate && (
                      <label className='flex items-center gap-2.5 cursor-pointer font-medium m-0'>
                        <input
                          type='checkbox'
                          className='h-4 w-4 rounded border-[var(--modern-border)] text-[var(--modern-primary)] focus:ring-[var(--modern-primary)]'
                          {...register("SetReminderBefore1Day")}
                        />
                        <span>{t("uploadDocFlow.remindBeforeExpiry")}</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Archiving Documents */}
              <div className='flex flex-col justify-between rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-4 space-y-3'>
                <div>
                  <div className='flex items-center gap-2 border-b border-[var(--modern-border)] pb-2.5 mb-3'>
                    <span className='text-[var(--modern-primary)]'>
                      <Icons.FolderOpen size={18} />
                    </span>
                    <label className='font-bold text-xs uppercase tracking-wider text-[var(--modern-muted)] m-0'>
                      {t("uploadDocFlow.archivingDocuments")}
                    </label>
                  </div>
                  {selectedFolderName ? (
                    <p className='text-xs text-[var(--modern-text)] mb-3'>
                      {t("uploadDocFlow.documentGoesTo")}{" "}
                      <strong className='text-[var(--modern-primary)] font-bold'>
                        {selectedFolderName} {t("uploadDocFlow.Sfolders")}
                      </strong>{" "}
                      {t("uploadDocFlow.afterSigning")}
                    </p>
                  ) : (
                    <p className='text-xs text-[var(--modern-muted)] mb-3'>
                      {t("uploadDocFlow.noFolderSelected")}
                    </p>
                  )}
                </div>
                <div>
                  <Button
                    variant='outline'
                    onClick={() => setIsCanvasVisible(true)}
                    className='!h-9 rounded-xl border-[var(--modern-border)] hover:bg-[var(--modern-card)] text-xs font-semibold'
                  >
                    {t("uploadDocFlow.SelectFolder")}
                  </Button>
                </div>
              </div>
            </div>
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
          <Modal keyboard={false} backdrop='static' show={isSuccessModalOpen} onHide={closeSuccessModal} centered>
            <div className="rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-6 text-[var(--modern-text)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Icons.CheckCircle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--modern-text)] m-0">{t("uploadDocFlow.requestSent")}</h3>
                  <p className="mt-1 text-sm text-[var(--modern-muted)] m-0">{t("uploadDocFlow.requestProceed")}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={closeSuccessModal} className='applyBtn rounded-xl px-5 py-2.5'>
                  {t("uploadDocFlow.close")}
                </Button>
              </div>
            </div>
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
    </div>
  );
};

export default Thirdstep;
