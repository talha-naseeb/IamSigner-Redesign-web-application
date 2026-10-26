import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import Forbidden403 from "@/Pages/Errors/Forbidden403";
import { evaluateRoleAccess } from "./rbacRules";

export { evaluateRoleAccess };

/**
 * RoleGuard
 * Multi-factor authorization guard checking AccountType, RoleID,
 * Module Entitlements (userAccess flags), and Subscription Validity.
 */
export const RoleGuard = ({
  allowedAccountTypes = [],
  allowedRoleIds = [],
  requiredPermission = null,
  requireActiveSubscription = false,
}) => {
  const { user, userAccess, loading } = useUser();

  if (loading) {
    return null;
  }

  const access = evaluateRoleAccess({
    user,
    userAccess,
    allowedAccountTypes,
    allowedRoleIds,
    requiredPermission,
    requireActiveSubscription,
  });

  if (!access.allowed) {
    if (access.type === "redirect") {
      return React.createElement(Navigate, {
        to: access.redirectTo,
        state: access.state,
        replace: true,
      });
    }
    return React.createElement(Forbidden403, { reason: access.reason });
  }

  return React.createElement(Outlet, null);
};

export default RoleGuard;
