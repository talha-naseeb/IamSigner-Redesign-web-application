import React, { useEffect, useState, useRef } from "react";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Button, Col, Dropdown, Modal } from "@/Components/UI/shadcnCompat";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@/Components/UI/dataPrimitives";
import { Icons } from "@/assets/Icons";
import TemplatesSearchFilter from "./TemplatesSearchFilter";
import EditTemplateNameModal from "./EditTemplateNameModal";
import { useTranslation } from "react-i18next";
import TemplatesConfirmationModal from "./TemplatesConfirmationModal";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";

const TemplatesPage = () => {
  const { t } = useTranslation();
  const { user, userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [Scope, setScope] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const navigate = useNavigate();
  const [templateID, setTemplateID] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setViewModal] = useState(false);
  const [originalTemplateName, setOriginalTemplateName] = useState("");
  const [selectedTemplateID, setSelectedTemplateID] = useState(null);
  const [showTemplateIDModal, setShowTemplateIDModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activeTemplateID, setActiveTemplateID] = useState("");
  const [docName, setDocName] = useState("");
  const [documentPages, setDocumentPages] = useState({});
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenTemplateIDModal = (templateID) => {
    setSelectedTemplateID(templateID);
    setIsCopied(false);
    setShowTemplateIDModal(true);
  };

  const handleCloseTemplateIDModal = () => {
    setSelectedTemplateID(null);
    setIsCopied(false);
    setShowTemplateIDModal(false);
  };

  const templateIDRef = useRef(null);

  const handleCopyTemplateID = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        await navigator.clipboard.writeText(selectedTemplateID);
      } else {
        // Fallback for older browsers
        if (templateIDRef.current) {
          templateIDRef.current.select();
          document.execCommand("copy");
        }
      }

      setIsCopied(true);
      toast.success(t("templateUploadFlow.copiedClipboard"));

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy template ID");
      console.error("Copy failed:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const fetchTemplatesData = async () => {
    setIsLoading(true);
    try {
      const response = await templateService.getAllTemplates();
      if (response.data) {
        setData(response.data.response);
        setSearchResults(response.data.response || []);

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesData();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;

      if (startDate || endDate || Scope || templateName || docStatus) {
        const params = {
          StartDate: startDate,
          EndDate: endDate,
          Scope: Scope,
          TemplateName: templateName,
          DocStatus: docStatus,
        };

        response = await templateService.getAllTemplates(params);

        setSearchResults(response.data.response || []);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setTemplateName("");
    setStartDate("");
    setEndDate("");
    setScope("");
    setDocStatus("");
    handleSearch();
    fetchTemplatesData();
  };

  //inactive templates

  const handleDeleteTemplate = async (templateID) => {
    setIsLoading(true);
    try {
      setTemplateID(templateID);

      const response = await templateService.deleteTemplate(templateID, {
        TemplateSignatoryID: templateID, // if needed by backend
      });

      if (response.data && response.data.statusCode === "1") {
        toast.success(t("templateUploadFlow.templateDeletedSuccess"));
        setData((prevData) => prevData.filter((item) => item.templateID !== templateID));
        handleCloseDeleteConfirmation();
        fetchTemplatesData();
      } else {
        toast.error(t("templateUploadFlow.failedToDeleteTemplate"));
      }
    } catch (error) {
      toast.error(t("templateUploadFlow.errToggleDoc"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (selectedTemplateID) {
      handleCloseConfirmation();
      await handleDeleteTemplate(selectedTemplateID);
    }
  };

  const handleToggle = async (templateID) => {
    setIsLoading(true);
    try {
      setTemplateID(templateID);

      const response = await templateService.deactivateTemplate(templateID);

      if (response.data && response.data.statusCode === "1") {
        toast.success(t("templateUploadFlow.templateDeactivate"));
        setData((prevData) => prevData.filter((item) => item.templateID !== templateID));
        fetchTemplatesData();
      } else {
        toast.error(t("templateUploadFlow.failedDeactivate"));
      }
    } catch (error) {
      toast.error(t("templateUploadFlow.errToggleDoc"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeactivation = async () => {
    if (selectedTemplateID) {
      handleCloseConfirmation();
      await handleToggle(selectedTemplateID);
    }
  };

  // Function to handle opening the confirmation modal
  const handleOpenConfirmation = (templateID) => {
    setSelectedTemplateID(templateID);
    setShowDeactivateModal(true);
  };

  // Function to handle closing the confirmation modal
  const handleCloseConfirmation = () => {
    setShowDeactivateModal(false);
    setSelectedTemplateID(null);
  };

  const handleOpenDeleteConfirmation = (templateID) => {
    setSelectedTemplateID(templateID);
    setShowDeleteModal(true);
  };

  // Function to handle closing the confirmation modal
  const handleCloseDeleteConfirmation = () => {
    setShowDeleteModal(false);
    setSelectedTemplateID(null);
  };

  const handleEditTemplateName = async (templateID, tempName) => {
    setSelectedTemplateID(templateID);
    setOriginalTemplateName(tempName);
    setShowModal(true);
  };

  const handleSaveTemplateName = (updatedTemplateName) => {
    setTemplateName(updatedTemplateName);
    fetchTemplatesData();
  };

  const handleEditDoc = (templateID) => {
    sessionStorage.setItem("templateID", templateID);
    localStorage.setItem("templateID", templateID);
    navigate("/edit-templates");
  };

  const columns = [
    { label: t("tablesLabel.templateName"), key: "templateName" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
    { label: t("tablesLabel.scope"), key: "templateID" },
    { label: t("tablesLabel.status"), key: "isActive" },
    { label: "", key: "actions" },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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

  const handleActiveTemplate = (templateID) => {
    setShowActivateModal(true);
    setActiveTemplateID(templateID);
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      const response = await templateService.activateTemplate(activeTemplateID);
      if (response.status === 200) {
        toast.success(t("templateUploadFlow.tempActiveSucess"));
      } else {
        toast.error(t("templateUploadFlow.failedActive"));
      }
      setShowActivateModal(false);
    } catch (error) {
      toast.error(t("templateUploadFlow.failedActive"));
      console.error(error);
    } finally {
      setIsLoading(false);
      fetchTemplatesData();
      setShowActivateModal(false);
    }
  };

  const handleFileview = async (masterDocID, fileName) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getMasterDocPages(masterDocID);

      if (response.data.successStatus) {
        const pages = response.data.response;
        const pagesMap = {};
        pages.forEach((page) => {
          pagesMap[page.pagesName] = page;
        });
        setDocumentPages(pagesMap);
        setDocName(fileName);
        setViewModal(true);
        setIsLoading(false);
      } else {
        // console.error("API request failed");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(t("uploadDocFlow.filecantView"));
    }
  };

  const handleCloseModal = () => {
    setViewModal(false);
  };

  const handleCreateTemplate = () => {
    sessionStorage.removeItem("templateID");
    localStorage.removeItem("templateID");
    navigate("/create-templates");
  };

  return (
    <>
      {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
        <></>
      ) : (
        <>
          <Grid className='container mt-3'>
            <Grid item xs={12}>
              {/* Loader overlay */}
              {isLoading && (
                <div className='loader-overlay'>
                  <Loader />
                </div>
              )}
              <div className='flex justify-end mb-3'>
                <Button variant='primary' onClick={handleCreateTemplate}>
                  {t("templateUploadFlow.createTemplate")}
                </Button>
              </div>
              <div className='py-4 px-4 rounded-xl border border-[var(--modern-border,#e2e8f0)] bg-[var(--modern-card,#ffffff)]'>
                <div className='flex justify-between items-center p-1 mb-3'>
                  <label className='font-semibold text-lg text-[var(--modern-text,#0f172a)] m-0'>{t("templateUploadFlow.myTemplate")}</label>

                  <div className='search-filters-container'>
                    <TemplatesSearchFilter
                      startDate={startDate}
                      endDate={endDate}
                      Scope={Scope}
                      templateName={templateName}
                      docStatus={docStatus}
                      setDocStatus={setDocStatus}
                      setStartDate={setStartDate}
                      setEndDate={setEndDate}
                      setScope={setScope}
                      setTemplateName={setTemplateName}
                      handleSearch={handleSearch}
                      clearSearch={clearSearch}
                    />
                  </div>
                </div>

                {/* Table */}
                <TableContainer
                  component={Paper}
                  className='custom-table-scrollbar'
                  style={{
                    maxWidth: "100%",
                    overflowX: "auto",
                    height: "60vh",
                  }}
                >
                  <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                    {/* Table Headers */}
                    <TableHead className='customTableHead'>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.label} style={{ backgroundColor: "#F0F3F4" }} className='TableHeaderCell'>
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    {/* Table Body */}
                    <TableBody>
                      {searchResults.length === 0 && (
                        <TableRow>
                          <td colSpan='6' className='p-5 text-center' style={{ color: "var(--secondary-color) !important" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <Icons.BulkDocuments size={50} />
                              {t("dashboardCardStatuses.notDocsFound")}
                            </div>
                          </td>
                        </TableRow>
                      )}
                      {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className='TableCell'>{row.templateName}</TableCell>
                          <TableCell className='TableCell'>{row.createdOn ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                          <TableCell className='TableCell'>{row.createdByName}</TableCell>
                          <TableCell className='TableCell'>{row.scope === "I" ? "Individual" : "Company"}</TableCell>
                          <TableCell className='TableCell'>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"}`}>
                              {row.isActive ? "Active" : "InActive"}
                            </span>
                          </TableCell>
                          <TableCell className='TableCell p-0'>
                            <Dropdown>
                              <Dropdown.Toggle as={CustomToggle} />

                              <Dropdown.Menu>
                                <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleEditTemplateName(row.templateID, row.templateName)}>
                                  <Icons.PenEdit size={20} />
                                  {t("templateUploadFlow.rename")}
                                </Dropdown.Item>
                                <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleEditDoc(row.templateID)}>
                                  <Icons.EditSquare size={20} />
                                  {t("templateUploadFlow.editTemplate")}
                                </Dropdown.Item>

                                <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileview(row.masterDocID, row.templateName)}>
                                  <Icons.View size={20} />
                                  {t("uploadDocFlow.view")}
                                </Dropdown.Item>

                                <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenTemplateIDModal(row.templateID)}>
                                  <Icons.CopyTemplate size={20} />
                                  {t("templateUploadFlow.templateid")}
                                </Dropdown.Item>
                                {row.isActive ? (
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenConfirmation(row.templateID)}>
                                    <Icons.InactiveAction size={20} />
                                    {t("templateUploadFlow.inactive")}
                                  </Dropdown.Item>
                                ) : (
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleActiveTemplate(row.templateID)}>
                                    <Icons.Active size={20} color='#19d157' />
                                    {t("templateUploadFlow.active")}
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenDeleteConfirmation(row.templateID)}>
                                  <Icons.DeleteAction size={20} />
                                  {t("templateUploadFlow.delete")}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </TableCell>
                          <TableCell style={{ padding: 0 }}></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <div className='showHideNoDocs'>
                    {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.documentsof")} {data.length} {t("tablesLabel.document")}
                  </div>
                  <Stack spacing={2}>
                    <Pagination count={Math.ceil(data.length / rowsPerPage)} variant='outlined' shape='rounded' page={page + 1} onChange={(event, newPage) => handleChangePage(event, newPage - 1)} />
                  </Stack>
                </div>
              </div>
            </Grid>

            {/* Template Delete Modal (Enhanced)   */}
            <DeleteConfirmationModal
              show={showDeleteModal}
              onHide={handleCloseDeleteConfirmation}
              title={t("templateConfirmationModal.Confirmation")}
              subtitle={t("templateConfirmationModal.proceed")}
              warningText={t("templateConfirmationModal.proceedtemplate")}
              itemTitle={t("tablesLabel.templateName")}
              itemName={(data.find((d) => d.templateID === selectedTemplateID) || {}).templateName || ""}
              onConfirm={handleConfirmDeletion}
              confirmText={`${t("templateConfirmationModal.yes")}, ${t("templateConfirmationModal.delete")}`}
              cancelText={t("templateConfirmationModal.cancel")}
              headerIcon={<Icons.DeleteAction size={25} />}
              itemIcon={<Icons.CopyTemplate size={25} />}
            />

            {/* Template Deactivate Modal (Enhanced) */}
            <TemplatesConfirmationModal
              show={showDeactivateModal}
              handleClose={handleCloseConfirmation}
              handleConfirm={handleConfirmDeactivation}
              title={t("templateConfirmationModal.Confirmation")}
              subtitle={t("templateUploadFlow.inactiveTemp")}
              warningText={t("confirmationModal.proceed")}
              itemTitle={t("tablesLabel.templateName")}
              itemName={(data.find((d) => d.templateID === selectedTemplateID) || {}).templateName || ""}
              headerIcon={<Icons.InactiveAction size={25} />}
              itemIcon={<Icons.CopyTemplate size={25} />}
              confirmText={t("confirmationModal.yesDeactivate")}
              cancelText={t("confirmationModal.cancel")}
              button={t("menuButtons.inactive")}
            />

            {/* Template Rename Modal (Enhanced) */}
            <EditTemplateNameModal originalTemplateName={originalTemplateName} templateID={selectedTemplateID} show={showModal} onHide={() => setShowModal(false)} onSave={handleSaveTemplateName} />

            {/* Template ID Modal */}
            <Modal show={showTemplateIDModal} centered onHide={handleCloseTemplateIDModal} dialogClassName='custom-modal-width'>
              <Modal.Body style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6c757d",
                      marginBottom: "8px",
                    }}
                  >
                    {t("templateUploadFlow.templateid")}
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      backgroundColor: "var(--bg-secondary)",
                      border: "2px solid var(--border-color)",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <input
                      ref={templateIDRef}
                      type='text'
                      value={selectedTemplateID}
                      readOnly
                      style={{
                        flex: 1,
                        border: "none",
                        background: "transparent",
                        fontSize: "16px",
                        fontFamily: "monospace",
                        color: "#495057",
                        fontWeight: "500",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleCopyTemplateID}
                      disabled={isCopied}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        backgroundColor: isCopied ? "#28a745" : "var(--theme-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: isCopied ? "default" : "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: isCopied ? "0 2px 4px rgba(40, 167, 69, 0.2)" : "0 2px 4px rgba(12, 154, 215, 0.2)",
                        opacity: isCopied ? 0.9 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isCopied) {
                          e.target.style.backgroundColor = "var(--theme-active)";
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 4px 8px rgba(12, 154, 215, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCopied) {
                          e.target.style.backgroundColor = "var(--theme-color)";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 4px rgba(12, 154, 215, 0.2)";
                        }
                      }}
                    >
                      {isCopied ? (
                        <>
                          <Icons.Check style={{ fontSize: "14px" }} />
                          {t("templateUploadFlow.copied")}
                        </>
                      ) : (
                        <>
                          <Icons.Copy style={{ fontSize: "14px" }} />
                          {t("templateUploadFlow.copy")}
                        </>
                      )}
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      marginTop: "8px",
                      marginBottom: "0",
                      fontStyle: "italic",
                    }}
                  >
                    {t("templateUploadFlow.copyTemplateID")}
                  </p>
                </div>
              </Modal.Body>
            </Modal>

            {/* Template Activate Modal (Enhanced) */}
            <TemplatesConfirmationModal
              show={showActivateModal}
              handleClose={() => setShowActivateModal(false)}
              handleConfirm={handleActivate}
              title={t("templateConfirmationModal.Confirmation")}
              subtitle={t("templateUploadFlow.activeTemplates")}
              warningText={t("templateUploadFlow.sureActiveTemplate")}
              itemTitle={t("tablesLabel.templateName")}
              itemName={(data.find((d) => d.templateID === activeTemplateID) || {}).templateName || ""}
              headerIcon={<Icons.Active size={25} color='#19d157' />}
              itemIcon={<Icons.CopyTemplate size={25} color='#19d157' />}
              confirmText={t("templateUploadFlow.yesActive")}
              cancelText={t("templateConfirmationModal.cancel")}
            />

            {/* view template */}
            <Modal show={showViewModal} onHide={handleCloseModal}>
              <Modal.Header closeButton className='btn'>
                <Modal.Title style={{ color: "var(--text-primary)" }}>{docName}</Modal.Title>
              </Modal.Header>
              <Modal.Body className='d-flex'>
                <Col>
                  {isLoading ? (
                    <div className='loader d-flex justify-content-center  align-items-center'>Loading...</div>
                  ) : (
                    Object.values(documentPages).map((page, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img src={page.pagesPath} alt={page.pagesName} style={{ width: "100%", height: "auto" }} />
                        <div className='page-name-footer'>{page.pagesName}</div>
                      </div>
                    ))
                  )}
                </Col>
              </Modal.Body>
            </Modal>
          </Grid>
        </>
      )}
    </>
  );
};

export default TemplatesPage;
