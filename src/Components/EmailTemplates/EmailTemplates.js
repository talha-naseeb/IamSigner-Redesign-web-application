import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
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
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Button, Dropdown, Form, Modal, Spinner } from "@/Components/UI/shadcnCompat";
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
    { label: t("tablesLabel.subject"), key: "subject", width: "30%" },
    { label: t("tablesLabel.tempType"), key: "templateType", width: "20%" },
    { label: t("tablesLabel.createdby"), key: "createdBy", width: "26%" },
    { label: t("tablesLabel.status"), key: "isActive", width: "16%" },
    { label: "", key: "actions", width: "8%", align: "right" },
  ];

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
            <Grid className='container mt-3'>
              <Grid item xs={12}>
                <div className='py-4 px-4 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)] pendingtable'>
                  {/* Table Header Toolbar */}
                  <div className='flex flex-wrap justify-between items-center gap-3 p-1 mb-4'>
                    <div className='flex items-center gap-2.5'>
                      <label className='font-semibold text-lg text-[var(--modern-text,#0f172a)] m-0'>
                        {t("emailTemplates.emailTemplates")}
                      </label>
                      {filteredTemplates.length > 0 && (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised,#f1f5f9)] text-[var(--modern-muted,#64748b)] border border-[var(--modern-border,#e2e8f0)]'>
                          {filteredTemplates.length}
                        </span>
                      )}
                    </div>

                    {/* Search, Filters & Create Action */}
                    <div className='search-filters-container flex items-center gap-2.5 flex-wrap'>
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

                      <Form.Select
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
                      </Form.Select>

                      <Form.Select
                        className='email-filter-select'
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        aria-label='Filter by status'
                      >
                        <option value='all'>{t("tablesLabel.status") || "All Statuses"}</option>
                        <option value='active'>{t("emailTemplates.active")}</option>
                        <option value='inactive'>{t("emailTemplates.inactive")}</option>
                      </Form.Select>

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

                      <Button
                        variant='primary'
                        className='h-[38px] min-h-[38px] rounded-[10px] px-4 font-semibold inline-flex items-center gap-2 shadow-none transition-all'
                        onClick={() => navigate("/create-email-template")}
                      >
                        <Icons.Plus size={18} aria-hidden='true' />
                        <span>{t("emailTemplates.createTemplate")}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Table Container */}
                  <TableContainer
                    component={Paper}
                    className='custom-table-scrollbar'
                    style={{
                      maxWidth: "100%",
                      overflowX: "auto",
                      minHeight: "440px",
                      height: "calc(100vh - 280px)",
                      maxHeight: "calc(100vh - 280px)",
                    }}
                  >
                    <Table stickyHeader className='w-full' style={{ border: "none", minWidth: "750px" }}>
                      <TableHead className='customTableHead'>
                        <TableRow>
                          {columns.map((column, idx) => (
                            <TableCell
                              key={column.key || idx}
                              className='TableHeaderCell'
                              align={column.align || "left"}
                              style={{ width: column.width }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedTemplates.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={columns.length} className='table-empty-state-cell p-0'>
                              <TableEmptyState
                                icon={<Icons.BulkDocuments size={50} />}
                                title={t("emailTemplates.noEmailFound")}
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedTemplates.map((template) => (
                            <TableRow key={template.emailTemplateID} hover>
                              <TableCell
                                className='TableCell truncate-cell font-medium text-[var(--modern-text)]'
                                style={{ width: "30%" }}
                                title={template.subject}
                              >
                                {template.subject}
                              </TableCell>
                              <TableCell className='TableCell' style={{ width: "20%" }}>
                                <span className={`email-type-pill ${getTypePillClass(template.templateType)}`}>
                                  {templateTypeLabels[template.templateType] || template.templateType}
                                </span>
                              </TableCell>
                              <TableCell className='TableCell truncate-cell' style={{ width: "26%" }}>
                                <UserInitialsBadge name={template.createdBy} />
                              </TableCell>
                              <TableCell className='TableCell' style={{ width: "16%" }}>
                                <span className={`email-status-pill ${template.isActive ? "active" : "inactive"}`}>
                                  <span className='email-status-dot' aria-hidden='true' />
                                  <span>{template.isActive ? t("emailTemplates.active") : t("emailTemplates.inactive")}</span>
                                </span>
                              </TableCell>
                              <TableCell className='TableCell p-0' align='right' style={{ width: "8%" }}>
                                <Dropdown>
                                  <Dropdown.Toggle as={CustomToggle} />
                                  <Dropdown.Menu align='end'>
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
                  <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-[var(--modern-border,#e2e8f0)]'>
                    <div className='text-xs text-[var(--modern-muted,#64748b)]'>
                      {filteredTemplates.length ? page * rowsPerPage + 1 : 0} -{" "}
                      {Math.min((page + 1) * rowsPerPage, filteredTemplates.length)}{" "}
                      {t("emailTemplates.templateof")} {filteredTemplates.length} {t("emailTemplates.template")}
                    </div>
                    <Stack spacing={2}>
                      <Pagination
                        count={totalPages}
                        variant='outlined'
                        shape='rounded'
                        page={page + 1}
                        onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                      />
                    </Stack>
                  </div>
                </div>
              </Grid>
            </Grid>
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
        dialogClassName='max-w-md'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='email-header-icon-badge' style={{ width: 38, height: 38 }}>
              {templateToToggle?.isActive ? <Icons.InactiveAction size={20} /> : <Icons.Active size={20} color='#10b981' />}
            </div>
            <Modal.Title className='text-base font-bold text-[var(--modern-text)] m-0'>
              {t("emailTemplates.Confirmation")}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className='p-5 bg-[var(--modern-card)] text-[var(--modern-text)]'>
          <p className='text-sm text-[var(--modern-text)] mb-3 leading-relaxed'>
            {templateToToggle?.isActive ? t("emailTemplates.sureDeactivate") : t("emailTemplates.sureActive")}
          </p>
          {templateToToggle && (
            <div className='p-3.5 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)]'>
              <div className='text-xs font-medium text-[var(--modern-muted)] mb-1'>
                {t("emailTemplates.template")}:
              </div>
              <div className='text-sm font-semibold text-[var(--modern-text)] break-words'>
                {templateToToggle.subject}
              </div>
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
