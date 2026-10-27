import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Dropdown } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import dashboardService from "@/services/dashboardService";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { Chips } from "@/Components/UI/EmailChips";
import {
  UserCheck,
  Globe,
  ShieldCheck,
  Mail,
  Phone,
  Trash2,
  AlertCircle,
  Loader2,
  Check,
  MailPlus,
  SlidersHorizontal,
  X,
  User,
  Clock,
  Sparkles,
} from "lucide-react";

/**
 * ChangeOrderModal - Modernized Update Signatory Modal
 *
 * Allows editing recipient details (name, email, phone, notification channel,
 * verification methods, additional CC emails, and language) after workflow initiation.
 */
const ChangeOrderModal = ({ show, handleClose, registerSignID, signedDocKey }) => {
  const { t } = useTranslation();
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const [isLoading, setIsLoading] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [verificationMethods, setVerificationMethods] = useState([]);
  const [languageTypes, setLanguageTypes] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [showSignOrder, setShowSignOrder] = useState(false);
  const [errors, setErrors] = useState([]);
  const [deleteConfirmationIndex, setDeleteConfirmationIndex] = useState(null);
  const [showVerificationMethods, setShowVerificationMethods] = useState(
    () => JSON.parse(localStorage.getItem("showVerificationMethods")) || {}
  );
  const [showAdditionalEmail, setShowAdditionalEmail] = useState(
    () => JSON.parse(localStorage.getItem("showAdditionalEmail")) || {}
  );
  const [isContinueDisabled, setIsContinueDisabled] = useState(false);
  const [initialForms, setInitialForms] = useState([]);
  const [isFormUnchanged, setIsFormUnchanged] = useState(true);

  const initialFormState = {
    name: "",
    notificationType: "Email",
    additionalEmails: [],
    email: "",
    countryCode: "",
    mobile: "",
    company: "",
    signatureType: "Needs To Sign",
    signatureColor: "#8b6cff",
    signPage: "FirstPage",
    signPosition: "TopLeft",
    signOrder: 1,
    isMobile: true,
    expiryDate: "",
    isExpiring: false,
    isPasswordProtected: false,
    languageType: "English",
    verificationType: "None",
    signatoriesID: null,
    showEmail: true,
    showMobile: false,
  };

  const [forms, setForms] = useState([initialFormState]);

  useEffect(() => {
    localStorage.setItem("showVerificationMethods", JSON.stringify(showVerificationMethods));
  }, [showVerificationMethods]);

  useEffect(() => {
    localStorage.setItem("showAdditionalEmail", JSON.stringify(showAdditionalEmail));
  }, [showAdditionalEmail]);

  // Load Lookups on mount
  useEffect(() => {
    uploadFlowService
      .getLookups("NotificationType")
      .then((response) => {
        if (response?.data?.successStatus) {
          const options = response.data.response.map((item) => item.name);
          setNotificationTypes(options);
        }
      })
      .catch((err) => console.error("NotificationType lookup error:", err));

    uploadFlowService
      .getLookups("VerificationType")
      .then((response) => {
        if (response?.data?.successStatus) {
          const verification = response.data.response.map((method) => method.lookupID);
          setVerificationMethods(verification);
        }
      })
      .catch((err) => console.error("VerificationType lookup error:", err));

    uploadFlowService
      .getLookups("LanguageType")
      .then((response) => {
        if (response?.data?.successStatus) {
          const languages = response.data.response.map((lang) => lang.name);
          setLanguageTypes(languages);
        }
      })
      .catch((err) => console.error("LanguageType lookup error:", err));

    uploadFlowService
      .getLookups("countryCode")
      .then((response) => {
        if (response?.data?.successStatus) {
          const codes = response.data.response.map((code) => ({
            lookupID: code.lookupID,
            name: code.name,
          }));
          setCountryCodes(codes);
        }
      })
      .catch((err) => console.error("countryCode lookup error:", err));
  }, []);

  // Determine which input fields (Email, Phone) are visible based on channel rules
  const determineFieldVisibility = (notificationType, verificationType, email) => {
    let showEmail = false;
    let showMobile = false;

    if (email) {
      showEmail = true;
    }

    if (notificationType === "Email") {
      if (verificationType === "SMS" || verificationType === "WhatsApp") {
        showEmail = true;
        showMobile = true;
      } else {
        showEmail = true;
        showMobile = false;
      }
    } else if (notificationType === "SMS" || notificationType === "WhatsApp") {
      if (verificationType === "Email") {
        showEmail = true;
        showMobile = true;
      } else {
        showEmail = false;
        showMobile = true;
      }
    }

    return { showEmail, showMobile };
  };

  // Fetch not started signatories for this document
  useEffect(() => {
    if (!show || !registerSignID) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getNotStartedSignatories(registerSignID);

        if (response?.data?.successStatus) {
          const signatories = response.data.response.signatories;
          const serialCheck = response.data.response.isSerial;
          setShowSignOrder(serialCheck);

          if (signatories && signatories.length > 0) {
            const initializedForms = signatories.map((signatory, idx) => {
              const { showEmail, showMobile } = determineFieldVisibility(
                signatory.notificationType,
                signatory.verificationType,
                signatory.email
              );

              const additionalEmails = signatory.additionalEmails
                ? signatory.additionalEmails.split(",").map((em) => em.trim()).filter(Boolean)
                : [];

              // Auto-expand optional sections if data already exists
              if (additionalEmails.length > 0) {
                setShowAdditionalEmail((prev) => ({ ...prev, [idx]: true }));
              }
              if (signatory.verificationType && signatory.verificationType !== "None") {
                setShowVerificationMethods((prev) => ({ ...prev, [idx]: true }));
              }

              return {
                ...signatory,
                showEmail,
                showMobile,
                additionalEmails,
              };
            });

            setForms(initializedForms);
            setInitialForms(initializedForms);
          } else {
            setForms([initialFormState]);
            setInitialForms([initialFormState]);
          }
        } else {
          setForms([initialFormState]);
          setInitialForms([initialFormState]);
        }
      } catch (error) {
        console.error("Error fetching signatories:", error);
        setForms([initialFormState]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [show, registerSignID]);

  // Track whether any form values were modified
  useEffect(() => {
    setIsFormUnchanged(JSON.stringify(forms) === JSON.stringify(initialForms));
  }, [forms, initialForms]);

  const validateEmail = (val) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(String(val || "").trim());
  };

  const validateForm = () => {
    let hasErrors = false;
    const emailSet = new Set();

    const newErrors = forms.map((form) => {
      const formErrors = {};

      if (!form.name || !form.name.trim()) {
        formErrors.name = t("uploadDocFlow.requiredName") || "Name is required";
        hasErrors = true;
      }

      if (form.showEmail) {
        if (!form.email || !form.email.trim()) {
          formErrors.email = t("uploadDocFlow.emailRequired") || "Email is required";
          hasErrors = true;
        } else if (!validateEmail(form.email)) {
          formErrors.email = t("uploadDocFlow.validEmail") || "Please enter a valid email";
          hasErrors = true;
        } else if (emailSet.has(form.email.toLowerCase().trim())) {
          formErrors.email = t("uploadDocFlow.alreadyEmailUsed") || "Email is already used";
          hasErrors = true;
        } else {
          emailSet.add(form.email.toLowerCase().trim());
        }
      }

      if (form.showMobile && (!form.mobile || !form.countryCode)) {
        formErrors.mobile = t("uploadDocFlow.phoneRequired") || "Phone and country code are required";
        hasErrors = true;
      }

      return formErrors;
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleInputChange = (index, field, value) => {
    const updatedForms = [...forms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };

    if (field === "notificationType" || field === "verificationType") {
      const { showEmail, showMobile } = determineFieldVisibility(
        updatedForms[index].notificationType,
        updatedForms[index].verificationType,
        updatedForms[index].email
      );
      updatedForms[index].showEmail = showEmail;
      updatedForms[index].showMobile = showMobile;
    }

    setForms(updatedForms);
    clearError(index, field);
  };

  const clearError = (index, field) => {
    setErrors((prevErrors) => {
      const newErrors = [...prevErrors];
      if (newErrors[index]) {
        delete newErrors[index][field];
        if (Object.keys(newErrors[index]).length === 0) {
          newErrors[index] = null;
        }
      }
      return newErrors;
    });
  };

  const toggleVerificationMethod = (index) => {
    setShowVerificationMethods((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAdditionalEmail = (index) => {
    setShowAdditionalEmail((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleChipsChange = (index, emails) => {
    if (!emails) emails = [];
    const validEmails = emails.filter((em) => validateEmail(em));
    const invalidEmails = emails.filter((em) => !validateEmail(em));

    if (invalidEmails.length > 0) {
      toast.error(`${invalidEmails.join(", ")} ${t("uploadDocFlow.isnotValid") || "is not valid"}`);
    }

    const uniqueValid = Array.from(new Set(validEmails));
    const updatedForms = [...forms];
    updatedForms[index].additionalEmails = uniqueValid;
    setForms(updatedForms);
  };

  const handleShowDeleteConfirmation = (index) => {
    if (forms.length <= 1) {
      toast.warning(t("uploadDocFlow.cannotDeleteLastSignatory") || "Cannot delete last signatory");
      return;
    }
    setDeleteConfirmationIndex(index);
  };

  const handleDeleteSignatory = async (index, signatoryID) => {
    if (forms.length <= 1) {
      toast.warning(t("uploadDocFlow.cannotDeleteLastSignatory") || "Cannot delete last signatory");
      setDeleteConfirmationIndex(null);
      return;
    }

    if (signatoryID) {
      try {
        setIsLoading(true);
        const response = await uploadFlowService.deleteSignatory({
          SignatoriesID: signatoryID,
        });

        if (response?.status === 200 || response?.data?.statusCode === "1") {
          toast.success(t("uploadDocFlow.signatoryDeleted") || "Signatory deleted successfully");

          if (showSignOrder) {
            try {
              const resendResponse = await dashboardService.reminderEmail({
                SignAuth: signedDocKey,
              });
              if (resendResponse?.data?.statusCode === "1") {
                toast.success(t("uploadDocFlow.workflowContinued") || "Workflow continued");
              }
            } catch (err) {
              console.error("Error sending resend notification:", err);
            }
          }

          // Refresh the signatories list
          try {
            const fetchResponse = await dashboardService.getNotStartedSignatories(registerSignID);
            if (fetchResponse?.data?.successStatus) {
              const list = fetchResponse.data.response.signatories || [];
              const initialized = list.map((s) => {
                const { showEmail, showMobile } = determineFieldVisibility(
                  s.notificationType,
                  s.verificationType,
                  s.email
                );
                const additionalEmails = s.additionalEmails
                  ? s.additionalEmails.split(",").map((e) => e.trim()).filter(Boolean)
                  : [];
                return {
                  ...s,
                  showEmail,
                  showMobile,
                  additionalEmails,
                };
              });
              setForms(initialized);
              setInitialForms(initialized);
            }
          } catch (fetchError) {
            console.error("Error refreshing signatories:", fetchError);
          }
        } else {
          toast.error(t("uploadDocFlow.ErrDeletSignatory") || "Error deleting signatory");
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.ErrDeletSignatory") || "Error deleting signatory");
      } finally {
        setIsLoading(false);
        setDeleteConfirmationIndex(null);
      }
    } else {
      const updatedForms = [...forms];
      updatedForms.splice(index, 1);
      setForms(updatedForms);
      setDeleteConfirmationIndex(null);
    }
  };

  const handleContinue = async () => {
    if (forms.length === 0) {
      setForms([initialFormState]);
      return;
    }
    if (!validateForm()) {
      return;
    }

    setIsContinueDisabled(true);

    const data = {
      RegisterSignID: registerSignID,
      IsSerial: showSignOrder,
      Signatories: forms.map((form, index) => ({
        Name: form.name.trim(),
        NotificationType: form.notificationType,
        Email: form.showEmail ? form.email.trim() : "",
        AdditionalEmails: (form.additionalEmails || []).join(",") || "None",
        CountryCode: form.showMobile ? form.countryCode : "",
        Mobile: form.showMobile ? form.mobile : "",
        Company: form.company || "",
        SignOrder: index + 1,
        SignatureType: form.signatureType || "Needs To Sign",
        SignatureColor: form.signatureColor || "#8b6cff",
        SignPage: "FirstPage",
        SignPosition: "TopLeft",
        IsMobile: Boolean(form.showMobile),
        ExpiryDate: form.expiryDate || "2026-12-16",
        IsExpiring: Boolean(form.isExpiring),
        IsPasswordProtected: form.verificationType !== "None",
        LanguageType: form.languageType || "English",
        VerificationType: form.verificationType || "None",
        SignatoriesID: form.signatoriesID,
      })),
    };

    try {
      const response = await dashboardService.updateSignatoryAfterWorkflowInitiation(data);
      if (response?.data?.statusCode === "1" || response?.status === 200) {
        toast.success(response?.data?.message || t("uploadDocFlow.formUpdate") || "Signatories updated successfully");
        handleClose();
      } else {
        toast.error(response?.data?.message || t("uploadDocFlow.errFormUpdate") || "Error updating form");
      }
    } catch (error) {
      console.error("Error updating signatories:", error);
      toast.error(t("uploadDocFlow.errFormUpdate") || "Error updating form");
    } finally {
      setIsContinueDisabled(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size='lg'
      centered
      backdrop='static'
      keyboard={false}
      className='update-signatory-modal'
    >
      {/* Enhanced Header */}
      <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-primary)] shrink-0'>
            <UserCheck size={20} />
          </div>
          <div className={isRtl ? "text-right" : "text-left"}>
            <Modal.Title className='text-base md:text-lg font-semibold text-[var(--modern-text)] m-0 leading-tight'>
              {t("uploadDocFlow.UpdateSignOrder") || "Update Signatory"}
            </Modal.Title>
            <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
              {t("uploadDocFlow.updateSignatoriesSubtitle") ||
                "Modify recipient information, delivery channels, and verification methods."}
            </p>
          </div>
        </div>
      </Modal.Header>

      {/* Modal Body with Signatory Cards */}
      <Modal.Body className='p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-table-scrollbar'>
        {isLoading && forms.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16 gap-3 text-[var(--modern-muted)]'>
            <Loader2 size={24} className='animate-spin text-[var(--modern-primary)]' />
            <span className='text-xs font-medium'>{t("common.loading") || "Loading signatories..."}</span>
          </div>
        )}

        {!isLoading && forms.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center space-y-3'>
            <div className='w-12 h-12 rounded-2xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-muted)]'>
              <UserCheck size={22} />
            </div>
            <p className='text-sm font-semibold text-[var(--modern-text)] m-0'>
              {t("uploadDocFlow.noEditableSignatories") || "No editable signatories found for this document."}
            </p>
          </div>
        )}

        {forms.map((form, index) => {
          const formError = errors[index] || {};
          const isConfirmingDelete = deleteConfirmationIndex === index;
          const hasAdditionalEmail = showAdditionalEmail[index];
          const hasVerification = showVerificationMethods[index];

          return (
            <div
              key={form.signatoriesID || index}
              className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-4 md:p-5 space-y-4 transition-all'
              style={{
                borderLeftColor: isRtl ? undefined : form.signatureColor || "var(--modern-primary)",
                borderRightColor: isRtl ? form.signatureColor || "var(--modern-primary)" : undefined,
                borderLeftWidth: isRtl ? undefined : "4px",
                borderRightWidth: isRtl ? "4px" : undefined,
              }}
            >
              {/* Card Header Bar */}
              <div className='flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[var(--modern-border)]'>
                {/* Signatory Number & Badge */}
                <div className='flex items-center gap-2.5 min-w-0'>
                  <div
                    className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0'
                    style={{ backgroundColor: form.signatureColor || "#8b6cff" }}
                  >
                    {index + 1}
                  </div>
                  <div className='min-w-0'>
                    <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                      {t("uploadDocFlow.signatory") || "Signatory"} {index + 1}
                    </div>
                  </div>
                </div>

                {/* Card Header Quick Actions */}
                <div className='flex items-center flex-wrap gap-1.5'>
                  {/* Language Selector Dropdown */}
                  <Dropdown onSelect={(lng) => handleInputChange(index, "languageType", lng)}>
                    <Dropdown.Toggle
                      variant='none'
                      className='inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)] transition-colors'
                      aria-label='Select language'
                    >
                      <Globe size={13} className='text-[var(--modern-muted)]' />
                      <span>{form.languageType || "English"}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      className={`p-1 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] shadow-lg min-w-[120px] z-50 ${
                        isRtl ? "dropdown-menu-start" : "dropdown-menu-end"
                      }`}
                    >
                      {languageTypes.map((language, langIdx) => (
                        <Dropdown.Item
                          key={langIdx}
                          eventKey={language}
                          className='px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--modern-raised)] cursor-pointer text-[var(--modern-text)]'
                        >
                          {language}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* Toggle Additional Email button */}
                  <button
                    type='button'
                    onClick={() => toggleAdditionalEmail(index)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      hasAdditionalEmail
                        ? "bg-[var(--modern-primary)] text-white border-[var(--modern-primary)]"
                        : "bg-[var(--modern-raised)] text-[var(--modern-text)] border-[var(--modern-border)] hover:border-[var(--modern-border-strong)]"
                    }`}
                    title={t("uploadDocFlow.additionalEmail") || "Additional Email"}
                  >
                    <MailPlus size={13} />
                    <span className='hidden sm:inline'>{t("uploadDocFlow.additionalEmail") || "CC"}</span>
                    {(form.additionalEmails || []).length > 0 && (
                      <span className='w-4 h-4 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center'>
                        {(form.additionalEmails || []).length}
                      </span>
                    )}
                  </button>

                  {/* Toggle Verification Method button */}
                  <button
                    type='button'
                    onClick={() => toggleVerificationMethod(index)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      hasVerification
                        ? "bg-[var(--modern-primary)] text-white border-[var(--modern-primary)]"
                        : "bg-[var(--modern-raised)] text-[var(--modern-text)] border-[var(--modern-border)] hover:border-[var(--modern-border-strong)]"
                    }`}
                    title={t("uploadDocFlow.VerificationMethod") || "Verification"}
                  >
                    <ShieldCheck size={13} />
                    <span className='hidden sm:inline'>
                      {form.verificationType && form.verificationType !== "None"
                        ? form.verificationType
                        : t("uploadDocFlow.VerificationMethod") || "Verify"}
                    </span>
                  </button>

                  {/* Delete Signatory button */}
                  {forms.length > 1 && (
                    <button
                      type='button'
                      onClick={() => handleShowDeleteConfirmation(index)}
                      className='p-1.5 rounded-lg text-[var(--modern-muted)] hover:text-rose-500 hover:bg-rose-500/10 border border-transparent transition-colors'
                      title={t("uploadDocFlow.deleteSignatory") || "Delete Signatory"}
                      aria-label='Delete Signatory'
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Delete Confirmation Banner */}
              {isConfirmingDelete && (
                <div className='flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400'>
                  <div className='flex items-center gap-2 text-xs font-semibold'>
                    <AlertCircle size={15} />
                    <span>
                      {t("uploadDocFlow.deleteSignatory") || "Are you sure you want to delete this signatory?"}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => setDeleteConfirmationIndex(null)}
                      disabled={isLoading}
                      className='px-3 py-1 text-xs'
                    >
                      {t("uploadDocFlow.cancel") || "Cancel"}
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => handleDeleteSignatory(index, form.signatoriesID)}
                      disabled={isLoading}
                      className='px-3 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white'
                    >
                      {isLoading ? (
                        <Loader2 size={13} className='animate-spin' />
                      ) : (
                        t("createTeam.confirm") || "Delete"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Input Fields Grid */}
              <div className='grid grid-cols-1 md:grid-cols-12 gap-3.5'>
                {/* Signatory Full Name */}
                <div className='md:col-span-7'>
                  <label
                    className={`block text-xs font-semibold text-[var(--modern-text)] mb-1 ${
                      isRtl ? "text-right" : "text-left"
                    }`}
                  >
                    {t("uploadDocFlow.name") || "Full Name"} <span className='text-rose-500'>*</span>
                  </label>
                  <div className='relative flex items-center'>
                    <div
                      className={`absolute ${
                        isRtl ? "right-3" : "left-3"
                      } text-[var(--modern-muted)] pointer-events-none`}
                    >
                      <User size={15} />
                    </div>
                    <input
                      type='text'
                      value={form.name || ""}
                      onChange={(e) => handleInputChange(index, "name", e.target.value)}
                      placeholder={t("uploadDocFlow.enterName") || "Enter recipient name"}
                      className={`w-full ${
                        isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                      } py-2 text-sm rounded-xl bg-[var(--modern-raised)] border ${
                        formError.name ? "border-rose-500" : "border-[var(--modern-border)]"
                      } text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none focus:border-[var(--modern-primary)] transition-colors`}
                    />
                  </div>
                  {formError.name && (
                    <p className={`text-xs text-rose-500 m-0 mt-1 ${isRtl ? "text-right" : "text-left"}`}>
                      {formError.name}
                    </p>
                  )}
                </div>

                {/* Notification Channel */}
                <div className='md:col-span-5'>
                  <label
                    className={`block text-xs font-semibold text-[var(--modern-text)] mb-1 ${
                      isRtl ? "text-right" : "text-left"
                    }`}
                  >
                    {t("uploadDocFlow.notificationType") || "Delivery Channel"}
                  </label>
                  <Dropdown onSelect={(channel) => handleInputChange(index, "notificationType", channel)}>
                    <Dropdown.Toggle
                      variant='none'
                      className='w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)] transition-colors'
                    >
                      <span>{form.notificationType || "Email"}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      className={`w-full p-1 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] shadow-lg z-50 ${
                        isRtl ? "dropdown-menu-start" : "dropdown-menu-end"
                      }`}
                    >
                      {notificationTypes.map((channel, notIdx) => (
                        <Dropdown.Item
                          key={notIdx}
                          eventKey={channel}
                          className='px-3 py-2 text-sm rounded-lg hover:bg-[var(--modern-raised)] cursor-pointer text-[var(--modern-text)]'
                        >
                          {channel}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* Email Address (when applicable) */}
                {form.showEmail && (
                  <div className={form.showMobile ? "md:col-span-6" : "md:col-span-12"}>
                    <label
                      className={`block text-xs font-semibold text-[var(--modern-text)] mb-1 ${
                        isRtl ? "text-right" : "text-left"
                      }`}
                    >
                      {t("uploadDocFlow.emailAddress") || "Email Address"} <span className='text-rose-500'>*</span>
                    </label>
                    <div className='relative flex items-center'>
                      <div
                        className={`absolute ${
                          isRtl ? "right-3" : "left-3"
                        } text-[var(--modern-muted)] pointer-events-none`}
                      >
                        <Mail size={15} />
                      </div>
                      <input
                        type='email'
                        value={form.email || ""}
                        onChange={(e) => handleInputChange(index, "email", e.target.value)}
                        placeholder={t("uploadDocFlow.enterEmail") || "recipient@example.com"}
                        className={`w-full ${
                          isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                        } py-2 text-sm rounded-xl bg-[var(--modern-raised)] border ${
                          formError.email ? "border-rose-500" : "border-[var(--modern-border)]"
                        } text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:outline-none focus:border-[var(--modern-primary)] transition-colors`}
                      />
                    </div>
                    {formError.email && (
                      <p className={`text-xs text-rose-500 m-0 mt-1 ${isRtl ? "text-right" : "text-left"}`}>
                        {formError.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Mobile Phone (when applicable) */}
                {form.showMobile && (
                  <div className={form.showEmail ? "md:col-span-6" : "md:col-span-12"}>
                    <label
                      className={`block text-xs font-semibold text-[var(--modern-text)] mb-1 ${
                        isRtl ? "text-right" : "text-left"
                      }`}
                    >
                      {t("logScreens.mobileNumber") || "Mobile Number"} <span className='text-rose-500'>*</span>
                    </label>
                    <div className='flex items-center gap-2'>
                      <select
                        value={form.countryCode || ""}
                        onChange={(e) => handleInputChange(index, "countryCode", e.target.value)}
                        className='w-28 shrink-0 px-2.5 py-2 text-sm rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] focus:border-[var(--modern-primary)] focus:outline-none transition-colors'
                        aria-label={t("logScreens.Codes") || "Country code"}
                      >
                        <option value='' disabled>
                          {t("logScreens.Codes") || "Code"}
                        </option>
                        {countryCodes.map((code) => (
                          <option key={code.lookupID} value={code.lookupID}>
                            {code.lookupID}
                          </option>
                        ))}
                      </select>

                      <div className='relative flex-1 flex items-center'>
                        <div
                          className={`absolute ${
                            isRtl ? "right-3" : "left-3"
                          } text-[var(--modern-muted)] pointer-events-none`}
                        >
                          <Phone size={14} />
                        </div>
                        <input
                          type='tel'
                          value={form.mobile || ""}
                          onChange={(e) => handleInputChange(index, "mobile", e.target.value)}
                          placeholder={t("logScreens.mobileNumber") || "Phone number"}
                          className={`w-full ${
                            isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                          } py-2 text-sm rounded-xl bg-[var(--modern-raised)] border ${
                            formError.mobile ? "border-rose-500" : "border-[var(--modern-border)]"
                          } text-[var(--modern-text)] placeholder-[var(--modern-muted)] focus:border-[var(--modern-primary)] focus:outline-none transition-colors`}
                          dir='ltr'
                        />
                      </div>
                    </div>
                    {(formError.mobile || formError.countryCode) && (
                      <p className={`text-xs text-rose-500 m-0 mt-1 ${isRtl ? "text-right" : "text-left"}`}>
                        {formError.mobile || formError.countryCode}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Expandable Additional Email (CC) Box */}
              {hasAdditionalEmail && (
                <div className='p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <MailPlus size={15} className='text-[var(--modern-primary)]' />
                      <span className='text-xs font-semibold text-[var(--modern-text)]'>
                        {t("uploadDocFlow.additionalEmail") || "Additional Email (CC)"}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => toggleAdditionalEmail(index)}
                      className='p-1 text-[var(--modern-muted)] hover:text-[var(--modern-text)]'
                      aria-label='Close additional email panel'
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className='text-[11px] text-[var(--modern-muted)] m-0'>
                    {t("uploadDocFlow.additionalEmailHint") ||
                      "Add extra email addresses to receive copies of notifications."}
                  </p>
                  <Chips
                    value={form.additionalEmails || []}
                    onChange={(e) => handleChipsChange(index, e.value)}
                    placeholder={t("uploadDocFlow.enterAdditionalEmail") || "Type email and press Enter"}
                    className='w-full'
                  />
                </div>
              )}

              {/* Expandable Verification Method Box */}
              {hasVerification && (
                <div className='p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <ShieldCheck size={15} className='text-[var(--modern-primary)]' />
                      <span className='text-xs font-semibold text-[var(--modern-text)]'>
                        {t("uploadDocFlow.VerificationMethod") || "Two-Factor Verification"}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => toggleVerificationMethod(index)}
                      className='p-1 text-[var(--modern-muted)] hover:text-[var(--modern-text)]'
                      aria-label='Close verification method panel'
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className='text-[11px] text-[var(--modern-muted)] m-0'>
                    {t("uploadDocFlow.verificationHint") ||
                      "Require recipient identity authentication prior to viewing or signing the document."}
                  </p>
                  <div className='pt-1'>
                    <Dropdown onSelect={(m) => handleInputChange(index, "verificationType", m)}>
                      <Dropdown.Toggle
                        variant='none'
                        className='w-full max-w-xs flex items-center justify-between px-3 py-2 text-sm rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)] transition-colors'
                      >
                        <span>{form.verificationType || "None"}</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        className={`p-1 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] shadow-lg z-50 ${
                          isRtl ? "dropdown-menu-start" : "dropdown-menu-end"
                        }`}
                      >
                        {verificationMethods.map((method, methodIdx) => (
                          <Dropdown.Item
                            key={methodIdx}
                            eventKey={method}
                            className='px-3 py-2 text-sm rounded-lg hover:bg-[var(--modern-raised)] cursor-pointer text-[var(--modern-text)]'
                          >
                            {method}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Modal.Body>

      {/* Enhanced Footer */}
      <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-between bg-[var(--modern-card)]'>
        <Button
          variant='secondary'
          onClick={handleClose}
          disabled={isLoading || isContinueDisabled}
          className='px-4 py-2 text-xs font-semibold rounded-lg'
        >
          {t("uploadDocFlow.cancel") || "Cancel"}
        </Button>
        <Button
          variant='default'
          onClick={handleContinue}
          disabled={isContinueDisabled || isFormUnchanged || isLoading}
          className='inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--modern-primary)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity'
        >
          {isLoading || isContinueDisabled ? (
            <>
              <Loader2 size={14} className='animate-spin' />
              <span>{t("uploadDocFlow.saving") || "Saving..."}</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>{t("uploadDocFlow.saveChanges") || t("createTeam.confirm") || "Save Changes"}</span>
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeOrderModal;
