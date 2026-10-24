import React, { useEffect, useState } from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Dropdown } from "@/Components/UI/shadcnCompat";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { useUser } from "@/Context/UserContext";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";

const RecallDocs = () => {
  const { t } = useTranslation();
  const { userAccess } = useUser("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const { reset } = useForm();
  const [masterDocID, setMasterDocID] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [shareFormData, setShareFormData] = useState({
    Email: "",
    Subject: "",
    Body: "",
    MasterDocID: "",
    RegisterSignID: "",
  });

  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [registerSignID, setRegisterSignID] = useState();
  const [dataRow, setDataRow] = useState();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle opening the share modal
  const handleShareModalShow = async (row) => {
    const { masterDocID, registerSignID } = row;
    setMasterDocID(masterDocID);
    setRegisterSignID(registerSignID);
    try {
      const shareData = {
        ...shareFormData,
        MasterDocID: masterDocID,
        RegisterSignID: registerSignID,
      };
      setShareFormData(shareData);
      setShowShareModal(true);
    } catch (error) {
      toast.error(t("dashboardCardStatuses.errsharingData"));
    }
  };

  const handleShareDocument = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.shareDocument(shareFormData);
      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.docShareSuccess"));
      } else if (response.data.statusCode === "3") {
        toast.info(t("dashboardCardStatuses.faildShareDoc"));
      }
      setShowShareModal(false);
      setIsLoading(false);
      reset();
    } catch (error) {
      if (error.response && error.response.statusCode === "4") {
        toast.error(t("dashboardCardStatuses.unAuthPleaseLogin"));
      } else {
        toast.error(t("dashboardCardStatuses.errSharingDoc"));
      }
      setIsLoading(false);
    }
  };

  const handleFileDownload = async (row) => {
    setDataRow(row);
    setShowDownloadModal(true);
  };

  const handelView = async (row) => {
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
  //Alldocs api  api
  const fetchAllDocs = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getRecalledDocuments();
      if (response.data.successStatus) {
        setData(response.data.response || []);
        setSearchResults(response.data.response || []);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocs();
  }, [userAccess]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await dashboardService.getRecalledDocuments({
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
    fetchAllDocs();
  };

  const handleViewAuditTrail = (signedDocKey) => {
    const newPdfUrl = `/AuditTrail/id/${signedDocKey}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo" },
    { label: t("tablesLabel.date"), key: "recalledDate" },
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
    <Grid className='container mt-3'>
      <Grid>
        {/* Loader overlay */}
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}

        <div className='py-3 p-3 container pendingtable '>
          <div className="document-status-toolbar">
            <h4>{t("menuButtons.recall")}</h4>

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

                    <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                      {row.docName}
                    </TableCell>
                    <TableCell className='TableCell'>{row.docCompanyPrefixNo}</TableCell>
                    <TableCell className='TableCell'>{row.recalledDate ? formatDate(row.recalledDate) : ""}</TableCell>
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
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                                <Icons.Download size={20} />
                                {t("dashboardCardStatuses.download")}
                              </Dropdown.Item>

                              {userAccess.docShare === true ? (
                                <>
                                  <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareModalShow(row)}>
                                    <Icons.Share size={20} />
                                    {t("dashboardCardStatuses.share")}
                                  </Dropdown.Item>
                                </>
                              ) : (
                                <></>
                              )}

                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handelView(row)}>
                                <Icons.View size={20} />
                                {t("dashboardCardStatuses.view")}
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <SignOrder masterDocID={row.masterDocID} />
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewAuditTrail(row.signedDocKey)}>
                                <Icons.AuditTrail size={20} />
                                {t("dashboardCardStatuses.viewAuditTrail")}
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

      <ShareModal
        show={showShareModal}
        handleClose={() => setShowShareModal(false)}
        formData={shareFormData}
        handleShare={handleShareDocument}
        handleChange={(e) => setShareFormData({ ...shareFormData, [e.target.name]: e.target.value })}
        masterDocID={masterDocID}
        registerSignID={registerSignID}
      />

      <ViewModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setPdfUrl("");
        }}
        pdfUrl={pdfUrl}
      />

      <DownloadModal
        show={showDownloadModal}
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

export default RecallDocs;
