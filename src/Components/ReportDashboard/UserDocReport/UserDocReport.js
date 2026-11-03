import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmptyState,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  UserInitialsBadge,
} from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import { useUser } from "@/Context/UserContext";
import { Download, FileSpreadsheet, FileText, Users, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DocStatusFilter from "./DocStatusFilter";
import documentService from "@/services/documentService";
import userService from "@/services/userService";
import "@/Pages/Home/Home.css";
import "../CompanyAdminPanel/style.css";

function UserDocReport() {
  const { t } = useTranslation();
  const { user, showCompanyName, userAccess } = useUser();

  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [fullName, setFullName] = useState("");
  const [emailID, setEmailID] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fetch document statistics for users
  const fetchDocumentStatistics = useCallback(async (users) => {
    const statsPromises = users.map(async (user) => {
      try {
        setIsLoading(true);
        const response = await documentService.getAppUserDocsCount(user.appUserID);

        return {
          appUserID: user.appUserID,
          stats: response.data.statusCode === "1" ? response.data.response : null,
        };
      } catch (error) {
        return {
          appUserID: user.appUserID,
          stats: null,
        };
      } finally {
        setIsLoading(false);
      }
    });

    try {
      const results = await Promise.all(statsPromises);
      const statsMap = {};
      results.forEach((result) => {
        if (result.stats) {
          statsMap[result.appUserID] = result.stats;
        }
      });

      return statsMap;
    } catch (error) {
      console.error("Error fetching document statistics:", error);
      return {};
    }
  }, []);

  // Fetch team members with document status
  const fetchUserDocumentStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user.AccountID) {
        return;
      }
      const response = await userService.getAppUserTeam(user.AccountID);
      const users = response.data.response || [];

      // Fetch document statistics for all users
      const statsMap = await fetchDocumentStatistics(users);

      // Process the data to include document status counts from API
      const processedData = users.map((user) => {
        const userStats = statsMap[user.appUserID] || {};
        return {
          ...user,
          draft: userStats.draftCount || 0,
          completed: userStats.completedCount || 0,
          pending: userStats.pendingCount || 0,
          shared: userStats.sharedCount || 0,
          declined: userStats.declineCount || 0,
          inactive: userStats.inActiveCount || 0,
          recalled: userStats.recalledCount || 0,
        };
      });

      setSearchResults(processedData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [user.AccountID, fetchDocumentStatistics]);

  // Drawer Search function
  const handleUserSearch = async () => {
    try {
      setIsLoading(true);
      setSearchQuery("");
      const response = await userService.getAppUserTeam(user.AccountID, {
        fullName,
        emailID,
      });

      const users = response.data.response || [];
      const statsMap = await fetchDocumentStatistics(users);

      const processedData = users.map((user) => {
        const userStats = statsMap[user.appUserID] || {};
        return {
          ...user,
          draft: userStats.draftCount || 0,
          completed: userStats.completedCount || 0,
          pending: userStats.pendingCount || 0,
          shared: userStats.sharedCount || 0,
          declined: userStats.declineCount || 0,
          inactive: userStats.inActiveCount || 0,
          recalled: userStats.recalledCount || 0,
        };
      });

      setSearchResults(processedData);
      setPage(0);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search function
  const clearUserSearch = () => {
    setFullName("");
    setEmailID("");
    setSearchQuery("");
    setPage(0);
    fetchUserDocumentStatus();
  };

  useEffect(() => {
    fetchUserDocumentStatus();
  }, [fetchUserDocumentStatus]);

  // Client-side instant quick search
  const visibleResults = useMemo(() => {
    let list = searchResults;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (row) =>
          (row.fullName && row.fullName.toLowerCase().includes(q)) ||
          (row.emailID && row.emailID.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchResults, searchQuery]);

  const columns = [
    { label: t("tablesLabel.serialNo", "Sr. No"), key: "srNo" },
    { label: t("tablesLabel.name", "Name"), key: "fullName" },
    { label: t("tablesLabel.email", "Email"), key: "emailID" },
    { label: t("menuButtons.draft", "Draft"), key: "draft" },
    { label: t("menuButtons.completed", "Completed"), key: "completed" },
    { label: t("menuButtons.pending", "Pending"), key: "pending" },
    { label: t("menuButtons.shared", "Shared"), key: "shared" },
    { label: t("menuButtons.declined", "Declined"), key: "declined" },
    { label: t("menuButtons.inactive", "Inactive"), key: "inactive" },
    { label: t("menuButtons.recalled", "Recalled"), key: "recalled" },
  ];

  const exportToExcel = () => {
    const worksheetData = visibleResults.map((row, index) => ({
      "Sr. No": index + 1,
      Name: row.fullName || "",
      Email: row.emailID || "",
      Draft: row.draft ?? 0,
      Completed: row.completed ?? 0,
      Pending: row.pending ?? 0,
      Shared: row.shared ?? 0,
      Declined: row.declined ?? 0,
      Inactive: row.inactive ?? 0,
      Recalled: row.recalled ?? 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Document Status");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data_blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data_blob, "UserDocumentStatus.xlsx");
  };

  const exportToWord = () => {
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>User Document Status</title></head><body>";
    const footer = "</body></html>";

    let htmlTable =
      '<table border="1" style="border-collapse: collapse; width: 100%;">' +
      "<tr><th>Sr. No</th><th>Name</th><th>Email</th><th>Draft</th><th>Completed</th><th>Pending</th><th>Shared</th><th>Declined</th><th>Inactive</th><th>Recalled</th></tr>";

    visibleResults.forEach((row, index) => {
      htmlTable += `<tr>
        <td>${index + 1}</td>
        <td>${row.fullName || ""}</td>
        <td>${row.emailID || ""}</td>
        <td>${row.draft ?? 0}</td>
        <td>${row.completed ?? 0}</td>
        <td>${row.pending ?? 0}</td>
        <td>${row.shared ?? 0}</td>
        <td>${row.declined ?? 0}</td>
        <td>${row.inactive ?? 0}</td>
        <td>${row.recalled ?? 0}</td>
      </tr>`;
    });

    htmlTable += "</table>";
    const sourceHTML = header + htmlTable + footer;
    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });
    saveAs(blob, "UserDocumentStatus.doc");
  };

  const hasAdvancedFilters = Boolean(fullName || emailID);
  const hasVisibleFilters = Boolean(hasAdvancedFilters || searchQuery);

  return (
    <>
      {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
        <div className='w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)] font-sans users-report-page user-document-report'>
          <div className='w-full max-w-[1560px] mx-auto p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
            {/* Unified Hero Toolbar matching DepartmentList & CreateTeam */}
            <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                  <Users size={20} />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-[var(--modern-text)] m-0'>
                      {t("createTeam.userDocStatus", "User documents status report")}
                    </h1>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                      {visibleResults.length}{" "}
                      {visibleResults.length === 1 ? t("tablesLabel.user", "user") : t("tablesLabel.users", "users")}
                    </span>
                  </div>
                  <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                    {showCompanyName ? (
                      <span>
                        <span className='font-semibold text-[var(--modern-text)]'>{showCompanyName}</span>{" "}
                        {t("createTeam.userDocs")}
                      </span>
                    ) : (
                      t("createTeam.userDocStatusSubtitle", "Track and audit document lifecycle counts per team member")
                    )}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2.5 flex-wrap ml-auto'>
                {/* Instant Quick Search */}
                <div className='recentdocs-search-box'>
                  <Search className='search-icon' size={15} aria-hidden='true' />
                  <input
                    type='text'
                    placeholder={t("createTeam.searchUserDocPlaceholder", "Search by user name or email...")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
                    className='recentdocs-search-input'
                    aria-label='Search users'
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

                {/* Modern Export Dropdown */}
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
                <div className='search-filters-container doc-report-filter-container'>
                  <DocStatusFilter
                    fullName={fullName}
                    emailID={emailID}
                    setFullName={setFullName}
                    setEmailID={setEmailID}
                    handleSearch={handleUserSearch}
                    clearSearch={clearUserSearch}
                  />
                </div>
              </div>
            </div>

            {hasVisibleFilters && (
              <div className='flex items-center justify-end mb-3'>
                <button type='button' className='recentdocs-reset-filters-btn' onClick={clearUserSearch}>
                  <X size={13} />
                  <span>{t("searchFilter.reset", "Reset Filters")}</span>
                </button>
              </div>
            )}

            {/* Table Container */}
            <TableContainer
              component={Paper}
              className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
              style={{
                maxWidth: "100%",
                overflowX: "auto",
                minHeight: "440px",
                height: "calc(100vh - 300px)",
                maxHeight: "calc(100vh - 300px)",
              }}
            >
              <Table stickyHeader style={{ border: "none", minWidth: "900px" }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.key || column.label} className='TableHeaderCell'>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                        <TableEmptyState
                          icon={<Users size={42} className='text-[var(--modern-muted)]' />}
                          title={
                            hasVisibleFilters
                              ? t("searchFilter.noSearchResults", "No matching users found")
                              : t("createTeam.noUserFound", "No user data found")
                          }
                          description={
                            hasVisibleFilters
                              ? t("searchFilter.tryClearing", "Try clearing your search terms or filters to see more results.")
                              : t("createTeam.userDocs", "User document status counts will appear here.")
                          }
                          actionButton={
                            hasVisibleFilters ? (
                              <button
                                type='button'
                                className='px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-hover)] transition-colors'
                                onClick={clearUserSearch}
                              >
                                {t("searchFilter.clearAll", "Clear all filters")}
                              </button>
                            ) : null
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleResults
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={row.appUserID || index} className='hover:bg-[var(--modern-raised)] transition-colors'>
                          {/* Sr No */}
                          <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                            {page * rowsPerPage + index + 1}
                          </TableCell>

                          {/* Full Name with Avatar */}
                          <TableCell className='TableCell'>
                            <UserInitialsBadge name={row.fullName} />
                          </TableCell>

                          {/* Email */}
                          <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                            {row.emailID}
                          </TableCell>

                          {/* Draft Count */}
                          <TableCell className='TableCell'>
                            <span className='report-count report-count--draft font-semibold'>
                              {row.draft ?? 0}
                            </span>
                          </TableCell>

                          {/* Completed Count */}
                          <TableCell className='TableCell'>
                            <span className='report-count report-count--completed font-semibold'>
                              {row.completed ?? 0}
                            </span>
                          </TableCell>

                          {/* Pending Count */}
                          <TableCell className='TableCell'>
                            <span className='report-count report-count--pending font-semibold'>
                              {row.pending ?? 0}
                            </span>
                          </TableCell>

                          {/* Shared Count */}
                          <TableCell className='TableCell'>
                            <span className='report-count report-count--shared font-semibold'>
                              {row.shared ?? 0}
                            </span>
                          </TableCell>

                          {/* Declined Count */}
                          <TableCell className='TableCell'>
                            <span className='report-count report-count--declined font-semibold'>
                              {row.declined ?? 0}
                            </span>
                          </TableCell>

                          {/* Inactive Count */}
                          <TableCell className='TableCell'>
                            <span className='report-count report-count--inactive font-semibold'>
                              {row.inactive ?? 0}
                            </span>
                          </TableCell>

                          {/* Recalled Count */}
                          <TableCell className='TableCell'>
                            <span className='report-count report-count--recalled font-semibold'>
                              {row.recalled ?? 0}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4'>
              <div className='text-xs text-[var(--modern-muted)]'>
                {visibleResults.length ? page * rowsPerPage + 1 : 0} -{" "}
                {Math.min((page + 1) * rowsPerPage, visibleResults.length)} {t("tablesLabel.existing")}{" "}
                {visibleResults.length} {t("tablesLabel.existingUser")}
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.max(1, Math.ceil(visibleResults.length / rowsPerPage))}
                  variant='outlined'
                  shape='rounded'
                  page={Math.min(page + 1, Math.max(1, Math.ceil(visibleResults.length / rowsPerPage)))}
                  onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                />
              </Stack>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default UserDocReport;
