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
    <div className='min-h-[calc(100vh-120px)] w-full flex items-center justify-center p-4 bg-[var(--modern-bg,#f7f5ff)] text-[var(--modern-text,#201b32)]'>
      <div className='w-full max-w-[460px] rounded-3xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-8 sm:p-10 flex flex-col items-center text-center shadow-none'>
        <div
          className='mb-5 inline-flex h-[76px] w-[76px] items-center justify-center rounded-full border'
          style={{
            background: "var(--color-success-bg, rgba(16, 185, 129, 0.12))",
            borderColor: "color-mix(in srgb, var(--color-success, #10b981) 28%, transparent)",
          }}
        >
          <img src={thankyouIcon} alt='signed' className='h-10 w-10 object-contain' />
        </div>
        <h1
          className='text-2xl font-bold tracking-tight mb-3'
          style={{ color: "var(--color-success, #10b981)" }}
        >
          {t("signCompletedScreen.title")}
        </h1>
        <div className='mb-7 max-w-[360px]'>
          <p className='text-[15px] text-[var(--modern-muted,#756f89)] leading-relaxed m-0'>
            {t("signCompletedScreen.message")}
          </p>
        </div>
        <Button
          variant='primary'
          className='w-full min-h-[48px] px-4 py-[11px] rounded-[var(--radius-md,12px)] justify-center text-[15px] font-semibold text-white border border-transparent shadow-none'
          style={{
            background: "linear-gradient(110deg, var(--modern-action-violet), var(--modern-action-blue))",
          }}
          onClick={handleGoToLogin}
        >
          {t("signCompletedScreen.goToLogin")}
        </Button>
      </div>
    </div>
  );
};

export default SignCompletedScreen;
