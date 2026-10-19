import React, { useEffect, useState } from "react";
import bulkService from "@/services/bulkService";
import { Button, Dropdown, Modal } from "react-bootstrap";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import { Icons } from "@/assets/Icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
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
            {/* Loader overlay */}
            {isLoading && (
              <div className='loader-overlay'>
                <Loader />
              </div>
            )}

            <div className='py-3 p-3 container pendingtable'>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "20px", fontWeight: "500" }}>{t("Sidebar.BulkDocuments")}</label>

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
              {/* Table */}
              <TableContainer
                component={Paper}
                className='custom-table-scrollbar'
                style={{
                  maxWidth: "100%",
                  overflowX: "auto",
                  height: "70vh",
                }}
              >
                <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                  {/* Table Headers */}
                  <TableHead className='customTableHead'>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.label} style={{ backgroundColor: "#e7f7fe" }} className='TableHeaderCell'>
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
                            <Icons.BulkDocuments size={50} color='#F0F3F4' />
                            {t("dashboardCardStatuses.notDocsFound")}
                          </div>
                        </td>
                      </TableRow>
                    )}

                    {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow key={index}>
                        {/* Table Cells */}
                        <TableCell style={{ cursor: "pointer" }} onClick={() => navigateToViewSignatories(row.docName, row.registerSignID, row.masterDocID)} className='TableCell truncate-cell'>
                          {row.docName}
                        </TableCell>
                        <TableCell className='TableCell'>{row.docCompanyPrefixNo}</TableCell>
                        <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                        <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
                        <TableCell className='TableCell '>
                          <label
                            style={{
                              padding: "2px 12px",
                              borderRadius: "12px",
                              fontWeight: "bold",
                              color:
                                row.docStatus === "Completed"
                                  ? "#19d157"
                                  : row.docStatus === "Draft"
                                  ? "#4339f2"
                                  : row.docStatus === "Declined"
                                  ? "#dc3545"
                                  : row.docStatus === "InActive"
                                  ? "#bec4c8"
                                  : row.docStatus === "Pending"
                                  ? "#f9ba05"
                                  : row.docStatus === "Share"
                                  ? "#0c9ad7"
                                  : row.docStatus === "Recalled"
                                  ? "#47b7c5"
                                  : row.docStatus === ""
                                  ? "#bec4c8"
                                  : "inherit",
                              border: `1px solid ${
                                row.docStatus === "Completed"
                                  ? "#19d157"
                                  : row.docStatus === "Draft"
                                  ? "#4339f2"
                                  : row.docStatus === "Declined"
                                  ? "#dc3545"
                                  : row.docStatus === "InActive"
                                  ? "#bec4c8"
                                  : row.docStatus === "Pending"
                                  ? "#f9ba05"
                                  : row.docStatus === "Share"
                                  ? "#0c9ad7"
                                  : row.docStatus === "Recalled"
                                  ? "#47b7c5"
                                  : row.docStatus === ""
                                  ? "#bec4c8"
                                  : "inherit"
                              }`,
                            }}
                          >
                            {row.docStatus === "" ? "Not Started" : row.docStatus}
                          </label>
                        </TableCell>

                        <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                          {row.createdByName}
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

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                <div className='showHideNoDocs'>
                  {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.documentsof")} {data.length} {t("tablesLabel.document")}
                </div>
                <Stack spacing={2}>
                  <Pagination count={Math.ceil(data.length / rowsPerPage)} variant='outlined' shape='rounded' page={page + 1} onChange={(event, newPage) => handleChangePage(event, newPage - 1)} />
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
