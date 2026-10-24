import React, { useState } from "react";
import "./Home.css";
import { Button, Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import DashboardCard from "@/Components/DashboardStatuses/DashboardCards/DashboardCard";
import RecentDocsHome from "@/Components/DashboardStatuses/Dashboard/RecentDocsHome";
import { useUser } from "@/Context/UserContext";
import { useNavigate } from "react-router-dom";
import ExpireImage from "@/assets/images/ExpireImage.png";
import { FiShield, FiUploadCloud, FiEdit3, FiFileText, FiLayers } from "react-icons/fi";
import { PALETTE_STORAGE_KEY } from "@/Context/themeUtils";

const Home = () => {
  const [viewModal, setViewModal] = useState(false);
  const { user, userAccess } = useUser("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const closeViewModal = () => {
    setViewModal(false);
  };

  const clearSessionStorage = () => {
    // Non-destructive workflow state cleanup to prevent cross-tab state pollution
    const workflowKeys = [
      "registerSignID",
      "signatoriesID",
      "activeStep",
      "completedSteps",
      "templateID",
      "documentName",
      "savedSignature",
    ];
    workflowKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  const isRestrictedUser =
    (user?.AccountType === "B" && user?.RoleID === 3) ||
    (userAccess?.remainingDays !== undefined && userAccess.remainingDays <= 0);

  const handleStartUpload = () => {
    clearSessionStorage();
    if (isRestrictedUser) {
      setViewModal(true);
    } else {
      navigate("/upload-doc");
    }
  };

  const handleSelfSign = () => {
    clearSessionStorage();
    if (isRestrictedUser) {
      setViewModal(true);
    } else {
      navigate("/self-sign");
    }
  };

  const handleTemplates = () => {
    navigate("/templates-page");
  };

  const handleBulkUpload = () => {
    clearSessionStorage();
    if (isRestrictedUser) {
      setViewModal(true);
    } else {
      navigate("/upload-bulk");
    }
  };

  const todayFormatted = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? t("home.goodMorning", "Good morning")
      : currentHour < 18
      ? t("home.goodAfternoon", "Good afternoon")
      : t("home.goodEvening", "Good evening");

  return (
    <div className='home-wrapper dashboard-section'>
      <main className='home-main'>
        {/* Minimalist Hero Banner with Quick Actions */}
        <section className='home-hero-card upload-doc-flow' aria-labelledby='home-welcome-heading'>
          <div className='home-hero-content'>
            <div className='home-hero-meta'>
              <span className='home-hero-badge'>
                <FiShield aria-hidden='true' />
                <span>{t("home.workspaceLabel", "Workspace")}</span>
              </span>
              <span className='home-hero-date'>{todayFormatted}</span>
            </div>

            <h1 id='home-welcome-heading' className='home-hero-title'>
              {timeGreeting},{" "}
              <span className='home-hero-name'>{user?.fullName || t("menuButtons.hello", "User")}</span>
            </h1>

            <p className='home-hero-subtitle'>
              {t("home.documentOverview", "Manage, track, and complete your agreements with secure cryptographic signing.")}
            </p>

            <div className='home-hero-actions'>
              <Button
                className='btn-hero-primary'
                onClick={handleStartUpload}
                aria-label={t("Sidebar.uploadDoc", "Upload & Send")}
              >
                <FiUploadCloud aria-hidden='true' size={18} />
                <span>{t("home.StartNow", "Upload & Send")}</span>
              </Button>

              <Button
                variant='none'
                className='btn-hero-secondary'
                onClick={handleSelfSign}
                aria-label={t("Sidebar.SelfSign", "Sign Myself")}
              >
                <FiEdit3 aria-hidden='true' size={16} />
                <span>{t("Sidebar.SelfSign", "Sign Myself")}</span>
              </Button>

              <Button
                variant='none'
                className='btn-hero-secondary'
                onClick={handleTemplates}
                aria-label={t("Sidebar.Templates", "Templates")}
              >
                <FiFileText aria-hidden='true' size={16} />
                <span>{t("Sidebar.Templates", "Templates")}</span>
              </Button>

              {userAccess?.bulkDocUpload && (
                <Button
                  variant='none'
                  className='btn-hero-secondary d-none d-md-inline-flex'
                  onClick={handleBulkUpload}
                  aria-label={t("Sidebar.BulkSend", "Bulk Send")}
                >
                  <FiLayers aria-hidden='true' size={16} />
                  <span>{t("Sidebar.BulkSend", "Bulk Send")}</span>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Minimalist Document Status Metric Cards */}
        <section className='home-status-area' aria-label={t("Sidebar.DocumentStatus")}>
          <div className='home-section-header'>
            <div>
              <h2 className='home-section-title'>{t("Sidebar.DocumentStatus", "Document Status")}</h2>
              <p className='home-section-subtitle'>
                {t("home.statusOverviewSub", "Overview of your active documents and pending actions")}
              </p>
            </div>
          </div>
          <DashboardCard compact={true} />
        </section>

        {/* Full-width Recent Documents Table */}
        <section className='home-recent-section' aria-label={t("menuButtons.Alldocs")}>
          <RecentDocsHome />
        </section>
      </main>

      {/* Expired subscription modal */}
      <Modal show={viewModal} onHide={closeViewModal} centered dialogClassName='custom-modal-width'>
        <Modal.Body className='home-expire-modal-body'>
          <img src={ExpireImage} alt='Expire' className='home-expire-image' />
          <p className='home-expire-title'>{t("home.Expire")}</p>
          <p className='home-expire-text'>{t("home.OnlyView")}</p>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Home;
