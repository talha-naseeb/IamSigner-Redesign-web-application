import React from "react";
import { useTheme } from "@/Context/ThemeContext";
import { Icons } from "@/assets/Icons/index";
import { useTranslation } from "react-i18next";

const AuthThemeToggle = ({ style }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const nextThemeLabel = theme === "dark" ? t("header.switchToLightMode", "Switch to light mode") : t("header.switchToDarkMode", "Switch to dark mode");

  return (
    <div className='auth-theme-toggle d-flex align-items-center' style={style}>
      <button
        type='button'
        onClick={toggleTheme}
        aria-label={nextThemeLabel}
        aria-pressed={theme === "dark"}
        title={nextThemeLabel}
      >
        {theme === "dark" ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
      </button>
    </div>
  );
};

export default AuthThemeToggle;
