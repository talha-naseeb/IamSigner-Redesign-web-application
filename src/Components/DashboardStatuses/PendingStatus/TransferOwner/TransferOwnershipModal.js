import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import "./TransferOwnershipModal.css";
import userService from "@/services/userService";
import dashboardService from "@/services/dashboardService";
import {Icons} from "@/assets/Icons/index";

const TransferOwnershipModal = ({ show, handleClose, masterDocID, docName }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [emailOptions, setEmailOptions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [emailError, setEmailError] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Filter emails based on input
  useEffect(() => {
    if (newOwner) {
      const filtered = emailOptions.filter(
        (option) => (option.emailID && option.emailID.toLowerCase().includes(newOwner.toLowerCase())) || (option.fullName && option.fullName.toLowerCase().includes(newOwner.toLowerCase()))
      );
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails(emailOptions);
    }
  }, [newOwner, emailOptions]);

  useEffect(() => {
    if (show) {
      fetchTeamMembers();
      resetFields();
    }
  }, [show]);

  const fetchTeamMembers = async () => {
    try {
      const response = await userService.getAppUserTeam(user.AccountID);
      setEmailOptions(response.data.response);
    } catch (error) {
      console.log("Error fetching team members", error);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setNewOwner(value);
    setShowSuggestions(value.length > 0);
    setEmailError("");
  };

  const handleEmailSelect = (option) => {
    setNewOwner(option.emailID);
    setShowSuggestions(false);
    setEmailError("");
  };

  const resetFields = () => {
    setNewOwner("");
    setShowSuggestions(false);
    setEmailError("");
  };

  const handleTransfer = async () => {
    if (!newOwner) {
      setEmailError(t("shareModal.fieldRequired"));
      return;
    } else if (!validateEmail(newOwner)) {
      setEmailError(t("logScreens.emailAddress"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await dashboardService.createDocumentOwnership({
        MasterDocID: masterDocID,
        NewOwner: newOwner,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.OwnershipSuccess"));
        resetFields();
        handleClose();
      } else {
        toast.error(t("dashboardCardStatuses.FailedTransfer"));
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(t("dashboardCardStatuses.FailedTransfer"));
      console.error("Error", error);
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    resetFields();
    handleClose();
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      <Modal show={show} onHide={handleCloseModal} dialogClassName='custom-modal-width' backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.TransferOwner size={25} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("dashboardCardStatuses.TransferOwnerShip")}</Modal.Title>
              {/* <p className="header-subtitle">{t("dashboardCardStatuses.transferOwnershipSubtitle")}</p> */}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='transfer-modal-body'>
          {/* <div className="document-info">
          <div className="document-icon">
            <Icons.PDFs size={25} />
          </div>
          <div className="document-details">
            <h6 className="document-title">{t("dashboardCardStatuses.document")}</h6>
            <p className="document-name">{docName}</p>
          </div>
        </div> */}

          <div className='transfer-section'>
            <h6 className='section-title'>{t("dashboardCardStatuses.TransferTo")}</h6>
            <div className='email-input-container'>
              <Form.Control
                type='text'
                placeholder={t("dashboardCardStatuses.searchTeamMembers")}
                value={newOwner}
                onChange={handleEmailChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={(e) => {
                  if (!e.relatedTarget || !e.relatedTarget.closest(".email-suggestions")) {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }
                }}
                className='email-input'
              />

              {showSuggestions && filteredEmails.length > 0 && (
                <div className='email-suggestions'>
                  {filteredEmails.slice(0, 5).map((option, index) => (
                    <div
                      key={index}
                      className='email-suggestion-item'
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleEmailSelect(option);
                      }}
                    >
                      <div className='suggestion-info'>
                        <div className='suggestion-name'>{option.fullName || t("dashboardCardStatuses.unknown")}</div>
                        <div className='suggestion-email'>{option.emailID}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {emailError && <div className='error-message'>{emailError}</div>}
            </div>
          </div>

          <div className='transfer-warning'>
            <div className='warning-icon'>
              <Icons.AlertCircle />
            </div>
            <div className='warning-text'>
              <p>{t("dashboardCardStatuses.transferWarningTitle")}</p>
              <p>{t("dashboardCardStatuses.transferWarningSubtitle")}</p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className='mt-4 d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={handleCloseModal} disabled={isLoading}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button className='applyBtn' variant='none' onClick={handleTransfer} disabled={isLoading || !newOwner || !validateEmail(newOwner)}>
            {t("dashboardCardStatuses.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TransferOwnershipModal;
