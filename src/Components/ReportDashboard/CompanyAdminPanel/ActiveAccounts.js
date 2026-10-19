import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "@/Context/ThemeContext";

const getCssVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const ActiveAccounts = ({ roleBreakdown }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const textSecondary = getCssVar("--text-secondary", theme === "dark" ? "#94a3b8" : "#6c757d");
  const borderColor = getCssVar("--border-color", theme === "dark" ? "#334155" : "#e2e8f0");
  const inactiveColor = theme === "dark" ? "#64748b" : "#9aa4b2";

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 280,
        stacked: true,
        toolbar: { show: false },
        background: "transparent",
        foreColor: textSecondary,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "51%",
          endingShape: "rounded",
          borderRadius: 4,
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor,
        strokeDashArray: 3,
      },
      xaxis: {
        categories: roleBreakdown?.categories || [],
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: 500,
            colors: textSecondary,
          },
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
      fill: { opacity: 1 },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: textSecondary },
      },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
      },
      colors: ["#0f8f95", inactiveColor],
    }),
    [borderColor, inactiveColor, roleBreakdown?.categories, t, textSecondary, theme]
  );

  return (
    <div className='admin-widget-content'>
      <div className='admin-apex-wrapper'>
        <ReactApexChart
          options={chartOptions}
          series={[
            {
              name: t("adminDashboard.activeUsers"),
              data: roleBreakdown?.active || [],
            },
            {
              name: t("adminDashboard.inactiveUsers"),
              data: roleBreakdown?.inactive || [],
            },
          ]}
          type='bar'
          height={280}
        />
      </div>
    </div>
  );
};

export default ActiveAccounts;
