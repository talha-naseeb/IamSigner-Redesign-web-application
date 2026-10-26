import React, { useEffect, useState } from "react";
import { Modal, Button } from "@/Components/UI/shadcnCompat";
import { Form as Form } from "@/Components/UI/shadcnCompat";
import "./modal.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import { useUser } from "@/Context/UserContext";
import { FiShare2 } from "react-icons/fi";

const ShareModal = ({ show, handleClose, masterDocID, registerSignID }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [teamEmails, setTeamEmails] = useState([]);
  const { user } = useUser();
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [error, setError] = useState();
  const [emailError, setEmailError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    Document: false,
    AuditTrail: false,
    SupportingDocs: false,
  });
  const [isDisabled, setIsDisabled] = useState(true);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (email && emailSubject && emailBody && validateEmail(email)) {
      setIsDisabled(false);
      setEmailError("");
    } else {
      setIsDisabled(true);
      if (email && !validateEmail(email)) {
        setEmailError(t("logScreens.emailAddress"));
      } else {
        setEmailError("");
      }
    }
  }, [email, emailSubject, emailBody]);

  useEffect(() => {
    if (show) {
      fetchTeamMembers();
      resetFields();
    }
  }, [show]);

  // Filter team emails based on input
  useEffect(() => {
    if (email) {
      const filtered = teamEmails.filter((teamEmail) => teamEmail.toLowerCase().includes(email.toLowerCase()));
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails(teamEmails);
    }
  }, [email, teamEmails]);

  const fetchTeamMembers = async () => {
    try {
      const response = await userService.getAppUserTeam(user.AccountID);
      setTeamEmails(response.data.response.map((member) => member.emailID));
    } catch (error) {
      console.log("Error fetching team members", error);
    }
  };

  const handleCheckboxChange = (checkbox) => {
    setSelectedCheckboxes((prevSelected) => ({
      ...prevSelected,
      [checkbox]: !prevSelected[checkbox],
    }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setShowSuggestions(value.length > 0);
  };

  const handleEmailSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowSuggestions(false);
  };

  const handleShare = async () => {
    const requestBody = {
      Email: email,
      Subject: emailSubject,
      Body: emailBody,
      MasterDocID: masterDocID,
      RegisterSignID: registerSignID,
      IsDocShared: selectedCheckboxes.Document,
      IsAuditTrailDocShared: selectedCheckboxes.AuditTrail,
      IsSupportingDocShared: selectedCheckboxes.SupportingDocs,
    };

    setIsLoading(true);
    try {
      const response = await userService.createDocShared(requestBody);

      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.shareFileSucessToast"));
        resetFields();
        handleClose();
      }
      setIsLoading(false);
    } catch (error) {
      handleError(error);
      handleClose();
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!email || !emailSubject || !emailBody) {
      setError(t("shareModal.fieldRequired"));
      return;
    } else if (!validateEmail(email)) {
      setEmailError(t("logScreens.emailAddress"));
      return;
    } else if (!selectedCheckboxes.Document && !selectedCheckboxes.AuditTrail && !selectedCheckboxes.SupportingDocs) {
      toast.error(t("shareModal.selectAtLeastOneOption"));
    } else {
      handleShare();
    }
  };

  const resetFields = () => {
    setEmail("");
    setEmailSubject("");
    setEmailBody("");
    setEmailError("");
    setShowSuggestions(false);
    setSelectedCheckboxes({
      Document: false,
      AuditTrail: false,
      SupportingDocs: false,
    });
    setError(null);
  };

  const handleError = (error) => {
    if (error.response?.statusCode === "4") {
      toast.error(t("dashboardCardStatuses.unathorizedErrSharedFile"));
    } else if (error.response?.data?.statusCode === "3") {
      toast.error(t("shareModal.alreadyShared"));
    } else {
      toast.error(t("shareModal.alreadyShared"));
    }
    resetFields();
  };

  const handleCloseModal = () => {
    resetFields();
    handleClose();
  };

  return (
    <>
      <Modal show={show} backdrop='static' keyboard={false} onHide={handleCloseModal} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <FiShare2 size={22} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("shareModal.shareDoc")}</Modal.Title>
              <p className='header-subtitle'>{t("shareModal.chooseDoc")}</p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-4 py-3'>
          <div className='form-check mt-2'>
            <input type='checkbox' className='form-check-input' id='shareDocument' checked={selectedCheckboxes.Document} onChange={() => handleCheckboxChange("Document")} />
            <label className='form-check-label' htmlFor='shareDocument'>
              {t("viewModal.orgDoc")}
            </label>
          </div>

          <div className='form-check'>
            <input type='checkbox' className='form-check-input' id='shareAuditTrail' checked={selectedCheckboxes.AuditTrail} onChange={() => handleCheckboxChange("AuditTrail")} />
            <label className='form-check-label' htmlFor='shareAuditTrail'>
              {t("viewModal.auditTrail")}
            </label>
          </div>

          <div className='form-check mb-2'>
            <input type='checkbox' className='form-check-input' id='shareSupportingDocs' checked={selectedCheckboxes.SupportingDocs} onChange={() => handleCheckboxChange("SupportingDocs")} />
            <label className='form-check-label' htmlFor='shareSupportingDocs'>
              {t("viewModal.supportingDoc")}
            </label>
          </div>

          <Form.Group controlId='formBasicEmail' className='position-relative mt-3'>
            <Form.Label>
              {t("shareModal.email")}
              <span className='text-danger mx-1'>*</span>
            </Form.Label>
            <Form.Control
              type='email'
              placeholder={t("Folder.selectEmailPlaceholder")}
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={(e) => {
                // Only hide suggestions if not clicking on suggestion items
                if (!e.relatedTarget || !e.relatedTarget.closest(".email-suggestions")) {
                  setTimeout(() => setShowSuggestions(false), 150);
                }
              }}
              required
            />
            {showSuggestions && filteredEmails.length > 0 && (
              <div className='email-suggestions'>
                {filteredEmails.slice(0, 5).map((teamEmail, index) => (
                  <div
                    key={index}
                    className='email-suggestion-item'
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleEmailSelect(teamEmail);
                    }}
                  >
                    {teamEmail}
                  </div>
                ))}
              </div>
            )}
            {emailError && <span className='text-danger'>{emailError}</span>}
            {error && <span className='text-danger'>{error}</span>}
          </Form.Group>

          <Form.Group className='mt-3' controlId='formBasicSubject'>
            <Form.Label>
              {t("shareModal.subject")}
              <span className='text-danger mx-1'>*</span>
            </Form.Label>
            <Form.Control type='text' placeholder={t("shareModal.subjectPlaceholder")} value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required />
            {error && <span className='text-danger'>{t("shareModal.fieldRequired")}</span>}
          </Form.Group>

          <Form.Group className='mt-3' controlId='formBasicBody'>
            <Form.Label>
              {t("shareModal.body")}
              <span className='text-danger mx-1'>*</span>
            </Form.Label>
            <Form.Control as='textarea' placeholder={t("shareModal.bodyPlaceholder")} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={3} required />
            {error && <span className='text-danger'>{t("shareModal.fieldRequired")}</span>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className='mt-2 d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={handleCloseModal}>
            {t("shareModal.cancel")}
          </Button>
          <Button className='applyBtn' variant='none' disabled={isDisabled} onClick={handleSubmit}>
            {t("shareModal.shareFile")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShareModal;
