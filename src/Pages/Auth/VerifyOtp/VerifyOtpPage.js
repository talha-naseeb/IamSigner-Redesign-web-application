import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "@/services/authService";
import { getRecaptchaToken } from "@/utils/recaptcha";
import { Mail, Shield } from "lucide-react";
import "./style.css";
import { useUser } from "@/Context/UserContext";
import { tokenManager } from "@/services/tokenManager";

const OtpInput = ({ length = 4, show, handleClose, email, password, onLogin }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);
  const isSubmittingRef = useRef(false);
  const lastSubmittedCodeRef = useRef(null);
  const isMountedRef = useRef(true);

  const { t } = useTranslation();
  const { fetchUserProfile, FetchRecordCounts } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [timer, setTimer] = useState(120);
  const [showResendButton, setShowResendButton] = useState(false);

  // Box verification state: "idle" | "verifying" | "success" | "error"
  const [verificationState, setVerificationState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetOtpFields = useCallback(
    (shouldFocus = true) => {
      setOtp(new Array(length).fill(""));
      setVerificationState("idle");
      setErrorMessage("");
      lastSubmittedCodeRef.current = null;
      isSubmittingRef.current = false;
      if (shouldFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    },
    [length]
  );

  useEffect(() => {
    if (show) {
      resetOtpFields(true);
    } else {
      resetOtpFields(false);
    }
  }, [show, resetOtpFields]);

  useEffect(() => {
    let interval;

    if (timer > 0 && show) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer <= 0) {
      clearInterval(interval);
      setShowResendButton(true);
    }

    return () => clearInterval(interval);
  }, [timer, show]);

  const handleModalClose = () => {
    resetOtpFields(false);
    setTimer(120);
    setShowResendButton(false);
    handleClose();
  };

  const getOtpErrorText = useCallback(
    (apiMessage, statusCode) => {
      const normalized = String(apiMessage || "")
        .trim()
        .toLowerCase();

      if (
        normalized.includes("notexists") ||
        normalized.includes("not exists") ||
        normalized.includes("wrong") ||
        normalized.includes("invalid")
      ) {
        return t("logScreens.wrongOTP");
      }

      if (normalized.includes("expired") || normalized.includes("expire")) {
        return t("logScreens.otpexpires");
      }

      if (String(statusCode) === "10") {
        return t("logScreens.otpexpires");
      }

      return t("logScreens.wrongOTP") || t("logScreens.failedverifyOTP");
    },
    [t]
  );

  const verifyOtpCode = useCallback(
    async (enteredOTP) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsLoading(true);
      setVerificationState("verifying");
      setErrorMessage("");

      // Minimum duration so the sequential highlight visibly travels from the first box to the last box
      const minWaveDurationMs = length * 150 + 240;

      try {
        const [response] = await Promise.all([
          (async () => {
            await getRecaptchaToken("VERIFY_OTP");
            return authService.verifyOtp({
              UserName: email,
              OTPValue: enteredOTP,
            });
          })(),
          new Promise((resolve) => setTimeout(resolve, minWaveDurationMs)),
        ]);

        if (!isMountedRef.current) return;

        if (response?.data?.statusCode === "1") {
          const { token } = response.data.response;
          tokenManager.setToken(token);
          setVerificationState("success");

          toast.success(t("logScreens.loginSuccess"));

          await Promise.all([
            fetchUserProfile(),
            FetchRecordCounts(),
            new Promise((resolve) => setTimeout(resolve, 380)),
          ]);

          if (!isMountedRef.current) return;
          setIsLoading(false);
          isSubmittingRef.current = false;
          onLogin(token);
          resetOtpFields(false);
          const from = location.state?.from;
          const redirectPath = from?.pathname
            ? `${from.pathname}${from.search || ""}${from.hash || ""}`
            : "/home";
          navigate(redirectPath, { replace: true });
          return;
        }

        // Differentiate "OTP NotExists" (wrong OTP) vs "OTP Expired"
        const msg = getOtpErrorText(response?.data?.message, response?.data?.statusCode);
        toast.error(msg);

        setVerificationState("error");
        setErrorMessage(msg);
        setIsLoading(false);
        isSubmittingRef.current = false;

        // Focus the last box so the user can immediately backspace or edit to resubmit
        const lastIdx = length - 1;
        if (inputRefs.current[lastIdx]) {
          inputRefs.current[lastIdx].focus();
        }
      } catch (error) {
        if (!isMountedRef.current) return;
        const apiErrorMsg = error?.response?.data?.message;
        const apiStatusCode = error?.response?.data?.statusCode;
        const msg =
          error?.code === "RECAPTCHA_UNAVAILABLE"
            ? t("logScreens.reCaptcha")
            : apiErrorMsg
            ? getOtpErrorText(apiErrorMsg, apiStatusCode)
            : t("logScreens.failedverifyOTP");

        if (error?.code === "RECAPTCHA_UNAVAILABLE" || apiErrorMsg) {
          toast.error(msg);
        }

        setVerificationState("error");
        setErrorMessage(msg);
        setIsLoading(false);
        isSubmittingRef.current = false;

        const lastIdx = length - 1;
        if (inputRefs.current[lastIdx]) {
          inputRefs.current[lastIdx].focus();
        }
      }
    },
    [email, fetchUserProfile, FetchRecordCounts, getOtpErrorText, length, location, navigate, onLogin, resetOtpFields, t]
  );

  // Auto-submit exactly once when all OTP digits are present
  useEffect(() => {
    if (!show) return;
    const allFieldsFilled = otp.length === length && otp.every((digit) => digit !== "");
    if (!allFieldsFilled) return;

    const enteredOTP = otp.join("");
    if (isSubmittingRef.current || lastSubmittedCodeRef.current === enteredOTP) {
      return;
    }

    lastSubmittedCodeRef.current = enteredOTP;
    verifyOtpCode(enteredOTP);
  }, [otp, length, show, verifyOtpCode]);

  const handleChange = (index, e) => {
    if (isLoading || verificationState === "success") return;

    const rawValue = e.target.value;
    if (rawValue !== "" && !/^\d+$/.test(rawValue)) return;

    const digit = rawValue ? rawValue.slice(-1) : "";
    const newOtp = [...otp];
    newOtp[index] = digit;

    // Allow resubmission when the user edits any digit after a failed attempt
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
    if (isLoading || verificationState === "success") return;

    if (e.key === "Backspace") {
      lastSubmittedCodeRef.current = null;
      if (verificationState === "error") {
        setVerificationState("idle");
        setErrorMessage("");
      }

      if (otp[index]) {
        // Clear current box in place
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0 && inputRefs.current[index - 1]) {
        // Move to previous box and clear it
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
    if (isLoading || verificationState === "success") return;

    const pasteData = e.clipboardData.getData("text/plain");
    const pasteValues = pasteData.match(/\d/g) || [];
    if (pasteValues.length === 0) return;

    const newOtp = [...otp];
    // If pasting a full code (or from the first box), fill from index 0; otherwise fill from current index
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

  const handleResendOTP = async () => {
    resetOtpFields(true);
    setTimer(120);
    setShowResendButton(false);
    setIsLoading(true);

    try {
      await getRecaptchaToken("LOGIN");
      const response = await authService.login(email, password);

      if (response.data.statusCode === "1") {
        toast.success(t("logScreens.otpResent"));
        setTimer(120);
      } else {
        toast.error(t("logScreens.failedOTP"));
      }
    } catch (error) {
      toast.error(t("logScreens.failedOTP"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      centered
      backdrop='static'
      keyboard={false}
      dialogClassName='custom-modal-width otp-modal'
    >
      <Modal.Header closeButton className='otp-modal-header'>
        <div className='otp-modal-heading'>
          <span className='otp-modal-symbol' aria-hidden='true'>
            <Shield size={20} />
          </span>
          <Modal.Title>{t("logScreens.otpDesc")}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className='otp-modal-body'>
          <div className='otp-delivery-card'>
            <span className='otp-delivery-icon' aria-hidden='true'>
              <Mail size={18} />
            </span>
            <div className='otp-delivery-copy'>
              <p>{t("logScreens.emailSent")}</p>
              <strong className='otp-delivery-email' dir='ltr'>
                {email}
              </strong>
            </div>
          </div>

          <p className='otp-instruction'>{t("logScreens.codeReceived")}</p>

          <div
            className={`otp-input-row otp-input-row--${verificationState}`}
            style={{ "--otp-length": length }}
            role='group'
            aria-label={t("logScreens.otpDesc")}
            aria-busy={verificationState === "verifying"}
          >
            {otp.map((value, index) => (
              <input
                key={index}
                style={{ "--digit-index": index }}
                inputMode='numeric'
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`${t("logScreens.otpDesc")} ${index + 1}`}
                aria-invalid={verificationState === "error"}
                className={`otp-input ${value ? "active" : ""} ${
                  verificationState !== "idle" ? `otp-input--${verificationState}` : ""
                }`}
                type='text'
                disabled={verificationState === "verifying" || verificationState === "success"}
                ref={(input) => (inputRefs.current[index] = input)}
                value={value}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => handlePaste(index, e)}
              />
            ))}
          </div>

          <div className={`otp-status-feedback otp-status-feedback--${verificationState}`} aria-live='polite'>
            {verificationState === "verifying" && (
              <span className='otp-status-text'>{t("logScreens.VerifyOTP") || "OTP verification in progress..."}</span>
            )}
            {verificationState === "success" && (
              <span className='otp-status-text'>{t("logScreens.loginSuccess") || "OTP verified"}</span>
            )}
            {verificationState === "error" && errorMessage && (
              <span className='otp-status-text'>{errorMessage}</span>
            )}
          </div>

          <div className='otp-resend-row'>
            <span className='otp-resend-question'>{t("logScreens.didntReceiveCode")}</span>
            {showResendButton ? (
              <button
                type='button'
                onClick={handleResendOTP}
                disabled={isLoading || verificationState === "verifying"}
                className='resend-btn'
              >
                {t("logScreens.sendOTPAgain")}
              </button>
            ) : (
              <button type='button' disabled className='resend-btn'>
                {`${t("logScreens.resendOtp")} ${timer} ${t("logScreens.seconds")}`}
              </button>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default OtpInput;
