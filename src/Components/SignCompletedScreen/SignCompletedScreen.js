import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import PATHS from "@/routes/paths";
import "@/Pages/SignedMessage/SignedMessage.css";
import thankyouIcon from "@/assets/images/thankyouIcon.svg";

const SignCompletedScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    const currentTheme = localStorage.getItem("theme");
    sessionStorage.clear();
    localStorage.clear();
    if (currentTheme) {
      localStorage.setItem("theme", currentTheme);
    }
    navigate(PATHS.login);
  };

  return (
    <div className='signed-message-container'>
      <div className='message-box d-flex flex-column justify-content-center align-items-center'>
        <img src={thankyouIcon} alt='signed' className='success-icon' />
        <h4 style={{ color: "#24B032", marginTop: "5px" }}>{t("signCompletedScreen.title")}</h4>
        <div className='mt-3'>
          <p className='m-0'>{t("signCompletedScreen.message")}</p>
        </div>
        <Button className='ImageDoneBtn mt-4' onClick={handleGoToLogin}>
          {t("signCompletedScreen.goToLogin")}
        </Button>
      </div>
    </div>
  );
};

export default SignCompletedScreen;
