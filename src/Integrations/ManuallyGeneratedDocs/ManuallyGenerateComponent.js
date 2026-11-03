import React, { useState, useRef, useEffect } from "react";
import { Button, Col, Form, Row } from "@/Components/UI/shadcnCompat";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import integrationService from "@/services/integrationService";
import {
  FileEdit,
  FileText,
  ArrowRight,
  Download,
  Loader2,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react";

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
    }
  }, [location.state]);

  // textEditor cancel
  const handleEditorCancel = () => {
    setEditorContent("");
    handleCancel();
    setShowDownloadButton(false);
  };

  // save and download call
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

  // Update the current Text
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
        throw new Error(`Error ${response.status}`);
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

  if (!userAccess?.macAI || userAccess?.remainingDays <= 0) {
    return null;
  }

  return (
    <div className='manual-craft-page w-full px-4 sm:px-6 pt-3 pb-8'>
      {/* Modern Hero Card */}
      <div className='mb-4 p-5 sm:p-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-start gap-3.5'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
            <FileEdit size={24} />
          </div>
          <div>
            <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-violet-soft)] text-[var(--modern-violet)] mb-1'>
              <Sparkles size={12} />
              <span>{t("createCraftDocument.craftDoc", "Craft Document")}</span>
            </div>
            <h1 className='text-lg sm:text-xl font-bold tracking-tight text-[var(--modern-text)] m-0'>
              {t("createCraftDocument.craftDocTitle", "Create Document Manually")}
            </h1>
            <p className='text-xs sm:text-sm text-[var(--modern-muted)] m-0 mt-0.5'>
              {t("macAi.seeHistory")}
            </p>
          </div>
        </div>

        <Link
          to='/craft-generated-documents'
          className='inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] hover:text-[var(--modern-text)] transition-colors no-underline'
        >
          <FileText size={16} />
          <span>{t("macAi.gotoList")}</span>
          <ArrowRight size={14} className='rtl:rotate-180' />
        </Link>
      </div>

      {/* Main Details Form Card */}
      <div className='p-5 sm:p-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] mb-4'>
        <Row className='g-3'>
          <Col xs={12} md={6}>
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

          <Col xs={12} md={6}>
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
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* React Quill Editor Card */}
      <div className='p-4 sm:p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] mb-4'>
        <div className='mb-3 flex items-center justify-between'>
          <label className='text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider'>
            {t("macAi.enterText") || "Document Content Editor"}
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
            className='craft-doc-quill-editor'
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
              {isLoading ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Save size={16} />
              )}
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
              {isLoading ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Save size={16} />
              )}
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
              {isLoading ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Download size={16} />
              )}
              <span>{t("macAi.docDownload")}</span>
            </Button>
          </>
        ) : (
          !isUpdating &&
          (formData.Name || formData.ExtraDetails) && (
            <>
              <Button
                variant='none'
                disabled={isLoading}
                className='inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity'
                onClick={handleSave}
              >
                {isLoading ? (
                  <Loader2 size={16} className='animate-spin' />
                ) : (
                  <Save size={16} />
                )}
                <span>{t("macAi.save")}</span>
              </Button>
              <Button
                variant='none'
                className='inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:bg-[var(--modern-border)] transition-colors'
                onClick={handleEditorCancel}
              >
                <RotateCcw size={14} />
                <span>{t("macAi.clearText")}</span>
              </Button>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default ManuallyGenerateComponent;
