import React from "react";
import { useUser } from "@/Context/UserContext";
import { usePermissions } from "@/Components/Navbar/hooks/useMenuConfig";

/**
 * <Can />
 * In-component declarative authorization directive.
 * Conditionally renders children if the authenticated user has permission for the action.
 *
 * Examples:
 * <Can do="upload" fallback={<Button disabled>Upload</Button>}>
 *   <Button onClick={handleUpload}>Upload</Button>
 * </Can>
 */
export const Can = ({ do: action, fallback = null, children }) => {
  const { user, userAccess } = useUser();
  const permissions = usePermissions(user || {}, userAccess || {});

  let isAllowed = false;

  switch (action) {
    case "upload":
      isAllowed = permissions.canUpload;
      break;
    case "admin":
      isAllowed = permissions.canAccessAdmin;
      break;
    case "draft":
      isAllowed = !permissions.isLimitedRole;
      break;
    case "teams":
      isAllowed = !!userAccess?.teams && permissions.canAccessAdmin;
      break;
    case "cobrand":
      isAllowed = !!userAccess?.coBrand && permissions.canAccessAdmin;
      break;
    case "bulk":
      isAllowed = user?.AccountType === "B" && !permissions.isLimitedRole && !!userAccess?.bulkDocUpload;
      break;
    case "templates":
      isAllowed = !permissions.isLimitedRole && !!userAccess?.templates;
      break;
    default:
      // If action is a direct permission key in userAccess
      if (action && userAccess && userAccess[action] !== undefined) {
        isAllowed = !!userAccess[action];
      } else {
        isAllowed = true;
      }
      break;
  }

  return isAllowed ? <>{children}</> : fallback;
};

export default Can;
