import React, { useEffect, useState, useRef } from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import verificationService from "@/services/verificationService";
import Loader from "@/Components/Loader/Loader";

const PasswordModal = ({ show, closeModal, auth, signatoryID, signatoryName, passwordProtected, defaultMasterDocID }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const inputRefs = useRef([]);

  // Focus first input on load
  useEffect(() => {
    if (show && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [show]);

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

      <Modal show={show} onHide={closeModal} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton={false}>
          <Modal.Title>Enter Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>
          <p>This document is password-protected. Please enter the password to proceed.</p>
          <div className='d-flex justify-content-center'>
            {otp.map((value, index) => (
              <input
                key={index}
                name={`otp${index}`}
                type='text'
                autoComplete='off'
                className='otpInput'
                value={value}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                ref={(input) => (inputRefs.current[index] = input)}
                maxLength={1}
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "5px",
                  textAlign: "center",
                  border: `1px solid ${value ? "#0C9AD7" : "#C4CED4"}`,
                }}
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-center'>
          <Button className='applyBtn' onClick={handleSubmitPassword} disabled={otp.some((v) => v === "")}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PasswordModal;
