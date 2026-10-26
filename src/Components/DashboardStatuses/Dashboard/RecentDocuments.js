import React, { useEffect, useState } from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import RecentDocsFilter from "./RecentDocsFilter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet } from "lucide-react";
import { Dropdown as Dropdown } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import documentService from "@/services/documentService";
import { Icons } from "@/assets/Icons";

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
    <div className='w-full max-w-none m-0 py-6 px-4 sm:px-6 bg-[var(--modern-bg)] text-[var(--modern-text)] font-sans'>
      <div>

        {user.AccountType === "B" && (user.RoleID === 1 || user.RoleID === 4) && userAccess.remainingDays >= 0 ? (
          <div className='w-full max-w-[1560px] mx-auto p-5 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)]'>
            <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
              <h1 className='m-0 text-xl sm:text-2xl font-bold tracking-tight text-[var(--modern-text)]'>{t("menuButtons.Alldocs")}</h1>

              <div className='flex items-center justify-end gap-2.5 ml-auto'>
                <div>
                  <Dropdown>
                    <Dropdown.Toggle variant='primary' size='sm' className='inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--modern-violet)] hover:bg-[var(--modern-violet-hover)] text-white border-0 transition-colors'>
                      <Download size={14} />
                      {t("createTeam.Export")}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={exportToExcel} className='d-flex gap-2 align-items-center'>
                        <FileSpreadsheet size={20} />
                        {t("createTeam.exportExcel")}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className='search-filters-container'>
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
                      <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                        <TableEmptyState
                          icon={<Icons.BulkDocuments size={50} />}
                          title={t("dashboardCardStatuses.notDocsFound")}
                        />
                      </TableCell>
                    </TableRow>
                  )}

                  {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const statusColor = statusColors[String(row.docStatus || "bulk").toLowerCase()] || "var(--share-status)";
                    return (
                      <TableRow key={index} className='hover:bg-[var(--modern-raised)]'>
                        {/* Table Cells */}
                        <TableCell className='TableCell truncate-cell' title={row.docName} onClick={(e) => handleCellClick(e)}>
                          {row.docName}
                        </TableCell>
                        <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                        <TableCell className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} onClick={(e) => handleCellClick(e)}>
                          {row.referenceNumber}
                        </TableCell>
                        <TableCell className='TableCell'>
                          <span
                            className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold'
                            style={{
                              color: statusColor,
                              backgroundColor: `color-mix(in srgb, ${statusColor} 12%, var(--modern-card))`,
                              border: `1px solid color-mix(in srgb, ${statusColor} 35%, var(--modern-border))`,
                            }}
                          >
                            {row.docStatus || "Bulk"}
                          </span>
                        </TableCell>
                        <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                          <UserInitialsBadge name={row.createdByName} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4'>
              <div className='text-xs text-[var(--modern-muted)]'>
                {searchResults.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, searchResults.length)} {t("tablesLabel.documentsof")} {searchResults.length} {t("tablesLabel.document")}
              </div>
              <Stack spacing={2}>
                <Pagination count={Math.max(1, Math.ceil(searchResults.length / rowsPerPage))} variant='outlined' shape='rounded' page={Math.min(page + 1, Math.max(1, Math.ceil(searchResults.length / rowsPerPage)))} onChange={(event, newPage) => handleChangePage(event, newPage - 1)} />
              </Stack>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>

      {/* Share and View modals */}
    </div>
  );
};

export default RecentDocuments;
