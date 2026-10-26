import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import userService from "@/services/userService";
import dashboardService from "@/services/dashboardService";
import { Icons } from "@/assets/Icons/index";

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
      <Modal show={show} onHide={handleCloseModal} dialogClassName='custom-modal-width' backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--modern-raised)] text-[var(--modern-text)] border border-[var(--modern-border)]'>
              <Icons.TransferOwner size={22} />
            </div>
            <div className='flex-1'>
              <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>{t("dashboardCardStatuses.TransferOwnerShip")}</Modal.Title>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='px-4 py-4 space-y-4'>
          <div className='space-y-1.5'>
            <label className='block text-xs font-semibold uppercase tracking-wider text-[var(--modern-muted)]'>{t("dashboardCardStatuses.TransferTo")}</label>
            <div className='relative'>
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
                className='w-full px-3 py-2 text-sm rounded-lg border border-[var(--modern-border)] bg-[var(--modern-bg)] text-[var(--modern-text)]'
              />

              {showSuggestions && filteredEmails.length > 0 && (
                <div className='email-suggestions absolute z-50 w-full mt-1 bg-[var(--modern-card)] border border-[var(--modern-border)] rounded-lg shadow-none overflow-hidden max-h-48 overflow-y-auto'>
                  {filteredEmails.slice(0, 5).map((option, index) => (
                    <div
                      key={index}
                      className='p-2.5 hover:bg-[var(--modern-raised)] cursor-pointer text-sm border-b border-[var(--modern-border)] last:border-b-0'
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleEmailSelect(option);
                      }}
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium text-[var(--modern-text)]'>{option.fullName || t("dashboardCardStatuses.unknown")}</span>
                        <span className='text-xs text-[var(--modern-muted)]'>{option.emailID}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {emailError && <div className='text-xs text-rose-500 mt-1'>{emailError}</div>}
            </div>
          </div>

          <div className='flex items-start gap-3 p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs leading-relaxed'>
            <div className='mt-0.5 shrink-0'>
              <Icons.AlertCircle />
            </div>
            <div className='space-y-0.5'>
              <p className='font-semibold m-0'>{t("dashboardCardStatuses.transferWarningTitle")}</p>
              <p className='m-0 opacity-90'>{t("dashboardCardStatuses.transferWarningSubtitle")}</p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className='flex justify-between pt-3 border-t border-[var(--modern-border)]'>
          <Button variant='outline' onClick={handleCloseModal} disabled={isLoading}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button variant='primary' onClick={handleTransfer} disabled={isLoading || !newOwner || !validateEmail(newOwner)}>
            {t("dashboardCardStatuses.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TransferOwnershipModal;
