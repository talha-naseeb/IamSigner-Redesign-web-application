import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiHome, FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import PATHS from "@/routes/paths";

export const Forbidden403 = ({ reason }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8 bg-[var(--modern-bg,#f7f5ff)] font-sans'>
      <div className='max-w-[520px] w-full bg-[var(--modern-card,#ffffff)] border border-[var(--modern-border,rgba(52,40,100,0.14))] rounded-2xl p-8 sm:p-12 text-center' role='alert' aria-labelledby='forbidden-title'>
        <div className='w-[72px] h-[72px] mx-auto mb-6 rounded-full bg-[var(--modern-violet-soft,rgba(115,87,220,0.1))] flex items-center justify-center text-[var(--modern-violet,#7357dc)] border border-[var(--modern-border,rgba(52,40,100,0.14))]' aria-hidden='true'>
          <FiLock size={32} />
        </div>
        <div className='text-sm font-bold tracking-widest uppercase text-[var(--modern-violet,#7357dc)] mb-2'>403 Forbidden</div>
        <h1 id='forbidden-title' className='text-2xl sm:text-3xl font-bold text-[var(--modern-text,#201b32)] mb-3 leading-tight'>
          {t("errors.accessDenied", "Access Denied")}
        </h1>
        <p className='text-sm sm:text-base text-[var(--modern-muted,#756f89)] leading-relaxed mb-8'>
          {reason ||
            t(
              "errors.forbiddenMessage",
              "You do not have permission to access this resource. Please contact your administrator if you believe this is an error."
            )}
        </p>
        <div className='flex flex-wrap justify-center gap-4'>
          <button
            type='button'
            className='inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--modern-violet,#7357dc)] hover:bg-[var(--modern-violet-hover,#6245cb)] text-white border border-transparent rounded-lg font-semibold text-sm cursor-pointer no-underline transition-colors focus-visible:outline-2 focus-visible:outline-[var(--modern-violet,#7357dc)] focus-visible:outline-offset-2'
            onClick={() => navigate(-1)}
            aria-label='Go back to previous page'
          >
            <FiArrowLeft aria-hidden='true' />
            <span>{t("common.goBack", "Go Back")}</span>
          </button>
          <Link
            to={PATHS.home}
            className='inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--modern-violet,#7357dc)] hover:bg-[var(--modern-violet-hover,#6245cb)] text-white border border-transparent rounded-lg font-semibold text-sm cursor-pointer no-underline transition-colors focus-visible:outline-2 focus-visible:outline-[var(--modern-violet,#7357dc)] focus-visible:outline-offset-2'
            aria-label='Go to dashboard'
          >
            <FiHome aria-hidden='true' />
            <span>{t("Sidebar.Dashboard", "Dashboard")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden403;
