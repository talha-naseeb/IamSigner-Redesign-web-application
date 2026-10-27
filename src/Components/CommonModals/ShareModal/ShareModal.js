import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button } from "@/Components/UI/shadcnCompat";
import "./modal.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import { useUser } from "@/Context/UserContext";
import {
  Share2,
  Mail,
  FileText,
  FileCheck,
  Files,
  Check,
  Send,
  Loader2,
  User,
  X,
} from "lucide-react";

const ShareModal = ({
  show,
  handleClose,
  masterDocID,
  registerSignID,
  formData: propFormData,
  handleShare: propHandleShare,
  handleChange: propHandleChange,
}) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [teamEmails, setTeamEmails] = useState([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    Document: true,
    AuditTrail: false,
    SupportingDocs: false,
  });

  const validateEmail = (val) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(String(val || "").trim());
  };

  const isFormValid = useMemo(() => {
    const hasItems =
      selectedCheckboxes.Document ||
      selectedCheckboxes.AuditTrail ||
      selectedCheckboxes.SupportingDocs;
    return (
      Boolean(email.trim()) &&
      validateEmail(email) &&
      Boolean(emailSubject.trim()) &&
      Boolean(emailBody.trim()) &&
      hasItems
    );
  }, [email, emailSubject, emailBody, selectedCheckboxes]);

  useEffect(() => {
    if (show) {
      fetchTeamMembers();
      resetFields();
    }
  }, [show]);

  const fetchTeamMembers = async () => {
    try {
      if (user?.AccountID) {
        const response = await userService.getAppUserTeam(user.AccountID);
        const list = response?.data?.response || [];
        setTeamEmails(
          list
            .map((member) => ({
              email: member.emailID || member.email,
              name: member.userName || member.fullName || member.name || "",
            }))
            .filter((m) => Boolean(m.email))
        );
      }
    } catch (err) {
      console.log("Error fetching team members", err);
    }
  };

  const filteredTeamMembers = useMemo(() => {
    if (!email.trim()) return teamEmails.slice(0, 5);
    const q = email.toLowerCase().trim();
    return teamEmails
      .filter((m) => m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [email, teamEmails]);

  const handleCheckboxChange = (key) => {
    setSelectedCheckboxes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setShowSuggestions(true);
    if (value && !validateEmail(value)) {
      setEmailError(t("logScreens.emailAddress") || "Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSelectEmail = (selectedEmail) => {
    setEmail(selectedEmail);
    setEmailError("");
    setShowSuggestions(false);
  };

  const resetFields = () => {
    setEmail("");
    setEmailSubject(t("shareModal.defaultSubject") || "Shared Document via IAMSigner");
    setEmailBody(
      t("shareModal.defaultBody") ||
        "Hello,\n\nPlease find the attached shared document for your review."
    );
    setEmailError("");
    setShowSuggestions(false);
    setSelectedCheckboxes({
      Document: true,
      AuditTrail: false,
      SupportingDocs: false,
    });
    setError(null);
  };

  const handleCloseModal = () => {
    resetFields();
    if (handleClose) handleClose();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !emailSubject.trim() || !emailBody.trim()) {
      setError(t("shareModal.fieldRequired") || "All required fields must be filled");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError(t("logScreens.emailAddress") || "Invalid email address");
      return;
    }
    if (
      !selectedCheckboxes.Document &&
      !selectedCheckboxes.AuditTrail &&
      !selectedCheckboxes.SupportingDocs
    ) {
      toast.error(
        t("shareModal.selectAtLeastOneOption") ||
          "Please select at least one document item to share"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    const requestBody = {
      Email: email.trim(),
      Subject: emailSubject.trim(),
      Body: emailBody.trim(),
      MasterDocID: masterDocID,
      RegisterSignID: registerSignID,
      IsDocShared: selectedCheckboxes.Document,
      IsAuditTrailDocShared: selectedCheckboxes.AuditTrail,
      IsSupportingDocShared: selectedCheckboxes.SupportingDocs,
    };

    try {
      if (typeof propHandleShare === "function") {
        await propHandleShare(requestBody);
      } else {
        const response = await userService.createDocShared(requestBody);
        if (response?.data?.statusCode === "1" || response?.status === 200) {
          toast.success(
            t("dashboardCardStatuses.shareFileSucessToast") ||
              "Document shared successfully"
          );
        } else {
          toast.info(response?.data?.message || t("dashboardCardStatuses.shareFileInfo"));
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error("Share document error:", err);
      if (err?.response?.statusCode === "4" || err?.response?.status === 401) {
        toast.error(t("dashboardCardStatuses.unathorizedErrSharedFile") || "Unauthorized");
      } else {
        toast.error(
          err?.response?.data?.message ||
            t("shareModal.alreadyShared") ||
            "Failed to share document"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      backdrop='static'
      keyboard={false}
      onHide={handleCloseModal}
      centered
      className='share-document-modal'
    >
      {/* Modern Header */}
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-primary)] shrink-0'>
            <Share2 size={20} />
          </div>
          <div>
            <Modal.Title className='text-base md:text-lg font-semibold text-[var(--modern-text)] m-0 leading-tight'>
              {t("shareModal.shareDoc") || "Share Document"}
            </Modal.Title>
            <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
              {t("shareModal.chooseDoc") ||
                "Select which items to share and enter recipient details."}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className='p-4 md:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-table-scrollbar'>
        {/* Item Selection Cards */}
        <div>
          <label className={`block text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2 ${isRtl ? "text-right" : "text-left"}`}>
            {t("shareModal.includeInShare") || "Items to Include in Share"}
          </label>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
            {/* Original Document Card */}
            <div
              role='checkbox'
              aria-checked={selectedCheckboxes.Document}
              tabIndex={0}
              onClick={() => handleCheckboxChange("Document")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCheckboxChange("Document");
                }
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                selectedCheckboxes.Document
                  ? "bg-[var(--modern-raised)] border-[var(--modern-primary)]"
                  : "bg-[var(--modern-card)] border-[var(--modern-border)] hover:border-[var(--modern-border-strong)]"
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center'>
                  <FileText size={15} />
                </div>
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    selectedCheckboxes.Document
                      ? "bg-[var(--modern-primary)] border-[var(--modern-primary)] text-white"
                      : "border-[var(--modern-border-strong)] bg-transparent"
                  }`}
                >
                  {selectedCheckboxes.Document && <Check size={11} strokeWidth={3} />}
                </div>
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className='text-xs font-semibold text-[var(--modern-text)]'>
                  {t("viewModal.orgDoc") || "Original Document"}
                </div>
                <div className='text-[10px] text-[var(--modern-muted)] mt-0.5'>
                  {t("shareModal.signedPdf") || "Final signed PDF"}
                </div>
              </div>
            </div>

            {/* Audit Trail Card */}
            <div
              role='checkbox'
              aria-checked={selectedCheckboxes.AuditTrail}
              tabIndex={0}
              onClick={() => handleCheckboxChange("AuditTrail")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCheckboxChange("AuditTrail");
                }
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                selectedCheckboxes.AuditTrail
                  ? "bg-[var(--modern-raised)] border-[var(--modern-primary)]"
                  : "bg-[var(--modern-card)] border-[var(--modern-border)] hover:border-[var(--modern-border-strong)]"
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center'>
                  <FileCheck size={15} />
                </div>
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    selectedCheckboxes.AuditTrail
                      ? "bg-[var(--modern-primary)] border-[var(--modern-primary)] text-white"
                      : "border-[var(--modern-border-strong)] bg-transparent"
                  }`}
                >
                  {selectedCheckboxes.AuditTrail && <Check size={11} strokeWidth={3} />}
                </div>
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className='text-xs font-semibold text-[var(--modern-text)]'>
                  {t("viewModal.auditTrail") || "Audit Certificate"}
                </div>
                <div className='text-[10px] text-[var(--modern-muted)] mt-0.5'>
                  {t("shareModal.auditLog") || "Official verification trail"}
                </div>
              </div>
            </div>

            {/* Supporting Documents Card */}
            <div
              role='checkbox'
              aria-checked={selectedCheckboxes.SupportingDocs}
              tabIndex={0}
              onClick={() => handleCheckboxChange("SupportingDocs")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCheckboxChange("SupportingDocs");
                }
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                selectedCheckboxes.SupportingDocs
                  ? "bg-[var(--modern-raised)] border-[var(--modern-primary)]"
                  : "bg-[var(--modern-card)] border-[var(--modern-border)] hover:border-[var(--modern-border-strong)]"
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center'>
                  <Files size={15} />
                </div>
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    selectedCheckboxes.SupportingDocs
                      ? "bg-[var(--modern-primary)] border-[var(--modern-primary)] text-white"
                      : "border-[var(--modern-border-strong)] bg-transparent"
                  }`}
                >
                  {selectedCheckboxes.SupportingDocs && <Check size={11} strokeWidth={3} />}
                </div>
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className='text-xs font-semibold text-[var(--modern-text)]'>
                  {t("viewModal.supportingDoc") || "Supporting Files"}
                </div>
                <div className='text-[10px] text-[var(--modern-muted)] mt-0.5'>
                  {t("shareModal.attachments") || "Attached supplementary files"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Email Input with Autocomplete */}
        <div className='relative'>
          <label className={`block text-xs font-semibold text-[var(--modern-text)] mb-1 ${isRtl ? "text-right" : "text-left"}`}>
            {t("shareModal.email") || "Recipient Email"} <span className='text-rose-500'>*</span>
          </label>
          <div className='relative flex items-center'>
            <div className={`absolute ${isRtl ? "right-3" : "left-3"} text-[var(--modern-muted)] pointer-events-none`}>
              <Mail size={16} />
            </div>
            <input
              type='email'
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={
                t("Folder.selectEmailPlaceholder") || "Enter recipient email (e.g. colleague@acme.com)"
              }
              className={`w-full ${
                isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
              } py-2 text-sm rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none focus:border-[var(--modern-primary)] transition-colors`}
              required
            />
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && filteredTeamMembers.length > 0 && (
            <div className='absolute top-full left-0 right-0 mt-1 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] shadow-lg z-50 overflow-hidden py-1'>
              <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--modern-muted)] bg-[var(--modern-raised)] border-b border-[var(--modern-border)] ${isRtl ? "text-right" : "text-left"}`}>
                {t("shareModal.teamSuggestions") || "Team Members"}
              </div>
              {filteredTeamMembers.map((member, i) => (
                <div
                  key={member.email || i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectEmail(member.email);
                  }}
                  className='px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer hover:bg-[var(--modern-raised)] transition-colors'
                >
                  <div className='flex items-center gap-2 min-w-0'>
                    <div className='w-6 h-6 rounded-full bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[10px] font-bold text-[var(--modern-text)] shrink-0'>
                      <User size={12} className='text-[var(--modern-muted)]' />
                    </div>
                    <div className='min-w-0'>
                      {member.name && (
                        <div className='font-semibold text-[var(--modern-text)] truncate'>
                          {member.name}
                        </div>
                      )}
                      <div className='text-[var(--modern-muted)] truncate'>{member.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {emailError && <p className={`text-xs text-rose-500 m-0 mt-1 ${isRtl ? "text-right" : "text-left"}`}>{emailError}</p>}
        </div>

        {/* Email Subject */}
        <div>
          <label className={`block text-xs font-semibold text-[var(--modern-text)] mb-1 ${isRtl ? "text-right" : "text-left"}`}>
            {t("shareModal.subject") || "Email Subject"} <span className='text-rose-500'>*</span>
          </label>
          <input
            type='text'
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder={t("shareModal.subjectPlaceholder") || "Document Sharing Notification"}
            className={`w-full px-3 py-2 text-sm rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none focus:border-[var(--modern-primary)] transition-colors ${
              isRtl ? "text-right" : "text-left"
            }`}
            required
          />
        </div>

        {/* Email Body */}
        <div>
          <label className={`block text-xs font-semibold text-[var(--modern-text)] mb-1 ${isRtl ? "text-right" : "text-left"}`}>
            {t("shareModal.body") || "Message"} <span className='text-rose-500'>*</span>
          </label>
          <textarea
            rows={3}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder={
              t("shareModal.bodyPlaceholder") ||
              "Write a message for the recipient..."
            }
            className={`w-full p-3 text-sm rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none focus:border-[var(--modern-primary)] transition-colors resize-none ${
              isRtl ? "text-right" : "text-left"
            }`}
            required
          />
        </div>

        {error && <p className='text-xs text-rose-500 m-0'>{error}</p>}
      </Modal.Body>

      {/* Enhanced Footer */}
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-between'>
        <Button
          variant='secondary'
          onClick={handleCloseModal}
          disabled={isLoading}
          className='px-4 py-2 text-xs font-semibold rounded-lg'
        >
          {t("shareModal.cancel") || "Cancel"}
        </Button>
        <Button
          variant='default'
          disabled={!isFormValid || isLoading}
          onClick={handleSubmit}
          className='inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--modern-primary)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity'
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className='animate-spin' />
              <span>{t("shareModal.sharing") || "Sharing..."}</span>
            </>
          ) : (
            <>
              <Send size={14} style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
              <span>{t("shareModal.shareFile") || "Share Document"}</span>
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareModal;
