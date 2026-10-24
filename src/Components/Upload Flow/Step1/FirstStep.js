import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Modal, Row, Dropdown, Accordion } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReferenceNumber from "@/Components/DocumentPreparation/Step1_Source/ReferenceNumber";
import Description from "@/Components/DocumentPreparation/Step1_Source/Description";
import { DropboxPicker as Dropbox, GoogleDrivePicker as UploadFromGoogleDrive } from "@/Components/Common/CloudPickers";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@/Components/UI/dataPrimitives";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import ListOfDocuments from "@/Integrations/MacAiGeneratedDocs/ListOfDocuments";
import ManualDosList from "@/Integrations/ManuallyGeneratedDocs/ManualDosList";
import Loader from "@/Components/CommonModals/Loader/Loader";
import OneDriveIntegration from "@/Components/OneDrive/oneDriveIntegration";
import DmsUploadIntegration, { useDmsDocumentUpload } from "@/Components/DMS/DmsUploadIntegration";
import DmsDocumentPickerModal from "@/Components/DMS/DmsDocumentPickerModal";
import { canUserStartDmsSign } from "@/Components/DMS/utils/dmsSignBridge";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { useUser } from "@/Context/UserContext";
import { uploadSourceCardClassName } from "@/Components/Common/CloudPickers/UploadSourceCard";

const isDmsEnabled = process.env.REACT_APP_ENABLE_DOCUMENT_MANAGER === "true";

