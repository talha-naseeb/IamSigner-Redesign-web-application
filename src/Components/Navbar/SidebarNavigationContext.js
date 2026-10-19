import { createContext, useContext } from "react";

export const SIDEBAR_COLLAPSED_STORAGE_KEY = "iamsigner-sidebar-collapsed";

const SidebarNavigationContext = createContext(null);

export const SidebarNavigationProvider = SidebarNavigationContext.Provider;

export const useSidebarNavigation = () => useContext(SidebarNavigationContext);
