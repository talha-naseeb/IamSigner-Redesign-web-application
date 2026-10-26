import React, { useEffect, useState } from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Dropdown, Button, Modal } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import ChangeOrderModal from "./ChangeSignOrder/ChangeSignOrderModal";
import UploadSupportingDocs from "./UploadSupportingDocs";
import TransferOwnershipModal from "./TransferOwner/TransferOwnershipModal";
import ResendNotificationModal from "./ResendNotificationModal";
import RecallConfirmationModal from "./RecallConfirmationModal/RecallConfirmationModal";
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

const PendingDocs = () => {
  const { t } = useTranslation();
  const { user, userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [otherData, setotherData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [signedDocKey, setSignedDocKey] = useState();
  const [dataRow, setDataRow] = useState();
  const [registerSignID, setRegisterSignID] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const { reset } = useForm();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [masterDocID, setMasterDocID] = useState("");
  const [showRecallConfirmationModal, setShowRecallConfirmationModal] = useState(false);
  const [selectedRowForRecall, setSelectedRowForRecall] = useState(null);
  const [showResendConfirmationModal, setShowResendConfirmationModal] = useState(false);
  const [selectedRowForResend, setSelectedRowForResend] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingWithOtherRes, setPendingWithOtherRes] = useState([]);
  const [showATModal, setShowATModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showChangeOrderModal, setShowChangeOrderModal] = useState(false);
  const [showNoSignatoryModal, setShowNoSignatoryModal] = useState(false);
  const [showSupportingCanvas, setShowSupportingCanvas] = useState(false);
  const [viewMode, setViewMode] = useState("pendingWithMe");
  const [showSignCompleted, setShowSignCompleted] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handlePendingwithme = () => {
    setViewMode("pendingWithMe");
  };

  const handlePendingWithOthers = () => {
    setViewMode("pendingWithOthers");
  };

  const [shareFormData, setShareFormData] = useState({
    Email: "",
    Subject: "",
    Body: "",
    MasterDocID: "",
    RegisterSignID: "",
  });

  // Function to handle opening the share modal
  const handleShareModalShow = async (row) => {
    const { masterDocID, registerSignID } = row;
    setMasterDocID(masterDocID);
    setRegisterSignID(registerSignID);
    try {
      const shareData = { ...shareFormData, MasterDocID: masterDocID, RegisterSignID: registerSignID };
      setShareFormData(shareData);
      setShowShareModal(true);
    } catch (error) {
      console.log(t("dashboardCardStatuses.navbar.shareFiletoastErr"), error);
      toast.error(t("dashboardCardStatuses.shareFiletoastErr"));
    }
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

  // Function to handle submitting share data
  const handleShareDocument = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.shareDocument(shareFormData);
      // console.log(response);
      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.shareFileSucessToast"));
      } else if (response.data.statusCode === "3") {
        toast.info(t("dashboardCardStatuses.shareFileInfo"));
      }
      setShowShareModal(false);
      setIsLoading(false);
      reset();
    } catch (error) {
      console.log("error", error);
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
      if (config?.skipSessionExpiryRedirect && isAuthError(error)) {
        setShowSignCompleted(true);
      }
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  const fetchData = async (config) => {
    try {
      //pendingwithOthers
      setIsLoading(true);
      const response = await dashboardService.getPendingMasterDocList(undefined, config);
      if (response.data.successStatus) {
        setotherData(response.data.response);
        setPendingWithOtherRes(response.data.response || []);

        if (response.data.response && response.data.response.length > 0) {
          const firstItem = response.data.response[0];
          setSignedDocKey(firstItem.signedDocKey);
        }
        setIsLoading(false);
      }
    } catch (error) {
      if (config?.skipSessionExpiryRedirect && isAuthError(error)) {
        setShowSignCompleted(true);
      }
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const isAuthError = (error) => error?.response?.status === 401 || String(error?.response?.data?.statusCode) === API_STATUS.EXPIRED;

  useEffect(() => {
    fetchPendingData();
    fetchData();
  }, []);

  // Signed in another tab (the signing link opened via Sign Now): refresh both
  // lists, or show the completed screen when this tab's session is gone.
  useEffect(() => {
    const unsubscribe = onDocumentSigned(() => {
      if (!tokenManager.hasToken()) {
        setShowSignCompleted(true);
        return;
      }
      const config = { skipSessionExpiryRedirect: true, suppressGlobalErrorToast: true };
      fetchPendingData(config);
      fetchData(config);
    });
    return unsubscribe;
  }, []);

  //Search Filter for pendind with me / pendind with others
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        if (viewMode === "pendingWithMe") {
          response = await dashboardService.getPendingSignatoriesList({
            StartDate: startDate,
            EndDate: endDate,
            ReferenceNo: referenceNo,
            DocNumber: docNumber,
            DocName: docName,
          });
        } else if (viewMode === "pendingWithOthers") {
          response = await dashboardService.getPendingMasterDocList({
            StartDate: startDate,
            EndDate: endDate,
            ReferenceNo: referenceNo,
            DocNumber: docNumber,
            DocName: docName,
          });
        }
      }
      if (viewMode === "pendingWithMe") {
        setSearchResults(response.data.response || []);
      } else if (viewMode === "pendingWithOthers") {
        setPendingWithOtherRes(response.data.response || []);
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
    fetchPendingData();
    fetchData();
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

  const pendingWithMeColumns = [
    { label: t("tablesLabel.docName"), key: "docName", width: "24%" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo", width: "14%" },
    { label: t("tablesLabel.date"), key: "pendingWithDate", width: "16%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "14%" },
    { label: t("tablesLabel.signingLink"), key: "signingLink", width: "14%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "12%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];
  const pendingWithOtherColumns = [
    { label: t("tablesLabel.docName"), key: "docName", width: "22%" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo", width: "14%" },
    { label: t("tablesLabel.date"), key: "createdOn", width: "16%" },
    { label: t("tablesLabel.pendingWith"), key: "pendingWithName", width: "14%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "14%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "14%" },
    { label: "", key: "actions", width: "6%", align: "right" },
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

  const handleRecallConfirmationModal = (row) => {
    setSelectedRowForRecall(row);
    setShowRecallConfirmationModal(true);
  };

  const handleResendConfirmationModal = (row) => {
    setSelectedRowForResend(row);
    setShowResendConfirmationModal(true);
  };

  //Resend Email
  const handleResendDocument = async () => {
    setIsLoading(true);
    try {
      const { signedDocKey } = selectedRowForResend;
      const response = await dashboardService.reminderEmail({
        SignAuth: signedDocKey,
      });
      if (response.data.statusCode === "1") {
        toast.success("Reminder email successfully sent");
      } else {
        toast.error("Email didn't send. Try Again!");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("dashboardCardStatuses.fileNotDisplay"));
    } finally {
      setIsLoading(false);
      setShowResendConfirmationModal(false);
      setSelectedRowForResend(null);
    }
  };
  const handleRecallSuccess = () => {
    fetchData(); // Refresh the data after successful recall
    setSelectedRowForRecall(null);
  };

  //Transfer Document
  const handleTransferOwnerShip = (row) => {
    setMasterDocID(row.masterDocID);
    setDocName(row.docName);
    setShowTransferModal(true);
  };

  const handleOpenChangeOrderModal = async (row) => {
    try {
      setIsLoading(true);

      const response = await dashboardService.getNotStartedSignatories(row.registerSignID);

      if (response.data.successStatus && response.data.response.signatories.length > 0) {
        setRegisterSignID(row.registerSignID);
        setShowChangeOrderModal(true);
      } else {
        setShowNoSignatoryModal(true);
      }
    } catch (error) {
      console.error("Error fetching signatories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowSupportingOffcanvas = (row) => {
    setMasterDocID(row.masterDocID);
    setRegisterSignID(row.registerSignID);
    setShowSupportingCanvas(true);
  };

  const handleCloseSupportingOffcanvas = () => setShowSupportingCanvas(false);

  if (showSignCompleted) {
    return <SignCompletedScreen />;
  }

  return (
    <>
      <Grid className='container' style={{ marginTop: "12px" }}>
      <Grid item xs={12}>
        <DocumentStatusTable
          title={t("dashboardCardStatuses.pendingDocs")}
          count={viewMode === "pendingWithMe" ? searchResults.length : pendingWithOtherRes.length}
          extraHeaderLeft={
            <div className='flex gap-2'>
              <Button className={`SignButton ${viewMode === "pendingWithMe" ? "active" : ""}`} onClick={handlePendingwithme}>
                {t("menuButtons.pendingWithMe")}
              </Button>
              <Button className={`SignButton ${viewMode === "pendingWithOthers" ? "active" : ""}`} onClick={handlePendingWithOthers}>
                {t("menuButtons.pendingWithOthers")}
              </Button>
            </div>
          }
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
          columns={viewMode === "pendingWithMe" ? pendingWithMeColumns : pendingWithOtherColumns}
          data={
            viewMode === "pendingWithMe"
              ? searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : pendingWithOtherRes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          }
          totalItems={viewMode === "pendingWithMe" ? searchResults.length : pendingWithOtherRes.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          tableContainerStyle={{ maxHeight: "calc(100vh - 280px)" }}
          renderRow={(row, index) =>
            viewMode === "pendingWithMe" ? (
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
            ) : (
              <TableRow key={row.masterDocID || index} hover>
                <TableCell className='TableCell truncate-cell font-medium text-[var(--modern-text)]' title={row.docName} onClick={(e) => handleCellClick(e)} style={{ width: "22%" }}>
                  {row.docName}
                </TableCell>
                <TableCell className='TableCell' style={{ width: "14%" }}>
                  {row.docCompanyPrefixNo || "—"}
                </TableCell>
                <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "16%" }}>
                  {row.createdOnFormatted ? formatTableDate(row.createdOnFormatted) : "—"}
                </TableCell>
                <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "14%" }}>
                  <UserInitialsBadge name={row.pendingWithName} />
                </TableCell>
                <TableCell className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} onClick={(e) => handleCellClick(e)} style={{ width: "14%" }}>
                  {row.referenceNumber || "—"}
                </TableCell>
                <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "14%" }}>
                  <UserInitialsBadge name={row.createdByName} />
                </TableCell>
                <TableCell className='TableCell py-0 text-right' style={{ width: "6%" }}>
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
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handelView(row)}>
                          <Icons.View size={20} />
                          {t("dashboardCardStatuses.view")}
                        </Dropdown.Item>
                        <Dropdown.Item
                          className='d-flex gap-2 align-items-center'
                          onClick={() => {
                            handleShowSupportingOffcanvas(row);
                          }}
                        >
                          <Icons.Upload size={20} />
                          {t("dashboardCardStatuses.AddSupportingDocs")}
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
                        {userAccess.resendNotification === true && (
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleResendConfirmationModal(row)}>
                            <Icons.Resend size={20} />
                            {t("dashboardCardStatuses.resendNotification")}
                          </Dropdown.Item>
                        )}
                        {userAccess.recalled === true && (
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleRecallConfirmationModal(row)}>
                            <Icons.RecallAction size={20} />
                            {t("dashboardCardStatuses.Recall")}
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item>
                          <DashboardComments registerSignID={row.registerSignID} />
                        </Dropdown.Item>
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleTransferOwnerShip(row)}>
                          <Icons.TransferOwner size={22} />
                          {t("dashboardCardStatuses.TransferOwnerShip")}
                        </Dropdown.Item>
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleOpenChangeOrderModal(row)}>
                          <Icons.UpdateSignOrder size={20} />
                          {t("uploadDocFlow.UpdateSignOrder")}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </TableCell>
              </TableRow>
            )
          }
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

        <RecallConfirmationModal show={showRecallConfirmationModal} onHide={() => setShowRecallConfirmationModal(false)} selectedRow={selectedRowForRecall} onSuccess={handleRecallSuccess} />

        <ResendNotificationModal
          show={showResendConfirmationModal}
          handleClose={() => setShowResendConfirmationModal(false)}
          onConfirm={handleResendDocument}
          docName={selectedRowForResend?.docName}
          isLoading={isLoading}
        />

        <TransferOwnershipModal show={showTransferModal} handleClose={() => setShowTransferModal(false)} masterDocID={masterDocID} docName={docName} />
        <ChangeOrderModal show={showChangeOrderModal} handleClose={() => setShowChangeOrderModal(false)} registerSignID={registerSignID} signedDocKey={signedDocKey} />
        <Modal show={showNoSignatoryModal} centered onHide={() => setShowNoSignatoryModal(false)} dialogClassName='custom-modal-width'>
          <Modal.Body style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", height: "250px" }}>
            <p>{t("dashboardCardStatuses.notSignatoryLeft")}</p>
            <Icons.NotStarted size={100} />
          </Modal.Body>
        </Modal>
      </Grid>

      <UploadSupportingDocs show={showSupportingCanvas} onClose={handleCloseSupportingOffcanvas} masterDocID={masterDocID} registerSignID={registerSignID} />
    </>
  );
};

export default PendingDocs;
