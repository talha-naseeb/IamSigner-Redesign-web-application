import React, { useEffect, useState } from "react";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";

const DeclinedDocs = () => {
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dataRow, setDataRow] = useState();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const fetchDeclinedData = async () => {
    try {
      //DEcline Api
      setIsLoading(true);
      const response = await dashboardService.getRegisterSignDeclined();
      if (response.data.successStatus) {
        setData(response.data.response);
        setSearchResults(response.data.response || []);
        if (response.data.response && response.data.response.length > 0) {
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclinedData();
  }, [userAccess]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await dashboardService.getRegisterSignDeclined({
          StartDate: startDate,
          EndDate: endDate,
          ReferenceNo: referenceNo,
          DocNumber: docNumber,
          DocName: docName,
        });
      }
      setSearchResults(response?.data?.response || []);
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
    fetchDeclinedData();
  };

  const handleFileDownload = async (row) => {
    setDataRow(row);
    setShowDownloadModal(true);
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
      setIsLoading(false);
      toast.error(t("dashboardCardStatuses.fileNotDisplay"));
    }
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.docNumber"), key: "regCompanyPrefixNo" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.Remarks"), key: "declinedReason" },
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

    return `${day}/${month}/${year} ${hours}:${formattedMinutes} ${ampm}`;
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
          <div className="document-status-toolbar">
            <h4>{t("menuButtons.declinedDocs")}</h4>

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
                    <td colSpan='6' className='p-5 text-center'>
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
                    <TableCell className='TableCell'>{row.regCompanyPrefixNo}</TableCell>
                    <TableCell className='TableCell'>{row.declinedDate ? formatDate(row.declinedDateFormatted) : ""}</TableCell>
                    <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                      {row.declinedReason}
                    </TableCell>
                    <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      {row.createdByName}
                    </TableCell>

                    {userAccess.remainingDays <= 0 ? (
                      <>
                        <TableCell className='TableCell py-0'>
                          <Dropdown></Dropdown>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className='TableCell py-0'>
                          <Dropdown>
                            <Dropdown.Toggle as={CustomToggle} />

                            <Dropdown.Menu>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
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

      <DownloadModal
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

export default DeclinedDocs;
