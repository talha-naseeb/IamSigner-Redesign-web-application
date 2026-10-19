import React, { useEffect, useState } from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Button, Dropdown, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UserLisence from "@/Components/UserLisence/UserLisence";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";

import userService from "@/services/userService";

const EmailTemplates = () => {
  const { t } = useTranslation();
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { user, userAccess } = useUser();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [templateToToggle, setTemplateToToggle] = useState(null);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailTemplateID, setEmailTemplateID] = useState(null);
  const [selectedTemplateForDelete, setSelectedTemplateForDelete] = useState(null);

  useEffect(() => {
    fetchEmailTemplates();
  }, [user.AccountID, userAccess.remainingDays]);

  const fetchEmailTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getEmailTemplates(user.AccountID);

      if (response.data.statusCode === "1") {
        const templates = response.data.response.map((template) => ({
          ...template,
          body: parsePlaceholders(template.body),
        }));
        setEmailTemplates(templates);
      } else {
        setEmailTemplates([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const parsePlaceholders = (emailBody) => {
    return emailBody.replace(/{(.*?)}/g, (match, placeholder) => {
      return `<span class="immutable-placeholder" contenteditable="false">{${placeholder}}</span>`;
    });
  };

  useEffect(() => {
    fetchEmailTemplates();
  }, [user.AccountID, userAccess.remainingDays]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Toggle status between active and inactive
  const handleToggleStatus = async () => {
    if (!templateToToggle) return;

    const { emailTemplateID, isActive, templateType } = templateToToggle;
    setIsLoading(true);
    try {
      const response = await userService.updateEmailTemplateStatus({ EmailTemplateID: emailTemplateID, IsActive: !isActive, AccountID: user.AccountID, TemplateType: templateType });

      if (response.data.statusCode === "1") {
        toast.success(t("emailTemplates.emailUpdated"));
        fetchEmailTemplates();
      } else if (response.data.statusCode === "10") {
        toast.info(t("emailTemplates.DeactiveFirst"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Open confirmation modal
  const handleConfirmToggle = (template) => {
    setTemplateToToggle(template);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleEditTemplate = (template) => {
    navigate("/create-email-template", { state: { template } });
  };

  const columns = [
    { label: t("tablesLabel.subject"), key: "subject" },
    { label: t("tablesLabel.tempType"), key: "templateType" },
    { label: t("tablesLabel.createdby"), key: "createdBy" },
    { label: t("tablesLabel.status"), key: "isActive" },
    { label: "", key: "actions" },
  ];

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const goBack = () => navigate("/create-email-template");

  const handleDeleteTemplate = (template) => {
    setEmailTemplateID(template.emailTemplateID);
    setSelectedTemplateForDelete(template);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!emailTemplateID) return;

    setIsLoading(true);
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
      setIsLoading(false);
      setShowDeleteModal(false);
      setEmailTemplateID(null);
      setSelectedTemplateForDelete(null);
    }
  };

  const templateTypeLabels = {
    Declined: "Declined",
    Completed: "Completed",
    PasswordReset: "Password Reset",
    CreateTeam: "Create Team",
    SigningDocument: "Signing Document",
  };

  return (
    <>
      {userAccess.remainingDays <= 0 ? (
        <UserLisence />
      ) : (
        <>
          {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
            <>
              <Grid className='container mt-3'>
                {isLoading && (
                  <div className='loader-overlay'>
                    <Loader />
                  </div>
                )}

                <div className='userProfile-form container mb-2'>
                  <div className='d-flex align-items-center gap-2 mb-4'>
                    <Icons.Back className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""} onClick={goBack} style={{ cursor: "pointer" }} />
                    <label style={{ fontSize: "20px", fontWeight: "600" }}>{t("emailTemplates.emailTemplates")}</label>
                  </div>

                  <TableContainer
                    component={Paper}
                    className='custom-table-scrollbar'
                    style={{
                      maxWidth: "100%",
                      overflowX: "auto",
                      height: "67vh",
                    }}
                  >
                    <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                      <TableHead className='customTableHead'>
                        <TableRow>
                          {columns.map((column) => (
                            <TableCell key={column.label} style={{ backgroundColor: "#f0f3f4" }} className='TableHeaderCell'>
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {emailTemplates.length === 0 && (
                          <TableRow>
                            <td colSpan='6' className='p-5 text-center' style={{ color: "var(--secondary-color) !important" }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Icons.BulkDocuments size={50} />
                                {t("emailTemplates.noEmailFound")}
                              </div>
                            </td>
                          </TableRow>
                        )}

                        {emailTemplates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((template) => (
                          <TableRow key={template.emailTemplateID}>
                            <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                              {template.subject}
                            </TableCell>
                            <TableCell className='TableCell'>{templateTypeLabels[template.templateType] || template.templateType}</TableCell>
                            <TableCell className='TableCell'>{template.createdBy}</TableCell>
                            <TableCell className='TableCell'>
                              <label
                                style={{
                                  padding: "2px 12px",
                                  borderRadius: "12px",
                                  fontWeight: "bold",
                                  color: template.isActive ? "#19d157" : "#6c757d",
                                  border: `1px solid ${template.isActive ? "#19d157" : "#6c757d"}`,
                                }}
                              >
                                {template.isActive ? "Active" : "Inactive"}
                              </label>
                            </TableCell>
                            <TableCell className='py-0'>
                              <Dropdown>
                                <Dropdown.Toggle as={CustomToggle} />
                                <Dropdown.Menu>
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleConfirmToggle(template)}>
                                    {template.isActive ? <Icons.InactiveAction size={20} /> : <Icons.Active size={20} color='#19d157' />}
                                    {template.isActive ? t("emailTemplates.inactive") : t("emailTemplates.active")}
                                  </Dropdown.Item>
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleEditTemplate(template)}>
                                    <Icons.EditSquare size={20} />
                                    {t("emailTemplates.editTemplate")}
                                  </Dropdown.Item>
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteTemplate(template)}>
                                    <Icons.DeleteAction size={20} />
                                    {t("uploadDocFlow.delete")}
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                    <div>
                      {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, emailTemplates.length)} {t("emailTemplates.templateof")} {emailTemplates.length} {t("emailTemplates.template")}
                    </div>
                    <Stack spacing={2}>
                      <Pagination count={totalPages} variant='outlined' shape='rounded' page={page + 1} onChange={(event, newPage) => handleChangePage(newPage - 1)} />
                    </Stack>
                  </div>
                </div>
              </Grid>
            </>
          ) : null}
        </>
      )}

      {/* Confirmation Modal for Toggling Status (styled like Draft.js) */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>{templateToToggle && templateToToggle.isActive ? <Icons.InactiveAction size={25} /> : <Icons.Active size={25} color='#19d157' />}</div>

            <div className='header-text'>
              <Modal.Title>{t("emailTemplates.Confirmation")}</Modal.Title>
              {/* <p className='header-subtitle'>{templateToToggle && templateToToggle.isActive ? t("emailTemplates.sureDeactivate") : t("emailTemplates.sureActive")}</p> */}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-4 py-3'>
          {/* {templateToToggle && (
            <div className='document-info'>
              <div className='document-icon'>
                <img src={documentIcon} alt={t("emailTemplates.template")} height={20} width={20} />
              </div>
              <div className='document-details'>
                <h6 className='document-title'>{t("emailTemplates.template")}</h6>
                <p className='document-name'>{templateToToggle.subject}</p>
              </div>
            </div>
          )} */}
          <p className='header-subtitle'>{templateToToggle && templateToToggle.isActive ? t("emailTemplates.sureDeactivate") : t("emailTemplates.sureActive")}</p>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={handleCloseConfirmModal}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button variant='none' className='applyBtn' onClick={handleToggleStatus}>
            {t("dashboardCardStatuses.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Email Template - reusable common modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => {
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
      />
    </>
  );
};

export default EmailTemplates;
