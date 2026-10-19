import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./LangSelector.css";

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
    <div className='d-flex align-items-center bilingual-language-control' style={style}>
      <button
        type='button'
        className='bilingual-language-toggle'
        aria-label={nextLanguage === "ar" ? "Switch to Arabic" : "Switch to English"}
        onClick={() => changeLanguage(nextLanguage)}
      >
        {label}
      </button>
    </div>
  );
}

export default LangSelector;
