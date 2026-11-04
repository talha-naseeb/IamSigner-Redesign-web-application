import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Home, ArrowLeft, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import PATHS from "@/routes/paths";

export const Forbidden403 = ({ reason, isExpired = false, packageName }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isTrial = packageName === "Trial";

  const title = isExpired
    ? isTrial
      ? `${packageName} ${t("home.hasExpired", "has been Expired ! ReNew it")}`
      : t("home.Expire", "Your License Has Been Expired !")
    : t("errors.accessDenied", "Access Denied");

  const subtitle = isExpired
    ? reason ||
      t(
        "home.expiredDescription",
        "Your current package has reached its expiration date. Please renew or upgrade your plan to continue using this feature."
      )
    : reason ||
      t(
        "errors.forbiddenMessage",
        "You do not have permission to access this resource. Please contact your administrator if you believe this is an error."
      );

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8 bg-[var(--modern-bg,#f7f5ff)] font-sans'>
      <div
        className='max-w-[520px] w-full bg-[var(--modern-card,#ffffff)] border border-[var(--modern-border,rgba(52,40,100,0.14))] rounded-2xl p-8 sm:p-12 text-center'
        role='alert'
        aria-labelledby='forbidden-title'
      >
        <div
          className={`w-[72px] h-[72px] mx-auto mb-6 rounded-full flex items-center justify-center border border-[var(--modern-border,rgba(52,40,100,0.14))] ${
            isExpired
              ? "bg-[var(--modern-danger-soft,rgba(239,68,68,0.1))] text-[var(--modern-danger,#ef4444)]"
              : "bg-[var(--modern-violet-soft,rgba(115,87,220,0.1))] text-[var(--modern-violet,#7357dc)]"
          }`}
          aria-hidden='true'
        >
          {isExpired ? <AlertTriangle size={32} /> : <Lock size={32} />}
        </div>
        <div
          className={`text-sm font-bold tracking-widest uppercase mb-2 ${
            isExpired
              ? "text-[var(--modern-danger,#ef4444)]"
              : "text-[var(--modern-violet,#7357dc)]"
          }`}
        >
          {isExpired
            ? t("home.licenseStatus", "Subscription Notice")
            : "403 Forbidden"}
        </div>
        <h1
          id='forbidden-title'
          className='text-2xl sm:text-3xl font-bold text-[var(--modern-text,#201b32)] mb-3 leading-tight'
        >
          {title}
        </h1>
        <p className='text-sm sm:text-base text-[var(--modern-muted,#756f89)] leading-relaxed mb-8'>
          {subtitle}
        </p>
        <div className='flex flex-col sm:flex-row justify-center gap-3'>
          <button
            type='button'
            className='inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 px-6 py-[11px] bg-transparent hover:bg-[var(--modern-raised)] text-[var(--modern-text)] border border-[var(--modern-border-strong)] rounded-[var(--radius-md,12px)] font-semibold text-[15px] cursor-pointer no-underline transition-colors focus-visible:outline-2 focus-visible:outline-[var(--modern-primary,#4d8dff)] focus-visible:outline-offset-2'
            onClick={() => navigate(-1)}
            aria-label='Go back to previous page'
          >
            <ArrowLeft aria-hidden='true' size={18} className='rtl:rotate-180' />
            <span>{t("common.goBack", "Go Back")}</span>
          </button>
          <Link
            to={PATHS.home}
            className='inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 px-6 py-[11px] text-white border border-transparent rounded-[var(--radius-md,12px)] font-semibold text-[15px] cursor-pointer no-underline transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-[var(--modern-primary,#4d8dff)] focus-visible:outline-offset-2'
            style={{
              background:
                "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
            }}
            aria-label='Go to dashboard'
          >
            <Home aria-hidden='true' size={18} />
            <span>{t("Sidebar.Dashboard", "Dashboard")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden403;
