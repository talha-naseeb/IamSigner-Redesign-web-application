import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import documentService from "@/services/documentService";

const DashboardCard = ({ compact = false }) => {
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const pathToCardMap = {
    "/pending-with-me": "pending-with-me",
    "/pending-with-others": "pending-with-others",
    "/completed": "completed-status",
    "/drafts": "drafts",
    "/shared-with-me": "shared-with-me",
    "/shared-with-others": "shared-with-others",
    "/declined": "declined",
    "/inactive": "inactive-docs",
    "/recalled": "recall-docs",
  };
  const activeCard = pathToCardMap[location.pathname] || null;

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        const response = await documentService.getDashboardDocumentCounts();

        if (response.data.successStatus) {
          setCounts(response.data.response || {});
        } else {
          console.error("API request failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Dashboard cards configuration with semantic colors
  const cardConfig = [
    {
      id: "pending-with-me",
      path: "/pending-with-me",
      className: "pending-card",
      iconComponent: <Icons.Pending size={compact ? 20 : 22} color='var(--modern-violet)' />,
      statusColor: "var(--modern-violet)",
      title: t("menuButtons.pendingWithMe", "Pending with me"),
      description: t("menuButtons.allDocPwithme", "Documents requiring your action"),
      count: counts.pendingWithMeCount,
    },
    {
      id: "pending-with-others",
      path: "/pending-with-others",
      className: "pending-others-card",
      iconComponent: <Icons.Pending size={compact ? 20 : 22} color='#f59e0b' />,
      statusColor: "#f59e0b",
      title: t("menuButtons.pendingWithOthers", "Pending with others"),
      description: t("menuButtons.allDocPwithother", "Documents waiting on other signers"),
      count: counts.pendingWithOthersCount,
    },
    {
      id: "completed-status",
      path: "/completed",
      className: "completed-card",
      iconComponent: <Icons.Completed size={compact ? 20 : 22} color='#10b981' />,
      statusColor: "#10b981",
      title: t("menuButtons.completed", "Completed"),
      description: t("menuButtons.allDoCompleted", "Fully executed agreements"),
      count: counts.completedCount,
    },
    {
      id: "drafts",
      path: "/drafts",
      className: "draft-card",
      iconComponent: <Icons.Draft size={compact ? 18 : 20} color='#4c8bff' />,
      statusColor: "#4c8bff",
      title: t("menuButtons.draft", "Drafts"),
      description: t("menuButtons.allDocDraft", "Unsent prepared documents"),
      count: counts.draftCount,
    },
    {
      id: "recall-docs",
      path: "/recalled",
      className: "recall-card",
      iconComponent: <Icons.Recall size={compact ? 18 : 20} color='#06b6d4' />,
      statusColor: "#06b6d4",
      title: t("menuButtons.recall", "Recalled"),
      description: t("menuButtons.allDocRecall", "Recalled agreements"),
      count: counts.recalledCount,
    },
    {
      id: "inactive-docs",
      path: "/inactive",
      className: "inactive-card",
      iconComponent: <Icons.Inactive size={compact ? 18 : 20} color='#64748b' />,
      statusColor: "#64748b",
      title: t("menuButtons.inactive", "Inactive"),
      description: t("menuButtons.allDocInactive", "Expired or voided documents"),
      count: counts.inActiveCount,
    },
  ];

  return (
    <div className={`dashboard-cards-section w-full m-0 ${compact ? "dashboard-cards-section--compact" : ""}`}>
      <nav
        className={`dashboard-statuses w-full m-0 ${
          compact
            ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
        }`}
        aria-label={t("Sidebar.DocumentStatus")}
      >
        {cardConfig.map((card) => {
          const isActive = activeCard === card.id;
          return (
            <Link
              key={card.id}
              to={card.path}
              className={`dashboard-stat-card ${card.className} group relative flex flex-col justify-between items-stretch w-full rounded-2xl border text-left rtl:text-right no-underline transition-all duration-200 ${
                compact ? "min-h-[94px] p-3.5 gap-2.5" : "min-h-[110px] p-4 sm:p-4.5 gap-3"
              } ${
                isActive
                  ? "active border-[var(--status-color,var(--modern-violet))] bg-[var(--modern-raised,#f8fafc)]"
                  : "border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)]"
              }`}
              style={{ "--status-color": card.statusColor }}
              aria-current={isActive ? "page" : undefined}
            >
              <div className='dashboard-stat-card-heading flex items-center justify-between gap-3 w-full'>
                <div
                  className={`CardIconsDiv inline-flex items-center justify-center shrink-0 rounded-xl p-2 transition-transform duration-150 group-hover:scale-105 ${
                    compact ? "w-9 h-9" : "w-10 h-10"
                  }`}
                  style={{
                    backgroundColor: `color-mix(in srgb, ${card.statusColor} 12%, var(--modern-card, #ffffff))`,
                    color: card.statusColor,
                  }}
                  aria-hidden='true'
                >
                  {card.iconComponent}
                </div>
                <span
                  className={`dashboard-stat-count font-bold tabular-nums text-[var(--modern-text,#0f172a)] leading-none tracking-tight ${
                    compact ? "text-[22px]" : "text-[26px]"
                  }`}
                >
                  {card.count ?? 0}
                </span>
              </div>
              <div className='dashboard-stat-copy min-w-0 w-full text-left rtl:text-right'>
                <p className='dashboard-stat-title m-0 text-xs md:text-sm font-semibold text-[var(--modern-text,#0f172a)] truncate leading-snug'>
                  {card.title}
                </p>
                {!compact && (
                  <p className='dashboard-stat-description mt-1 mb-0 text-xs text-[var(--modern-muted,#64748b)] truncate leading-normal'>
                    {card.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardCard;

