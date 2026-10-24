import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import PATHS from "@/routes/paths";
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
    <div className='min-h-screen w-full flex items-center justify-center p-4 bg-[var(--modern-bg,#f8fafc)] text-[var(--modern-text,#0f172a)]'>
      <div className='w-full max-w-md rounded-2xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#fff)] p-8 sm:p-10 flex flex-col items-center text-center shadow-none'>
        <div className='mb-4 flex items-center justify-center'>
          <img src={thankyouIcon} alt='signed' className='h-16 w-16 object-contain' />
        </div>
        <h1 className='text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-3'>
          {t("signCompletedScreen.title")}
        </h1>
        <div className='mb-6'>
          <p className='text-sm text-[var(--modern-muted,#64748b)] leading-relaxed m-0'>
            {t("signCompletedScreen.message")}
          </p>
        </div>
        <Button
          variant='primary'
          size='lg'
          className='w-full justify-center font-medium shadow-none'
          onClick={handleGoToLogin}
        >
          {t("signCompletedScreen.goToLogin")}
        </Button>
      </div>
    </div>
  );
};

export default SignCompletedScreen;
