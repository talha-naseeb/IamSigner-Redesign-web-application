import React, { useEffect, useState } from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Dropdown, Button } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import DashboardComments from "@/Components/CommonModals/DocumentsComments/DashboardComments";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";
import { onDocumentSigned } from "@/Helpers/documentSignChannel";
import { normalizeSigningLink } from "@/Helpers/signingLink";
import SignCompletedScreen from "@/Components/SignCompletedScreen/SignCompletedScreen";
import { API_STATUS } from "@/Constants/apiStatuses";
import { tokenManager } from "@/services/tokenManager";
import DocumentStatusTable, { formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";

const Pendingwithme = () => {
  const { t } = useTranslation();
  const { user, userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [signedDocKey, setSignedDocKey] = useState();
  const [registerSignID, setRegisterSignID] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const { reset } = useForm();
  const [page, setPage] = useState(0);
  const [dataRow, setDataRow] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [masterDocID, setMasterDocID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showATModal, setShowATModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [showSignCompleted, setShowSignCompleted] = useState(false);

  const [shareFormData, setShareFormData] = useState({
    Email: "",
    Subject: "",
    Body: "",
    MasterDocID: "",
    RegisterSignID: "",
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleShareModalShow = async (row) => {
    const { masterDocID, registerSignID } = row;
    setMasterDocID(masterDocID);
    setRegisterSignID(registerSignID);
    try {
      const shareData = { ...shareFormData, MasterDocID: masterDocID, RegisterSignID: registerSignID };
      setShareFormData(shareData);
      setShowShareModal(true);
    } catch (error) {
      toast.error(t("dashboardCardStatuses.shareFiletoastErr"));
    }
  };

  // Function to handle submitting share data
  const handleShareDocument = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.shareDocument(shareFormData);
      //console.log(response);
      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.shareFileSucessToast"));
      } else if (response.data.statusCode === "3") {
        toast.info(t("dashboardCardStatuses.shareFileInfo"));
      }
      setShowShareModal(false);
      setIsLoading(false);
      reset();
    } catch (error) {
      if (error.response && error.response.status === "4") {
        toast.error(t("dashboardCardStatuses.unathorizedErrSharedFile"));
      } else {
        toast.error(t("dashboardCardStatuses.shareFileToastErr"));
      }
      setIsLoading(false);
    }
  };

  //pending with me api
  const fetchPendingData = async (config) => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getPendingSignatoriesList(undefined, config);
      if (response.data.successStatus) {
        setData(response.data.response || []);
        setSearchResults(response.data.response || []);
        if (response.data.response && response.data.response.length > 0) {
          const firstItem = response.data.response[0];
          setSignedDocKey(firstItem.signedDocKey);
        }
        setIsLoading(false);
      }
    } catch (error) {
      const isAuthError = error?.response?.status === 401 || String(error?.response?.data?.statusCode) === API_STATUS.EXPIRED;
      if (config?.skipSessionExpiryRedirect && isAuthError) {
        setShowSignCompleted(true);
      }
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, [userAccess.remainingDays]);

  // Signed in another tab (e.g. the signing link opened via "Sign" button):
  // refresh this tab's list, or show the completed screen when the session is gone.
  useEffect(() => {
    const unsubscribe = onDocumentSigned(() => {
      if (!tokenManager.hasToken()) {
        setShowSignCompleted(true);
        return;
      }
      fetchPendingData({ skipSessionExpiryRedirect: true, suppressGlobalErrorToast: true });
    });
    return unsubscribe;
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await dashboardService.getPendingSignatoriesList({
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
    fetchPendingData();
  };

  //handle open link
  const openSigningLink = (signingLink) => {
    window.open(normalizeSigningLink(signingLink), "_blank");
  };

  //handle downlaod

  const handleFileDownload = async (row) => {
    setDataRow(row);
    setShowDownloadModal(true);
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

  const handleViewAuditTrail = (signedDocKey) => {
    const newPdfUrl = `/AuditTrail/id/${signedDocKey}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
  };

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName", width: "24%" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo", width: "14%" },
    { label: t("tablesLabel.date"), key: "pendingWithDate", width: "16%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "14%" },
    { label: t("tablesLabel.signingLink"), key: "signingLink", width: "14%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "12%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
  };

  if (showSignCompleted) {
    return <SignCompletedScreen />;
  }

  return (
    <Grid className='container'>
      <Grid item xs={12}>
        <DocumentStatusTable
          title={t("menuButtons.pendingWithMe")}
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
          tableContainerStyle={{ maxHeight: "calc(100vh - 280px)" }}
          renderRow={(row, index) => (
            <TableRow key={row.masterDocID || index} hover>
              <TableCell className='TableCell truncate-cell font-medium text-[var(--modern-text)]' title={row.docName} onClick={(e) => handleCellClick(e)} style={{ width: "24%" }}>
                {row.docName}
              </TableCell>
              <TableCell className='TableCell' style={{ width: "14%" }}>
                {row.docCompanyPrefixNo || "—"}
              </TableCell>
              <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "16%" }}>
                {row.pendingWithDate ? formatTableDate(row.pendingWithDateFormatted || row.pendingWithDate) : "—"}
              </TableCell>
              <TableCell className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} onClick={(e) => handleCellClick(e)} style={{ width: "14%" }}>
                {row.referenceNumber || "—"}
              </TableCell>
              <TableCell className='TableCell' style={{ width: "14%" }}>
                <Button className='SignNowbtn text-align-center' variant='text' onClick={() => openSigningLink(row.signingLink)}>
                  {t("dashboardCardStatuses.OpenToSign")}
                </Button>
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "12%" }}>
                <UserInitialsBadge name={row.createdByName} />
              </TableCell>
              <TableCell className='py-0 text-right' style={{ width: "6%" }}>
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
                      {!(user.AccountType === "B" && user.RoleID === 3) && userAccess.docShare === true && (
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareModalShow(row)}>
                          <Icons.Share size={20} />
                          {t("dashboardCardStatuses.share")}
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row)}>
                        <Icons.View size={20} />
                        {t("dashboardCardStatuses.view")}
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <SignOrder masterDocID={row.masterDocID} />
                      </Dropdown.Item>
                      {userAccess.auditTrail === true && (
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewAuditTrail(row.signedDocKey)}>
                          <Icons.AuditTrail size={20} />
                          {t("dashboardCardStatuses.viewAuditTrail")}
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item>
                        <DashboardComments registerSignID={row.registerSignID} />
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </TableCell>
            </TableRow>
          )}
        />
      </Grid>

      {/* Share and View modals */}
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

export default Pendingwithme;
