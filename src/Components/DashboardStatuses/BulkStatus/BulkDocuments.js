import React, { useEffect, useState } from "react";
import bulkService from "@/services/bulkService";
import { Button, Dropdown, Modal } from "@/Components/UI/shadcnCompat";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import { Icons } from "@/assets/Icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DashboardComments from "@/Components/CommonModals/DocumentsComments/DashboardComments";

const BulkDocuments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const statusColors = {
    completed: "var(--completed-status)",
    draft: "var(--draft-status)",
    declined: "var(--decline-status)",
    inactive: "var(--inactive-status)",
    pending: "var(--pending-status)",
    share: "var(--share-status)",
    recalled: "var(--recall-status)",
  };
  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [registerSignID, setRegisterSignID] = useState(""); // store the selected RegisterSignID
  const [selectedDocName, setSelectedDocName] = useState(""); // store the selected document name

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fetch Bulk api
  const FetchBulkDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await bulkService.getBulkDocuments();
      if (response.data.successStatus) {
        setData(response.data.response);
        setSearchResults(response.data.response || []);
        setIsLoading(false);
      } else {
        console.error("API Error:", response.data.message);
      }
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };
  useEffect(() => {
    FetchBulkDocuments();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await bulkService.getBulkDocuments({
          StartDate: startDate,
          EndDate: endDate,
          ReferenceNo: referenceNo,
          DocNumber: docNumber,
          DocName: docName,
        });
      }
      setSearchResults(response.data.response || []);
      setIsLoading(false);
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setStartDate("");
    setEndDate("");
    setReferenceNo("");
    setDocNumber("");
    setDocName("");
    handleSearch();
    FetchBulkDocuments();
  };

  const handleViewAuditTrail = (signedDocKey) => {
    const newPdfUrl = `/AuditTrail/id/${signedDocKey}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
  };

  const handleDownloadModal = (registerSignID, docName) => {
    setRegisterSignID(registerSignID); // store the ID
    setSelectedDocName(docName); // store the document name
    setShowDownloadModal(true);
  };

  const handleDownloadBulkDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await bulkService.downloadBulkCSVDocs({
        RegisterSignID: registerSignID,
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/zip" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${selectedDocName}.zip`; // use the selected document name
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setShowDownloadModal(false);
        toast.success(t("dashboardCardStatuses.fileDownload"));
        setIsLoading(false);
      }
    } catch (error) {
      if (error && error.response && error.response.status === 404) {
        toast.error(t("dashboardCardStatuses.Nosupporting"));
      }
      setShowDownloadModal(false);
      setIsLoading(false);
    }
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo" },
    { label: t("tablesLabel.date"), key: "completedDate" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber" },
    { label: t("tablesLabel.status"), key: "docStatus" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
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

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const navigateToViewSignatories = (docName, registerSignID, masterDocID) => {
    const folderPath = `/bulk-signatories/${docName}/${registerSignID}/${masterDocID}`;
    navigate(folderPath);
  };

  return (
    <Grid className='container' style={{ marginTop: "12px" }}>
      {userAccess.isbulkCSVflow === true ? (
        <>
          <Grid>

            <div className='py-3 p-3 container pendingtable'>
              <div className='document-status-toolbar'>
                <h4>{t("Sidebar.BulkDocuments")}</h4>

                <div className='search-filters-container'>
                  <DocumentSearchFilters
                    startDate={startDate}
                    endDate={endDate}
                    referenceNo={referenceNo}
                    docNumber={docNumber}
                    docName={docName}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setReferenceNo={setReferenceNo}
                    setDocNumber={setDocNumber}
                    setDocName={setDocName}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                  />
                </div>
              </div>
              {/* Table */}
              <TableContainer
                component={Paper}
                className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
                style={{
                  maxWidth: "100%",
                  overflowX: "auto",
                  minHeight: "440px",
                  height: "calc(100vh - 280px)",
                  maxHeight: "calc(100vh - 280px)",
                }}
              >
                <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                  {/* Table Headers */}
                  <TableHead className='customTableHead'>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.label} className='TableHeaderCell'>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  {/* Table Body */}
                  <TableBody>
                    {searchResults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                          <TableEmptyState
                            icon={<Icons.BulkDocuments size={50} />}
                            title={t("dashboardCardStatuses.notDocsFound")}
                          />
                        </TableCell>
                      </TableRow>
                    )}

                    {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow key={index}>
                        {/* Table Cells */}
                        <TableCell style={{ cursor: "pointer" }} title={row.docName} onClick={() => navigateToViewSignatories(row.docName, row.registerSignID, row.masterDocID)} className='TableCell truncate-cell'>
                          {row.docName}
                        </TableCell>
                        <TableCell className='TableCell'>{row.docCompanyPrefixNo}</TableCell>
                        <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                        <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber}>
                          {row.referenceNumber}
                        </TableCell>
                        <TableCell className='TableCell'>
                          {(() => {
                            const rawStatus = (row.docStatus || "").toLowerCase();
                            const statusColor = statusColors[rawStatus] || "var(--inactive-status)";
                            const label = row.docStatus === "" ? "Not Started" : row.docStatus;
                            return (
                              <span
                                className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold'
                                style={{
                                  color: statusColor,
                                  backgroundColor: `color-mix(in srgb, ${statusColor} 12%, var(--modern-card))`,
                                  border: `1px solid color-mix(in srgb, ${statusColor} 35%, var(--modern-border))`,
                                }}
                              >
                                {label}
                              </span>
                            );
                          })()}
                        </TableCell>

                        <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                          <UserInitialsBadge name={row.createdByName} />
                        </TableCell>

                        {userAccess.remainingDays <= 0 ? (
                          <>
                            <TableCell className='TableCell p-0'>
                              <Dropdown>
                                <Dropdown.Toggle as={CustomToggle} />
                              </Dropdown>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className='TableCell p-0'>
                              <Dropdown>
                                <Dropdown.Toggle as={CustomToggle} />

                                <Dropdown.Menu>
                                  {row.docStatus === "Completed" ? (
                                    <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDownloadModal(row.registerSignID, row.docName)}>
                                      <Icons.Download size={20} />
                                      {t("dashboardCardStatuses.download")}
                                    </Dropdown.Item>
                                  ) : null}

                                  {userAccess.auditTrail === true ? (
                                    <>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewAuditTrail(row.signedDocKey)}>
                                        <Icons.AuditTrail size={20} />
                                        {t("dashboardCardStatuses.viewAuditTrail")}
                                      </Dropdown.Item>
                                    </>
                                  ) : (
                                    <></>
                                  )}

                                  <Dropdown.Item>
                                    <DashboardComments registerSignID={row.registerSignID} />
                                  </Dropdown.Item>

                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => navigateToViewSignatories(row.docName, row.registerSignID, row.masterDocID)}>
                                    <Icons.SelfSign size={25} />
                                    {t("signOrderDaigram.signatories")}
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-xs text-[var(--modern-muted)]'>
                <div>
                  {data.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.documentsof")} {data.length} {t("tablesLabel.document")}
                </div>
                <Stack spacing={2}>
                  <Pagination
                    count={Math.max(1, Math.ceil(data.length / rowsPerPage))}
                    variant='outlined'
                    shape='rounded'
                    page={Math.min(page + 1, Math.max(1, Math.ceil(data.length / rowsPerPage)))}
                    onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                  />
                </Stack>
              </div>
            </div>
          </Grid>
        </>
      ) : null}

      {/* Share and View modals */}

      <ViewModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setPdfUrl("");
        }}
        pdfUrl={pdfUrl}
      />

      <AuditTrailModal
        show={showATModal}
        auditTrailURL={auditTrailURL}
        handleClose={() => {
          setShowATModal(false);
          setAuditTrailURL("");
        }}
      />

      <Modal show={showDownloadModal} backdrop='static' keyboard={false} onHide={() => setShowDownloadModal(false)} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.Download size={18} />
            </div>

            <div className='header-text'>
              <Modal.Title>{t("dashboardCardStatuses.donwloadBulk")}</Modal.Title>
              <p className='header-subtitle'>{t("dashboardCardStatuses.clickToDownloadDocs")}</p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='transfer-modal-body'>
          {selectedDocName && (
            <div className='document-info'>
              <div className='document-icon'>
                <Icons.PDFs size={24} />
              </div>

              <div className='document-details'>
                <h6 className='document-title'>{t("dashboardCardStatuses.document")}</h6>
                <p className='document-name'>{selectedDocName}</p>
              </div>
            </div>
          )}

          <div className='transfer-warning-bulk'>
            <div className='warning-text-bulk'>
              <p>This will download a ZIP containing all signatories’ signed documents</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='none' className='modalCancelButton' onClick={() => setShowDownloadModal(false)}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button className='applyBtn' variant='none' onClick={handleDownloadBulkDocuments}>
            <Icons.Download className='me-2' size={16} />
            {t("dashboardCardStatuses.download")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Grid>
  );
};

export default BulkDocuments;
