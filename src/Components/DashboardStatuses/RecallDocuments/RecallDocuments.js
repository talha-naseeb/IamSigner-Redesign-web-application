import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PATHS from "@/routes/paths";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
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
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";
import DocumentStatusTable, { formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";

const RecallDocs = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDashboardCardView = pathname === PATHS.RECALLED;
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
    { label: t("tablesLabel.docName"), key: "docName", width: "28%" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo", width: "18%" },
    { label: t("tablesLabel.date"), key: "recalledDate", width: "18%" },
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
          title={t("menuButtons.recall")}
          count={searchResults.length}
          searchFilter={
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
          }
          columns={columns}
          data={searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          totalItems={searchResults.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          tableContainerStyle={{ maxHeight: isDashboardCardView ? "38vh" : "calc(100vh - 280px)" }}
          renderRow={(row, index) => (
            <TableRow key={row.masterDocID || index} hover>
              <TableCell className='TableCell truncate-cell font-medium text-[var(--modern-text)]' title={row.docName} onClick={(e) => handleCellClick(e)} style={{ width: "28%" }}>
                {row.docName}
              </TableCell>
              <TableCell className='TableCell' style={{ width: "18%" }}>
                {row.docCompanyPrefixNo || "—"}
              </TableCell>
              <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "18%" }}>
                {row.recalledDate ? formatTableDate(row.recalledDateFormatted || row.recalledDate) : "—"}
              </TableCell>
              <TableCell className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} onClick={(e) => handleCellClick(e)} style={{ width: "16%" }}>
                {row.referenceNumber || "—"}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "14%" }}>
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
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                        <Icons.Download size={20} />
                        {t("dashboardCardStatuses.download")}
                      </Dropdown.Item>

                      {userAccess.docShare === true && (
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareModalShow(row)}>
                          <Icons.Share size={20} />
                          {t("dashboardCardStatuses.share")}
                        </Dropdown.Item>
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
                )}
              </TableCell>
            </TableRow>
          )}
        />
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
