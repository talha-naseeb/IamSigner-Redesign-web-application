import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PATHS from "@/routes/paths";
import { Dropdown, Button, Modal } from "@/Components/UI/shadcnCompat";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import InactiveDocsDownloadModal from "@/Components/CommonModals/DownloadModal/InactiveDocsDownloadModal";
import { toast } from "react-toastify";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import DraftSearchFilter from "@/Components/CommonModals/SearchFilters/DraftSearchFilter";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";
import DocumentStatusTable, { formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";
import { Loader2 } from "lucide-react";

const InActive = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDashboardCardView = pathname === PATHS.INACTIVE;
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docName, setDocName] = useState("");
  const [docNameShow, setDocNameShow] = useState([]);
  const [docNameview, setDocNameview] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // calculate document countszz
  const calculateDocumentCounts = (responseData) => {
    return responseData.map((row) => {
      const docNameString = row.docName || "";
      const docNames = docNameString
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name);
      const docNameCount = docNames.reduce((acc, docName) => {
        acc[docName] = (acc[docName] || 0) + 1;
        return acc;
      }, {});

      return { ...row, docNameCount, totalDocCount: docNames.length };
    });
  };

  const fetchInActiveData = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getRegisterSignInActive();
      const responseData = response.data.response;
      const docCount = calculateDocumentCounts(responseData);

      setData(docCount);
      setSearchResults(docCount || []);
      setIsLoading(false);
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData", error));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInActiveData();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docName) {
        response = await dashboardService.getRegisterSignInActive({
          StartDate: startDate,
          EndDate: endDate,
          ReferenceNo: referenceNo,
          DocName: docName,
        });
      } else {
        // If no search criteria, use the existing data
        setSearchResults(data);
        setIsLoading(false);
        return;
      }

      const responseData = response.data.response || [];
      const docCount = calculateDocumentCounts(responseData);
      setSearchResults(docCount);
      setIsLoading(false);
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData", error));
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setStartDate("");
    setEndDate("");
    setReferenceNo("");
    setDocName("");
    handleSearch();
    fetchInActiveData();
  };

  const handleRegisterSignId = async (registerSignID) => {
    try {
      const response = await dashboardService.getDocsByRegisterSignID(registerSignID);

      const documents = response.data.response || [];
      setDocNameShow(documents);
      setShowDownloadModal(true);
    } catch (error) {
      console.error(error);
      toast.error(t("dashboardCardStatuses.errorFetchingSignedDocKey"));
    }
  };
  const handleViewRegisterSignId = async (registerSignID) => {
    try {
      const response = await dashboardService.getDocsByRegisterSignID(registerSignID);

      const documents = response.data.response || [];
      setDocNameview(documents);
      setShowViewModal(true);
    } catch (error) {
      console.error(error);
      toast.error(t("dashboardCardStatuses.errorFetchingSignedDocKey"));
    }
  };

  const handleFileDownload = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.downloadDoc({
        SignAuth: selectedDocument.signedDocKey,
      });

      if (response.data.statusCode === "1") {
        const fileUrl = response.data.response.document;

        const downloadedBlob = await downloadURL(fileUrl);

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(downloadedBlob);
        downloadLink.download = "document.pdf";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        toast.success(t("dashboardCardStatuses.fileDownload"));
      } else if (response.data.statusCode === "7") {
        handleDownClose();
        toast.info(t("dashboardCardStatuses.fileNotDownload"));
      }
    } catch (error) {
      toast.error(t("dashboardCardStatuses.fileNotDownload"));
    } finally {
      setIsLoading(false);
      setShowDownloadModal(false);
    }
  };

  async function downloadURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${t("dashboardCardStatuses.httpErr")} ${response.status}`);
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw error;
    }
  }

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

  const handleDownClose = () => {
    setSelectedDocument(null);
    setShowDownloadModal(false);
    setShowViewModal(false);
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName", width: "28%" },
    { label: t("tablesLabel.documentCount"), key: "documentCount", width: "14%" },
    { label: t("tablesLabel.date"), key: "createdOn", width: "18%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "18%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "16%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];

  return (
    <Grid className='container'>
      <Grid item xs={12}>
        <DocumentStatusTable
          title={t("dashboardCardStatuses.InactiveDoc")}
          count={searchResults.length}
          searchFilter={
            <DraftSearchFilter
              startDate={startDate}
              endDate={endDate}
              referenceNo={referenceNo}
              docName={docName}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setReferenceNo={setReferenceNo}
              setDocName={setDocName}
              handleSearch={handleSearch}
              clearSearch={clearSearch}
              hideRequestNo={true}
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
              <TableCell className='TableCell' style={{ width: "14%" }}>
                {row.totalDocCount || 0}
              </TableCell>
              <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "18%" }}>
                {row.createdOnFormatted ? formatTableDate(row.createdOnFormatted) : "—"}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} style={{ width: "18%" }}>
                {row.referenceNumber || "—"}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "16%" }}>
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
                    <Dropdown.Menu>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleRegisterSignId(row.registerSignID)}>
                        <Icons.Download size={20} />
                        {t("dashboardCardStatuses.download")}
                      </Dropdown.Item>
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewRegisterSignId(row.registerSignID)}>
                        <Icons.View size={20} />
                        {t("dashboardCardStatuses.view")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </TableCell>
            </TableRow>
          )}
        />
      </Grid>

      <ViewModal show={showModal} handleClose={() => setShowModal(false)} pdfUrl={pdfUrl} />

      <InactiveDocsDownloadModal
        show={showDownloadModal}
        handleClose={handleDownClose}
        docNameShow={docNameShow}
        selectedDocument={selectedDocument}
        setSelectedDocument={setSelectedDocument}
        handleFileDownload={handleFileDownload}
      />

      <Modal show={showViewModal} backdrop='static' keyboard={false} onHide={handleDownClose} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--modern-raised)] text-[var(--theme-color)] border border-[var(--modern-border)]'>
              <Icons.View size={20} />
            </div>
            <div>
              <Modal.Title className='text-base font-semibold text-[var(--modern-text)] m-0'>
                {t("dashboardCardStatuses.viewDocument")}
              </Modal.Title>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-5 py-4 space-y-4'>
          <p className='text-xs text-[var(--modern-muted)] m-0'>{t("dashboardCardStatuses.selectDoc")}</p>
          <div className='space-y-2'>
            {docNameview.map((doc, index) => {
              const isSelected = selectedDocument === doc;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDocument(isSelected ? null : doc)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[var(--theme-color)] bg-[var(--modern-raised)] text-[var(--modern-text)]"
                      : "border-[var(--modern-border)] bg-[var(--modern-card)] hover:bg-[var(--modern-raised)] text-[var(--modern-text)]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[var(--theme-color)] border-[var(--theme-color)] text-white"
                        : "border-[var(--modern-border-strong)] bg-[var(--modern-bg)]"
                    }`}
                  >
                    {isSelected && <span className='text-xs font-bold'>✓</span>}
                  </div>
                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                    <Icons.PDFs size={18} className='text-[var(--theme-color)] shrink-0' />
                    <span className='text-sm font-medium truncate'>{doc.docName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
          <button
            type='button'
            className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] transition-colors'
            onClick={handleDownClose}
            disabled={isLoading}
          >
            {t("dashboardCardStatuses.cancel")}
          </button>
          <button
            type='button'
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity'
            onClick={handleView}
            disabled={!selectedDocument || isLoading}
          >
            {isLoading && <Loader2 size={14} className='animate-spin' />}
            <span>{t("dashboardCardStatuses.confirm")}</span>
          </button>
        </Modal.Footer>
      </Modal>
    </Grid>
  );
};

export default InActive;
