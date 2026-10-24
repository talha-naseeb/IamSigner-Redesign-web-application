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
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination } from "@/Components/UI/dataPrimitives";
import FolderFilter from "./FolderFilter";
import ShareFolderModal from "./ShareFolderModal";
import ShareDetailsModal from "./ShareDetailsModal";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";

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
              <div className='folder-route container mt-3 text-foreground [font-family:var(--modern-font-ui)]'>
                {isLoading && (
                  <div className='loader-overlay'>
                    <Loader />
                  </div>
                )}

                <button className='templateButton' onClick={() => setShowFolder(true)}>
                  {t("Folder.createFolder")}
                </button>

                <div className='container mt-3 rounded-2xl border border-border bg-card p-[clamp(1rem,2.5vw,1.5rem)] text-foreground max-sm:p-4'>
                  <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex gap-3'>
                      {searchResults.length === 0 ? (
                        <>
                          <Icons.Folders size={30} />
                        </>
                      ) : (
                        <>
                          <Icons.FoldersFill size={30} color='var(--modern-violet)' />
                        </>
                      )}

                      <label style={{ fontSize: "20px", fontWeight: "600" }}>{t("Folder.Allfolders")}</label>
                    </div>

                    <div className='search-filters-container'>
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
                    </div>
                  </div>

                  <div className='d-flex gap-3 '>
                    <Button
                      className={`min-h-10 rounded-[10px] border border-border bg-[var(--modern-raised)] px-3 text-[var(--modern-muted)] transition-colors hover:border-[var(--modern-violet)] hover:bg-[var(--modern-violet-soft)] hover:text-[var(--modern-violet)] ${
                        activeTab === "allFolders" ? "border-[var(--modern-violet)] bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]" : ""
                      }`}
                      onClick={handleAllfoler}
                    >
                      {t("Folder.Allfolders")}
                    </Button>
                    <Button
                      className={`min-h-10 rounded-[10px] border border-border bg-[var(--modern-raised)] px-3 text-[var(--modern-muted)] transition-colors hover:border-[var(--modern-violet)] hover:bg-[var(--modern-violet-soft)] hover:text-[var(--modern-violet)] ${
                        activeTab === "shareFolders" ? "border-[var(--modern-violet)] bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]" : ""
                      }`}
                      onClick={handleShareFolders}
                    >
                      {t("dashboardCardStatuses.sharedWithMe")}
                    </Button>
                  </div>

                  <hr />

                  {activeTab === "allFolders" && (
                    <>
                      <TableContainer
                        component={Paper}
                        className='custom-table-scrollbar'
                        style={{
                          maxWidth: "100%",
                          overflowX: "auto",
                          height: "50vh",
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
                                <td colSpan='6' className='p-5 text-center text-muted-foreground'>
                                  <div className='flex flex-col items-center gap-2'>
                                    <Icons.Folders size={50} />
                                    {t("dashboardCardStatuses.notFolerFound")}
                                  </div>
                                </td>
                              </TableRow>
                            )}

                            {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                              <TableRow key={index}>
                                <TableCell style={{ cursor: "pointer" }} className='TableCell' onClick={() => navigateToViewFiles(row.folderID, row.folderName)}>
                                  <div className='d-flex align-items-center gap-2'>
                                    {row.numberOfSubFolders > 0 || row.numberOfFiles > 0 ? (
                                      <>
                                        <Icons.FoldersFill size={30} color='var(--modern-violet)' />
                                      </>
                                    ) : (
                                      <>
                                        <Icons.Folders size={25} />
                                      </>
                                    )}
                                    {row.folderName}
                                  </div>
                                </TableCell>
                                <TableCell className='TableCell'>{row.createdOnFormatted ? formatDate(row.createdOnFormatted) : ""}</TableCell>
                                <TableCell
                                  className={`TableCell truncate-cell ${row.description?.length > 50 ? "cursor-pointer" : ""}`}
                                  onClick={(e) => (row.description?.length > 50 ? handleDescriptionClick(row.description, row.folderName) : handleCellClick(e))}
                                  style={{ cursor: row.description?.length > 50 ? "pointer" : "" }}
                                >
                                  {row.description}
                                </TableCell>
                                <TableCell className='TableCell runcate-cell' onClick={(e) => handleCellClick(e)}>
                                  {row.sharedWith ? (
                                    row.sharedWith.split(",").length === 1 ? (
                                      <label>{row.sharedWith}</label>
                                    ) : (
                                      <label
                                        className='inline-flex cursor-pointer items-center rounded-lg border border-border bg-[var(--modern-raised)] p-[5px] text-[var(--modern-violet)]'
                                        onClick={() => handleShareDetailsClick(row.folderID)}
                                      >
                                        <Icons.Share size={22} />
                                      </label>
                                    )
                                  ) : (
                                    <></>
                                  )}
                                </TableCell>

                                <TableCell className='TableCell truncate-cell' onClick={(e) => handleCellClick(e)}>
                                  {row.createdByName}
                                </TableCell>

                                <TableCell className='py-0'>
                                  <Dropdown>
                                    <Dropdown.Toggle as={CustomToggle} />
                                    <Dropdown.Menu>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                        <Icons.PenEdit size={20} />
                                        {t("Folder.update")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareClick(row.folderID, row.folderName)}>
                                        <Icons.Share size={20} />
                                        {t("Folder.Sharefolder")}
                                      </Dropdown.Item>
                                      {row.isShared ? (
                                        <>
                                          <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUnshareClick(row)}>
                                            <Icons.Unshare size={21} />
                                            {t("Folder.UnShareFolder")}
                                          </Dropdown.Item>
                                        </>
                                      ) : null}

                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.folderID, row.folderName)}>
                                        <Icons.View size={20} />
                                        {t("Folder.view")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocumentClick(row.folderID)}>
                                        <Icons.Upload size={20} />
                                        {t("Folder.add")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteFolderModal(row.folderID)}>
                                        <Icons.DeleteAction size={20} />
                                        {t("Folder.delete")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleSubFolderCanvas(row.folderID)}>
                                        <Icons.SubFolders size={22} />
                                        {t("Folder.CreateFolder")}
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                        <div className='showHideNoDocs'>
                          {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, showTotalFolder.length)} {t("Folder.FolderOf")} {showTotalFolder.length} {t("home.Folder")}
                        </div>
                        <Pagination
                          count={Math.ceil(showTotalFolder.length / rowsPerPage)}
                          variant='outlined'
                          shape='rounded'
                          page={page + 1}
                          onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === "shareFolders" && (
                    <>
                      <TableContainer
                        component={Paper}
                        className='custom-table-scrollbar'
                        style={{
                          maxWidth: "100%",
                          overflowX: "auto",
                          height: "50vh",
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
                                <td colSpan='6' className='p-5 text-center text-muted-foreground'>
                                  <div className='flex flex-col items-center gap-2'>
                                    <Icons.Folders size={60} />
                                    {t("dashboardCardStatuses.notFolerFound")}
                                  </div>
                                </td>
                              </TableRow>
                            )}

                            {shareFolderData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                              <TableRow key={index}>
                                <TableCell style={{ cursor: "pointer" }} className='TableCell' onClick={() => navigateToViewFiles(row.folderID, row.folderName)}>
                                  <div className='d-flex align-items-center gap-2'>
                                    {row.numberOfSubFolders > 0 || row.numberOfFiles > 0 ? (
                                      <>
                                        <Icons.FoldersFill size={30} color='var(--modern-violet)' />
                                      </>
                                    ) : (
                                      <>
                                        <Icons.Folders size={25} />
                                      </>
                                    )}

                                    {row.folderName}
                                  </div>
                                </TableCell>
                                <TableCell className='TableCell'>{row.sharedOnFormatted ? formatDate(row.sharedOnFormatted) : ""}</TableCell>
                                <TableCell
                                  className={`TableCell truncate-cell ${row.description?.length > 50 ? "cursor-pointer" : ""}`}
                                  onClick={(e) => (row.description?.length > 50 ? handleDescriptionClick(row.description, row.folderName) : handleCellClick(e))}
                                  style={{ cursor: row.description?.length > 50 ? "pointer" : "" }}
                                >
                                  {row.description}
                                </TableCell>
                                <TableCell className='TableCell runcate-cell' onClick={(e) => handleCellClick(e)}>
                                  {row.sharedBy ? (
                                    row.sharedBy.split(",").length === 1 ? (
                                      <label>{row.sharedBy}</label>
                                    ) : (
                                      <label className='inline-flex cursor-pointer items-center rounded-lg border border-border bg-[var(--modern-raised)] p-[5px] text-[var(--modern-violet)]' onClick={() => handleShareDetailsClick(row.folderID)}>
                                        <Icons.Share size={22} />
                                      </label>
                                    )
                                  ) : (
                                    <></>
                                  )}
                                </TableCell>

                                <TableCell className='py-0'>
                                  <Dropdown>
                                    <Dropdown.Toggle as={CustomToggle} />
                                    <Dropdown.Menu>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                        <Icons.EditSquare size={20} />
                                        {t("Folder.update")}
                                      </Dropdown.Item>
                                      {/* <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleShareClick(row.folderID)}>
                                        <Icons.Share size={20} />
                                        {t("Folder.Sharefolder")}
                                      </Dropdown.Item> */}

                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.folderID, row.folderName)}>
                                        <Icons.View size={20} />
                                        {t("Folder.view")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocumentClick(row.folderID)}>
                                        <Icons.FolderPlus size={20} />
                                        {t("Folder.add")}
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                        <div className='showHideNoDocs'>
                          {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, shareFolderData.length)} {t("Folder.FolderOf")} {showTotalFolder.length} {t("home.Folder")}
                        </div>
                        <Pagination
                          count={Math.ceil(shareFolderData.length / rowsPerPage)}
                          variant='outlined'
                          shape='rounded'
                          page={page + 1}
                          onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <Modal show={showUnshareModal} onHide={() => setShowUnshareModal(false)} backdrop='static' keyboard={false} dialogClassName='custom-modal-width'>
                  <Modal.Header closeButton>
                    <Modal.Title> {t("Folder.UnShareFolder")}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className='p-3'>
                    <p>{t("Folder.selectEmail")}</p>
                    <Form>
                      {unshareEmails.map((email, index) => (
                        <Form.Check type='checkbox' key={index} label={email} name='unshareEmail' checked={selectedEmail === email} onChange={() => handleEmailSelect(email)} />
                      ))}
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant='none' className='modalCancelButton' onClick={() => setShowUnshareModal(false)}>
                      {t("Folder.Cancel")}
                    </Button>
                    <Button className='applyBtn' variant='none' onClick={handleUnshareConfirm} disabled={!selectedEmail}>
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

                <Offcanvas show={showFolder} onHide={handleCloseOffcanvas} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{t("Folder.createFolder")}</Offcanvas.Title>
                  </Offcanvas.Header>
                  <hr className='m-0 border-[var(--modern-border)] opacity-100' />
                  <Offcanvas.Body>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className='mb-3' controlId='folderName'>
                        <Form.Label>
                          {" "}
                          {t("Folder.folderName")}
                          <span className='text-danger mx-1'>*</span>
                        </Form.Label>
                        <Form.Control type='text' name='FolderName' value={formData.FolderName} onChange={handleInputChange} placeholder={t("Folder.enterfodlerName")} />
                      </Form.Group>
                      <Form.Group className='mb-3' controlId='description'>
                        <Form.Label>
                          {t("Folder.Description")}
                          <span className='text-muted mx-1'>({t("createTeam.optional")})</span>
                        </Form.Label>
                        <Form.Control as='textarea' name='Description' value={formData.Description} onChange={handleInputChange} rows={3} placeholder={t("Folder.enterDescription")} />
                        {formData.Description.length > 0 && <small className={`d-block mt-1 ${formData.Description.length >= 500 ? "text-danger" : "text-muted"}`}></small>}
                      </Form.Group>
                      <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
                        <Button variant='none' className='resetBtn' onClick={handleCancel}>
                          {t("Folder.Cancel")}
                        </Button>
                        <Button type='submit' variant='none' disabled={!formData.FolderName.trim()} className='applyBtn'>
                          {t("Folder.Create")}
                        </Button>
                      </div>
                    </Form>
                  </Offcanvas.Body>
                </Offcanvas>

                <Offcanvas show={showUpdateOffcanvas} onHide={handleCloseUpdate} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{t("Folder.updateFolder")}</Offcanvas.Title>
                  </Offcanvas.Header>
                  <hr className='m-0 border-[var(--modern-border)] opacity-100' />
                  <Offcanvas.Body>
                    <Form onSubmit={handleUpdateFormSubmit}>
                      <Form.Group className='mb-3' controlId='updateFolderName'>
                        <Form.Label>
                          {t("Folder.folderName")}
                          <span className='text-danger mx-1'>*</span>
                        </Form.Label>
                        <Form.Control type='text' name='FolderName' value={updateFormData.FolderName} onChange={handleUpdateInputChange} placeholder={t("Folder.enterfodlerName")} />
                      </Form.Group>
                      <Form.Group className='mb-3' controlId='updateDescription'>
                        <Form.Label>
                          {t("Folder.Description")}
                          <span className='text-muted mx-1'>({t("createTeam.optional")})</span>
                        </Form.Label>
                        <Form.Control
                          as='textarea'
                          name='Description'
                          value={updateFormData.Description}
                          onChange={handleUpdateInputChange}
                          rows={5}
                          placeholder={t("Folder.enterDescription")}
                          maxLength={500}
                        />
                        {updateFormData.Description.length > 0 && (
                          <small className={`d-block mt-1 ${updateFormData.Description.length >= 500 ? "text-danger" : "text-muted"}`}>{t("createDepartment.descriptionTooLong")}</small>
                        )}
                      </Form.Group>
                      <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
                        <Button variant='none' className='resetBtn' onClick={handleCloseUpdate}>
                          {t("Folder.Cancel")}
                        </Button>
                        <Button type='submit' variant='none' className='applyBtn'>
                          {t("Folder.Create")}
                        </Button>
                      </div>
                    </Form>
                  </Offcanvas.Body>
                </Offcanvas>

                <Offcanvas show={showFolderCanvas} onHide={handleClosesSubFolder} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{t("Folder.CreateFolder")}</Offcanvas.Title>
                  </Offcanvas.Header>
                  <hr className='m-0 border-[var(--modern-border)] opacity-100' />
                  <Offcanvas.Body>
                    <Form onSubmit={handleCreateSubFolder}>
                      <Form.Group className='mb-3' controlId='folderName'>
                        <Form.Label>
                          {" "}
                          {t("Folder.folderName")}
                          <span className='text-danger mx-1'>*</span>
                        </Form.Label>
                        <Form.Control type='text' name='FolderName' value={formDataSubFolder.FolderName} onChange={handleSubFolderInputChange} placeholder={t("Folder.enterfodlerName")} />
                      </Form.Group>
                      <Form.Group className='mb-3' controlId='description'>
                        <Form.Label>
                          {t("Folder.Description")}
                          <span className='text-muted mx-1'>({t("createTeam.optional")})</span>
                        </Form.Label>
                        <Form.Control
                          as='textarea'
                          name='Description'
                          value={formDataSubFolder.Description}
                          onChange={handleSubFolderInputChange}
                          rows={5}
                          placeholder={t("Folder.enterDescription")}
                          maxLength={500}
                        />
                        {formDataSubFolder.Description.length > 50 && <small className='text-danger'>{t("createDepartment.descriptionTooLong")}</small>}
                      </Form.Group>
                      <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
                        <Button variant='none' className='resetBtn' onClick={handleClosesSubFolder}>
                          {t("Folder.Cancel")}
                        </Button>
                        <Button type='submit' variant='none' disabled={!formDataSubFolder.FolderName.trim()} className='applyBtn'>
                          {t("Folder.Create")}
                        </Button>
                      </div>
                    </Form>
                  </Offcanvas.Body>
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
                <Modal.Header>
                  <Modal.Title>{selectedFolderTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='p-4'>
                  <h6>{t("Folder.Description")}</h6>
                  <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedDescription}</p>
                </Modal.Body>
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
