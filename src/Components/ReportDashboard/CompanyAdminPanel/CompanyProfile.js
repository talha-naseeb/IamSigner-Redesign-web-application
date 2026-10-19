import React from "react";
import AdminHome from "./AdminHome";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { useUser } from "@/Context/UserContext";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import "./style.css";

function CompanyProfile() {
  const { user, userAccess, loading: userLoading } = useUser();
  const { t } = useTranslation();
  const { accountId } = useParams();
  const remainingDays = Number(userAccess?.remainingDays);
  const accessReady = !userLoading && Boolean(user?.AccountType);
  const isAdmin = Number(user?.RoleID) === 1;
  const isOwnAccount = String(accountId || "") === String(user?.AccountID || "");
  const hasAccess =
    user?.AccountType === "B" &&
    isAdmin &&
    isOwnAccount &&
    Number.isFinite(remainingDays) &&
    remainingDays > 0;
  const isExpired = Number.isFinite(remainingDays) && remainingDays <= 0;

  if (!accessReady) {
    return (
      <div className="company-profile-page">
        <div className="admin-dashboard-shell">
          <div className="admin-dashboard-grid admin-dashboard-grid--loading">
            <div className="admin-kpi-strip">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="admin-kpi-item admin-skeleton-card">
                  <div className="admin-skeleton-line short" />
                  <div className="admin-skeleton-line" />
                  <div className="admin-skeleton-line tiny" />
                </div>
              ))}
            </div>
            <div className="admin-chart-card admin-skeleton-panel" />
            <div className="admin-chart-card admin-skeleton-panel" />
            <div className="admin-chart-card admin-skeleton-panel" />
            <div className="admin-chart-card admin-skeleton-panel" />
          </div>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="company-profile-page">
        <AdminHome />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="company-profile-page">
        <UserLisence />
      </div>
    );
  }

  return (
    <div className="company-profile-page">
      <div className="admin-no-access">
        <h4>{t("adminDashboard.noAccessTitle")}</h4>
        <p>{t("adminDashboard.noAccessDescription")}</p>
      </div>
    </div>
  );
}

export default CompanyProfile;
