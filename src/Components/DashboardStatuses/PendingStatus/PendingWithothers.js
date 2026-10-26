import React, { useEffect, useState } from "react";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Dropdown, Modal } from "@/Components/UI/shadcnCompat";
import { useUser } from "@/Context/UserContext";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import RecallConfirmationModal from "./RecallConfirmationModal/RecallConfirmationModal";
import ChangeOrderModal from "./ChangeSignOrder/ChangeSignOrderModal";
import UploadSupportingDocs from "./UploadSupportingDocs";
import TransferOwnershipModal from "./TransferOwner/TransferOwnershipModal";
import ResendNotificationModal from "./ResendNotificationModal";
import DashboardComments from "@/Components/CommonModals/DocumentsComments/DashboardComments";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import documentService from "@/services/documentService";
import DocumentStatusTable, { formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";

const PendingWithOthers = () => {
  const { t } = useTranslation();
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [signedDocKey, setSignedDocKey] = useState("");
  const { reset } = useForm();
  const [masterDocID, setMasterDocID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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

  const [page, setPage] = useState(0);
  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [registerSignID, setRegisterSignID] = useState();
  const [dataRow, setDataRow] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [showRecallConfirmationModal, setShowRecallConfirmationModal] = useState(false);
  const [selectedRowForRecall, setSelectedRowForRecall] = useState(null);
  const [showResendConfirmationModal, setShowResendConfirmationModal] = useState(false);
  const [selectedRowForResend, setSelectedRowForResend] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showChangeOrderModal, setShowChangeOrderModal] = useState(false);
  const [showNoSignatoryModal, setShowNoSignatoryModal] = useState(false);
  const [showSupportingCanvas, setShowSupportingCanvas] = useState(false);

  const handleRecallConfirmationModal = (row) => {
    setSelectedRowForRecall(row);
    setShowRecallConfirmationModal(true);
  };

  const handleResendConfirmationModal = (row) => {
    setSelectedRowForResend(row);
    setShowResendConfirmationModal(true);
  };

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

  // Function to handle submitting share data
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getPendingMasterDocList();
      if (response.data.successStatus) {
        setData(response.data.response);
        setSearchResults(response.data.response || []);

        if (response.data.response && response.data.response.length > 0) {
          const dockey = response.data.response[0];
          setSignedDocKey(dockey.signedDocKey);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userAccess]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await dashboardService.getPendingMasterDocList({
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
    fetchData();
  };

  // //handle download
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

  //Resend Email
  const handleResendDocument = async () => {
    setIsLoading(true);
    try {
      const { signedDocKey } = selectedRowForResend;
      const response = await dashboardService.reminderEmail({
        SignAuth: signedDocKey,
      });
      if (response.data.statusCode === "1") {
        toast.success(t("uploadDocFlow.reminderSend"));
      } else {
        toast.error("uploadDocFlow.reminderSendError");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("uploadDocFlow.reminderSendError"));
    } finally {
      setIsLoading(false);
      setShowResendConfirmationModal(false);
      reset();
    }
  };

  const handleViewAuditTrail = (signedDocKey) => {
    const newPdfUrl = `/AuditTrail/id/${signedDocKey}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
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

  const columns = [
    { label: t("tablesLabel.docName"), key: "docName", width: "22%" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo", width: "14%" },
    { label: t("tablesLabel.date"), key: "createdOn", width: "16%" },
    { label: t("tablesLabel.pendingWith"), key: "pendingWithName", width: "14%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "14%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "14%" },
    { label: "", key: "actions", width: "6%", align: "right" },
  ];

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
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

  return (
    <>
      <Grid className='container'>
        <Grid item xs={12}>

          <DocumentStatusTable
            title={t("menuButtons.pendingWithOthers")}
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

        <RecallConfirmationModal show={showRecallConfirmationModal} onHide={() => setShowRecallConfirmationModal(false)} selectedRow={selectedRowForRecall} onSuccess={handleRecallSuccess} />

        <ResendNotificationModal
          show={showResendConfirmationModal}
          handleClose={() => setShowResendConfirmationModal(false)}
          onConfirm={handleResendDocument}
          docName={selectedRowForResend?.docName}
          isLoading={isLoading}
        />

        {/* transfer ownership */}
        <TransferOwnershipModal show={showTransferModal} handleClose={() => setShowTransferModal(false)} masterDocID={masterDocID} docName={docName} />

        <ChangeOrderModal show={showChangeOrderModal} handleClose={() => setShowChangeOrderModal(false)} registerSignID={registerSignID} signedDocKey={signedDocKey} />

        {/* show signatory */}
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
export default PendingWithOthers;
