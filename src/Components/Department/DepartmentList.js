import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
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
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Icons } from "@/assets/Icons";
import CreateDepartment from "./CreateDepartment";
import UpdateDepartment from "./UpdateDepartment";
import { useParams } from "react-router-dom";
import { Button, Dropdown, Modal } from "@/Components/UI/shadcnCompat";
import DepartmentSearchFilters from "./DepartmentSearchFilters";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { useUser } from "@/Context/UserContext";
import userService from "@/services/userService";
import { Building2, Search, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import "@/Pages/Home/Home.css";
import "@/Components/CreateTeam/style.css";

const DepartmentList = () => {
  const { t } = useTranslation();
  const { accountId } = useParams();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [templateToToggle, setTemplateToToggle] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showDepartCanvas, setShowDepartCanvas] = useState(false);

  // Advanced filter drawer state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState("");

  // Instant client-side filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  // Description view modal state
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedDepartmentTitle, setSelectedDepartmentTitle] = useState("");

  const { user, userAccess } = useUser();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fetch departments using the accountId
  const fetchDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAccountDepartments(accountId);

      if (response.data.statusCode === "1") {
        setDepartments(response.data.response || []);
      } else {
        toast.error(t("departmentList.errorFetching"));
      }
    } catch (error) {
      toast.error(t("departmentList.errorFetching"));
    } finally {
      setIsLoading(false);
    }
  }, [accountId, t]);

  useEffect(() => {
    if (accountId) {
      fetchDepartments();
    }
  }, [accountId, fetchDepartments]);

  const handleOpenUpdateModal = (department) => {
    setSelectedDepartment(department);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleOpenConfirmModal = (department) => {
    setTemplateToToggle(department);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleToggleStatus = async () => {
    if (templateToToggle) {
      const updatedData = {
        DepartmentID: templateToToggle.departmentID,
        Title: templateToToggle.title,
        Description: templateToToggle.description,
        IsActive: !templateToToggle.isActive,
      };

      try {
        const response = await userService.updateAccountDepartment(updatedData);

        if (response.data.statusCode === "1") {
          toast.success(t("departmentList.updateSuccess"));
          fetchDepartments();
        } else {
          toast.error(t("departmentList.updateFailed"));
        }
      } catch (error) {
        toast.error(t("departmentList.updateFailed"));
      } finally {
        setShowConfirmModal(false);
      }
    }
  };

  const fetchDepartmentFilter = async (filters = {}) => {
    try {
      setIsLoading(true);
      const response = await userService.getAccountDepartments(accountId, filters);
      if (response.data.statusCode === "1") {
        setDepartments(response.data.response || []);
        setPage(0);
      } else {
        toast.error(t("departmentList.errorFetching"));
      }
    } catch (error) {
      toast.error(t("departmentList.errorFetching"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setStatusTab("all");
    setSearchQuery("");
    fetchDepartmentFilter({
      title,
      description,
      isActive: isActive === "" ? "" : isActive === "true",
    });
  };

  const clearSearch = () => {
    setTitle("");
    setDescription("");
    setIsActive("");
    setSearchQuery("");
    setStatusTab("all");
    setPage(0);
    fetchDepartments();
  };

  // Status counts for tab chips
  const statusCounts = useMemo(() => {
    const counts = { all: departments.length, active: 0, inactive: 0 };
    departments.forEach((dept) => {
      if (dept.isActive) {
        counts.active += 1;
      } else {
        counts.inactive += 1;
      }
    });
    return counts;
  }, [departments]);

  // Client-side quick filter and text search
  const visibleDepartments = useMemo(() => {
    let list = departments;

    if (statusTab === "active") {
      list = list.filter((dept) => Boolean(dept.isActive));
    } else if (statusTab === "inactive") {
      list = list.filter((dept) => !dept.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (dept) =>
          (dept.title && dept.title.toLowerCase().includes(q)) ||
          (dept.description && dept.description.toLowerCase().includes(q)) ||
          (dept.createdbyName && dept.createdbyName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [departments, statusTab, searchQuery]);

  const statusTabs = [
    { id: "all", label: t("departmentList.all", "All") },
    { id: "active", label: t("emailTemplates.active", "Active") },
    { id: "inactive", label: t("emailTemplates.inactive", "Inactive") },
  ];

  const columns = [
    { label: t("tablesLabel.departName", "Department Name"), key: "title" },
    { label: t("departmentList.description", "Description"), key: "description" },
    { label: t("tablesLabel.date", "Created On"), key: "createdon" },
    { label: t("tablesLabel.status", "Status"), key: "status" },
    { label: t("departmentList.createdby", "Created By"), key: "createdby" },
    { label: "", key: "actions" },
  ];

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

    return `${day}/${month}/${year} - ${hours}:${formattedMinutes} ${ampm}`;
  };

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const handleDescriptionClick = (desc, deptTitle) => {
    setSelectedDescription(desc);
    setSelectedDepartmentTitle(deptTitle);
    setShowDescriptionModal(true);
  };

  const handleCloseDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSelectedDescription("");
    setSelectedDepartmentTitle("");
  };

  const hasAdvancedFilters = Boolean(title || description || isActive !== "");
  const hasVisibleFilters = Boolean(hasAdvancedFilters || statusTab !== "all" || searchQuery);

  return (
    <>
      {user.AccountType === "B" && user.RoleID === 2 && userAccess.remainingDays <= 0 ? (
        <UserLisence />
      ) : userAccess.teams === true ? (
        <div className='w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)] font-sans department-admin-page'>
          <div className='w-full max-w-[1560px] mx-auto p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
            {/* Unified Hero Toolbar */}
            <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                  <Building2 size={20} />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-[var(--modern-text)] m-0'>
                      {t("departmentList.departmentListTitle", "Department List")}
                    </h1>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                      {visibleDepartments.length}{" "}
                      {visibleDepartments.length === 1
                        ? t("departmentList.department", "department")
                        : t("departmentList.departments", "departments")}
                    </span>
                  </div>
                  <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                    {t("departmentList.manageSubtitle", "Manage company departments and organizational units")}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2.5 flex-wrap ml-auto'>
                {/* Instant Quick Search */}
                <div className='recentdocs-search-box'>
                  <Search className='search-icon' size={15} aria-hidden='true' />
                  <input
                    type='text'
                    placeholder={t("departmentList.searchPlaceholder", "Search by title, description, creator...")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
                    className='recentdocs-search-input'
                    aria-label='Search departments'
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

                {/* Filter Drawer */}
                <div className='search-filters-container'>
                  <DepartmentSearchFilters
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                  />
                </div>

                {/* Create Department Primary Action */}
                <CreateDepartment
                  accountID={accountId}
                  fetchDepartments={fetchDepartments}
                  showOffcanvas={showDepartCanvas}
                  setShowOffcanvas={setShowDepartCanvas}
                />
              </div>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className='recentdocs-filters-row mb-4'>
              <div className='home-documents-status-filters' role='group' aria-label={t("tablesLabel.status")}>
                {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type='button'
                    className={`home-status-filter${statusTab === tab.id ? " is-active" : ""}`}
                    aria-pressed={statusTab === tab.id}
                    onClick={() => {
                      setStatusTab(tab.id);
                      setPage(0);
                    }}
                  >
                    <span>{tab.label}</span>
                    <span className='home-status-filter-count'>{statusCounts[tab.id] ?? 0}</span>
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

            {/* Modern Table Container */}
            <TableContainer
              component={Paper}
              className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
              style={{
                maxWidth: "100%",
                overflowX: "auto",
                minHeight: "420px",
                height: "calc(100vh - 300px)",
                maxHeight: "calc(100vh - 300px)",
              }}
            >
              <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.label || "actions"} className='TableHeaderCell'>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                        <TableEmptyState
                          icon={<Building2 size={42} className='text-[var(--modern-muted)]' />}
                          title={
                            hasVisibleFilters
                              ? t("searchFilter.noSearchResults", "No matching departments found")
                              : t("departmentList.noDepartmentsFound", "No departments found")
                          }
                          description={
                            hasVisibleFilters
                              ? t("searchFilter.tryClearing", "Try clearing your search terms or filters to see more results.")
                              : t("createDepartment.enterTitle", "Add departments to organize your team members.")
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
                  ) : (
                    visibleDepartments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((department, index) => (
                        <TableRow key={department.departmentID || index} className='hover:bg-[var(--modern-raised)] transition-colors'>
                          {/* Department Name */}
                          <TableCell className='TableCell truncate-cell' onClick={handleCellClick}>
                            <div className='flex items-center gap-2.5 font-medium text-[var(--modern-text)]'>
                              <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--modern-violet-soft)] text-[var(--modern-violet)] shrink-0'>
                                <Building2 size={15} />
                              </div>
                              <span className='truncate' title={department.title}>
                                {department.title}
                              </span>
                            </div>
                          </TableCell>

                          {/* Description */}
                          <TableCell
                            className={`TableCell truncate-cell ${department.description?.length > 50 ? "cursor-pointer hover:text-[var(--modern-violet)]" : ""}`}
                            onClick={(e) =>
                              department.description?.length > 50
                                ? handleDescriptionClick(department.description, department.title)
                                : handleCellClick(e)
                            }
                            title={department.description}
                          >
                            <span className='text-xs text-[var(--modern-muted)]'>
                              {department.description ? (
                                department.description.length > 50 ? (
                                  <>
                                    {department.description.slice(0, 50)}...
                                    <span className='ml-1 text-[var(--modern-violet)] font-semibold'>
                                      {t("departmentList.viewDetails", "More")}
                                    </span>
                                  </>
                                ) : (
                                  department.description
                                )
                              ) : (
                                "—"
                              )}
                            </span>
                          </TableCell>

                          {/* Created On */}
                          <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                            {department.createdOnFormatted ? formatDate(department.createdOnFormatted) : "—"}
                          </TableCell>

                          {/* Status Pill */}
                          <TableCell className='TableCell'>
                            <span
                              className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold'
                              style={{
                                color: department.isActive ? "var(--modern-success, #16a34a)" : "var(--modern-muted)",
                                backgroundColor: department.isActive
                                  ? "color-mix(in srgb, var(--modern-success, #16a34a) 12%, var(--modern-card))"
                                  : "var(--modern-raised)",
                                border: `1px solid ${
                                  department.isActive
                                    ? "color-mix(in srgb, var(--modern-success, #16a34a) 30%, transparent)"
                                    : "var(--modern-border)"
                                }`,
                              }}
                            >
                              <span
                                className='w-1.5 h-1.5 rounded-full'
                                style={{
                                  backgroundColor: department.isActive
                                    ? "var(--modern-success, #16a34a)"
                                    : "var(--modern-muted)",
                                }}
                              />
                              {department.isActive ? t("emailTemplates.active", "Active") : t("emailTemplates.inactive", "Inactive")}
                            </span>
                          </TableCell>

                          {/* Created By */}
                          <TableCell className='TableCell truncate-cell' onClick={handleCellClick}>
                            <UserInitialsBadge name={department.createdbyName} />
                          </TableCell>

                          {/* Actions */}
                          <TableCell className='py-0 text-right'>
                            <Dropdown>
                              <Dropdown.Toggle as={CustomToggle} />
                              <Dropdown.Menu align='end' className='rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-1.5 shadow-none'>
                                {department.isActive ? (
                                  <Dropdown.Item
                                    className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors'
                                    onClick={() => handleOpenConfirmModal(department)}
                                  >
                                    <Icons.InactiveAction size={16} />
                                    <span>{t("departmentList.deactivate", "Deactivate")}</span>
                                  </Dropdown.Item>
                                ) : (
                                  <Dropdown.Item
                                    className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors'
                                    onClick={() => handleOpenConfirmModal(department)}
                                  >
                                    <Icons.Active size={16} color='var(--modern-success, #16a34a)' />
                                    <span>{t("departmentList.activate", "Activate")}</span>
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item
                                  className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[var(--modern-text)] hover:bg-[var(--modern-raised)] transition-colors'
                                  onClick={() => handleOpenUpdateModal(department)}
                                >
                                  <Icons.EditSquare size={16} />
                                  <span>{t("userProfile.update", "Update")}</span>
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Modern Pagination Row */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4'>
              <div className='text-xs text-[var(--modern-muted)]'>
                {visibleDepartments.length ? page * rowsPerPage + 1 : 0} -{" "}
                {Math.min((page + 1) * rowsPerPage, visibleDepartments.length)}{" "}
                {t("departmentList.departmentof", "of")} {visibleDepartments.length}{" "}
                {t("departmentList.department", "department")}
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.max(1, Math.ceil(visibleDepartments.length / rowsPerPage))}
                  variant='outlined'
                  shape='rounded'
                  page={Math.min(page + 1, Math.max(1, Math.ceil(visibleDepartments.length / rowsPerPage)))}
                  onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                />
              </Stack>
            </div>
          </div>

          <UpdateDepartment
            show={showUpdateModal}
            handleClose={handleCloseUpdateModal}
            selectedDepartment={selectedDepartment}
            fetchDepartments={fetchDepartments}
          />

          {/* Modern Status Confirmation Modal */}
          <Modal
            show={showConfirmModal}
            onHide={handleCloseConfirmModal}
            centered
            dialogClassName='max-w-md'
            backdrop='static'
            keyboard={false}
          >
            <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
              <div className='flex items-center gap-3'>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    templateToToggle && templateToToggle.isActive
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {templateToToggle && templateToToggle.isActive ? (
                    <AlertTriangle size={20} />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                </div>
                <div>
                  <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
                    {t("emailTemplates.Confirmation", "Confirmation")}
                  </Modal.Title>
                  <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5 truncate max-w-[220px]'>
                    {templateToToggle?.title}
                  </p>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)] text-sm'>
              {templateToToggle && templateToToggle.isActive
                ? t("departmentList.sureDeactivate")
                : t("departmentList.sureActive")}
            </Modal.Body>
            <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-3.5 bg-[var(--modern-card)] flex justify-end gap-3'>
              <Button
                variant='outline'
                className='px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-raised)]'
                onClick={handleCloseConfirmModal}
              >
                {t("dashboardCardStatuses.cancel", "Cancel")}
              </Button>
              <Button
                variant='primary'
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white ${
                  templateToToggle && templateToToggle.isActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
                onClick={handleToggleStatus}
              >
                {t("dashboardCardStatuses.confirm", "Confirm")}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modern Description Modal */}
          <Modal
            show={showDescriptionModal}
            onHide={handleCloseDescriptionModal}
            centered
            dialogClassName='max-w-md'
          >
            <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                  <Building2 size={20} />
                </div>
                <div>
                  <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0 truncate max-w-[240px]'>
                    {selectedDepartmentTitle}
                  </Modal.Title>
                  <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                    {t("departmentList.description", "Description")}
                  </p>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
              <p className='text-sm leading-relaxed whitespace-pre-wrap break-words m-0 text-[var(--modern-text)]'>
                {selectedDescription}
              </p>
            </Modal.Body>
            <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-3 bg-[var(--modern-card)] flex justify-end'>
              <Button
                variant='outline'
                className='px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-raised)]'
                onClick={handleCloseDescriptionModal}
              >
                {t("dashboardCardStatuses.close", "Close")}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : null}
    </>
  );
};

export default DepartmentList;
