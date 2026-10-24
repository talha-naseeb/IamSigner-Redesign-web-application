import React, { useEffect, useState, useRef } from "react";
import { Button, Modal } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import verificationService from "@/services/verificationService";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { useTranslation } from "react-i18next";

const PasswordModal = ({ show, closeModal, auth, signatoryID, signatoryName, passwordProtected, defaultMasterDocID, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const inputRefs = useRef([]);
  const [disableButton, setDisableButton] = useState(true);
  const { t } = useTranslation();
  // Focus first input on load
  useEffect(() => {
    if (show && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [show]);

  useEffect(() => {
    const allFieldsFilled = otp.every((digit) => digit !== "");
    setDisableButton(!allFieldsFilled || isLoading);
  }, [otp, isLoading]);

  // Handle input change
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key press
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "Enter" && index === 3) {
      handleSubmitPassword(e);
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain");
    const pasteValues = pasteData.match(/\d/g) || [];
    const newOtp = [...otp];

    pasteValues.slice(0, 4).forEach((value, i) => {
      newOtp[i] = value;
    });

    setOtp(newOtp);

    // Move focus to the next input after the last pasted character
    const nextIndex = pasteValues.length < 4 ? pasteValues.length : 3;
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  // Handle password submission (OTP verification)
  const handleSubmitPassword = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const enteredOTP = otp.join("");

    try {
      let response;

      if (passwordProtected === "Document") {
        // Handle document-level password verification
        const body = {
          MasterDocID: defaultMasterDocID,
          PasswordIsHere: enteredOTP,
        };
        response = await verificationService.checkMasterDocPassword(body, auth);
      } else if (passwordProtected === "Signatory") {
        // Handle signatory-level password verification
        const body = { SignatoriesID: signatoryID, Password: enteredOTP };
        response = await verificationService.checkSignatoryPassword(body, auth);
      }

      if (response?.data?.statusCode === "1") {
        // Log the password entry activity for the signatory
        await logSignatoryActivity(signatoryName);
        closeModal();
        toast.success("Password verified successfully!");
      } else if (response?.data?.statusCode === "7") {
        toast.error("Oops! Password is not correct. Try again.");
        setOtp(new Array(4).fill("")); // Reset OTP fields
        inputRefs.current[0].focus(); // Focus first input
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log signatory activity
  const logSignatoryActivity = async (signatoryName) => {
    try {
      await verificationService.createSignActivityVerification(
        {
          Status: "Password Entered",
          Message: `${signatoryName} entered the password`,
        },
        auth
      );
    } catch (error) {
      console.error("Error logging signatory activity:", error);
    }
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Modal show={show} onHide={closeModal} backdrop='static' keyboard={false} dialogClassName={`custom-modal-width ${className}`}>
        <Modal.Header closeButton={false}>
          <Modal.Title>{t("signaturePage.enterPass")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>
          <p>{t("signaturePage.passwordProtected")}</p>
          <div className='d-flex justify-content-center'>
            {otp.map((value, index) => (
              <input
                key={index}
                name={`otp${index}`}
                type='text'
                autoComplete='off'
                value={value}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                ref={(input) => (inputRefs.current[index] = input)}
                maxLength={1}
                className={`otp-input ${value ? "active" : ""}`}
              />
            ))}
          </div>
        </Modal.Body>
        <div className='btnDiv'>
          <Button onClick={handleSubmitPassword} disabled={disableButton} className='btn-otp'>
            {t("logScreens.Verify")}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default PasswordModal;
