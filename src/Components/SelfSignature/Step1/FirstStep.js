import React, { useState, useEffect } from "react";
import { Button, Col, Container, Form, Modal, Row, Dropdown, Accordion } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReferenceNumber from "@/Components/DocumentPreparation/Step1_Source/ReferenceNumber";
import Description from "@/Components/DocumentPreparation/Step1_Source/Description";
import { DropboxPicker as Dropbox, GoogleDrivePicker as UploadFromGoogleDrive } from "@/Components/Common/CloudPickers";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { useDropzone } from "react-dropzone";
import { Icons } from "@/assets/Icons";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { uploadSourceCardClassName } from "@/Components/Common/CloudPickers/UploadSourceCard";

const FirstStep = ({ setActiveStep, setCompletedSteps }) => {
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
  const navigate = useNavigate();
  const [isOnlySigner, setIsOnlySigner] = useState(false);
  const { user, userAccess, loading } = useUser("");
  const [totalPages, setTotalPages] = useState([]);
  const storedRegisterSignID = localStorage.getItem("registerSignID");
  const [isFileUploaded, setIsFileUploaded] = useState(false);

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
    accept: ".pdf, .doc, .docx",
    onDrop: handleFileUpload,
    multiple: true,
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
                  {fileName}
                </p>

                <div className='flex shrink-0 items-center'>
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} />
                    <Dropdown.Menu>
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
                </div>
              </div>
            ))}
          </div>

          {/* Document View */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header>
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

        {fetchedData && (
          <div className='p-0 my-3'>
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

        {recipientErrorMessage && (
          <p className='flex items-start gap-2 text-sm text-[var(--modern-danger,#ef4444)]'>
            <Icons.AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            {recipientErrorMessage}
          </p>
        )}

        <div className='mt-3 flex justify-end'>
          <Button className='mb-3 min-h-10 px-5 font-semibold' id='hide_part_one' onClick={handleContinue} disabled={!isFileUploaded}>
            {isLoading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
            {t("uploadDocFlow.Continue")}
          </Button>
        </div>
      </Container>

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
