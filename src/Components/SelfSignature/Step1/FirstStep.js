import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Modal, Row, Dropdown, Accordion } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  ReferenceNumber,
  Description,
  DocumentSourceCards,
  UploadedDocumentsTable,
} from "@/Components/DocumentPreparation";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { useDropzone } from "react-dropzone";
import { Icons } from "@/assets/Icons";
import { ChevronDown } from "lucide-react";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";

const FirstStep = ({
  setActiveStep,
  setCompletedSteps,
  onPreviewSync,
  selectedMasterDocID,
  onSelectPreviewDoc,
  compactStudio = false,
}) => {
  const { t } = useTranslation();

  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [recipientErrorMessage, setRecipientErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileToggleStates, setFileToggleStates] = useState([]);
  const [isTemplateApplied, setIsTemplateApplied] = useState([]);
  const [registerSignID, setRegisterSignID] = useState(null);
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("Self Signature");
  const [fetchedData, setFetchedData] = useState({ primaryDocs: [] });
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [docName, setDocName] = useState("");
  const [documentPages, setDocumentPages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingMasterDocID, setDeletingMasterDocID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [isSerial, setIsSerial] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const navigate = useNavigate();
  const [isOnlySigner, setIsOnlySigner] = useState(false);
  const { user, userAccess, loading } = useUser("");
  const [totalPages, setTotalPages] = useState([]);
  const storedRegisterSignID = localStorage.getItem("registerSignID");
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const handleDropboxFileSelected = (fileUrl) => {
    setSelectedFileUrl(fileUrl);
  };

  useEffect(() => {
    if (typeof onPreviewSync === "function") {
      onPreviewSync({
        uploadedFiles,
        masterDocIDs,
      });
    }
  }, [uploadedFiles, masterDocIDs, onPreviewSync]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getRegisterSignData(storedRegisterSignID);

      if (response.data.successStatus) {
        setIsLoading(false);

        setFetchedData(response.data.response);
        setIsOnlySigner(response.data.response.isOnlySigner);

        if (Array.isArray(response.data.response.primaryDocs)) {
          const uploadedDocs = response.data.response.primaryDocs.map((doc) => doc.docName);
          setUploadedFiles(uploadedDocs);

          const initialFileToggleStates = uploadedDocs.map(() => false);
          setFileToggleStates(initialFileToggleStates);

          setRegisterSignID(response.data.response.registerSignID);
          setReferenceNumber(response.data.response.referenceNumber);
          setDescription(response.data.response.description);
          setIsSerial(response.data.response.isSerial);

          setFormData(response.data.response);

          const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
          setMasterDocIDs(masterDocIDs);

          setTotalPages(response.data.response.primaryDocs.map((doc) => doc.masterDocPagesCount));

          const newToggleStates = response.data.response.primaryDocs.map((doc) => doc.isPasswordProtected);
          setFileToggleStates(newToggleStates);

          const newTemplateApplied = response.data.response.primaryDocs.map((doc) => doc.isTemplateApplied);
          setIsTemplateApplied(newTemplateApplied);
        }
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.errorFetchingData"));
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
                IsSerial: true,
                isOnlySigner: false,
                registerSignID: registerSignID,
                PrimaryDocs: base64Files.map((uploadedFile) => {
                  const fileExtension = uploadedFile.name.split(".").pop();

                  return {
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
                  // handleGetTemplate(MasterDocId, pages, 0, false);

                  setIsFileUploaded(true);
                  setIsLoading(false);
                }
              } catch (error) {
                setUploadErrorMessage(t("uploadDocFlow.errorUploadFile"));
                toast.error(t("uploadDocFlow.errorUploadFile"), {
                  position: "top-right",
                });
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

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      setIsFileUploaded(true);
    } else {
      setIsFileUploaded(false);
    }
  }, [uploadedFiles]);

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
      const response = await uploadFlowService.deleteMasterDoc({ MasterDocID: masterDocID });

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
      toast.error(t("uploadDocFlow.errorDeletingFiles"));
      setIsLoading(false);
    } finally {
      handleCloseConfirmModal();
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
    }
  };

  const ReferenceDescription = async () => {
    const updatedRegDetails = {
      RegisterSignID: registerSignID,
      ReferenceNumber: referenceNumber,
      Description: description,
      IsSerial: isSerial,
      isOnlySigner: isOnlySigner,
    };

    try {
      await uploadFlowService.updateRegisterDetails(updatedRegDetails);
    } catch (error) {
      // Handle error gracefully
    }
  };

  const storedSignatoriesID = localStorage.getItem("signatoriesID");

  const handleContinue = async () => {
    const apiBody = {
      RegisterSignID: storedRegisterSignID,
      IsSerial: true,
      Signatories: [
        {
          Name: user.fullName,
          NotificationType: "Email",
          Email: user.email,
          CountryCode: "",
          Mobile: "",
          Company: "",
          SignOrder: 1,
          SignatureType: "Needs To Sign",
          SignatureColor: "#E84600",
          SignPage: "FirstPage",
          SignPosition: "TopLeft",
          Ismobile: false,
          ExpiryDate: "2026-12-16",
          IsExpiring: false,
          IsPasswordProtected: false,
          LanguageType: "English",
          VerificationType: "None",
          SignatoriesID: storedSignatoriesID || null,
        },
      ],
    };
    try {
      setIsLoading(true);
      const response = await uploadFlowService.createBulkSignatory(apiBody);

      if (response.data.statusCode === "1") {
        const responseData = response.data.response;

        if (responseData.length > 0) {
          const signatoriesID = responseData[0].signatoriesID;
          localStorage.setItem("signatoriesID", signatoriesID);
        } else {
          const existingID = localStorage.getItem("signatoriesID");
          if (!existingID) {
            throw new Error("Missing signatories ID");
          }
        }

        await ReferenceDescription();
        await workflow();
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("uploadDocFlow.errorWhileContinuing"));
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    onDrop: handleFileUpload,
    multiple: true,
  });

  if (compactStudio) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        {/* Studio Panel Header (.phead) */}
        <div className='px-5 pt-5 pb-1.5'>
          <small className='block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--modern-primary,#4d8dff)]'>
            {t("uploadDocFlow.step", "STEP")} 1 {t("uploadDocFlow.of", "OF")} 3
          </small>
          <h1 className='mt-0.5 text-[22px] font-bold tracking-tight text-[var(--modern-text)]'>
            {t("Stepper.uploadDocument", "Upload Document")}
          </h1>
          <p className='mt-1 text-[13px] text-[var(--modern-muted)]'>
            {t("uploadDocFlow.chooseFileSubSelf", "Choose the file you want to sign")}
          </p>
        </div>

        {/* Studio Scrollable Body (.pbody) */}
        <div className='min-h-0 flex-1 overflow-y-auto px-5 pt-3.5 pb-5'>
          <DocumentSourceCards
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            user={user}
            userAccess={userAccess}
            dropboxProps={{
              onFileSelected: handleDropboxFileSelected,
              uploadedFiles,
              setUploadedFiles,
              masterDocIDs,
              setMasterDocIDs,
              fileToggleStates,
              setFileToggleStates,
              registerSignID,
              setRegisterSignID,
              email: user.email,
            }}
            googleDriveProps={{
              uploadedFiles,
              setUploadedFiles,
              masterDocIDs,
              setMasterDocIDs,
              fileToggleStates,
              setFileToggleStates,
              registerSignID,
              setRegisterSignID,
              email: user.email,
            }}
            uploadErrorMessage={uploadErrorMessage}
            t={t}
            compactStudio={true}
          />

          <UploadedDocumentsTable
            uploadedFiles={uploadedFiles}
            isTemplateApplied={isTemplateApplied}
            masterDocIDs={masterDocIDs}
            onViewFile={handleFileview}
            onDeleteFile={handleShowConfirmModal}
            t={t}
            compactStudio={true}
            selectedMasterDocID={selectedMasterDocID}
            onSelectFile={onSelectPreviewDoc}
          />

          {/* Collapsible Document Information */}
          {fetchedData && (
            <div className='mt-3.5 overflow-hidden rounded-2xl border-0 bg-transparent'>
              <button
                type='button'
                aria-expanded={isInfoOpen}
                onClick={() => setIsInfoOpen((prev) => !prev)}
                className='flex w-full items-center gap-2.5 border-0 bg-transparent px-1 py-2.5 text-start text-sm font-semibold text-[var(--modern-text)] transition-colors hover:text-[var(--modern-primary)] outline-none focus:outline-none focus:ring-0 shadow-none cursor-pointer'
                style={{ border: "none", outline: "none", background: "transparent", boxShadow: "none" }}
              >
                <span className='text-[var(--modern-primary)]'>
                  <Icons.CraftDocument size={16} />
                </span>
                <span className='flex-1 text-xs font-semibold'>{t("uploadDocFlow.docInfo", "Document Information")}</span>
                <span className='text-[10px] text-[var(--modern-muted)] font-normal mr-1 rtl:mr-0 rtl:ml-1'>
                  {t("common.optional", "Optional")}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-[var(--modern-muted)] transition-transform duration-200 ${
                    isInfoOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isInfoOpen && (
                <div className='space-y-3.5 px-1 pt-2 pb-2'>
                  <ReferenceNumber fetchedData={fetchedData} setFetchedData={setFetchedData} setReferenceNumber={setReferenceNumber} />
                  <Description fetchedData={fetchedData} setFetchedData={setFetchedData} setDescription={setDescription} />
                </div>
              )}
            </div>
          )}

          {recipientErrorMessage && (
            <p className='mt-3 flex items-start gap-2 text-sm text-[var(--modern-danger,#ef4444)]'>
              <Icons.AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              {recipientErrorMessage}
            </p>
          )}
        </div>

        {/* Studio Sticky Footer (.pfoot) */}
        <div className='mt-auto flex items-center justify-between gap-3 border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/80 px-5 py-3.5'>
          <div className='flex min-w-0 flex-1 items-center gap-2 text-xs text-[var(--modern-muted,#64748b)]'>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                isFileUploaded
                  ? "bg-[var(--modern-success,#10b981)]"
                  : "bg-[var(--modern-warning,#f59e0b)]"
              }`}
            />
            <span className='truncate'>
              {isFileUploaded
                ? t("uploadDocFlow.documentReady", "Document ready")
                : t("uploadDocFlow.uploadAtleastOneFile", "Add a document to continue")}
            </span>
          </div>

          <Button
            variant='primary'
            className='!h-[42px] !rounded-full !px-5 font-semibold inline-flex items-center gap-2 shrink-0'
            id='hide_part_one'
            onClick={handleContinue}
            disabled={!isFileUploaded || isLoading}
          >
            {isLoading && (
              <span aria-hidden='true' className='h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent' />
            )}
            <span>{t("uploadDocFlow.Continue")}</span>
            <Icons.ArrowRightLong size={15} className='rtl:rotate-180' />
          </Button>
        </div>

        {/* Document View Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered dialogClassName="!max-w-4xl !w-[94vw] mx-auto">
          <Modal.Header closeButton className='border-b border-[var(--modern-border)]'>
            <Modal.Title className='text-base font-semibold text-[var(--modern-text)]'>{docName}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='p-4 max-h-[70vh] overflow-y-auto'>
            <Col>
              {isLoading ? (
                <div className="flex min-h-24 items-center justify-center text-sm text-[var(--modern-muted,#64748b)]" role="status">Loading...</div>
              ) : (
                Object.values(documentPages).map((page, index) => (
                  <div key={index} className="relative mb-4 rounded-xl overflow-hidden border border-[var(--modern-border)]">
                    <img src={page.pagesPath} alt={page.pagesName} className="h-auto w-full" />
                    <div className="border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-3 py-2 text-center text-xs font-semibold text-[var(--modern-text,#0f172a)]">{page.pagesName}</div>
                  </div>
                ))
              )}
            </Col>
          </Modal.Body>
        </Modal>

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
          itemIcon={<Icons.PDFs size={25} />}
        />
      </div>
    );
  }

  return (
    <>
      <div className='w-full bg-[var(--modern-card,#ffffff)] border border-[var(--modern-border,rgba(52,40,100,0.14))] rounded-2xl p-6 sm:p-8'>
        <div className='flex flex-col gap-6'>
          <DocumentSourceCards
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            user={user}
            userAccess={userAccess}
            dropboxProps={{
              onFileSelected: handleDropboxFileSelected,
              uploadedFiles,
              setUploadedFiles,
              masterDocIDs,
              setMasterDocIDs,
              fileToggleStates,
              setFileToggleStates,
              registerSignID,
              setRegisterSignID,
              email: user.email,
            }}
            googleDriveProps={{
              uploadedFiles,
              setUploadedFiles,
              masterDocIDs,
              setMasterDocIDs,
              fileToggleStates,
              setFileToggleStates,
              registerSignID,
              setRegisterSignID,
              email: user.email,
            }}
            uploadErrorMessage={uploadErrorMessage}
            t={t}
          />

          <UploadedDocumentsTable
            uploadedFiles={uploadedFiles}
            isTemplateApplied={isTemplateApplied}
            masterDocIDs={masterDocIDs}
            onViewFile={handleFileview}
            onDeleteFile={handleShowConfirmModal}
            t={t}
          />

          {/* Document View */}
          <Modal show={showModal} onHide={handleCloseModal} size="lg" centered dialogClassName="!max-w-4xl !w-[94vw] mx-auto">
            <Modal.Header closeButton className='border-b border-[var(--modern-border)]'>
              <Modal.Title className='text-base font-semibold text-[var(--modern-text)]'>{docName}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-4 max-h-[70vh] overflow-y-auto'>
              <Col>
                {isLoading ? (
                  <div className="flex min-h-24 items-center justify-center text-sm text-[var(--modern-muted,#64748b)]" role="status">Loading...</div>
                ) : (
                  Object.values(documentPages).map((page, index) => (
                    <div key={index} className="relative mb-4 rounded-xl overflow-hidden border border-[var(--modern-border)]">
                      <img src={page.pagesPath} alt={page.pagesName} className="h-auto w-full" />
                      <div className="border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-3 py-2 text-center text-xs font-semibold text-[var(--modern-text,#0f172a)]">{page.pagesName}</div>
                    </div>
                  ))
                )}
              </Col>
            </Modal.Body>
          </Modal>
        </div>

        {fetchedData && (
          <div className='my-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-raised)] overflow-hidden'>
            <Accordion defaultActiveKey='0'>
              <Accordion.Item eventKey='0' className='!border-0 !bg-transparent'>
                <Accordion.Header className='!border-0'>
                  <div className='flex items-center gap-2.5 py-1 text-[var(--modern-text)]'>
                    <Icons.CraftDocument size={20} className='text-[var(--modern-primary)]' />
                    <span className="text-base font-semibold">{t("uploadDocFlow.docInfo")}</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body className='p-4 pt-1'>
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

        {recipientErrorMessage && (
          <p className='mt-3 flex items-start gap-2 text-sm text-[var(--modern-danger,#ef4444)]'>
            <Icons.AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            {recipientErrorMessage}
          </p>
        )}

        <div className='mt-6 pt-4 border-t border-[var(--modern-border)] flex justify-end'>
          <Button
            className='min-h-[44px] px-8 rounded-full font-semibold inline-flex items-center gap-2'
            id='hide_part_one'
            onClick={handleContinue}
            disabled={!isFileUploaded || isLoading}
          >
            {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
            <span>{t("uploadDocFlow.Continue")}</span>
          </Button>
        </div>
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
        itemIcon={<Icons.PDFs size={25} />}
      />
    </>
  );
};

export default FirstStep;
