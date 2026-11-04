import React, { useState, useEffect, useRef } from "react";
import { Button, Col, Form } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  DocumentSourceCards,
  UploadedDocumentsTable,
} from "@/Components/DocumentPreparation";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import { useDropzone } from "react-dropzone";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { AppModal } from "@/Components/Common/AppModal";
import { ChevronDown } from "lucide-react";
import { getCleanTemplateNameFromFile } from "@/Components/UI/dataPrimitives";

const FirstStep = ({
  setActiveStep,
  setCompletedSteps,
  onPreviewSync,
  selectedMasterDocID,
  onSelectPreviewDoc,
}) => {
  const { t } = useTranslation();
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateScope, setTemplateScope] = useState("Individual");
  const [isLoading, setIsLoading] = useState(false);
  const [fileToggleStates, setFileToggleStates] = useState([]);
  const [registerSignID, setRegisterSignID] = useState(null);
  const [templateID, setTemplateID] = useState(null);
  const [fetchedData, setFetchedData] = useState({ primaryDocs: [] });
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [docName, setDocName] = useState("");
  const [documentPages, setDocumentPages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingMasterDocID, setDeletingMasterDocID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const { user, userAccess } = useUser();
  const persistedTemplateMeta = useRef({ name: "", scope: "Individual" });

  const storedTemplateID =
    sessionStorage.getItem("templateID") || localStorage.getItem("templateID");
  const navigate = useNavigate();

  const handleDropboxFileSelected = (fileUrl) => {
    setSelectedFileUrl(fileUrl);
  };

  useEffect(() => {
    if (typeof onPreviewSync === "function") {
      onPreviewSync({
        templateName,
        templateScope,
        uploadedFiles,
        masterDocIDs,
      });
    }
  }, [templateName, templateScope, uploadedFiles, masterDocIDs, onPreviewSync]);

  useEffect(() => {
    if (!storedTemplateID) return;

    const fetchData = async () => {
      try {
        const response = await templateService.getTemplateData(storedTemplateID);

        if (response.data.successStatus) {
          setFetchedData(response.data.response);

          if (Array.isArray(response.data.response.primaryDocs)) {
            const uploadedDocs = response.data.response.primaryDocs.map(
              (doc) => doc.docName
            );
            setUploadedFiles(uploadedDocs);

            const initialFileToggleStates = uploadedDocs.map(() => false);
            setFileToggleStates(initialFileToggleStates);

            const fetchedName = (response.data.response.templateName || "").trim();
            setTemplateID(response.data.response.templateID);
            setTemplateName(fetchedName);

            const scopeFromAPI = response.data.response.scope;
            const initialScope = scopeFromAPI === "B" ? "Business" : "Individual";
            setTemplateScope(initialScope);
            persistedTemplateMeta.current = {
              name: fetchedName,
              scope: initialScope,
            };

            const ids = response.data.response.primaryDocs.map(
              (doc) => doc.masterDocID
            );
            setMasterDocIDs(ids);

            const newToggleStates = response.data.response.primaryDocs.map(
              (doc) => doc.isPasswordProtected
            );
            setFileToggleStates(newToggleStates);
          }
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.filecantView"));
      }
    };

    fetchData();
  }, [storedTemplateID]);

  const handleFileUpload = async (acceptedFiles) => {
    setIsLoading(true);

    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = acceptedFiles.filter((file) =>
      allowedFileTypes.includes(file.type)
    );

    if (validFiles.length === 0) {
      setUploadErrorMessage(t("uploadDocFlow.formatNotAllow"));
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

            const duplicateFiles = base64Files.filter((uploadedFile) =>
              uploadedFileNames.includes(uploadedFile.name)
            );

            if (duplicateFiles.length > 0) {
              setUploadErrorMessage(t("uploadDocFlow.filewithSameNameExits"));
              toast.error(t("uploadDocFlow.filewithSameNameExits"), {
                position: "top-right",
              });
              setIsLoading(false);
            } else {
              const effectiveTemplateName = getCleanTemplateNameFromFile(
                base64Files[0]?.name,
                templateName
              );

              if (!templateName || !templateName.trim()) {
                setTemplateName(effectiveTemplateName);
              }

              const body = {
                TemplateName: effectiveTemplateName,
                TemplateID: templateID,
                Scope: templateScope === "Individual" ? "I" : "B",
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
                const response = await templateService.createTemplateDoc(body);

                if (response.data.statusCode === "1") {
                  setRegisterSignID(response.data.response.registerSignID);
                  sessionStorage.setItem(
                    "registerSignID",
                    response.data.response.registerSignID
                  );
                  localStorage.setItem(
                    "registerSignID",
                    response.data.response.registerSignID
                  );

                  setTemplateID(response.data.response.templateID);
                  sessionStorage.setItem(
                    "templateID",
                    response.data.response.templateID
                  );
                  localStorage.setItem(
                    "templateID",
                    response.data.response.templateID
                  );

                  const newMasterId =
                    response.data.response.masterDocs[0].masterDocIDs;
                  const newFileName = base64Files[0]?.name || "";

                  setMasterDocIDs((prevIDs) => [...prevIDs, newMasterId]);

                  setUploadedFiles([
                    ...uploadedFiles,
                    ...base64Files.map((uploadedFile) => uploadedFile.name),
                  ]);

                  setFileToggleStates((prevStates) => [
                    ...prevStates,
                    ...base64Files.map(() => false),
                  ]);

                  setUploadErrorMessage("");

                  if (typeof onSelectPreviewDoc === "function" && newMasterId) {
                    onSelectPreviewDoc(newMasterId, newFileName);
                  }

                  persistedTemplateMeta.current = {
                    name: effectiveTemplateName,
                    scope: templateScope,
                  };

                  toast.success(t("uploadDocFlow.fileuploadSuccessfully"));

                  setIsLoading(false);
                } else {
                  setUploadErrorMessage(t("uploadDocFlow.apireqFailed"));
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

        reader.onerror = () => {
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
  };

  const handlePasswordProtected = async (newChecked, index, masterDoCID) => {
    const updatedToggleStates = [...fileToggleStates];
    updatedToggleStates[index] = newChecked;
    setFileToggleStates(updatedToggleStates);

    try {
      await uploadFlowService.isPasswordProtected({
        MasterDocID: masterDoCID,
        IsPasswordProtected: newChecked,
      });
    } catch (error) {
      toast.info(t("uploadDocFlow.sessionExpire"));
    }
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
      toast.error(t("uploadDocFlow.errorDeletingFiles"));
    } finally {
      handleCloseConfirmModal();
      setIsLoading(false);
    }
  };

  const syncTemplateMeta = async () => {
    if (!templateID) return;
    const currentName = templateName?.trim();
    if (!currentName) return;

    const hasNameChanged = currentName !== persistedTemplateMeta.current.name;
    const hasScopeChanged = templateScope !== persistedTemplateMeta.current.scope;

    if (!hasNameChanged && !hasScopeChanged) {
      return;
    }

    try {
      await templateService.updateTemplate({
        TemplateID: templateID,
        TemplateName: currentName,
        Scope: templateScope === "Individual" ? "I" : "B",
      });
      persistedTemplateMeta.current = {
        name: currentName,
        scope: templateScope,
      };
    } catch (_) {}
  };

  const handleTemplateNameBlur = () => {
    syncTemplateMeta();
  };

  const handleScopeChange = (newScope) => {
    setTemplateScope(newScope);
    if (templateID && newScope !== persistedTemplateMeta.current.scope && templateName?.trim()) {
      templateService
        .updateTemplate({
          TemplateID: templateID,
          TemplateName: templateName.trim(),
          Scope: newScope === "Individual" ? "I" : "B",
        })
        .then(() => {
          persistedTemplateMeta.current.scope = newScope;
        })
        .catch(() => {});
    }
  };

  const handleContinue = async () => {
    if (uploadedFiles.length === 0) {
      toast.error(t("uploadDocFlow.uploadAtleastOneFile"));
      return;
    }

    await syncTemplateMeta();

    setActiveStep(2);
    setCompletedSteps([1]);
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

  const isReady = uploadedFiles.length > 0;

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
          {t(
            "templateUploadFlow.chooseTemplateFileSub",
            "Choose the file to use for this template"
          )}
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
            setTemplateID,
            TemplateID: templateID,
            templateScope,
            templateName,
            setTemplateName,
          }}
          googleDriveProps={{
            uploadedFiles,
            setUploadedFiles,
            masterDocIDs,
            setMasterDocIDs,
            fileToggleStates,
            setFileToggleStates,
            setTemplateID,
            TemplateID: templateID,
            templateScope,
            templateName,
            setTemplateName,
          }}
          uploadErrorMessage={uploadErrorMessage}
          t={t}
          compactStudio={true}
        />

        <UploadedDocumentsTable
          uploadedFiles={uploadedFiles}
          masterDocIDs={masterDocIDs}
          onViewFile={handleFileview}
          onDeleteFile={handleShowConfirmModal}
          t={t}
          compactStudio={true}
          selectedMasterDocID={selectedMasterDocID}
          onSelectFile={onSelectPreviewDoc}
        />

        {/* Collapsible Template Information Section */}
        <div className='mt-3.5 overflow-hidden rounded-2xl border-0 bg-transparent'>
          <button
            type='button'
            aria-expanded={isInfoOpen}
            onClick={() => setIsInfoOpen((prev) => !prev)}
            className='flex w-full items-center gap-2.5 border-0 bg-transparent px-1 py-2.5 text-start text-sm font-semibold text-[var(--modern-text)] transition-colors hover:text-[var(--modern-primary)] outline-none focus:outline-none focus:ring-0 shadow-none cursor-pointer'
            style={{ border: "none", outline: "none", background: "transparent", boxShadow: "none" }}
          >
            <span className='text-[var(--modern-primary)]'>
              <Icons.DocumentReport size={18} />
            </span>
            <span className='flex-1'>{t("templateUploadFlow.templateInfo", "Template Information")}</span>
            <ChevronDown
              size={16}
              className={`text-[var(--modern-muted)] transition-transform duration-200 ${
                isInfoOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isInfoOpen && (
            <div className='space-y-3.5 px-1 pt-2 pb-2'>
              <div>
                <Form.Group controlId='templateName' className='space-y-1.5'>
                  <Form.Label className='mb-1 block text-xs font-medium text-[var(--modern-muted)]'>
                    {t("templateUploadFlow.templateName")}{" "}
                    <span className='mx-0.5 text-[var(--modern-danger,#ef4444)]'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    onBlur={handleTemplateNameBlur}
                    placeholder={t("templateUploadFlow.enterTemplateName")}
                    className='!h-[42px] !rounded-xl'
                  />
                </Form.Group>
              </div>

              <div>
                <div className='space-y-1.5 border-0 p-0 m-0'>
                  <label className='mb-1 block text-xs font-medium text-[var(--modern-muted)]'>
                    {t("templateUploadFlow.templateScope")}
                    <span className='mx-0.5 text-[var(--modern-danger,#ef4444)]'>*</span>
                  </label>
                  <div className='grid grid-cols-2 gap-2.5'>
                    <label
                      htmlFor='individual'
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                        templateScope === "Individual"
                          ? "bg-[var(--modern-raised)] text-[var(--modern-primary)]"
                          : "bg-[var(--modern-card)] text-[var(--modern-muted)] hover:bg-[var(--modern-raised)] hover:text-[var(--modern-text)]"
                      }`}
                    >
                      <input
                        className='h-4 w-4 accent-[var(--modern-primary,#4d8dff)]'
                        type='radio'
                        name='templateScope'
                        id='individual'
                        value='Individual'
                        checked={templateScope === "Individual"}
                        onChange={() => handleScopeChange("Individual")}
                      />
                      <span>{t("templateUploadFlow.Individual")}</span>
                    </label>

                    <label
                      htmlFor='business'
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                        templateScope === "Business"
                          ? "bg-[var(--modern-raised)] text-[var(--modern-primary)]"
                          : "bg-[var(--modern-card)] text-[var(--modern-muted)] hover:bg-[var(--modern-raised)] hover:text-[var(--modern-text)]"
                      }`}
                    >
                      <input
                        className='h-4 w-4 accent-[var(--modern-primary,#4d8dff)]'
                        type='radio'
                        name='templateScope'
                        id='business'
                        value='Business'
                        checked={templateScope === "Business"}
                        onChange={() => handleScopeChange("Business")}
                      />
                      <span>{t("templateUploadFlow.Company")}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Studio Sticky Footer (.pfoot) */}
      <div className='mt-auto flex items-center justify-between gap-3 border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f8fafc)]/80 px-5 py-3.5'>
        <div className='flex min-w-0 flex-1 items-center gap-2 text-xs text-[var(--modern-muted,#64748b)]'>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isReady
                ? "bg-[var(--modern-success,#10b981)]"
                : "bg-[var(--modern-warning,#f59e0b)]"
            }`}
          />
          <span className='truncate'>
            {isReady
              ? t("uploadDocFlow.documentReady", "Document ready")
              : t("uploadDocFlow.uploadAtleastOneFile", "Add a document to continue")}
          </span>
        </div>

        <Button
          variant='primary'
          className='!h-[42px] !rounded-full !px-5 font-semibold inline-flex items-center gap-2 shrink-0'
          onClick={handleContinue}
          disabled={isLoading}
        >
          {isLoading && (
            <span
              aria-hidden='true'
              className='h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent'
            />
          )}
          <span>{t("uploadDocFlow.Continue")}</span>
          <Icons.ArrowRightLong size={15} className='rtl:rotate-180' />
        </Button>
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

      <AppModal
        open={showModal}
        onClose={handleCloseModal}
        title={docName}
        size='xl'
        footer={
          <div className='flex w-full justify-end gap-3'>
            <Button variant='outline' onClick={handleCloseModal}>
              {t("templateConfirmationModal.cancel", "Close")}
            </Button>
          </div>
        }
      >
        <div className='max-h-[72vh] space-y-4 overflow-y-auto p-1'>
          {isLoading ? (
            <div
              className='flex min-h-24 items-center justify-center text-sm text-[var(--modern-muted,#64748b)]'
              role='status'
            >
              Loading...
            </div>
          ) : (
            Object.values(documentPages).map((page, index) => (
              <div
                key={index}
                className='overflow-hidden rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-white'
              >
                <img
                  src={page.pagesPath}
                  alt={page.pagesName}
                  className='h-auto w-full block'
                />
                <div className='border-t border-[var(--modern-border)] bg-[var(--modern-raised)] px-3 py-2 text-center text-xs font-semibold text-[var(--modern-text)]'>
                  {page.pagesName}
                </div>
              </div>
            ))
          )}
        </div>
      </AppModal>
    </div>
  );
};

export default FirstStep;
