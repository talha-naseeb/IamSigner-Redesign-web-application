import React, { useMemo, useState } from "react";
import "./style.css";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { DateObject } from "react-multi-date-picker";
import UserDocuments from "./UserDocuments";
import ActiveAccounts from "./ActiveAccounts";
import {
  getDefaultLifecycleDateRange,
  useAdminDashboardData,
} from "./hooks/useAdminDashboardData";
import ReactApexChart from "react-apexcharts";
import MostActiveUsers from "./MostActiveUsers";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { useTheme } from "@/Context/ThemeContext";

const getCssVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const ChartCard = ({ title, subtitle, children, actions, className = "" }) => (
  <section className={`admin-chart-card ${className}`.trim()}>
    <div className="admin-chart-card-header">
      <div>
        <h4 className="admin-chart-card-title">{title}</h4>
        {subtitle ? <p className="admin-chart-card-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
    <div>{children}</div>
  </section>
);

const AdminHome = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const accountId = user?.AccountID;
  const [lifecycleDateRange, setLifecycleDateRange] = useState(getDefaultLifecycleDateRange);
  const {
    loading,
    docsLoading,
    error,
    hasAnyData,
    documentMetrics,
    lifecycleDocumentMetrics,
    userMetrics,
    departmentMetrics,
    roleBreakdown,
    mostActiveUsers,
    folderSize,
  } = useAdminDashboardData({
    accountId,
    t,
    fromDate: lifecycleDateRange.fromDate,
    toDate: lifecycleDateRange.toDate,
  });

  const lifecyclePickerValue =
    lifecycleDateRange.fromDate && lifecycleDateRange.toDate
      ? [new DateObject(lifecycleDateRange.fromDate), new DateObject(lifecycleDateRange.toDate)]
      : [];

  const handleLifecycleDateChange = (dates) => {
    if (dates?.length === 2 && dates[0] && dates[1]) {
      setLifecycleDateRange({
        fromDate: dates[0].format("YYYY-MM-DD"),
        toDate: dates[1].format("YYYY-MM-DD"),
      });
      return;
    }

    setLifecycleDateRange({ fromDate: "", toDate: "" });
  };

  const totalUsersMetric =
    userMetrics.find((metric) => metric.label === t("UserDocs.totalUsers"))
      ?.value || 0;
  const activeUsers = userMetrics
    .filter(
      (metric) =>
        metric.label !== t("UserDocs.totalUsers") &&
        metric.label !== t("adminDashboard.inactiveUsers")
    )
    .reduce((sum, metric) => sum + metric.value, 0);
  const inactiveUsers =
    userMetrics.find(
      (metric) => metric.label === t("adminDashboard.inactiveUsers")
    )?.value || 0;
  const totalDocuments = documentMetrics.reduce(
    (sum, metric) => sum + metric.value,
    0
  );
  const lifecycleTotalDocuments = lifecycleDocumentMetrics.reduce(
    (sum, metric) => sum + metric.value,
    0
  );
  const completedDocs =
    documentMetrics.find((metric) => metric.key === "completedCount")?.value ||
    0;
  const pendingDocs =
    documentMetrics.find((metric) => metric.key === "pendingCount")?.value || 0;
  const sharedDocs =
    documentMetrics.find((metric) => metric.key === "sharedCount")?.value || 0;
  const completionRate =
    totalDocuments > 0 ? Math.round((completedDocs / totalDocuments) * 100) : 0;

  const textSecondary = getCssVar("--text-secondary", theme === "dark" ? "#94a3b8" : "#6c757d");
  const borderColor = getCssVar("--border-color", theme === "dark" ? "#334155" : "#e2e8f0");

  const departmentChartSeries = [
    {
      name: t("adminDashboard.departmentUsersSeries"),
      data: departmentMetrics.map((item) => item.count),
    },
  ];

  const departmentChartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        background: "transparent",
        foreColor: textSecondary,
      },
      colors: ["#2ca581"],
      dataLabels: { enabled: false },
      xaxis: {
        categories: departmentMetrics.map((item) => item.name),
        labels: {
          rotate: 0,
          style: { colors: textSecondary },
        },
        axisBorder: { color: borderColor },
        axisTicks: { color: borderColor },
      },
      yaxis: {
        title: {
          text: t("UserDocs.totalUsers"),
          style: { color: textSecondary },
        },
        labels: {
          style: { colors: textSecondary },
        },
      },
      legend: { show: false },
      plotOptions: {
        bar: { borderRadius: 4, horizontal: true, columnWidth: "60%" },
      },
      grid: { borderColor, strokeDashArray: 3 },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
      },
    }),
    [borderColor, departmentMetrics, t, textSecondary, theme]
  );

  return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-hero">
        <div>
          <p className="admin-eyebrow">{t("adminDashboard.adminOverview")}</p>
          <h3 className="admin-hero-title">
            {t("home.welcomeAdminPanel")} {user?.fullName}!
          </h3>
          <p className="start-text admin-hero-subtitle">
            {t("home.ManageData")}{" "}
            <span className="fw-bold">{t("home.IamSigner")}</span>
          </p>
        </div>
      </div>

      {error ? (
        <div className="admin-dashboard-message error">{error}</div>
      ) : null}
      {!loading && !error && !hasAnyData ? (
        <div className="admin-dashboard-message">
          {t("adminDashboard.emptyState")}
        </div>
      ) : null}

      {loading ? (
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
      ) : null}

      {!loading && !error && hasAnyData ? (
        <div className="admin-dashboard-grid">
          <div className="admin-kpi-strip">
            <div className="admin-kpi-item">
              <p>{t("UserDocs.totalDocs")}</p>
              <h4>{totalDocuments}</h4>
              <small>
                {sharedDocs} {t("UserDocs.ShareDocs").toLowerCase()}
              </small>
            </div>
            <div className="admin-kpi-item">
              <p>{t("adminDashboard.completionRate")}</p>
              <h4>{completionRate}%</h4>
              <small>
                {completedDocs} {t("viewDetails.completed").toLowerCase()}
              </small>
            </div>
            <div className="admin-kpi-item">
              <p>{t("adminDashboard.pendingSignature")}</p>
              <h4>{pendingDocs}</h4>
              <small>
                {documentMetrics.find((metric) => metric.key === "draftCount")
                  ?.value || 0}{" "}
                {t("viewDetails.draft").toLowerCase()}
              </small>
            </div>
            <div className="admin-kpi-item">
              <p>{t("adminDashboard.teamMembers")}</p>
              <h4>{totalUsersMetric}</h4>
              <small>
                {activeUsers} {t("adminDashboard.activeUsers").toLowerCase()} •{" "}
                {inactiveUsers}{" "}
                {t("adminDashboard.inactiveUsers").toLowerCase()}
              </small>
            </div>
            <div className="admin-kpi-item">
              <p>{t("adminDashboard.accountStorage")}</p>
              <h4>{folderSize?.readableSize || "0 KB"}</h4>
              <small>
                {folderSize?.totalSize != null
                  ? t("adminDashboard.storageBytes", {
                      bytes: Number(folderSize.totalSize).toLocaleString(),
                    })
                  : t("adminDashboard.storageUsed")}
              </small>
            </div>
          </div>

          <ChartCard
            title={t("adminDashboard.usersByRole")}
            subtitle={`${activeUsers} ${t(
              "adminDashboard.activeUsers"
            )} • ${inactiveUsers} ${t("adminDashboard.inactiveUsers")}`}
          >
            <ActiveAccounts roleBreakdown={roleBreakdown} />
          </ChartCard>

          <ChartCard
            title={t("adminDashboard.documentLifecycle")}
            subtitle={`${lifecycleTotalDocuments} ${t(
              "adminDashboard.documentsTracked"
            )}`}
            actions={
              <div className="admin-activity-date-picker">
                <DateRangePicker
                  value={lifecyclePickerValue}
                  onChange={handleLifecycleDateChange}
                  placeholder={t("searchFilter.FilterRange")}
                  numberOfMonths={1}
                  portal
                  zIndex={1200}
                />
              </div>
            }
          >
            {docsLoading ? (
              <div className="admin-widget-content admin-activity-loading">
                {t("adminDashboard.loadingActivity")}
              </div>
            ) : (
              <UserDocuments documentMetrics={lifecycleDocumentMetrics} />
            )}
          </ChartCard>

          <ChartCard
            title={t("adminDashboard.departmentHeadcount")}
            subtitle={t("adminDashboard.membersPerDepartment")}
          >
            {departmentMetrics.length > 0 ? (
              <ReactApexChart
                options={departmentChartOptions}
                series={departmentChartSeries}
                type="bar"
                height={300}
              />
            ) : (
              <div className="admin-fallback-widget">
                <h5 className="admin-fallback-title">
                  {t("adminDashboard.departmentAnalytics")}
                </h5>
                <p className="admin-fallback-message">
                  {t("adminDashboard.noDepartmentData")}
                </p>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title={t("adminDashboard.mostActiveUsers")}
            subtitle={t("adminDashboard.activeTeamMembers")}
          >
            <MostActiveUsers users={mostActiveUsers} />
          </ChartCard>
        </div>
      ) : null}
    </div>
  );
};

export default AdminHome;
