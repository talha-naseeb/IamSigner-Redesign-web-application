import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Modal, Button, Form, Dropdown } from "@/Components/UI/shadcnCompat";
import "./style.css";
import "@/Pages/Home/Home.css";
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
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CreateTeamForm from "./CreateTeamForm";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import UserLisence from "@/Components/UserLisence/UserLisence";
import UserSearchFilter from "./UserSearchFilter";
import ViewTeamDetails from "./ViewTeamDetails";
import PhoneInput from "react-phone-input-2";
import userService from "@/services/userService";
import { exportTeamDocumentsCsv, exportTeamDocumentsWord, fetchTeamDocuments } from "@/utils/teamDocumentExport";

function CreateTeam() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedAppUserId, setSelectedAppUserId] = useState("");
  const [selectedIsActive, setSelectedIsActive] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingDocuments, setIsExportingDocuments] = useState(false);
  const [data, setData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { user, userAccess } = useUser();

  // Advanced Drawer Search State
  const [fullName, setFullName] = useState("");
  const [emailID, setEmailID] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState(undefined);
  const [department, setDepartment] = useState("");

  // Instant Quick Search and Status Tab State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [viewDetailsAppUserID, setViewDetailsAppUserID] = useState("");
  const [departments, setDepartments] = useState([]);
  const [updatePhoneNumber, setUpdatePhoneNumber] = useState("");
  const { register, reset } = useForm();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const [updateUserData, setUpdateUserData] = useState({
    UserName: "",
    FullName: "",
    EmailID: "",
    DepartmentID: "",
    MobileNumber: "",
    RoleID: "",
  });

  const [errors, setErrors] = useState({
    FullName: "",
    UserName: "",
    RoleID: "",
    MobileNumber: "",
    EmailID: "",
  });

  const handleUpdate = (email) => {
    const selectedUser = data.find((u) => u.emailID === email);
    if (!selectedUser) return;

    const matchedRole = roles.find(
      (r) =>
        (selectedUser.roleID != null && String(r.id ?? r.roleID) === String(selectedUser.roleID)) ||
        (selectedUser.roleNameEn && r.roleNameEn?.toLowerCase() === selectedUser.roleNameEn.toLowerCase())
    );
    const resolvedRoleID = selectedUser.roleID ?? matchedRole?.id ?? matchedRole?.roleID ?? "";

    const matchedDept = departments.find(
      (d) =>
        (selectedUser.departmentID != null && String(d.departmentID) === String(selectedUser.departmentID)) ||
        (selectedUser.department && d.title?.toLowerCase() === selectedUser.department.toLowerCase()) ||
        (selectedUser.departmentTitle && d.title?.toLowerCase() === selectedUser.departmentTitle.toLowerCase())
    );
    const resolvedDepartmentID = selectedUser.departmentID ?? matchedDept?.departmentID ?? null;

    setUpdateUserData({
      UserName: selectedUser.userName || "",
      FullName: selectedUser.fullName || "",
      EmailID: selectedUser.emailID || "",
      MobileNumber: selectedUser.mobileNumber || "",
      RoleID: resolvedRoleID,
      DepartmentID: resolvedDepartmentID,
    });

    if (selectedUser.countryCode && selectedUser.mobileNumber) {
      setUpdatePhoneNumber(selectedUser.countryCode + selectedUser.mobileNumber);
    } else if (selectedUser.mobileNumber) {
      setUpdatePhoneNumber(selectedUser.mobileNumber);
    } else {
      setUpdatePhoneNumber("");
    }

    reset();
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    reset();
    setErrors({
      FullName: "",
      UserName: "",
      RoleID: "",
      MobileNumber: "",
      EmailID: "",
    });
    setUpdatePhoneNumber("");
    setShowUpdateModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateUserData({
      ...updateUserData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!updateUserData.FullName) {
      formErrors.FullName = t("createTeam.fullNameRequired");
      isValid = false;
    }

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!updateUserData.EmailID) {
      formErrors.EmailID = t("createTeam.emailRequired");
      isValid = false;
    } else if (!emailPattern.test(updateUserData.EmailID)) {
      formErrors.EmailID = t("createTeam.invalidEmail");
      isValid = false;
    }

    if (!updateUserData.RoleID) {
      formErrors.RoleID = t("createTeam.roleRequired");
      isValid = false;
    }

    if (updatePhoneNumber && updatePhoneNumber.length < 10) {
      formErrors.MobileNumber = t("createTeam.invalidMobile");
      isValid = false;
    }
    setErrors(formErrors);
    return isValid;
  };

  const updateUser = async () => {
    if (!validateForm()) {
      return;
    }
    const { FullName, RoleID, UserName, EmailID, DepartmentID } = updateUserData;

    try {
      setIsLoading(true);

      let mobileData = {};
      if (updatePhoneNumber) {
        const countryCode = updatePhoneNumber.substring(0, updatePhoneNumber.length - 10);
        const mobileNumber = updatePhoneNumber.substring(updatePhoneNumber.length - 10);
        mobileData = {
          MobileNumber: mobileNumber,
          CountryCode: countryCode,
        };
      }

      const stringifiedRoleID = String(RoleID);

      const response = await userService.updateAppUser({
        FullName,
        RoleID: stringifiedRoleID,
        UserName,
        DepartmentID: DepartmentID === "" ? null : DepartmentID,
        EmailID,
        ...mobileData,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("createTeam.userUpdateSuccess"));
        setShowUpdateModal(false);
        reset();
        setUpdatePhoneNumber("");
        fetchTeamMembers();
      } else {
        toast.error(t("createTeam.failedToUpdateUser"));
      }
    } catch (error) {
      toast.error(t("createTeam.errUpdateUser"));
    } finally {
      setIsLoading(false);
    }
  };

  const openDeactivateModal = () => setShowDeactivateModal(true);
  const closeDeactivateModal = () => setShowDeactivateModal(false);
  const openActiveModal = () => setShowActiveModal(true);
  const closeActiveModal = () => setShowActiveModal(false);

  const sortTeamMembers = (teamMembers) => {
    const roleOrder = {
      "Super Admin": 1,
      Admin: 2,
      "App User": 3,
      Viewer: 4,
    };

    return teamMembers.sort((a, b) => {
      if (roleOrder[a.roleNameEn] !== roleOrder[b.roleNameEn]) {
        return (roleOrder[a.roleNameEn] || 99) - (roleOrder[b.roleNameEn] || 99);
      }
      return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
    });
  };

  const fetchTeamMembers = useCallback(async () => {
    try {
      if (!user.AccountID) {
        return;
      }
      setIsLoading(true);
      const response = await userService.getAppUserTeam(user.AccountID);
      const rawData = response.data.response || [];
      setData(rawData);
      const sortedResults = sortTeamMembers([...rawData]);
      setSearchResults(sortedResults);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [user.AccountID]);

  const handleUserSearch = async () => {
    try {
      setIsLoading(true);
      setStatusTab("all");
      setSearchQuery("");
      const response = await userService.getAppUserTeam(user.AccountID, {
        fullName,
        emailID,
        role,
        isActive,
        department,
      });
      const sortedResults = sortTeamMembers(response.data.response || []);
      setSearchResults(sortedResults);
      setPage(0);
    } catch (error) {
      toast.error("Error fetching user data.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserSearch = () => {
    setFullName("");
    setEmailID("");
    setRole("");
    setIsActive(undefined);
    setDepartment("");
    setSearchQuery("");
    setStatusTab("all");
    setPage(0);
    fetchTeamMembers();
  };

  const fetchRoles = async () => {
    try {
      const response = await userService.getUserRoles();
      if (response.data.successStatus) {
        setRoles(response.data.response);
      }
    } catch (error) {
      console.error(t("createTeam.errRoles"));
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await userService.getActiveAccountDepartments(user.AccountID, isActive);
      if (response.data.statusCode === "1") {
        setDepartments(response.data.response || []);
      }
    } catch (error) {
      toast.error(t("createTeam.errDepartments"));
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchDepartments();
    fetchRoles();
  }, [user.AccountID, userAccess.remainingDays, fetchTeamMembers]);

  const handleDeactivate = (email, activeStatus) => {
    setSelectedEmail(email);
    setSelectedAppUserId(user.AccountID);
    setSelectedIsActive(!activeStatus);
    openDeactivateModal();
  };

  const handleActiveAgain = (email, activeStatus) => {
    setSelectedEmail(email);
    setSelectedAppUserId(user.AccountID);
    setSelectedIsActive(!activeStatus);
    openActiveModal();
  };

  const userDeactivate = async () => {
    const requestBody = {
      AccountID: selectedAppUserId,
      EmailID: selectedEmail,
      IsActive: selectedIsActive,
    };
    setIsLoading(true);
    try {
      const response = await userService.updateAppUserStatus(requestBody);
      if (response.data.statusCode === "1") {
        if (!selectedIsActive) {
          toast.success(t("createTeam.userDeactivateSuccess"));
        } else {
          toast.success("User Activated Successfully!");
        }
        fetchTeamMembers();
      } else {
        toast.error("Failed to update status!");
      }
    } catch (error) {
      toast.error(t("createTeam.errDeactivate"));
    } finally {
      setIsLoading(false);
      closeDeactivateModal();
      closeActiveModal();
    }
  };

  // Status counts for quick status filter tabs
  const statusCounts = useMemo(() => {
    const counts = { all: searchResults.length, active: 0, inactive: 0 };
    searchResults.forEach((m) => {
      if (m.isActive) counts.active += 1;
      else counts.inactive += 1;
    });
    return counts;
  }, [searchResults]);

  // Combined client-side filtering (status tabs + instant search query)
  const visibleTeamMembers = useMemo(() => {
    let list = searchResults;

    if (statusTab === "active") {
      list = list.filter((m) => Boolean(m.isActive));
    } else if (statusTab === "inactive") {
      list = list.filter((m) => !m.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          (m.fullName && m.fullName.toLowerCase().includes(q)) ||
          (m.emailID && m.emailID.toLowerCase().includes(q)) ||
          (m.roleNameEn && m.roleNameEn.toLowerCase().includes(q)) ||
          (m.department && m.department.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchResults, statusTab, searchQuery]);

  const statusTabs = [
    { id: "all", label: t("departmentList.all", "All") },
    { id: "active", label: t("emailTemplates.active", "Active") },
    { id: "inactive", label: t("emailTemplates.inactive", "Inactive") },
  ];

  const columns = [
    { label: t("tablesLabel.name", "Name"), key: "fullName" },
    { label: t("tablesLabel.email", "Email"), key: "emailID" },
    { label: t("tablesLabel.role", "Role"), key: "roleNameEn" },
    { label: t("departmentList.createdon", "Created On"), key: "createdon" },
    { label: t("createTeam.department", "Department"), key: "title" },
    { label: t("tablesLabel.status", "Status"), key: "isActive" },
    { label: "", key: "actions" },
  ];

  const handleViewDetails = (row) => {
    setViewDetailsAppUserID(row.appUserID);
    setShowViewDetailsModal(true);
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
    return `${day}/${month}/${year} - ${hours}:${formattedMinutes} ${ampm}`;
  };

  const exportToExcel = () => {
    const listToExport = visibleTeamMembers;
    const worksheetData = listToExport.map((row) => ({
      Name: row.fullName || "",
      Email: row.emailID || "",
      Role: row.roleNameEn || "",
      CreatedOn: row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "",
      Department: row.department || "",
      "Country Code": row.countryCode || "",
      "Mobile Number": row.mobileNumber || "",
      Status: row.isActive ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Team Members");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "TeamMembers.xlsx");
  };

  const exportTeamDocuments = async (format = "csv") => {
    if (!data.length || isExportingDocuments) return;
    setIsExportingDocuments(true);
    try {
      const exportUsers = await fetchTeamDocuments(data);
      if (format === "word") {
        exportTeamDocumentsWord(exportUsers, t);
      } else {
        exportTeamDocumentsCsv(exportUsers, t);
      }
      if (exportUsers.some(({ docsFailed }) => docsFailed)) {
        toast.warning(t("createTeam.exportDocumentsPartial", "Some users' documents could not be fetched; the export marks those users."));
      }
    } catch (error) {
      toast.error(t("createTeam.exportDocumentsError", "Could not export team documents."));
    } finally {
      setIsExportingDocuments(false);
    }
  };

  const hasAdvancedFilters = Boolean(fullName || emailID || role || isActive !== undefined || department);
  const hasVisibleFilters = Boolean(hasAdvancedFilters || statusTab !== "all" || searchQuery);

  return (
    <div className='w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)] font-sans team-members-page'>
      {user.AccountType === "B" && user.RoleID === 2 && userAccess.remainingDays <= 0 ? (
        <UserLisence />
      ) : user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
        userAccess.teams === true ? (
          <div className='w-full max-w-[1560px] mx-auto p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
            {/* Unified Hero Toolbar */}
            <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
                  <Users size={20} />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-[var(--modern-text)] m-0'>
                      {t("createTeam.MyTeam", "Team Members")}
                    </h1>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                      {visibleTeamMembers.length}{" "}
                      {visibleTeamMembers.length === 1
                        ? t("createTeam.teamMember", "member")
                        : t("createTeam.teamMembersCount", "members")}
                    </span>
                  </div>
                  <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                    {t("createTeam.manageTeamSubtitle", "Manage company members, roles, and access permissions")}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2.5 flex-wrap ml-auto'>
                {/* Instant Quick Search */}
                <div className='recentdocs-search-box'>
                  <Search className='search-icon' size={15} aria-hidden='true' />
                  <input
                    type='text'
                    placeholder={t("createTeam.searchPlaceholder", "Search by name, email, role, department...")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
                    className='recentdocs-search-input'
                    aria-label='Search team members'
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

                    <Dropdown.Item onClick={() => exportTeamDocuments("csv")} disabled={isExportingDocuments} className='modern-export-item'>
                      {isExportingDocuments ? <Loader2 size={16} className='animate-spin shrink-0' /> : <FileSpreadsheet size={16} className='text-emerald-500 shrink-0' />}
                      <span>{isExportingDocuments ? t("createTeam.exportingDocuments", "Exporting documents…") : t("createTeam.exportDocumentsCsv", "Export all users and documents to CSV")}</span>
                    </Dropdown.Item>

                    <Dropdown.Item onClick={() => exportTeamDocuments("word")} disabled={isExportingDocuments} className='modern-export-item'>
                      <FileText size={16} className='text-blue-500 shrink-0' />
                      <span>{t("createTeam.exportWord", "Export to Word")}</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Filter Drawer */}
                <div className='search-filters-container'>
                  <UserSearchFilter
                    fullName={fullName}
                    emailID={emailID}
                    role={role}
                    isActive={isActive}
                    department={department}
                    setFullName={setFullName}
                    setEmailID={setEmailID}
                    setRole={setRole}
                    setIsActive={setIsActive}
                    setDepartment={setDepartment}
                    handleSearch={handleUserSearch}
                    clearSearch={clearUserSearch}
                    userRoles={roles}
                    departments={departments}
                  />
                </div>

                {/* Add New Team Member Action */}
                <CreateTeamForm fetchTeam={fetchTeamMembers} />
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
                <button type='button' className='recentdocs-reset-filters-btn' onClick={clearUserSearch}>
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
                minHeight: "440px",
                height: "calc(100vh - 300px)",
                maxHeight: "calc(100vh - 300px)",
              }}
            >
              <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
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
                  {visibleTeamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                        <TableEmptyState
                          icon={<Users size={42} className='text-[var(--modern-muted)]' />}
                          title={
                            hasVisibleFilters
                              ? t("searchFilter.noSearchResults", "No matching team members found")
                              : t("tablesLabel.notTeamFound", "No team members found")
                          }
                          description={
                            hasVisibleFilters
                              ? t("searchFilter.tryClearing", "Try clearing your search terms or filters to see more results.")
                              : t("createTeam.enterfullName", "Add your team members to collaborate on documents.")
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
                    visibleTeamMembers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={row.appUserID || index} className='hover:bg-[var(--modern-raised)] transition-colors'>
                          {/* Name with Avatar */}
                          <TableCell className='TableCell'>
                            <UserInitialsBadge name={row.fullName} />
                          </TableCell>

                          {/* Email */}
                          <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>{row.emailID}</TableCell>

                          {/* Role */}
                          <TableCell className='TableCell'>
                            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-text)]'>
                              {row.roleNameEn}
                            </span>
                          </TableCell>

                          {/* Created On */}
                          <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                            {row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "—"}
                          </TableCell>

                          {/* Department */}
                          <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>{row.department || "—"}</TableCell>

                          {/* Status */}
                          <TableCell className='TableCell'>
                            <span
                              className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold'
                              style={{
                                color: row.isActive ? "var(--modern-success, #16a34a)" : "var(--modern-muted)",
                                backgroundColor: row.isActive
                                  ? "color-mix(in srgb, var(--modern-success, #16a34a) 12%, var(--modern-card))"
                                  : "var(--modern-raised)",
                                border: `1px solid ${
                                  row.isActive
                                    ? "color-mix(in srgb, var(--modern-success, #16a34a) 30%, transparent)"
                                    : "var(--modern-border)"
                                }`,
                              }}
                            >
                              <span
                                className='w-1.5 h-1.5 rounded-full'
                                style={{
                                  backgroundColor: row.isActive ? "var(--modern-success, #16a34a)" : "var(--modern-muted)",
                                }}
                              />
                              {row.isActive ? t("emailTemplates.active", "Active") : t("emailTemplates.inactive", "Inactive")}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className='py-0 text-right'>
                            <Dropdown>
                              <Dropdown.Toggle as={CustomToggle} />
                              <Dropdown.Menu align='end' className='rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-1.5 shadow-none'>
                                {row.isActive ? (
                                  <Dropdown.Item
                                    className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors'
                                    onClick={() => handleDeactivate(row.emailID, row.isActive)}
                                  >
                                    <Icons.InactiveAction size={16} />
                                    <span>{t("createTeam.deactivateUser")}</span>
                                  </Dropdown.Item>
                                ) : (
                                  <Dropdown.Item
                                    className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors'
                                    onClick={() => handleActiveAgain(row.emailID, row.isActive)}
                                  >
                                    <Icons.Active size={16} color='var(--modern-success, #16a34a)' />
                                    <span>{t("createTeam.activateUser")}</span>
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item
                                  className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[var(--modern-text)] hover:bg-[var(--modern-raised)] transition-colors'
                                  onClick={() => handleUpdate(row.emailID)}
                                >
                                  <Icons.EditProfile size={16} />
                                  <span>{t("createTeam.updateUser")}</span>
                                </Dropdown.Item>

                                <Dropdown.Item
                                  className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[var(--modern-text)] hover:bg-[var(--modern-raised)] transition-colors'
                                  onClick={() => handleViewDetails(row)}
                                >
                                  <Icons.ViewDetails size={16} />
                                  <span>{t("createTeam.viewDetails")}</span>
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

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4'>
              <div className='text-xs text-[var(--modern-muted)]'>
                {visibleTeamMembers.length ? page * rowsPerPage + 1 : 0} -{" "}
                {Math.min((page + 1) * rowsPerPage, visibleTeamMembers.length)} {t("tablesLabel.existing")}{" "}
                {visibleTeamMembers.length} {t("tablesLabel.existingUser")}
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.max(1, Math.ceil(visibleTeamMembers.length / rowsPerPage))}
                  variant='outlined'
                  shape='rounded'
                  page={Math.min(page + 1, Math.max(1, Math.ceil(visibleTeamMembers.length / rowsPerPage)))}
                  onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                />
              </Stack>
            </div>
          </div>
        ) : null
      ) : null}

      {/* Modern Update User Modal */}
      <Modal
        show={showUpdateModal}
        onHide={handleCloseUpdateModal}
        centered
        dialogClassName='max-w-xl'
        contentClassName='overflow-visible'
        backdrop='static'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)] rounded-t-xl'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]'>
              <UserCheck size={20} />
            </div>
            <div>
              <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
                {t("createTeam.updateUser")}
              </Modal.Title>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5 truncate max-w-sm'>
                {updateUserData.EmailID}
              </p>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <Form className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.email")}
                </label>
                <Form.Control
                  type='email'
                  value={updateUserData.EmailID}
                  disabled
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border-strong)] text-[var(--modern-muted)] cursor-not-allowed'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.fullName")} <span className='text-rose-500'>*</span>
                </label>
                <Form.Control
                  type='text'
                  name='FullName'
                  value={updateUserData.FullName}
                  onChange={handleInputChange}
                  placeholder={t("createTeam.enterfullName")}
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] placeholder:text-[var(--modern-muted)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                />
                {errors.FullName && <div className='text-xs text-rose-500 mt-1'>{errors.FullName}</div>}
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.role")} <span className='text-rose-500'>*</span>
                </label>
                <Form.Select
                  as='select'
                  name='RoleID'
                  value={updateUserData.RoleID ?? ""}
                  onChange={handleInputChange}
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                >
                  <option value=''>{t("createTeam.selectRoleadmin")}</option>
                  {roles.map((r) => {
                    const roleValue = r.id ?? r.roleID;
                    return (
                      <option key={roleValue} value={roleValue}>
                        {r.roleNameEn}
                      </option>
                    );
                  })}
                </Form.Select>
                {errors.RoleID && <div className='text-xs text-rose-500 mt-1'>{errors.RoleID}</div>}
              </div>

              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.department")}
                </label>
                <Form.Select
                  as='select'
                  name='DepartmentID'
                  value={updateUserData.DepartmentID || ""}
                  onChange={handleInputChange}
                  className='w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--modern-bg)] border border-[var(--modern-border-strong)] text-[var(--modern-text)] focus:border-[var(--theme-color)] focus:outline-none transition-colors'
                >
                  <option value=''>{t("createTeam.choose")}</option>
                  {departments.map((d) => (
                    <option key={d.departmentID} value={d.departmentID}>
                      {d.title}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-semibold text-[var(--modern-text)] mb-1.5'>
                  {t("createTeam.mobileNumber")}
                </label>
                <PhoneInput
                  excludeCountries={["il"]}
                  country={"sa"}
                  value={updatePhoneNumber}
                  onChange={(phone) => setUpdatePhoneNumber(phone)}
                  containerClass={`phone-input-container create-team-phone-input ${errors.MobileNumber ? "is-invalid" : ""}`}
                />
                {errors.MobileNumber && <div className='text-xs text-rose-500 mt-1'>{errors.MobileNumber}</div>}
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-3.5 bg-[var(--modern-card)] rounded-b-xl flex justify-end gap-3'>
          <Button
            variant='outline'
            className='px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-raised)]'
            onClick={handleCloseUpdateModal}
          >
            {t("createTeam.cancel")}
          </Button>
          <Button
            variant='primary'
            className='px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--modern-violet)] hover:bg-[var(--modern-violet-hover)] text-white flex items-center gap-2'
            onClick={updateUser}
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={14} className='animate-spin' />}
            <span>{t("createTeam.updateUser")}</span>
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modern Deactivate User Confirmation Dialog */}
      <Modal
        show={showDeactivateModal}
        centered
        backdrop='static'
        keyboard={false}
        onHide={closeDeactivateModal}
        dialogClassName='max-w-md'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500'>
              <AlertTriangle size={20} />
            </div>
            <div>
              <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
                {t("AuthIntegration.Confirmation", "Confirmation")}
              </Modal.Title>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5 truncate max-w-[220px]'>
                {selectedEmail}
              </p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <p className='text-sm mb-3'>{t("createTeam.confirmDeactivate")}</p>
          <div className='p-3 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-xs'>
            <span className='text-[var(--modern-muted)]'>{t("createTeam.email")}: </span>
            <span className='font-semibold text-[var(--modern-text)]'>{selectedEmail}</span>
          </div>
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-3.5 bg-[var(--modern-card)] flex justify-end gap-3'>
          <Button
            variant='outline'
            className='px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-raised)]'
            onClick={closeDeactivateModal}
          >
            {t("createTeam.cancel")}
          </Button>
          <Button
            variant='primary'
            className='px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white'
            onClick={userDeactivate}
            disabled={isLoading}
          >
            {isLoading ? t("dashboardCardStatuses.loading", "Updating...") : t("createTeam.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modern Activate User Confirmation Dialog */}
      <Modal
        show={showActiveModal}
        centered
        backdrop='static'
        keyboard={false}
        onHide={closeActiveModal}
        dialogClassName='max-w-md'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-6 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500'>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <Modal.Title className='text-base sm:text-lg font-bold text-[var(--modern-text)] m-0'>
                {t("AuthIntegration.Confirmation", "Confirmation")}
              </Modal.Title>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5 truncate max-w-[220px]'>
                {selectedEmail}
              </p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='p-6 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <p className='text-sm mb-3'>{t("createTeam.confirmActivate")}</p>
          <div className='p-3 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] text-xs'>
            <span className='text-[var(--modern-muted)]'>{t("createTeam.email")}: </span>
            <span className='font-semibold text-[var(--modern-text)]'>{selectedEmail}</span>
          </div>
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] px-6 py-3.5 bg-[var(--modern-card)] flex justify-end gap-3'>
          <Button
            variant='outline'
            className='px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--modern-border)] text-[var(--modern-text)] hover:bg-[var(--modern-raised)]'
            onClick={closeActiveModal}
          >
            {t("createTeam.cancel")}
          </Button>
          <Button
            variant='primary'
            className='px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white'
            onClick={userDeactivate}
            disabled={isLoading}
          >
            {isLoading ? t("dashboardCardStatuses.loading", "Updating...") : t("createTeam.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      <ViewTeamDetails
        show={showViewDetailsModal}
        onHide={() => setShowViewDetailsModal(false)}
        appUserID={viewDetailsAppUserID}
      />
    </div>
  );
}

export default CreateTeam;
