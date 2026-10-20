import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { hasOpenerTab, returnToOpenerTab } from "@/Helpers/openerTab";
import { tokenManager } from "@/services/tokenManager";
import "./SigningMessage.css";

/**
 * Shared dynamic status-message screen for the signing flows.
 * One component replaces the previously duplicated
 * SignedMessage / LinkExpire / DeclinedMessage / DocumentRecalled / DocumentLoadError
 * layouts — pass icon, title and messages dynamically instead of creating new files.
 */
const SigningMessage = ({
  icon,
  iconAlt = "status icon",
  iconClassName = "",
  title,
  titleColor = "#CB1A1A",
  titleStyle = {},
  messages = [],
  overlayClassName = "",
  homeLabel = "Go to Home",
  loginLabel = "Go to Login",
}) => {
  const navigate = useNavigate();
  const hasToken = tokenManager.hasToken();
  const returnToOpener = hasOpenerTab();

  const handleGoBack = () => {
    if (returnToOpenerTab()) return;
    navigate(hasToken ? "/home" : "/");
  };

  return (
    <div className={`signing-message-container ${overlayClassName}`}>
      <div className='message-box d-flex flex-column justify-content-center align-items-center'>
        {icon && <img src={icon} alt={iconAlt} className={iconClassName} />}
        {title && <h4 style={{ marginTop: "1rem", color: titleColor, ...titleStyle }}>{title}</h4>}
        {messages.map((msg, index) => (
          <p key={index} className='m-0'>
            {msg}
          </p>
        ))}
        <Button className='ImageDoneBtn mt-4' onClick={handleGoBack}>
          {returnToOpener || hasToken ? homeLabel : loginLabel}
        </Button>
      </div>
    </div>
  );
};

export default SigningMessage;
