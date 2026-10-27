import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import PATHS from "@/routes/paths";
import InactiveConfirmationModal from "@/Components/CommonModals/InactiveConfirmationModal/InactiveConfirmationModal";
import { Dropdown, Modal, Button } from "@/Components/UI/shadcnCompat";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import DraftSearchFilter from "@/Components/CommonModals/SearchFilters/DraftSearchFilter";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";
import DocumentStatusTable, { formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";
import { FileText, Check, Loader2 } from "lucide-react";

const DraftStatus = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDashboardCardView = pathname === PATHS.DRAFTS;
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [requestNo, setRequestNo] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const [registerSignID, setRegisterSignID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedRegisterSignID, setSelectedRegisterSignID] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [downloadDisabled, setDownloadDisabled] = useState(true);
  const [docNameview, setDocNameview] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedRowForInactive, setSelectedRowForInactive] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const fetchDraftData = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getRegisterSignDraftList();
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
    fetchDraftData();
  }, []);

  const handleViewRegisterSignId = async (registerSignID) => {
    setIsLoading(true);

    try {
      const response = await dashboardService.getDocsByRegisterSignID(registerSignID);

      const documents = response.data.response || [];
      setIsLoading(false);

      setDocNameview(documents);
      setShowDownloadModal(true);
    } catch (error) {
      console.error(error);
      toast.error(t("dashboardCardStatuses.errorFetchingSignedDocKey"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.downloadDoc({
        SignAuth: selectedDocument.signedDocKey,
      });
      if (response.data.statusCode === "1") {
        const pdfUrl = response.data.response.document;
        handleDownClose();
        setPdfUrl(pdfUrl);
        setShowModal(true);
      } else if (response.data.statusCode === "7") {
        handleDownClose();
        toast.info(t("dashboardCardStatuses.fileNotDisplay"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (document) => {
    setSelectedDocument(document);
    setDownloadDisabled(false);
  };

  const handleDownClose = () => {
    setSelectedDocument(null);
    setShowDownloadModal(false);
    setDownloadDisabled(true);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || requestNo || docName) {
        response = await dashboardService.getRegisterSignDraftList({
          StartDate: startDate,
          EndDate: endDate,
          ReferenceNo: referenceNo,
          RequestNo: requestNo,
          DocName: docName,
        });
      }
      setSearchResults(response?.data?.response || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setStartDate("");
    setEndDate("");
    setReferenceNo("");
    setRequestNo("");
    setDocName("");
    handleSearch();
    fetchDraftData();
  };

  //inactive draft documents

  const handleToggle = async (registerSignID) => {
    setIsLoading(true);
    try {
      setRegisterSignID(registerSignID);

      const response = await dashboardService.changeDocStatusInActive({ RegisterSignID: registerSignID });

      if (response.data.statusCode === "1") {
        toast.success("DocStatus InActive Successfully");
        setData((prevData) => prevData.filter((item) => item.registerSignID !== registerSignID));
        fetchDraftData();
      } else {
        toast.error("Failed to set InActive");
      }
    } catch (error) {
      toast.error("Error toggling document status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle opening the confirmation modal
  const handleOpenConfirmation = (row) => {
    setSelectedRowForInactive(row);
    setSelectedRegisterSignID(row.registerSignID);
    setShowConfirmationModal(true);
  };

  // Function to handle closing the confirmation modal
  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
    setSelectedRegisterSignID(null);
    setSelectedRowForInactive(null);
  };

  const handleEditDoc = (registerSignID) => {
    navigate("/upload-doc");
    localStorage.setItem("registerSignID", registerSignID);
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName", width: "28%" },
    { label: t("tablesLabel.requestNumber"), key: "companyPrefixNo", width: "18%" },
    { label: t("tablesLabel.date"), key: "createdOn", width: "18%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "16%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "14%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  return (
    <Grid className='container'>
      <Grid item xs={12}>
        <DocumentStatusTable
          title={t("dashboardCardStatuses.draftdoc")}
          count={searchResults.length}
          searchFilter={
            <DraftSearchFilter
              startDate={startDate}
              endDate={endDate}
              referenceNo={referenceNo}
              requestNo={requestNo}
              docName={docName}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setReferenceNo={setReferenceNo}
              setRequestNo={setRequestNo}
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
          tableContainerStyle={{ maxHeight: isDashboardCardView ? "38vh" : "calc(100vh - 280px)" }}
          renderRow={(row, index) => (
            <TableRow key={row.registerSignID || index} hover>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell font-medium text-[var(--modern-text)]' title={row.docName} style={{ width: "28%" }}>
                {row.docName}
              </TableCell>
              <TableCell className='TableCell' style={{ width: "18%" }}>{row.companyPrefixNo}</TableCell>
              <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "18%" }}>{row.createdOnFormatted ? formatTableDate(row.createdOnFormatted) : "—"}</TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} style={{ width: "16%" }}>
                {row.referenceNumber}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "14%" }}>
                <UserInitialsBadge name={row.createdByName} />
              </TableCell>

              {userAccess.remainingDays <= 0 ? (
                <TableCell className='TableCell p-0' align='right' style={{ width: "6%" }}>
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} />
                  </Dropdown>
                </TableCell>
              ) : (
                <TableCell className='TableCell p-0' align='right' style={{ width: "6%" }}>
                  <Dropdown>
                    <Dropdown.Toggle as={CustomToggle} />
                    <Dropdown.Menu align='end'>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenConfirmation(row)}>
                        <Icons.InactiveAction size={20} />
                        {t("dashboardCardStatuses.inactive")}
                      </Dropdown.Item>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleEditDoc(row.registerSignID)}>
                        <Icons.PenEdit size={20} />
                        {t("dashboardCardStatuses.edit")}
                      </Dropdown.Item>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewRegisterSignId(row.registerSignID)}>
                        <Icons.View size={20} />
                        {t("dashboardCardStatuses.view")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </TableCell>
              )}
            </TableRow>
          )}
        />
      </Grid>
      <Modal show={showDownloadModal} backdrop='static' keyboard={false} onHide={handleDownClose} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4 bg-[var(--modern-card)]'>
          <Modal.Title className='text-base font-semibold text-[var(--modern-text)]'>{t("dashboardCardStatuses.viewDocument")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-5 bg-[var(--modern-card)]'>
          <p className='text-xs text-[var(--modern-muted)] mb-3'>{t("dashboardCardStatuses.selectDoc")}</p>
          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {docNameview.map((doc, index) => (
              <div
                key={index}
                onClick={() => handleCheckboxChange(doc)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedDocument === doc ? "bg-[var(--modern-raised)] border-[var(--theme-color)]" : "bg-[var(--modern-card)] border-[var(--modern-border)] hover:bg-[var(--modern-raised)]"
                }`}
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <FileText size={16} className={selectedDocument === doc ? "text-[var(--theme-color)]" : "text-[var(--modern-muted)]"} />
                  <span className='text-xs font-medium text-[var(--modern-text)] truncate'>{doc.docName}</span>
                </div>
                {selectedDocument === doc && <Check size={16} className='text-[var(--theme-color)] shrink-0' />}
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
          <Button
            variant='none'
            className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors'
            onClick={handleDownClose}
          >
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button
            variant='none'
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity'
            onClick={handleView}
            disabled={downloadDisabled}
          >
            {t("dashboardCardStatuses.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
      <ViewModal show={showModal} handleClose={() => setShowModal(false)} pdfUrl={pdfUrl} />
      <InactiveConfirmationModal
        show={showConfirmationModal}
        onHide={handleCloseConfirmation}
        selectedRow={selectedRowForInactive}
        onSuccess={() => {
          // Remove row from current list and refresh
          if (selectedRegisterSignID) {
            setData((prev) => prev.filter((it) => it.registerSignID !== selectedRegisterSignID));
          }
          fetchDraftData();
        }}
      />
    </Grid>
  );
};

export default DraftStatus;
