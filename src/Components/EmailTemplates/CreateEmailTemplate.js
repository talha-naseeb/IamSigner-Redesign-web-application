import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import { Col, Form, Row, Modal, Spinner } from "@/Components/UI/shadcnCompat";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { templateContentMapping } from "./CustomEmailTemplates";
import userService from "@/services/userService";
import "./style.css";

const Embed = Quill.import("blots/embed");

class PlaceholderBlot extends Embed {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-value", value);
    node.textContent = `{${value}}`;
    node.classList.add("ql-placeholder-token");
    // Atomic — Quill will not let the cursor enter this node
    node.setAttribute("contenteditable", "false");
    return node;
  }

  static value(node) {
    return node.getAttribute("data-value");
  }
}

PlaceholderBlot.blotName = "placeholder";
PlaceholderBlot.tagName = "span";
PlaceholderBlot.className = "ql-placeholder-token";

Quill.register(PlaceholderBlot, true);

// Converts raw HTML with legacy <span class="immutable-placeholder"> tags
// (stored in DB) into Quill Delta-compatible HTML using the new blot spans.
const convertLegacyHtmlToBlotHtml = (html) => {
  if (!html) return "";
  return html.replace(
    /<span class="immutable-placeholder"[^>]*>\{?(.*?)\}?<\/span>/g,
    (_, name) =>
      `<span class="ql-placeholder-token" data-value="${name.trim()}" contenteditable="false">{${name.trim()}}</span>`
  );
};

// Converts blot spans back to {placeholder} text for saving to DB
const convertBlotHtmlToRaw = (html) => {
  if (!html) return "";
  return html.replace(
    /<span class="ql-placeholder-token"[^>]*>\{?(.*?)\}?<\/span>/g,
    (_, name) => `{${name.trim()}}`
  );
};

// Converts raw {placeholder} text → blot spans for display in Quill
const convertRawToBlotHtml = (html) => {
  if (!html) return "";
  return html.replace(/\{(\w+)\}/g, (_, name) =>
    `<span class="ql-placeholder-token" data-value="${name}" contenteditable="false">{${name}}</span>`
  );
};

