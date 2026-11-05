import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button, Form, Offcanvas, Dropdown } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import PhoneInput from "react-phone-input-2";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import userService from "@/services/userService";
import { UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { ChevronDown, ChevronUp, Search, X, Users, Check } from "lucide-react";

const AddRecipient = ({ setActiveStep, setCompletedSteps, onPreviewSync }) => {
  const [recipientForms, setRecipientForms] = useState([
    {
      name: "",
      notificationType: "Email",
      email: "",
      countryCode: "",
      phone: "",
      phoneNumber: "",
      company: "",
      signOrder: 1,
      signatureType: "",
      signColor: "#4d8dff",
      signPage: "FirstPage",
      signPosition: "TopLeft",
      isExpiring: true,
      ismobile: false,
      expiryDate: "2025-12-31",
      templateSignatoryID: null,
    },
  ]);
  const [signatureTypes, setSignatureTypes] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [signatoryColor, setSignatoryColor] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingSignatoryID, setDeletingSignatoryID] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [errors, setErrors] = useState([]);
  const { t } = useTranslation();
  const { user } = useUser();
  const [countryCodes, setCountryCodes] = useState([]);
  const [isContinueDisabled, setIsContinueDisabled] = useState(false);
  const [teamMemberNames, setTeamMemberNames] = useState([]);
  const [enableSignOrder, setEnableSignOrder] = useState(true);

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [recipientTab, setRecipientTab] = useState("team");
  const [adhockNames, setAdhockNames] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const storedTemplateID =
    sessionStorage.getItem("templateID") || localStorage.getItem("templateID");

  useEffect(() => {
    if (typeof onPreviewSync === "function") {
      onPreviewSync({ recipients: recipientForms });
    }
  }, [recipientForms, onPreviewSync]);

  // Fetching country codes for the dropdown
  useEffect(() => {
    uploadFlowService
      .getLookups("countryCode")
      .then((response) => {
        if (response.data.successStatus) {
          setCountryCodes(response.data.response);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("signatureType")
      .then((response) => {
        if (response.data.successStatus) {
          const signatureTypeOptions = response.data.response.map(
            (item) => item.name
          );
          setSignatureTypes(signatureTypeOptions);
          setRecipientForms((prevRecipientForms) =>
            prevRecipientForms.map((form) => ({
              ...form,
              signatureType: form.signatureType || signatureTypeOptions[0],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("NotificationType")
      .then((response) => {
        if (response.data.successStatus) {
          const notificationTypeOptions = response.data.response.map(
            (item) => item.name
          );
          setNotificationTypes(notificationTypeOptions);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("SignColor")
      .then((response) => {
        if (response.data.successStatus) {
          const formColors = response.data.response.map((color) => color.name);
          setSignatoryColor(formColors);
          setRecipientForms((prevRecipientForms) =>
            prevRecipientForms.map((form, index) => ({
              ...form,
              signColor:
                form.signColor && form.signColor !== "#4d8dff"
                  ? form.signColor
                  : formColors[index % formColors.length] || "#4d8dff",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await templateService.getTemplateData(storedTemplateID);

      if (response.data.successStatus) {
        setIsLoading(false);
        const { templateSignatory } = response.data.response;

        if (Array.isArray(templateSignatory) && templateSignatory.length > 0) {
          const mappedForms = templateSignatory.map((signatory) => {
            const phoneNumber =
              signatory.countryCode && signatory.mobile
                ? signatory.countryCode + signatory.mobile
                : "";

            return {
              name: signatory.name || "",
              notificationType: signatory.notificationType || "Email",
              email: signatory.email || "",
              countryCode: signatory.countryCode || "",
              phone: signatory.mobile || "",
              phoneNumber: phoneNumber,
              company: signatory.company || "",
              signOrder: signatory.signOrder || 1,
              signatureType: signatory.signatureType || "",
              signColor: signatory.signatureColor || "#ffe987",
              signPage: signatory.signPage || "FirstPage",
              signPosition: signatory.signPosition || "TopLeft",
              isExpiring: signatory.isExpiring || true,
              ismobile: signatory.ismobile || false,
              expiryDate: signatory.expiryDateFormatted || "2025-12-31",
              templateSignatoryID: signatory.templateSignatoryID || null,
            };
          });

          setRecipientForms(mappedForms);
        }
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get Team & Adhoc API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        if (!user.AccountID) {
          return;
        }
        const response = await userService.getAppUserTeam(user.AccountID);

        const teamMembers = response.data.response.map((member) => ({
          name: member.fullName.trim(),
          email: member.emailID.trim(),
        }));

        setTeamMemberNames(teamMembers);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    const fetchAdhockUsers = async () => {
      try {
        const response = await uploadFlowService.getAdhockUsers();

        const adhockUsers = response.data.response.map((u) => ({
          name: u.name.trim(),
          email: u.emailID.trim(),
        }));

        setAdhockNames(adhockUsers);
      } catch (error) {
        console.error("Error fetching adhock users:", error);
      }
    };

    fetchTeamMembers();
    fetchAdhockUsers();
  }, [user.AccountID]);

  const validateForm = () => {
    let hasErrors = false;
    const emailSet = new Set();
    const mobileSet = new Set();
    const newErrors = recipientForms.map((form) => {
      const formErrors = {};

      if (!form.name) {
        formErrors.name = t("uploadDocFlow.requiredName");
        hasErrors = true;
      }

      if (form.notificationType === "Email") {
        if (!form.email) {
          formErrors.email = t("uploadDocFlow.emailRequired");
          hasErrors = true;
        } else if (emailSet.has(form.email)) {
          formErrors.email = t("uploadDocFlow.alreadyEmailUsed");
          hasErrors = true;
        } else {
          emailSet.add(form.email);
        }
      }

      if (
        form.notificationType === "SMS" ||
        form.notificationType === "WhatsApp"
      ) {
        if (!form.phoneNumber || form.phoneNumber.length < 10) {
          formErrors.phone = t("logScreens.mobileRequired");
          hasErrors = true;
        } else {
          if (mobileSet.has(form.phoneNumber)) {
            formErrors.phone = t("uploadDocFlow.mobileDuplicate");
            hasErrors = true;
          } else {
            mobileSet.add(form.phoneNumber);
          }
        }
      }

      return formErrors;
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleFormChange = (index, field, value) => {
    const newRecipientForms = [...recipientForms];
    const newErrors = [...errors];

    newRecipientForms[index][field] = value;

    if (field === "notificationType") {
      if (value === "Email") {
        newRecipientForms[index].phone = "";
        newRecipientForms[index].countryCode = "";
        newRecipientForms[index].phoneNumber = "";
      } else if (value === "SMS" || value === "WhatsApp") {
        newRecipientForms[index].email = "";
      }
    }

    if (newErrors[index]) {
      delete newErrors[index][field];
      if (Object.keys(newErrors[index]).length === 0) {
        newErrors[index] = null;
      }
    }

    setRecipientForms(newRecipientForms);
    setErrors(newErrors);
  };

  const handlePhoneChange = (index, phone) => {
    const newRecipientForms = [...recipientForms];
    newRecipientForms[index].phoneNumber = phone;

    if (phone && phone.length >= 10) {
      const countryCode = phone.substring(0, phone.length - 10);
      const mobileNumber = phone.substring(phone.length - 10);
      newRecipientForms[index].countryCode = countryCode;
      newRecipientForms[index].phone = mobileNumber;

      const newErrors = [...errors];
      if (newErrors[index]) {
        delete newErrors[index].phone;
        if (Object.keys(newErrors[index]).length === 0) {
          newErrors[index] = null;
        }
      }
      setErrors(newErrors);
    }

    setRecipientForms(newRecipientForms);
  };

  const getNextAvailableColor = () => {
    const usedColors = new Set(recipientForms.map((form) => form.signColor));
    for (const color of signatoryColor) {
      if (!usedColors.has(color)) {
        return color;
      }
    }
    return signatoryColor[0] || "#ffe987";
  };

  const handleAddRecipient = () => {
    const newColor = getNextAvailableColor();
    setRecipientForms((prevForms) => [
      ...prevForms,
      {
        name: "",
        notificationType: "Email",
        email: "",
        countryCode: "",
        phone: "",
        phoneNumber: "",
        company: "",
        signOrder: prevForms.length + 1,
        signatureType: signatureTypes.length > 0 ? signatureTypes[0] : "",
        signColor: newColor,
      },
    ]);
  };

  const handleDeleteRecipient = async (signatoryID, index) => {
    if (signatoryID) {
      setIsLoading(true);
      try {
        const response = await templateService.deleteTemplateSignatory({
          TemplateSignatoryID: signatoryID,
        });

        if (response.data.successStatus) {
          toast.success(t("uploadDocFlow.signatoryDeleted"));
        } else {
          toast.error(t("uploadDocFlow.ErrDeletSignatory"));
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.ErrDeletSignatory"));
      } finally {
        setIsLoading(false);
      }
    }

    setRecipientForms((prevForms) => {
      const updatedForms = prevForms.filter((_, idx) => idx !== index);
      return updatedForms.map((form, idx) => ({
        ...form,
        signOrder: idx + 1,
      }));
    });

    setShowConfirmModal(false);
  };

  const handleShowConfirmModal = (templateSignatoryID, index) => {
    setDeletingSignatoryID(templateSignatoryID);
    setDeletingIndex(index);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedForms = Array.from(recipientForms);
    const [removed] = reorderedForms.splice(result.source.index, 1);
    reorderedForms.splice(result.destination.index, 0, removed);

    const updatedForms = reorderedForms.map((form, index) => ({
      ...form,
      signOrder: index + 1,
    }));

    setRecipientForms(updatedForms);
  };

  const handleMoveRecipient = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= recipientForms.length) return;

    const reorderedForms = Array.from(recipientForms);
    const [removed] = reorderedForms.splice(index, 1);
    reorderedForms.splice(targetIndex, 0, removed);

    const updatedForms = reorderedForms.map((form, idx) => ({
      ...form,
      signOrder: idx + 1,
    }));

    setRecipientForms(updatedForms);
  };

  const splitMobileNumber = (mobileNumber = "") => {
    const [CountryCode, Mobile] = String(mobileNumber).split("-");
    return {
      CountryCode,
      Mobile,
    };
  };

  const handleAddYourself = () => {
    const { CountryCode, Mobile } = splitMobileNumber(user.mobileNumber);
    const phoneNumber = CountryCode && Mobile ? CountryCode + Mobile : "";
    const newColor = getNextAvailableColor();

    setRecipientForms([
      ...recipientForms,
      {
        name: user.fullName,
        email: user.email,
        countryCode: CountryCode,
        phone: Mobile,
        phoneNumber: phoneNumber,
        company: "",
        notificationType: "Email",
        signatureType: signatureTypes.length > 0 ? signatureTypes[0] : "",
        signColor: newColor,
        signOrder: recipientForms.length + 1,
      },
    ]);
  };

  const handleBack = async () => {
    setActiveStep(1);
    setCompletedSteps([0]);
  };

  const handleContinue = async () => {
    if (recipientForms.length === 0) {
      handleAddRecipient();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsContinueDisabled(true);
    setIsLoading(true);

    try {
      const requestBody = recipientForms.map((form) => ({
        TemplateID: storedTemplateID,
        Name: form.name,
        NotificationType: form.notificationType,
        Email: form.notificationType === "Email" ? form.email : "",
        CountryCode:
          form.notificationType === "SMS" || form.notificationType === "WhatsApp"
            ? form.countryCode
            : "",
        Mobile:
          form.notificationType === "SMS" || form.notificationType === "WhatsApp"
            ? form.phone
            : "",
        Company: form.company,
        SignOrder: form.signOrder,
        SignatureType: form.signatureType,
        SignatureColor: form.signColor,
        SignPage: form.signPage,
        SignPosition: form.signPosition,
        Ismobile: form.ismobile,
        ExpiryDate: form.expiryDate,
        IsExpiring: form.isExpiring,
      }));

      const response = await templateService.createBulkTemplateSignatories(
        requestBody
      );

      if (response.data.successStatus) {
        setActiveStep(3);
        setCompletedSteps([1, 2]);
      } else {
        toast.error(t("uploadDocFlow.errorCreatingBulkSignatories"));
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.errorCreatingBulkSignatories"));
    } finally {
      setIsLoading(false);
      setIsContinueDisabled(false);
    }
  };

  const filteredTeamMembers = teamMemberNames.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdhockUsers = adhockNames.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecipientSelection = (name, email) => {
    if (selectedIndex === null) return;

    const updatedForms = [...recipientForms];
    updatedForms[selectedIndex] = {
      ...updatedForms[selectedIndex],
      name,
      email,
    };
    setRecipientForms(updatedForms);

    if (errors[selectedIndex]) {
      const newErrors = [...errors];
      newErrors[selectedIndex] = null;
      setErrors(newErrors);
    }
    setShowOffcanvas(false);
  };

  const isStepValid =
    recipientForms.length > 0 &&
    recipientForms.every((f) => {
      if (!f.name || !f.name.trim()) return false;
      if (f.notificationType === "Email") return Boolean(f.email && f.email.trim());
      return Boolean(f.phoneNumber && f.phoneNumber.length >= 10);
    });

  const resolvedNotificationTypes =
    notificationTypes.length > 0
      ? notificationTypes
      : ["Email", "SMS", "WhatsApp"];
  const resolvedSignatureTypes =
    signatureTypes.length > 0 ? signatureTypes : ["Needs To Sign", "View Only"];

  return (
    <div className='signatories-forms flex min-h-0 flex-1 flex-col'>
      {/* Studio Panel Header (.phead) */}
      <div className='px-5 pt-5 pb-1.5'>
        <small className='block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--modern-primary,#4d8dff)]'>
          {t("uploadDocFlow.step", "STEP")} 2 {t("uploadDocFlow.of", "OF")} 3
        </small>
        <h1 className='mt-0.5 text-[22px] font-bold tracking-tight text-[var(--modern-text)]'>
          {t("Stepper.AddSigners", "Add Signers")}
        </h1>
        <p className='mt-1 text-[13px] text-[var(--modern-muted)]'>
          {t("templateUploadFlow.whoNeedsToSign", "Who needs to sign this template?")}
        </p>
      </div>

      {/* Studio Scrollable Body (.pbody) */}
      <div className='signatory-form-container min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-5'>
        {/* Signing Order Switch Row (.opt) */}
        <div className='mb-3 flex items-center justify-between gap-3 border-b border-[var(--modern-border)] pb-3'>
          <div className='min-w-0'>
            <span className='block text-sm font-semibold text-[var(--modern-text)]'>
              {t("uploadDocFlow.setSigningOrder", "Set signing order")}
            </span>
            <small className='block text-xs text-[var(--modern-muted)]'>
              {t(
                "uploadDocFlow.signingOrderHint",
                "Signers receive the document one after another"
              )}
            </small>
          </div>
          <button
            type='button'
            role='switch'
            aria-checked={enableSignOrder}
            aria-label={t("uploadDocFlow.setSigningOrder", "Set signing order")}
            onClick={() => setEnableSignOrder((prev) => !prev)}
            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
              enableSignOrder
                ? "border-[var(--modern-primary,#4d8dff)] bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_22%,transparent)]"
                : "border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f1f5f9)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                enableSignOrder
                  ? "left-[22px] rtl:left-auto rtl:right-[22px] bg-[var(--modern-primary,#4d8dff)]"
                  : "left-0.5 rtl:left-auto rtl:right-0.5 bg-[var(--modern-muted,#64748b)]"
              }`}
            />
          </button>
        </div>

        {/* Signer Cards List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='forms'>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className='space-y-3'
              >
                {recipientForms &&
                  recipientForms.map((form, index) => {
                    const accentColor = form.signColor || "#4d8dff";
                    return (
                      <Draggable
                        key={index}
                        draggableId={index.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className='signatory-form relative rounded-[18px] border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] p-3.5 transition-colors'
                            style={{
                              borderInlineStartWidth: "4px",
                              borderInlineStartColor: accentColor,
                              borderInlineStartStyle: "solid",
                              ...provided.draggableProps.style,
                            }}
                          >
                            {/* Card Header (.hd) */}
                            <div className='mb-3 flex items-center justify-between gap-2'>
                              <div className='flex min-w-0 items-center gap-2'>
                                <div
                                  {...provided.dragHandleProps}
                                  className='drag-icon inline-flex cursor-grab items-center justify-center text-[var(--modern-muted)] hover:text-[var(--modern-text)]'
                                  title={t("uploadDocFlow.dragToReorder", "Drag to reorder")}
                                >
                                  <Icons.DragHandle size={16} />
                                </div>

                                {enableSignOrder && (
                                  <span
                                    className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold text-white'
                                    style={{ backgroundColor: accentColor }}
                                  >
                                    {index + 1}
                                  </span>
                                )}

                                <h3 className='m-0 truncate text-sm font-semibold text-[var(--modern-text)]'>
                                  {t("uploadDocFlow.signatory")} {index + 1}
                                </h3>
                              </div>

                              <div className='flex shrink-0 items-center gap-1'>
                                {enableSignOrder && recipientForms.length > 1 && (
                                  <>
                                    <button
                                      type='button'
                                      disabled={index === 0}
                                      onClick={() => handleMoveRecipient(index, -1)}
                                      aria-label='Move up'
                                      className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border)] bg-transparent text-[var(--modern-muted)] transition-colors hover:bg-[var(--modern-raised)] hover:text-[var(--modern-text)] disabled:opacity-35'
                                    >
                                      <ChevronUp size={15} />
                                    </button>
                                    <button
                                      type='button'
                                      disabled={index === recipientForms.length - 1}
                                      onClick={() => handleMoveRecipient(index, 1)}
                                      aria-label='Move down'
                                      className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border)] bg-transparent text-[var(--modern-muted)] transition-colors hover:bg-[var(--modern-raised)] hover:text-[var(--modern-text)] disabled:opacity-35'
                                    >
                                      <ChevronDown size={15} />
                                    </button>
                                  </>
                                )}

                                <button
                                  type='button'
                                  title={t("uploadDocFlow.existingUser", "Existing Users")}
                                  aria-label={t("uploadDocFlow.existingUser", "Existing Users")}
                                  onClick={() => {
                                    setSelectedIndex(index);
                                    setSearchQuery("");
                                    setShowOffcanvas(true);
                                  }}
                                  className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f8fafc)] text-[var(--modern-primary,#4d8dff)] transition-colors hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_10%,transparent)] cursor-pointer shrink-0'
                                >
                                  <Icons.UserSearch size={15} />
                                </button>

                                <button
                                  type='button'
                                  aria-label={t("uploadDocFlow.delete", "Delete")}
                                  onClick={() =>
                                    handleShowConfirmModal(
                                      form.templateSignatoryID,
                                      index
                                    )
                                  }
                                  className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-transparent text-[var(--modern-muted,#64748b)] transition-colors hover:border-[var(--modern-danger,#ef4444)] hover:text-[var(--modern-danger,#ef4444)] cursor-pointer shrink-0'
                                  title={t("uploadDocFlow.delete", "Delete")}
                                >
                                  <Icons.DeleteAction size={15} />
                                </button>

                                {/* Three Dots Menu for Notification Type and Delete */}
                                <Dropdown align='end'>
                                  <Dropdown.Toggle
                                    variant='ghost'
                                    id={`moreOptionsTemplate${index}`}
                                    className='!h-8 !w-8 !p-0 rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-transparent text-[var(--modern-muted,#64748b)] hover:border-[var(--modern-border-strong)] hover:text-[var(--modern-text)] inline-flex items-center justify-center cursor-pointer after:!hidden shrink-0'
                                    title={t("uploadDocFlow.moreOptions", "More options")}
                                    aria-label={t("uploadDocFlow.moreOptions", "More options")}
                                  >
                                    <Icons.OtherDoc size={16} />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu
                                    align='end'
                                    className='!bg-[var(--modern-card,#ffffff)] !border-[var(--modern-border,#e2e8f0)] text-sm shadow-xl py-1.5 min-w-[220px] !right-0 !left-auto rtl:!right-auto rtl:!left-0 z-[1060]'
                                  >
                                    <div className='px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)]'>
                                      {t("uploadDocFlow.notificationType", "Notification Type")}
                                    </div>
                                    {resolvedNotificationTypes.map((notification, notIndex) => (
                                      <Dropdown.Item
                                        key={notIndex}
                                        onClick={() => handleFormChange(index, "notificationType", notification)}
                                        className={`flex items-center justify-between text-sm py-1.5 px-3.5 hover:bg-[var(--modern-raised)] cursor-pointer ${
                                          (form.notificationType || "Email") === notification ? "font-semibold text-[var(--modern-primary)] bg-[var(--modern-raised)]/60" : "text-[var(--modern-text)]"
                                        }`}
                                      >
                                        <span>{notification}</span>
                                        {(form.notificationType || "Email") === notification && <span className='text-xs'>✓</span>}
                                      </Dropdown.Item>
                                    ))}

                                    <div className='my-1.5 border-t border-[var(--modern-border)]' />
                                    <Dropdown.Item
                                      onClick={() => handleShowConfirmModal(form.templateSignatoryID, index)}
                                      className='flex items-center gap-2.5 text-sm py-2 px-3.5 text-[var(--modern-danger,#ef4444)] hover:bg-[var(--modern-danger,#ef4444)]/10 cursor-pointer font-medium'
                                    >
                                      <Icons.DeleteAction size={15} />
                                      <span>{t("uploadDocFlow.delete", "Delete Signatory")}</span>
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                            </div>

                            {/* Row 2: Secondary Pills - Role & Notification Indicator */}
                            <div className='flex items-center gap-1.5 flex-wrap mb-3'>
                              <Dropdown onSelect={(e) => handleFormChange(index, "signatureType", e)}>
                                <Dropdown.Toggle
                                  variant='ghost'
                                  id={`signatureTypeTemplate${index}`}
                                  className='!h-7 !px-2.5 !text-xs !rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] inline-flex items-center gap-1.5 cursor-pointer'
                                >
                                  {(form.signatureType || "Needs To Sign") === "Needs To Sign" && <Icons.SignatureType size={13} />}
                                  {(form.signatureType || "Needs To Sign") === "View Only" && <Icons.View size={13} />}
                                  <span className='truncate max-w-[110px] font-medium'>{form.signatureType || "Needs To Sign"}</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align='start' className='!bg-[var(--modern-card)] !border-[var(--modern-border)] text-sm shadow-lg'>
                                  {resolvedSignatureTypes.map((signature, sigIndex) => (
                                    <Dropdown.Item key={sigIndex} eventKey={signature} className='flex items-center gap-2 text-sm py-1.5 px-3 hover:bg-[var(--modern-raised)]'>
                                      {signature === "Needs To Sign" && <Icons.SignatureType size={14} />}
                                      {signature === "View Only" && <Icons.View size={14} />}
                                      <span>{signature}</span>
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>

                              {form.notificationType && (
                                <span className='inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs font-medium text-[var(--modern-muted)]'>
                                  <span>{form.notificationType}</span>
                                </span>
                              )}
                            </div>

                            {/* Form Fields */}
                            <div className='space-y-3'>
                              <div>
                                <Form.Group controlId={`formSignatoryName${index}`}>
                                  <Form.Label className='mb-1 block text-xs font-medium text-[var(--modern-muted,#64748b)]'>
                                    {t("uploadDocFlow.name")}{" "}
                                    <span className='text-[var(--modern-danger,#ef4444)]'>*</span>
                                  </Form.Label>
                                  <Form.Control
                                    list='teamNames'
                                    type='text'
                                    value={form.name}
                                    onChange={(e) =>
                                      handleFormChange(index, "name", e.target.value)
                                    }
                                    placeholder={t("uploadDocFlow.enterName")}
                                    className='!h-[40px] !rounded-xl'
                                  />
                                  {errors[index]?.name && (
                                    <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>
                                      {errors[index].name}
                                    </div>
                                  )}
                                </Form.Group>
                              </div>

                              {form.notificationType === "Email" && (
                                <div>
                                  <Form.Group controlId={`formEmailAddress${index}`}>
                                    <Form.Label className='mb-1 block text-xs font-medium text-[var(--modern-muted,#64748b)]'>
                                      {t("uploadDocFlow.emailAddress")}{" "}
                                      <span className='text-[var(--modern-danger,#ef4444)]'>*</span>
                                    </Form.Label>
                                    <Form.Control
                                      list='teamEmails'
                                      type='email'
                                      value={form.email}
                                      onChange={(e) =>
                                        handleFormChange(index, "email", e.target.value)
                                      }
                                      placeholder={t("uploadDocFlow.enterEmail")}
                                      className='!h-[40px] !rounded-xl'
                                    />
                                    {errors[index]?.email && (
                                      <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>
                                        {errors[index].email}
                                      </div>
                                    )}
                                  </Form.Group>
                                </div>
                              )}

                              {(form.notificationType === "SMS" ||
                                form.notificationType === "WhatsApp") && (
                                <div>
                                  <Form.Group controlId={`formPhone${index}`}>
                                    <Form.Label className='mb-1 block text-xs font-medium text-[var(--modern-muted,#64748b)]'>
                                      {t("logScreens.mobileNumber")}{" "}
                                      <span className='text-[var(--modern-danger,#ef4444)]'>*</span>
                                    </Form.Label>
                                    <div className='phone-input-container'>
                                      <PhoneInput
                                        excludeCountries={["il"]}
                                        country={"sa"}
                                        value={form.phoneNumber || ""}
                                        onChange={(phone) =>
                                          handlePhoneChange(index, phone)
                                        }
                                        inputClass='form-control'
                                        containerClass='w-full'
                                      />
                                    </div>
                                    {form.phoneNumber &&
                                      form.phoneNumber.length < 10 && (
                                        <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>
                                          {t("logScreens.ValidmobileNumber")}
                                        </div>
                                      )}
                                    {errors[index]?.phone && (
                                      <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>
                                        {errors[index].phone}
                                      </div>
                                    )}
                                  </Form.Group>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Recipient / Add Yourself Ghost Buttons (.ghost) */}
        <div className='mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
          <button
            type='button'
            onClick={handleAddRecipient}
            className='flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[var(--modern-border-strong,#cbd5e1)] bg-transparent text-xs font-semibold text-[var(--modern-primary,#4d8dff)] transition-colors hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[var(--modern-raised,#f8fafc)]'
          >
            <Icons.AddCircle size={17} />
            <span>{t("uploadDocFlow.addRecipient")}</span>
          </button>

          <button
            type='button'
            onClick={handleAddYourself}
            className='flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[var(--modern-border-strong,#cbd5e1)] bg-transparent text-xs font-semibold text-[var(--modern-primary,#4d8dff)] transition-colors hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[var(--modern-raised,#f8fafc)]'
          >
            <Icons.AddCircle size={17} />
            <span>{t("uploadDocFlow.addYourself")}</span>
          </button>
        </div>
      </div>

      {/* Studio Sticky Footer (.pfoot) */}
      <div className='mt-auto sticky bottom-0 z-20 flex items-center justify-between gap-2.5 border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-5 py-3.5'>
        <Button
          variant='outline'
          id='hide_part_one'
          className='!h-[42px] !rounded-full !px-4 font-semibold shrink-0 hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] hover:bg-[color-mix(in_srgb,var(--modern-primary)_8%,var(--modern-card))] transition-all'
          onClick={handleBack}
          disabled={isLoading}
        >
          {t("uploadDocFlow.back")}
        </Button>

        <div className='flex min-w-0 flex-1 items-center gap-2 text-xs text-[var(--modern-muted,#64748b)]'>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isStepValid
                ? "bg-[var(--modern-success,#10b981)]"
                : "bg-[var(--modern-warning,#f59e0b)]"
            }`}
          />
          <span className='truncate'>
            {isStepValid
              ? `${recipientForms.length} ${t("uploadDocFlow.recipients", "recipients")}`
              : t(
                  "uploadDocFlow.completeRecipientDetails",
                  "Complete recipient details"
                )}
          </span>
        </div>

        <Button
          variant='primary'
          id='hide_part_one'
          className='!h-[42px] !rounded-full !px-5 font-semibold inline-flex items-center gap-2 shrink-0'
          onClick={handleContinue}
          disabled={isContinueDisabled || isLoading}
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              {t("uploadDocFlow.Continue")}
            </span>
          ) : (
            <>
              <span>{t("uploadDocFlow.Continue")}</span>
              <Icons.ArrowRightLong size={15} className='rtl:rotate-180' />
            </>
          )}
        </Button>
      </div>

      <DeleteConfirmationModal
        show={showConfirmModal}
        onHide={handleCloseConfirmModal}
        title={t("uploadDocFlow.confirmDelete")}
        subtitle={t("uploadDocFlow.deleteSignatory")}
        warningText={t("uploadDocFlow.deleteSignatory")}
        itemTitle={t("uploadDocFlow.signatory")}
        itemName={recipientForms[deletingIndex]?.name || "No Name"}
        onConfirm={() => handleDeleteRecipient(deletingSignatoryID, deletingIndex)}
        confirmText={t("createTeam.confirm")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIcon={<Icons.DeleteAction size={23} />}
        itemIcon={<Icons.SignatureDefault />}
      />

      <Offcanvas
        show={showOffcanvas}
        onHide={() => {
          setShowOffcanvas(false);
          setSearchQuery("");
        }}
        placement={document.documentElement.dir === "rtl" ? "start" : "end"}
        className='border-l border-[var(--modern-border)] bg-[var(--modern-card)] rtl:border-l-0 rtl:border-r'
      >
        <Offcanvas.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
          <div>
            <Offcanvas.Title className='text-base font-bold text-[var(--modern-text)]'>
              {t("uploadDocFlow.SelectRecipient", "Select Recipient")}
            </Offcanvas.Title>
            <p className='mt-0.5 text-xs text-[var(--modern-muted)]'>
              {selectedIndex !== null
                ? `${t("uploadDocFlow.assigningTo", "Assigning to")} ${t(
                    "uploadDocFlow.signatory",
                    "Signatory"
                  )} ${selectedIndex + 1}`
                : t(
                    "uploadDocFlow.selectRecipientSubtitle",
                    "Choose from your team members or external contacts"
                  )}
            </p>
          </div>
        </Offcanvas.Header>

        <Offcanvas.Body className='flex flex-col gap-4 p-5'>
          {/* Search Box */}
          <div className='relative'>
            <Search
              size={16}
              className='pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-[var(--modern-muted)]'
            />
            <input
              type='text'
              placeholder={t(
                "uploadDocFlow.searchUser",
                "Search recipient by name or email..."
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-10 w-full rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] pl-9 pr-9 rtl:pl-9 rtl:pr-9 text-xs text-[var(--modern-text)] placeholder-[var(--modern-muted)] transition-colors focus:border-[var(--modern-primary)] focus:bg-[var(--modern-card)] focus:outline-none'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery("")}
                aria-label='Clear search'
                className='absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-[var(--modern-muted)] hover:text-[var(--modern-text)]'
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Segmented Pill Tabs */}
          <div
            role='tablist'
            aria-label={t("uploadDocFlow.recipientCategories", "Recipient Categories")}
            className='inline-flex w-full items-center rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] p-1'
          >
            <button
              type='button'
              role='tab'
              aria-selected={recipientTab === "team"}
              onClick={() => setRecipientTab("team")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                recipientTab === "team"
                  ? "bg-[var(--modern-card)] text-[var(--modern-primary)] shadow-xs"
                  : "text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
              }`}
            >
              <span>{t("uploadDocFlow.teamMembers", "Team Members")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  recipientTab === "team"
                    ? "bg-[color-mix(in_srgb,var(--modern-primary)_15%,transparent)] text-[var(--modern-primary)]"
                    : "bg-[var(--modern-border)] text-[var(--modern-muted)]"
                }`}
              >
                {filteredTeamMembers.length}
              </span>
            </button>

            <button
              type='button'
              role='tab'
              aria-selected={recipientTab === "adhock"}
              onClick={() => setRecipientTab("adhock")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                recipientTab === "adhock"
                  ? "bg-[var(--modern-card)] text-[var(--modern-primary)] shadow-xs"
                  : "text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
              }`}
            >
              <span>{t("uploadDocFlow.externalMembers", "External Members")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  recipientTab === "adhock"
                    ? "bg-[color-mix(in_srgb,var(--modern-primary)_15%,transparent)] text-[var(--modern-primary)]"
                    : "bg-[var(--modern-border)] text-[var(--modern-muted)]"
                }`}
              >
                {filteredAdhockUsers.length}
              </span>
            </button>
          </div>

          {/* Members List */}
          <div className='flex-1 overflow-y-auto pr-0.5'>
            {recipientTab === "team" ? (
              filteredTeamMembers.length > 0 ? (
                <ul className='m-0 list-none space-y-2 p-0'>
                  {filteredTeamMembers.map((member, idx) => (
                    <li key={`team-${idx}`}>
                      <button
                        type='button'
                        onClick={() => handleRecipientSelection(member.name, member.email)}
                        className='group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-3 text-start transition-all hover:border-[var(--modern-primary)] hover:bg-[var(--modern-raised)]'
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <UserInitialsBadge name={member.name} avatarOnly />
                          <div className='min-w-0'>
                            <span className='block truncate text-xs font-semibold text-[var(--modern-text)] group-hover:text-[var(--modern-primary)]'>
                              {member.name}
                            </span>
                            <span className='block truncate text-[11px] text-[var(--modern-muted)]'>
                              {member.email}
                            </span>
                          </div>
                        </div>

                        <span className='shrink-0 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] px-2.5 py-1 text-[11px] font-semibold text-[var(--modern-muted)] transition-colors group-hover:border-[var(--modern-primary)] group-hover:bg-[var(--modern-primary)] group-hover:text-white'>
                          {t("uploadDocFlow.select", "Select")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='flex flex-col items-center justify-center py-10 text-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[var(--modern-raised)] text-[var(--modern-muted)] mb-2.5'>
                    <Users size={22} />
                  </div>
                  <p className='text-xs font-semibold text-[var(--modern-text)]'>
                    {t("uploadDocFlow.noTeam", "No Team Members Found")}
                  </p>
                  <p className='mt-1 max-w-[240px] text-[11px] text-[var(--modern-muted)]'>
                    {searchQuery
                      ? `${t("uploadDocFlow.noMatchesFor", "No matches found for")} "${searchQuery}"`
                      : t(
                          "uploadDocFlow.noTeamMembersSaved",
                          "No team members are configured in your account."
                        )}
                  </p>
                </div>
              )
            ) : filteredAdhockUsers.length > 0 ? (
              <ul className='m-0 list-none space-y-2 p-0'>
                {filteredAdhockUsers.map((u, idx) => (
                  <li key={`adhock-${idx}`}>
                    <button
                      type='button'
                      onClick={() => handleRecipientSelection(u.name, u.email)}
                      className='group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-3 text-start transition-all hover:border-[var(--modern-primary)] hover:bg-[var(--modern-raised)]'
                    >
                      <div className='flex min-w-0 items-center gap-3'>
                        <UserInitialsBadge name={u.name} avatarOnly />
                        <div className='min-w-0'>
                          <span className='block truncate text-xs font-semibold text-[var(--modern-text)] group-hover:text-[var(--modern-primary)]'>
                            {u.name}
                          </span>
                          <span className='block truncate text-[11px] text-[var(--modern-muted)]'>
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <span className='shrink-0 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] px-2.5 py-1 text-[11px] font-semibold text-[var(--modern-muted)] transition-colors group-hover:border-[var(--modern-primary)] group-hover:bg-[var(--modern-primary)] group-hover:text-white'>
                        {t("uploadDocFlow.select", "Select")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[var(--modern-raised)] text-[var(--modern-muted)] mb-2.5'>
                  <Users size={22} />
                </div>
                <p className='text-xs font-semibold text-[var(--modern-text)]'>
                  {t("uploadDocFlow.noExternalMembers", "No External Members Found")}
                </p>
                <p className='mt-1 max-w-[240px] text-[11px] text-[var(--modern-muted)]'>
                  {searchQuery
                    ? `${t("uploadDocFlow.noMatchesFor", "No matches found for")} "${searchQuery}"`
                    : t(
                        "uploadDocFlow.noExternalMembersSaved",
                        "No external members found in previous recipient history."
                      )}
                </p>
              </div>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default AddRecipient;
