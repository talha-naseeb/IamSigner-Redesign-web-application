import React, { useState, useRef, useEffect } from "react";
import { Button, Col, Form, Row } from "@/Components/UI/shadcnCompat";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import rectangleBox from "@/assets/images/rectangle.png";
import { Download } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import integrationService from "@/services/integrationService";

function ManuallyGenerateComponent() {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const { userAccess } = useUser("");

  const [fieldErrors, setFieldErrors] = useState({
    DocumentType: false,
    Name: false,
    ExtraDetails: false,
    CustomDocumentType: false,
  });

  const validateFields = () => {
    const errors = {
      Name: !formData.Name,
    };

    setFieldErrors(errors);

    return !Object.values(errors).some((error) => error);
  };

  const [formData, setFormData] = useState({
    CustomDocumentType: "",
    DocumentType: "",
    ExtraDetails: "",
    Name: "",
  });

  const [editorContent, setEditorContent] = useState("");
  const editorRef = useRef(null);
  const location = useLocation();

  // React Quill configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = ["header", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "indent", "link", "image"];

  const handleCancel = () => {
    setFormData({
      CustomDocumentType: "",
      DocumentType: "",
      ExtraDetails: "",
      Name: "",
    });
    setFieldErrors({});
  };

  const handleUpdateCancel = () => {
    handleCancel();
    setEditorContent("");
    setIsUpdating(false);
    setFieldErrors({});
    setShowDownloadButton(false);
  };

  //update the data
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const updatedFormData = {
        ...formData,
        IsAIDoc: false,
        AIGeneratedText: editorContent,
      };

      const response = await integrationService.generateDocumentManually(updatedFormData);
      if (response.data.statusCode === "1") {
        handleUpdateCancel();
        toast.success(t("macAi.macAiUpdate"));
      }
      setEditorContent("");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(t("macAi.macUpdateErr"));
    } finally {
      setIsLoading(false);
    }
  };

  //handle Show data in fields
  useEffect(() => {
    if (location.state && location.state.row) {
      const row = location.state.row;
      setFormData({
        CustomDocumentType: row.documentType === "Other" ? row.documentType : "",
        DocumentType: row.documentType,
        ExtraDetails: row.extraDetails,
        Name: row.name,
        AITextID: row.aiTextID,
        AIGeneratedText: row.aiGeneratedText,
      });
      setEditorContent(row.aiGeneratedText);
      setIsUpdating(true);
    }
  }, [location.state]);

  //textEditor cancel
  const handleEditorCancel = () => {
    setEditorContent("");
    handleCancel();
    setShowDownloadButton(false);
  };

  //save and downlaod call
  const handleSave = async (e) => {
    if (!validateFields()) return;
    if (!editorContent.trim()) {
      toast.info(t("macAi.TextEditorContent"));
      return;
    }
    try {
      setIsLoading(true);
      const response = await integrationService.generateDocumentManually({
        AITextID: null,
        AIGeneratedText: editorContent,
        CustomDocumentType: formData.CustomDocumentType,
        DocumentType: formData.DocumentType,
        ExtraDetails: formData.ExtraDetails,
        Name: formData.Name,
        IsAIDoc: false,
      });

      if (response.data.statusCode === "1") {
        setFieldErrors("");
        setShowDownloadButton(true);
        setFormData((prevFormData) => ({ ...prevFormData, AITextID: response.data.response.aiTextID, generatedDocumentPath: response.data.response.generatedDocumentPath })); // Save the aiTextID and generatedDocumentPath in the form data
        toast.success(t("macAi.generatedDocSave"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("macAi.macUpdateErr"));
    } finally {
      setIsLoading(false);
    }
  };
  //Update the current Text
  const handleUpdateText = async () => {
    try {
      setIsLoading(true);
      const updatedFormData = {
        ...formData,
        AIGeneratedText: editorContent,
      };

      const response = await integrationService.generateDocumentManually(updatedFormData);

      if (response.data.statusCode === "1") {
        toast.success(t("macAi.macAiUpdate"));
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(t("macAi.macUpdateErr"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!formData.generatedDocumentPath) {
      toast.error(t("macAi.notDownload"));
      return;
    }
    setIsLoading(true);

    const fileName = formData.Name || getFileNameFromUrl(formData.generatedDocumentPath);
    const downloadedBlob = await downloadURL(formData.generatedDocumentPath);
    const url = URL.createObjectURL(downloadedBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    handleUpdateCancel();
    setIsLoading(false);
    toast.success(t("macAi.downloadSuccess"));
  };

  async function downloadURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${"Error"} ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function getFileNameFromUrl(url) {
    const parts = url.split("/");
    return parts[parts.length - 1];
  }

  return (
    <>
      {userAccess.macAI === true && userAccess.remainingDays > 0 ? (
        <>
          <div className='container my-3'>
            <Row className='my-3 gap-4 justify-content-center'>
              <Col md={3}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={rectangleBox} alt='Rectangle' />
                  <div className='absolute left-[55%] rtl:left-[45%] top-[60%] -translate-x-1/2 -translate-y-1/2 w-[347px] h-[75px] font-semibold text-[15px]'>
                    <div>
                      <label>{t("macAi.generatingYourDoc")}</label>
                      <label>{t("macAi.seeHistory")}</label>
                      <Link className='mx-1' to='/craft-generated-documents'>
                        <label className='text-[var(--theme-color)] font-semibold hover:underline cursor-pointer'>{t("macAi.gotoList")}</label>
                      </Link>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            <div className='userProfile-form theme-aware-form'>
              <>
                <Row className='mt-2'>
                  <Col>
                    <Form.Group className='mt-2' controlId='name'>
                      <Form.Label>
                        {t("macAi.Name")}
                        <span className='required mx-1'>*</span>
                      </Form.Label>
                      <Form.Control
                        className='theme-aware-field'
                        type='text'
                        value={formData.Name}
                        onChange={(e) => setFormData((prevFormData) => ({ ...prevFormData, Name: e.target.value }))}
                        placeholder={t("macAi.namePlaceholder")}
                        disabled={isUpdating}
                      />
                    </Form.Group>
                    {fieldErrors.Name && <div className='text-danger'>{t("macAi.nameRequired")}</div>}
                  </Col>
                  <Col>
                    <Form.Group className='mt-2' controlId='extraDetail'>
                      <Form.Label>{t("macAi.ExtraDetail")}</Form.Label>
                      <Form.Control
                        className='theme-aware-field'
                        type='text'
                        value={formData.ExtraDetails}
                        onChange={(e) => setFormData((prevFormData) => ({ ...prevFormData, ExtraDetails: e.target.value }))}
                        placeholder={t("macAi.extraDetailPlaceholder")}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            </div>

            <div className='userProfile-form theme-aware-form mt-3'>
              <ReactQuill ref={editorRef} value={editorContent} onChange={setEditorContent} modules={modules} formats={formats} placeholder={t("macAi.enterText")} />
            </div>

            {isUpdating ? (
              <div className='d-flex gap-3 mt-3'>
                <Button variant='none' className='ImageDoneBtn' onClick={handleUpdate}>
                  {t("macAi.update")}
                </Button>
                <Button variant='none' className='ImageCancelBtn' onClick={handleUpdateCancel}>
                  {t("macAi.Cancel")}
                </Button>
              </div>
            ) : (
              <>
                <div className='d-flex  gap-3 mt-3'>
                  {showDownloadButton ? (
                    <>
                      <Button variant='none' className='ImageDoneBtn' onClick={handleUpdateText}>
                        {t("macAi.Updatetext")}
                      </Button>
                      <Button variant='none' className='ImageCancelBtn' onClick={handleUpdateCancel}>
                        {t("macAi.Cancel")}
                      </Button>
                      <Button variant='none' className='ImageCancelBtn' onClick={handleDownload}>
                        {t("macAi.docDownload")}
                        <Download className='mx-2' size={22} />
                      </Button>
                    </>
                  ) : (
                    <>
                      {!isUpdating && (formData.Name || formData.ExtraDetails) && (
                        <>
                          <Button className='ImageDoneBtn' onClick={handleSave}>
                            {t("macAi.save")}
                          </Button>
                          <Button className='ImageCancelBtn' onClick={handleEditorCancel}>
                            {t("macAi.clearText")}
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default ManuallyGenerateComponent;
