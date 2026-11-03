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
      <div className="w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)]">
        <div className="w-full max-w-[1560px] mx-auto space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] animate-pulse h-28" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="p-4 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] animate-pulse h-24"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] animate-pulse h-72"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)]">
        <div className="w-full max-w-[1560px] mx-auto">
          <AdminHome />
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)]">
        <div className="w-full max-w-[1560px] mx-auto">
          <UserLisence />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)]">
      <div className="w-full max-w-[1560px] mx-auto p-12 text-center rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]">
        <h4 className="text-lg font-bold text-[var(--modern-text)] mb-2">
          {t("adminDashboard.noAccessTitle", "Company profile access unavailable")}
        </h4>
        <p className="text-sm text-[var(--modern-muted)] max-w-md mx-auto m-0">
          {t(
            "adminDashboard.noAccessDescription",
            "This account does not currently have access to the admin company dashboard."
          )}
        </p>
      </div>
    </div>
  );
}

export default CompanyProfile;
