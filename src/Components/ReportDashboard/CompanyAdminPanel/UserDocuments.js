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

  const textPrimary = getCssVar("--text-primary", theme === "dark" ? "#e2e8f0" : "#1f2937");
  const textSecondary = getCssVar("--text-secondary", theme === "dark" ? "#94a3b8" : "#64748b");
  const cardBg = getCssVar("--card-bg", theme === "dark" ? "#0b1120" : "#ffffff");

  const chartOptions = useMemo(() => {
    const series = activeDocumentMetrics.map((doc) => doc.value);
    const labels = activeDocumentMetrics.map((doc) => doc.label);
    const colors = activeDocumentMetrics.map((doc) => doc.color);

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
                label: t("UserDocs.totalDocs"),
                fontSize: "12px",
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
          formatter: (val) => val,
        },
      },
      series,
    };
  }, [activeDocumentMetrics, cardBg, t, textPrimary, textSecondary, theme, totalDocs]);

  if (activeDocumentMetrics.length === 0) {
    return (
      <div className='admin-lifecycle-empty'>
        <p>{t("dashboardCardStatuses.notDocsFound")}</p>
      </div>
    );
  }

  return (
    <div className='admin-widget-content'>
      <div className='admin-donut-layout'>
        <div className='admin-donut-chart'>
          <ReactApexChart options={chartOptions} series={chartOptions.series} type='donut' height={240} width='100%' />
        </div>
        <ul className='admin-lifecycle-list'>
          {documentMetrics.map((doc) => (
            <li key={doc.key} className='admin-lifecycle-item'>
              <div className='admin-lifecycle-label'>
                <span className='admin-stat-dot' style={{ backgroundColor: doc.color }} />
                <span className='admin-lifecycle-name'>{doc.label}</span>
              </div>
              <strong className='admin-lifecycle-value'>{doc.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDocuments;
