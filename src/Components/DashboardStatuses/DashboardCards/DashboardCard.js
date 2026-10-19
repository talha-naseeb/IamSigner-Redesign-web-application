import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import "./DashboardCard.css";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { useTour } from "@/Context/useTour";
import Tour from "reactour";
import documentService from "@/services/documentService";

const DashboardCard = ({ compact = false }) => {
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const { isTourOpen, tourSteps, closeTour } = useTour();

  const pathToCardMap = {
    "/pending-with-me": "pending-with-me",
    "/pending-with-others": "pending-with-others",
    "/completed-status": "completed-status",
    "/drafts": "drafts",
    "/shared-with-me": "shared-with-me",
    "/shared-with-others": "shared-with-others",
    "/declined": "declined",
    "/inactive-docs": "inactive-docs",
    "/recall-docs": "recall-docs",
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
      iconComponent: <Icons.Pending size={22} color='var(--modern-violet)' />,
      statusColor: "var(--modern-violet)",
      title: t("menuButtons.pendingWithMe", "Pending with me"),
      description: t("menuButtons.allDocPwithme", "Documents requiring your action"),
      count: counts.pendingWithMeCount,
    },
    {
      id: "pending-with-others",
      path: "/pending-with-others",
      className: "pending-others-card",
      iconComponent: <Icons.Pending size={22} color='#f59e0b' />,
      statusColor: "#f59e0b",
      title: t("menuButtons.pendingWithOthers", "Pending with others"),
      description: t("menuButtons.allDocPwithother", "Documents waiting on other signers"),
      count: counts.pendingWithOthersCount,
    },
    {
      id: "completed-status",
      path: "/completed-status",
      className: "completed-card",
      iconComponent: <Icons.Completed size={22} color='#10b981' />,
      statusColor: "#10b981",
      title: t("menuButtons.completed", "Completed"),
      description: t("menuButtons.allDoCompleted", "Fully executed agreements"),
      count: counts.completedCount,
    },
    {
      id: "drafts",
      path: "/drafts",
      className: "draft-card",
      iconComponent: <Icons.Draft size={20} color='#4c8bff' />,
      statusColor: "#4c8bff",
      title: t("menuButtons.draft", "Drafts"),
      description: t("menuButtons.allDocDraft", "Unsent prepared documents"),
      count: counts.draftCount,
    },
    {
      id: "recall-docs",
      path: "/recall-docs",
      className: "recall-card",
      iconComponent: <Icons.Recall size={20} color='#06b6d4' />,
      statusColor: "#06b6d4",
      title: t("menuButtons.recall", "Recalled"),
      description: t("menuButtons.allDocRecall", "Recalled agreements"),
      count: counts.recalledCount,
    },
    {
      id: "inactive-docs",
      path: "/inactive-docs",
      className: "inactive-card",
      iconComponent: <Icons.Inactive size={20} color='#64748b' />,
      statusColor: "#64748b",
      title: t("menuButtons.inactive", "Inactive"),
      description: t("menuButtons.allDocInactive", "Expired or voided documents"),
      count: counts.inActiveCount,
    },
  ];

  return (
    <>
      <div className={`dashboard-cards-section${compact ? " dashboard-cards-section--compact" : ""}`}>
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}
        <Nav className={`dashboard-statuses${compact ? " dashboard-statuses--compact" : ""}`} aria-label={t("Sidebar.DocumentStatus")}>
          {cardConfig.map((card) => (
            <Nav.Link
              key={card.id}
              as={Link}
              to={card.path}
              className={`dashboard-stat-card ${card.className} ${activeCard === card.id ? "active" : ""}`}
              aria-current={activeCard === card.id ? "page" : undefined}
              style={{ "--status-color": card.statusColor }}
            >
              <div className='dashboard-stat-card-heading'>
                <div className='CardIconsDiv' aria-hidden='true'>
                  {card.iconComponent}
                </div>
                <span className='dashboard-stat-count'>{card.count ?? 0}</span>
              </div>
              <div className='dashboard-stat-copy'>
                <p className='dashboard-stat-title'>{card.title}</p>
                {!compact && <p className='dashboard-stat-description'>{card.description}</p>}
              </div>
            </Nav.Link>
          ))}
        </Nav>
      </div>
      <Tour steps={tourSteps} isOpen={isTourOpen} onRequestClose={closeTour} rounded={5} accentColor='var(--theme-color)' />
    </>
  );
};

export default DashboardCard;
