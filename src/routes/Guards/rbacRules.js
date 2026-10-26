/**
 * RBAC Rules Engine
 * Centralized, pure policy evaluation for IAMSigner route guards.
 * Evaluates authentication, account types, role IDs, module permissions, and subscription validity.
 */

export const RBAC_PATHS = {
  home: "/home",
  login: "/",
};

/**
 * Evaluates whether the user has a valid active session.
 * @param {boolean} hasToken
 * @returns {boolean}
 */
export const evaluateAuthAccess = (hasToken) => {
  return hasToken === true;
};

/**
 * Multi-factor authorization evaluation rule.
 * Evaluates AccountType, RoleID, Subscription Validity, and Feature Entitlements.
 * 
 * @param {Object} params
 * @param {Object|null} params.user User profile object { AccountType, RoleID }
 * @param {Object|null} params.userAccess Module entitlements { remainingDays, [permissionKey]: boolean }
 * @param {string[]} [params.allowedAccountTypes] Required account types (e.g., ['B'] for Business)
 * @param {number[]} [params.allowedRoleIds] Allowed Role IDs (1: SuperAdmin, 2: Standard, 3: Restricted, 4: Admin)
 * @param {string|null} [params.requiredPermission] Required module entitlement flag in userAccess
 * @param {boolean} [params.requireActiveSubscription] Whether active remaining days > 0 is enforced
 * 
 * @returns {{ allowed: boolean, type?: 'forbidden'|'redirect', reason?: string, redirectTo?: string, state?: Object }}
 */
export const evaluateRoleAccess = ({
  user,
  userAccess,
  allowedAccountTypes = [],
  allowedRoleIds = [],
  requiredPermission = null,
  requireActiveSubscription = false,
}) => {
  // 1. Account Type Check (Business 'B' vs Individual 'I')
  if (allowedAccountTypes.length > 0) {
    if (!user?.AccountType || !allowedAccountTypes.includes(user.AccountType)) {
      return {
        allowed: false,
        type: "forbidden",
        reason: "This feature is only available for Business accounts.",
      };
    }
  }

  // 2. Role ID Check (1: SuperAdmin, 2: Standard, 3: Restricted, 4: Admin)
  if (allowedRoleIds.length > 0) {
    const numericRoleId =
      user?.RoleID !== undefined && user?.RoleID !== null
        ? Number(user.RoleID)
        : null;
    if (numericRoleId === null || isNaN(numericRoleId) || !allowedRoleIds.includes(numericRoleId)) {
      return {
        allowed: false,
        type: "forbidden",
        reason: "Your user role does not have permission to view this resource.",
      };
    }
  }

  // 3. Subscription Validity Check
  if (requireActiveSubscription) {
    const days =
      userAccess?.remainingDays !== undefined && userAccess?.remainingDays !== null
        ? Number(userAccess.remainingDays)
        : 0;
    if (isNaN(days) || days <= 0) {
      return {
        allowed: false,
        type: "redirect",
        redirectTo: RBAC_PATHS.home,
        state: { subscriptionExpiredPrompt: true },
      };
    }
  }

  // 4. Feature Entitlement Flag Check
  if (requiredPermission) {
    if (!userAccess || !userAccess[requiredPermission]) {
      return {
        allowed: false,
        type: "forbidden",
        reason: "This feature is not enabled for your account organization.",
      };
    }
  }

  return { allowed: true };
};
