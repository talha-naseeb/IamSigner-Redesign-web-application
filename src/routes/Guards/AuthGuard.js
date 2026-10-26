import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { tokenManager } from "@/services/tokenManager";
import PATHS from "@/routes/paths";
import { evaluateAuthAccess } from "./rbacRules";

export { evaluateAuthAccess };

/**
 * AuthGuard
 * Enforces authentication before accessing protected routes.
 * Preserves attempted URL in router state for post-login redirection (RBAC-01).
 */
export const AuthGuard = () => {
  const location = useLocation();
  const isAuthenticated = tokenManager.hasToken();

  if (!evaluateAuthAccess(isAuthenticated)) {
    return React.createElement(Navigate, {
      to: PATHS.login,
      state: { from: location },
      replace: true,
    });
  }

  return React.createElement(Outlet, null);
};

export default AuthGuard;
