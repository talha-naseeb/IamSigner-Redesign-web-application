import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { tokenManager } from "@/services/tokenManager";
import PATHS from "@/routes/paths";

/**
 * AuthGuard
 * Enforces authentication before accessing protected routes.
 * Preserves attempted URL in router state for post-login redirection.
 */
export const AuthGuard = () => {
  const location = useLocation();
  const isAuthenticated = tokenManager.hasToken();

  if (!isAuthenticated) {
    return <Navigate to={PATHS.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
