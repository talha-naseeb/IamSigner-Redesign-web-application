import React, { useEffect, useState } from "react";
import userService from "@/services/userService";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import Dropdown from "react-bootstrap/Dropdown";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Pagination } from "@mui/material";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import { Icons } from "@/assets/Icons";
import { useParams, useNavigate } from "react-router-dom";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import "../style.css";
import Loader from "@/Components/CommonModals/Loader/Loader";
import AddDocToSubFolder from "./AddDocToSubFolder";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";

const ViewSubFolderDocuments = () => {
  const { t } = useTranslation();
  const { subFolderID, folderName } = useParams();
  const navigate = useNavigate();
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
  const [searchResults, setSearchResults] = useState([]);
  const [showATModal, setShowATModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMasterDocId, setDeleteMasterDocId] = useState("");
  const [deleteDocName, setDeleteDocName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [showAddDocument, setShowAddDocument] = useState(false);

  const [shareFormData, setShareFormData] = useState({
    Email: "",
    Subject: "",
    Body: "",
    MasterDocID: "",
    RegisterSignID: "",
  });

  const handleAddDocumentClick = () => {
    setSelectedFolderId(subFolderID);
    setShowAddDocument(true);
  };
  const handleAddDocumentClose = () => {
    fetchDocuments();
    setShowAddDocument(false);
  };

  const goBack = () => navigate(-1);

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
      setIsLoading(true);
      const response = await userService.createDocShared(shareFormData);
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

  const fetchDocuments = async () => {
    setIsLoading(true);
    setIsLoading(true);
    try {
      const response = await userService.getSubFolderDocs(subFolderID);
      if (response.data.successStatus) {
        const filesData = response.data.response;
        setData(filesData);
        setSearchResults(filesData);
        if (filesData.length > 0) {
          const firstItem = filesData[0];
          setSignedDocKey(firstItem.signedDocKey);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [subFolderID]);

  //handle downlaod
  const handleFileDownload = async (row) => {
    setDataRow(row);
    setShowDownloadModal(true);
  };

  const handleView = async (row) => {
    setIsLoading(true);
    try {
      const { signedDocKey } = row;
      const response = await userService.downloadDoc(signedDocKey);
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
    { label: t("tablesLabel.docName"), key: "docName" },
    { label: t("tablesLabel.docNumber"), key: "docCompanyPrefixNo" },
    { label: t("tablesLabel.date"), key: "completedDate" },
    { label: t("tablesLabel.refNumber"), key: "referenceNumber" },
    { label: t("tablesLabel.status"), key: "docStatus" },
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

  const handleDeleteModal = (masterDocID) => {
    setDeleteMasterDocId(masterDocID);
    const file = searchResults.find((r) => r.masterDocID === masterDocID);
    setDeleteDocName(file?.docName || "");
    setShowDeleteModal(true);
  };

  const handleDeleteFile = async () => {
    setIsLoading(true);
    try {
      const response = await userService.removeDocFromSubFolder(subFolderID, deleteMasterDocId);
      if (response.data.statusCode === "1") {
        toast.success("File deleted Successfully");
        setShowDeleteModal(false);
        fetchDocuments();
      } else {
        toast.error("Not Deleted Try Again!");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("Error", error);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Grid className='container my-3'>
      <Grid>
        {isLoading && (
          <div className='loader-overlay'>
            <Loader />
          </div>
        )}

        <div className='py-3 p-3 container pendingtable '>
          <div className=' d-flex align-items-center justify-content-between mb-2'>
            <div className='d-flex align-items-center gap-2'>
              <Icons.Back className={document.documentElement.dir === "rtl" ? "rtl-icon" : ""} onClick={goBack} style={{ cursor: "pointer" }} />
              {data.length === 0 ? (
                <>
                  <Icons.Folders size={30} />
                </>
              ) : (
                <>
                  <Icons.FoldersFill size={30} color='var(--theme-color)' />
                </>
              )}

              <span>
                <label className='mx-2' style={{ fontSize: "20px", fontWeight: "600" }}>
                  {folderName}
                </label>
              </span>
            </div>

            <div className='addFileIcon' onClick={() => handleAddDocumentClick()}>
              {t("Folder.add")}
            </div>
          </div>

          <hr />

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
              <TableHead className='customTableHead'>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.label} style={{ backgroundColor: "#e7ebee" }} className='TableHeaderCell'>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <td colSpan='6' className='p-5 text-center' style={{ color: "var(--secondary-color) !important" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Icons.Folders size={50} />
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
                    <TableCell className='TableCell'>{row.completedDate ? formatDate(row.completedDateFormatted) : ""}</TableCell>
                    <TableCell className='TableCell'>{row.referenceNumber}</TableCell>
                    <TableCell className='TableCell '>
                      <label
                        style={{
                          padding: "2px 12px",
                          borderRadius: "12px",
                          color: "#19d157",
                          border: `1px solid #19d157`,
                          fontWeight: "bold",
                        }}
                      >
                        {row.docStatus}
                      </label>
                    </TableCell>
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      {row.createdByName}
                    </TableCell>
                    <TableCell className='py-0'>
                      <Dropdown>
                        <Dropdown.Toggle as={CustomToggle} />

                        <Dropdown.Menu>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                            <Icons.Download size={20} />
                            {t("dashboardCardStatuses.download")}
                          </Dropdown.Item>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareModalShow(row)}>
                            <Icons.Share size={20} />
                            {t("dashboardCardStatuses.share")}
                          </Dropdown.Item>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row)}>
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

                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteModal(row.masterDocID)}>
                            <Icons.DeleteAction size={20} />
                            {t("Folder.deletefile")}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </TableCell>
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

      {/* delete document modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title={t("Folder.deleteConfirmation")}
        subtitle={t("Folder.subTitledelete")}
        warningText={t("Folder.sureDeleteFile")}
        itemTitle={t("tablesLabel.document")}
        itemName={deleteDocName}
        onConfirm={handleDeleteFile}
        confirmText={t("Folder.Confirm")}
        cancelText={t("Folder.Cancel")}
        headerIcon={<Icons.DeleteAction size={25} />}
        itemIcon={<Icons.PDFs size={24} />}
      />

      <AddDocToSubFolder show={showAddDocument} handleClose={handleAddDocumentClose} subFolderID={selectedFolderId} />
    </Grid>
  );
};

export default ViewSubFolderDocuments;
