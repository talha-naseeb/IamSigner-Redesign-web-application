import React from "react";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import "./style.css";
import { Accordion } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function DaysToExpire() {
  const { user, userAccess = {} } = useUser();
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const totalDays = Number(userAccess.totalDays) || 0;
  const remainingDays = Number(userAccess.remainingDays) || 0;
  const progressPercent = totalDays > 0 ? Math.max(0, Math.min(100, Math.round((remainingDays / totalDays) * 100))) : 0;

  return (
    <div className='subscribed-plan-details-wrapper'>
      <Accordion defaultActiveKey='0' className='cobranding-accordion my-3'>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>
            <div className='d-flex align-items-center gap-3 w-100 me-3'>
              <div className='cobranding-icon-pill'>
                <Icons.PricingPlan size={22} />
              </div>
              <div className='d-flex align-items-center justify-content-between flex-grow-1 flex-wrap gap-2'>
                <span className='cobranding-title-text'>{t("DaysToExpire.SubscribedPlanDetail")}</span>
                {userAccess.packageName && (
                  <span className='plan-banner-badge'>
                    <Icons.Check size={14} />
                    {userAccess.packageName}
                  </span>
                )}
              </div>
            </div>
          </Accordion.Header>

          <Accordion.Body>
            {/* Top Plan Overview Banner */}
            <div className='plan-overview-banner'>
              <div className='d-flex flex-column gap-1'>
                <div className='d-flex align-items-center gap-2 flex-wrap'>
                  <span className='fw-bold fs-5 text-dark-mode-readable'>{userAccess.packageName || t("DaysToExpire.CurrentPlan")}</span>
                  <span className='plan-banner-badge'>{t("DaysToExpire.CurrentPlan")}</span>
                </div>
                <div className='plan-banner-timeline'>
                  <Icons.DateFilled size={16} />
                  <span>
                    {t("DaysToExpire.planDays")}: {formatDate(userAccess.subscriptionStartDate)} – {formatDate(userAccess.subscriptionEndDate)}
                  </span>
                </div>
              </div>

              {/* Progress bar showing remaining days ratio */}
              <div className='plan-progress-wrapper'>
                <div className='plan-progress-header'>
                  <span>{t("DaysToExpire.DaysRemainingExpire")}</span>
                  <span className='fw-semibold'>
                    {remainingDays} / {totalDays} {t("DaysToExpire.days")} ({progressPercent}%)
                  </span>
                </div>
                <div className='plan-progress-track' role='progressbar' aria-valuenow={progressPercent} aria-valuemin='0' aria-valuemax='100'>
                  <div className='plan-progress-fill' style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* 4-Card Responsive Metric Grid */}
            <div className='plan-metrics-grid'>
              {/* Account Holder */}
              <div className='plan-metric-card'>
                <div className='plan-metric-card-header'>
                  <span className='plan-metric-label'>{t("DaysToExpire.AccountHolder")}</span>
                  <div className='plan-metric-icon'>
                    <Icons.UserFilled size={18} />
                  </div>
                </div>
                <div className='plan-metric-value'>{user?.fullName || "—"}</div>
                <div className='plan-metric-subtext'>{user?.emailID || ""}</div>
              </div>

              {/* Days Remaining */}
              <div className='plan-metric-card'>
                <div className='plan-metric-card-header'>
                  <span className='plan-metric-label'>{t("DaysToExpire.DaysRemainingExpire")}</span>
                  <div className='plan-metric-icon'>
                    <Icons.DateFilled size={18} />
                  </div>
                </div>
                <div className='plan-metric-value'>
                  {remainingDays} <span className='fs-6 fw-normal text-muted'>{t("DaysToExpire.days")}</span>
                </div>
                <div className='plan-metric-subtext'>
                  {progressPercent}% of {totalDays} {t("DaysToExpire.days")}
                </div>
              </div>

              {/* Total Days */}
              <div className='plan-metric-card'>
                <div className='plan-metric-card-header'>
                  <span className='plan-metric-label'>{t("DaysToExpire.TotalDays")}</span>
                  <div className='plan-metric-icon'>
                    <Icons.Calendar size={18} />
                  </div>
                </div>
                <div className='plan-metric-value'>
                  {totalDays} <span className='fs-6 fw-normal text-muted'>{t("DaysToExpire.days")}</span>
                </div>
                <div className='plan-metric-subtext'>{t("DaysToExpire.planDays")}</div>
              </div>

              {/* User License Limit */}
              <div className='plan-metric-card'>
                <div className='plan-metric-card-header'>
                  <span className='plan-metric-label'>{t("DaysToExpire.UserLicenseLimit")}</span>
                  <div className='plan-metric-icon'>
                    <Icons.Building size={18} />
                  </div>
                </div>
                <div className='plan-metric-value'>
                  {userAccess.numUserLicenses || "N/A"}{" "}
                  <span className='fs-6 fw-normal text-muted'>{t("DaysToExpire.users")}</span>
                </div>
                <div className='plan-metric-subtext'>{t("DaysToExpire.UserLicenseLimit")}</div>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default DaysToExpire;
