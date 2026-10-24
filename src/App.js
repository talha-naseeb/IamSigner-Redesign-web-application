import React, { useState, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "@/Components/Language/i18n.js";
import { UserProvider } from "@/Context/UserContext";
import AppTourProvider from "@/Context/AppTourProvider";
import CustomToaster from "@/Components/CommonModals/CustomToast/CustomToast.js";
import UserActivityStatus from "@/StatusActivity/UserActivityStatus.js";
import AppRouter from "@/routes/AppRouter";
import { NavigationSetter } from "@/Helpers/navigation";

import { ThemeProvider } from "@/Context/ThemeContext";
import PATHS from "@/routes/paths";
import { tokenManager } from "@/services/tokenManager";
import { loadRecaptcha } from "@/utils/recaptcha";

const RecaptchaPageScope = () => {
  const { pathname } = useLocation();
  const isAuthPage =
    [PATHS.login, PATHS.signup, PATHS.forgotPassword].includes(pathname) ||
    pathname.startsWith("/ChangingPassword/id/");

  useEffect(() => {
    document.body.classList.toggle("recaptcha-auth-page", isAuthPage);
    if (isAuthPage) {
      loadRecaptcha().catch(() => {});
    }
    return () => document.body.classList.remove("recaptcha-auth-page");
  }, [isAuthPage]);

  return null;
};

function App() {
  const [isToken, setIsToken] = useState(tokenManager.hasToken());

  useEffect(() => {
    // Subscribe to in-app token changes
    const unsubscribe = tokenManager.subscribe((token, isAuthenticated) => {
      setIsToken(isAuthenticated);
    });

    // Also listen to storage events across tabs
    const handleStorageChange = () => {
      setIsToken(tokenManager.hasToken());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogin = (token) => {
    if (tokenManager.getToken() !== token) {
      tokenManager.setToken(token);
    }
    setIsToken(true);
  };

  return (
    <BrowserRouter>
      <RecaptchaPageScope />
      <NavigationSetter />
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <UserProvider>
            <AppTourProvider>
              <CustomToaster />
              {isToken && <UserActivityStatus />}
              <AppRouter onLogin={handleLogin} />
            </AppTourProvider>
          </UserProvider>
        </ThemeProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
}

export default App;
