import React, { useEffect, useState } from "react";
import { Dropdown, Button, Modal } from "react-bootstrap";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import InactiveDocsDownloadModal from "@/Components/CommonModals/DownloadModal/InactiveDocsDownloadModal";
import { toast } from "react-toastify";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import DraftSearchFilter from "@/Components/CommonModals/SearchFilters/DraftSearchFilter";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";

const InActive = () => {
  const { t } = useTranslation();
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
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.documentCount"), key: "documentCount" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
    { label: "", key: "actions" },
  ];

  return (
    <Grid className='container' style={{ marginTop: "12px" }}>
      <Grid item xs={12}>
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}

        <div className='py-3 p-3 container pendingtable'>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>{t("dashboardCardStatuses.InactiveDoc")}</h3>
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
          </div>
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
              <TableHead className='customTableHead'>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.label} style={{ backgroundColor: "#E7EBEE" }} className='TableHeaderCell'>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

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
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      {row.docName}
                    </TableCell>
                    <TableCell className='TableCell'>{row.totalDocCount || 0}</TableCell>
                    <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      {row.referenceNumber}
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
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleRegisterSignId(row.registerSignID)}>
                                <Icons.Download size={20} />
                                {t("dashboardCardStatuses.download")}
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewRegisterSignId(row.registerSignID)}>
                                <Icons.View size={20} />
                                {t("dashboardCardStatuses.view")}
                              </Dropdown.Item>
                              {/* <Dropdown.Item>
                                <SignOrder masterDocID={row.masterDocID} />
                              </Dropdown.Item> */}
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
        <Modal.Header>
          <Modal.Title>{t("dashboardCardStatuses.viewDocument")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>
          <p>{t("dashboardCardStatuses.selectDoc")}</p>
          {docNameview.map((doc, index) => (
            <div className='form-check' key={index}>
              <input type='checkbox' className='form-check-input' id={`checkbox${index}`} checked={selectedDocument === doc} onChange={() => setSelectedDocument(doc)} />
              <label className='form-check-label' htmlFor={`checkbox${index}`}>
                {doc.docName}
              </label>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='none' className='modalCancelButton' onClick={handleDownClose}>
            {t("dashboardCardStatuses.cancel")}
          </Button>
          <Button variant='none' className='applyBtn' onClick={handleView} disabled={!selectedDocument}>
            {t("dashboardCardStatuses.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Grid>
  );
};

export default InActive;
