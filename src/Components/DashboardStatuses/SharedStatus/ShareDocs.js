import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import Dropdown from "react-bootstrap/Dropdown";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Stack } from "@mui/material";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DraftSearchFilter";
import "./style.css";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import ShareDownloadModal from "@/Components/CommonModals/DownloadModal/shareDownloadModal";
import { Button } from "react-bootstrap";
import { Icons } from "@/assets/Icons";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";

const ShareDocs = () => {
  const { t } = useTranslation();
  const { user, userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [otherData, setotherData] = useState([]);
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
  const [shareOtherResults, setshareOtherResults] = useState([]);
  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [registerSignID, setRegisterSignID] = useState();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dataRow, setDataRow] = useState();
  const [viewMode, setViewMode] = useState("shareWithMe");
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [page, setPage] = useState(0);

  const handleShareWithMe = () => {
    setViewMode("shareWithMe");
  };

  const handleShareWithOthers = () => {
    setViewMode("shareWithOthers");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const fetchSharedwithothersData = async () => {
    setIsLoading(true);
    try {
      //Shared with others Api
      const response = await dashboardService.getDocSharedWithOthersList();

      setotherData(response.data.response);
      setshareOtherResults(response.data.response || []);
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

  const fetchSharedwithmeData = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getDocSharedWithMeList();
      setData(response.data.response);
      setSearchResults(response.data.response || []);
      if (response.data.response && response.data.response.length > 0) {
        const firstItem = response.data.response[0];
        setSignedDocKey(firstItem.signedDocKey);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
    }
  };

  useEffect(() => {
    fetchSharedwithmeData();
  }, []);

  //Search Filter for Share with me / Share with others
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        if (viewMode === "shareWithMe") {
          response = await dashboardService.getDocSharedWithMeList({
            StartDate: startDate,
            EndDate: endDate,
            ReferenceNo: referenceNo,
            DocNumber: docNumber,
            DocName: docName,
          });
        } else if (viewMode === "shareWithOthers") {
          response = await dashboardService.getDocSharedWithOthersList({
            StartDate: startDate,
            EndDate: endDate,
            ReferenceNo: referenceNo,
            DocNumber: docNumber,
            DocName: docName,
          });
        }
      } else {
        // If no search criteria, use the cached data
        if (viewMode === "shareWithMe") {
          setSearchResults(data);
        } else {
          setshareOtherResults(otherData);
        }
        setIsLoading(false);
        return;
      }

      if (viewMode === "shareWithMe") {
        setSearchResults(response.data.response || []);
      } else if (viewMode === "shareWithOthers") {
        setshareOtherResults(response.data.response || []);
      }
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
    fetchSharedwithmeData();
    fetchSharedwithothersData();
  };

  const handleViewAuditTrail = (signedDocKey) => {
    const newPdfUrl = `/AuditTrail/id/${signedDocKey}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
  };

  //handle downlaod and View
  const handleFileDownload = async (row, signedDocKey, registerSignID) => {
    setSignedDocKey(signedDocKey);
    setRegisterSignID(registerSignID);
    setShowDownloadModal(true);
    setDataRow(row);
  };

  const handleView = async (row) => {
    setIsLoading(true);
    try {
      const { signedDocKey } = row;
      const response = await documentService.downloadDoc({
        SignAuth: signedDocKey,
      });
      const pdfUrl = response.data.response.document;
      setPdfUrl(pdfUrl);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast.error(t("dashboardCardStatuses.fileNotDisplay"));
    } finally {
      setIsLoading(false);
    }
  };

  const shareWithMeColumns = [
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.email"), key: "email" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
    { label: "", key: "actions" },
  ];

  const shareWithOthersColumns = [
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("tablesLabel.email"), key: "email" },
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
      {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
        <></>
      ) : (
        <>
          {userAccess.docShare === true ? (
            <>
              <Grid>
                {isLoading && (
                  <div className='loader-overlay'>
                    <Loader />
                  </div>
                )}

                <div className='py-3 p-3 container pendingtable'>
                  <h4>{t("dashboardCardStatuses.Shareddoc")}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className='d-flex gap-3 '>
                      <Button className={`SignButton ${viewMode === "shareWithMe" ? "active" : ""}`} onClick={handleShareWithMe}>
                        {t("dashboardCardStatuses.sharedWithMe")}
                      </Button>
                      <Button className={`SignButton ${viewMode === "shareWithOthers" ? "active" : ""}`} onClick={handleShareWithOthers}>
                        {t("dashboardCardStatuses.sharedWithOthers")}
                      </Button>
                    </div>

                    <div className='search-filters-container'>
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
                  </div>

                  {/* Table */}
                  {viewMode === "shareWithMe" && (
                    <>
                      <TableContainer
                        component={Paper}
                        className='custom-table-scrollbar'
                        style={{
                          maxWidth: "100%",
                          overflowX: "auto",
                          height: "66vh",
                        }}
                      >
                        <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                          <TableHead>
                            <TableRow>
                              {shareWithMeColumns.map((shareWithMeColumns) => (
                                <TableCell key={shareWithMeColumns.label} style={{ backgroundColor: "#E7F7FE" }} className='TableHeaderCell'>
                                  {shareWithMeColumns.label}
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
                                <TableCell className='TableCell'>{row.docCompanyPrefixNo}</TableCell>
                                <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                                <TableCell className='TableCell'>{row.email}</TableCell>
                                <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
                                <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                                  {row.createdByName}
                                </TableCell>

                                {userAccess.remainingDays <= 0 ? (
                                  <>
                                    <TableCell className='TableCell py-0'>
                                      <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} />
                                      </Dropdown>
                                    </TableCell>
                                  </>
                                ) : (
                                  <>
                                    <TableCell className='TableCell py-0'>
                                      <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} />

                                        <Dropdown.Menu>
                                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row, row.signedDocKey, row.registerSignID)}>
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
                                              {t("dashboardCardStatuses.viewAuditTrail")}
                                            </Dropdown.Item>
                                          )}
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
                          <div className='showHideNoDocs'>
                            {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.documentsof")} {data.length} {t("tablesLabel.document")}
                          </div>
                        </div>
                        <Stack spacing={2}>
                          <Pagination
                            count={Math.ceil(data.length / rowsPerPage)}
                            variant='outlined'
                            shape='rounded'
                            page={page + 1}
                            onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                          />
                        </Stack>
                      </div>
                    </>
                  )}

                  {viewMode === "shareWithOthers" && (
                    <>
                      <TableContainer
                        component={Paper}
                        className='custom-table-scrollbar'
                        style={{
                          maxWidth: "100%",
                          overflowX: "auto",
                          height: "66vh",
                        }}
                      >
                        <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                          {/* Table Headers */}
                          <TableHead>
                            <TableRow>
                              {shareWithOthersColumns.map((shareWithOthersColumns) => (
                                <TableCell key={shareWithOthersColumns.label} style={{ backgroundColor: "#E7F7FE" }} className='TableHeaderCell'>
                                  {shareWithOthersColumns.label}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>

                          {/* Table Body */}
                          <TableBody>
                            {shareOtherResults.length === 0 && (
                              <TableRow>
                                <td colSpan='6' className='p-5 text-center' style={{ color: "var(--secondary-color) !important" }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Icons.BulkDocuments size={50} color='#F0F3F4' />
                                    {t("dashboardCardStatuses.notDocsFound")}
                                  </div>
                                </td>
                              </TableRow>
                            )}

                            {shareOtherResults.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                                  {row.docName}
                                </TableCell>
                                <TableCell className='TableCell'>{row.docCompanyPrefixNo}</TableCell>
                                <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                                <TableCell className='TableCell'>{row.email}</TableCell>
                                <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
                                <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                                  {row.createdByName}
                                </TableCell>

                                {userAccess.remainingDays <= 0 ? (
                                  <>
                                    <TableCell className='TableCell py-0'>
                                      <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} />
                                      </Dropdown>
                                    </TableCell>
                                  </>
                                ) : (
                                  <>
                                    <TableCell className='TableCell py-0'>
                                      <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} />

                                        <Dropdown.Menu>
                                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row, row.signedDocKey, row.registerSignID)}>
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
                                              {t("dashboardCardStatuses.viewAuditTrail")}
                                            </Dropdown.Item>
                                          )}
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
                        {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, otherData.length)} {t("tablesLabel.documentsof")}
                        {otherData.length} {t("tablesLabel.document")}
                        <Stack spacing={2}>
                          <Pagination
                            count={Math.ceil(otherData.length / rowsPerPage)}
                            variant='outlined'
                            shape='rounded'
                            page={page + 1}
                            onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                          />
                        </Stack>
                      </div>
                    </>
                  )}
                </div>
              </Grid>
            </>
          ) : (
            <></>
          )}
        </>
      )}

      <ViewModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setPdfUrl("");
        }}
        pdfUrl={pdfUrl}
      />

      <ShareDownloadModal
        show={showDownloadModal}
        signedDocKey={signedDocKey}
        registerSignID={registerSignID}
        dataRow={dataRow}
        handleClose={() => {
          setShowDownloadModal(false);
        }}
      />

      <AuditTrailModal
        show={showATModal}
        auditTrailURL={auditTrailURL}
        handleClose={() => {
          setShowATModal(false);
          setAuditTrailURL("");
        }}
      />
    </Grid>
  );
};

export default ShareDocs;
