import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill, { Quill } from "react-quill";
import { Button, Col, Form, Row, Modal } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import rectangleBox from "@/assets/images/rectangle.png";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { useUser } from "@/Context/UserContext";
import "./style.css";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { templateContentMapping } from "./CustomEmailTemplates";
import userService from "@/services/userService";


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
// ─────────────────────────────────────────────────────────────────────────────

// Converts raw HTML with legacy <span class="immutable-placeholder"> tags
// (stored in DB) into Quill Delta-compatible HTML using the new blot spans.
const convertLegacyHtmlToBlotHtml = (html) => {
  if (!html) return "";
  // Replace old span format → new blot span format
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

// ─────────────────────────────────────────────────────────────────────────────

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
      // Disable clipboard HTML pasting that could smuggle in edited placeholders
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header", "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent", "link",
    "placeholder", // ← our custom blot
  ];

  // ── Load existing template for edit ──────────────────────────────────────
  useEffect(() => {
    if (location.state?.template) {
      const { subject, templateType: type, body } = location.state.template;
      setEmailSubject(subject);
      setTemplateType(type);

      // Body coming from DB may still have old immutable-placeholder spans
      // or raw {tokens}. Normalise to blot spans either way.
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

  // ── Handle body changes — re-stamp blot attributes after every Quill edit ─
  const handleEmailBodyChange = (value) => {
    setEmailBody(value);

    // Re-stamp contenteditable="false" because Quill may strip attributes
    // when it re-renders. This is the belt-and-suspenders layer.
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
    // Convert raw {tokens} in the template content to blot spans
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

    // Validate that all required placeholders are still present
    if (location.state?.template?.body) {
      const originalBlot = convertRawToBlotHtml(
        convertLegacyHtmlToBlotHtml(location.state.template.body)
      );
      if (!validatePlaceholders(originalBlot, emailBody)) return;
    }

    // Convert blot spans back to raw {tokens} for DB storage
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {userAccess.remainingDays <= 0 ? (
        <UserLisence />
      ) : (
        <>
          {user.AccountType === "B" &&
          (user.RoleID === 1 || user.RoleID === 4) &&
          userAccess.remainingDays >= 0 ? (
            <>
              <div className="container mt-3">
                {isLoading && (
                  <div className="loader-overlay">
                    <Loader />
                  </div>
                )}

                <Row className="my-3 gap-4 justify-content-center">
                  <Col md={3}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={rectangleBox} alt="Rectangle" />
                      <div className="MACACIIMAGE">
                        <div>
                          <label>{t("emailTemplates.letCreateEmail")}</label>
                          <br />
                          <label>{t("macAi.seeHistory")}</label>
                          <Link className="mx-1" to="/email-templates">
                            <label
                              className="AidocumentBtn"
                              style={{ textDecoration: "underline" }}
                            >
                              {t("macAi.gotoList")}
                            </label>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Form onSubmit={handleSubmit}>
                  <div className="userProfile-form theme-aware-form">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("emailTemplates.templateType")}
                            <span className="required mx-1">*</span>
                          </Form.Label>
                          <Form.Select
                            className="theme-aware-field"
                            value={templateType}
                            disabled={!!emailTemplateID}
                            onChange={handleTemplateTypeChange}
                            required
                          >
                            <option value="" disabled>
                              {t("emailTemplates.SelectType")}
                            </option>
                            <option value="Declined">{t("emailTemplates.Declined")}</option>
                            <option value="Completed">{t("emailTemplates.Completed")}</option>
                            <option value="PasswordReset">
                              {t("emailTemplates.PasswordReset")}
                            </option>
                            <option value="CreateTeam">{t("emailTemplates.Createteam")}</option>
                            <option value="SigningDocument">
                              {t("emailTemplates.SigningDocument")}
                            </option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("emailTemplates.emailSubject")}{" "}
                            <span className="required mx-1">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            className="theme-aware-field"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder={t("emailTemplates.emailSubjectPlaceholder")}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="userProfile-form theme-aware-form mt-3">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("emailTemplates.emailBody")}
                        <span className="required mx-1">*</span>
                      </Form.Label>

                      {/* Placeholder legend — shows users which tokens are locked */}
                      {templateType && templatePlaceholders[templateType] && (
                        <div className="placeholder-legend mb-2">
                          <small className="text-muted">
                            {t("emailTemplates.lockedPlaceholders")}
                          </small>{" "}
                          {templatePlaceholders[templateType].map((p) => (
                            <span key={p} className="ql-placeholder-token mx-1">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      <ReactQuill
                        ref={quillRef}
                        value={emailBody}
                        onChange={handleEmailBodyChange}
                        modules={modules}
                        formats={formats}
                        theme="snow"
                      />
                    </Form.Group>
                  </div>

                  {isEmailTemplateValid && (
                    <div className="d-flex gap-3 my-3">
                      <Button variant="none" className="ImageDoneBtn" type="submit">
                        {emailTemplateID
                          ? t("emailTemplates.updateTemplate")
                          : t("emailTemplates.createTemplate")}
                      </Button>
                      <Button
                        variant="none"
                        className="ImageCancelBtn"
                        onClick={handleCancel}
                      >
                        {t("userProfile.cancel")}
                      </Button>
                    </div>
                  )}
                </Form>

                {/* Template preview modal */}
                <Modal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  backdrop="static"
                  keyboard={false}
                  dialogClassName="custom-modal-width"
                >
                  <Modal.Header>
                    <Modal.Title>{t("emailTemplates.defaultTemplateTitle")}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="p-3">
                    <p>{modalMessage}</p>
                    <div
                      className="template-preview-disabled"
                      dangerouslySetInnerHTML={{ __html: selectedTemplateText }}
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button className="modalCancelButton" onClick={ModalClose}>
                      {t("dashboardCardStatuses.cancel")}
                    </Button>
                    <Button className="applyBtn" onClick={handleModalGotIt}>
                      {t("emailTemplates.gotIt")}
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </>
          ) : null}
        </>
      )}
    </>
  );
};

export default CreateEmailTemplate;