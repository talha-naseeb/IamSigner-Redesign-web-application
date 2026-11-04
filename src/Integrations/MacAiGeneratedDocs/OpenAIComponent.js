import React, { useState, useRef, useEffect } from "react";
import { Button, Col, Form, Row } from "@/Components/UI/shadcnCompat";
import ReactQuill from "react-quill-new";
import { toast } from "react-toastify";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import integrationService from "@/services/integrationService";
import { Loader2, Sparkles, FileText, ArrowRight, Bot } from "lucide-react";

function OpenAIComponent() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOPenAILoading, setisOPenAILoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const { userAccess, loading } = useUser();
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

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

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

  // update the data
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

  // handle Show data in fields
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

  // textEditor cancel
  const handleEditorCancel = () => {
    setEditorContent("");
  };

  const handleDocumentTypeChange = (documentType) => {
    setFormData({ ...formData, DocumentType: documentType });
    setFieldErrors((prev) => ({ ...prev, DocumentType: false }));
  };

  // generate Text call
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

  // save and download call
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
        setFieldErrors({});
        setShowDownloadButton(true);
        setFormData((prevFormData) => ({
          ...prevFormData,
          AITextID: response.data.response.aiTextID,
          generatedDocumentPath: response.data.response.generatedDocumentPath,
        }));
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

  const docTypes = [
    { key: "CV", icon: Icons.CV, label: t("macAi.CV") },
    { key: "Message", icon: Icons.Message, label: t("macAi.Message") },
    { key: "Contract", icon: Icons.Contract, label: t("macAi.Contract") },
    { key: "Cover letter", icon: Icons.CoverLetter, label: t("macAi.CoverLetter") },
    { key: "Agreement", icon: Icons.Agreement, label: t("macAi.Agreement") },
    { key: "Email", icon: Icons.Mail, label: t("macAi.Email") },
    { key: "Other", icon: Icons.OtherDoc, label: t("macAi.Other") },
  ];

  // 1. While user profile / access is loading on reload, show smooth loading spinner
  if (loading || !userAccess) {
    return (
      <div className='w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-8 bg-[var(--modern-bg)]'>
        <div className='flex flex-col items-center gap-3 text-[var(--modern-muted)]'>
          <Loader2 size={32} className='animate-spin text-[var(--theme-color,#4d8dff)]' />
          <span className='text-sm font-medium'>{t("common.loading", "Loading...")}</span>
        </div>
      </div>
    );
  }

  // 2. Only check license expiry after userAccess has definitively loaded
  if (!userAccess.macAI || Number(userAccess.remainingDays) <= 0) {
    return <UserLisence />;
  }

  return (
    <div className='macai-page w-full px-4 sm:px-6 pt-3 pb-8'>
      {/* Modern AI Header Hero */}
      <div className='mb-4 p-5 sm:p-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-start gap-3.5'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
            <Bot size={24} />
          </div>
          <div>
            <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-violet-soft)] text-[var(--modern-violet)] mb-1'>
              <Sparkles size={12} />
              <span>Mac AI</span>
            </div>
            <h1 className='text-lg sm:text-xl font-bold tracking-tight text-[var(--modern-text)] m-0'>
              {t("macAi.generatingYourDoc")}
            </h1>
            <p className='text-xs sm:text-sm text-[var(--modern-muted)] m-0 mt-0.5'>
              {t("macAi.seeHistory")}
            </p>
          </div>
        </div>

        <Link
          to='/mac-ai-docs'
          className='inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] hover:text-[var(--modern-text)] transition-colors no-underline'
        >
          <FileText size={16} />
          <span>{t("macAi.gotoList")}</span>
          <ArrowRight size={14} className='rtl:rotate-180' />
        </Link>
      </div>

      {/* Main Generator Form Card */}
      <div className='p-5 sm:p-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] mb-4'>
        <Form onSubmit={handleFormSubmit}>
          {/* Document Type Selector */}
          <div className='mb-4'>
            <label className='block text-xs font-semibold text-[var(--modern-text)] uppercase tracking-wider mb-2.5'>
              {t("macAi.docType")}
              <span className='text-[var(--modern-danger,#ef4444)] ml-1'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {docTypes.map(({ key, icon: IconComponent, label }) => {
                const isSelected = formData.DocumentType === key;
                return (
                  <button
                    key={key}
                    type='button'
                    onClick={() => handleDocumentTypeChange(key)}
                    disabled={isUpdating}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[var(--theme-color)] text-white border-[var(--theme-color)] shadow-sm"
                        : "bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-border)]"
                    } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {IconComponent && <IconComponent size={16} />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.DocumentType && (
              <p className='text-xs text-[var(--modern-danger,#ef4444)] mt-1.5 mb-0'>
                {t("macAi.selectDocType")}
              </p>
            )}
          </div>

          {/* Form Fields Grid */}
          <Row className='g-3'>
            {formData.DocumentType === "Other" && (
              <Col xs={12} md={4}>
                <Form.Group controlId='Custom'>
                  <Form.Label className='text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                    {t("macAi.OtherType")}
                    <span className='text-[var(--modern-danger,#ef4444)] ml-1'>*</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    className='rounded-xl border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] text-sm px-3.5 py-2'
                    value={formData.CustomDocumentType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        CustomDocumentType: e.target.value,
                      }))
                    }
                    placeholder={t("macAi.otherTypePlaceholder")}
                    disabled={isUpdating}
                  />
                  {fieldErrors.CustomDocumentType && (
                    <p className='text-xs text-[var(--modern-danger,#ef4444)] mt-1 mb-0'>
                      {t("macAi.specifyDocType")}
                    </p>
                  )}
                </Form.Group>
              </Col>
            )}

            <Col xs={12} md={formData.DocumentType === "Other" ? 4 : 6}>
              <Form.Group controlId='name'>
                <Form.Label className='text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("macAi.Name")}
                  <span className='text-[var(--modern-danger,#ef4444)] ml-1'>*</span>
                </Form.Label>
                <Form.Control
                  type='text'
                  className='rounded-xl border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] text-sm px-3.5 py-2'
                  value={formData.Name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, Name: e.target.value }))
                  }
                  placeholder={t("macAi.namePlaceholder")}
                  disabled={isUpdating}
                />
                {fieldErrors.Name && (
                  <p className='text-xs text-[var(--modern-danger,#ef4444)] mt-1 mb-0'>
                    {t("macAi.nameRequired")}
                  </p>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} md={formData.DocumentType === "Other" ? 4 : 6}>
              <Form.Group controlId='extraDetail'>
                <Form.Label className='text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("macAi.ExtraDetail")}
                </Form.Label>
                <Form.Control
                  type='text'
                  className='rounded-xl border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] text-sm px-3.5 py-2'
                  value={formData.ExtraDetails}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ExtraDetails: e.target.value,
                    }))
                  }
                  placeholder={t("macAi.extraDetailPlaceholder")}
                />
                {fieldErrors.ExtraDetails && (
                  <p className='text-xs text-[var(--modern-danger,#ef4444)] mt-1 mb-0'>
                    {t("macAi.provideExtraDetails")}
                  </p>
                )}
              </Form.Group>
            </Col>
          </Row>

          {(formData.DocumentType ||
            formData.Name ||
            formData.ExtraDetails ||
            formData.CustomDocumentType) && (
            <div className='flex items-center gap-3 mt-4 pt-3 border-t border-[var(--modern-border)]'>
              <Button
                variant='none'
                type='submit'
                disabled={isOPenAILoading}
                className='inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
              >
                {isOPenAILoading ? (
                  <>
                    <Loader2 size={16} className='animate-spin' />
                    <span>{t("common.loading") || "Generating..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{t("macAi.GenerateAItext")}</span>
                  </>
                )}
              </Button>
              <Button
                variant='none'
                type='button'
                onClick={handleCancel}
                className='px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
              >
                {t("macAi.Cancel")}
              </Button>
            </div>
          )}
        </Form>
      </div>

      {/* React Quill Editor Card */}
      <div className='p-4 sm:p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] mb-4'>
        <div className='mb-3 flex items-center justify-between'>
          <label className='text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider'>
            {t("macAi.enterText") || "Generated Content Editor"}
          </label>
        </div>
        <div className='rounded-xl overflow-hidden border border-[var(--modern-border)]'>
          <ReactQuill
            ref={editorRef}
            value={editorContent}
            onChange={setEditorContent}
            modules={modules}
            formats={formats}
            placeholder={t("macAi.enterText")}
            className='mac-ai-quill-editor'
          />
        </div>
      </div>

      {/* Editor Actions Bottom Bar */}
      <div className='flex flex-wrap items-center gap-3'>
        {isUpdating ? (
          <>
            <Button
              variant='none'
              disabled={isLoading}
              className='inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
              onClick={handleUpdate}
            >
              {isLoading && <Loader2 size={16} className='animate-spin' />}
              <span>{t("macAi.update")}</span>
            </Button>
            <Button
              variant='none'
              className='px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
              onClick={handleUpdateCancel}
            >
              {t("macAi.Cancel")}
            </Button>
          </>
        ) : showDownloadButton ? (
          <>
            <Button
              variant='none'
              disabled={isLoading}
              className='inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
              onClick={handleUpdateText}
            >
              {isLoading && <Loader2 size={16} className='animate-spin' />}
              <span>{t("macAi.Updatetext")}</span>
            </Button>
            <Button
              variant='none'
              className='px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
              onClick={handleUpdateCancel}
            >
              {t("macAi.Cancel")}
            </Button>
            <Button
              variant='none'
              disabled={isLoading}
              className='inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
              onClick={handleDownload}
            >
              <Icons.Download size={18} />
              <span>{t("macAi.docDownload")}</span>
            </Button>
          </>
        ) : (
          !isUpdating &&
          (formData.DocumentType ||
            formData.Name ||
            formData.ExtraDetails ||
            formData.CustomDocumentType) && (
            <>
              <Button
                variant='none'
                disabled={isLoading}
                className='inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
                onClick={handleSave}
              >
                {isLoading && <Loader2 size={16} className='animate-spin' />}
                <span>{t("macAi.save")}</span>
              </Button>
              <Button
                variant='none'
                className='px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
                onClick={handleEditorCancel}
              >
                {t("macAi.clearText")}
              </Button>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default OpenAIComponent;
