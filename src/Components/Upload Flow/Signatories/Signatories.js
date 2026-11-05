import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Dropdown, Accordion, Offcanvas, Tab, Tabs, OverlayTrigger, Tooltip } from "@/Components/UI/shadcnCompat";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Icons } from "@/assets/Icons";
import { X, Search, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import uploadFlowService from "@/services/uploadFlowService";
import userService from "@/services/userService";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import { Chips } from "@/Components/UI/EmailChips";
import PhoneInput from "react-phone-input-2";
import { UserInitialsBadge } from "@/Components/UI/dataPrimitives";

const Signatories = ({ setActiveStep, setCompletedSteps, onPreviewSync }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [signatureTypes, setSignatureTypes] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [signatoryColor, setSignatoryColor] = useState([]);
  const [verificationMethods, setVerificationMethods] = useState([]);
  const [languageTypes, setLanguageTypes] = useState([]);
  const [showSignOrder, setShowSignOrder] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newIndex, setNewIndex] = useState("");
  const [errors, setErrors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteSignatoryID, setDeleteSignatoryID] = useState(null);
  const [showDropdowns, setShowDropdowns] = useState(() => JSON.parse(localStorage.getItem("showDropdowns")) || {});
  const [showVerificationMethods, setShowVerificationMethods] = useState(() => JSON.parse(localStorage.getItem("showVerificationMethods")) || {});
  const [showAdditionalEmail, setShowAdditionalEmail] = useState(() => JSON.parse(localStorage.getItem("showAdditionalEmail")) || {});
  const { user } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isContinueDisabled, setIsContinueDisabled] = useState(false);
  const [teamMemberNames, setTeamMemberNames] = useState([]);
  const [nameToEmailMap, setNameToEmailMap] = useState({});
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [adhockNames, setAdhockNames] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("team");

  const storedRegisterSignID = localStorage.getItem("registerSignID");

  const initialFormState = {
    name: "",
    notificationType: "Email",
    additionalEmails: "",
    email: "",
    countryCode: "",
    mobile: "",
    phoneNumber: "",
    company: "",
    signatureType: "Needs To Sign",
    signatureColor: "#E84600",
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
    if (typeof onPreviewSync === "function") {
      onPreviewSync({ recipients: forms });
    }
  }, [forms, onPreviewSync]);

  useEffect(() => {
    localStorage.setItem("showDropdowns", JSON.stringify(showDropdowns));
  }, [showDropdowns]);

  useEffect(() => {
    localStorage.setItem("showVerificationMethods", JSON.stringify(showVerificationMethods));
  }, [showVerificationMethods]);

  useEffect(() => {
    localStorage.setItem("showAdditionalEmail", JSON.stringify(showAdditionalEmail));
  }, [showAdditionalEmail]);

  useEffect(() => {
    uploadFlowService
      .getLookups("signatureType")
      .then((response) => {
        if (response.data.successStatus) {
          const signatureTypeOptions = response.data.response.map((item) => item.name);
          setSignatureTypes(signatureTypeOptions);
        }
      })
      .catch((error) => handleAuthError(error));
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("NotificationType")
      .then((response) => {
        if (response.data.successStatus) {
          const notificationTypeOptions = response.data.response.map((item) => item.name);
          setNotificationTypes(notificationTypeOptions);
        }
      })
      .catch((error) => handleAuthError(error));
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("SignColor")
      .then((response) => {
        if (response.data.successStatus) {
          const formColors = response.data.response.map((color) => color.name);
          setSignatoryColor(formColors);
        }
      })
      .catch((error) => handleAuthError(error));
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("VerificationType")
      .then((response) => {
        if (response.data.successStatus) {
          const verification = response.data.response.map((method) => method.lookupID);
          setVerificationMethods(verification);
        }
      })
      .catch((error) => handleAuthError(error));
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("LanguageType")
      .then((response) => {
        if (response.data.successStatus) {
          const language = response.data.response.map((language) => language.name);
          setLanguageTypes(language);
        }
      })
      .catch((error) => handleAuthError(error));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await uploadFlowService.getRegisterSignData(storedRegisterSignID);

        if (response.data.successStatus) {
          const signatories = response.data.response.signatories;
          const serialCheck = response.data.response.isSerial;
          setShowSignOrder(serialCheck);

          if (signatories && signatories.length > 0) {
            const initializedForms = signatories.map((signatory) => {
              const { showEmail, showMobile } = determineFieldVisibility(signatory.notificationType, signatory.verificationType, signatory.email);

              // Check for additional emails in response
              const additionalEmails = signatory.additionalEmails ? signatory.additionalEmails.split(",").map((email) => email.trim()) : [];

              // Combine country code and mobile for phoneNumber field
              const phoneNumber = signatory.countryCode && signatory.mobile ? signatory.countryCode + signatory.mobile : "";

              return {
                ...signatory,
                showEmail,
                showMobile,
                additionalEmails,
                phoneNumber,
              };
            });

            setForms(initializedForms);
          } else {
            setForms([initialFormState]);
          }
        } else {
          setForms([initialFormState]);
        }
      } catch (error) {
        handleAuthError(error);
        setForms([initialFormState]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storedRegisterSignID]);

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

        setTeamMemberNames(teamMembers); // Store team members as objects
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    const fetchAdhockUsers = async () => {
      try {
        const response = await uploadFlowService.getAdhockUsers();

        const adhockUsers = response.data.response.map((user) => ({
          name: user.name.trim(),
          email: user.emailID.trim(),
        }));

        setAdhockNames(adhockUsers); // Store adhock users as objects
      } catch (error) {
        console.error("Error fetching adhock users:", error);
      }
    };

    fetchTeamMembers();
    fetchAdhockUsers();
  }, [user.AccountID]);

  const handleAuthError = (error) => {
    if ((error.response.data && error.response.data.statusCode === "2") || (error.response.data && error.response.data.statusCode === "4")) {
      localStorage.clear();
      setIsLoading(false);
      navigate("/");
      toast.info(t("uploadDocFlow.sessionExpire"));
    }
  };

  const validateForm = () => {
    let hasErrors = false;
    const emailSet = new Set();
    const newErrors = forms.map((form, index) => {
      const formErrors = {};

      // Existing validation for name
      if (!form.name) {
        formErrors.name = t("uploadDocFlow.requiredName");
        hasErrors = true;
      }

      // Enhanced email validation using existing function
      if (form.showEmail) {
        if (!form.email) {
          formErrors.email = t("uploadDocFlow.emailRequired");
          hasErrors = true;
        } else if (!validateEmail(form.email)) {
          formErrors.email = t("uploadDocFlow.validEmail");
          hasErrors = true;
        } else if (emailSet.has(form.email)) {
          formErrors.email = t("uploadDocFlow.alreadyEmailUsed");
          hasErrors = true;
        } else {
          emailSet.add(form.email);
        }
      }

      // Mobile validation using phoneNumber
      if (form.showMobile && (!form.phoneNumber || form.phoneNumber.length < 10)) {
        formErrors.mobile = t("uploadDocFlow.phoneRequired");
        hasErrors = true;
      }

      return formErrors;
    });

    setErrors(newErrors);
    return !hasErrors;
  };

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

  const handleInputChange = (index, field, value) => {
    const updatedForms = [...forms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };

    if (field === "name") {
      // Autofill the email based on the selected name
      const correspondingEmail = nameToEmailMap[value];
      updatedForms[index].email = correspondingEmail || ""; // Set the email if found, otherwise leave it empty
    }

    if (field === "notificationType" || field === "verificationType") {
      const { showEmail, showMobile } = determineFieldVisibility(updatedForms[index].notificationType, updatedForms[index].verificationType);
      updatedForms[index].showEmail = showEmail;
      updatedForms[index].showMobile = showMobile;
    }

    setForms(updatedForms);
    clearError(index, field);
  };

  const handlePhoneChange = (index, phone) => {
    const updatedForms = [...forms];
    updatedForms[index] = { ...updatedForms[index], phoneNumber: phone };

    // Extract country code and mobile number from the combined phone input
    if (phone && phone.length >= 10) {
      const countryCode = phone.substring(0, phone.length - 10);
      const mobileNumber = phone.substring(phone.length - 10);
      updatedForms[index].countryCode = countryCode;
      updatedForms[index].mobile = mobileNumber;
      clearError(index, "mobile");
    }

    setForms(updatedForms);
  };

  const handleRecipientSelection = (name, email) => {
    if (selectedIndex === null) return;

    const updatedForms = [...forms];
    updatedForms[selectedIndex] = {
      ...updatedForms[selectedIndex],
      name,
      email,
    };
    setForms(updatedForms);
    setShowOffcanvas(false); // Close the Offcanvas
  };

  const handleToggleDropdown = (index) => {
    setShowDropdowns((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const toggleVerificationMethod = (index) => {
    setShowVerificationMethods((prevState) => {
      const newState = { ...prevState };
      newState[index] = !prevState[index];
      return newState;
    });

    setShowDropdowns((prevState) => ({
      ...prevState,
      [index]: false,
    }));
  };

  const handleDeleteSignatory = async () => {
    if (deleteSignatoryID) {
      try {
        setIsLoading(true);
        const response = await uploadFlowService.deleteSignatory({
          SignatoriesID: deleteSignatoryID,
        });

        if (response.status === 200) {
          const updatedForms = [...forms];
          updatedForms.splice(deleteIndex, 1);
          setForms(updatedForms);
          setShowModal(false);
        }
      } catch (error) {
        setIsLoading(false);
        handleAuthError(error);
        toast.error(t("uploadDocFlow.ErrDeletSignatory"));
      } finally {
        setIsLoading(false);
      }
    } else {
      const updatedForms = [...forms];
      updatedForms.splice(deleteIndex, 1);
      setForms(updatedForms);
      setShowModal(false);
    }
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

  const handleShowModal = (index, signatoryID) => {
    setDeleteIndex(index);
    setDeleteSignatoryID(signatoryID);
    setShowModal(true);
  };

  const getNextAvailableColor = () => {
    const usedColors = new Set(forms.map((form) => form.signatureColor));
    for (const color of signatoryColor) {
      if (!usedColors.has(color)) {
        return color;
      }
    }
    // If all colors are used, fallback to first color or any default
    return signatoryColor[0] || "#E84600";
  };

  const handleAddRecipient = () => {
    const newColor = getNextAvailableColor();
    const newForm = {
      ...initialFormState,
      signatureColor: newColor,
    };
    setForms([...forms, newForm]);
  };

  const handleAddYourself = () => {
    const newColor = getNextAvailableColor();
    const countryCode = user.mobileNumber ? user.mobileNumber.split("-")[0] : "";
    const mobile = user.mobileNumber ? user.mobileNumber.split("-")[1] : "";
    const phoneNumber = countryCode && mobile ? countryCode + mobile : "";

    const newForm = {
      ...initialFormState,
      name: user.fullName,
      email: user.email,
      countryCode: countryCode,
      mobile: mobile,
      phoneNumber: phoneNumber,
      company: "",
      signatureColor: newColor,
    };
    setForms([...forms, newForm]);
  };

  const workflow = async (name, number, activeStep, completedSteps) => {
    const StepData = {
      SignWorkFlowActivityName: name,
      SignWorkFlowActivityRef: number,
      SignWorkFlowActivityClass: "RED",
      RegisterSignID: storedRegisterSignID,
      IsMobile: false,
    };

    try {
      setIsLoading(true);
      const response = await uploadFlowService.createWorkflowActivity(StepData);

      setIsLoading(false);

      if (response.data.successStatus) {
        setActiveStep(activeStep);
        setCompletedSteps(completedSteps);
      }
    } catch (error) {
      setIsLoading(false);
      handleAuthError(error);
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(forms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setForms(items);
  };

  const repositionForm = (index, newIndex) => {
    if (newIndex && !isNaN(newIndex) && newIndex > 0 && newIndex <= forms.length) {
      const newPosition = parseInt(newIndex) - 1;
      const items = Array.from(forms);
      const [movedItem] = items.splice(index, 1);
      items.splice(newPosition, 0, movedItem);
      setForms(items);
    }
    setEditingIndex(null);
    setNewIndex("");
  };

  const handleIndexChange = (e, index) => {
    e.preventDefault();
    repositionForm(index, newIndex);
  };

  const handleBlur = (index) => {
    repositionForm(index, newIndex);
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
      RegisterSignID: storedRegisterSignID,
      IsSerial: showSignOrder,
      Signatories: forms.map((form, index) => {
        const signatoryData = {
          Name: form.name,
          NotificationType: form.notificationType,
          AdditionalEmails: (form.additionalEmails || []).join(",") || "None",
          Email: form.showEmail ? form.email : "",
          CountryCode: form.showMobile ? form.countryCode : "",
          Mobile: form.showMobile ? form.mobile : "",
          Company: form.company,
          SignOrder: index + 1,
          SignatureType: form.signatureType,
          SignatureColor: form.signatureColor,
          SignPage: "FirstPage",
          SignPosition: "TopLeft",
          IsMobile: form.showMobile,
          ExpiryDate: form.expiryDate || "2026-12-16",
          IsExpiring: form.isExpiring || false,
          IsPasswordProtected: form.verificationType === "None" ? false : true,
          LanguageType: form.languageType || "English",
          VerificationType: form.verificationType || "None",
          SignatoriesID: form.signatoriesID,
        };
        return signatoryData;
      }),
    };

    try {
      await uploadFlowService.createBulkSignatory(data);

      await workflow("Place Signatories", "3", 3, [1, 2]);
      setIsContinueDisabled(false); // Re-enable the button after the process is complete
    } catch (error) {
      setIsContinueDisabled(false); // Re-enable the button in case of error
      toast.error("There was an error making the request! Please try later");
    }
  };

  const handleBack = async () => {
    workflow("Upload Docs", "1", 1, [0]);
    setActiveStep(1);
    setCompletedSteps([0]);
  };

  const toggleChipsVisibility = (index) => {
    setForms((prevForms) => {
      const newForms = [...prevForms];
      newForms[index] = {
        ...newForms[index],
        showChips: !newForms[index].showChips, // Toggle showChips state
      };
      return newForms;
    });

    // Update showAdditionalEmail state
    setShowAdditionalEmail((prevState) => {
      const newState = { ...prevState, [index]: !prevState[index] };
      localStorage.setItem("showAdditionalEmail", JSON.stringify(newState));
      return newState;
    });

    setShowDropdowns((prevState) => ({
      ...prevState,
      [index]: false, // Hide the dropdown when toggling visibility
    }));
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleChipsChange = (index, emails) => {
    if (!emails) emails = [];

    // Filter out invalid emails
    const validEmails = emails.filter((email) => validateEmail(email));
    const invalidEmails = emails.filter((email) => !validateEmail(email));

    if (invalidEmails.length > 0) {
      toast.error(`${invalidEmails.join(", ")} ${t("uploadDocFlow.isnotValid")}`);
    }
    const uniqueValidEmails = validEmails.filter((email, index, self) => self.indexOf(email) === index);

    const duplicateEmails = validEmails.filter((email) => validEmails.indexOf(email) !== validEmails.lastIndexOf(email));
    if (duplicateEmails.length > 0) {
      toast.info(t("uploadDocFlow.hasAdded"));
    }
    setForms((prevForms) => {
      const updatedForms = [...prevForms];
      updatedForms[index].additionalEmails = uniqueValidEmails;
      return updatedForms;
    });
  };

  // Filter the team and adhock user lists based on the search query
  const filteredTeamMembers = teamMemberNames.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredAdhockUsers = adhockNames.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className='flex flex-col h-full min-h-[480px] bg-[var(--modern-card,#ffffff)]'>
      {/* Studio Panel Header */}
      <div className='px-5 pt-5 pb-2 shrink-0'>
        <small className='block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--modern-primary,#4d8dff)]'>
          {t("uploadDocFlow.step", "STEP")} 2 {t("uploadDocFlow.of", "OF")} 4
        </small>
        <h1 className='mt-0.5 text-[22px] font-bold tracking-tight text-[var(--modern-text)]'>
          {t("Stepper.AddSigners", "Add Signers")}
        </h1>
        <p className='mt-1 text-[13px] text-[var(--modern-muted)]'>
          {t("uploadDocFlow.whoNeedsToSign", "Who needs to sign this document?")}
        </p>
      </div>

      {/* Studio Scrollable Body */}
      <div className='signatory-form-container min-h-0 flex-1 overflow-y-auto px-4 sm:px-5 pt-3 pb-5 space-y-4'>
        {/* Set Signing Order Switch */}
        <div className='mb-3 flex items-center justify-between gap-3 border-b border-[var(--modern-border)] pb-3'>
          <div className='min-w-0'>
            <span className='block text-sm font-semibold text-[var(--modern-text)]'>
              {t("uploadDocFlow.setSignOrder")}
            </span>
            <small className='block text-xs text-[var(--modern-muted)]'>
              {t("uploadDocFlow.OrderToltip")}
            </small>
          </div>
          <button
            type='button'
            role='switch'
            aria-checked={showSignOrder}
            aria-label={t("uploadDocFlow.setSignOrder")}
            onClick={() => setShowSignOrder((prev) => !prev)}
            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors cursor-pointer ${
              showSignOrder
                ? "border-[var(--modern-primary,#4d8dff)] bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_22%,transparent)]"
                : "border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f1f5f9)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                showSignOrder
                  ? "left-[22px] rtl:left-auto rtl:right-[22px] bg-[var(--modern-primary,#4d8dff)]"
                  : "left-0.5 rtl:left-auto rtl:right-0.5 bg-[var(--modern-muted,#64748b)]"
              }`}
            />
          </button>
        </div>

        <Form onSubmit={(e) => e.preventDefault()}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId='forms'>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className='space-y-3.5'>
                  {forms.map((form, index) => (
                    <Draggable key={index} draggableId={index.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className='relative rounded-[18px] border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] p-3.5 transition-colors'
                          style={{
                            borderInlineStartWidth: "4px",
                            borderInlineStartColor: form.signatureColor || "#4d8dff",
                            borderInlineStartStyle: "solid",
                            ...provided.draggableProps.style,
                          }}
                        >

                          {/* Card Top: Order / Drag Handle / Title / Primary Actions */}
                          <div className='flex items-center justify-between gap-2 mb-2.5 min-w-0'>
                            <div className='flex items-center gap-2 min-w-0'>
                              {showSignOrder && (
                                <div
                                  {...provided.dragHandleProps}
                                  className='cursor-grab text-[var(--modern-muted)] hover:text-[var(--modern-text)] shrink-0'
                                  title={t("uploadDocFlow.dragToReorder", "Drag to reorder")}
                                >
                                  <Icons.DragHandle size={16} />
                                </div>
                              )}
                              {showSignOrder && (
                                <div
                                  className='w-6 h-6 rounded-full flex justify-center items-center font-mono font-semibold text-xs text-white cursor-pointer shrink-0'
                                  style={{ backgroundColor: form.signatureColor || "#4d8dff" }}
                                  onClick={() => setEditingIndex(index)}
                                  title={t("uploadDocFlow.editIndex", "Click to edit order")}
                                >
                                  {editingIndex === index ? (
                                    <input
                                      type='text'
                                      value={newIndex}
                                      onChange={(e) => setNewIndex(e.target.value)}
                                      onBlur={() => handleBlur(index)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleIndexChange(e, index);
                                        }
                                      }}
                                      autoFocus
                                      className='w-full text-center bg-transparent text-white text-xs outline-none'
                                    />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                              )}
                              <h3 className='m-0 font-semibold text-sm text-[var(--modern-text)] truncate'>
                                {t("uploadDocFlow.signatory")} {index + 1}
                              </h3>
                            </div>

                            {/* Actions Group: Existing Users + Delete + Three Dots */}
                            <div className='flex items-center gap-1.5 shrink-0'>
                              <button
                                type='button'
                                className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-raised,#f8fafc)] text-[var(--modern-primary,#4d8dff)] transition-colors hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_10%,transparent)] cursor-pointer shrink-0'
                                onClick={() => {
                                  setSelectedIndex(index);
                                  setShowOffcanvas(true);
                                }}
                                title={t("uploadDocFlow.existingUser", "Existing Users")}
                                aria-label={t("uploadDocFlow.existingUser", "Existing Users")}
                              >
                                <Icons.UserSearch size={15} />
                              </button>

                              {/* Delete Signatory Button - clean icon button matching template section */}
                              <button
                                type='button'
                                className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-transparent text-[var(--modern-muted,#64748b)] transition-colors hover:border-[var(--modern-danger,#ef4444)] hover:text-[var(--modern-danger,#ef4444)] cursor-pointer shrink-0'
                                onClick={() => handleShowModal(index, form.signatoriesID)}
                                title={t("uploadDocFlow.delete", "Delete")}
                                aria-label={t("uploadDocFlow.delete", "Delete")}
                              >
                                <Icons.DeleteAction size={15} />
                              </button>

                              {/* Three Dots Menu with Verification Method, Notification Type, Additional Email, and Delete */}
                              <Dropdown align='end'>
                                <Dropdown.Toggle
                                  variant='ghost'
                                  id={`moreOptions${index}`}
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
                                  <Dropdown.Item
                                    onClick={() => toggleVerificationMethod(index)}
                                    className='flex items-center gap-2.5 text-sm py-2 px-3.5 hover:bg-[var(--modern-raised)] cursor-pointer text-[var(--modern-text)]'
                                  >
                                    <Icons.VerificationMethod size={16} className='text-[var(--modern-primary)] shrink-0' />
                                    <span className='flex-1'>{t("uploadDocFlow.VerificationMethod", "Verification Method")}</span>
                                    {showVerificationMethods[index] && <span className='text-xs text-[var(--modern-primary)] font-bold'>✓</span>}
                                  </Dropdown.Item>

                                  <Dropdown.Item
                                    onClick={() => toggleChipsVisibility(index)}
                                    className='flex items-center gap-2.5 text-sm py-2 px-3.5 hover:bg-[var(--modern-raised)] cursor-pointer text-[var(--modern-text)]'
                                  >
                                    <Icons.customEmail size={16} className='text-[var(--modern-primary)] shrink-0' />
                                    <span className='flex-1'>{t("uploadDocFlow.additionalEmail", "Additional Email")}</span>
                                    {showAdditionalEmail[index] && <span className='text-xs text-[var(--modern-primary)] font-bold'>✓</span>}
                                  </Dropdown.Item>

                                  <div className='my-1.5 border-t border-[var(--modern-border)]' />
                                  <div className='px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--modern-muted)]'>
                                    {t("uploadDocFlow.notificationType", "Notification Type")}
                                  </div>
                                  {notificationTypes.map((notification, notIndex) => (
                                    <Dropdown.Item
                                      key={notIndex}
                                      onClick={() => handleInputChange(index, "notificationType", notification)}
                                      className={`flex items-center justify-between text-sm py-1.5 px-3.5 hover:bg-[var(--modern-raised)] cursor-pointer ${
                                        form.notificationType === notification ? "font-semibold text-[var(--modern-primary)] bg-[var(--modern-raised)]/60" : "text-[var(--modern-text)]"
                                      }`}
                                    >
                                      <span>{notification}</span>
                                      {form.notificationType === notification && <span className='text-xs'>✓</span>}
                                    </Dropdown.Item>
                                  ))}

                                  <div className='my-1.5 border-t border-[var(--modern-border)]' />
                                  <Dropdown.Item
                                    onClick={() => handleShowModal(index, form.signatoriesID)}
                                    className='flex items-center gap-2.5 text-sm py-2 px-3.5 text-[var(--modern-danger,#ef4444)] hover:bg-[var(--modern-danger,#ef4444)]/10 cursor-pointer font-medium'
                                  >
                                    <Icons.DeleteAction size={15} />
                                    <span>{t("uploadDocFlow.delete", "Delete Signatory")}</span>
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </div>

                          {/* Row 2: Secondary Pills - Needs To Sign & Language Type + Notification Indicator */}
                          <div className='flex items-center gap-1.5 flex-wrap mb-3'>
                            <Dropdown onSelect={(e) => handleInputChange(index, "signatureType", e)}>
                              <Dropdown.Toggle
                                variant='ghost'
                                id={`signatureType${index}`}
                                className='!h-7 !px-2.5 !text-xs !rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] inline-flex items-center gap-1.5 cursor-pointer'
                              >
                                {form.signatureType === "Needs To Sign" && <Icons.SignatureType size={13} />}
                                {form.signatureType === "View Only" && <Icons.View size={13} />}
                                <span className='truncate max-w-[110px] font-medium'>{form.signatureType || "Needs To Sign"}</span>
                              </Dropdown.Toggle>
                              <Dropdown.Menu align='start' className='!bg-[var(--modern-card)] !border-[var(--modern-border)] text-sm shadow-lg'>
                                {signatureTypes.map((signature, sigIndex) => (
                                  <Dropdown.Item key={sigIndex} eventKey={signature} className='flex items-center gap-2 text-sm py-1.5 px-3 hover:bg-[var(--modern-raised)]'>
                                    {signature === "Needs To Sign" && <Icons.SignatureType size={14} />}
                                    {signature === "View Only" && <Icons.View size={14} />}
                                    <span>{signature}</span>
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>

                            <Dropdown onSelect={(e) => handleInputChange(index, "languageType", e)}>
                              <Dropdown.Toggle
                                variant='ghost'
                                id={`LanguageType${index}`}
                                className='!h-7 !px-2.5 !text-xs !rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] inline-flex items-center gap-1.5 cursor-pointer'
                              >
                                <Icons.Language size={13} />
                                <span className='font-medium'>{form.languageType || "English"}</span>
                              </Dropdown.Toggle>
                              <Dropdown.Menu align='start' className='!bg-[var(--modern-card)] !border-[var(--modern-border)] text-sm shadow-lg'>
                                {languageTypes.map((language, lIndex) => (
                                  <Dropdown.Item key={lIndex} eventKey={language} className='text-sm py-1.5 px-3 hover:bg-[var(--modern-raised)]'>
                                    {language}
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

                          {/* Inputs: Name & Email / Mobile */}
                          <div className='space-y-3'>
                            <div>
                              <label className='block text-xs font-medium text-[var(--modern-muted)] mb-1.5'>
                                {t("uploadDocFlow.name")} <span className='text-[var(--modern-danger,#ef4444)]'>*</span>
                              </label>
                              <Form.Control
                                type='text'
                                value={form.name}
                                onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                placeholder={t("uploadDocFlow.enterName")}
                                className='!h-[40px] !text-sm !rounded-xl text-[var(--modern-text)]'
                              />
                              {errors[index]?.name && <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>{errors[index].name}</div>}
                            </div>

                            {form.showEmail && (
                              <div>
                                <label className='block text-xs font-medium text-[var(--modern-muted)] mb-1.5'>
                                  {t("uploadDocFlow.emailAddress")} <span className='text-[var(--modern-danger,#ef4444)]'>*</span>
                                </label>
                                <Form.Control
                                  type='email'
                                  value={form.email || ""}
                                  onChange={(e) => handleInputChange(index, "email", e.target.value)}
                                  placeholder={t("uploadDocFlow.enterEmail")}
                                  className='!h-[40px] !text-sm !rounded-xl text-[var(--modern-text)]'
                                />
                                {errors[index]?.email && <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>{errors[index].email}</div>}
                              </div>
                            )}

                            {form.showMobile && (
                              <div>
                                <label className='block text-xs font-medium text-[var(--modern-muted)] mb-1.5'>
                                  {t("logScreens.mobileNumber")} <span className='text-[var(--modern-danger,#ef4444)]'>*</span>
                                </label>
                                <PhoneInput
                                  excludeCountries={["il"]}
                                  country={"sa"}
                                  value={form.phoneNumber || ""}
                                  onChange={(phone) => handlePhoneChange(index, phone)}
                                  inputStyle={{
                                    width: "100%",
                                    height: "40px",
                                    fontSize: "14px",
                                    border: "1px solid var(--modern-border)",
                                    borderRadius: "0.75rem",
                                    backgroundColor: "var(--modern-card)",
                                    color: "var(--modern-text)",
                                  }}
                                  containerStyle={{ width: "100%" }}
                                  buttonStyle={{
                                    border: "1px solid var(--modern-border)",
                                    borderRight: "none",
                                    borderRadius: "0.75rem 0 0 0.75rem",
                                    backgroundColor: "var(--modern-raised)",
                                  }}
                                />
                                {form.phoneNumber && form.phoneNumber.length < 10 && <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>{t("logScreens.ValidmobileNumber")}</div>}
                                {errors[index]?.mobile && <div className='mt-1 text-xs text-[var(--modern-danger,#ef4444)]'>{errors[index].mobile}</div>}
                              </div>
                            )}

                            {showAdditionalEmail[index] && (
                              <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] space-y-2'>
                                <div className='flex items-center justify-between text-xs font-semibold text-[var(--modern-text)]'>
                                  <div className='flex items-center gap-1.5'>
                                    <Icons.customEmail size={15} />
                                    <span>{t("uploadDocFlow.additionalEmail")}</span>
                                  </div>
                                  <button
                                    type='button'
                                    onClick={() => toggleChipsVisibility(index)}
                                    className='inline-flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-muted)] hover:bg-[var(--modern-danger,#ef4444)]/10 hover:border-[var(--modern-danger,#ef4444)]/30 hover:text-[var(--modern-danger,#ef4444)] transition-colors cursor-pointer shrink-0'
                                    title={t("uploadDocFlow.cancel", "Close")}
                                    aria-label={t("uploadDocFlow.cancel", "Close")}
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                                <Chips
                                  className='w-full !text-sm !rounded-xl'
                                  value={form.additionalEmails || []}
                                  onChange={(e) => handleChipsChange(index, e.value)}
                                  placeholder={t("uploadDocFlow.enterAdditionalEmail")}
                                />
                              </div>
                            )}

                            {showVerificationMethods[index] && (
                              <div className='p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] space-y-2'>
                                <div className='flex items-center justify-between text-xs font-semibold text-[var(--modern-text)]'>
                                  <div className='flex items-center gap-1.5'>
                                    <Icons.VerificationMethod size={15} />
                                    <span>{t("uploadDocFlow.VerificationMethod")}</span>
                                  </div>
                                  <button
                                    type='button'
                                    onClick={() => toggleVerificationMethod(index)}
                                    className='inline-flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-muted)] hover:bg-[var(--modern-danger,#ef4444)]/10 hover:border-[var(--modern-danger,#ef4444)]/30 hover:text-[var(--modern-danger,#ef4444)] transition-colors cursor-pointer shrink-0'
                                    title={t("uploadDocFlow.cancel", "Close")}
                                    aria-label={t("uploadDocFlow.cancel", "Close")}
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                                <Dropdown onSelect={(e) => handleInputChange(index, "verificationType", e)}>
                                  <Dropdown.Toggle
                                    variant='ghost'
                                    id={`verificationType${index}`}
                                    className='w-full !h-9 !text-sm !rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] flex items-center justify-between cursor-pointer'
                                  >
                                    <span>{form.verificationType || "None"}</span>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu className='!bg-[var(--modern-card)] !border-[var(--modern-border)] text-sm shadow-lg'>
                                    {verificationMethods.map((method, methodIndex) => (
                                      <Dropdown.Item key={methodIndex} eventKey={method} className='text-sm py-1.5 px-3 hover:bg-[var(--modern-raised)]'>
                                        {method}
                                      </Dropdown.Item>
                                    ))}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Form>

        {/* Add Recipient / Add Yourself Ghost Buttons */}
        <div className='mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
          <button
            type='button'
            onClick={handleAddRecipient}
            className='flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[var(--modern-border-strong,#cbd5e1)] bg-transparent text-xs font-semibold text-[var(--modern-primary,#4d8dff)] transition-colors hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[var(--modern-raised,#f8fafc)]'
          >
            <Icons.AddCircle size={16} />
            <span>{t("uploadDocFlow.addRecipient")}</span>
          </button>

          <button
            type='button'
            onClick={handleAddYourself}
            className='flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[var(--modern-border-strong,#cbd5e1)] bg-transparent text-xs font-semibold text-[var(--modern-primary,#4d8dff)] transition-colors hover:border-[var(--modern-primary,#4d8dff)] hover:bg-[var(--modern-raised,#f8fafc)]'
          >
            <Icons.AddCircle size={16} />
            <span>{t("uploadDocFlow.addYourself")}</span>
          </button>
        </div>
      </div>

      {/* Studio Sticky Footer */}
      <div className='mt-auto sticky bottom-0 z-20 flex items-center justify-between gap-2.5 border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] px-5 py-3.5 shrink-0'>
        <Button
          variant='outline'
          className='!h-[42px] !rounded-full !px-4 font-semibold shrink-0 hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] hover:bg-[color-mix(in_srgb,var(--modern-primary)_8%,var(--modern-card))] transition-all'
          id='hide_part_one'
          onClick={handleBack}
          disabled={isLoading}
        >
          {t("uploadDocFlow.back")}
        </Button>

        <div className='flex min-w-0 flex-1 items-center gap-2 text-xs text-[var(--modern-muted,#64748b)]'>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              !isContinueDisabled
                ? "bg-[var(--modern-success,#10b981)]"
                : "bg-[var(--modern-warning,#f59e0b)]"
            }`}
          />
          <span className='truncate'>
            {!isContinueDisabled
              ? `${forms.length} ${t("uploadDocFlow.recipients", "recipients")}`
              : t(
                  "uploadDocFlow.completeRecipientDetails",
                  "Complete recipient details"
                )}
          </span>
        </div>

        <Button
          variant='primary'
          className='!h-[42px] !rounded-full !px-6 font-semibold shrink-0'
          id='hide_part_one'
          onClick={handleContinue}
          disabled={isContinueDisabled || isLoading}
        >
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <span className='inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />
              <span>{t("uploadDocFlow.Continue")}</span>
            </span>
          ) : (
            <span>{t("uploadDocFlow.Continue")}</span>
          )}
        </Button>
      </div>

      <DeleteConfirmationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={t("uploadDocFlow.confirmDelete")}
        subtitle={t("uploadDocFlow.deleteSignatory")}
        warningText={t("uploadDocFlow.deleteSignatory")}
        itemTitle={t("uploadDocFlow.signatory")}
        itemName={forms[deleteIndex]?.name || "No Name"}
        onConfirm={handleDeleteSignatory}
        confirmText={t("createTeam.confirm")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIcon={<Icons.DeleteAction size={25} />}
        itemIcon={<Icons.ProfileSignatory size={25} />}
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
              aria-selected={activeTab === "team"}
              onClick={() => setActiveTab("team")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                activeTab === "team"
                  ? "bg-[var(--modern-card)] text-[var(--modern-primary)] shadow-xs"
                  : "text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
              }`}
            >
              <span>{t("uploadDocFlow.teamMembers", "Team Members")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeTab === "team"
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
              aria-selected={activeTab === "external"}
              onClick={() => setActiveTab("external")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                activeTab === "external"
                  ? "bg-[var(--modern-card)] text-[var(--modern-primary)] shadow-xs"
                  : "text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
              }`}
            >
              <span>{t("uploadDocFlow.externalUsers", "External Members")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeTab === "external"
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
            {activeTab === "team" ? (
              filteredTeamMembers.length > 0 ? (
                <ul className='m-0 list-none space-y-2 p-0'>
                  {filteredTeamMembers.map((member, idx) => (
                    <li key={`team-${idx}`}>
                      <button
                        type='button'
                        onClick={() => handleRecipientSelection(member.name, member.email)}
                        className='group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-3 text-start transition-all hover:border-[var(--modern-primary)] hover:bg-[var(--modern-raised)] cursor-pointer'
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <UserInitialsBadge name={member.name} avatarOnly />
                          <div className='min-w-0'>
                            <span className='block truncate text-xs font-semibold text-[var(--modern-text)] group-hover:text-[var(--modern-primary)]'>
                              {member.name}
                            </span>
                            <span className='block truncate text-[11px] text-[var(--modern-muted)] font-mono'>
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
                      className='group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-3 text-start transition-all hover:border-[var(--modern-primary)] hover:bg-[var(--modern-raised)] cursor-pointer'
                    >
                      <div className='flex min-w-0 items-center gap-3'>
                        <UserInitialsBadge name={u.name} avatarOnly />
                        <div className='min-w-0'>
                          <span className='block truncate text-xs font-semibold text-[var(--modern-text)] group-hover:text-[var(--modern-primary)]'>
                            {u.name}
                          </span>
                          <span className='block truncate text-[11px] text-[var(--modern-muted)] font-mono'>
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

export default Signatories;
