import React from "react";
import { useTranslation } from "react-i18next";

const MostActiveUsers = ({ users = [] }) => {
  const { t } = useTranslation();

  return (
    <div className="admin-active-users-list">
      {users.length === 0 ? (
        <p className="admin-mini-meta">{t("adminDashboard.noUserData")}</p>
      ) : null}
      {users.map((user) => (
        <div key={`${user.name}-${user.role}`} className="admin-active-user-row">
          <div className="admin-active-user-left">
            <div className="admin-active-avatar">
              {user.name?.slice(0, 2)?.toUpperCase() || "NA"}
            </div>
            <div>
              <h6>{user.name}</h6>
              <p>
                {user.role} • {user.lastActivity}
              </p>
            </div>
          </div>
          <div className="admin-active-user-right">
            <span
              className={`admin-user-status ${
                user.isActive ? "active" : "inactive"
              }`}
            >
              {user.isActive
                ? t("adminDashboard.activeUsers")
                : t("adminDashboard.inactiveUsers")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MostActiveUsers;
