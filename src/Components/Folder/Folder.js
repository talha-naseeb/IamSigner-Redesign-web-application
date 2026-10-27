import React, { useEffect, useState } from "react";
import userService from "@/services/userService";
import { Offcanvas as Offcanvas } from "@/Components/UI/shadcnCompat";
import { Button, Form, Dropdown } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import AddCompletedDocuments from "./AddCompletedDocuments";
import { useUser } from "@/Context/UserContext";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Paper, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import FolderFilter from "./FolderFilter";
import ShareFolderModal from "./ShareFolderModal";
import ShareDetailsModal from "./ShareDetailsModal";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { Loader2, Folder as FolderIcon, Users as UsersIcon } from "lucide-react";

function Folder() {
  const [showFolder, setShowFolder] = useState(false);
  const { user, userAccess } = useUser("");
  const [showTotalFolder, setTotalShowFolder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ FolderName: "", FolderType: "Files", Description: "" });
  const [formDataSubFolder, setFormDataSubFolder] = useState({ FolderID: "", FolderName: "", FolderType: "Files", Description: "" });
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showUpdateOffcanvas, setShowUpdateOffcanvas] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ FolderID: "", FolderName: "", FolderType: "", Description: "" });
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [showDeleteConfirmatrionFolderModal, setShowDeleteConfirmatrionFolderModal] = useState(false);
  const [showDeleteConfirmatrionFolderID, setShowDeleteConfirmatrionFolderID] = useState(false);
  const [showFolderCanvas, setShowFolderCanvas] = useState(false);
  const [showFolderId, setshowFolderId] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [docName, setDocName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareDetailsModal, setShowShareDetailsModal] = useState(false);
  const [shareWithData, setShareWithData] = useState([]);
  const [showUnshareModal, setShowUnshareModal] = useState(false);
  const [unshareEmails, setUnshareEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [shareFolderData, setShareFolderData] = useState([]);
  const [activeTab, setActiveTab] = useState("allFolders");
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedFolderTitle, setSelectedFolderTitle] = useState("");

  const handleAllfoler = () => {
    setActiveTab("allFolders");
  };

  const handleShareFolders = () => {
    setActiveTab("shareFolders");
  };

  const handleShareDetailsClick = (folderId) => {
    const folderData = searchResults.find((folder) => folder.folderID === folderId);
    setShareWithData(folderData?.sharedWith || []);
    setShowShareDetailsModal(true);
  };

  const handleShareClick = (folderId, folderName) => {
    setSelectedFolderId(folderId);
    setFolderName(folderName);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const GetFoldersandDocs = async () => {
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.getFolders();
      if (response.data.statusCode === "1") {
        const GetFoldersData = response.data.response;
        setTotalShowFolder(GetFoldersData);
        setSearchResults(GetFoldersData);
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setIsLoading(false);
    }
  };
  const GetShareWithmeFolders = async () => {
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.getFoldersSharedWithMe();
      if (response.data.statusCode === "1") {
        const GetFoldersData = response.data.response;
        setShareFolderData(GetFoldersData);
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetFoldersandDocs();
    GetShareWithmeFolders();
  }, []);

  const navigateToViewFiles = (folderId, folderName) => {
    const folderPath = `/folders/${folderName}/${folderId}`;
    navigate(folderPath);
  };

  const handleViewDocuments = (folderId, folderName) => {
    setSelectedFolderId(folderId);
    navigate(`/folders/${folderName}/${folderId}`);
  };

  const handleAddDocumentClick = (folderID) => {
    setSelectedFolderId(folderID);
    setShowAddDocument(true);
  };

  const handleAddDocumentClose = () => {
    GetFoldersandDocs();
    GetShareWithmeFolders();
    setShowAddDocument(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.createFolder(formData);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.createFolderSuccess"));
        setFormData({ FolderName: "", FolderType: "Files", Description: "" });
        setShowFolder(false);
        GetFoldersandDocs();
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
    setFormData({ FolderName: "", FolderType: "Files", Description: "" });
    setShowFolder(false);
  };

  const handleUpdateFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.updateFolder(updateFormData);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.folderUpdateSuccess"));
        GetFoldersandDocs();
        GetShareWithmeFolders();
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

  const handleCloseUpdate = () => {
    setShowUpdateOffcanvas(false);
  };

  const handleUpdateClick = (row) => {
    const { folderID, folderName, description, folderType } = row;
    setUpdateFormData({ FolderID: folderID, FolderName: folderName, Description: description, FolderType: folderType });
    setShowUpdateOffcanvas(true);
  };

  const HandleDeleteFolderOnly = async () => {
    const data = {
      FolderID: showDeleteConfirmatrionFolderID,
    };
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.deleteFolder(data);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.deleteSuccess"));
        setShowDeleteConfirmatrionFolderModal(false);
        GetFoldersandDocs();
        GetShareWithmeFolders();
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error(t("Folder.errDeleteFolder"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolderModal = (folderID) => {
    setShowDeleteConfirmatrionFolderID(folderID);
    setShowDeleteConfirmatrionFolderModal(true);
  };

  const handleSubFolderCanvas = (folderID) => {
    setshowFolderId(folderID);
    setShowFolderCanvas(true);
  };

  const handleClosesSubFolder = () => {
    setFormDataSubFolder({ FolderID: "", FolderName: "", FolderType: "Files", Description: "" });
    setShowFolderCanvas(false);
  };

  const handleCreateSubFolder = async (e) => {
    e.preventDefault();
    try {
      const SubFolderData = {
        ...formDataSubFolder,
        FolderID: showFolderId,
      };
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.createSubFolder(SubFolderData);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.createFolderSuccess"));
        setFormDataSubFolder({ FolderID: "", FolderName: "", FolderType: "Files", Description: "" });
        setShowFolderCanvas(false);
        GetFoldersandDocs();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(t("Folder.errCreateFolder"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubFolderInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataSubFolder((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const columns = [
    { label: t("home.Folder"), key: "folderName" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("coBranding.description"), key: "description" },
    { label: t("tablesLabel.ShareWith"), key: "ShareWith" },
    { label: t("tablesLabel.createdby"), key: "createdByName" },
    { label: "", key: "actions" },
  ];
  const SharedColumns = [
    { label: t("home.Folder"), key: "folderName" },
    { label: t("tablesLabel.date"), key: "createdOn" },
    { label: t("coBranding.description"), key: "description" },
    { label: t("tablesLabel.sharedBy"), key: "sharedBy" },
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

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (fromDate || toDate || folderName || docName) {
        response = await userService.getFolders({
          FolderName: folderName,
          ToDate: toDate,
          FromDate: fromDate,
          DocName: docName,
        });
      }
      setSearchResults(response.data.response || []);
      setIsLoading(false);
    } catch (error) {
      console.error(t("dashboardCardStatuses.errorfetchingUserData"));
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setFromDate("");
    setToDate("");
    setDocName("");
    setFolderName("");
    handleSearch();
    GetFoldersandDocs();
  };

  // Function to open the Unshare modal and set emails
  const handleUnshareClick = (row) => {
    const emails = row.sharedWith.split(",").map((email) => email.trim());
    setUnshareEmails(emails);
    setSelectedEmail("");
    setSelectedFolderId(row.folderID);
    setShowUnshareModal(true);
  };

  // Function to handle checkbox change
  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  const handleUnshareConfirm = async () => {
    try {
      const response = await userService.unshareFolder({ FolderID: selectedFolderId, SharedWith: selectedEmail });

      if (response.data.statusCode === "1") {
        toast.success(t("Folder.folderUnshared"));
        setShowUnshareModal(false);
        GetFoldersandDocs();
        GetShareWithmeFolders();
      } else {
        toast.error(t("Folder.folderErrorShare"));
      }
    } catch (error) {
      console.error("Error unsharing folder:", error);
    }
  };

  const handleCellClick = (event) => {
    const cell = event.target;
    cell.classList.toggle("scrollable");
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

  return (
    <>
      {(user.AccountType === "B" && user.RoleID === 3) || userAccess.remainingDays <= 0 ? (
        <>
          <UserLisence />
        </>
      ) : (
        <>
          {userAccess.folders === true ? (
            <>
              <div className='folder-route container mx-auto mt-4 px-3 sm:px-6 text-foreground [font-family:var(--modern-font-ui)]'>
                <div className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-5 md:p-6 text-foreground'>
                  {/* Top Header & Action Bar */}
                  <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--modern-border)]'>
                    <div className='flex items-center gap-3.5'>
                      <div className='w-11 h-11 rounded-xl bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_25%,transparent)] flex items-center justify-center shrink-0'>
                        <FolderIcon size={22} className='text-[var(--theme-color)]' />
                      </div>
                      <div>
                        <div className='flex items-center gap-2.5'>
                          <h1 className='text-lg md:text-xl font-bold text-[var(--modern-text)] tracking-tight m-0'>
                            {activeTab === "allFolders" ? t("Folder.Allfolders") : t("dashboardCardStatuses.sharedWithMe")}
                          </h1>
                          <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                            {activeTab === "allFolders" ? searchResults.length : shareFolderData.length}
                          </span>
                        </div>
                        <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                          {t("Folder.manageFoldersSubtitle")}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center flex-wrap gap-2.5'>
                      <FolderFilter
                        fromDate={fromDate}
                        toDate={toDate}
                        folderName={folderName}
                        docName={docName}
                        setFromDate={setFromDate}
                        setToDate={setToDate}
                        setFolderName={setFolderName}
                        setDocName={setDocName}
                        handleSearch={handleSearch}
                        clearSearch={clearSearch}
                      />

                      <Button
                        variant='none'
                        className='inline-flex items-center gap-2 h-10 px-4 text-xs md:text-sm font-semibold rounded-xl bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 active:scale-[0.98] transition-all shadow-none'
                        onClick={() => setShowFolder(true)}
                      >
                        <Icons.FolderPlus size={18} aria-hidden='true' />
                        <span>{t("Folder.createFolder")}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Segmented Pill Tabs */}
                  <div className='pt-4 pb-3 flex items-center justify-between gap-3 flex-wrap'>
                    <div className='folder-view-tabs' role='tablist' aria-label={t("home.Folder")}>
                      <button
                        type='button'
                        role='tab'
                        className={`folder-view-tab${activeTab === "allFolders" ? " is-active" : ""}`}
                        onClick={handleAllfoler}
                        aria-selected={activeTab === "allFolders"}
                      >
                        <span>{t("Folder.Allfolders")}</span>
                        <span className='folder-view-tab-badge'>{searchResults.length}</span>
                      </button>
                      <button
                        type='button'
                        role='tab'
                        className={`folder-view-tab${activeTab === "shareFolders" ? " is-active" : ""}`}
                        onClick={handleShareFolders}
                        aria-selected={activeTab === "shareFolders"}
                      >
                        <span>{t("dashboardCardStatuses.sharedWithMe")}</span>
                        <span className='folder-view-tab-badge'>{shareFolderData.length}</span>
                      </button>
                    </div>
                  </div>

                  {activeTab === "allFolders" && (
                    <>
                      <TableContainer
                        component={Paper}
                        className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
                        style={{
                          maxWidth: "100%",
                          overflowX: "auto",
                          minHeight: "440px",
                          height: "calc(100vh - 300px)",
                          maxHeight: "calc(100vh - 300px)",
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
                            {searchResults.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={columns.length} className='table-empty-state-cell'>
                                  <TableEmptyState
                                    icon={<FolderIcon size={48} className='text-[var(--modern-muted)]' />}
                                    title={t("dashboardCardStatuses.notFolerFound")}
                                  />
                                </TableCell>
                              </TableRow>
                            )}

                            {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                              <TableRow key={row.folderID || index} hover>
                                <TableCell
                                  style={{ cursor: "pointer" }}
                                  className='TableCell py-3.5'
                                  onClick={() => navigateToViewFiles(row.folderID, row.folderName)}
                                >
                                  <div className='flex items-center gap-3 group'>
                                    <div className='w-9 h-9 rounded-lg bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_20%,transparent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                                      {row.numberOfSubFolders > 0 || row.numberOfFiles > 0 ? (
                                        <Icons.FoldersFill size={20} color='var(--theme-color)' />
                                      ) : (
                                        <FolderIcon size={18} className='text-[var(--theme-color)]' />
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <span className='font-semibold text-sm text-[var(--modern-text)] group-hover:text-[var(--theme-color)] transition-colors truncate block'>
                                        {row.folderName}
                                      </span>
                                      <span className='text-[11px] text-[var(--modern-muted)] block mt-0.5'>
                                        {row.numberOfSubFolders || 0} {t("Folder.subfolders")} • {row.numberOfFiles || 0} {t("Folder.files")}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                                  {row.createdOnFormatted ? formatDate(row.createdOnFormatted) : "—"}
                                </TableCell>
                                <TableCell
                                  className={`TableCell truncate-cell ${row.description?.length > 50 ? "cursor-pointer" : ""}`}
                                  onClick={(e) => (row.description?.length > 50 ? handleDescriptionClick(row.description, row.folderName) : handleCellClick(e))}
                                >
                                  <span className={row.description ? "text-xs text-[var(--modern-text)]" : "text-xs text-[var(--modern-muted)] italic"}>
                                    {row.description || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                                  {row.sharedWith ? (
                                    row.sharedWith.split(",").length === 1 ? (
                                      <span className='text-xs text-[var(--modern-text)]'>{row.sharedWith.trim()}</span>
                                    ) : (
                                      <button
                                        type='button'
                                        className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs font-medium text-[var(--theme-color)] hover:border-[var(--theme-color)] active:scale-[0.98] transition-all shadow-none'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShareDetailsClick(row.folderID);
                                        }}
                                      >
                                        <UsersIcon size={13} />
                                        <span>{row.sharedWith.split(",").length} {t("Folder.users")}</span>
                                      </button>
                                    )
                                  ) : (
                                    <span className='text-xs text-[var(--modern-muted)]'>—</span>
                                  )}
                                </TableCell>

                                <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                                  <UserInitialsBadge name={row.createdByName} />
                                </TableCell>

                                <TableCell className='TableCell py-0 text-right'>
                                  <Dropdown>
                                    <Dropdown.Toggle as={CustomToggle} />
                                    <Dropdown.Menu>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                        <Icons.PenEdit size={18} />
                                        <span>{t("Folder.update")}</span>
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareClick(row.folderID, row.folderName)}>
                                        <Icons.Share size={18} />
                                        <span>{t("Folder.Sharefolder")}</span>
                                      </Dropdown.Item>
                                      {row.isShared ? (
                                        <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUnshareClick(row)}>
                                          <Icons.Unshare size={18} />
                                          <span>{t("Folder.UnShareFolder")}</span>
                                        </Dropdown.Item>
                                      ) : null}

                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.folderID, row.folderName)}>
                                        <Icons.View size={18} />
                                        <span>{t("Folder.view")}</span>
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocumentClick(row.folderID)}>
                                        <Icons.Upload size={18} />
                                        <span>{t("Folder.add")}</span>
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteFolderModal(row.folderID)}>
                                        <Icons.DeleteAction size={18} />
                                        <span>{t("Folder.delete")}</span>
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleSubFolderCanvas(row.folderID)}>
                                        <Icons.SubFolders size={18} />
                                        <span>{t("Folder.CreateFolder")}</span>
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-xs text-[var(--modern-muted)]'>
                        <div>
                          {searchResults.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, searchResults.length)} {t("Folder.FolderOf")} {searchResults.length} {t("home.Folder")}
                        </div>
                        <Pagination
                          count={Math.max(1, Math.ceil(searchResults.length / rowsPerPage))}
                          variant='outlined'
                          shape='rounded'
                          page={Math.min(page + 1, Math.max(1, Math.ceil(searchResults.length / rowsPerPage)))}
                          onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === "shareFolders" && (
                    <>
                      <TableContainer
                        component={Paper}
                        className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
                        style={{
                          maxWidth: "100%",
                          overflowX: "auto",
                          minHeight: "440px",
                          height: "calc(100vh - 300px)",
                          maxHeight: "calc(100vh - 300px)",
                        }}
                      >
                        <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
                          <TableHead className='customTableHead'>
                            <TableRow>
                              {SharedColumns.map((column) => (
                                <TableCell className='TableHeaderCell' key={column.key}>
                                  {column.label}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {shareFolderData.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={SharedColumns.length} className='table-empty-state-cell'>
                                  <TableEmptyState
                                    icon={<FolderIcon size={48} className='text-[var(--modern-muted)]' />}
                                    title={t("dashboardCardStatuses.notFolerFound")}
                                  />
                                </TableCell>
                              </TableRow>
                            )}

                            {shareFolderData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                              <TableRow key={row.folderID || index} hover>
                                <TableCell
                                  style={{ cursor: "pointer" }}
                                  className='TableCell py-3.5'
                                  onClick={() => navigateToViewFiles(row.folderID, row.folderName)}
                                >
                                  <div className='flex items-center gap-3 group'>
                                    <div className='w-9 h-9 rounded-lg bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_20%,transparent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                                      {row.numberOfSubFolders > 0 || row.numberOfFiles > 0 ? (
                                        <Icons.FoldersFill size={20} color='var(--theme-color)' />
                                      ) : (
                                        <FolderIcon size={18} className='text-[var(--theme-color)]' />
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <span className='font-semibold text-sm text-[var(--modern-text)] group-hover:text-[var(--theme-color)] transition-colors truncate block'>
                                        {row.folderName}
                                      </span>
                                      <span className='text-[11px] text-[var(--modern-muted)] block mt-0.5'>
                                        {row.numberOfSubFolders || 0} {t("Folder.subfolders")} • {row.numberOfFiles || 0} {t("Folder.files")}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className='TableCell text-xs text-[var(--modern-muted)]'>
                                  {row.sharedOnFormatted ? formatDate(row.sharedOnFormatted) : "—"}
                                </TableCell>
                                <TableCell
                                  className={`TableCell truncate-cell ${row.description?.length > 50 ? "cursor-pointer" : ""}`}
                                  onClick={(e) => (row.description?.length > 50 ? handleDescriptionClick(row.description, row.folderName) : handleCellClick(e))}
                                >
                                  <span className={row.description ? "text-xs text-[var(--modern-text)]" : "text-xs text-[var(--modern-muted)] italic"}>
                                    {row.description || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                                  <UserInitialsBadge name={row.sharedBy} />
                                </TableCell>

                                <TableCell className='TableCell py-0 text-right'>
                                  <Dropdown>
                                    <Dropdown.Toggle as={CustomToggle} />
                                    <Dropdown.Menu>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                        <Icons.EditSquare size={18} />
                                        <span>{t("Folder.update")}</span>
                                      </Dropdown.Item>

                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.folderID, row.folderName)}>
                                        <Icons.View size={18} />
                                        <span>{t("Folder.view")}</span>
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocumentClick(row.folderID)}>
                                        <Icons.FolderPlus size={18} />
                                        <span>{t("Folder.add")}</span>
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 text-xs text-[var(--modern-muted)]'>
                        <div>
                          {shareFolderData.length ? page * rowsPerPage + 1 : 0} - {Math.min((page + 1) * rowsPerPage, shareFolderData.length)} {t("Folder.FolderOf")} {shareFolderData.length} {t("home.Folder")}
                        </div>
                        <Pagination
                          count={Math.max(1, Math.ceil(shareFolderData.length / rowsPerPage))}
                          variant='outlined'
                          shape='rounded'
                          page={Math.min(page + 1, Math.max(1, Math.ceil(shareFolderData.length / rowsPerPage)))}
                          onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <Modal show={showUnshareModal} onHide={() => setShowUnshareModal(false)} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
                  <Modal.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4">
                    <Modal.Title className="text-base font-semibold text-[var(--modern-text)]"> {t("Folder.UnShareFolder")}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className='p-4 text-sm text-[var(--modern-text)]'>
                    <p className="text-xs text-[var(--modern-muted)] mb-3">{t("Folder.selectEmail")}</p>
                    <Form className="space-y-2">
                      {unshareEmails.map((email, index) => (
                        <div key={index} className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--modern-raised)] border border-[var(--modern-border)]">
                          <Form.Check 
                            type='checkbox' 
                            id={`unshare-email-${index}`}
                            label={email} 
                            name='unshareEmail' 
                            checked={selectedEmail === email} 
                            onChange={() => handleEmailSelect(email)} 
                            className="text-xs font-medium text-[var(--modern-text)] cursor-pointer"
                          />
                        </div>
                      ))}
                    </Form>
                  </Modal.Body>
                  <Modal.Footer className="border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]">
                    <Button 
                      variant='none' 
                      className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none' 
                      onClick={() => setShowUnshareModal(false)}
                    >
                      {t("Folder.Cancel")}
                    </Button>
                    <Button 
                      className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none' 
                      variant='none' 
                      onClick={handleUnshareConfirm} 
                      disabled={!selectedEmail || isLoading}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t("Folder.Confirm")}
                    </Button>
                  </Modal.Footer>
                </Modal>

                <DeleteConfirmationModal
                  show={showDeleteConfirmatrionFolderModal}
                  onHide={() => setShowDeleteConfirmatrionFolderModal(false)}
                  title={t("Folder.deleteConfirmation")}
                  subtitle={t("Folder.subTitle")}
                  warningText={t("Folder.sureDeleteFolder")}
                  itemTitle={t("Folder.folderName")}
                  itemName={(searchResults.find((f) => f.folderID === showDeleteConfirmatrionFolderID) || {}).folderName || ""}
                  onConfirm={HandleDeleteFolderOnly}
                  confirmText={t("Folder.Confirm")}
                  cancelText={t("Folder.Cancel")}
                  headerIcon={<Icons.DeleteAction size={25} />}
                  itemIcon={<Icons.Folders size={24} />}
                />

                <Offcanvas 
                  show={showFolder} 
                  onHide={handleCloseOffcanvas} 
                  placement={document.documentElement.dir === "rtl" ? "start" : "end"} 
                  scroll={true}
                  className="flex flex-col h-full bg-[var(--modern-card)] text-[var(--modern-text)] border-[var(--modern-border)]"
                >
                  <Offcanvas.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4">
                    <Offcanvas.Title className="text-base font-semibold text-[var(--modern-text)]">{t("Folder.createFolder")}</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    <Form id="create-folder-form" onSubmit={handleSubmit}>
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
                          className="bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] text-sm rounded-lg focus:border-[var(--theme-color)] resize-none"
                        />
                        {formData.Description.length > 0 && <small className={`d-block mt-1 ${formData.Description.length >= 500 ? "text-rose-500" : "text-[var(--modern-muted)]"}`}></small>}
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
                      form="create-folder-form"
                      variant='none' 
                      disabled={!formData.FolderName.trim() || isLoading} 
                      className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none'
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t("Folder.Create")}
                    </Button>
                  </div>
                </Offcanvas>

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
                    <Form id="update-folder-form" onSubmit={handleUpdateFormSubmit}>
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
                        {updateFormData.Description.length > 0 && (
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
                      form="update-folder-form"
                      variant='none' 
                      disabled={isLoading}
                      className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none'
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t("Folder.Create")}
                    </Button>
                  </div>
                </Offcanvas>

                <Offcanvas 
                  show={showFolderCanvas} 
                  onHide={handleClosesSubFolder} 
                  placement={document.documentElement.dir === "rtl" ? "start" : "end"} 
                  scroll={true}
                  className="flex flex-col h-full bg-[var(--modern-card)] text-[var(--modern-text)] border-[var(--modern-border)]"
                >
                  <Offcanvas.Header closeButton className="border-b border-[var(--modern-border)] px-5 py-4">
                    <Offcanvas.Title className="text-base font-semibold text-[var(--modern-text)]">{t("Folder.addSubFolder")}</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    <Form id="create-subfolder-form" onSubmit={handleCreateSubFolder}>
                      <Form.Group className='mb-3' controlId='subfolderName'>
                        <Form.Label className="text-xs font-medium text-[var(--modern-text)]">
                          {t("Folder.folderName")}
                          <span className='text-rose-500 mx-1'>*</span>
                        </Form.Label>
                        <Form.Control 
                          type='text' 
                          name='FolderName' 
                          value={formDataSubFolder.FolderName} 
                          onChange={handleSubFolderInputChange} 
                          placeholder={t("Folder.enterfodlerName")}
                          className="bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] text-sm rounded-lg focus:border-[var(--theme-color)]"
                        />
                      </Form.Group>
                      <Form.Group className='mb-3' controlId='subfolderDescription'>
                        <Form.Label className="text-xs font-medium text-[var(--modern-text)]">
                          {t("Folder.Description")}
                          <span className='text-[var(--modern-muted)] mx-1'>({t("createTeam.optional")})</span>
                        </Form.Label>
                        <Form.Control
                          as='textarea'
                          name='Description'
                          value={formDataSubFolder.Description}
                          onChange={handleSubFolderInputChange}
                          rows={4}
                          placeholder={t("Folder.enterDescription")}
                          maxLength={500}
                          className="bg-[var(--modern-raised)] border-[var(--modern-border)] text-[var(--modern-text)] text-sm rounded-lg focus:border-[var(--theme-color)] resize-none"
                        />
                        {formDataSubFolder.Description.length > 500 && <small className='text-rose-500'>{t("createDepartment.descriptionTooLong")}</small>}
                      </Form.Group>
                    </Form>
                  </Offcanvas.Body>
                  <div className="border-t border-[var(--modern-border)] bg-[var(--modern-card)] px-5 py-3.5 flex items-center justify-end gap-3 mt-auto sticky bottom-0 z-10">
                    <Button 
                      type="button"
                      variant='none' 
                      className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none' 
                      onClick={handleClosesSubFolder}
                    >
                      {t("Folder.Cancel")}
                    </Button>
                    <Button 
                      type='submit' 
                      form="create-subfolder-form"
                      variant='none' 
                      disabled={!formDataSubFolder.FolderName.trim() || isLoading} 
                      className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none'
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t("Folder.Create")}
                    </Button>
                  </div>
                </Offcanvas>

                <ShareDetailsModal show={showShareDetailsModal} handleClose={() => setShowShareDetailsModal(false)} shareWith={shareWithData} />
                <AddCompletedDocuments show={showAddDocument} handleClose={handleAddDocumentClose} folderId={selectedFolderId} />
                <ShareFolderModal
                  GetFolders={GetFoldersandDocs}
                  GetShareWithmeFolders={GetShareWithmeFolders}
                  show={showShareModal}
                  handleClose={handleCloseShareModal}
                  folderId={selectedFolderId}
                  folderName={folderName}
                />
              </div>

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
            </>
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}

export default Folder;
