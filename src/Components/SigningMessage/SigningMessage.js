import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/UI/shadcnCompat";
import { hasOpenerTab, returnToOpenerTab } from "@/Helpers/openerTab";
import { tokenManager } from "@/services/tokenManager";

/**
 * Shared dynamic status-message screen for the signing flows.
 * One component replaces the previously duplicated
 * SignedMessage / LinkExpire / DeclinedMessage / DocumentRecalled / DocumentLoadError
 * layouts — pass icon, title and messages dynamically.
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
    <div className={`min-h-screen w-full flex items-center justify-center p-4 bg-[var(--modern-bg,#f8fafc)] text-[var(--modern-text,#0f172a)] ${overlayClassName}`}>
      <div className='w-full max-w-md rounded-2xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] p-8 sm:p-10 flex flex-col items-center text-center shadow-none'>
        {icon && (
          <div className='mb-4 flex items-center justify-center'>
            <img src={icon} alt={iconAlt} className={`h-16 w-16 object-contain ${iconClassName}`} />
          </div>
        )}
        {title && (
          <h1
            className='text-2xl font-bold tracking-tight mb-3'
            style={{ color: titleColor, ...titleStyle }}
          >
            {title}
          </h1>
        )}
        <div className='space-y-2 mb-6'>
          {messages.map((msg, index) => (
            <p key={index} className='text-sm text-[var(--modern-muted,#64748b)] leading-relaxed m-0'>
              {msg}
            </p>
          ))}
        </div>
        <Button
          variant='primary'
          size='lg'
          className='w-full justify-center font-medium shadow-none'
          onClick={handleGoBack}
        >
          {returnToOpener || hasToken ? homeLabel : loginLabel}
        </Button>
      </div>
    </div>
  );
};

export default SigningMessage;
