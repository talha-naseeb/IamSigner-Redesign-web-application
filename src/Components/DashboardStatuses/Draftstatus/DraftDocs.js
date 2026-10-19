import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./style.css";
import { useNavigate } from "react-router";
import InactiveConfirmationModal from "@/Components/CommonModals/InactiveConfirmationModal/InactiveConfirmationModal";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import DraftSearchFilter from "@/Components/CommonModals/SearchFilters/DraftSearchFilter";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";

const DraftStatus = () => {
  const { t } = useTranslation();
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
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.requestNumber"), key: "companyPrefixNo" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber" },
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

  return (
    <Grid className='container' style={{ marginTop: "12px" }}>
      <Grid>
        {/* Loader overlay */}
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}

        <div className='py-3 p-3 container pendingtable'>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>{t("dashboardCardStatuses.draftdoc")}</h4>

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
                    <TableCell key={column.label} style={{ backgroundColor: "#dad9e9" }} className='TableHeaderCell'>
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
                    {/* Table Cells */}
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      {row.docName}
                    </TableCell>
                    <TableCell className='TableCell'>{row.companyPrefixNo}</TableCell>
                    <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                    <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
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
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
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
      <Modal show={showDownloadModal} backdrop='static' keyboard={false} onHide={handleDownClose} dialogClassName='custom-modal-width'>
        <Modal.Header>
          <Modal.Title>{t("dashboardCardStatuses.viewDocument")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>
          <p>{t("dashboardCardStatuses.selectDoc")}</p>
          {docNameview.map((doc, index) => (
            <div className='form-check' key={index}>
              <input type='checkbox' className='form-check-input' id={`checkbox${index}`} checked={selectedDocument === doc} onChange={() => handleCheckboxChange(doc)} />
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
          <Button variant='none' className='applyBtn' onClick={handleView} disabled={downloadDisabled}>
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
