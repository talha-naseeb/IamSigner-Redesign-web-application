import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/Context/UserContext";
import PATHS from "@/routes/paths";
import Forbidden403 from "@/Pages/Errors/Forbidden403";

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

  // 1. Account Type Check (Business 'B' vs Individual 'I')
  if (allowedAccountTypes.length > 0 && user?.AccountType && !allowedAccountTypes.includes(user.AccountType)) {
    return <Forbidden403 reason="This feature is only available for Business accounts." />;
  }

  // 2. Role ID Check (1: SuperAdmin, 2: Standard, 3: Restricted, 4: Admin)
  if (allowedRoleIds.length > 0 && user?.RoleID !== undefined && user?.RoleID !== null) {
    const numericRoleId = Number(user.RoleID);
    if (!allowedRoleIds.includes(numericRoleId)) {
      return <Forbidden403 reason="Your user role does not have permission to view this resource." />;
    }
  }

  // 3. Subscription Validity Check
  if (requireActiveSubscription && userAccess?.remainingDays !== undefined) {
    const days = Number(userAccess.remainingDays);
    if (!isNaN(days) && days <= 0) {
      return <Navigate to={PATHS.home} state={{ subscriptionExpiredPrompt: true }} replace />;
    }
  }

  // 4. Feature Entitlement Flag Check
  if (requiredPermission && userAccess && !userAccess[requiredPermission]) {
    return <Forbidden403 reason="This feature is not enabled for your account organization." />;
  }

  return <Outlet />;
};

export default RoleGuard;
