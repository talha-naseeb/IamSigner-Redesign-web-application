import React, { useEffect } from "react";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "../../assets/Icons/index";
import { NavDropdown as NavDropdown } from "@/Components/UI/shadcnCompat";
function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    sessionStorage.setItem("appLanguage", lng);

    const dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
    document.body.classList.toggle("rtl", lng === "ar");
  };

  // when app loads
  useEffect(() => {
    const savedLang = sessionStorage.getItem("appLanguage") || "en";
    changeLanguage(savedLang);
  }, []);

  return (
    <Dropdown className='relative inline-flex items-center [&_.dropdown-toggle]:flex [&_.dropdown-toggle]:items-center [&_.dropdown-toggle]:leading-none [&_.dropdown-toggle::after]:hidden'>
      <Dropdown.Toggle className='p-0 border-0 bg-transparent flex items-center cursor-pointer' variant='none' id='dropdownMenuButton4'>
        <div className='text-[var(--modern-text)] flex items-center gap-1.5 text-sm whitespace-nowrap leading-none'>
          <Icons.Language size={20} />
          <span>{t("header.language")}</span>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className='right-0 left-auto min-w-[120px] p-1 bg-[var(--modern-card)] border border-[var(--modern-border)] rounded-lg shadow-sm'>
        <Dropdown.Item onClick={() => changeLanguage("en")}>{t("languageSelector.english")}</Dropdown.Item>
        <NavDropdown.Divider />
        <Dropdown.Item onClick={() => changeLanguage("ar")}>{t("languageSelector.arabic")}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default LanguageSelector;
