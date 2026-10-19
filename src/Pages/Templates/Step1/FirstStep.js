import React, { useState, useEffect } from "react";
import "./FirstStep.css";
import { Button, Col, Container, Form, Modal, Row, Dropdown } from "react-bootstrap";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Dropbox from "./Dropbox";
import UploadFromGoogleDrive from "./GoogleDrive";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import Loader from "@/Components/CommonModals/Loader/Loader";
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

  const storedTemplateID = localStorage.getItem("templateID");
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
                  localStorage.setItem("registerSignID", response.data.response.registerSignID);
                  // template
                  setTemplateID(response.data.response.templateID);
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
        <div style={{ padding: "15px", backgroundColor: "var(--bg-primary)", borderRadius: "10px", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icons.DocumentReport size={25} />
            <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("templateUploadFlow.templateInfo")}</label>
          </div>

          <Row className='d-flex flex-column my-4 gap-3'>
            <Col md={6}>
              <Form.Group controlId='templateName' className=' mx-2'>
                <Form.Label>
                  {t("templateUploadFlow.templateName")} <span className='required mx-1'>*</span>
                </Form.Label>
                <Form.Control type='text' value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder={t("templateUploadFlow.enterTemplateName")} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId='templateName' className='mx-2'>
                <Form.Label>
                  {t("templateUploadFlow.templateScope")}
                  <span className='required mx-1'>*</span>
                </Form.Label>
                <div>
                  <div className='form-check form-check-inline particles-checkbox-container'>
                    <input
                      className='temp-particles-checkbox'
                      type='radio'
                      name='templateScope'
                      id='individual'
                      value='Individual'
                      checked={templateScope === "Individual"}
                      onChange={(e) => {
                        setTemplateScope(e.target.value);
                      }}
                    />
                    <label className='mx-2' htmlFor='individual'>
                      {t("templateUploadFlow.Individual")}
                    </label>
                  </div>
                  <div className='form-check form-check-inline particles-checkbox-container'>
                    <input
                      className='temp-particles-checkbox'
                      type='radio'
                      name='templateScope'
                      id='business'
                      value='Business'
                      checked={templateScope === "Business"}
                      onChange={(e) => {
                        setTemplateScope(e.target.value);
                      }}
                    />
                    <label className='mx-2' htmlFor='business'>
                      {t("templateUploadFlow.Company")}
                    </label>
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <>
            <Row
              className='justify-content-center m-0'
              style={{
                border: "3px dashed var(--theme-color)",
                padding: "40px",
                borderRadius: "10px",
                background: "var(--bg-primary)",
                gap: "5px",
              }}
              {...getRootProps()}
            >
              <div className='drag-file'>
                <Icons.UploadCloud size={35} color='var(--theme-color)' />
                <label style={{ fontSize: "18px", fontWeight: "400" }}>{t("uploadDocFlow.easilyUpload")}</label>
              </div>

              <Col md={3}>
                <div className='uplad_box'>
                  <Form.Group controlId='file-input-add' className='file-upload_temp'>
                    <div
                      {...getRootProps({
                        className: "upload_trigger_bx",
                        onClick: (e) => {
                          e.stopPropagation();
                        },
                      })}
                    >
                      <Icons.Local />
                      <Form.Label>{t("uploadDocFlow.local")}</Form.Label>
                      <Form.Control
                        {...getInputProps()}
                        className='temp_file-input-additional'
                        type='file'
                        name='file'
                        accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx'
                        multiple
                        style={{ display: "none" }}
                      />
                      <div className='upload_doc_part'></div>
                    </div>
                  </Form.Group>
                </div>
              </Col>

              {user.isDropbox &&
                (userAccess.dropbox ? (
                  <Col md={3}>
                    <Dropbox
                      onFileSelected={handleDropboxFileSelected}
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      masterDocIDs={masterDocIDs}
                      setMasterDocIDs={setMasterDocIDs}
                      fileToggleStates={fileToggleStates}
                      setFileToggleStates={setFileToggleStates}
                      setTemplateID={setTemplateID}
                      TemplateID={templateID}
                      templateScope={templateScope}
                      templateName={templateName}
                    />
                  </Col>
                ) : null)}

              {user.isGoogleDrive &&
                (userAccess.googDrive ? (
                  <Col md={3}>
                    <UploadFromGoogleDrive
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      masterDocIDs={masterDocIDs}
                      setMasterDocIDs={setMasterDocIDs}
                      fileToggleStates={fileToggleStates}
                      setFileToggleStates={setFileToggleStates}
                      setTemplateID={setTemplateID}
                      TemplateID={templateID}
                      templateScope={templateScope}
                      templateName={templateName}
                    />
                  </Col>
                ) : null)}

              {uploadErrorMessage && (
                <p className='error-message'>
                  <Icons.AlertCircle className='mb-1 mx-2' />
                  {uploadErrorMessage}
                </p>
              )}
            </Row>

            {isLoading && (
              <div className='loader-overlay'>
                <Loader />
              </div>
            )}

            <div className='upload_file_box mt-3' id='upload_file_bx '>
              {uploadedFiles.map((fileName, index, file) => (
                <div key={index} className='uploaded-file '>
                  <p className='m-0 d-flex align-items-center gap-2'>
                    <Icons.PDFs />
                    {fileName}
                  </p>

                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle}>
                      <Dropdown.Menu>
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileview(masterDocIDs[index], fileName)}>
                          <Icons.View size={20} />
                          {t("uploadDocFlow.view")}
                        </Dropdown.Item>
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShowConfirmModal(masterDocIDs[index], index)}>
                          <Icons.DeleteAction size={18} />
                          {t("uploadDocFlow.delete")}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Toggle>
                  </Dropdown>
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
              <Modal.Header closeButton className='btn'>
                <Modal.Title>{docName}</Modal.Title>
              </Modal.Header>
              <Modal.Body className='d-flex'>
                <Col>
                  {isLoading ? (
                    <div className='loader d-flex justify-content-center  align-items-center'>Loading...</div>
                  ) : (
                    Object.values(documentPages).map((page, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img src={page.pagesPath} alt={page.pagesName} style={{ width: "100%", height: "auto" }} />
                        <div className='page-name-footer'>{page.pagesName}</div>
                      </div>
                    ))
                  )}
                </Col>
              </Modal.Body>
            </Modal>
          </>
        </div>

        <div className='d-flex justify-content-end mt-3 mb-0'>
          <Button className='Continue-btn' onClick={handleContinue}>
            {t("uploadDocFlow.Continue")}
          </Button>
        </div>
      </Container>
    </>
  );
};

export default FirstStep;
