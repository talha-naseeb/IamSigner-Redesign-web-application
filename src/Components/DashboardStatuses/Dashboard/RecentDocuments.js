import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmptyState,
  TableHead,
  TableRow,
  Stack,
  Pagination,
  UserInitialsBadge,
} from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import RecentDocsFilter from "./RecentDocsFilter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet, FileText, Search, X } from "lucide-react";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import documentService from "@/services/documentService";
import { Icons } from "@/assets/Icons";
import "@/Pages/Home/Home.css";

const getStatusBucket = (value) => {
  const status = String(value ?? "").trim().toLowerCase();
  if (!status) return "bulk";
  if (status.includes("pending")) return "pending";
  if (status.includes("draft")) return "draft";
  if (status.includes("complet") || status.includes("signed")) return "completed";
  if (status.includes("bulk")) return "bulk";
  return status;
};

const RecentDocuments = () => {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const { user, userAccess } = useUser();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const [docName, setDocName] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [quickStatusFilter, setQuickStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const latestRequest = useRef(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fetch all documents from server
  const fetchAllDocs = useCallback(async (filters = {}) => {
    setIsLoading(true);
    const requestId = ++latestRequest.current;
    try {
      const response = await documentService.getRecentDocs(filters);
      if (requestId !== latestRequest.current) return;
      if (response?.data?.successStatus) {
        const rows = Array.isArray(response.data.response) ? response.data.response : [];
        setData(rows);
        setSearchResults(rows);
        setPage(0);
      }
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setData([]);
      setSearchResults([]);
    } finally {
      if (requestId === latestRequest.current) {
        setIsLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    fetchAllDocs();
  }, [fetchAllDocs]);

  const handleSearch = async () => {
    setQuickStatusFilter("all");
    setSearchQuery("");
    await fetchAllDocs({
      StartDate: startDate,
      EndDate: endDate,
      DocStatus: docStatus,
      DocName: docName.trim(),
      ReferenceNo: referenceNo.trim(),
    });
  };

  const handleQuickStatusFilter = (status) => {
    setQuickStatusFilter(status);
    setPage(0);
  };

  const clearSearch = () => {
    setPage(0);
    setStartDate("");
    setEndDate("");
    setDocStatus("");
    setDocName("");
    setReferenceNo("");
    setQuickStatusFilter("all");
    setSearchQuery("");
    fetchAllDocs();
  };

  // Status counts based on server results
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

  // Client-side quick filtering and instant text search
  const visibleSearchResults = useMemo(() => {
    let list = searchResults;

    if (quickStatusFilter && quickStatusFilter !== "all") {
      list = list.filter((row) => getStatusBucket(row.docStatus) === quickStatusFilter);
    }

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
    completed: "var(--completed-status, #10b981)",
    draft: "var(--draft-status, #4c8bff)",
    declined: "var(--decline-status, #ef4444)",
    inactive: "var(--inactive-status, #64748b)",
    pending: "var(--pending-status, #f59e0b)",
    share: "var(--share-status, #06b6d4)",
    recalled: "var(--recall-status, #06b6d4)",
    bulk: "var(--share-status, #8b6cff)",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedMinutes = (minutes < 10 ? "0" : "") + minutes;

    return `${day}/${month}/${year} ${hours}:${formattedMinutes} ${ampm}`;
  };

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const exportToExcel = () => {
    const worksheetData = visibleSearchResults.map((row) => ({
      "Document Name": row.docName || "",
      "Date & Time": row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "",
      "Reference Number": row.referenceNumber || "",
      Status: row.docStatus === "" ? "Bulk" : row.docStatus || "",
      "Created By": row.createdByName || "",
      "Document Number": row.regCompanyPrefixNo || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const fileName = `Documents_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(blob, fileName);
  };

  const exportToWord = () => {
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Documents Report</title></head><body>";
    const footer = "</body></html>";

    let htmlTable =
      '<table border="1" style="border-collapse: collapse; width: 100%;">' +
      "<tr><th>Document Name</th><th>Date & Time</th><th>Reference Number</th><th>Status</th><th>Created By</th><th>Document Number</th></tr>";

    visibleSearchResults.forEach((row) => {
      htmlTable += `<tr>
        <td>${row.docName || ""}</td>
        <td>${row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</td>
        <td>${row.referenceNumber || ""}</td>
        <td>${row.docStatus === "" ? "Bulk" : row.docStatus || ""}</td>
        <td>${row.createdByName || ""}</td>
        <td>${row.regCompanyPrefixNo || ""}</td>
      </tr>`;
    });

    htmlTable += "</table>";

    const source = header + htmlTable + footer;
    const blob = new Blob(["\ufeff", source], {
      type: "application/msword",
    });
    saveAs(blob, `Documents_Report_${new Date().toISOString().split("T")[0]}.doc`);
  };

  const hasActiveFilters = Boolean(startDate || endDate || docStatus || docName || referenceNo);
  const hasVisibleFilters = Boolean(hasActiveFilters || quickStatusFilter !== "all" || searchQuery);

  return (
    <div className='w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)] font-sans'>
      {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
        <div className='w-full max-w-[1560px] mx-auto p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
          {/* Top Bar matching RecentDocsHome */}
          <div className='recentdocs-top-bar'>
            <div className='recentdocs-header-row'>
              <div className='recentdocs-title-group'>
                <div className='flex items-center gap-2'>
                  <h1 className='recentdocs-title m-0 text-xl sm:text-2xl font-bold tracking-tight text-[var(--modern-text)]'>
                    {t("menuButtons.Alldocs", "All documents")}
                  </h1>
                  <span className='recentdocs-badge'>
                    {visibleSearchResults.length} {visibleSearchResults.length === 1 ? t("tablesLabel.document", "document") : t("tablesLabel.documents", "documents")}
                  </span>
                </div>
                <p className='recentdocs-subtitle'>{t("home.documentOverview", "A quick look at your document activity.")}</p>
              </div>

              <div className='recentdocs-actions-group'>
                {/* Instant Quick Search Box */}
                <div className='recentdocs-search-box'>
                  <Search className='search-icon' size={15} aria-hidden='true' />
                  <input
                    type='text'
                    placeholder={t("searchFilter.searchPlaceholder", "Search by document, ref, or signer...")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
                    className='recentdocs-search-input'
                    aria-label={t("searchFilter.searchPlaceholder", "Search documents")}
                  />
                  {searchQuery && (
                    <button
                      type='button'
                      className='search-clear-btn'
                      onClick={() => {
                        setSearchQuery("");
                        setPage(0);
                      }}
                      aria-label='Clear search'
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Export Dropdown */}
                <Dropdown className='modern-export-dropdown'>
                  <Dropdown.Toggle
                    variant='none'
                    size='sm'
                    className='modern-export-btn'
                  >
                    <Download size={14} className='shrink-0' />
                    <span>{t("createTeam.Export", "Export")}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align='end' className='modern-export-menu'>
                    <Dropdown.Item onClick={exportToExcel} className='modern-export-item'>
                      <FileSpreadsheet size={16} className='text-emerald-500 shrink-0' />
                      <span>{t("createTeam.exportExcel", "Export to Excel")}</span>
                    </Dropdown.Item>

                    <Dropdown.Item onClick={exportToWord} className='modern-export-item'>
                      <FileText size={16} className='text-blue-500 shrink-0' />
                      <span>{t("createTeam.exportWord", "Export to Word")}</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Advanced Filter Drawer */}
                <div className={`home-documents-filter-control ${hasActiveFilters ? "has-active-filters" : ""}`}>
                  <RecentDocsFilter
                    startDate={startDate}
                    endDate={endDate}
                    docStatus={docStatus}
                    docName={docName}
                    referenceNo={referenceNo}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setDocStatus={setDocStatus}
                    setDocName={setDocName}
                    setReferenceNo={setReferenceNo}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                  />
                </div>
              </div>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className='recentdocs-filters-row mt-3'>
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
                  <X size={13} />
                  <span>{t("searchFilter.reset", "Reset Filters")}</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <TableContainer
            component={Paper}
            className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)] mt-4'
            style={{
              maxWidth: "100%",
              overflowX: "auto",
              minHeight: "440px",
              height: "calc(100vh - 300px)",
              maxHeight: "calc(100vh - 300px)",
            }}
          >
            <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
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
                    <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                      <TableEmptyState
                        icon={<FileText size={42} className='text-[var(--modern-muted)]' />}
                        title={
                          hasVisibleFilters
                            ? t("searchFilter.noSearchResults", "No matching documents found")
                            : t("dashboardCardStatuses.notDocsFound", "No documents found")
                        }
                        description={
                          hasVisibleFilters
                            ? t("searchFilter.tryClearing", "Try clearing your search terms or filters to see more results.")
                            : t("home.noDocsPrompt", "Uploaded documents and signature requests will appear here.")
                        }
                        actionButton={
                          hasVisibleFilters ? (
                            <button
                              type='button'
                              className='px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-hover)] transition-colors'
                              onClick={clearSearch}
                            >
                              {t("searchFilter.clearAll", "Clear all filters")}
                            </button>
                          ) : null
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}

                {visibleSearchResults
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const statusKey = getStatusBucket(row.docStatus);
                    const statusLabel =
                      statusKey === "bulk" && !String(row.docStatus ?? "").trim()
                        ? t("viewDetails.bulk", "Bulk")
                        : row.docStatus || "Bulk";
                    const statusColor = statusColors[statusKey] || "var(--share-status)";

                    return (
                      <TableRow key={`${row.registerSignID || row.referenceNumber || "doc"}-${index}`} className='hover:bg-[var(--modern-raised)] transition-colors'>
                        {/* Document Name with PDF Icon Tile */}
                        <TableCell className='TableCell doc-name-cell'>
                          <div className='doc-name-wrapper flex items-center gap-2.5'>
                            <div className='doc-icon-badge shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                              <Icons.PDFs size={18} />
                            </div>
                            <span
                              className='doc-name-text font-medium text-[var(--modern-text)] truncate max-w-xs'
                              title={row.docName}
                              onClick={handleCellClick}
                            >
                              {row.docName}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status Pill with Dot */}
                        <TableCell className='TableCell'>
                          <span className='home-status-pill' style={{ "--status-color": statusColor }}>
                            <span className='status-dot' aria-hidden='true'></span>
                            {statusLabel}
                          </span>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                          {row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "—"}
                        </TableCell>

                        {/* Reference Number */}
                        <TableCell
                          className='TableCell truncate-cell truncate-ref-cell'
                          title={row.referenceNumber || ""}
                          onClick={handleCellClick}
                        >
                          <span className='mono-reference-text font-mono text-xs text-[var(--modern-muted)]'>
                            {row.referenceNumber || "—"}
                          </span>
                        </TableCell>

                        {/* Created By Avatar */}
                        <TableCell className='TableCell truncate-cell' onClick={handleCellClick}>
                          <UserInitialsBadge name={row.createdByName} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4'>
            <div className='text-xs text-[var(--modern-muted)]'>
              {visibleSearchResults.length ? page * rowsPerPage + 1 : 0} -{" "}
              {Math.min((page + 1) * rowsPerPage, visibleSearchResults.length)}{" "}
              {t("tablesLabel.documentsof", "of")} {visibleSearchResults.length}{" "}
              {t("tablesLabel.document", "documents")}
            </div>
            <Stack spacing={2}>
              <Pagination
                count={Math.max(1, Math.ceil(visibleSearchResults.length / rowsPerPage))}
                variant='outlined'
                shape='rounded'
                page={Math.min(page + 1, Math.max(1, Math.ceil(visibleSearchResults.length / rowsPerPage)))}
                onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
              />
            </Stack>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RecentDocuments;
