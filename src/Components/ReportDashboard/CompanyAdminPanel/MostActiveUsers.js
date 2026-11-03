import React from "react";
import { useTranslation } from "react-i18next";
import { UserInitialsBadge } from "@/Components/UI/dataPrimitives";

const MostActiveUsers = ({ users = [] }) => {
  const { t } = useTranslation();

  if (!users || users.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[var(--modern-muted)]">
        {t("adminDashboard.noUserData", "No user activity data available.")}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--modern-border)]">
      {users.map((user) => (
        <div
          key={`${user.name}-${user.role}`}
          className="flex items-center justify-between py-3 px-1 gap-3 transition-colors hover:bg-[var(--modern-raised)]/40 rounded-lg"
        >
          <div className="flex items-center gap-3 min-w-0">
            <UserInitialsBadge name={user.name} avatarOnly className="shrink-0" />
            <div className="min-w-0">
              <h6 className="text-sm font-semibold text-[var(--modern-text)] truncate m-0 leading-tight">
                {user.name}
              </h6>
              <p className="text-xs text-[var(--modern-muted)] truncate m-0 mt-0.5">
                {user.role} {user.lastActivity ? `• ${user.lastActivity}` : ""}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                user.isActive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-[var(--modern-raised)] text-[var(--modern-muted)] border border-[var(--modern-border)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  user.isActive ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {user.isActive
                ? t("adminDashboard.activeUsers", "Active")
                : t("adminDashboard.inactiveUsers", "Inactive")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MostActiveUsers;
