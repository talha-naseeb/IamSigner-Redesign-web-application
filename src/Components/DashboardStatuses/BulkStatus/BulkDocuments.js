import React, { useEffect, useState } from "react";
import bulkService from "@/services/bulkService";
import { Button, Dropdown, Modal } from "@/Components/UI/shadcnCompat";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import { Grid, TableCell, TableRow, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import { Icons } from "@/assets/Icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DashboardComments from "@/Components/CommonModals/DocumentsComments/DashboardComments";
import DocumentStatusTable, { StatusBadge, formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";
import { AlertCircle, Loader2 } from "lucide-react";

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
    { label: t("tablesLabel.docName"), key: "docName", width: "24%" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo", width: "16%" },
    { label: t("tablesLabel.date"), key: "completedDate", width: "16%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "16%" },
    { label: t("tablesLabel.status"), key: "docStatus", width: "10%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "12%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  const navigateToViewSignatories = (docName, registerSignID, masterDocID) => {
    const folderPath = `/bulk-signatories/${docName}/${registerSignID}/${masterDocID}`;
    navigate(folderPath);
  };

  return (
    <Grid className='container'>
      {userAccess.isbulkCSVflow === true ? (
        <Grid item xs={12}>
          <DocumentStatusTable
            title={t("Sidebar.BulkDocuments")}
            count={searchResults.length}
            searchFilter={
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
            }
            columns={columns}
            data={searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            totalItems={searchResults.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            emptyStateIcon={<Icons.BulkDocuments size={50} />}
            emptyStateTitle={t("dashboardCardStatuses.notDocsFound")}
            renderRow={(row, index) => (
              <TableRow key={row.registerSignID || index} hover>
                <TableCell
                  style={{ width: "24%", cursor: "pointer" }}
                  title={row.docName}
                  onClick={() => navigateToViewSignatories(row.docName, row.registerSignID, row.masterDocID)}
                  className='TableCell truncate-cell font-medium text-[var(--modern-text)] hover:text-[var(--theme-color)] transition-colors'
                >
                  {row.docName}
                </TableCell>
                <TableCell className='TableCell' style={{ width: "16%" }}>
                  {row.docCompanyPrefixNo || "—"}
                </TableCell>
                <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "16%" }}>
                  {row.createdOnFormatted ? formatTableDate(row.createdOnFormatted) : "—"}
                </TableCell>
                <TableCell
                  onClick={(e) => handleCellClick(e)}
                  className='TableCell truncate-cell truncate-ref-cell'
                  title={row.referenceNumber}
                  style={{ width: "16%" }}
                >
                  {row.referenceNumber || "—"}
                </TableCell>
                <TableCell className='TableCell' style={{ width: "10%" }}>
                  <StatusBadge status={row.docStatus === "" ? "Not Started" : row.docStatus} />
                </TableCell>
                <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "12%" }}>
                  <UserInitialsBadge name={row.createdByName} />
                </TableCell>
                <TableCell className='TableCell p-0 text-right' style={{ width: "6%" }}>
                  {userAccess.remainingDays <= 0 ? (
                    <Dropdown>
                      <Dropdown.Toggle as={CustomToggle} />
                    </Dropdown>
                  ) : (
                    <Dropdown>
                      <Dropdown.Toggle as={CustomToggle} />
                      <Dropdown.Menu align='end'>
                        {row.docStatus === "Completed" ? (
                          <Dropdown.Item
                            className='d-flex gap-2 align-items-center'
                            onClick={() => handleDownloadModal(row.registerSignID, row.docName)}
                          >
                            <Icons.Download size={20} />
                            {t("dashboardCardStatuses.download")}
                          </Dropdown.Item>
                        ) : null}

                        {userAccess.auditTrail === true && (
                          <Dropdown.Item
                            className='d-flex gap-2 align-items-center'
                            onClick={() => handleViewAuditTrail(row.signedDocKey)}
                          >
                            <Icons.AuditTrail size={20} />
                            {t("dashboardCardStatuses.viewAuditTrail")}
                          </Dropdown.Item>
                        )}

                        <Dropdown.Item>
                          <DashboardComments registerSignID={row.registerSignID} />
                        </Dropdown.Item>

                        <Dropdown.Item
                          className='d-flex gap-2 align-items-center'
                          onClick={() => navigateToViewSignatories(row.docName, row.registerSignID, row.masterDocID)}
                        >
                          <Icons.SelfSign size={25} />
                          {t("signOrderDaigram.signatories")}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </TableCell>
              </TableRow>
            )}
          />
        </Grid>
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

      <Modal
        show={showDownloadModal}
        backdrop='static'
        keyboard={false}
        onHide={() => setShowDownloadModal(false)}
        dialogClassName='custom-modal-width'
      >
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)] shrink-0'>
              <Icons.Download size={18} />
            </div>
            <div>
              <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
                {t("dashboardCardStatuses.donwloadBulk")}
              </Modal.Title>
              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                {t("dashboardCardStatuses.clickToDownloadDocs")}
              </p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-5 py-4 space-y-3 bg-[var(--modern-card)]'>
          {selectedDocName && (
            <div className='flex items-center gap-3 p-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
              <div className='w-10 h-10 rounded-xl bg-[var(--modern-card)] border border-[var(--modern-border)] flex items-center justify-center shrink-0 text-[var(--theme-color)]'>
                <Icons.PDFs size={22} />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='text-xs font-medium text-[var(--modern-muted)]'>
                  {t("dashboardCardStatuses.document")}
                </div>
                <div className='text-sm font-semibold text-[var(--modern-text)] truncate'>
                  {selectedDocName}
                </div>
              </div>
            </div>
          )}

          <div className='flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs'>
            <AlertCircle size={16} className='shrink-0 mt-0.5' />
            <span>This will download a ZIP containing all signatories’ signed documents</span>
          </div>
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
          <Button
            variant='none'
            disabled={isLoading}
            className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors'
            onClick={() => setShowDownloadModal(false)}
          >
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity'
            variant='none'
            onClick={handleDownloadBulkDocuments}
          >
            {isLoading ? <Loader2 size={15} className='animate-spin' /> : <Icons.Download size={16} />}
            {t("dashboardCardStatuses.download")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Grid>
  );
};

export default BulkDocuments;
