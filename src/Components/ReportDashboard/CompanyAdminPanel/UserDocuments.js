import React, { useMemo } from "react";
import "./style.css";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "@/Context/ThemeContext";

const getCssVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const UserDocuments = ({ documentMetrics = [] }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activeDocumentMetrics = documentMetrics.filter((doc) => doc.value > 0);
  const totalDocs = documentMetrics.reduce((sum, doc) => sum + doc.value, 0);

  const textPrimary = getCssVar("--modern-text", theme === "dark" ? "#e9e8f5" : "#201b32");
  const textSecondary = getCssVar("--modern-muted", theme === "dark" ? "#9a98b8" : "#756f89");
  const cardBg = getCssVar("--modern-card", theme === "dark" ? "#12102a" : "#ffffff");

  const metricColors = useMemo(
    () => ({
      completedCount: getCssVar("--modern-success", "#16a34a"),
      pendingCount: getCssVar("--modern-warning", "#f59e0b"),
      draftCount: getCssVar("--modern-blue", "#4c8bff"),
      sharedCount: getCssVar("--modern-cyan", "#078b99"),
      declineCount: getCssVar("--modern-danger", "#ef4444"),
      recalledCount: getCssVar("--modern-pink", "#d8509b"),
      inActiveCount: getCssVar("--modern-muted", "#756f89"),
    }),
    [theme]
  );

  const getMetricColor = (metric) => metricColors[metric.key] || metric.color;

  const chartOptions = useMemo(() => {
    const series = activeDocumentMetrics.map((doc) => doc.value);
    const labels = activeDocumentMetrics.map((doc) => doc.label);
    const colors = activeDocumentMetrics.map(getMetricColor);

    return {
      chart: {
        type: "donut",
        fontFamily: "inherit",
        toolbar: { show: false },
        background: "transparent",
        foreColor: textSecondary,
      },
      labels,
      colors,
      dataLabels: { enabled: false },
      stroke: { width: 2, colors: [cardBg] },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "72%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "12px",
                color: textSecondary,
                offsetY: 18,
              },
              value: {
                show: true,
                fontSize: "22px",
                fontWeight: 700,
                color: textPrimary,
                offsetY: -8,
                formatter: (val) => val,
              },
              total: {
                show: true,
                label: t("UserDocs.totalDocs", "Total Documents"),
                fontSize: "11px",
                fontWeight: 500,
                color: textSecondary,
                formatter: () => totalDocs,
              },
            },
          },
        },
      },
      legend: { show: false },
      tooltip: {
        theme: theme === "dark" ? "dark" : "light",
        y: {
          formatter: (val) => `${val} documents`,
        },
      },
      series,
    };
  }, [activeDocumentMetrics, cardBg, metricColors, t, textPrimary, textSecondary, theme, totalDocs]);

  if (activeDocumentMetrics.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[var(--modern-muted)]">
        <p className="m-0">{t("dashboardCardStatuses.notDocsFound", "No documents found.")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Chart */}
      <div className="w-full lg:w-1/2 flex items-center justify-center min-w-[220px]">
        <ReactApexChart
          options={chartOptions}
          series={chartOptions.series}
          type="donut"
          height={230}
          width="100%"
        />
      </div>

      {/* Legend list */}
      <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {documentMetrics.map((doc) => (
          <div
            key={doc.key}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border)]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getMetricColor(doc) }}
              />
              <span className="text-xs font-medium text-[var(--modern-muted)] truncate">
                {doc.label}
              </span>
            </div>
            <strong className="text-xs font-bold text-[var(--modern-text)] shrink-0 ml-2">
              {doc.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDocuments;
