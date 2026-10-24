import React, { useLayoutEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import DashboardCard from "../DashboardStatuses/DashboardCards/DashboardCard";
import Sidebar from "../Navbar/Sidebar";
import Header from "../Navbar/Header";

const Layout = () => {
  const location = useLocation();
  const fullWidthLayoutRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const showDashboardCard = ["/pending-with-me", "/pending-with-others", "/shared-with-me", "/shared-with-others", "/drafts", "/completed-status", "/inactive-docs", "/recall-docs"].some((path) =>
    location.pathname.includes(path)
  );

  const hideSidebar =
    location.pathname.includes("/upload-doc") ||
    location.pathname.includes("/create-templates") ||
    location.pathname.includes("/edit-templates") ||
    location.pathname.includes("/upload-bulk") ||
    location.pathname.includes("/self-sign");

  useLayoutEffect(() => {
    if (!hideSidebar || showDashboardCard || !fullWidthLayoutRef.current) return undefined;

    const header = fullWidthLayoutRef.current.querySelector(".sticky-header");
    if (!header) return undefined;

    const updateHeaderHeight = () => setHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, [hideSidebar, showDashboardCard]);

  return (
    <>
      {hideSidebar && !showDashboardCard ? (
        <div
          ref={fullWidthLayoutRef}
          className='mainbody mainbody--full-width modern-theme-shell'
          style={{ "--editor-header-height": `${headerHeight || 67}px` }}
        >
          <Header />
          <Outlet />
        </div>
      ) : (
        <Sidebar>
          <Header />
          {showDashboardCard && (
            <div className='container'>
              <DashboardCard />
            </div>
          )}
          <Outlet />
        </Sidebar>
      )}
    </>
  );
};

export default Layout;
