import { API_STATUS } from "@/Constants/apiStatuses";
import PATHS from "@/routes/paths";

// Statuses whose UX is a dedicated full-page state in the signing flow,
// so the global error handler stays quiet for them.
// "7" (NO_DATA_FOUND) has no API_STATUS entry — the signing flow treats it as an expired link.
export const SIGN_STATE_STATUSES = [
  API_STATUS.ALREADY_SIGNED,
  API_STATUS.SIGNATORY_DECLINED,
  API_STATUS.LINK_EXPIRED,
  API_STATUS.DOC_RECALLED,
  API_STATUS.ALREADY_VIEWED,
  "7",
];

const SIGNATURE_ERROR_ROUTES = {
  [API_STATUS.ALREADY_SIGNED]: PATHS.alreadySigned,
  [API_STATUS.SIGNATORY_DECLINED]: PATHS.alreadyDeclined,
  [API_STATUS.LINK_EXPIRED]: PATHS.linkExpired,
  [API_STATUS.DOC_RECALLED]: PATHS.docRecalled,
  [API_STATUS.ALREADY_VIEWED]: PATHS.viewMessage,
  7: PATHS.linkExpired,
  // The signing flow treats backend exceptions on public links as expired links
  [API_STATUS.EXCEPTION]: PATHS.linkExpired,
};

/**
 * Maps a signing-flow error statusCode to its dedicated route.
 * @param {string|number} statusCode - Business statusCode from the backend.
 * @returns {string|undefined} The route to navigate to, if one exists.
 */
export const getSignatureErrorRoute = (statusCode) =>
  SIGNATURE_ERROR_ROUTES[String(statusCode)];