const CreateEmailTemplate = () => {
  const { t } = useTranslation();
  const [emailSubject, setEmailSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedTemplateText, setSelectedTemplateText] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [templateType, setTemplateType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userAccess } = useUser();
  const quillRef = useRef(null);

  const emailTemplateID = location.state?.template?.emailTemplateID;

  // ── Quill toolbar + formats ──────────────────────────────────────────────
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["link"],
          ["clean"],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

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
    "placeholder",
  ];

  // ── Load existing template for edit ──────────────────────────────────────
  useEffect(() => {
    if (location.state?.template) {
      const { subject, templateType: type, body } = location.state.template;
      setEmailSubject(subject || "");
      setTemplateType(type || "");

      const legacyConverted = convertLegacyHtmlToBlotHtml(body || "");
      const fullyConverted = convertRawToBlotHtml(legacyConverted);
      setEmailBody(fullyConverted);
    } else {
      setEmailSubject("");
      setTemplateType("");
      setEmailBody("");
    }
  }, [location.state]);

  // ── Validate placeholders haven't been removed before saving ─────────────
  const getTokensFromHtml = (html) => {
    const matches = [...html.matchAll(/\{(\w+)\}/g)];
    return matches.map((m) => m[1]);
  };

  const validatePlaceholders = (originalHtml, editedHtml) => {
    const original = getTokensFromHtml(convertBlotHtmlToRaw(originalHtml));
    const edited = getTokensFromHtml(convertBlotHtmlToRaw(editedHtml));
    const missing = original.filter((p) => !edited.includes(p));
    if (missing.length > 0) {
      toast.error(
        `Required placeholders were removed: ${missing.map((p) => `{${p}}`).join(", ")}`
      );
      return false;
    }
    return true;
  };

  // ── Handle body changes ──────────────────────────────────────────────────
  const handleEmailBodyChange = (value) => {
    setEmailBody(value);

    setTimeout(() => {
      const editor = quillRef.current?.getEditor()?.root;
      if (!editor) return;
      editor.querySelectorAll(".ql-placeholder-token").forEach((el) => {
        el.setAttribute("contenteditable", "false");
      });
    }, 0);
  };

  // ── Template type selection ───────────────────────────────────────────────
  const templatePlaceholders = {
    Declined: ["{name}", "{declinedBy}", "{declinedDate}", "{declineReason}", "{documents}"],
    Completed: ["{name}", "{documents}", "{referenceNumber}"],
    PasswordReset: ["{name}"],
    CreateTeam: ["{name}", "{password}"],
    SigningDocument: ["{name}", "{documents}", "{sentBy}", "{sentOn}", "{referenceNumber}"],
  };

  const handleTemplateTypeChange = (e) => {
    const selectedType = e.target.value;
    setTemplateType(selectedType);

    const templateContent = templateContentMapping[selectedType] || "";
    const blotContent = convertRawToBlotHtml(templateContent);
    setSelectedTemplateText(blotContent);

    const placeholders = templatePlaceholders[selectedType] || [];
    setModalMessage(
      t("emailTemplates.defaultTemplateMessage", { placeholders: placeholders.join(", ") })
    );
    setShowModal(true);
  };

  const handleModalGotIt = () => {
    setShowModal(false);
    setEmailBody(selectedTemplateText);
  };

  const ModalClose = () => setShowModal(false);

  const handleCancel = () => {
    setEmailSubject("");
    setTemplateType("");
    setEmailBody("");
    navigate("/email-templates");
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (location.state?.template?.body) {
      const originalBlot = convertRawToBlotHtml(
        convertLegacyHtmlToBlotHtml(location.state.template.body)
      );
      if (!validatePlaceholders(originalBlot, emailBody)) return;
    }

    const processedBody = convertBlotHtmlToRaw(emailBody);

    const requestBody = {
      EmailTemplateID: emailTemplateID || null,
      AccountID: user.AccountID,
      TemplateType: templateType,
      Subject: emailSubject,
      Body: processedBody,
    };

    setIsLoading(true);
    try {
      const response = await userService.createEmailTemplate(requestBody);
      if (response.data.statusCode === "1") {
        toast.success(
          emailTemplateID
            ? t("emailTemplates.templateUpdated")
            : t("emailTemplates.templateCreated")
        );
        navigate("/email-templates");
      }
    } catch (error) {
      toast.error(t("emailTemplates.emailError"));
      console.error("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isContentNotEmpty = (content) => {
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return plainText.length > 0;
  };

  const isEmailTemplateValid =
    emailSubject.trim() !== "" &&
    templateType.trim() !== "" &&
    isContentNotEmpty(emailBody);

  return (
    <>
      {userAccess?.remainingDays <= 0 ? (
        <UserLisence />
      ) : (
        <>
          {user?.AccountType === "B" &&
          (user?.RoleID === 1 || user?.RoleID === 4) &&
          userAccess?.remainingDays >= 0 ? (
            <div className='email-templates-container'>
              {/* Hero Banner Header */}
              <div className='email-create-hero'>
                <div className='email-create-hero-content'>
                  <button
                    type='button'
                    className='email-back-btn'
                    onClick={() => navigate("/email-templates")}
                    title={t("common.back") || "Back"}
                  >
                    <Icons.Back
                      className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""}
                      size={18}
                    />
                  </button>
                  <div className='email-create-hero-icon'>
                    <Icons.EmailTemplates size={24} />
                  </div>
                  <div>
                    <h1 className='email-create-hero-title'>
                      {emailTemplateID
                        ? t("emailTemplates.updateTemplate")
                        : t("emailTemplates.createEmail") || "Create Email Template"}
                    </h1>
                    <p className='email-create-hero-subtitle'>
                      {t("emailTemplates.letCreateEmail")}
                    </p>
                  </div>
                </div>

                <div>
                  <Link to='/email-templates' className='email-btn-secondary'>
                    <Icons.BulkDocuments size={18} />
                    <span>{t("macAi.gotoList") || "View All Templates"}</span>
                  </Link>
                </div>
              </div>

              {/* Form */}
              <Form onSubmit={handleSubmit}>
                {/* Meta details card */}
                <div className='email-form-section-card'>
                  <Row className='g-3'>
                    <Col md={6}>
                      <Form.Group>
                        <label className='email-form-label'>
                          {t("emailTemplates.templateType")}
                          <span className='required'>*</span>
                        </label>
                        <select
                          className='email-form-select'
                          value={templateType}
                          disabled={!!emailTemplateID}
                          onChange={handleTemplateTypeChange}
                          required
                        >
                          <option value='' disabled>
                            {t("emailTemplates.SelectType")}
                          </option>
                          <option value='Declined'>{t("emailTemplates.Declined")}</option>
                          <option value='Completed'>{t("emailTemplates.Completed")}</option>
                          <option value='PasswordReset'>{t("emailTemplates.PasswordReset")}</option>
                          <option value='CreateTeam'>{t("emailTemplates.Createteam")}</option>
                          <option value='SigningDocument'>{t("emailTemplates.SigningDocument")}</option>
                        </select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <label className='email-form-label'>
                          {t("emailTemplates.emailSubject")}
                          <span className='required'>*</span>
                        </label>
                        <input
                          type='text'
                          className='email-form-control'
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder={t("emailTemplates.emailSubjectPlaceholder")}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Email editor card */}
                <div className='email-form-section-card'>
                  <Form.Group>
                    <label className='email-form-label mb-2'>
                      {t("emailTemplates.emailBody")}
                      <span className='required'>*</span>
                    </label>

                    {/* Placeholder legend */}
                    {templateType && templatePlaceholders[templateType] && (
                      <div className='placeholder-legend-box'>
                        <div className='placeholder-legend-header'>
                          <Icons.Info size={16} />
                          <span>{t("emailTemplates.lockedPlaceholders") || "Locked placeholders (must be kept intact):"}</span>
                        </div>
                        <div className='placeholder-legend-chips'>
                          {templatePlaceholders[templateType].map((p) => (
                            <span key={p} className='ql-placeholder-token'>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <ReactQuill
                      ref={quillRef}
                      value={emailBody}
                      onChange={handleEmailBodyChange}
                      modules={modules}
                      formats={formats}
                      theme='snow'
                    />
                  </Form.Group>
                </div>

                {/* Form Action Buttons */}
                <div className='d-flex gap-3 my-4'>
                  <button
                    type='submit'
                    className='email-btn-primary'
                    disabled={isLoading || !isEmailTemplateValid}
                  >
                    {isLoading && <Spinner animation='border' size='sm' className='me-2' />}
                    <span>
                      {emailTemplateID
                        ? t("emailTemplates.updateTemplate")
                        : t("emailTemplates.createTemplate")}
                    </span>
                  </button>
                  <button
                    type='button'
                    className='email-btn-secondary'
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <span>{t("userProfile.cancel")}</span>
                  </button>
                </div>
              </Form>

              {/* Template preview modal */}
              <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                backdrop='static'
                keyboard={false}
                centered
              >
                <Modal.Header closeButton>
                  <div className='d-flex align-items-center gap-2'>
                    <div className='email-header-icon-badge' style={{ width: 36, height: 36 }}>
                      <Icons.Info size={20} />
                    </div>
                    <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                      {t("emailTemplates.defaultTemplateTitle")}
                    </Modal.Title>
                  </div>
                </Modal.Header>
                <Modal.Body className='py-3'>
                  <p className='text-muted small mb-3'>{modalMessage}</p>
                  <div
                    className='template-preview-disabled'
                    dangerouslySetInnerHTML={{ __html: selectedTemplateText }}
                  />
                </Modal.Body>
                <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
                  <button
                    type='button'
                    className='email-btn-secondary'
                    onClick={ModalClose}
                  >
                    {t("dashboardCardStatuses.cancel")}
                  </button>
                  <button
                    type='button'
                    className='email-btn-primary'
                    onClick={handleModalGotIt}
                  >
                    {t("emailTemplates.gotIt")}
                  </button>
                </Modal.Footer>
              </Modal>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default CreateEmailTemplate;