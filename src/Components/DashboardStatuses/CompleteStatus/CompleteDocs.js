import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PATHS from "@/routes/paths";
import { Dropdown as Dropdown } from "@/Components/UI/shadcnCompat";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import { useForm } from "react-hook-form";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import DocumentSearchFilters from "@/Components/CommonModals/SearchFilters/DocSearchFilter";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import documentService from "@/services/documentService";
import AddDocuments from "@/Components/Folder/AddDocuments";
import DashboardComments from "@/Components/CommonModals/DocumentsComments/DashboardComments";
import { Icons } from "@/assets/Icons";
import dashboardService from "@/services/dashboardService";
import DocumentStatusTable, { StatusBadge, formatTableDate } from "@/Components/DashboardStatuses/DocumentStatusTable";
import { useUser } from "@/Context/UserContext";

const CompleteDocs = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDashboardCardView = pathname === PATHS.COMPLETED;
  const { userAccess } = useUser("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [signedDocKey, setSignedDocKey] = useState("");
  const [dataRow, setDataRow] = useState();
  const [masterDocID, setMasterDocID] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const { reset } = useForm();
  const [registerSignID, setRegisterSignID] = useState();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docName, setDocName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [selectedMasterDocId, setSelectedMasterDocId] = useState(null);

  const handleAddDocumentClick = (masterDocID) => {
    setSelectedMasterDocId(masterDocID);
    setShowAddDocument(true);
  };
  const handleAddDocumentClose = () => {
    setShowAddDocument(false);
  };

  const [shareFormData, setShareFormData] = useState({
    Email: "",
    Subject: "",
    Body: "",
    MasterDocID: "",
    RegisterSignID: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle opening the share modal
  const handleShareModalShow = async (row) => {
    const { masterDocID, registerSignID } = row;
    setRegisterSignID(registerSignID);
    setMasterDocID(masterDocID);
    try {
      const shareData = {
        ...shareFormData,
        MasterDocID: masterDocID,
        RegisterSignID: registerSignID,
        IsDocShared: true,
        IsAuditTrailDocShared: false,
        IsSupportingDocShared: true,
      };
      setShareFormData(shareData);
      setShowShareModal(true);
    } catch (error) {
      console.log(error);
      toast.error(t("dashboardCardStatuses.shareFiletoastErr"));
    }
  };

  // Function to handle submitting share data
  const handleShareDocument = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.shareDocument(shareFormData);
      if (response.data.statusCode === "1") {
        toast.success(t("dashboardCardStatuses.shareFileSucessToast"));
      } else if (response.data.statusCode === "3") {
        toast.info(t("dashboardCardStatuses.shareFileInfo"));
      }
      setShowShareModal(false);
      setIsLoading(false);
      reset();
    } catch (error) {
      console.log("=======>", error);
      if (error.response && error.response.statusCode === "4") {
        toast.error(t("dashboardCardStatuses.unathorizedErrSharedFile"));
      } else {
        toast.error(t("dashboardCardStatuses.shareFileToastErr"));
      }
      setIsLoading(false);
    }
  };

  // Completed api
  const fetchCompletedData = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getCompletedMasterDocList();
      if (response.data.successStatus) {
        setData(response.data.response);
        setSearchResults(response.data.response || []);
        if (response.data.response && response.data.response.length > 0) {
          const firstItem = response.data.response[0];
          setSignedDocKey(firstItem.signedDocKey);
        }
        setIsLoading(false);
      } else {
        console.error("API Error:", response.data.message);
      }
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCompletedData();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (startDate || endDate || referenceNo || docNumber || docName) {
        response = await dashboardService.getCompletedMasterDocList({
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
    fetchCompletedData();
  };

  //handle download and View
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
    { label: t("tablesLabel.date"), key: "completedDate", width: "16%" },
    { label: t("tablesLabel.docName"), key: "docName", width: "24%" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo", width: "16%" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber", width: "16%" },
    { label: t("tablesLabel.status"), key: "docStatus", width: "10%" },
    { label: t("tablesLabel.createdby"), key: "createdByName", width: "12%" },
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
          title={t("dashboardCardStatuses.completedStatus")}
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
              <TableCell className='TableCell text-[var(--modern-muted)]' style={{ width: "16%" }}>
                {row.completedDate ? formatTableDate(row.completedDateFormatted || row.completedDate) : "—"}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell font-medium text-[var(--modern-text)]' title={row.docName} style={{ width: "24%" }}>
                {row.docName}
              </TableCell>
              <TableCell className='TableCell' style={{ width: "16%" }}>
                {row.docCompanyPrefixNo || "—"}
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell truncate-ref-cell' title={row.referenceNumber} style={{ width: "16%" }}>
                {row.referenceNumber || "—"}
              </TableCell>
              <TableCell className='TableCell' style={{ width: "10%" }}>
                <StatusBadge status={row.docStatus || "Completed"} />
              </TableCell>
              <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell' style={{ width: "12%" }}>
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
                      {userAccess.folders === true && (
                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocumentClick(row.masterDocID)}>
                          <Icons.Folders size={20} />
                          {t("dashboardCardStatuses.addtoFolder")}
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

      <AddDocuments show={showAddDocument} handleClose={handleAddDocumentClose} MasterDocID={selectedMasterDocId} />
    </Grid>
  );
};
export default CompleteDocs;