const FirstStep = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();

  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileToggleStates, setFileToggleStates] = useState([]);
  const [isTemplateApplied, setIsTemplateApplied] = useState([]);
  const [registerSignID, setRegisterSignID] = useState(null);
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [fetchedData, setFetchedData] = useState({ primaryDocs: [] });
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [docName, setDocName] = useState("");
  const [documentPages, setDocumentPages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingMasterDocID, setDeletingMasterDocID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const navigate = useNavigate();
  const [templatesModalShow, setTemplatesModalShow] = useState(false);
  const [allTemplates, setAllTemplates] = useState([]);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [isOnlySigner, setIsOnlySigner] = useState(false);
  const [childRender, setChildRender] = useState(false);
  const [appliedTemplates, setAppliedTemplates] = useState({});
  const { user, userAccess, loading } = useUser("");
  const [totalPages, setTotalPages] = useState([]);
  const [templatesAppliedModal, setTemplatesAppliedModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState();
  const [matchingTemplates, setMatchingTemplates] = useState();
  const storedRegisterSignID = localStorage.getItem("registerSignID");
  const [viewMode, setViewMode] = useState("allTemplates");
  const [isDmsPickerOpen, setIsDmsPickerOpen] = useState(false);

  const handleAllTemplates = () => {
    setViewMode("allTemplates");
  };

  const handleMatchingTemplates = () => {
    setViewMode("matchingTemplates");
  };
  const handleDropboxFileSelected = (fileUrl) => {
    setSelectedFileUrl(fileUrl);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getRegisterSignData(storedRegisterSignID);

      if (response.data.successStatus) {
        setIsLoading(false);

        setFetchedData(response.data.response);
        setIsOnlySigner(response.data.response.isOnlySigner);

        // Ensure primaryDocs is an array and not undefined
        if (Array.isArray(response.data.response.primaryDocs)) {
          const uploadedDocs = response.data.response.primaryDocs.map((doc) => doc.docName);
          setUploadedFiles(uploadedDocs);

          const initialFileToggleStates = uploadedDocs.map(() => false);
          setFileToggleStates(initialFileToggleStates);

          setRegisterSignID(response.data.response.registerSignID);
          setReferenceNumber(response.data.response.referenceNumber);
          setDescription(response.data.response.description);

          const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
          setMasterDocIDs(masterDocIDs);

          setTotalPages(response.data.response.primaryDocs.map((doc) => doc.masterDocPagesCount));

          response.data.response.primaryDocs.forEach((doc) => {
            const { masterDocID, templateID } = doc;

            setAppliedTemplates((prevTemplates) => ({
              ...prevTemplates,
              [masterDocID]: templateID,
            }));
          });

          const newToggleStates = response.data.response.primaryDocs.map((doc) => doc.isPasswordProtected);
          setFileToggleStates(newToggleStates);

          const newTemplateApplied = response.data.response.primaryDocs.map((doc) => doc.isTemplateApplied);
          setIsTemplateApplied(newTemplateApplied);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (storedRegisterSignID !== null) {
      fetchData();
    }
  }, [storedRegisterSignID, userAccess]);

  const handleFileUpload = async (files) => {
    setIsLoading(true);
    const newFiles = Array.from(files);

    const allowedFileTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    const validFiles = newFiles.filter((file) => allowedFileTypes.includes(file.type));

    if (validFiles.length === 0) {
      toast.error("Only pdf and docs are allowed");
      setIsLoading(false);
    } else {
      setUploadErrorMessage("");
      const base64Files = [];

      for (const file of validFiles) {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64Data = e.target.result.split(",")[1];
          base64Files.push({
            name: file.name,
            base64: base64Data,
            MasterDocID: null,
          });

          if (base64Files.length === validFiles.length) {
            const uploadedFileNames = uploadedFiles.map((fileName) => fileName);

            const duplicateFiles = base64Files.filter((uploadedFile) => uploadedFileNames.includes(uploadedFile.name));

            if (duplicateFiles.length > 0) {
              setUploadErrorMessage(t("uploadDocFlow.filewithSameNameExits"));
              toast.error(t("uploadDocFlow.filewithSameNameExits"));
              setIsLoading(false);
            } else {
              const body = {
                IsBulk: false,
                ReferenceNumber: referenceNumber,
                Description: description,
                CreatedBy: user.email,
                IsSerial: false,
                isOnlySigner: false,
                registerSignID: registerSignID,
                PrimaryDocs: base64Files.map((uploadedFile) => {
                  const fileExtension = uploadedFile.name.split(".").pop();

                  return {
                    IsBulk: false,
                    DocName: uploadedFile.name,
                    DocExtension: fileExtension,
                    DocFile: uploadedFile.base64,
                    IsPasswordProtected: false,
                  };
                }),
              };

              try {
                const response = await uploadFlowService.registerDocs(body);

                if (response.data.statusCode === "1") {
                  setRegisterSignID(response.data.response.registerSignID);
                  localStorage.setItem("registerSignID", response.data.response.registerSignID);

                  const MasterDocId = response.data.response.masterDocs[0].masterDocIDs;
                  setMasterDocIDs((prevIDs) => [...prevIDs, MasterDocId]);

                  const pages = response.data.response.totalPages;
                  setTotalPages((prevPages) => [...prevPages, pages]);

                  setUploadedFiles([...uploadedFiles, ...base64Files.map((uploadedFile) => uploadedFile.name)]);

                  setFileToggleStates((prevStates) => [...prevStates, ...base64Files.map(() => false)]);

                  setIsTemplateApplied((prevStates) => [...prevStates, ...base64Files.map(() => false)]);

                  setUploadErrorMessage("");
                  setSelectedFile(null);
                  toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
                  handleGetTemplate(MasterDocId, pages, 0, false);

                  setIsLoading(false);
                }
              } catch (error) {
                setUploadErrorMessage(t("uploadDocFlow.errorUploadFile"));
                toast.error(t("uploadDocFlow.errorUploadFile"));
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

  const handleFileview = async (masterDocID, fileName) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getMasterDocPages(masterDocID);

      if (response.data.successStatus) {
        const pages = response.data.response;
        const pagesMap = {};
        pages.forEach((page) => {
          pagesMap[page.pagesName] = page;
        });
        setDocumentPages(pagesMap);
        setDocName(fileName);
        setShowModal(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("uploadDocFlow.filecantView"));
    }
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowConfirmModal = (masterDocID, index) => {
    setDeletingMasterDocID(masterDocID);
    setDeletingIndex(index);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleFileDelete = async (masterDocID, index) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.deleteMasterDoc({
        MasterDocID: masterDocID,
      });

      if (response.data.successStatus) {
        const updatedUploadedFiles = [...uploadedFiles];
        updatedUploadedFiles.splice(index, 1);
        setUploadedFiles(updatedUploadedFiles);

        const updatedMasterDocIDs = [...masterDocIDs];
        updatedMasterDocIDs.splice(index, 1);
        setMasterDocIDs(updatedMasterDocIDs);

        setIsLoading(false);
      }

      toast.success(t("uploadDocFlow.fileDeleted"));
    } catch (error) {
      toast.info(t("uploadDocFlow.sessionExpire"));
      setIsLoading(false);
    } finally {
      handleCloseConfirmModal();
      setIsLoading(false);
    }
  };

  const handleGetTemplate = async (masterDocID, totalDocPages, index, applyTemplate) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getTemplates();

      if (response.data.successStatus) {
        const templates = response.data.response;
        const templatesWithSamePages = templates.filter((template) => template.masterDocPagesCount === totalDocPages);

        if (templatesWithSamePages && templatesWithSamePages.length > 0 && !applyTemplate) {
          setTemplatesAppliedModal(true);
          setMatchingTemplates(templatesWithSamePages);
        } else {
          setTemplatesAppliedModal(false);
        }

        if (applyTemplate) {
          setTemplatesModalShow(true);
          setMatchingTemplates(templatesWithSamePages);
        }

        if (viewMode === "allTemplates") {
          setAllTemplates(templates);
        } else if (viewMode === "matchingTemplates") {
          setMatchingTemplates(templatesWithSamePages);
        }

        setSelectedMasterDocID(masterDocID);
        setSelectedIndex(index);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const { handleDmsDocumentSelected, isDmsUploading } = useDmsDocumentUpload({
    uploadedFiles,
    setUploadedFiles,
    masterDocIDs,
    setMasterDocIDs,
    fileToggleStates,
    setFileToggleStates,
    registerSignID,
    setRegisterSignID,
    referenceNumber,
    description,
    setTotalPages,
    setIsTemplateApplied,
    handleGetTemplate,
    onComplete: () => setIsDmsPickerOpen(false),
  });

  const handleApplyTemplate = async (templateID) => {
    setAppliedTemplates((prevTemplates) => ({
      ...prevTemplates,
      [selectedMasterDocID]: templateID,
    }));

    setChildRender(false);
    setIsLoading(true);

    const body = {
      TemplateID: templateID,
      RegisterSignID: registerSignID,
      MasterDocID: selectedMasterDocID,
    };

    try {
      const response = await uploadFlowService.applyTemplate(body);
      if (response.data.successStatus) {
        setChildRender(true);
        setTemplatesModalShow(false);
        setIsLoading(false);
        toast.success(t("templateUploadFlow.tempApplied"));
        const updatedAppliedTemplates = [...isTemplateApplied];
        updatedAppliedTemplates[selectedIndex] = true;
        setIsTemplateApplied(updatedAppliedTemplates);
      }
    } catch (error) {
      setTemplatesModalShow(false);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTemplate = async (masterDoCID, templateID, index) => {
    setChildRender(false);
    setIsLoading(true);
    const body = {
      TemplateID: templateID,
      MasterDocID: masterDoCID,
    };

    try {
      const response = await uploadFlowService.removeTemplate(body);
      if (response.data.successStatus) {
        setChildRender(true);
        setIsLoading(false);
        toast.success(t("templateUploadFlow.tempremoved"));
        setAppliedTemplates((prevTemplates) => ({
          ...prevTemplates,
          [selectedMasterDocID]: null,
        }));

        const updatedAppliedTemplates = [...isTemplateApplied];
        updatedAppliedTemplates[index] = false;
        setIsTemplateApplied(updatedAppliedTemplates);
      }
    } catch (error) {
      toast.info(t("uploadDocFlow.sessionExpire"));
    } finally {
      setIsLoading(false);
    }
  };

  const workflow = async () => {
    const StepData = {
      SignWorkFlowActivityName: "Add Signers",
      SignWorkFlowActivityRef: "2",
      SignWorkFlowActivityClass: "RED",
      RegisterSignID: registerSignID,
      IsMobile: false,
    };

    try {
      setIsLoading(true);
      const response = await uploadFlowService.createWorkflowActivity(StepData);

      setIsLoading(false);

      if (response.data.successStatus) {
        setActiveStep(2);
        setCompletedSteps([1]);
      } else {
        setUploadErrorMessage(t("uploadDocFlow.apireqFailed"));
      }
    } catch (error) {
      setIsLoading(false);
      toast.info(t("uploadDocFlow.sessionExpire"));
    }
  };

  const ReferenceDescription = async () => {
    const updatedRegDetails = {
      RegisterSignID: registerSignID,
      ReferenceNumber: referenceNumber,
      Description: description,
      IsSerial: false,
      isOnlySigner: isOnlySigner,
    };

    try {
      await uploadFlowService.updateRegisterDetails(updatedRegDetails);
    } catch (error) {
      toast.info(t("uploadDocFlow.sessionExpire"));
    }
  };

  const handleContinue = async () => {
    if (uploadedFiles.length === 0) {
      toast.error(t("uploadDocFlow.uploadAtleastOneFile"));
    } else {
      ReferenceDescription();
      workflow();
    }
  };

  const allTemplatesColumns = [
    { label: t("uploadDocFlow.templateName"), key: "templateName" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
    { label: "", key: "templateID" },
  ];
  const matchingTemplatesColumns = [
    { label: t("uploadDocFlow.templateName"), key: "templateName" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
    { label: "", key: "templateID" },
  ];

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .doc, .docx",
    onDrop: handleFileUpload,
    multiple: true,
    noClick: isDmsPickerOpen,
    noKeyboard: isDmsPickerOpen,
  });

  return (
    <>
      <Container className='upload-container'>
        <div className='mt-4'>
          <div
            {...getRootProps({
              className: "m-0 flex flex-col justify-center gap-[5px] rounded-lg border-[3px] border-dashed border-[var(--modern-border-strong)] bg-card p-10 transition-colors hover:border-primary",
            })}
          >
            <div className='my-4 flex flex-col items-center justify-center gap-4'>
              <Icons.UploadCloud size={35} color='var(--modern-primary)' />
              <label className='text-lg font-normal text-foreground'>{t("uploadDocFlow.easilyUpload")}</label>
            </div>
            <div className='grid grid-cols-1 gap-2 md:grid-cols-4'>
              <div className='min-w-0'>
                <Form.Group controlId='file-input-add' className='space-y-0'>
                  <div
                    {...getRootProps({
                      className: uploadSourceCardClassName,
                      onClick: (e) => {
                        e.stopPropagation();
                      },
                    })}
                  >
                    <Icons.Local />
                    <Form.Label className='m-0 cursor-pointer whitespace-nowrap text-sm font-medium'>{t("uploadDocFlow.local")}</Form.Label>
                    <Form.Control
                      {...getInputProps()}
                      className='!sr-only'
                      type='file'
                      name='file'
                      accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx'
                      multiple
                    />
                  </div>
                </Form.Group>
              </div>
              {isDmsEnabled && canUserStartDmsSign(user, userAccess) ? (
                <div className='min-w-0'>
                  <DmsUploadIntegration
                    onOpenPicker={() => setIsDmsPickerOpen(true)}
                    isDmsUploading={isDmsUploading}
                  />
                </div>
              ) : null}
              {user.isDropbox &&
                (userAccess.dropbox ? (
                  <div className='min-w-0'>
                    <Dropbox
                      onFileSelected={handleDropboxFileSelected}
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      masterDocIDs={masterDocIDs}
                      setMasterDocIDs={setMasterDocIDs}
                      fileToggleStates={fileToggleStates}
                      setFileToggleStates={setFileToggleStates}
                      registerSignID={registerSignID}
                      setRegisterSignID={setRegisterSignID}
                      email={user.email}
                    />
                  </div>
                ) : null)}
              {user.isGoogleDrive &&
                (userAccess.googDrive ? (
                  <div className='min-w-0'>
                    <UploadFromGoogleDrive
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      masterDocIDs={masterDocIDs}
                      setMasterDocIDs={setMasterDocIDs}
                      fileToggleStates={fileToggleStates}
                      setFileToggleStates={setFileToggleStates}
                      registerSignID={registerSignID}
                      setRegisterSignID={setRegisterSignID}
                      email={user.email}
                    />
                  </div>
                ) : null)}
              {user.isOneDrive &&
                (userAccess.oneDrive ? (
                  <div className='min-w-0'>
                    <OneDriveIntegration
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      masterDocIDs={masterDocIDs}
                      setMasterDocIDs={setMasterDocIDs}
                      fileToggleStates={fileToggleStates}
                      setFileToggleStates={setFileToggleStates}
                      registerSignID={registerSignID}
                      setRegisterSignID={setRegisterSignID}
                      email={user.email}
                    />
                  </div>
                ) : null)}
            </div>
          </div>

          {uploadErrorMessage && (
            <p className='flex items-start gap-2 text-sm italic text-[var(--modern-danger)]'>
              <Icons.AlertCircle className='mb-1 mx-2' />
              {uploadErrorMessage}
            </p>
          )}

          {loading ||
            (isLoading && (
              <div className='loader-overlay'>
                <Loader />
              </div>
            ))}

          <div className='mt-3 space-y-2' id='upload_file_bx '>
            {uploadedFiles.map((fileName, index, file) => (
              <div key={index} className='flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-3 text-foreground'>
                <p className='m-0 flex min-w-0 items-center gap-2 break-all text-sm'>
                  <Icons.PDFs size={22} />
                  {fileName} {isTemplateApplied[index] && <Icons.Templates size={18} />}
                </p>

                <div className='flex shrink-0 items-center'>
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} />
                    <Dropdown.Menu>
                      {!isTemplateApplied[index] && (
                        <Dropdown.Item
                          className='flex items-center gap-2'
                          onClick={() => {
                            handleGetTemplate(masterDocIDs[index], totalPages[index], index, true);
                          }}
                        >
                          <Icons.ApplyTemplate size={18} />
                          {t("uploadDocFlow.Applytemplate")}
                        </Dropdown.Item>
                      )}
                      {isTemplateApplied[index] && (
                        <Dropdown.Item className='flex items-center gap-2' onClick={() => handleRemoveTemplate(masterDocIDs[index], appliedTemplates[masterDocIDs[index]], index)}>
                          <Icons.RemoveTemplate size={18} />
                          {t("uploadDocFlow.removeTemplate")}
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item className='flex items-center gap-2' onClick={() => handleFileview(masterDocIDs[index], fileName)}>
                        <Icons.View size={18} />
                        {t("uploadDocFlow.view")}
                      </Dropdown.Item>

                      <Dropdown.Item className='flex items-center gap-2' onClick={() => handleShowConfirmModal(masterDocIDs[index], index)}>
                        <Icons.DeleteAction size={18} />
                        {t("uploadDocFlow.delete")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Modal show={templatesAppliedModal} onHide={() => setTemplatesAppliedModal(false)} dialogClassName='custom-modal-width'>
                    <Modal.Header closeButton>
                      <Modal.Title>{t("uploadDocFlow.saveTemplate")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='px-3 py-2'>{t("uploadDocFlow.matchingTemplates")}</Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant='none'
                        className='applyBtn'
                        onClick={() => {
                          setTemplatesAppliedModal(false);
                          setTemplatesModalShow(true);
                        }}
                      >
                        {t("uploadDocFlow.yesProceed")}
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
            ))}
          </div>

          <DeleteConfirmationModal
            show={showConfirmModal}
            onHide={handleCloseConfirmModal}
            title={t("templateConfirmationModal.Confirmation")}
            subtitle={t("templateConfirmationModal.deleteDocument")}
            warningText={t("confirmationModal.proceed")}
            itemTitle={t("uploadDocFlow.docInfo")}
            itemName={uploadedFiles[deletingIndex] || ""}
            onConfirm={() => handleFileDelete(deletingMasterDocID, deletingIndex)}
            confirmText={t("templateConfirmationModal.delete")}
            cancelText={t("templateConfirmationModal.cancel")}
            headerIcon={<Icons.DeleteAction size={25} />}
            itemIcon={<Icons.PDFCheck size={25} />}
          />

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>{docName}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='flex'>
              <Col>
                {isLoading ? (
                  <div className="flex min-h-24 items-center justify-center text-sm text-[var(--modern-muted,#64748b)]" role="status">Loading...</div>
                ) : (
                  Object.values(documentPages).map((page, index) => (
                    <div key={index} className="relative">
                      <img src={page.pagesPath} alt={page.pagesName} className="h-auto w-full" />
                      <div className="border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-3 py-2 text-center text-sm font-semibold text-[var(--modern-text,#0f172a)]">{page.pagesName}</div>
                    </div>
                  ))
                )}
              </Col>
            </Modal.Body>
          </Modal>

          <Modal show={templatesModalShow} onHide={() => setTemplatesModalShow(false)}>
            <Modal.Header closeButton>
              <Modal.Title className='flex items-center gap-2'>
                <Icons.ApplyTemplate size={25} />
                {t("uploadDocFlow.chooseTemplate")}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className='p-3'>
                <div className='flex flex-wrap gap-3'>
                  <Button variant={viewMode === "allTemplates" ? "primary" : "outline"} aria-pressed={viewMode === "allTemplates"} onClick={handleAllTemplates}>
                    {t("uploadDocFlow.Applytemplate")}
                  </Button>
                  <Button variant={viewMode === "matchingTemplates" ? "primary" : "outline"} aria-pressed={viewMode === "matchingTemplates"} onClick={handleMatchingTemplates}>
                    {t("uploadDocFlow.matchTemplates")}
                  </Button>
                </div>
              </div>
              {viewMode === "allTemplates" && (
                <TableContainer
                  component={Paper}
                  className='custom-table-scrollbar max-w-full overflow-x-auto h-[60vh]'
                >
                  <Table stickyHeader className='border-0'>
                    <TableHead>
                      <TableRow>
                        {allTemplatesColumns.map((allTemplatesColumns) => (
                          <TableCell key={allTemplatesColumns.label} className='bg-[var(--modern-raised,#f1f5f9)]'>
                            {allTemplatesColumns.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {allTemplates.length === 0 && (
                        <TableRow>
                          <td colSpan='6' className='p-5 text-center text-[var(--modern-muted,#64748b)]'>
                            <div className="flex flex-col items-center gap-2">
                              <Icons.BulkDocuments size={50} />
                              {t("dashboardCardStatuses.notDocsFound")}
                            </div>
                          </td>
                        </TableRow>
                      )}

                      {allTemplates.map((row, index) => (
                        <TableRow className='' key={index}>
                          <TableCell className='TableCell'>{row.templateName}</TableCell>
                          <TableCell className='TableCell'>{row.createdBy}</TableCell>
                          <TableCell className='TableCell'>
                            <Button variant='text' className='SignNowbtn' onClick={() => handleApplyTemplate(row.templateID)}>
                              {t("uploadDocFlow.apply")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {viewMode === "matchingTemplates" && (
                <TableContainer
                  component={Paper}
                  className='custom-table-scrollbar max-w-full overflow-x-auto h-[60vh]'
                >
                  <Table stickyHeader className='border-0'>
                    <TableHead>
                      <TableRow>
                        {matchingTemplatesColumns &&
                          matchingTemplatesColumns.map((matchingTemplatesColumns) => (
                            <TableCell key={matchingTemplatesColumns.label} className='bg-[var(--modern-raised,#f1f5f9)]'>
                              {matchingTemplatesColumns.label}
                            </TableCell>
                          ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {matchingTemplates && matchingTemplates.length === 0 && (
                        <TableRow>
                          <td colSpan='6' className='p-5 text-center text-[var(--modern-muted,#64748b)]'>
                            <div className="flex flex-col items-center gap-2">
                              <Icons.BulkDocuments size={50} color='#F0F3F4' />
                              {t("dashboardCardStatuses.notDocsFound")}
                            </div>
                          </td>
                        </TableRow>
                      )}

                      {matchingTemplates &&
                        matchingTemplates.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className='TableCell'>{row.templateName}</TableCell>
                            <TableCell className='TableCell'>{row.createdBy}</TableCell>
                            <TableCell className='TableCell'>
                              <Button variant='text' className='SignNowbtn' onClick={() => handleApplyTemplate(row.templateID)}>
                                {t("uploadDocFlow.apply")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Modal.Body>
          </Modal>
        </div>

        {fetchedData && (
          <div className='p-0 mt-3 mb-5 pb-5'>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='0'>
                <Accordion.Header>
                  <div className='flex items-center gap-2'>
                    <Icons.CraftDocument size={25} />
                    <span className="text-lg font-medium">{t("uploadDocFlow.docInfo")}</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className='p-3'>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <ReferenceNumber fetchedData={fetchedData} setFetchedData={setFetchedData} setReferenceNumber={setReferenceNumber} />
                    </div>
                    <div>
                      <Description fetchedData={fetchedData} setFetchedData={setFetchedData} setDescription={setDescription} />
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        )}

        <div className="fixed bottom-0 left-0 z-[1040] flex w-full items-center justify-end border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-5 py-2.5">
          <Button className='min-h-10 px-5 font-semibold' onClick={handleContinue} disabled={uploadedFiles.length === 0}>
            {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
            {t("uploadDocFlow.Continue")}
          </Button>
        </div>

        <div className="hidden">
          <Col md={4}>
            <ListOfDocuments
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              masterDocIDs={masterDocIDs}
              setMasterDocIDs={setMasterDocIDs}
              fileToggleStates={fileToggleStates}
              setFileToggleStates={setFileToggleStates}
              registerSignID={registerSignID}
              setRegisterSignID={setRegisterSignID}
              email={user.email}
            />
          </Col>
        </div>

        <div className="hidden">
          <Col md={4}>
            <ManualDosList
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              masterDocIDs={masterDocIDs}
              setMasterDocIDs={setMasterDocIDs}
              fileToggleStates={fileToggleStates}
              setFileToggleStates={setFileToggleStates}
              registerSignID={registerSignID}
              setRegisterSignID={setRegisterSignID}
              email={user.email}
            />
          </Col>
        </div>
      </Container>

      {isDmsEnabled && canUserStartDmsSign(user, userAccess) ? (
        <DmsDocumentPickerModal
          show={isDmsPickerOpen}
          onHide={() => setIsDmsPickerOpen(false)}
          onSelectDocument={handleDmsDocumentSelected}
        />
      ) : null}
    </>
  );
};

export default FirstStep;
