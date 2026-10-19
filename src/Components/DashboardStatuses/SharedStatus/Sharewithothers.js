import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ViewModal from "@/Components/DashboardStatuses/ViewModal/ViewModal";
import SignOrder from "@/Components/DashboardStatuses/SignOrder";
import Dropdown from "react-bootstrap/Dropdown";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Pagination, Stack } from "@mui/material";
import DocumentSearchFilters from "@/Components/DashboardStatuses/SearchFilter/DocSearchFilter";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import ShareDownloadModal from "@/Components/DashboardStatuses/DownloadModal/shareDownloadModal";
import CustomToggle from "@/Components/DashboardStatuses/CustomDots/CustomToggle";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";

const Sharedwithothers = () => {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [signedDocKey, setSignedDocKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [registerSignID, setRegisterSignID] = useState();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dataRow, setDataRow] = useState();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchSharedwithothersData = async () => {
    setIsLoading(true);
    try {
      //Shared with others Api
      const response = await dashboardService.getDocSharedWithOthersList();

      //console.log('share with others', response);
      setData(response.data.response);
      setSearchResults(response.data.response || []);
      if (response.data.response && response.data.response.length > 0) {
        const firstItem = response.data.response[0];
        setSignedDocKey(firstItem.signedDocKey);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedwithothersData();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await dashboardService.getDocSharedWithOthersList({
          StartDate: startDate,
          EndDate: endDate,
          ReferenceNo: referenceNo,
          DocNumber: docNumber,
          DocName: docName,
        });
      } else {
        setSearchResults(data);
        setIsLoading(false);
        return;
      }

      setSearchResults(response.data.response || []);
      setIsLoading(false);
    } catch (error) {
      console.error(t("navbar.errorfetchingUserData"));
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
    fetchSharedwithothersData();
  };

  const handleViewAuditTrail = (signedDocKey) => {
    const newPdfUrl = `/AuditTrail/id/${signedDocKey}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
  };

  //handle download and View
  const handleFileDownload = async (row) => {
    if (row.isAuditTrailDocShared || row.isSupportingDocShared) {
      setShowDownloadModal(true);
      setDataRow(row);
    } else {
      setIsLoading(true);
      try {
        const response = await documentService.downloadDoc({
          SignAuth: row.signedDocKey,
        });

        const fileUrl = response.data.response.document;

        const downloadedBlob = await downloadURL(fileUrl);

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(downloadedBlob);
        downloadLink.download = row.docName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        toast.success(t("navbar.fileDownload"));
      } catch (error) {
        toast.error(t("navbar.fileNotDownload"));
      } finally {
        setIsLoading(false);
      }
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
      throw new Error(`${t("dashboardCardStatuses.errDownload")} ${error.message}`);
    }
  }

  const handleView = async (row) => {
    setIsLoading(true);
    try {
      const { signedDocKey } = row;
      const response = await documentService.downloadDoc({
        SignAuth: signedDocKey,
      });
      const pdfUrl = response.data.response.document;
      setIsLoading(false);
      setPdfUrl(pdfUrl);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast.error(t("dashboardCardStatuses.fileNotDisplay"));
      setIsLoading(false);
    }
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo" },
    { label: "Date & Time", key: "createdOn" },
    { label: t("tablesLabel.email"), key: "email" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber" },
    { label: t("tablesLabel.actions"), key: "actions" },
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
    <Grid className='container'>
      <Grid>
        {/* Loader overlay */}
        {isLoading && (
          <div className='loader-overlay'>
            \<Loader />
          </div>
        )}

        <div className='py-3 p-3 container pendingtable'>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className='fs-16'>Share with others</label>

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
              height: "50vh",
            }}
          >
            <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
              {/* Table Headers */}
              <TableHead className='customTableHead'>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.label} style={{ backgroundColor: "#E7F7FE" }} className='TableHeaderCell'>
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

                {searchResults.map((row, index) => (
                  <TableRow key={index}>
                    {/* Table Cells */}
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      {row.docName}
                    </TableCell>
                    <TableCell className='TableCell'>{row.docCompanyPrefixNo}</TableCell>
                    <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                    <TableCell className='TableCell'>{row.email}</TableCell>
                    <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
                    <TableCell className='TableCell p-0'>
                      <Dropdown>
                        <Dropdown.Toggle as={CustomToggle} />

                        <Dropdown.Menu>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                            {/* <MdFileDownload size={22} style={{ cursor: "pointer" }} /> */}
                            <Icons.Download size={20} />
                            {t("dashboardCardStatuses.download")}
                          </Dropdown.Item>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row)}>
                            <Icons.View size={20} />
                            {t("dashboardCardStatuses.view")}
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <SignOrder masterDocID={row.masterDocID} />
                          </Dropdown.Item>
                          {row.isAuditTrailDocShared && (
                            <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewAuditTrail(row.signedDocKey)}>
                              <Icons.AuditTrail size={20} />
                              {/* <img src={auditIcon} alt='' /> */}
                              {t("navbar.viewAuditTrail")}
                            </Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <div className='showHideNoDocs'>
              {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} documents of {data.length} documents
            </div>
            <Stack spacing={2}>
              <Pagination count={Math.ceil(data.length / rowsPerPage)} variant='outlined' shape='rounded' page={page + 1} onChange={(event, newPage) => handleChangePage(event, newPage - 1)} />
            </Stack>
          </div>
        </div>
      </Grid>

      <AuditTrailModal
        show={showATModal}
        auditTrailURL={auditTrailURL}
        handleClose={() => {
          setShowATModal(false);
          setAuditTrailURL("");
        }}
      />

      <ShareDownloadModal
        show={showDownloadModal}
        dataRow={dataRow}
        handleClose={() => {
          setShowDownloadModal(false);
        }}
      />

      <ViewModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setPdfUrl("");
        }}
        pdfUrl={pdfUrl}
      />
    </Grid>
  );
};

export default Sharedwithothers;
