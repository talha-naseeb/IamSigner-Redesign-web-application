import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Dropdown, Accordion, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import moreIcon from "@/assets/images/moreIcon.png";
import { useTranslation } from "react-i18next";
import dashboardService from "@/services/dashboardService";
import uploadFlowService from "@/services/uploadFlowService";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ChangeOrderModal.css";
import { Chips } from "primereact/chips";
import deleteSign from "@/assets/images/deleteSign.svg";
import { Icons } from "@/assets/Icons";

const ChangeOrderModal = ({ show, handleClose, registerSignID, signedDocKey }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [verificationMethods, setVerificationMethods] = useState([]);
  const [languageTypes, setLanguageTypes] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [showSignOrder, setShowSignOrder] = useState(false);
  const [errors, setErrors] = useState([]);
  const [deleteConfirmationIndex, setDeleteConfirmationIndex] = useState(null);
  const [showDropdowns, setShowDropdowns] = useState(() => JSON.parse(localStorage.getItem("showDropdowns")) || {});
  const [showVerificationMethods, setShowVerificationMethods] = useState(() => JSON.parse(localStorage.getItem("showVerificationMethods")) || {});
  const [showAdditionalEmail, setShowAdditionalEmail] = useState(() => JSON.parse(localStorage.getItem("showAdditionalEmail")) || {});
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isContinueDisabled, setIsContinueDisabled] = useState(false);
  const [initialForms, setInitialForms] = useState([]);
  const [isFormUnchanged, setIsFormUnchanged] = useState(true);

  const initialFormState = {
    name: "",
    notificationType: "Email",
    additionalEmails: "",
    email: "",
    countryCode: "",
    mobile: "",
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
      .getLookups("NotificationType")
      .then((response) => {
        if (response.data.successStatus) {
          const notificationTypeOptions = response.data.response.map((item) => item.name);
          setNotificationTypes(notificationTypeOptions);
        }
      })
      .catch((error) => console.error(error));
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
      .catch((error) => console.error(error));
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
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    uploadFlowService
      .getLookups("countryCode")
      .then((response) => {
        if (response.data.successStatus) {
          const countryCodes = response.data.response.map((code) => ({
            lookupID: code.lookupID,
            name: code.name,
          }));
          setCountryCodes(countryCodes);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getNotStartedSignatories(registerSignID);

        if (response.data.successStatus) {
          const signatories = response.data.response.signatories;
          const serialCheck = response.data.response.isSerial;
          setShowSignOrder(serialCheck);

          if (signatories && signatories.length > 0) {
            const initializedForms = signatories.map((signatory) => {
              const { showEmail, showMobile } = determineFieldVisibility(signatory.notificationType, signatory.verificationType, signatory.email);
              // Check for additional emails in response
              const additionalEmails = signatory.additionalEmails ? signatory.additionalEmails.split(",").map((email) => email.trim()) : [];

              return {
                ...signatory,
                showEmail,
                showMobile,
                additionalEmails,
              };
            });

            setForms(initializedForms);
            setInitialForms(initializedForms); // Store initial state for comparison
          } else {
            setForms([initialFormState]);
          }
        } else {
          setForms([initialFormState]);
        }
      } catch (error) {
        setForms([initialFormState]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [registerSignID]);

  // Track form changes to disable/enable Continue button
  useEffect(() => {
    setIsFormUnchanged(JSON.stringify(forms) === JSON.stringify(initialForms));
  }, [forms, initialForms]);

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

      // Existing mobile validation
      if (form.showMobile && (!form.mobile || !form.countryCode)) {
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

    if (field === "notificationType" || field === "verificationType") {
      const { showEmail, showMobile } = determineFieldVisibility(updatedForms[index].notificationType, updatedForms[index].verificationType);
      updatedForms[index].showEmail = showEmail;
      updatedForms[index].showMobile = showMobile;
    }

    setForms(updatedForms);
    clearError(index, field);
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

  const handleShowDeleteConfirmation = (index) => {
    if (forms.length <= 1) {
      toast.warning(t("uploadDocFlow.cannotDeleteLastSignatory"));
      return;
    }
    setDeleteConfirmationIndex(index);
  };

  const handleDeleteSignatory = async (index, signatoryID) => {
    // Double check before deleting
    if (forms.length <= 1) {
      toast.warning(t("uploadDocFlow.cannotDeleteLastSignatory"));
      setDeleteConfirmationIndex(null);
      return;
    }

    if (signatoryID) {
      try {
        setIsLoading(true);
        const response = await uploadFlowService.deleteSignatory({
          SignatoriesID: signatoryID,
        });

        if (response.status === 200) {
          toast.success(t("uploadDocFlow.signatoryDeleted"));

          // If in serial mode, trigger resend notification to start the next signatory
          if (showSignOrder) {
            try {
              const resendResponse = await dashboardService.reminderEmail({
                SignAuth: signedDocKey,
              });

              if (resendResponse.data.statusCode === "1") {
                toast.success(t("uploadDocFlow.workflowContinued"));
              }
            } catch (Error) {
              console.error("Error sending resend notification:", Error);
            }
          }

          // Refresh the data
          try {
            const fetchResponse = await dashboardService.getNotStartedSignatories(registerSignID);

            if (fetchResponse.data.successStatus) {
              const signatories = fetchResponse.data.response.signatories;
              const serialCheck = fetchResponse.data.response.isSerial;
              setShowSignOrder(serialCheck);

              if (signatories && signatories.length > 0) {
                const initializedForms = signatories.map((signatory) => {
                  const { showEmail, showMobile } = determineFieldVisibility(signatory.notificationType, signatory.verificationType, signatory.email);
                  const additionalEmails = signatory.additionalEmails ? signatory.additionalEmails.split(",").map((email) => email.trim()) : [];

                  return {
                    ...signatory,
                    showEmail,
                    showMobile,
                    additionalEmails,
                  };
                });

                setForms(initializedForms);
              }
            }
          } catch (fetchError) {
            console.error("Error refreshing signatories:", fetchError);
          }

          setDeleteConfirmationIndex(null);
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.ErrDeletSignatory"));
      } finally {
        setIsLoading(false);
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
      Signatories: forms.map((form, index) => {
        const signatoryData = {
          Name: form.name,
          NotificationType: form.notificationType,
          Email: form.showEmail ? form.email : "",
          AdditionalEmails: (form.additionalEmails || []).join(",") || "None",
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
      const response = await dashboardService.updateSignatoryAfterWorkflowInitiation(data);

      setIsContinueDisabled(false);
      if (response.data.statusCode === "1") {
        toast.success(response.data.message);
      }
      handleClose();
    } catch (error) {
      setIsContinueDisabled(false); // Re-enable the button in case of error
      toast.error("uploadDocFlow.errFormUpdate");
    }
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.PenEdit size={25} />
            </div>

            <div className='header-text'>
              <Modal.Title>{t("uploadDocFlow.UpdateSignOrder")}</Modal.Title>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='signature-modal-body' style={{ maxHeight: "50vh", overflowY: "auto" }}>
          <div className='signatories-forms'>
            {isLoading && (
              <div className='loader-overlay'>
                <Loader />
              </div>
            )}

            <div className='signatory-form-container'>
              <Form>
                {forms.map((form, index) => (
                  <div key={index}>
                    <Row className='d-flex justify-content-start align-items-start'>
                      <Col md={12}>
                        <div className='signatory-form' style={{ border: `1px solid ${form.signatureColor}` }}>
                          <Row>
                            <Col md={4} className='signatory-form-col'>
                              <span style={{ fontWeight: "500" }}>
                                {t("uploadDocFlow.signatory")} {index + 1}
                              </span>
                            </Col>
                            <Col md={2} className='signatory-form-col'></Col>
                            <Col md={6} className='signatory-form-col action-buttons d-flex justify-content-end align-items-center flex-wrap gap-1'>
                              <div>
                                <Form.Group controlId='formNotificationMethod' style={{ color: "var(--text-primary) !important" }}>
                                  <Dropdown onSelect={(e) => handleInputChange(index, "languageType", e)}>
                                    <Dropdown.Toggle variant='' id='LanguageType' className='d-flex align-items-center gap-2'>
                                      <Icons.Language size={17} />
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
                              <OverlayTrigger
                                trigger='click'
                                placement='left'
                                rootClose
                                overlay={
                                  <Popover id={`popover-delete-${index}`}>
                                    <Popover.Header as='h3'>{t("uploadDocFlow.ConfirmDelete")}</Popover.Header>
                                    <Popover.Body>
                                      <div className='d-flex flex-column gap-2'>
                                        <p className='mb-0'>{t("uploadDocFlow.deleteSignatory")}</p>
                                        <div className='d-flex justify-content-end gap-2'>
                                          <Button size='sm' className='deleteCancelButton' onClick={() => document.body.click()}>
                                            {t("uploadDocFlow.cancel")}
                                          </Button>
                                          <Button size='sm' className='confirmDeleteButton' onClick={() => handleDeleteSignatory(index, form.signatoriesID)}>
                                            {t("createTeam.confirm")}
                                          </Button>
                                        </div>
                                      </div>
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <Button variant='none' className='p-0' onClick={() => handleShowDeleteConfirmation(index)}>
                                  <img src={deleteSign} alt='icon-loading' />
                                </Button>
                              </OverlayTrigger>

                              <Button variant='none' className='p-0' onClick={() => handleToggleDropdown(index)}>
                                <img src={moreIcon} alt='more' />
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
                          <Row>
                            <Col md={5}>
                              <Form.Group controlId={`formSignatoryName${index}`}>
                                <Form.Label>
                                  {t("uploadDocFlow.name")} <span className='required'>*</span>
                                </Form.Label>
                                <Form.Control
                                  list='teamNames'
                                  type='text'
                                  value={form.name}
                                  onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                  placeholder={t("uploadDocFlow.enterName")}
                                />

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
                                  <Form.Control type='email' value={form.email || ""} onChange={(e) => handleInputChange(index, "email", e.target.value)} placeholder={t("uploadDocFlow.enterEmail")} />
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
                                  <div className='input-group'>
                                    <Form.Select value={form.countryCode || ""} onChange={(e) => handleInputChange(index, "countryCode", e.target.value)} style={{ width: "17%" }}>
                                      <option value='' disabled>
                                        {t("logScreens.Codes")}
                                      </option>
                                      {countryCodes.map((code) => (
                                        <option key={code.lookupID} value={code.lookupID}>
                                          {code.lookupID}
                                        </option>
                                      ))}
                                    </Form.Select>

                                    <Form.Control
                                      type='text'
                                      value={form.mobile || ""}
                                      onChange={(e) => handleInputChange(index, "mobile", e.target.value)}
                                      placeholder={t("logScreens.mobileNumber")}
                                      style={{ width: "calc(85% - 40px)" }}
                                    />
                                  </div>
                                  {errors[index]?.countryCode && <div className='error-message'>{errors[index].countryCode}</div>}
                                  {errors[index]?.mobile && <div className='error-message'>{errors[index].mobile}</div>}
                                </Form.Group>
                              </Col>
                            )}

                            {showAdditionalEmail[index] && (
                              <Accordion defaultActiveKey='0' className='custom-dropdown'>
                                <Accordion.Item eventKey='0'>
                                  <hr className='mb-1' />
                                  <Accordion.Header className='custom-dropdown-header'>
                                    <Icons.customEmail size={20} />
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
                                    <Icons.VerificationMethod size={20} />
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
                ))}
              </Form>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className='modalCancelButton' onClick={handleClose}>
            {t("uploadDocFlow.cancel")}
          </Button>
          <Button className='applyBtn' onClick={handleContinue} disabled={isContinueDisabled || isFormUnchanged}>
            {t("createTeam.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChangeOrderModal;
