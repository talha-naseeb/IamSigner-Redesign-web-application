import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiHome, FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import PATHS from "@/routes/paths";
import "./Forbidden403.css";

export const Forbidden403 = ({ reason }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className='forbidden-container'>
      <div className='forbidden-card' role='alert' aria-labelledby='forbidden-title'>
        <div className='forbidden-icon-wrapper' aria-hidden='true'>
          <FiLock size={32} />
        </div>
        <div className='forbidden-code'>403 Forbidden</div>
        <h1 id='forbidden-title' className='forbidden-title'>
          {t("errors.accessDenied", "Access Denied")}
        </h1>
        <p className='forbidden-desc'>
          {reason ||
            t(
              "errors.forbiddenMessage",
              "You do not have permission to access this resource. Please contact your administrator if you believe this is an error."
            )}
        </p>
        <div className='forbidden-actions'>
          <button
            type='button'
            className='forbidden-btn-primary'
            onClick={() => navigate(-1)}
            aria-label='Go back to previous page'
          >
            <FiArrowLeft aria-hidden='true' />
            <span>{t("common.goBack", "Go Back")}</span>
          </button>
          <Link to={PATHS.home} className='forbidden-btn-primary' aria-label='Go to dashboard'>
            <FiHome aria-hidden='true' />
            <span>{t("Sidebar.Dashboard", "Dashboard")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden403;
