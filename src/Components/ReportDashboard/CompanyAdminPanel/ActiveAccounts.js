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

  const textSecondary = getCssVar("--modern-muted", theme === "dark" ? "#9a98b8" : "#756f89");
  const borderColor = getCssVar("--modern-border", theme === "dark" ? "rgba(190, 181, 255, 0.11)" : "rgba(52, 40, 100, 0.14)");
  const activeColor = getCssVar("--modern-violet", "#7357dc");
  const inactiveColor = getCssVar("--modern-muted", theme === "dark" ? "#9a98b8" : "#756f89");

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        toolbar: { show: false },
        background: "transparent",
        foreColor: textSecondary,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 6,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor,
        strokeDashArray: 3,
        padding: { top: 0, right: 10, bottom: 0, left: 10 },
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
        labels: {
          style: { colors: textSecondary },
        },
      },
      fill: { opacity: 1 },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        labels: { colors: textSecondary },
        markers: { radius: 6 },
      },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
      },
      colors: [activeColor, inactiveColor],
    }),
    [activeColor, borderColor, inactiveColor, roleBreakdown?.categories, textSecondary, theme]
  );

  return (
    <div className="w-full">
      <ReactApexChart
        options={chartOptions}
        series={[
          {
            name: t("adminDashboard.activeUsers", "Active Users"),
            data: roleBreakdown?.active || [],
          },
          {
            name: t("adminDashboard.inactiveUsers", "Inactive Users"),
            data: roleBreakdown?.inactive || [],
          },
        ]}
        type="bar"
        height={250}
      />
    </div>
  );
};

export default ActiveAccounts;
