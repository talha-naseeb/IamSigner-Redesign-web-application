/**
 * Configuration, date formatting, status styling, and pagination math
 * for the Unified Document Status Table Engine (ENG-02).
 */

/**
 * Format date string to "D/M/YYYY - H:MM AM/PM" format.
 * Returns "—" if the date string is empty or invalid.
 */
export const formatTableDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${day}/${month}/${year} - ${hours}:${formattedMinutes} ${ampm}`;
};

/**
 * Resolves standard tokenized CSS classes for document status chips.
 * Avoids decorative shadows; uses tokenized border and background colors.
 */
export const getStatusBadgeClass = (status) => {
  if (!status || typeof status !== "string") {
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
  }

  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case "completed":
    case "active":
    case "success":
    case "signed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";

    case "pending":
    case "pendingwithme":
    case "pendingwithothers":
    case "waiting":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800";

    case "declined":
    case "rejected":
    case "failed":
    case "expired":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800";

    case "recall":
    case "recalled":
    case "voided":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800";

    case "inactive":
    case "draft":
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
  }
};

/**
 * Standard status hex color palette matching the Recent Documents Dashboard.
 */
export const STATUS_COLORS = {
  completed: "#10b981",
  active: "#10b981",
  signed: "#10b981",
  success: "#10b981",
  draft: "#4c8bff",
  declined: "#ef4444",
  rejected: "#ef4444",
  failed: "#ef4444",
  expired: "#ef4444",
  inactive: "#64748b",
  pending: "#f59e0b",
  waiting: "#f59e0b",
  pendingwithme: "#f59e0b",
  pendingwithothers: "#f59e0b",
  share: "#06b6d4",
  recalled: "#06b6d4",
  recall: "#06b6d4",
  voided: "#06b6d4",
  bulk: "#8b6cff",
};

/**
 * Resolves status color matching the Recent Documents Dashboard palette.
 */
export const getStatusColor = (status) => {
  if (!status || typeof status !== "string") return STATUS_COLORS.bulk;
  const key = status.trim().toLowerCase().replace(/[\s_-]/g, "");
  return STATUS_COLORS[key] || STATUS_COLORS.bulk;
};

/**
 * Calculates zero-indexed pagination indices and summary bounds.
 */
export const computePaginationRange = (page = 0, rowsPerPage = 30, totalItems = 0) => {
  const safeTotal = Math.max(0, Number(totalItems) || 0);
  const safePerPage = Math.max(1, Number(rowsPerPage) || 30);
  const totalPages = Math.ceil(safeTotal / safePerPage) || 1;
  const safePage = Math.max(0, Math.min(Number(page) || 0, totalPages - 1));

  const startItem = safeTotal === 0 ? 0 : safePage * safePerPage + 1;
  const endItem = Math.min((safePage + 1) * safePerPage, safeTotal);

  return {
    currentPage: safePage,
    rowsPerPage: safePerPage,
    totalItems: safeTotal,
    totalPages,
    startItem,
    endItem,
    hasPrevious: safePage > 0,
    hasNext: safePage < totalPages - 1,
  };
};

/**
 * Formats scope identifier ("I" -> Individual, "B" -> Company/Business).
 */
export const formatScope = (scope, t) => {
  if (scope === "I") return t ? t("templateUploadFlow.Individual", "Individual") : "Individual";
  if (scope === "B") return t ? t("templateUploadFlow.Company", "Company") : "Company";
  return scope || "—";
};
