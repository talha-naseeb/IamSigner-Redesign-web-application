import React, { useEffect, useState } from "react";
import userService from "@/services/userService";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Button, Form, Dropdown, Offcanvas, Modal } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Icons } from "@/assets/Icons";
import ShareModal from "@/Components/CommonModals/ShareModal/ShareModal";
import ViewModal from "@/Components/CommonModals/ViewModal/ViewModal";
import { Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Paper, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import DownloadModal from "@/Components/CommonModals/DownloadModal/DownloadModal";
import AuditTrailModal from "@/Pages/AuditTrail/AuditTrailModal";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import AddCompletedDocuments from "./AddCompletedDocuments";
import AddCompletedToSubFolder from "./AddCompletedToSubFolder";
import { Loader2, Folder as FolderIcon, FileText } from "lucide-react";

const ViewDocuments = () => {
  const { t } = useTranslation();
  const { folderId, folderName } = useParams();
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
  const [subFolderData, setSubFolderData] = useState([]);
  const [showATModal, setShowATModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMasterDocId, setDeleteMasterDocId] = useState("");
  const [deleteDocName, setDeleteDocName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedSubFolderId, setSelectedSubFolderId] = useState("");
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddDocumentSub, setShowAddDocumentSub] = useState(false);
  const [formData, setFormData] = useState({ FolderID: "", FolderName: "", FolderType: "Files", Description: "" });
  const [updateFormData, setUpdateFormData] = useState({ SubFolderID: "", FolderName: "", FolderType: "Files", Description: "" });
  const [showUpdateOffcanvas, setShowUpdateOffcanvas] = useState(false);
  const [showDeleteConfirmatrionFolderModal, setShowDeleteConfirmatrionFolderModal] = useState(false);
  const [showDeleteConfirmatrionFolderID, setShowDeleteConfirmatrionFolderID] = useState(false);
  const [showFolder, setShowFolder] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedFolderTitle, setSelectedFolderTitle] = useState("");

  const navigateToViewFiles = (subFolderName, subFolderID) => {
    const folderPath = `/sub-folders/${subFolderName}/${subFolderID}`;
    navigate(folderPath);
  };

  const handleViewDocuments = (subFolderName, subFolderID) => {
    setSelectedFolderId(subFolderName);
    navigate(`/sub-folders/${subFolderName}/${subFolderID}`);
  };

  const handleUpdateClick = (row) => {
    const { subFolderID, subFolderName, subFolderDescription } = row;
    setUpdateFormData({ SubFolderID: subFolderID, FolderName: subFolderName, Description: subFolderDescription, FolderType: "Files" });
    setShowUpdateOffcanvas(true);
  };

  const handleDeleteFolderModal = (subFolderID) => {
    setShowDeleteConfirmatrionFolderID(subFolderID);
    setShowDeleteConfirmatrionFolderModal(true);
  };

  const handleUpdateFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.updateSubFolder(updateFormData);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.folderUpdateSuccess"));
        fetchDocuments();
        setShowUpdateOffcanvas(false);
      }
    } catch (error) {
      console.error("Error updating folder:", error);
      toast.error(t("Folder.errUpdateFolder"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCloseUpdate = () => {
    setShowUpdateOffcanvas(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const SubFolderData = {
        ...formData,
        FolderID: folderId,
        FolderType: "Files",
      };
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.createSubFolder(SubFolderData);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.createFolderSuccess"));
        setFormData({ FolderName: "", Description: "" });
        setShowFolder(false);
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(t("Folder.errCreateFolder"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseOffcanvas = () => {
    setShowFolder(false);
  };

  const handleCancel = () => {
    setShowFolder(false);
  };

  const HandleDeleteFolderOnly = async () => {
    const data = {
      SubFolderID: showDeleteConfirmatrionFolderID,
    };
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.deleteSubFolder(data);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.deleteSuccess"));
        setShowDeleteConfirmatrionFolderModal(false);
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error(t("Folder.errDeleteFolder"));
    } finally {
      setIsLoading(false);
    }
  };

  const [shareFormData, setShareFormData] = useState({
    Email: "",
    Subject: "",
    Body: "",
    MasterDocID: "",
    RegisterSignID: "",
  });

  const handleAddDocumentClick = () => {
    setSelectedFolderId(folderId);
    setShowAddDocument(true);
  };

  const handleAddDocumentClose = () => {
    fetchDocuments();
    setShowAddDocument(false);
  };

  const handleAddDocSubFolder = (subFolderID) => {
    setSelectedSubFolderId(subFolderID);
    setShowAddDocumentSub(true);
  };

  const handleAddDocSubClose = () => {
    fetchDocuments();
    setShowAddDocumentSub(false);
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
    try {
      const response = await userService.getFolderDocsByFolderID(folderId);
      if (response.data.successStatus) {
        const filesData = response.data.response[0].files || [];
        const subFolder = response.data.response[0].subFolders || [];
        setSubFolderData(subFolder);
        setData([...subFolder, ...filesData]);
        setSearchResults([...subFolder, ...filesData]);
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
  }, [folderId]);

  // Handle download
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
      const response = await userService.removeDocumentFromFolder(folderId, deleteMasterDocId);
      if (response.data.statusCode === "1") {
        toast.success(t("uploadDocFlow.fileDeleted"));
        setShowDeleteModal(false);
        fetchDocuments();
      } else {
        toast.error(t("Folder.errdeleteFile"));
      }
      setIsLoading(false);
    } catch (error) {
      console.log("Error", error);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleDescriptionClick = (description, title) => {
    setSelectedDescription(description);
    setSelectedFolderTitle(title);
    setShowDescriptionModal(true);
  };

  const handleCloseDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSelectedDescription("");
    setSelectedFolderTitle("");
  };

  const columns = [
    { label: t("tablesLabel.folderFiles"), key: "docName" },
    { label: t("tablesLabel.date"), key: "dateModified" },
    { label: t("coBranding.description"), key: "subFolderDescription" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
    { label: "", key: "actions" },
  ];

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
              className='inline-flex items-center gap-2 h-9 px-3.5 text-xs font-semibold rounded-xl border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:border-[var(--theme-color)] hover:text-[var(--theme-color)] hover:bg-[var(--modern-primary-bg)] active:scale-[0.98] transition-all shadow-none outline-none'
              onClick={() => setShowFolder(true)}
            >
              <Icons.FolderPlus size={16} aria-hidden='true' />
              <span>{t("Folder.addSubFolder")}</span>
            </Button>

            <Button
              variant='none'
              className='inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-xl bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 active:scale-[0.98] transition-all shadow-none outline-none'
              onClick={() => handleAddDocumentClick()}
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
                  <TableCell className='TableHeaderCell' key={column.key}>
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
                    <TableCell
                      style={{ cursor: row.subFolderID ? "pointer" : "default" }}
                      onClick={(e) => (row.subFolderID ? navigateToViewFiles(row.subFolderName, row.subFolderID) : handleCellClick(e))}
                      className='TableCell py-3.5'
                    >
                      {row.subFolderID ? (
                        <div className='flex items-center gap-3 group'>
                          <div className='w-9 h-9 rounded-lg bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_20%,transparent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                            {row.numberOfFiles && row.numberOfFiles !== "0" ? (
                              <Icons.FoldersFill size={19} color='var(--theme-color)' />
                            ) : (
                              <FolderIcon size={18} className='text-[var(--theme-color)]' />
                            )}
                          </div>
                          <div className='min-w-0'>
                            <span className='font-semibold text-sm text-[var(--modern-text)] group-hover:text-[var(--theme-color)] transition-colors truncate block'>
                              {row.subFolderName}
                            </span>
                            <span className='text-[11px] text-[var(--modern-muted)] block mt-0.5'>
                              {row.numberOfFiles || 0} {t("Folder.files")}
                            </span>
                          </div>
                        </div>
                      ) : (
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
                      )}
                    </TableCell>
                    <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                      {row.subFolderID ? formatDate(row.createdOnFormatted) : formatDate(row.completedDateFormatted)}
                    </TableCell>
                    <TableCell
                      className={`TableCell truncate-cell ${row.subFolderDescription?.length > 50 ? "cursor-pointer" : ""}`}
                      onClick={(e) =>
                        row.subFolderDescription?.length > 50 ? handleDescriptionClick(row.subFolderDescription, row.subFolderID ? row.subFolderName : row.docName) : handleCellClick(e)
                      }
                    >
                      <span className={row.subFolderDescription ? "text-xs text-[var(--modern-text)]" : "text-xs text-[var(--modern-muted)] italic"}>
                        {row.subFolderDescription || "—"}
                      </span>
                    </TableCell>
                    <TableCell className='TableCell truncate-cell'>
                      <UserInitialsBadge name={row.subFolderID ? row.subFolderCreatedByName : row.createdByName} />
                    </TableCell>
                    <TableCell className='TableCell py-0 text-right'>
                      <Dropdown className='align-items-center'>
                        <Dropdown.Toggle as={CustomToggle} />

                        <Dropdown.Menu>
                          {row.subFolderID ? (
                            <>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                <Icons.PenEdit size={18} />
                                <span>{t("Folder.update")}</span>
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.subFolderName, row.subFolderID)}>
                                <Icons.View size={18} />
                                <span>{t("Folder.view")}</span>
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocSubFolder(row.subFolderID)}>
                                <Icons.Upload size={18} />
                                <span>{t("Folder.add")}</span>
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteFolderModal(row.subFolderID)}>
                                <Icons.DeleteAction size={18} />
                                <span>{t("Folder.delete")}</span>
                              </Dropdown.Item>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
        headerIcon={<Icons.DeleteAction size={25}  />}
        itemIcon={<Icons.PDF size={24} />}
      />

      {/* Description Modal */}
      <Modal show={showDescriptionModal} onHide={handleCloseDescriptionModal} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4">
          <Modal.Title className="text-base font-semibold text-[var(--modern-text)]">{selectedFolderTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-5'>
          <h6 className="text-xs font-semibold text-[var(--modern-muted)] uppercase tracking-wider mb-2">{t("Folder.Description")}</h6>
          <p className="text-sm text-[var(--modern-text)] leading-relaxed whitespace-pre-wrap break-words bg-[var(--modern-raised)] p-3 rounded-lg border border-[var(--modern-border)]">{selectedDescription || t("Folder.noDescription")}</p>
        </Modal.Body>
        <Modal.Footer className="border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]">
          <Button
            variant="none"
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none"
            onClick={handleCloseDescriptionModal}
          >
            {t("Folder.Cancel")}
          </Button>
        </Modal.Footer>
      </Modal>

      <AddCompletedDocuments show={showAddDocument} handleClose={handleAddDocumentClose} folderId={selectedFolderId} />
      <AddCompletedToSubFolder show={showAddDocumentSub} handleClose={handleAddDocSubClose} subFolderID={selectedSubFolderId} />

      <Offcanvas 
        show={showUpdateOffcanvas} 
        onHide={handleCloseUpdate} 
        placement={document.documentElement.dir === "rtl" ? "start" : "end"} 
        scroll={true}
        className="flex flex-col h-full bg-[var(--modern-card)] text-[var(--modern-text)] border-[var(--modern-border)]"
      >
        <Offcanvas.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4">
          <Offcanvas.Title className="text-base font-semibold text-[var(--modern-text)]">{t("Folder.updateFolder")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Form id="update-subfolder-form" onSubmit={handleUpdateFormSubmit}>
            <Form.Group className='mb-3' controlId='updateFolderName'>
              <Form.Label className="text-xs font-medium text-[var(--modern-text)]">
                {t("Folder.folderName")}
                <span className='text-rose-500 mx-1'>*</span>
              </Form.Label>
              <Form.Control 
                type='text' 
                name='FolderName' 
                value={updateFormData.FolderName} 
                onChange={handleUpdateInputChange} 
                placeholder={t("Folder.enterfodlerName")}
                className="bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] text-sm rounded-lg focus:border-[var(--theme-color)]"
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='updateDescription'>
              <Form.Label className="text-xs font-medium text-[var(--modern-text)]">
                {t("Folder.Description")}
                <span className='text-[var(--modern-muted)] mx-1'>({t("createTeam.optional")})</span>
              </Form.Label>
              <Form.Control
                as='textarea'
                name='Description'
                value={updateFormData.Description}
                onChange={handleUpdateInputChange}
                rows={4}
                placeholder={t("Folder.enterDescription")}
                maxLength={500}
                className="bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] text-sm rounded-lg focus:border-[var(--theme-color)] resize-none"
              />
              {updateFormData.Description?.length > 0 && (
                <small className={`d-block mt-1 ${updateFormData.Description.length >= 500 ? "text-rose-500" : "text-[var(--modern-muted)]"}`}>{t("createDepartment.descriptionTooLong")}</small>
              )}
            </Form.Group>
          </Form>
        </Offcanvas.Body>
        <div className="border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-5 py-3.5 flex items-center justify-end gap-3 mt-auto sticky bottom-0 z-10">
          <Button 
            type="button"
            variant='none' 
            className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none' 
            onClick={handleCloseUpdate}
          >
            {t("Folder.Cancel")}
          </Button>
          <Button 
            type='submit' 
            form="update-subfolder-form"
            variant='none' 
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none'
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("Folder.update")}
          </Button>
        </div>
      </Offcanvas>

      <Offcanvas 
        show={showFolder} 
        onHide={handleCloseOffcanvas} 
        placement={document.documentElement.dir === "rtl" ? "start" : "end"} 
        scroll={true}
        className="flex flex-col h-full bg-[var(--modern-card)] text-[var(--modern-text)] border-[var(--modern-border)]"
      >
        <Offcanvas.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4">
          <Offcanvas.Title className="text-base font-semibold text-[var(--modern-text)]">{t("Folder.addSubFolder")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Form id="create-subfolder-add-form" onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='folderName'>
              <Form.Label className="text-xs font-medium text-[var(--modern-text)]">
                {t("Folder.folderName")}
                <span className='text-rose-500 mx-1'>*</span>
              </Form.Label>
              <Form.Control 
                type='text' 
                name='FolderName' 
                value={formData.FolderName} 
                onChange={handleInputChange} 
                placeholder={t("Folder.enterfodlerName")}
                className="bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] text-sm rounded-lg focus:border-[var(--theme-color)]"
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='description'>
              <Form.Label className="text-xs font-medium text-[var(--modern-text)]">
                {t("Folder.Description")}
                <span className='text-[var(--modern-muted)] mx-1'>({t("createTeam.optional")})</span>
              </Form.Label>
              <Form.Control 
                as='textarea' 
                name='Description' 
                value={formData.Description} 
                onChange={handleInputChange} 
                rows={4} 
                placeholder={t("Folder.enterDescription")} 
                maxLength={500}
                className="bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] text-sm rounded-lg focus:border-[var(--theme-color)] resize-none"
              />
              {formData.Description?.length > 0 && (
                <small className={`d-block mt-1 ${formData.Description.length >= 500 ? "text-rose-500" : "text-[var(--modern-muted)]"}`}>{t("createDepartment.descriptionTooLong")}</small>
              )}
            </Form.Group>
          </Form>
        </Offcanvas.Body>
        <div className="border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-5 py-3.5 flex items-center justify-end gap-3 mt-auto sticky bottom-0 z-10">
          <Button 
            type="button"
            variant='none' 
            className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none' 
            onClick={handleCancel}
          >
            {t("Folder.Cancel")}
          </Button>
          <Button 
            type='submit' 
            form="create-subfolder-add-form"
            variant='none' 
            disabled={!formData.FolderName.trim() || isLoading} 
            className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none'
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("Folder.Create")}
          </Button>
        </div>
      </Offcanvas>

      {/* Delete Folder Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmatrionFolderModal}
        onHide={() => setShowDeleteConfirmatrionFolderModal(false)}
        title={t("Folder.deleteConfirmation")}
        subtitle={t("Folder.subTitle")}
        warningText={t("Folder.sureDeleteFolder")}
        itemTitle={t("Folder.folderName")}
        itemName={(subFolderData.find((s) => s.subFolderID === showDeleteConfirmatrionFolderID) || {}).subFolderName || ""}
        onConfirm={HandleDeleteFolderOnly}
        confirmText={t("Folder.Confirm")}
        cancelText={t("Folder.Cancel")}
        headerIcon={<Icons.DeleteAction size={25} />}
        itemIcon={<Icons.Folders size={24} />}
      />
    </div>
  );
};

export default ViewDocuments;
