import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

function LangSelector({ style }) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    sessionStorage.setItem("appLanguage", lng);
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
    document.body.classList.toggle("rtl", lng === "ar");
  };

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("appLanguage");
    const language = savedLanguage === "ar" || savedLanguage === "en" ? savedLanguage : currentLanguage;
    if (language !== i18n.language) i18n.changeLanguage(language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.body.classList.toggle("rtl", language === "ar");
  }, [i18n, currentLanguage]);

  const nextLanguage = currentLanguage === "ar" ? "en" : "ar";
  const label = currentLanguage === "ar" ? "EN" : "عربي";

  return (
    <div className='flex items-center flex-none' style={style}>
      <button
        type='button'
        className='inline-flex min-w-[48px] min-h-[38px] items-center justify-center px-3 py-1.5 border border-[var(--modern-border-strong)] rounded-xl bg-[color-mix(in_srgb,var(--modern-violet)_8%,var(--modern-card))] text-[var(--modern-violet)] font-bold text-[0.82rem] leading-none cursor-pointer transition-colors hover:border-[var(--modern-violet)] hover:bg-[var(--modern-violet-soft)] focus-visible:outline-2 focus-visible:outline-[var(--modern-violet)] focus-visible:outline-offset-2 motion-reduce:transition-none'
        aria-label={nextLanguage === "ar" ? "Switch to Arabic" : "Switch to English"}
        onClick={() => changeLanguage(nextLanguage)}
      >
        {label}
      </button>
    </div>
  );
}

export default LangSelector;
