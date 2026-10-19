import React, { useEffect, useState } from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import { useTranslation } from "react-i18next";
import RecentDocsFilter from "./RecentDocsFilter";
import Loader from "@/Components/CommonModals/Loader/Loader";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaDownload } from "react-icons/fa6";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import Dropdown from "react-bootstrap/Dropdown";
import { useUser } from "@/Context/UserContext";
import documentService from "@/services/documentService";
import { Icons } from "@/assets/Icons";
import "./RecentDocuments.css";

const RecentDocuments = () => {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(30);
  const { user, userAccess } = useUser();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const [docName, setDocName] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  //Alldocs api  api
  const fetchAllDocs = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.getRecentDocs();
      if (response.data.successStatus) {
        setData(response.data.response || []);
        setSearchResults(response.data.response || []);
        setPage(0);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocs();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (startDate || endDate || docStatus || docName || referenceNo) {
        const response = await documentService.getRecentDocs({
          StartDate: startDate,
          EndDate: endDate,
          DocStatus: docStatus,
          DocName: docName,
          ReferenceNo: referenceNo,
        });
        setSearchResults(response.data.response || []);
        setPage(0);
      } else {
        setSearchResults(data);
        setPage(0);
      }
    } catch (error) {
      console.error("Error searching documents", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setPage(0);
    setStartDate("");
    setEndDate("");
    setDocStatus("");
    setDocName("");
    setReferenceNo("");
    fetchAllDocs();
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber" },
    { label: t("tablesLabel.status"), key: "docStatus" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
  ];

  const statusColors = {
    completed: "var(--completed-status)",
    draft: "var(--draft-status)",
    declined: "var(--decline-status)",
    inactive: "var(--inactive-status)",
    pending: "var(--pending-status)",
    share: "var(--share-status)",
    recalled: "var(--recall-status)",
    bulk: "var(--share-status)",
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

  const exportToExcel = () => {
    const worksheetData = searchResults.map((row) => ({
      "Document Name": row.docName || "",
      "Date & Time": row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "",
      "Reference Number": row.referenceNumber || "",
      Status: row.docStatus === "" ? "Bulk" : row.docStatus || "",
      "Created By": row.createdByName || "",
      "Document Number": row.regCompanyPrefixNo || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    const fileName = `Documents_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(data, fileName);
  };

  return (
    <Grid className='recent-documents-page'>
      <Grid>
        {/* Loader overlay */}
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}

        {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
          <div className='recent-documents-card'>
            <div className='recent-documents-toolbar'>
              <h1 className='recent-documents-title'>{t("menuButtons.Alldocs")}</h1>

              <div className='recent-documents-actions'>
                <div className='recent-documents-export'>
                  <Dropdown>
                    <Dropdown.Toggle variant='primary' size='sm' className='recent-documents-export-btn d-flex align-items-center gap-2'>
                      <FaDownload size={14} />
                      {t("createTeam.Export")}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={exportToExcel} className='d-flex gap-2 align-items-center'>
                        <PiMicrosoftExcelLogo size={22} />
                        {t("createTeam.exportExcel")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className='search-filters-container recent-documents-filter'>
                  <RecentDocsFilter
                    startDate={startDate}
                    endDate={endDate}
                    docStatus={docStatus}
                    docName={docName}
                    referenceNo={referenceNo}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setDocStatus={setDocStatus}
                    setDocName={setDocName}
                    setReferenceNo={setReferenceNo}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                  />
                </div>
              </div>
            </div>
            {/* Table */}
            <TableContainer
              component={Paper}
              className='custom-table-scrollbar recent-documents-table-container'
              style={{
                maxWidth: "100%",
                overflowX: "auto",
                height: "70vh",
              }}
            >
              <Table stickyHeader className='recent-documents-table' style={{ border: "none", minWidth: "800px" }}>
                {/* Table Headers */}
                <TableHead>
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
                      <TableCell colSpan={columns.length} className='recent-documents-empty-state'>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Icons.BulkDocuments size={50} />
                          {t("dashboardCardStatuses.notDocsFound")}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={index}>
                      {/* Table Cells */}
                      <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                        {row.docName}
                      </TableCell>
                      <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                      <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
                      <TableCell className='TableCell'>
                        <span
                          className='recent-documents-status-pill'
                          style={{ "--status-color": statusColors[String(row.docStatus || "bulk").toLowerCase()] || "var(--share-status)" }}
                        >
                          {row.docStatus || "Bulk"}
                        </span>
                      </TableCell>
                      <TableCell className='TableCell'>{row.createdByName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <div className='recent-documents-pagination-bar'>
              <div className='recent-documents-pagination-copy'>
                {searchResults.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, searchResults.length)} {t("tablesLabel.documentsof")} {searchResults.length} {t("tablesLabel.document")}
              </div>
              <Stack spacing={2} className='recent-documents-pagination'>
                <Pagination count={Math.max(1, Math.ceil(searchResults.length / rowsPerPage))} variant='outlined' shape='rounded' page={Math.min(page + 1, Math.max(1, Math.ceil(searchResults.length / rowsPerPage)))} onChange={(event, newPage) => handleChangePage(event, newPage - 1)} />
              </Stack>
            </div>
          </div>
        ) : (
          <></>
        )}
      </Grid>

      {/* Share and View modals */}
    </Grid>
  );
};

export default RecentDocuments;
