import React, { useEffect, useState, useRef, useCallback } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import verificationService from "@/services/verificationService";
import { useTranslation } from "react-i18next";
import { FiShield } from "react-icons/fi";
import "@/Pages/Auth/VerifyOtp/style.css";

const PasswordModal = ({
  show,
  closeModal,
  auth,
  signatoryID,
  signatoryName,
  passwordProtected,
  defaultMasterDocID,
  className = "",
}) => {
  const length = 4;
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);
  const isSubmittingRef = useRef(false);
  const lastSubmittedCodeRef = useRef(null);
  const isMountedRef = useRef(true);
  const { t } = useTranslation();

  // Box verification state: "idle" | "verifying" | "success" | "error"
  const [verificationState, setVerificationState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetOtpFields = useCallback((shouldFocus = true) => {
    setOtp(new Array(length).fill(""));
    setVerificationState("idle");
    setErrorMessage("");
    lastSubmittedCodeRef.current = null;
    isSubmittingRef.current = false;
    if (shouldFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (show) {
      resetOtpFields(true);
    } else {
      resetOtpFields(false);
    }
  }, [show, resetOtpFields]);

  // Function to log signatory activity
  const logSignatoryActivity = useCallback(
    async (name) => {
      try {
        await verificationService.createSignActivityVerification(
          {
            Status: "Password Entered",
            Message: `${name} entered the password`,
          },
          auth
        );
      } catch (error) {
        console.error("Error logging signatory activity:", error);
      }
    },
    [auth]
  );

  const verifyPasswordCode = useCallback(
    async (enteredOTP) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setVerificationState("verifying");
      setErrorMessage("");

      const minWaveDurationMs = length * 150 + 240;

      try {
        const [response] = await Promise.all([
          (async () => {
            if (passwordProtected === "Document") {
              return verificationService.checkMasterDocPassword(
                {
                  MasterDocID: defaultMasterDocID,
                  PasswordIsHere: enteredOTP,
                },
                auth
              );
            }
            if (passwordProtected === "Signatory") {
              return verificationService.checkSignatoryPassword(
                { SignatoriesID: signatoryID, Password: enteredOTP },
                auth
              );
            }
            return null;
          })(),
          new Promise((resolve) => setTimeout(resolve, minWaveDurationMs)),
        ]);

        if (!isMountedRef.current) return;

        if (response?.data?.statusCode === "1") {
          setVerificationState("success");
          await Promise.all([
            logSignatoryActivity(signatoryName),
            new Promise((resolve) => setTimeout(resolve, 360)),
          ]);
          if (!isMountedRef.current) return;
          isSubmittingRef.current = false;
          closeModal();
          toast.success("Password verified successfully!");
          return;
        }

        const msg =
          response?.data?.statusCode === "7"
            ? "Oops! Password is not correct. Try again."
            : "Verification failed. Please try again.";
        toast.error(msg);
        setVerificationState("error");
        setErrorMessage(msg);
        isSubmittingRef.current = false;

        if (inputRefs.current[length - 1]) {
          inputRefs.current[length - 1].focus();
        }
      } catch (error) {
        if (!isMountedRef.current) return;
        const msg = "Something went wrong. Please try again later.";
        toast.error(msg);
        setVerificationState("error");
        setErrorMessage(msg);
        isSubmittingRef.current = false;

        if (inputRefs.current[length - 1]) {
          inputRefs.current[length - 1].focus();
        }
      }
    },
    [auth, closeModal, defaultMasterDocID, logSignatoryActivity, passwordProtected, signatoryID, signatoryName]
  );

  // Auto-submit exactly once when all digits are present
  useEffect(() => {
    if (!show) return;
    const allFieldsFilled = otp.length === length && otp.every((digit) => digit !== "");
    if (!allFieldsFilled) return;

    const enteredOTP = otp.join("");
    if (isSubmittingRef.current || lastSubmittedCodeRef.current === enteredOTP) {
      return;
    }

    lastSubmittedCodeRef.current = enteredOTP;
    verifyPasswordCode(enteredOTP);
  }, [otp, show, verifyPasswordCode]);

  const handleChange = (index, e) => {
    if (verificationState === "verifying" || verificationState === "success") return;

    const rawValue = e.target.value;
    if (rawValue !== "" && !/^\d+$/.test(rawValue)) return;

    const digit = rawValue ? rawValue.slice(-1) : "";
    const newOtp = [...otp];
    newOtp[index] = digit;

    lastSubmittedCodeRef.current = null;
    if (verificationState === "error") {
      setVerificationState("idle");
      setErrorMessage("");
    }

    setOtp(newOtp);

    if (digit && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (verificationState === "verifying" || verificationState === "success") return;

    if (e.key === "Backspace") {
      lastSubmittedCodeRef.current = null;
      if (verificationState === "error") {
        setVerificationState("idle");
        setErrorMessage("");
      }

      if (otp[index]) {
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0 && inputRefs.current[index - 1]) {
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0 && inputRefs.current[index - 1]) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1 && inputRefs.current[index + 1]) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    if (verificationState === "verifying" || verificationState === "success") return;

    const pasteData = e.clipboardData.getData("text/plain");
    const pasteValues = pasteData.match(/\d/g) || [];
    if (pasteValues.length === 0) return;

    const newOtp = [...otp];
    const startIndex = pasteValues.length >= length ? 0 : index;

    pasteValues.forEach((value, i) => {
      if (startIndex + i < length) {
        newOtp[startIndex + i] = value;
      }
    });

    lastSubmittedCodeRef.current = null;
    if (verificationState === "error") {
      setVerificationState("idle");
      setErrorMessage("");
    }

    setOtp(newOtp);

    const nextIndex = Math.min(startIndex + pasteValues.length, length - 1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  return (
    <Modal
      show={show}
      onHide={closeModal}
      centered
      backdrop='static'
      keyboard={false}
      dialogClassName={`custom-modal-width otp-modal ${className}`}
    >
      <Modal.Header closeButton={false} className='otp-modal-header'>
        <div className='otp-modal-heading'>
          <span className='otp-modal-symbol' aria-hidden='true'>
            <FiShield />
          </span>
          <Modal.Title>{t("signaturePage.enterPass")}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className='otp-modal-body'>
          <p className='otp-instruction'>{t("signaturePage.passwordProtected")}</p>

          <div
            className={`otp-input-row otp-input-row--${verificationState}`}
            style={{ "--otp-length": length }}
            role='group'
            aria-label={t("signaturePage.enterPass")}
            aria-busy={verificationState === "verifying"}
          >
            {otp.map((value, index) => (
              <input
                key={index}
                style={{ "--digit-index": index }}
                name={`otp${index}`}
                type='text'
                inputMode='numeric'
                autoComplete='off'
                aria-label={`${t("signaturePage.enterPass")} ${index + 1}`}
                aria-invalid={verificationState === "error"}
                value={value}
                disabled={verificationState === "verifying" || verificationState === "success"}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => handlePaste(index, e)}
                ref={(input) => (inputRefs.current[index] = input)}
                className={`otp-input ${value ? "active" : ""} ${
                  verificationState !== "idle" ? `otp-input--${verificationState}` : ""
                }`}
              />
            ))}
          </div>

          <div className={`otp-status-feedback otp-status-feedback--${verificationState}`} aria-live='polite'>
            {verificationState === "verifying" && (
              <span className='otp-status-text'>{t("logScreens.VerifyOTP") || "OTP verification in progress..."}</span>
            )}
            {verificationState === "success" && (
              <span className='otp-status-text'>Password verified successfully!</span>
            )}
            {verificationState === "error" && errorMessage && (
              <span className='otp-status-text'>{errorMessage}</span>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PasswordModal;
