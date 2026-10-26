import { Form, Button, Row, Col, Dropdown, Accordion, Offcanvas, Tab, Tabs, OverlayTrigger, Tooltip } from "@/Components/UI/shadcnCompat";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import uploadFlowService from "@/services/uploadFlowService";
import userService from "@/services/userService";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import { Chips } from "@/Components/UI/EmailChips";
import PhoneInput from "react-phone-input-2";

const Signatories = ({ setActiveStep, setCompletedSteps }) => {
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
    <div className='signatories-forms'>
      <div className='d-flex align-items-center justify-content-start gap-2 mb-3'>
        <input type='checkbox' className='form-check-input' checked={showSignOrder} onChange={(e) => setShowSignOrder(e.target.checked)} />
        <span> {t("uploadDocFlow.setSignOrder")}</span>
        <OverlayTrigger placement='top' overlay={<Tooltip id='tooltip'>{t("uploadDocFlow.OrderToltip")}</Tooltip>}>
          <span>
            <Icons.InfoOutline size={22} style={{ color: "#a69d9d" }} />
          </span>
        </OverlayTrigger>
      </div>

      <div className='signatory-form-container'>
        <Form>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId='forms'>
              {(provided) => (
                <Form {...provided.droppableProps} ref={provided.innerRef}>
                  {forms.map((form, index) => (
                    <Draggable key={index} draggableId={index.toString()} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}>
                          <Row className='d-flex justify-content-start align-items-start'>
                            {showSignOrder && (
                              <Col md={1} className='pe-0'>
                                <div className='w-12 h-10 rounded flex justify-center items-center bg-[var(--modern-card,#fff)] text-[var(--modern-text,#0f172a)] font-semibold text-sm cursor-pointer' style={{ border: `1px solid ${form.signatureColor}` }} onClick={() => setEditingIndex(index)}>
                                  {editingIndex === index ? (
                                    <Form.Control
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
                                      style={{ border: "none" }}
                                    />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                              </Col>
                            )}
                            <Col md={11}>
                              <div className='p-5 rounded-xl border bg-[var(--modern-card,#fff)] text-[var(--modern-text,#0f172a)] mt-3' style={{ border: `1px solid ${form.signatureColor}` }}>
                                <Row>
                                  <Col md={4} className='d-flex gap-3 align-items-center signatory-form-col'>
                                    {showSignOrder && <Icons.DragHandle style={{ cursor: "grab" }} {...provided.dragHandleProps} />}
                                    <span style={{ fontWeight: "500" }}>
                                      {t("uploadDocFlow.signatory")} {index + 1}
                                    </span>
                                  </Col>
                                  <Col md={2} className='signatory-form-col'></Col>
                                  <Col md={6} className='signatory-form-col action-buttons d-flex justify-content-end align-items-center flex-wrap gap-1'>
                                    <Button
                                      variant='none'
                                      className='flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] text-[var(--modern-text,#0f172a)] hover:bg-[var(--modern-raised,#f1f5f9)] transition-colors'
                                      onClick={() => {
                                        setSelectedIndex(index); // Store the index of the selected form
                                        setShowOffcanvas(true); // Open the Offcanvas
                                      }}
                                    >
                                      <Icons.UserSearch size={16} />
                                      {t("uploadDocFlow.existingUser")}
                                    </Button>
                                    <div>
                                      <Form.Group controlId={`formSignatureMethod${index}`}>
                                        <Dropdown onSelect={(e) => handleInputChange(index, "signatureType", e)}>
                                          <Dropdown.Toggle variant='' id={`signatureType${index}`} className='d-flex align-items-center gap-2'>
                                            {form.signatureType === "Needs To Sign" && <Icons.SignatureType />}
                                            {form.signatureType === "View Only" && <Icons.View />}
                                            {form.signatureType}
                                          </Dropdown.Toggle>
                                          <Dropdown.Menu style={{ left: "auto", right: 0, minWidth: "unset", padding: "0px" }}>
                                            {signatureTypes.map((signature, sigIndex) => (
                                              <Dropdown.Item key={sigIndex} eventKey={signature} className='d-flex align-items-center gap-2'>
                                                {signature === "Needs To Sign" && <Icons.SignatureType />}
                                                {signature === "View Only" && <Icons.View />}
                                                {signature}
                                              </Dropdown.Item>
                                            ))}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      </Form.Group>
                                    </div>
                                    <div>
                                      <Form.Group controlId='formNotificationMethod'>
                                        <Dropdown onSelect={(e) => handleInputChange(index, "languageType", e)}>
                                          <Dropdown.Toggle variant='' id='LanguageType' className='d-flex align-items-center gap-2'>
                                            <Icons.Language />
                                            {form.languageType || "English"}
                                          </Dropdown.Toggle>
                                          <Dropdown.Menu style={{ left: "auto", right: 0, minWidth: "unset", padding: "0px" }}>
                                            {languageTypes.map((language, index) => (
                                              <Dropdown.Item key={index} eventKey={language}>
                                                {language}
                                              </Dropdown.Item>
                                            ))}
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      </Form.Group>
                                    </div>
                                    <Button variant='none' className='p-0' onClick={() => handleShowModal(index, form.signatoriesID)}>
                                      <Icons.DeleteSignatory />
                                    </Button>

                                    <Button variant='none' style={{ border: "1px solid #aaa9a9ff", borderRadius: "6px", padding: "1px" }} onClick={() => handleToggleDropdown(index)}>
                                      <Icons.OtherDoc size={20} color='#b5b3b3ff' />
                                      {showDropdowns[index] && (
                                        <Dropdown show={showDropdowns[index]} onToggle={() => handleToggleDropdown(index)}>
                                          <Dropdown.Menu style={{ left: "auto", right: 0, minWidth: "unset", padding: "0px" }}>
                                            <Dropdown.Item onClick={() => toggleVerificationMethod(index)} className='d-flex align-items-center gap-2'>
                                              <Icons.VerificationMethod size={20} />
                                              {t("uploadDocFlow.VerificationMethod")}
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => toggleChipsVisibility(index)} className='d-flex align-items-center gap-2'>
                                              <Icons.customEmail size={20} />
                                              {t("uploadDocFlow.additionalEmail")}
                                            </Dropdown.Item>
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      )}
                                    </Button>
                                  </Col>
                                </Row>
                                <Row className='mt-3'>
                                  <Col md={5}>
                                    <Form.Group controlId={`formSignatoryName${index}`}>
                                      <Form.Label>
                                        {t("uploadDocFlow.name")} <span className='required'>*</span>
                                      </Form.Label>
                                      <Form.Control type='text' value={form.name} onChange={(e) => handleInputChange(index, "name", e.target.value)} placeholder={t("uploadDocFlow.enterName")} />

                                      {errors[index]?.name && <div className='error-message'>{errors[index].name}</div>}
                                    </Form.Group>
                                  </Col>
                                  <Col md={2}>
                                    <Form.Group controlId={`formNotificationMethod${index}`}>
                                      <Form.Label>{t("uploadDocFlow.notificationType")}</Form.Label>
                                      <Dropdown onSelect={(e) => handleInputChange(index, "notificationType", e)}>
                                        <Dropdown.Toggle variant='' id={`notificationType${index}`}>
                                          {form.notificationType}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                          {notificationTypes.map((notification, notIndex) => (
                                            <Dropdown.Item key={notIndex} eventKey={notification}>
                                              {notification}
                                            </Dropdown.Item>
                                          ))}
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </Form.Group>
                                  </Col>
                                  {form.showEmail && (
                                    <Col md={5}>
                                      <Form.Group controlId={`formEmailAddress${index}`}>
                                        <Form.Label>
                                          {t("uploadDocFlow.emailAddress")} <span className='required'>*</span>
                                        </Form.Label>
                                        <Form.Control
                                          type='email'
                                          value={form.email || ""}
                                          onChange={(e) => handleInputChange(index, "email", e.target.value)}
                                          placeholder={t("uploadDocFlow.enterEmail")}
                                        />
                                        {errors[index]?.email && <div className='error-message'>{errors[index].email}</div>}
                                      </Form.Group>
                                    </Col>
                                  )}

                                  {form.showMobile && (
                                    <Col md={5}>
                                      <Form.Group controlId={`formPhone${index}`}>
                                        <Form.Label>
                                          {t("logScreens.mobileNumber")}
                                          <span className='required'>*</span>
                                        </Form.Label>
                                        <PhoneInput
                                          excludeCountries={["il"]}
                                          country={"sa"}
                                          value={form.phoneNumber || ""}
                                          onChange={(phone) => handlePhoneChange(index, phone)}
                                          inputStyle={{
                                            width: "100%",
                                            height: "38px",
                                            fontSize: "14px",
                                            border: "1px solid #ced4da",
                                            borderRadius: "0.375rem",
                                          }}
                                          containerStyle={{
                                            width: "100%",
                                          }}
                                          buttonStyle={{
                                            border: "1px solid #ced4da",
                                            borderRight: "none",
                                            borderRadius: "0.375rem 0 0 0.375rem",
                                          }}
                                        />
                                        {form.phoneNumber && form.phoneNumber.length < 10 && <div className='error-message'>{t("logScreens.ValidmobileNumber")}</div>}
                                        {errors[index]?.mobile && <div className='error-message'>{errors[index].mobile}</div>}
                                      </Form.Group>
                                    </Col>
                                  )}

                                  {showAdditionalEmail[index] && (
                                    <Accordion defaultActiveKey='0' className='custom-dropdown'>
                                      <Accordion.Item eventKey='0'>
                                        <hr className='mb-1' />
                                        <Accordion.Header className='custom-dropdown-header'>
                                          <Icons.customEmail />
                                          <Form.Label className='mb-0 mx-2'>{t("uploadDocFlow.additionalEmail")}</Form.Label>
                                        </Accordion.Header>
                                        <hr className='mt-0 mb-2' />
                                        <Accordion.Body className='custom-dropdown-body'>
                                          <Form.Group controlId={`formAdditionalEmails${index}`}>
                                            <Chips
                                              className='form-control'
                                              value={form.additionalEmails || []}
                                              onChange={(e) => handleChipsChange(index, e.value)}
                                              placeholder={t("uploadDocFlow.enterAdditionalEmail")}
                                            />
                                          </Form.Group>
                                        </Accordion.Body>
                                      </Accordion.Item>
                                    </Accordion>
                                  )}

                                  {showVerificationMethods[index] && (
                                    <Accordion defaultActiveKey='0' className='custom-dropdown'>
                                      <Accordion.Item eventKey='0'>
                                        <hr className='mb-1' />
                                        <Accordion.Header className='custom-dropdown-header '>
                                          <Icons.VerificationMethod />
                                          <Form.Label className='mb-0 mx-2'> {t("uploadDocFlow.VerificationMethod")}</Form.Label>
                                        </Accordion.Header>
                                        <hr className='mt-0 mb-2' />
                                        <Accordion.Body className='custom-dropdown-body'>
                                          <Col md={2}>
                                            <div className='verification-method'>
                                              <Form.Group controlId={`formVerificationMethod${index}`}>
                                                <Dropdown onSelect={(e) => handleInputChange(index, "verificationType", e)} style={{ zIndex: "5" }}>
                                                  <Dropdown.Toggle variant='' id={`verificationType${index}`}>
                                                    {form.verificationType || "None"}
                                                  </Dropdown.Toggle>
                                                  <Dropdown.Menu>
                                                    {verificationMethods.map((method, methodIndex) => (
                                                      <Dropdown.Item key={methodIndex} eventKey={method}>
                                                        {method}
                                                      </Dropdown.Item>
                                                    ))}
                                                  </Dropdown.Menu>
                                                </Dropdown>
                                              </Form.Group>
                                            </div>
                                          </Col>
                                        </Accordion.Body>
                                      </Accordion.Item>
                                    </Accordion>
                                  )}
                                </Row>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Form>
              )}
            </Droppable>
          </DragDropContext>
        </Form>
      </div>

      <Row>
        {showSignOrder && (
          <Col md={1} className='pe-0' style={{ visibility: "hidden" }}>
            <div className='signOrder'>{1}</div>
          </Col>
        )}

        <Col md={11}>
          <div className='add-signatory-btns  d-flex justify-content-start mb-5 pb-5 gap-3'>
            <Button variant='outline' className='gap-2' onClick={handleAddRecipient}>
              <Icons.AddCircle size={22} />
              <span> {t("uploadDocFlow.addRecipient")}</span>
            </Button>

            <Button variant='outline' className='gap-2' onClick={handleAddYourself}>
              <Icons.AddCircle size={22} />
              <span> {t("uploadDocFlow.addYourself")}</span>
            </Button>
          </div>
        </Col>
      </Row>

      <div className='fixed bottom-0 left-0 z-[1040] flex w-full items-center justify-between border-t border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] px-5 py-2.5'>
        <Button variant='outline' className='min-h-10 px-5 font-semibold' id='hide_part_one' onClick={handleBack}>
          {t("uploadDocFlow.back")}
        </Button>

        <Button variant='primary' className='min-h-10 px-5 font-semibold' id='hide_part_one' onClick={handleContinue} disabled={isContinueDisabled}>
          {t("uploadDocFlow.Continue")}
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
          setSearchQuery(""); // Clear search filters when modal closes
        }}
        placement={document.documentElement.dir === "rtl" ? "start" : "end"}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("uploadDocFlow.SelectRecipient")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr />
        <Offcanvas.Body>
          {/* Search Input */}
          <div className='mb-3'>
            <input type='text' className='form-control' placeholder={t("uploadDocFlow.searchUser")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {/* Tabs */}
          <Tabs defaultActiveKey='team' id='recipient-tabs'>
            {/* Team Tab */}
            <Tab eventKey='team' title={t("uploadDocFlow.teamMembers")}>
              <div style={{ padding: "10px" }}>
                <ul style={{ listStyle: "none", padding: "0" }}>
                  {filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map((member, idx) => (
                      <li key={idx} style={{ marginBottom: "10px" }}>
                        <button className='w-full flex items-center justify-between p-2.5 rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] hover:bg-[var(--modern-border,#e2e8f0)] text-[var(--modern-text,#0f172a)] text-left transition-colors' onClick={() => handleRecipientSelection(member.name, member.email)}>
                          <span style={{ fontSize: "0.9rem" }}>{member.name}</span>
                          <span style={{ fontSize: "0.9rem" }}>{member.email}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <p>{t("uploadDocFlow.noTeam")}</p>
                  )}
                </ul>
              </div>
            </Tab>

            {/* Adhock Users Tab */}
            <Tab eventKey='adhock' title={t("uploadDocFlow.externalUsers")}>
              <div style={{ padding: "10px" }}>
                <ul style={{ listStyle: "none", padding: "0" }}>
                  {filteredAdhockUsers.length > 0 ? (
                    filteredAdhockUsers.map((user, idx) => (
                      <li key={idx} style={{ marginBottom: "10px" }}>
                        <button className='w-full flex items-center justify-between p-2.5 rounded-lg border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-raised,#f1f5f9)] hover:bg-[var(--modern-border,#e2e8f0)] text-[var(--modern-text,#0f172a)] text-left transition-colors' onClick={() => handleRecipientSelection(user.name, user.email)}>
                          <span style={{ fontSize: "0.9rem" }}>{user.name}</span>
                          <span style={{ fontSize: "0.9rem" }}>{user.email}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <p>{t("uploadDocFlow.noAdhookUsers")}</p>
                  )}
                </ul>
              </div>
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Signatories;
