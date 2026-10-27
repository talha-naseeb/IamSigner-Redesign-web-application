import React, { useEffect, useState } from "react";
import userService from "@/services/userService";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Button, Dropdown } from "@/Components/UI/shadcnCompat";
import { Folder as FolderIcon, FileText, Loader2 } from "lucide-react";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Stack, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import { Icons } from "@/assets/Icons";
import { useParams, useNavigate } from "react-router-dom";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
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
        toast.success(t("uploadDocFlow.fileDeleted") || "File deleted successfully");
        setShowDeleteModal(false);
        fetchDocuments();
      } else {
        toast.error(t("Folder.errdeleteFile") || "Not Deleted Try Again!");
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
    <div className='folder-route folder-document-route container mx-auto mt-4 px-3 sm:px-6 text-foreground [font-family:var(--modern-font-ui)]'>
      <div className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-5 md:p-6 text-foreground'>
        {/* Top Header & Breadcrumb Toolbar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--modern-border)]'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={goBack}
              className='w-9 h-9 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] hover:border-[var(--theme-color)] hover:text-[var(--theme-color)] hover:bg-[var(--modern-primary-bg)] text-[var(--modern-text)] flex items-center justify-center transition-colors shrink-0 shadow-none outline-none cursor-pointer active:scale-[0.98]'
              aria-label='Go back'
            >
              <Icons.Back className={document.documentElement.dir === "rtl" ? "scale-x-[-1]" : ""} size={16} />
            </button>
            <div className='w-10 h-10 rounded-xl bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_25%,transparent)] flex items-center justify-center shrink-0'>
              {data.length > 0 ? (
                <Icons.FoldersFill size={20} color='var(--theme-color)' />
              ) : (
                <FolderIcon size={18} className='text-[var(--theme-color)]' />
              )}
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <button
                  type='button'
                  onClick={() => navigate("/folders")}
                  className='border-0 bg-transparent p-0 text-xs font-medium text-[var(--modern-muted)] hover:text-[var(--theme-color)] transition-colors cursor-pointer outline-none shadow-none focus:outline-none focus:ring-0 appearance-none inline-flex items-center'
                >
                  {t("home.Folder") || "Folders"}
                </button>
                <span className='text-xs text-[var(--modern-muted)]'>/</span>
                <h1 className='text-base md:text-lg font-bold text-[var(--modern-text)] tracking-tight truncate m-0'>
                  {folderName}
                </h1>
                <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                  {data.length}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2.5 flex-wrap self-end sm:self-center'>
            <Button
              variant='none'
              className='inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-xl bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 active:scale-[0.98] transition-all shadow-none outline-none'
              onClick={handleAddDocumentClick}
            >
              <Icons.Upload size={16} aria-hidden='true' />
              <span>{t("Folder.add")}</span>
            </Button>
          </div>
        </div>

        <TableContainer
          component={Paper}
          className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)] mt-4'
          style={{
            maxWidth: "100%",
            overflowX: "auto",
            minHeight: "440px",
            height: "calc(100vh - 280px)",
            maxHeight: "calc(100vh - 280px)",
          }}
        >
          <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
            <TableHead className='customTableHead'>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.label} className='TableHeaderCell'>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                    <TableEmptyState
                      icon={<FolderIcon size={48} className='text-[var(--modern-muted)]' />}
                      title={t("dashboardCardStatuses.notDocsFound")}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell py-3.5'>
                      <div className='flex items-center gap-3 group'>
                        <div className='w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                          <FileText size={18} />
                        </div>
                        <div className='min-w-0'>
                          <span className='font-semibold text-sm text-[var(--modern-text)] truncate block' title={row.docName}>
                            {row.docName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='TableCell text-xs font-medium text-[var(--modern-muted)]'>{row.docCompanyPrefixNo}</TableCell>
                    <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>{row.completedDate ? formatDate(row.completedDateFormatted) : "—"}</TableCell>
                    <TableCell className='TableCell text-xs text-[var(--modern-muted)] truncate-cell' title={row.referenceNumber}>{row.referenceNumber || "—"}</TableCell>
                    <TableCell className='TableCell'>
                      <span
                        className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold'
                        style={{
                          color: "var(--completed-status)",
                          backgroundColor: "color-mix(in srgb, var(--completed-status) 12%, var(--modern-card))",
                          border: "1px solid color-mix(in srgb, var(--completed-status) 35%, var(--modern-border))",
                        }}
                      >
                        <span className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: "var(--completed-status)" }} />
                        <span>{row.docStatus}</span>
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => handleCellClick(e)} className='TableCell truncate-cell'>
                      <UserInitialsBadge name={row.createdByName} />
                    </TableCell>
                    <TableCell className='TableCell py-0 text-right'>
                      <Dropdown>
                        <Dropdown.Toggle as={CustomToggle} />

                        <Dropdown.Menu>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleFileDownload(row)}>
                            <Icons.Download size={18} />
                            <span>{t("dashboardCardStatuses.download")}</span>
                          </Dropdown.Item>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareModalShow(row)}>
                            <Icons.Share size={18} />
                            <span>{t("dashboardCardStatuses.share")}</span>
                          </Dropdown.Item>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleView(row)}>
                            <Icons.View size={18} />
                            <span>{t("dashboardCardStatuses.view")}</span>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <SignOrder masterDocID={row.masterDocID} />
                          </Dropdown.Item>
                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewAuditTrail(row.signedDocKey)}>
                            <Icons.AuditTrail size={18} />
                            <span>{t("dashboardCardStatuses.viewAuditTrail")}</span>
                          </Dropdown.Item>

                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteModal(row.masterDocID)}>
                            <Icons.DeleteAction size={18} />
                            <span>{t("Folder.deletefile")}</span>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-xs text-[var(--modern-muted)]'>
          <div>
            {data.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, data.length)} {t("tablesLabel.documentsof")} {data.length} {t("tablesLabel.document")}
          </div>
          <Pagination
            count={Math.max(1, Math.ceil(data.length / rowsPerPage))}
            variant='outlined'
            shape='rounded'
            page={Math.min(page + 1, Math.max(1, Math.ceil(data.length / rowsPerPage)))}
            onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
          />
        </div>
      </div>

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
    </div>
  );
};

export default ViewSubFolderDocuments;
