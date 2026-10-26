import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/Components/UI/shadcnCompat";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiX } from "react-icons/fi";
import "./sidebarStyle.css";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { PALETTE_STORAGE_KEY } from "@/Context/themeUtils";

import { MenuItem, DropdownMenu, SidebarAccountStorage } from "./components";
import { useMenuConfig } from "./hooks/useMenuConfig";
import {
  SIDEBAR_COLLAPSED_STORAGE_KEY,
  SidebarNavigationProvider,
} from "./SidebarNavigationContext";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

const readCollapsedPreference = () => {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const Sidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsedPreference);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(MOBILE_BREAKPOINT).matches
      : false
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const { accountId, user, userAccess } = useUser();
  const { t } = useTranslation();
  const location = useLocation();
  const menuConfig = useMenuConfig(user, userAccess, t, accountId);
  const isOpen = isMobile || !isCollapsed;
  const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), []);
  const openMobileSidebar = useCallback(() => setIsMobileOpen(true), []);
  const sidebarNavigation = useMemo(
    () => ({ openMobileSidebar, closeMobileSidebar }),
    [openMobileSidebar, closeMobileSidebar]
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        String(isCollapsed)
      );
    } catch {
      // The sidebar remains usable if browser storage is unavailable.
    }
  }, [isCollapsed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const updateMobile = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setIsMobileOpen(false);
    };

    setIsMobile(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMobile);
    } else {
      mediaQuery.addListener(updateMobile);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateMobile);
      } else {
        mediaQuery.removeListener(updateMobile);
      }
    };
  }, []);

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, location.search, closeMobileSidebar]);

  useEffect(() => {
    if (!isMobile || !isMobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMobileSidebar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, isMobileOpen, closeMobileSidebar]);

  const clearStorage = () => {
    const currentTheme = localStorage.getItem("theme");
    const currentPalette = localStorage.getItem(PALETTE_STORAGE_KEY);
    const collapsedPreference = localStorage.getItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY
    );
    localStorage.clear();
    if (currentTheme) {
      localStorage.setItem("theme", currentTheme);
    }
    if (currentPalette) {
      localStorage.setItem(PALETTE_STORAGE_KEY, currentPalette);
    }
    if (collapsedPreference !== null) {
      localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        collapsedPreference
      );
    }
    sessionStorage.removeItem("signatoriesID");
    sessionStorage.removeItem("parsedData");
    sessionStorage.removeItem("fileName");
    sessionStorage.removeItem("base64CSV");
  };

  const handleUploadClick = (event) => {
    if (menuConfig.permissions.canUpload) {
      clearStorage();
    } else {
      event.preventDefault();
      setViewModal(true);
    }
  };

  const handleAiItemClick = (event, item) => {
    if (item.isSubscriptionOnly) {
      event.preventDefault();
      toast.info(t("Sidebar.availableOnSubscription"));
    }
  };

  const toggleCollapsed = () => setIsCollapsed((collapsed) => !collapsed);
  const handleSidebarToggle = () => {
    if (isMobile) {
      closeMobileSidebar();
      return;
    }
    toggleCollapsed();
  };
  const direction = document.dir || "ltr";

  return (
    <SidebarNavigationProvider value={sidebarNavigation}>
      <div className="Parentcontainer modern-theme-shell">
        {isMobileOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label={t("Sidebar.closeNavigation", "Close navigation")}
            onClick={closeMobileSidebar}
          />
        )}
        <aside
          className={`sidebar ${isCollapsed ? "sidebar--collapsed" : "sidebar--open"} ${isMobileOpen ? "sidebar--mobile-open" : ""} ${!isMobile && location.pathname.startsWith("/dms") ? "sidebar--has-subpanel" : ""}`}
          aria-label={t("Sidebar.mainNavigation", "Main navigation")}
          aria-hidden={isMobile && !isMobileOpen}
        >
          <div className="sidebar-rail">
            <div className="sidebar-scroll">
              <div className="sidebar-brand-row">
                <Link
                  to="/home"
                  className="sidebar-brand"
                  aria-label="IAmSigner home"
                  aria-hidden={!isMobile && (isCollapsed || location.pathname.startsWith("/dms"))}
                  tabIndex={!isMobile && (isCollapsed || location.pathname.startsWith("/dms")) ? -1 : undefined}
                  title="IAmSigner"
                  onClick={closeMobileSidebar}
                >
                  <Icons.StepperLogo
                    className="sidebar-brand-wordmark"
                    style={{ width: "132px", height: "39px" }}
                  />
                </Link>
                <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={handleSidebarToggle}
                  aria-label={
                    isMobile
                      ? t("Sidebar.closeNavigation", "Close navigation")
                      : isCollapsed
                        ? t("Sidebar.expandNavigation", "Expand sidebar")
                        : t("Sidebar.collapseNavigation", "Collapse sidebar")
                  }
                  title={
                    isMobile
                      ? t("Sidebar.closeNavigation", "Close navigation")
                      : isCollapsed
                        ? t("Sidebar.expandNavigation", "Expand sidebar")
                        : t("Sidebar.collapseNavigation", "Collapse sidebar")
                  }
                >
                  {isMobile ? (
                    <FiX size={18} />
                  ) : (
                    <FiChevronLeft
                      size={18}
                      className={`${isCollapsed ? "sidebar-toggle-icon--collapsed " : ""}${direction === "rtl" ? "sidebar-toggle-icon--rtl" : ""}`}
                    />
                  )}
                </button>
              </div>

              <nav className="sidebar-nav" aria-label={t("Sidebar.mainNavigation", "Main navigation")}>
                <div className="sidebar-nav-items">
                  {menuConfig.basicMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      item={item}
                      isOpen={isOpen && !location.pathname.startsWith("/dms")}
                      onClick={item.type === "upload" ? handleUploadClick : clearStorage}
                      onNavigate={closeMobileSidebar}
                    />
                  ))}

                  <DropdownMenu
                    items={menuConfig.documentStatusItems}
                    triggerIcon={Icons.DocumentStatus}
                    triggerLabel={t("Sidebar.DocumentStatus")}
                    isOpen={isOpen && !location.pathname.startsWith("/dms")}
                    className="menuLinks doc-status-section"
                    onNavigate={closeMobileSidebar}
                    onExpandSidebar={() => setIsCollapsed(false)}
                  />

                  <div className="sidebar-nav-divider" />

                  {menuConfig.featureMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      item={item}
                      isOpen={isOpen && !location.pathname.startsWith("/dms")}
                      onClick={clearStorage}
                      onNavigate={closeMobileSidebar}
                    />
                  ))}

                  {menuConfig.aiMenuItems.length > 0 && (
                    <DropdownMenu
                      items={menuConfig.aiMenuItems}
                      triggerIcon={Icons.MacAI}
                      triggerLabel={t("Sidebar.MacAI")}
                      isOpen={isOpen && !location.pathname.startsWith("/dms")}
                      onItemClick={handleAiItemClick}
                      onNavigate={closeMobileSidebar}
                      onExpandSidebar={() => setIsCollapsed(false)}
                    />
                  )}

                  {menuConfig.permissions.canAccessAdmin && (
                    <DropdownMenu
                      items={menuConfig.userReportItems}
                      triggerIcon={Icons.UserReportShield}
                      triggerLabel={t("Sidebar.userDashboard")}
                      isOpen={isOpen && !location.pathname.startsWith("/dms")}
                      onNavigate={closeMobileSidebar}
                      onExpandSidebar={() => setIsCollapsed(false)}
                    />
                  )}

                  {menuConfig.permissions.canAccessAdmin && (
                    <DropdownMenu
                      items={menuConfig.adminMenuItems}
                      triggerIcon={Icons.AdminShield}
                      triggerLabel={t("Sidebar.AdminMenu")}
                      isOpen={isOpen && !location.pathname.startsWith("/dms")}
                      onNavigate={closeMobileSidebar}
                      onExpandSidebar={() => setIsCollapsed(false)}
                    />
                  )}
                </div>
              </nav>
            </div>

            {accountId && !location.pathname.startsWith("/dms") ? (
              <SidebarAccountStorage accountId={accountId} isOpen={isOpen} />
            ) : null}
          </div>

          {!isMobile && location.pathname.startsWith("/dms") && (
            <div id="dms-subpanel-portal" className="sidebar-subpanel" />
          )}
        </aside>

        <main className="mainbody">{children}</main>

        <Modal
          show={viewModal}
          onHide={() => setViewModal(false)}
          centered
          dialogClassName="custom-modal-width"
        >
          <Modal.Body className="sidebar-expire-modal">
            <Icons.Expire alt="Expire" />
            <p>{t("home.Expire")}</p>
            <p>{t("home.OnlyView")}</p>
          </Modal.Body>
        </Modal>

      </div>
    </SidebarNavigationProvider>
  );
};

export default Sidebar;
