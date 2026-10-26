import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Modal, Row, Dropdown } from "@/Components/UI/shadcnCompat";
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

const FirstStep = ({ setActiveStep, setCompletedSteps }) => {
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
  const { user, userAccess } = useUser();

  const storedTemplateID = sessionStorage.getItem("templateID") || localStorage.getItem("templateID");
  const navigate = useNavigate();

  const handleDropboxFileSelected = (fileUrl) => {
    setSelectedFileUrl(fileUrl);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await templateService.getTemplateData(storedTemplateID);

        if (response.data.successStatus) {
          setFetchedData(response.data.response);

          // Ensure primaryDocs is an array and not undefined
          if (Array.isArray(response.data.response.primaryDocs)) {
            const uploadedDocs = response.data.response.primaryDocs.map((doc) => doc.docName);
            setUploadedFiles(uploadedDocs);

            const initialFileToggleStates = uploadedDocs.map(() => false);
            setFileToggleStates(initialFileToggleStates);

            setTemplateID(response.data.response.templateID);
            setTemplateName(response.data.response.templateName || "");

            const scopeFromAPI = response.data.response.scope;
            if (scopeFromAPI === "I") {
              setTemplateScope("Individual");
            } else if (scopeFromAPI === "B") {
              setTemplateScope("Business");
            } else {
              setTemplateScope("Individual"); // fallback
            }

            const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
            setMasterDocIDs(masterDocIDs);

            const newToggleStates = response.data.response.primaryDocs.map((doc) => doc.isPasswordProtected);
            setFileToggleStates(newToggleStates);
          }
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.filecantView"));
      }
    };

    fetchData();
  }, [userAccess]);

  const handleFileUpload = async (acceptedFiles) => {
    setIsLoading(true);

    //console.log("new files", newFiles);
    const allowedFileTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    const validFiles = acceptedFiles.filter((file) => allowedFileTypes.includes(file.type));

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

          // console.log(base64Files);
          if (base64Files.length === validFiles.length) {
            const uploadedFileNames = uploadedFiles.map((fileName) => fileName);

            const duplicateFiles = base64Files.filter((uploadedFile) => uploadedFileNames.includes(uploadedFile.name));

            if (duplicateFiles.length > 0) {
              setUploadErrorMessage(t("uploadDocFlow.filewithSameNameExits"));
              toast.error(t("uploadDocFlow.filewithSameNameExits"), {
                position: "top-right",
              });
              setIsLoading(false);
            } else {
              const body = {
                TemplateName: templateName || "Template",
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
                  sessionStorage.setItem("registerSignID", response.data.response.registerSignID);
                  localStorage.setItem("registerSignID", response.data.response.registerSignID);
                  // template
                  setTemplateID(response.data.response.templateID);
                  sessionStorage.setItem("templateID", response.data.response.templateID);
                  localStorage.setItem("templateID", response.data.response.templateID);

                  setMasterDocIDs((prevIDs) => [...prevIDs, response.data.response.masterDocs[0].masterDocIDs]);

                  setUploadedFiles([...uploadedFiles, ...base64Files.map((uploadedFile) => uploadedFile.name)]);
                  // console.log([...uploadedFiles]);

                  setFileToggleStates((prevStates) => [...prevStates, ...base64Files.map(() => false)]);

                  setUploadErrorMessage("");

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

        reader.onerror = (error) => {
          isLoading(false);
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
        // console.error("API request failed");
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

  // confirmation modal
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

  const handleContinue = () => {
    if (uploadedFiles.length === 0) {
      toast.error(t("uploadDocFlow.uploadAtleastOneFile"));
    } else {
      setActiveStep(2);
      setCompletedSteps([1]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .doc, .docx",
    onDrop: handleFileUpload,
    multiple: true,
  });

  return (
    <>
      <Container className='uploadDoc-container'>
        <div className="mt-4 rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] p-4">
          <div className="flex items-center gap-2">
            <Icons.DocumentReport size={25} />
            <span className="text-lg font-medium text-[var(--modern-text,#0f172a)]">{t("templateUploadFlow.templateInfo")}</span>
          </div>

          <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Form.Group controlId='templateName' className='space-y-2'>
                <Form.Label>
                  {t("templateUploadFlow.templateName")} <span className="mx-1 text-[var(--modern-danger,#ef4444)]">*</span>
                </Form.Label>
                <Form.Control type='text' value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder={t("templateUploadFlow.enterTemplateName")} />
              </Form.Group>
            </div>
            <div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-[var(--modern-text,#0f172a)]">
                  {t("templateUploadFlow.templateScope")}
                  <span className="mx-1 text-[var(--modern-danger,#ef4444)]">*</span>
                </legend>
                <div className="flex flex-wrap gap-4">
                  <div className="inline-flex items-center gap-2">
                    <input
                      className="h-4 w-4 accent-[var(--modern-primary,#6366f1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]"
                      type='radio'
                      name='templateScope'
                      id='individual'
                      value='Individual'
                      checked={templateScope === "Individual"}
                      onChange={(e) => {
                        setTemplateScope(e.target.value);
                      }}
                    />
                    <label className="text-sm text-[var(--modern-text,#0f172a)]" htmlFor='individual'>
                      {t("templateUploadFlow.Individual")}
                    </label>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <input
                      className="h-4 w-4 accent-[var(--modern-primary,#6366f1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-primary,#6366f1)]"
                      type='radio'
                      name='templateScope'
                      id='business'
                      value='Business'
                      checked={templateScope === "Business"}
                      onChange={(e) => {
                        setTemplateScope(e.target.value);
                      }}
                    />
                    <label className="text-sm text-[var(--modern-text,#0f172a)]" htmlFor='business'>
                      {t("templateUploadFlow.Company")}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <div className="mt-4">
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
            }}
            uploadErrorMessage={uploadErrorMessage}
            t={t}
          />

          <UploadedDocumentsTable
            uploadedFiles={uploadedFiles}
            masterDocIDs={masterDocIDs}
            onViewFile={handleFileview}
            onDeleteFile={handleShowConfirmModal}
            t={t}
          />

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
        </div>

        <div className='mt-3 mb-0 flex justify-end'>
          <Button className='min-h-10 px-5 font-semibold' onClick={handleContinue}>
            {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
            {t("uploadDocFlow.Continue")}
          </Button>
        </div>
      </Container>
    </>
  );
};

export default FirstStep;
