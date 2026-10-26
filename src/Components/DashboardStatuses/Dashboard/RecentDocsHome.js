import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import RecentDocsFilter from "./RecentDocsFilter";
import documentService from "@/services/documentService";
import { Icons } from "@/assets/Icons";
import { FiSearch, FiX, FiFileText } from "react-icons/fi";

const getStatusBucket = (value) => {
  const status = String(value ?? "").trim().toLowerCase();
  if (!status) return "bulk";
  if (status.includes("pending")) return "pending";
  if (status.includes("draft")) return "draft";
  if (status.includes("complet") || status.includes("signed")) return "completed";
  if (status.includes("bulk")) return "bulk";
  return status;
};

const RecentDocsHome = () => {
  const { t } = useTranslation();
  const [loadError, setLoadError] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const [docName, setDocName] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [quickStatusFilter, setQuickStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const latestRequest = useRef(0);

  // Keep the table in sync with the server's filtered response.
  const fetchDocuments = useCallback(async (filters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
    );
    const requestId = ++latestRequest.current;
    setAppliedFilters(params);
    setLoadError(false);
    try {
      const response = await documentService.getRecentDocs(params);
      if (requestId !== latestRequest.current) return;
      if (!response?.data?.successStatus) {
        throw new Error("Unable to fetch documents");
      }

      const rows = Array.isArray(response.data.response) ? response.data.response : [];
      setSearchResults(rows);
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setSearchResults([]);
      setLoadError(true);
    }
  }, [t]);

  const fetchAllDocs = useCallback(() => fetchDocuments(), [fetchDocuments]);

  useEffect(() => {
    fetchAllDocs();
  }, [fetchAllDocs]);

  const handleSearch = async () => {
    setQuickStatusFilter("all");
    setSearchQuery("");
    await fetchDocuments({
      StartDate: startDate,
      EndDate: endDate,
      DocStatus: docStatus,
      DocName: docName.trim(),
      ReferenceNo: referenceNo.trim(),
    });
  };

  // Quick filters (All, Pending, Draft, Completed, Bulk) are handled 100% on the frontend without hitting the API.
  const handleQuickStatusFilter = (status) => {
    setQuickStatusFilter(status);
  };

  const clearSearch = () => {
    setStartDate("");
    setEndDate("");
    setDocStatus("");
    setDocName("");
    setReferenceNo("");
    setQuickStatusFilter("all");
    setSearchQuery("");
    fetchAllDocs();
  };

  const statusCounts = useMemo(() => {
    const counts = { all: searchResults.length, pending: 0, draft: 0, completed: 0, bulk: 0 };
    searchResults.forEach((row) => {
      const status = getStatusBucket(row.docStatus);
      if (Object.prototype.hasOwnProperty.call(counts, status) && status !== "all") {
        counts[status] += 1;
      }
    });
    return counts;
  }, [searchResults]);

  // Frontend-side search & status filtering
  const visibleSearchResults = useMemo(() => {
    let list = searchResults;

    // 1. Quick status filter (All, Pending, Draft, Completed, Bulk)
    if (quickStatusFilter && quickStatusFilter !== "all") {
      list = list.filter((row) => getStatusBucket(row.docStatus) === quickStatusFilter);
    }

    // 2. Search bar query (Document name, reference number, created by)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (row) =>
          (row.docName && row.docName.toLowerCase().includes(q)) ||
          (row.referenceNumber && row.referenceNumber.toLowerCase().includes(q)) ||
          (row.createdByName && row.createdByName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchResults, quickStatusFilter, searchQuery]);

  const quickFilters = [
    { id: "all", label: t("menuButtons.Alldocs", "All documents") },
    { id: "pending", label: t("viewDetails.pending", "Pending") },
    { id: "draft", label: t("viewDetails.draft", "Draft") },
    { id: "completed", label: t("viewDetails.completed", "Completed") },
    { id: "bulk", label: t("viewDetails.bulk", "Bulk") },
  ];

  const columns = [
    { label: t("tablesLabel.docName", "Document Name"), key: "docName" },
    { label: t("tablesLabel.status", "Status"), key: "docStatus" },
    { label: t("tablesLabel.date", "Date & Time"), key: "createdOn" },
    { label: t("tablesLabel.refNumber", "Reference Number"), key: "referenceNumber" },
    { label: t("tablesLabel.createdby", "Created By"), key: "createdByName" },
  ];

  const statusColors = {
    completed: "#10b981",
    draft: "#4c8bff",
    declined: "#ef4444",
    inactive: "#64748b",
    pending: "#f59e0b",
    share: "#06b6d4",
    recalled: "#06b6d4",
    bulk: "#8b6cff",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedMinutes = (minutes < 10 ? "0" : "") + minutes;

    return `${day} ${month} ${year}, ${hours}:${formattedMinutes} ${ampm}`;
  };

  const hasActiveFilters = Boolean(startDate || endDate || docStatus || docName || referenceNo);
  const hasVisibleFilters = Boolean(hasActiveFilters || quickStatusFilter !== "all" || searchQuery);

  return (
    <div>

      <section className='homePageTable' aria-labelledby='home-documents-heading'>
        {/* Seamless Unified Top Bar */}
        <div className='recentdocs-top-bar'>
          <div className='recentdocs-header-row'>
            <div className='recentdocs-title-group'>
              <div className='d-flex align-items-center gap-2'>
                <h2 id='home-documents-heading' className='recentdocs-title'>
                  {t("menuButtons.Alldocs", "All documents")}
                </h2>
                <span className='recentdocs-badge'>
                  {visibleSearchResults.length} {visibleSearchResults.length === 1 ? "document" : "documents"}
                </span>
              </div>
              <p className='recentdocs-subtitle'>{t("home.documentOverview", "A quick look at your document activity.")}</p>
            </div>

            <div className='recentdocs-actions-group'>
              {/* Quick Instant Search */}
              <div className='recentdocs-search-box'>
                <FiSearch className='search-icon' size={15} aria-hidden='true' />
                <input
                  type='text'
                  placeholder={t("searchFilter.searchPlaceholder", "Search by document, ref, or signer...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='recentdocs-search-input'
                  aria-label={t("searchFilter.searchPlaceholder", "Search documents")}
                />
                {searchQuery && (
                  <button
                    type='button'
                    className='search-clear-btn'
                    onClick={() => setSearchQuery("")}
                    aria-label='Clear search'
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* Advanced Filter Drawer Button (Refresh button removed as requested) */}
              <div className={`home-documents-filter-control ${hasActiveFilters ? "has-active-filters" : ""}`}>
                <RecentDocsFilter
                  startDate={startDate}
                  endDate={endDate}
                  docName={docName}
                  docStatus={docStatus}
                  referenceNo={referenceNo}
                  setDocStatus={setDocStatus}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  setDocName={setDocName}
                  setReferenceNo={setReferenceNo}
                  handleSearch={handleSearch}
                  clearSearch={clearSearch}
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Tabs (Seamlessly integrated on the same surface without dividing lines) */}
          <div className='recentdocs-filters-row'>
            <div className='home-documents-status-filters' role='group' aria-label={t("searchFilter.status")}>
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  type='button'
                  className={`home-status-filter${quickStatusFilter === filter.id ? " is-active" : ""}`}
                  aria-pressed={quickStatusFilter === filter.id}
                  onClick={() => handleQuickStatusFilter(filter.id)}
                >
                  <span>{filter.label}</span>
                  <span className='home-status-filter-count'>{statusCounts[filter.id] ?? 0}</span>
                </button>
              ))}
            </div>

            {hasVisibleFilters && (
              <button type='button' className='recentdocs-reset-filters-btn' onClick={clearSearch}>
                <FiX size={13} />
                <span>{t("searchFilter.reset", "Reset Filters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Data Table with Single Clean Header Divider */}
        <TableContainer
          component={Paper}
          className='custom-table-scrollbar tableHeight home-documents-table-container'
          role='region'
          tabIndex={0}
          aria-label={t("menuButtons.Alldocs")}
          style={{ maxWidth: "100%", overflowX: "auto" }}
        >
          <Table stickyHeader className='home-documents-table' style={{ border: "none", minWidth: "760px" }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.key} className='TableHeaderCell'>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleSearchResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className='home-documents-empty-state'>
                    <div className='empty-state-container'>
                      <div className='empty-state-icon-wrapper'>
                        <FiFileText size={32} />
                      </div>
                      <p className='empty-state-title'>
                        {loadError
                          ? t("searchFilter.loadError", "Could not load documents from the server")
                          : hasVisibleFilters
                          ? t("searchFilter.noSearchResults", "No matching documents found")
                          : t("dashboardCardStatuses.notDocsFound", "No documents found")}
                      </p>
                      <p className='empty-state-desc'>
                        {loadError
                          ? t("searchFilter.loadErrorHelp", "Please try again in a moment.")
                          : hasVisibleFilters
                          ? t("searchFilter.tryClearing", "Try clearing your search terms or date filters to see more results.")
                          : t("home.noDocsPrompt", "Uploaded documents and signature requests will appear here.")}
                      </p>
                      {loadError ? (
                        <button type='button' className='empty-state-reset-btn' onClick={() => fetchDocuments(appliedFilters)}>
                          {t("searchFilter.retry", "Retry")}
                        </button>
                      ) : hasVisibleFilters && (
                        <button type='button' className='empty-state-reset-btn' onClick={clearSearch}>
                          {t("searchFilter.clearAll", "Clear all filters")}
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {visibleSearchResults.map((row, index) => {
                const statusKey = getStatusBucket(row.docStatus);
                const statusLabel = statusKey === "bulk" && !String(row.docStatus ?? "").trim()
                  ? t("viewDetails.bulk", "Bulk")
                  : row.docStatus;
                const statusColor = statusColors[statusKey] || "var(--modern-violet)";

                return (
                  <TableRow
                    key={`${row.registerSignID || row.referenceNumber || row.docName || "document"}-${index}`}
                    className='home-doc-table-row'
                  >
                    {/* Document Name */}
                    <TableCell className='TableCell doc-name-cell'>
                      <div className='doc-name-wrapper'>
                        <div className='doc-icon-badge'>
                          <Icons.PDFs size={18} />
                        </div>
                        <span className='doc-name-text' title={row.docName}>
                          {row.docName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Pill */}
                    <TableCell className='TableCell'>
                      <span className='home-status-pill' style={{ "--status-color": statusColor }}>
                        <span className='status-dot' aria-hidden='true'></span>
                        {statusLabel}
                      </span>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className='TableCell date-cell'>
                      {row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "—"}
                    </TableCell>

                    {/* Reference Number */}
                    <TableCell className='TableCell truncate-ref-cell' title={row.referenceNumber || ""}>
                      <span className='mono-reference-text' title={row.referenceNumber || ""}>{row.referenceNumber || "—"}</span>
                    </TableCell>

                    {/* Created By */}
                    <TableCell className='TableCell creator-cell'>
                      <UserInitialsBadge name={row.createdByName} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

    </div>
  );
};

export default RecentDocsHome;
