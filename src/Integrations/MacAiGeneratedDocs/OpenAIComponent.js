import React, { useState, useRef, useEffect } from "react";
import { Button, Col, Form, Row } from "@/Components/UI/shadcnCompat";
import ReactQuill from "react-quill-new";
import { toast } from "react-toastify";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import integrationService from "@/services/integrationService";

function OpenAIComponent() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOPenAILoading, setisOPenAILoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const { userAccess } = useUser();
  const { t } = useTranslation();

  const [fieldErrors, setFieldErrors] = useState({
    DocumentType: false,
    Name: false,
    ExtraDetails: false,
    CustomDocumentType: false,
  });

  const validateFields = () => {
    const errors = {
      DocumentType: !formData.DocumentType,
      Name: !formData.Name,
      CustomDocumentType: formData.DocumentType === "Other" && !formData.CustomDocumentType,
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
        IsAIDoc: true,
        AIGeneratedText: editorContent,
      };

      const response = await integrationService.generateAITextDocument(updatedFormData);

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
      return;
    }

    if (location.state?.assistantPrompt) {
      setFormData((previous) => ({
        ...previous,
        ExtraDetails: location.state.assistantPrompt,
      }));
    }
  }, [location.state]);

  //textEditor cancel
  const handleEditorCancel = () => {
    setEditorContent("");
  };

  const handleDocumentTypeChange = (documentType) => {
    setFormData({ ...formData, DocumentType: documentType });
  };

  //generate Text call
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    try {
      setisOPenAILoading(true);
      const response = await integrationService.generateAIText({
        CustomDocumentType: formData.CustomDocumentType,
        DocumentType: formData.DocumentType,
        ExtraDetails: formData.ExtraDetails,
        Name: formData.Name,
      });
      if (response.data.statusCode === "1") {
        setEditorContent(response.data.response);
        toast.success(t("macAi.GeneratedDocumentcc"));
      } else if (response.data.statusCode === "12") {
        toast.info(t("macAi.MacIssue"));
      } else if (response.data.statusCode === "16") {
        toast.info(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.info(t("macAi.MacIssue"));
    } finally {
      setisOPenAILoading(false);
    }
  };

  //save and downlaod call
  const handleSave = async () => {
    if (!validateFields()) return;
    if (!editorContent.trim()) {
      toast.info(t("macAi.TextEditorContent"));
      return;
    }
    try {
      setIsLoading(true);
      const response = await integrationService.generateAITextDocument({
        AITextID: null,
        AIGeneratedText: editorContent,
        CustomDocumentType: formData.CustomDocumentType,
        DocumentType: formData.DocumentType,
        ExtraDetails: formData.ExtraDetails,
        Name: formData.Name,
        IsAIDoc: true,
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

  const handleUpdateText = async () => {
    try {
      setIsLoading(true);
      const updatedFormData = {
        ...formData,
        AIGeneratedText: editorContent,
      };

      const response = await integrationService.generateAITextDocument(updatedFormData);
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

  //download function
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

  const renderDocIcon = (type) => {
    const commonProps = { size: 20, color: "currentColor" };
    switch (type) {
      case "CV":
        return <Icons.CV {...commonProps} />;
      case "Message":
        return <Icons.Message {...commonProps} />;
      case "Contract":
        return <Icons.Contract {...commonProps} />;
      case "Cover letter":
        return <Icons.CoverLetter {...commonProps} />;
      case "Agreement":
        return <Icons.Agreement {...commonProps} />;
      case "Email":
        return <Icons.Mail {...commonProps} />;
      case "Other":
        return <Icons.OtherDoc {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {userAccess.macAI === true && userAccess.remainingDays > 0 ? (
        <>
          {userAccess.macAI === true ? (
            <>
              <div className='container my-3'>
                {isOPenAILoading && (
                  <div className='loader-overlay'>
                    <div className='OpenAiloader'></div>
                  </div>
                )}

                <Row className='my-3 gap-4 justify-content-center'>
                  <Col md={3}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <Icons.MacAiBackground />

                      <div className='absolute left-[55%] rtl:left-[45%] top-[60%] -translate-x-1/2 -translate-y-1/2 w-[347px] h-[75px] font-semibold text-[15px]'>
                        <div style={{ color: "var(--text-primary)" }}>
                          <label>{t("macAi.generatingYourDoc")}</label>
                          <label>{t("macAi.seeHistory")}</label>{" "}
                          <Link to='/mac-ai-docs'>
                            <label className='text-[var(--theme-color)] font-semibold hover:underline cursor-pointer'>{t("macAi.gotoList")}</label>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className='mt-4'>
                      <Icons.Robot />
                    </div>
                  </Col>
                </Row>

                <div className='userProfile-form theme-aware-form'>
                  <Form onSubmit={handleFormSubmit}>
                    <Row>
                      <label className='doc-type-label'>
                        {t("macAi.docType")}
                        <span className='required mx-1'>*</span>
                      </label>
                      <Col className='mb-2'>
                        <div className='doc-type-buttons mt-2'>
                          <Button
                            className={`selectedButton ${formData.DocumentType === "CV" ? "active" : ""}`}
                            variant='none'
                            onClick={() => handleDocumentTypeChange("CV")}
                            disabled={isUpdating}
                          >
                            {renderDocIcon("CV")} {t("macAi.CV")}
                          </Button>

                          <Button
                            className={`selectedButton ${formData.DocumentType === "Message" ? "active" : ""}`}
                            variant='none'
                            onClick={() => handleDocumentTypeChange("Message")}
                            disabled={isUpdating}
                          >
                            {renderDocIcon("Message")} {t("macAi.Message")}
                          </Button>
                          <Button
                            className={`selectedButton ${formData.DocumentType === "Contract" ? "active" : ""}`}
                            variant='none'
                            onClick={() => handleDocumentTypeChange("Contract")}
                            disabled={isUpdating}
                          >
                            {renderDocIcon("Contract")} {t("macAi.Contract")}
                          </Button>

                          <Button
                            className={`selectedButton ${formData.DocumentType === "Cover letter" ? "active" : ""}`}
                            variant='none'
                            onClick={() => handleDocumentTypeChange("Cover letter")}
                            disabled={isUpdating}
                          >
                            {renderDocIcon("Cover letter")} {t("macAi.CoverLetter")}
                          </Button>

                          <Button
                            className={`selectedButton ${formData.DocumentType === "Agreement" ? "active" : ""}`}
                            variant='none'
                            onClick={() => handleDocumentTypeChange("Agreement")}
                            disabled={isUpdating}
                          >
                            {renderDocIcon("Agreement")} {t("macAi.Agreement")}
                          </Button>

                          <Button
                            className={`selectedButton ${formData.DocumentType === "Email" ? "active" : ""}`}
                            variant='none'
                            onClick={() => handleDocumentTypeChange("Email")}
                            disabled={isUpdating}
                          >
                            {renderDocIcon("Email")} {t("macAi.Email")}
                          </Button>

                          <Button
                            className={`selectedButton ${formData.DocumentType === "Other" ? "active" : ""}`}
                            variant='none'
                            onClick={() => handleDocumentTypeChange("Other")}
                            disabled={isUpdating}
                          >
                            {renderDocIcon("Other")} {t("macAi.Other")}
                          </Button>
                        </div>
                        {fieldErrors.DocumentType && <div className='text-danger'>{t("macAi.selectDocType")}</div>}
                      </Col>
                    </Row>

                    <Row className='mt-2'>
                      {formData.DocumentType === "Other" && (
                        <Col>
                          <Form.Group className='mt-2' controlId='Custom'>
                            <Form.Label>
                              {t("macAi.OtherType")}
                              <span className='required mx-1'>*</span>
                            </Form.Label>
                            <Form.Control
                              className='theme-aware-field'
                              type='text'
                              value={formData.CustomDocumentType}
                              onChange={(e) => setFormData((prevFormData) => ({ ...prevFormData, CustomDocumentType: e.target.value }))}
                              placeholder={t("macAi.otherTypePlaceholder")}
                              disabled={isUpdating}
                            />
                          </Form.Group>
                          {fieldErrors.CustomDocumentType && <div className='text-danger'>{t("macAi.specifyDocType")}</div>}
                        </Col>
                      )}
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
                        {fieldErrors.ExtraDetails && <div className='text-danger'>{t("macAi.provideExtraDetails")}</div>}
                      </Col>
                    </Row>

                    {(formData.DocumentType || formData.Name || formData.ExtraDetails || formData.CustomDocumentType) && (
                      <div className='d-flex gap-3 mt-3'>
                        <Button variant='none' className='ImageDoneBtn' type='submit'>
                          {t("macAi.GenerateAItext")}
                        </Button>
                        <Button variant='none' className='ImageCancelBtn' onClick={handleCancel}>
                          {t("macAi.Cancel")}
                        </Button>
                      </div>
                    )}
                  </Form>
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
                            <Icons.Download className='mx-2' size={22} />
                          </Button>
                        </>
                      ) : (
                        <>
                          {!isUpdating && (formData.DocumentType || formData.Name || formData.ExtraDetails || formData.CustomDocumentType) && (
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
      ) : (
        <>{null}</>
      )}
    </>
  );
}

export default OpenAIComponent;
