import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "@/services/authService";
import { getRecaptchaToken } from "@/utils/recaptcha";
import { FiMail, FiShield } from "react-icons/fi";
import "./style.css";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { useUser } from "@/Context/UserContext";
import { tokenManager } from "@/services/tokenManager";

const OtpInput = ({ length = 4, show, handleClose, email, password, onLogin }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);
  const { t } = useTranslation();
  const { fetchUserProfile, FetchRecordCounts } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [disableButton, setDisableButton] = useState(true);
  const [timer, setTimer] = useState(120);
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    if (show && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [show]);

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

  useEffect(() => {
    const allFieldsFilled = otp.every((digit) => digit !== "");
    setDisableButton(!allFieldsFilled || isLoading);
  }, [otp, isLoading]);

  const handleModalClose = () => {
    resetOtpFields();
    setTimer(120);
    setShowResendButton(false);
    handleClose();
  };

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "Enter" && index === length - 1) {
      handleSubmit(e);
    }
  };

  const resetOtpFields = () => {
    setOtp(new Array(length).fill(""));
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await getRecaptchaToken("VERIFY_OTP");
      const enteredOTP = otp.join("");
      const response = await authService.verifyOtp({
        UserName: email,
        OTPValue: enteredOTP,
      });

      if (response.data.statusCode === "1") {
        const { token } = response.data.response;
        tokenManager.setToken(token);

        toast.success(t("logScreens.loginSuccess"));

        // Fetch data in parallel before switching auth state
        await Promise.all([fetchUserProfile(), FetchRecordCounts()]);

        onLogin(token);
        resetOtpFields();
        navigate("/home");
      } else if (response.data.statusCode === "10") {
        toast.error(t("logScreens.otpexpires"));
      }
    } catch (error) {
      if (error?.code === "RECAPTCHA_UNAVAILABLE") toast.error(t("logScreens.reCaptcha"));
    } finally {
      setIsLoading(false);
      setDisableButton(true);
      resetOtpFields();
    }
  };

  const handleResendOTP = async () => {
    resetOtpFields();
    setTimer(120);
    setDisableButton(true);
    setShowResendButton(false);
    setIsLoading(true);

    try {
      await getRecaptchaToken("LOGIN");
      const response = await authService.login(email, password);

      if (response.data.statusCode === "1") {
        toast.success(t("logScreens.otpResent"));
        setTimer(120);
        setDisableButton(true);
      } else {
        toast.error(t("logScreens.failedOTP"));
      }
    } catch (error) {
      toast.error(t("logScreens.failedOTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();

    const pasteData = e.clipboardData.getData("text/plain");
    const pasteValues = pasteData.match(/\d/g) || [];
    const newOtp = [...otp];

    const startIndex = Math.max(0, index - pasteValues.length + 1);

    pasteValues.forEach((value, i) => {
      if (startIndex + i < length) {
        newOtp[startIndex + i] = value;
      }
    });

    setOtp(newOtp);

    const nextIndex = Math.min(startIndex + pasteValues.length, length - 1);
    inputRefs.current[nextIndex].focus();
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <Modal show={show} onHide={handleModalClose} centered backdrop='static' keyboard={false} dialogClassName='custom-modal-width otp-modal'>
        <Modal.Header closeButton className='otp-modal-header'>
          <div className='otp-modal-heading'>
            <span className='otp-modal-symbol' aria-hidden='true'><FiShield /></span>
            <Modal.Title>{t("logScreens.otpDesc")}</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className='otp-modal-body'>
            <div className='otp-delivery-card'>
              <span className='otp-delivery-icon' aria-hidden='true'><FiMail /></span>
              <div className='otp-delivery-copy'>
                <p>{t("logScreens.emailSent")}</p>
                <strong className='otp-delivery-email' dir='ltr'>{email}</strong>
              </div>
            </div>
            <p className='otp-instruction'>{t("logScreens.codeReceived")}</p>
            <div className='otp-input-row' role='group' aria-label={t("logScreens.otpDesc")}>
              {otp.map((value, index) => (
                <input
                  key={index}
                  inputMode='numeric'
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  aria-label={`${t("logScreens.otpDesc")} ${index + 1}`}
                  className={`otp-input ${value ? "active" : ""}`}
                  type='text'
                  ref={(input) => (inputRefs.current[index] = input)}
                  value={value}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(index, e)}
                />
              ))}
            </div>
            <div className='otp-resend-row'>
              <span className='otp-resend-question'>{t("logScreens.didntReceiveCode")}</span>
              {showResendButton ? (
                <button type='button' onClick={handleResendOTP} disabled={isLoading} className='resend-btn'>
                  {t("logScreens.sendOTPAgain")}
                </button>
              ) : (
                <button type='button' disabled className='resend-btn'>
                  {`${t("logScreens.resendOtp")} ${timer} ${t("logScreens.seconds")}`}
                </button>
              )}
            </div>
            <button type='submit' disabled={disableButton} onClick={handleSubmit} className='btn-otp'>
              {t("logScreens.Verify")}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OtpInput;
