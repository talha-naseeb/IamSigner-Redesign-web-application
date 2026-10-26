import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/Components/UI/shadcnCompat";
import { hasOpenerTab, returnToOpenerTab } from "@/Helpers/openerTab";
import { tokenManager } from "@/services/tokenManager";
import { Icons } from "@/assets/Icons";
import AuthThemeToggle from "@/Components/Auth/AuthThemeToggle";
import { useTheme } from "@/Context/ThemeContext";

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
  titleColor = "var(--color-danger)",
  titleStyle = {},
  messages = [],
  overlayClassName = "",
  homeLabel = "Go to Home",
  loginLabel = "Go to Login",
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const hasToken = tokenManager.hasToken();
  const returnToOpener = hasOpenerTab();

  const isSuccess =
    iconClassName.includes("success") ||
    String(titleColor).toLowerCase() === "#24b032" ||
    String(titleColor).toLowerCase() === "var(--color-success)";

  const resolvedTitleColor = isSuccess ? "var(--color-success, #10b981)" : "var(--color-danger, #ef4444)";
  const badgeStyle = isSuccess
    ? {
        background: "var(--color-success-bg, rgba(16, 185, 129, 0.12))",
        borderColor: "color-mix(in srgb, var(--color-success, #10b981) 28%, transparent)",
      }
    : {
        background: "var(--color-danger-bg, rgba(239, 68, 68, 0.12))",
        borderColor: "color-mix(in srgb, var(--color-danger, #ef4444) 28%, transparent)",
      };

  const handleGoBack = () => {
    if (returnToOpenerTab()) return;
    navigate(hasToken ? "/home" : "/");
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 bg-[var(--modern-bg,#f7f5ff)] text-[var(--modern-text,#201b32)] ${overlayClassName}`}
      style={{
        background:
          "radial-gradient(ellipse at 18% 12%, var(--modern-glow-violet), transparent 42%), radial-gradient(ellipse at 82% 86%, var(--modern-glow-blue), transparent 38%), var(--modern-bg)",
      }}
    >
      <div className='w-full max-w-[460px] rounded-3xl border border-solid border-[var(--modern-border)] bg-[var(--modern-card)] p-7 sm:p-9 flex flex-col items-center text-center'>
        <div className='w-full flex items-center justify-between gap-3 mb-7'>
          <Link to={hasToken ? "/home" : "/"} className='inline-flex items-center'>
            {theme === "dark" ? (
              <Icons.IamSignerLightMode style={{ height: "42px", width: "132px" }} />
            ) : (
              <Icons.StepperLogo style={{ height: "42px", width: "132px" }} />
            )}
          </Link>
          <AuthThemeToggle />
        </div>

        {icon && (
          <div
            className='mb-5 inline-flex h-[76px] w-[76px] items-center justify-center rounded-full border border-solid'
            style={badgeStyle}
          >
            <img src={icon} alt={iconAlt} className={`h-10 w-10 object-contain ${iconClassName}`} />
          </div>
        )}

        {title && (
          <h1
            className='text-2xl font-bold tracking-tight mb-3'
            style={{ color: resolvedTitleColor, ...titleStyle }}
          >
            {title}
          </h1>
        )}

        <div className='space-y-2 mb-7 max-w-[360px]'>
          {messages.map((msg, index) => (
            <p key={index} className='text-[15px] text-[var(--modern-muted,#756f89)] leading-relaxed m-0'>
              {msg}
            </p>
          ))}
        </div>

        <Button
          variant='primary'
          onClick={handleGoBack}
          className='w-full min-h-[48px] px-4 py-[11px] rounded-[var(--radius-md,12px)] justify-center text-[15px] font-semibold text-white border border-transparent shadow-none'
          style={{
            background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
          }}
        >
          {returnToOpener || hasToken ? homeLabel : loginLabel}
        </Button>
      </div>
    </div>
  );
};

export default SigningMessage;
