import { toast } from "react-toastify";
import i18n from "@/Components/Language/i18n";
import PATHS from "@/routes/paths";
import { navigateTo } from "@/Helpers/navigation";
import { SIGN_STATE_STATUSES } from "@/Helpers/signatureErrors";
import { PALETTE_STORAGE_KEY } from "@/Context/themeUtils";

const isCanceledRequest = (error) =>
  error?.code === "ERR_CANCELED" ||
  error?.name === "CanceledError" ||
  error?.message === "canceled";

let isSessionExpiryInProgress = false;

// Frontend-owned toast burst guard. The backend returns inconsistent status codes
// (400/404/500/501 for the same failure), so the UI never trusts them for messaging.
// At most one global error toast is shown per window, no matter how many requests
// fail or with what codes.
let lastGlobalToastAt = 0;
const GLOBAL_TOAST_WINDOW_MS = 3000;

// Timestamp of the last session-expiry trigger. For a short window afterwards its
// toast owns the screen, so straggler failures from the dead session stay silent
// instead of dismissing it — without muting the login page forever.
let sessionExpiryAt = 0;
const SESSION_TOAST_GRACE_MS = 2000;

const showBurstToast = (message) => {
  if (Date.now() - sessionExpiryAt < SESSION_TOAST_GRACE_MS) return;
  const now = Date.now();
  if (now - lastGlobalToastAt < GLOBAL_TOAST_WINDOW_MS) return;
  lastGlobalToastAt = now;
  // Clear any piled-up toasts from the burst before showing the single one
  toast.dismiss();
  toast.error(message);
};

/**
 * Toast helper for catch blocks. Skips when the global handler already showed
 * (or covered) a toast for this error, so one failure never produces two toasts.
 * Use this instead of calling toast.error directly on API failures.
 */
export const toastApiError = (error, message) => {
  if (error?._globalToastShown) return;
  toast.error(message);
};

/**
 * Handles session expiry by clearing storage and redirecting to the login page.
 * Guarded so concurrent failing responses trigger only one toast and redirect.
 * The guard re-arms only when a new session starts (a token appears again),
 * never on a timer — slow trickling 401s must not re-fire the flow.
 */
export const handleSessionExpiry = () => {
  if (isSessionExpiryInProgress) return;
  isSessionExpiryInProgress = true;
  sessionExpiryAt = Date.now();

  const currentTheme = localStorage.getItem("theme");
  const currentPalette = localStorage.getItem(PALETTE_STORAGE_KEY);
  sessionStorage.clear();
  localStorage.clear();

  if (currentTheme) {
    localStorage.setItem("theme", currentTheme);
  }
  if (currentPalette) {
    localStorage.setItem(PALETTE_STORAGE_KEY, currentPalette);
  }

  // Clear any stacked error toasts from concurrent failed requests
  toast.dismiss();
  toast.error(i18n.t("logScreens.sessionExpired"));

  setTimeout(() => {
    if (window.location.pathname !== PATHS.login) {
      navigateTo(PATHS.login);
    }
    // No timer re-arm: the guard resets when a new session token appears
    // (see handleResponseError). Slow 401s from the dead session stay silent.
  }, 500);
};

/**
 * Global handler for common HTTP error statuses and network errors.
 * @param {Object} error - The error object from axios.
 * @returns {Promise} - A rejected promise with the original error.
 */
export const handleResponseError = (error) => {
  if (isCanceledRequest(error)) {
    return Promise.reject(error);
  }

  // A token present again means a new session started after an expiry —
  // re-arm the session-expiry guard so a future logout is handled once more.
  if (isSessionExpiryInProgress && sessionStorage.getItem("token")) {
    isSessionExpiryInProgress = false;
  }

  const { response } = error;
  const suppressGlobalErrorToast = error?.config?.suppressGlobalErrorToast === true;

  // Document-state statuses (already signed/declined, expired link, recalled, viewed)
  // render dedicated full pages in the signing flow — no global toast needed
  if (SIGN_STATE_STATUSES.includes(String(response?.data?.statusCode))) {
    return Promise.reject(error);
  }

  if (!response) {
    if (!suppressGlobalErrorToast) {
      showBurstToast(i18n.t("logScreens.defaultError"));
      error._globalToastShown = true;
    }
    return Promise.reject(error);
  }

  const status = response.status;
  const token = sessionStorage.getItem("token");

  if (status === 401) {
    if (error.config?.skipSessionExpiryRedirect === true) {
      // Caller owns the failure UX (e.g. Mac AI generation) — stay on screen, no redirect
      return Promise.reject(error);
    }
    if (token) {
      handleSessionExpiry();
      error._globalToastShown = true;
    } else if (!suppressGlobalErrorToast) {
      const message = response.data?.message;
      if (message) {
        showBurstToast(message);
        error._globalToastShown = true;
      }
    }
    return Promise.reject(error);
  }

  // Backend status codes are inconsistent (400/404/500/501 can mean the same failure),
  // so every other failure gets one generic burst-guarded toast instead of per-code messages.
  // Callers needing a specific message set suppressGlobalErrorToast and toast it themselves.
  if (!suppressGlobalErrorToast) {
    showBurstToast(i18n.t("logScreens.defaultError"));
    error._globalToastShown = true;
  }

  return Promise.reject(error);
};
