import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button, Col, Form, Row, Dropdown, Offcanvas, Tab, Tabs } from "@/Components/UI/shadcnCompat";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import userService from "@/services/userService";

const AddRecipient = ({ setActiveStep, setCompletedSteps }) => {
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
      signColor: "#ffe987",
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

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [adhockNames, setAdhockNames] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const storedTemplateID = sessionStorage.getItem("templateID") || localStorage.getItem("templateID");

  // Fetching country codes for the dropdown
  useEffect(() => {
    uploadFlowService
      .getLookups("countryCode")
      .then((response) => {
        if (response.data.successStatus) {
          setCountryCodes(response.data.response);
        }
      })
      .catch(errors);
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("signatureType")
      .then((response) => {
        if (response.data.successStatus) {
          const signatureTypeOptions = response.data.response.map((item) => item.name);
          setSignatureTypes(signatureTypeOptions);
          setRecipientForms((prevRecipientForms) =>
            prevRecipientForms.map((form) => ({
              ...form,
              signatureType: signatureTypeOptions[0],
            }))
          );
        }
      })
      .catch(errors);
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
      .catch(errors);
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
              signColor: formColors[index % formColors.length],
            }))
          );
        }
      })
      .catch(errors);
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
            // Combine country code and mobile for phoneNumber field
            const phoneNumber = signatory.countryCode && signatory.mobile ? signatory.countryCode + signatory.mobile : "";

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
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //Get Team APi
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

      if (form.notificationType === "SMS" || form.notificationType === "WhatsApp") {
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

    // Logic to handle the setting of email and mobile fields based on NotificationType
    if (field === "notificationType") {
      if (value === "Email") {
        newRecipientForms[index].phone = "";
        newRecipientForms[index].countryCode = "";
        newRecipientForms[index].phoneNumber = "";
      } else if (value === "SMS" || value === "WhatsApp") {
        newRecipientForms[index].email = "";
      }
    }

    // Clear the error for the specific field being updated
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

    // Extract country code and mobile number from the combined phone input
    if (phone && phone.length >= 10) {
      const countryCode = phone.substring(0, phone.length - 10);
      const mobileNumber = phone.substring(phone.length - 10);
      newRecipientForms[index].countryCode = countryCode;
      newRecipientForms[index].phone = mobileNumber;

      // Clear phone error
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
    // If all colors are used, fallback to first color or default
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

    // Remove the form and recalculate sign orders
    setRecipientForms((prevForms) => {
      const updatedForms = prevForms.filter((_, idx) => idx !== index);

      // Recalculate sign orders
      return updatedForms.map((form, idx) => ({
        ...form,
        signOrder: idx + 1,
      }));
    });

    setShowConfirmModal(false); // Close confirmation modal
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

    // Update signOrder based on the new order
    const updatedForms = reorderedForms.map((form, index) => ({
      ...form,
      signOrder: index + 1,
    }));

    setRecipientForms(updatedForms);
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

  const splitMobileNumber = (mobileNumber) => {
    const [CountryCode, Mobile] = mobileNumber.split("-");
    return {
      CountryCode,
      Mobile,
    };
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
        CountryCode: form.notificationType === "SMS" || form.notificationType === "WhatsApp" ? form.countryCode : "",
        Mobile: form.notificationType === "SMS" || form.notificationType === "WhatsApp" ? form.phone : "",
        Company: form.company,
        SignOrder: form.signOrder, // Ensure this is correct
        SignatureType: form.signatureType,
        SignatureColor: form.signColor,
        SignPage: form.signPage,
        SignPosition: form.signPosition,
        Ismobile: form.ismobile,
        ExpiryDate: form.expiryDate,
        IsExpiring: form.isExpiring,
      }));

      const response = await templateService.createBulkTemplateSignatories(requestBody);

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
  // Filter the team and adhock user lists based on the search query
  const filteredTeamMembers = teamMemberNames.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredAdhockUsers = adhockNames.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleRecipientSelection = (name, email) => {
    if (selectedIndex === null) return;

    const updatedForms = [...recipientForms];
    updatedForms[selectedIndex] = {
      ...updatedForms[selectedIndex],
      name,
      email,
    };
    setRecipientForms(updatedForms);
    setShowOffcanvas(false); // Close the Offcanvas
  };
  return (
    <div className='signatories-forms'>
      <div className='signatory-form-container'>
        <Form>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='forms'>
              {(provided) => (
                <Form ref={provided.innerRef} {...provided.droppableProps}>
                  {recipientForms &&
                    recipientForms.map((form, index) => (
                      <Draggable key={index} draggableId={index.toString()} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <Row className='d-flex justify-content-start align-items-start'>
                              <Col className='mt-3'>
                                <div className='signatory-form' style={{ border: `1px solid ${form.signColor}` }}>
                                  <Row>
                                    <Col md={11} className='signatory-form-col action-buttons d-flex justify-content-end align-items-center flex-wrap'></Col>

                                    <div className='signatory-form-col action-buttons d-flex align-items-center justify-content-between flex-wrap'>
                                      <Col md={4} className='d-flex gap-2 align-items-center signatory-form-col'>
                                        <div {...provided.dragHandleProps} className='drag-icon'>
                                          <Icons.DragHandle size={18} />
                                        </div>
                                        <div className='fw-bold'>
                                          {t("uploadDocFlow.signatory")} {index + 1}
                                        </div>
                                      </Col>
                                      <Col md={2} className='signatory-form-col'></Col>
                                      <Col md={6} className='signatory-form-col action-buttons d-flex justify-content-end align-items-center flex-wrap gap-1'>
                                        <Button
                                          variant='outline'
                                          size='sm'
                                          className='inline-flex items-center gap-1.5'
                                          onClick={() => {
                                            setSelectedIndex(index);
                                            setShowOffcanvas(true);
                                          }}
                                        >
                                          <Icons.UserSearch className='mx-1' size={16} />
                                          {t("uploadDocFlow.existingUser")}
                                        </Button>
                                        <div>
                                          <Form.Group controlId={`formSignatureMethod${index}`}>
                                            <Dropdown onSelect={(e) => handleFormChange(index, "signatureType", e)}>
                                              <Dropdown.Toggle className=' d-flex align-items-center gap-2' variant='' id={`signatureType${index}`}>
                                                {form.signatureType === "Needs To Sign" && <Icons.SignatureType />}
                                                {form.signatureType === "View Only" && <Icons.Eye />}
                                                {form.signatureType}
                                              </Dropdown.Toggle>
                                              <Dropdown.Menu style={{ left: "auto", right: 0, minWidth: "unset", padding: "0px" }}>
                                                {signatureTypes.map((signature, sigIndex) => (
                                                  <Dropdown.Item key={sigIndex} eventKey={signature} className='d-flex align-items-center gap-2'>
                                                    {signature === "Needs To Sign" && <Icons.SignatureType />}
                                                    {signature === "View Only" && <Icons.Eye />}
                                                    {signature}
                                                  </Dropdown.Item>
                                                ))}
                                              </Dropdown.Menu>
                                            </Dropdown>
                                          </Form.Group>
                                        </div>
                                        <Button variant='none' className='p-0' onClick={() => handleShowConfirmModal(form.templateSignatoryID, index)}>
                                          <Icons.DeleteSignatory />
                                        </Button>
                                      </Col>
                                    </div>

                                    <Col md={5}>
                                      <Form.Group controlId={`formSignatoryName${index}`}>
                                        <Form.Label>
                                          {t("uploadDocFlow.name")} <span className='required'>*</span>
                                        </Form.Label>
                                        <Form.Control
                                          list='teamNames'
                                          type='text'
                                          value={form.name}
                                          onChange={(e) => handleFormChange(index, "name", e.target.value)}
                                          placeholder={t("uploadDocFlow.enterName")}
                                        />
                                        {errors[index]?.name && <div className='error-message'>{errors[index].name}</div>}
                                      </Form.Group>
                                    </Col>

                                    <Col md={2}>
                                      <Form.Group controlId={`formNotificationMethod${index}`}>
                                        <Form.Label>{t("uploadDocFlow.notificationType")}</Form.Label>
                                        <Dropdown onSelect={(e) => handleFormChange(index, "notificationType", e)}>
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

                                    {form.notificationType === "Email" && (
                                      <Col md={5}>
                                        <Form.Group controlId={`formEmailAddress${index}`}>
                                          <Form.Label>
                                            {t("uploadDocFlow.emailAddress")} <span className='required'>*</span>
                                          </Form.Label>
                                          <Form.Control
                                            list='teamEmails'
                                            type='email'
                                            value={form.email}
                                            onChange={(e) => handleFormChange(index, "email", e.target.value)}
                                            placeholder={t("uploadDocFlow.enterEmail")}
                                          />
                                          {errors[index]?.email && <div className='error-message'>{errors[index].email}</div>}
                                        </Form.Group>
                                      </Col>
                                    )}

                                    {(form.notificationType === "SMS" || form.notificationType === "WhatsApp") && (
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
                                          {errors[index]?.phone && <div className='error-message'>{errors[index].phone}</div>}
                                        </Form.Group>
                                      </Col>
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
        <Col md={11}>
          <div className='flex flex-wrap items-center gap-3 my-4'>
            <Button variant='outline' className='inline-flex items-center gap-2' onClick={handleAddRecipient}>
              <Icons.AddCircle size={20} />
              <span>{t("uploadDocFlow.addRecipient")}</span>
            </Button>

            <Button variant='outline' className='inline-flex items-center gap-2' onClick={handleAddYourself}>
              <Icons.AddCircle size={20} />
              <span>{t("uploadDocFlow.addYourself")}</span>
            </Button>
          </div>
        </Col>
      </Row>

      <div className='fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 border-t border-[var(--modern-border)] bg-[var(--modern-card)]'>
        <Button variant='outline' id='hide_part_one' onClick={handleBack} disabled={isLoading}>
          {t("uploadDocFlow.back")}
        </Button>

        <Button variant='primary' id='hide_part_one' onClick={handleContinue} disabled={isContinueDisabled || isLoading}>
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <span className='inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
              {t("uploadDocFlow.Continue")}
            </span>
          ) : (
            t("uploadDocFlow.Continue")
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
                        <button className='Addrecepient' onClick={() => handleRecipientSelection(member.name, member.email)}>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{member.name}</span>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{member.email}</span>
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
                        <button className='Addrecepient' onClick={() => handleRecipientSelection(user.name, user.email)}>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{user.name}</span>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{user.email}</span>
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

export default AddRecipient;
