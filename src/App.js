import React, { useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "@/Components/Language/i18n.js";
import { UserProvider } from "@/Context/UserContext";
import CustomToaster from "@/Components/CommonModals/CustomToast/CustomToast.js";
import UserActivityStatus from "@/StatusActivity/UserActivityStatus.js";
import AppRouter from "@/routes/AppRouter";
import { NavigationSetter } from "@/Helpers/navigation";

import { ThemeProvider } from "@/Context/ThemeContext";
import PATHS from "@/routes/paths";

const RecaptchaPageScope = () => {
  const { pathname } = useLocation();
  const isAuthPage =
    [PATHS.login, PATHS.signup, PATHS.forgotPassword].includes(pathname) ||
    pathname.startsWith("/ChangingPassword/id/");

  useEffect(() => {
    document.body.classList.toggle("recaptcha-auth-page", isAuthPage);
    return () => document.body.classList.remove("recaptcha-auth-page");
  }, [isAuthPage]);

  return null;
};

function App() {
  const [isToken, setIsToken] = useState(!!sessionStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsToken(!!sessionStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogin = (token) => {
    sessionStorage.setItem("token", token);
    setIsToken(true);
  };

  return (
    <BrowserRouter>
      <RecaptchaPageScope />
      <NavigationSetter />
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <UserProvider>
            <CustomToaster />
            {isToken && <UserActivityStatus />}
            <AppRouter onLogin={handleLogin} />
          </UserProvider>
        </ThemeProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
}

export default App;
