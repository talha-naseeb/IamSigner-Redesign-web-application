import React, { useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "../../assets/Icons/index";
import NavDropdown from "react-bootstrap/NavDropdown";
import "./LanguageSelector.css";

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
    <Dropdown className='language-selector'>
      <Dropdown.Toggle style={{ padding: "0px", border: "none" }} variant='none' id='dropdownMenuButton4'>
        <div style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "5px" }}>
          <Icons.Language size={20} />
          <span>{t("header.language")}</span>
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ left: "auto", right: 0, minWidth: "unset", padding: "0px" }}>
        <Dropdown.Item onClick={() => changeLanguage("en")}>{t("languageSelector.english")}</Dropdown.Item>
        <NavDropdown.Divider />
        <Dropdown.Item onClick={() => changeLanguage("ar")}>{t("languageSelector.arabic")}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default LanguageSelector;
