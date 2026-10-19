import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { IdleSessionTimeout } from "idle-session-timeout";
import userService from "@/services/userService";

const UserActivityStatus = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sessionTimeOut } = useUser();
  const sessionRef = useRef(null);
  const absoluteTimeoutRef = useRef(null);

  const handleLogout = async (reason = "inactivity") => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await userService.logout(null);

      if (response.data.statusCode === "1") {
        const currentTheme = localStorage.getItem("theme");
        sessionStorage.clear();
        localStorage.clear();
        if (currentTheme) {
          localStorage.setItem("theme", currentTheme);
        }
        navigate("/");

        // Show different messages based on logout reason
        if (reason === "absolute") {
          toast.info(t("uploadDocFlow.sessionExpire"));
        } else {
          toast.info(t("uploadDocFlow.sessionExpire"));
        }
      }
    } catch (error) {
      toast.error(t("menuButtons.errLogoutOut"));
    }
  };

  // Convert sessionTimeOut from minutes to milliseconds
  const getTimeoutMs = () => {
    const timeoutMinutes = Number(sessionTimeOut);
    if (!isNaN(timeoutMinutes) && timeoutMinutes > 0) {
      return Number(timeoutMinutes * 60 * 1000);
    }
    return Number(30 * 60 * 1000); // Default to 30 minutes
  };

  useEffect(() => {
    // Clear any existing timeouts
    if (sessionRef.current) {
      sessionRef.current.dispose();
    }
    if (absoluteTimeoutRef.current) {
      clearTimeout(absoluteTimeoutRef.current);
    }

    const timeoutMs = getTimeoutMs();

    // Option 1: Idle timeout (current behavior)
    sessionRef.current = new IdleSessionTimeout(timeoutMs);
    sessionRef.current.onTimeOut = () => {
      handleLogout("inactivity");
    };
    sessionRef.current.start();

    // Cleanup function
    return () => {
      if (sessionRef.current) {
        sessionRef.current.dispose();
        sessionRef.current = null;
      }
      if (absoluteTimeoutRef.current) {
        clearTimeout(absoluteTimeoutRef.current);
        absoluteTimeoutRef.current = null;
      }
    };
  }, [sessionTimeOut]);

  return null;
};

export default UserActivityStatus;
