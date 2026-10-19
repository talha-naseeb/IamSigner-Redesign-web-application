import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import userService from "@/services/userService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";

const ShareFolderModal = ({ show, handleClose, folderId, GetFolders, GetShareWithmeFolders, folderName }) => {
  const { t } = useTranslation();
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [isShareDisabled, setIsShareDisabled] = useState(true);
  const [teamEmails, setTeamEmails] = useState([]);
  const { user } = useUser();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (show) fetchTeamMembers();
  }, [show]);

  useEffect(() => {
    setIsShareDisabled(emails.length === 0);
  }, [emails]);

  // Filter team emails based on input
  useEffect(() => {
    if (currentEmail) {
      const filtered = teamEmails.filter((teamEmail) => teamEmail.toLowerCase().includes(currentEmail.toLowerCase()) && !emails.includes(teamEmail));
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails(teamEmails.filter((teamEmail) => !emails.includes(teamEmail)));
    }
  }, [currentEmail, teamEmails, emails]);

  // Validate current email input
  useEffect(() => {
    if (currentEmail && !validateEmail(currentEmail)) {
      setEmailError(t("logScreens.emailAddress"));
    } else {
      setEmailError("");
    }
  }, [currentEmail, t]);

  const fetchTeamMembers = async () => {
    try {
      const response = await userService.getAppUserTeam(user.AccountID);
      setTeamEmails(response.data.response.map((member) => member.emailID));
    } catch (error) {
      console.log("Error fetching team members", error);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setCurrentEmail(value);
    setShowSuggestions(value.length > 0);
  };

  const handleEmailSelect = (selectedEmail) => {
    if (!emails.includes(selectedEmail)) {
      setEmails([...emails, selectedEmail]);
      setCurrentEmail("");
      setShowSuggestions(false);
      setEmailError("");
    }
  };

  const handleEmailAdd = () => {
    if (currentEmail && validateEmail(currentEmail) && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
      setEmailError("");
    } else if (currentEmail && !validateEmail(currentEmail)) {
      setEmailError(t("logScreens.emailAddress"));
    } else if (emails.includes(currentEmail)) {
      toast.error(t("shareModal.emailAlreadyAdded"));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEmailAdd();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && currentEmail === "" && emails.length > 0) {
      e.preventDefault();
      const newEmails = [...emails];
      newEmails.pop(); // Remove the last email
      setEmails(newEmails);
    }
  };

  const handleEmailRemove = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleShareClick = async () => {
    try {
      const response = await userService.shareFolder({
        FolderID: folderId,
        Emails: emails,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.shareSuccess"));
        GetFolders();
        GetShareWithmeFolders();
        handleCloseModal();
      } else {
        toast.error(t("Folder.folderErrorShare"));
      }
    } catch (error) {
      console.log(t("Folder.folderErrorShare"));
    }
  };

  const handleCloseModal = () => {
    setEmails([]);
    setCurrentEmail("");
    setEmailError("");
    setShowSuggestions(false);
    setIsShareDisabled(true);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseModal} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
      <Modal.Header closeButton>
        <Modal.Title>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.Folders size={24} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("Folder.Sharefolder")}</Modal.Title>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='p-4'>
        <Form>
          <Form.Group className='mb-4 position-relative'>
            <Form.Label className='fw-semibold mb-2'>To</Form.Label>
            <div className='email-input-container'>
              <div className='email-chips-input'>
                {emails.map((email, index) => (
                  <span key={index} className='email-chip'>
                    {email}
                    <button type='button' className='email-chip-remove' onClick={() => handleEmailRemove(email)}>
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type='email'
                  className='email-chip-input'
                  placeholder={emails.length === 0 ? t("Folder.selectEmailPlaceholder") : ""}
                  value={currentEmail}
                  onChange={handleEmailChange}
                  onBlur={(e) => {
                    if (!e.relatedTarget || !e.relatedTarget.closest(".email-suggestions")) {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {showSuggestions && filteredEmails.length > 0 && (
                <div className='email-suggestions'>
                  {filteredEmails.slice(0, 10).map((teamEmail, index) => (
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
            </div>
            {emailError && <span className='text-danger small mt-1 d-block'>{emailError}</span>}
          </Form.Group>
        </Form>
        <p className='mb-0'>{t("Folder.shareFolderUsers")}</p>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        <Button variant='none' className='modalCancelButton' onClick={handleCloseModal}>
          {t("Folder.Cancel")}
        </Button>
        <Button className='applyBtn' variant='none' onClick={handleShareClick} disabled={isShareDisabled}>
          {t("Folder.share")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareFolderModal;
