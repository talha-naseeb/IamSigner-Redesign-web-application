import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Pagination,
} from "@/Components/UI/dataPrimitives";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Button, Dropdown, Modal, Spinner } from "@/Components/UI/shadcnCompat";
import { useNavigate } from "react-router-dom";
import UserLisence from "@/Components/UserLisence/UserLisence";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import userService from "@/services/userService";
import "./style.css";

const EmailTemplates = () => {
  const { t } = useTranslation();
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, userAccess } = useUser();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [templateToToggle, setTemplateToToggle] = useState(null);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailTemplateID, setEmailTemplateID] = useState(null);
  const [selectedTemplateForDelete, setSelectedTemplateForDelete] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const templateTypeLabels = useMemo(
    () => ({
      Declined: t("emailTemplates.Declined") || "Declined",
      Completed: t("emailTemplates.Completed") || "Completed",
      PasswordReset: t("emailTemplates.PasswordReset") || "Password Reset",
      CreateTeam: t("emailTemplates.Createteam") || "Create Team",
      SigningDocument: t("emailTemplates.SigningDocument") || "Signing Document",
    }),
    [t]
  );

  const parsePlaceholders = (emailBody) => {
    if (!emailBody) return "";
    return emailBody.replace(/{(.*?)}/g, (match, placeholder) => {
      return `<span class="immutable-placeholder" contenteditable="false">{${placeholder}}</span>`;
    });
  };

  const fetchEmailTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getEmailTemplates(user.AccountID);

      if (response.data.statusCode === "1") {
        const templates = (response.data.response || []).map((template) => ({
          ...template,
          body: parsePlaceholders(template.body),
        }));
        setEmailTemplates(templates);
      } else {
        setEmailTemplates([]);
      }
    } catch (error) {
      console.error(error);
      setEmailTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.AccountID) {
      fetchEmailTemplates();
    }
  }, [user?.AccountID, userAccess?.remainingDays]);

  // Client-side filtering
  const filteredTemplates = useMemo(() => {
    return emailTemplates.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.createdBy && item.createdBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.templateType && item.templateType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === "all" || item.templateType === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [emailTemplates, searchQuery, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredTemplates.length / rowsPerPage) || 1;

  const paginatedTemplates = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTemplates.slice(start, start + rowsPerPage);
  }, [filteredTemplates, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPage(0);
  };

  const handleToggleStatus = async () => {
    if (!templateToToggle) return;

    const { emailTemplateID, isActive, templateType } = templateToToggle;
    setIsActionLoading(true);
    try {
      const response = await userService.updateEmailTemplateStatus({
        EmailTemplateID: emailTemplateID,
        IsActive: !isActive,
        AccountID: user.AccountID,
        TemplateType: templateType,
      });

      if (response.data.statusCode === "1") {
        toast.success(t("emailTemplates.emailUpdated"));
        fetchEmailTemplates();
      } else if (response.data.statusCode === "10") {
        toast.info(t("emailTemplates.DeactiveFirst"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("emailTemplates.emailError"));
    } finally {
      setIsActionLoading(false);
      setShowConfirmModal(false);
      setTemplateToToggle(null);
    }
  };

  const handleConfirmToggle = (template) => {
    setTemplateToToggle(template);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    if (isActionLoading) return;
    setShowConfirmModal(false);
    setTemplateToToggle(null);
  };

  const handleEditTemplate = (template) => {
    navigate("/create-email-template", { state: { template } });
  };

  const handleDeleteTemplate = (template) => {
    setEmailTemplateID(template.emailTemplateID);
    setSelectedTemplateForDelete(template);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!emailTemplateID) return;

    setIsActionLoading(true);
    try {
      const response = await userService.deleteEmailTemplate(emailTemplateID);

      if (response.data.statusCode === "1") {
        toast.success(t("emailTemplates.templateDeleted"));
        fetchEmailTemplates();
      } else {
        toast.error(t("emailTemplates.deleteError"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("emailTemplates.deleteError"));
    } finally {
      setIsActionLoading(false);
      setShowDeleteModal(false);
      setEmailTemplateID(null);
      setSelectedTemplateForDelete(null);
    }
  };

  const columns = [
    { label: t("tablesLabel.subject"), key: "subject" },
    { label: t("tablesLabel.tempType"), key: "templateType" },
    { label: t("tablesLabel.createdby"), key: "createdBy" },
    { label: t("tablesLabel.status"), key: "isActive" },
    { label: "", key: "actions" },
  ];

  const goBack = () => navigate("/create-email-template");

  const getTypePillClass = (type) => {
    switch (type) {
      case "Declined":
        return "declined";
      case "Completed":
        return "completed";
      case "PasswordReset":
        return "passwordreset";
      case "CreateTeam":
        return "createteam";
      case "SigningDocument":
        return "signingdocument";
      default:
        return "";
    }
  };

  return (
    <>
      {userAccess?.remainingDays <= 0 ? (
        <UserLisence />
      ) : (
        <>
          {user?.AccountType === "B" && (user?.RoleID === 1 || user?.RoleID === 4) && userAccess?.remainingDays >= 0 ? (
            <div className='email-templates-container'>
              {/* Top Create Action Bar */}
              <div className='createTemplate mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2'>
                <div className='d-flex align-items-center gap-2'>
                  <button
                    type='button'
                    className='email-back-btn'
                    onClick={goBack}
                    title={t("common.back") || "Back"}
                  >
                    <Icons.Back
                      className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""}
                      size={18}
                    />
                  </button>
                  <label className='m-0 fw-bold' style={{ fontSize: "20px", color: "var(--modern-text)" }}>
                    {t("emailTemplates.emailTemplates")}
                  </label>
                </div>

                <button
                  type='button'
                  className='email-btn-primary'
                  onClick={() => navigate("/create-email-template")}
                >
                  <Icons.Plus size={18} />
                  <span>{t("emailTemplates.createTemplate")}</span>
                </button>
              </div>

              {/* Table Card (synchronized with Templates & Dashboard table cards) */}
              <div className='py-3 p-3 pendingtable email-table-card'>
                <div className='d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 p-1'>
                  <div className='d-flex align-items-center gap-2'>
                    <label style={{ fontWeight: "600", fontSize: "17px", color: "var(--modern-text)" }}>
                      {t("emailTemplates.emailTemplates")}
                    </label>
                    <span className='email-count-chip'>
                      {filteredTemplates.length}
                    </span>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className='search-filters-container d-flex align-items-center gap-2 flex-wrap'>
                    <div className='email-search-wrapper'>
                      <span className='email-search-icon'>
                        <Icons.Search size={15} />
                      </span>
                      <input
                        type='text'
                        className='email-search-input'
                        placeholder={t("emailTemplates.emailSubjectPlaceholder") || "Search subject, type..."}
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>

                    <select
                      className='email-filter-select'
                      value={typeFilter}
                      onChange={handleTypeFilterChange}
                      aria-label='Filter by template type'
                    >
                      <option value='all'>{t("emailTemplates.SelectType") || "All Types"}</option>
                      <option value='Declined'>{templateTypeLabels.Declined}</option>
                      <option value='Completed'>{templateTypeLabels.Completed}</option>
                      <option value='PasswordReset'>{templateTypeLabels.PasswordReset}</option>
                      <option value='CreateTeam'>{templateTypeLabels.CreateTeam}</option>
                      <option value='SigningDocument'>{templateTypeLabels.SigningDocument}</option>
                    </select>

                    <select
                      className='email-filter-select'
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      aria-label='Filter by status'
                    >
                      <option value='all'>{t("tablesLabel.status") || "All Statuses"}</option>
                      <option value='active'>{t("emailTemplates.active")}</option>
                      <option value='inactive'>{t("emailTemplates.inactive")}</option>
                    </select>

                    {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
                      <button
                        type='button'
                        className='email-btn-secondary'
                        style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                        onClick={clearFilters}
                      >
                        {t("dashboardCardStatuses.clear") || "Clear"}
                      </button>
                    )}
                  </div>
                </div>

                {/* MUI Table Container */}
                <TableContainer
                  component={Paper}
                  className='custom-table-scrollbar'
                  style={{
                    maxWidth: "100%",
                    overflowX: "auto",
                    minHeight: "440px",
                    height: "calc(100vh - 280px)",
                    maxHeight: "calc(100vh - 280px)",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                    <TableHead className='customTableHead'>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.label} className='TableHeaderCell'>
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className='p-5 text-center'>
                            <div className='d-flex align-items-center justify-content-center gap-2'>
                              <Spinner animation='border' size='sm' style={{ color: "var(--modern-violet)" }} />
                              <span className='text-muted small'>{t("common.loading") || "Loading templates..."}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paginatedTemplates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className='p-5 text-center'>
                            <div className='d-flex flex-column align-items-center justify-content-center py-4'>
                              <Icons.BulkDocuments size={48} style={{ color: "var(--modern-muted)", opacity: 0.6 }} />
                              <p className='mt-2 mb-1 fw-bold' style={{ color: "var(--modern-text)" }}>
                                {t("emailTemplates.noEmailFound")}
                              </p>
                              <span className='text-muted small'>
                                {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                                  ? t("searchFilter.noMatch") || "No templates match your search criteria."
                                  : t("emailTemplates.letCreateEmail") || "No email templates created yet."}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTemplates.map((template) => (
                          <TableRow key={template.emailTemplateID} hover>
                            <TableCell className='TableCell truncate-cell' title={template.subject}>
                              <span className='fw-semibold'>{template.subject}</span>
                            </TableCell>
                            <TableCell className='TableCell'>
                              <span className={`email-type-pill ${getTypePillClass(template.templateType)}`}>
                                {templateTypeLabels[template.templateType] || template.templateType}
                              </span>
                            </TableCell>
                            <TableCell className='TableCell'>{template.createdBy || "-"}</TableCell>
                            <TableCell className='TableCell'>
                              <span className={`template-status-badge template-status-badge--${template.isActive ? "active" : "inactive"}`}>
                                {template.isActive ? t("emailTemplates.active") : t("emailTemplates.inactive")}
                              </span>
                            </TableCell>
                            <TableCell className='TableCell p-0' style={{ width: "50px", textAlign: "center" }}>
                              <Dropdown align='end'>
                                <Dropdown.Toggle as={CustomToggle} />
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    className='d-flex gap-2 align-items-center'
                                    onClick={() => handleConfirmToggle(template)}
                                  >
                                    {template.isActive ? <Icons.InactiveAction size={18} /> : <Icons.Active size={18} color='#10b981' />}
                                    <span>{template.isActive ? t("emailTemplates.inactive") : t("emailTemplates.active")}</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    className='d-flex gap-2 align-items-center'
                                    onClick={() => handleEditTemplate(template)}
                                  >
                                    <Icons.EditSquare size={18} />
                                    <span>{t("emailTemplates.editTemplate")}</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    className='d-flex gap-2 align-items-center text-danger'
                                    onClick={() => handleDeleteTemplate(template)}
                                  >
                                    <Icons.DeleteAction size={18} />
                                    <span>{t("uploadDocFlow.delete")}</span>
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
                {!isLoading && filteredTemplates.length > 0 && (
                  <div className='d-flex justify-content-between align-items-center mt-3 pt-2 flex-wrap gap-2' style={{ borderTop: "1px solid var(--modern-border)" }}>
                    <div className='small' style={{ color: "var(--modern-muted)" }}>
                      {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredTemplates.length)}{" "}
                      {t("emailTemplates.templateof")} {filteredTemplates.length} {t("emailTemplates.template")}
                    </div>
                    <Stack spacing={2}>
                      <Pagination
                        count={totalPages}
                        variant='outlined'
                        shape='rounded'
                        page={page + 1}
                        onChange={handleChangePage}
                      />
                    </Stack>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Confirmation Modal for Toggling Status */}
      <Modal
        show={showConfirmModal}
        onHide={handleCloseConfirmModal}
        backdrop='static'
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <div className='d-flex align-items-center gap-2'>
            <div className='email-header-icon-badge' style={{ width: 36, height: 36 }}>
              {templateToToggle?.isActive ? <Icons.InactiveAction size={20} /> : <Icons.Active size={20} color='#10b981' />}
            </div>
            <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {t("emailTemplates.Confirmation")}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className='py-4'>
          <p className='mb-2' style={{ color: "var(--modern-text)" }}>
            {templateToToggle?.isActive ? t("emailTemplates.sureDeactivate") : t("emailTemplates.sureActive")}
          </p>
          {templateToToggle && (
            <div
              style={{
                backgroundColor: "var(--modern-bg)",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid var(--modern-border-strong)",
                fontSize: "0.875rem",
              }}
            >
              <div className='text-muted small mb-1'>{t("emailTemplates.template")}:</div>
              <div className='fw-bold' style={{ color: "var(--modern-text)" }}>{templateToToggle.subject}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
          <button
            type='button'
            className='email-btn-secondary'
            onClick={handleCloseConfirmModal}
            disabled={isActionLoading}
          >
            {t("dashboardCardStatuses.cancel")}
          </button>
          <button
            type='button'
            className='email-btn-primary'
            onClick={handleToggleStatus}
            disabled={isActionLoading}
          >
            {isActionLoading && <Spinner animation='border' size='sm' className='me-2' />}
            <span>{t("dashboardCardStatuses.confirm")}</span>
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Email Template Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => {
          if (isActionLoading) return;
          setShowDeleteModal(false);
          setSelectedTemplateForDelete(null);
          setEmailTemplateID(null);
        }}
        title={t("emailTemplates.deleteConfirmationTitle")}
        subtitle={t("emailTemplates.deleteMessage")}
        warningText={t("emailTemplates.deleteConfirmationMessage")}
        itemTitle={t("emailTemplates.template")}
        itemName={selectedTemplateForDelete ? selectedTemplateForDelete.subject : ""}
        onConfirm={confirmDeleteTemplate}
        confirmText={t("dashboardCardStatuses.confirm")}
        cancelText={t("dashboardCardStatuses.cancel")}
        headerIcon={<Icons.DeleteAction size={25} />}
        itemIcon={<Icons.BulkDocuments size={24} />}
        isLoading={isActionLoading}
      />
    </>
  );
};

export default EmailTemplates;
