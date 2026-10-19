import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Nav, Dropdown, Navbar } from "react-bootstrap";
import { useUser } from "@/Context/UserContext";
import { useTranslation } from "react-i18next";
import LangSelector from "../Language/LangSelector";
import { Icons } from "@/assets/Icons/index";
import "./style.css";
import userService from "@/services/userService";
import Loader from "@/Components/CommonModals/Loader/Loader";
import ReactSwitch from "react-switch";
import { useTheme } from "@/Context/ThemeContext";
import { PALETTE_STORAGE_KEY } from "@/Context/themeUtils";
import { SIDEBAR_COLLAPSED_STORAGE_KEY, useSidebarNavigation } from "./SidebarNavigationContext";

function Header() {
  const [isLoading, setIsLoading] = useState(false);
  const { profile, user, userAccess } = useUser();
  const { theme, toggleTheme, palette, setPalette } = useTheme();
  const sidebarNavigation = useSidebarNavigation();
  const [imgError, setImgError] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await userService.logout(null, {
        suppressGlobalErrorToast: true,
        skipSessionExpiryRedirect: true,
      });

      if (response.data.statusCode !== "1") {
        setIsLoading(false);
        return;
      }
    } catch (error) {
      // Best-effort logout: even if the server call failed (e.g. session already
      // expired), clear the local session and return to login without an error toast
    }

    const currentTheme = theme;
    const currentPalette = palette;
    const collapsedPreference = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    sessionStorage.clear();
    localStorage.clear();
    localStorage.setItem("theme", currentTheme);
    localStorage.setItem(PALETTE_STORAGE_KEY, currentPalette);
    if (collapsedPreference !== null) {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsedPreference);
    }
    navigate("/");
    toast.success(t("menuButtons.logoutSuccessfully"));
  };

  const handleThemeChange = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    toggleTheme();

    try {
      await userService.updateProfile({
        SelectedTheme: newTheme,
      });
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  const handlepasschangeRoute = () => {
    navigate("/user-profile");
  };

  // Track small screen to render compact labels to avoid text overlap
  const [isSmallScreen, setIsSmallScreen] = useState(typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(max-width: 576px)").matches : false);

  // Track scroll position for transparency effect
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!window || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 576px)");
    const handler = (e) => setIsSmallScreen(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else if (mq.addListener) {
      // Safari fallback
      mq.addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handler);
      } else if (mq.removeListener) {
        mq.removeListener(handler);
      }
    };
  }, []);

  // Handle scroll event for transparency effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Navbar className={`sticky-header ${isScrolled ? "scrolled" : ""}`} sticky='top'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      {sidebarNavigation && (
        <div className="mobile-sidebar-brand">
          <button
            type="button"
            className="mobile-sidebar-menu-button"
            aria-label={t("Sidebar.openNavigation", "Open navigation")}
            onClick={sidebarNavigation.openMobileSidebar}
          >
            <Icons.Hamburger size={20} />
          </button>
          <Icons.StepperLogo
            className="mobile-sidebar-brand-logo"
            style={{ width: "124px", height: "36px" }}
          />
        </div>
      )}

      {userAccess && (
        <div className='icon-wrapper-heading'>
          {userAccess.remainingDays > 3 && userAccess.packageName === "Trial" ? (
            // Normal remaining days if more than 3 (only for Trial)
            <>
              <Icons.Calendar size={22} />
              <span>{isSmallScreen ? `${userAccess.remainingDays}` : `${userAccess.remainingDays} ${t("header.daysRemaining")}`}</span>
            </>
          ) : userAccess.remainingDays === 1 ? (
            // Special message when exactly 1 day remaining (all packages)
            <>
              <span style={{ color: "#f9ba05", display: "flex", alignItems: "center", gap: "5px" }}>
                <Icons.Alert size={22} />
                {isSmallScreen ? t("header.oneDayToExpire") : t("header.oneDayRemaining")}
              </span>
            </>
          ) : userAccess.remainingDays > 1 && userAccess.remainingDays <= 3 ? (
            // Show warning in yellow if 3 or fewer days remaining
            <>
              <span style={{ color: "#f9ba05", display: "flex", alignItems: "center", gap: "5px" }}>
                <Icons.Alert size={22} />
                {userAccess.packageName === "Trial"
                  ? isSmallScreen
                    ? `${userAccess.remainingDays}d`
                    : `${userAccess.remainingDays} ${t("header.daysRemaining")}`
                  : isSmallScreen
                    ? t("header.oneDayToExpire")
                    : t("header.oneDayRemaining")}
              </span>
            </>
          ) : userAccess.remainingDays <= 0 ? (
            // Expiration message when expired (all packages)
            <span className='d-flex align-items-center gap-1' style={{ color: "#dc3545" }}>
              <Icons.Alert size={22} />
              {isSmallScreen ? t("header.Expired") : t("header.subscriptionExpired")}
            </span>
          ) : null}
        </div>
      )}

      <div className='theme-toggle-container d-flex align-items-center px-2 gap-2'>
        <ReactSwitch
          onChange={handleThemeChange}
          checked={theme === "dark"}
          aria-label={t(theme === "dark" ? "header.switchToLightMode" : "header.switchToDarkMode")}
          onColor={palette === "management" ? "#FE5800" : "#8b6cff"}
          offColor={palette === "management" ? "#FFAD7D" : "#d9d1ff"}
          checkedIcon={
            <div className='d-flex justify-content-center align-items-center h-100'>
              <Icons.Moon size={16} color='#f1c40f' />
            </div>
          }
          uncheckedIcon={
            <div className='d-flex justify-content-center align-items-center h-100'>
              <Icons.Sun size={16} color='#fff' />
            </div>
          }
          height={22}
          width={44}
          handleDiameter={18}
          className='react-switch'
        />
        <span className='theme-label d-none d-sm-inline'>{theme === "dark" ? t("header.darkMode") : t("header.lightMode")}</span>
      </div>

      <div className='icon-wrapper header-language-switch'>
        <LangSelector />
      </div>

      {/* <Nav.Link className='icon-wrapper'>
        <IoIosNotificationsOutline size={24} />
        <span>{t("header.notification")}</span>
      </Nav.Link> */}

      <Nav.Link as={Link} to='/home' className='icon-wrapper'>
        <Icons.Home size={22} />
        <span>{t("header.home")}</span>
      </Nav.Link>

      <Nav.Link className='user_settings'>
        <Dropdown>
          <Dropdown.Toggle variant='none' style={{ border: "none" }} id='dropdownMenuButton4'>
            <span>
              {!profile || imgError ? (
                <div
                  className='accountImage d-flex align-items-center justify-content-center'
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--theme-color)",
                  }}
                >
                  <Icons.Profile size={18} />
                </div>
              ) : (
                <img
                  src={profile}
                  alt='ProfilePhoto'
                  className='accountImage'
                  onError={() => setImgError(true)}
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
              )}
            </span>
          </Dropdown.Toggle>

          <Dropdown.Menu className={`slideDownIn animation ${document.documentElement.dir === "rtl" ? "dropdown-menu-start" : "dropdown-menu-end"}`}>
            <Dropdown.Item>
              <span className='user_name'>
                {t("menuButtons.Welcome")}, {user.fullName}
              </span>
            </Dropdown.Item>
            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={handlepasschangeRoute}>
              <Icons.Profile size={20} />
              {t("menuButtons.profileSettings")}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>{t("header.colorPalette", "Color palette")}</Dropdown.Header>
            <Dropdown.Item
              as='button'
              type='button'
              className='palette-menu-item'
              aria-pressed={palette === "concept-2"}
              onClick={() => setPalette("concept-2")}
            >
              <span className='palette-swatch palette-swatch--concept-2' aria-hidden='true' />
              <span>{t("header.conceptTwoPalette", "Concept 2")}</span>
              {palette === "concept-2" && <span className='palette-choice-check' aria-hidden='true'>✓</span>}
            </Dropdown.Item>
            <Dropdown.Item
              as='button'
              type='button'
              className='palette-menu-item'
              aria-pressed={palette === "management"}
              onClick={() => setPalette("management")}
            >
              <span className='palette-swatch palette-swatch--management' aria-hidden='true' />
              <span>{t("header.azaManagementPalette", "AZA Management Palette")}</span>
              {palette === "management" && <span className='palette-choice-check' aria-hidden='true'>✓</span>}
            </Dropdown.Item>
            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={handleLogout}>
              <Icons.Logout size={20} />
              {t("menuButtons.logout")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav.Link>
    </Navbar>
  );
}

export default Header;
