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
import SignOrder from "@/Components/CommonModals/SignOrder/SignOrder";
import { Table, TableBody, TableCell, TableContainer, TableEmptyState, TableHead, TableRow, Paper, Pagination, UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";

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
    <div className='folder-route folder-document-route container my-3 text-foreground [font-family:var(--modern-font-ui)]'>

      <button className='templateButton' onClick={() => setShowFolder(true)}>
        {t("Folder.addSubFolder")}
      </button>

      <div className='container mt-3 rounded-2xl border border-border bg-card p-3 py-3 text-foreground max-sm:p-4'>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='d-flex align-items-center gap-2'>
            <Icons.Back className={document.documentElement.dir === "rtl" ? "scale-x-[-1]" : ""} onClick={goBack} style={{ cursor: "pointer" }} />
            {data.length === 0 ? (
              <>
                <Icons.Folders size={30} />
              </>
            ) : (
              <>
                <Icons.FoldersFill size={30} color='var(--modern-violet)' />
              </>
            )}

            <span>
              <label className='mx-2 text-xl font-semibold text-foreground'>
                {folderName}
              </label>
            </span>
          </div>

          <div className='d-flex align-items-center'>
            <div
              className='flex cursor-pointer items-center justify-center gap-2.5 rounded-[10px] border border-border bg-card px-2 py-[3px] text-foreground transition-colors hover:border-[var(--modern-violet)] hover:bg-[var(--modern-violet-soft)] hover:text-[var(--modern-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-violet)]'
              onClick={() => handleAddDocumentClick()}
            >
              {t("Folder.add")}
            </div>
          </div>
        </div>
        <div className='border-b border-[var(--modern-border)] my-4' />

        <TableContainer
          component={Paper}
          className='custom-table-scrollbar rounded-xl border border-[var(--modern-border)]'
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
                      icon={<Icons.Folders size={50} />}
                      title={t("dashboardCardStatuses.notDocsFound")}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell
                      style={{ cursor: row.subFolderID ? "pointer" : "default" }}
                      onClick={(e) => (row.subFolderID ? navigateToViewFiles(row.subFolderName, row.subFolderID) : handleCellClick(e))}
                      className='truncate-cell'
                    >
                      {row.subFolderID ? (
                        <div className='d-flex align-items-center gap-2'>
                          {row.numberOfFiles === "0" ? (
                            <>
                              <Icons.Folders size={25} />
                            </>
                          ) : (
                            <>
                              <Icons.FoldersFill size={30} color='var(--modern-violet)' />
                            </>
                          )}

                          <span className='truncate-cell'>{row.subFolderName}</span>
                        </div>
                      ) : (
                        <div className='d-flex align-items-center gap-2'>
                          <Icons.PDFs size={20} />
                          <span className='truncate-cell'>{row.docName}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{row.subFolderID ? formatDate(row.createdOnFormatted) : formatDate(row.completedDateFormatted)}</TableCell>
                    <TableCell
                      className={`TableCell truncate-cell ${row.subFolderDescription?.length > 50 ? "cursor-pointer" : ""}`}
                      onClick={(e) =>
                        row.subFolderDescription?.length > 50 ? handleDescriptionClick(row.subFolderDescription, row.subFolderID ? row.subFolderName : row.docName) : handleCellClick(e)
                      }
                      style={{ cursor: row.subFolderDescription?.length > 50 ? "pointer" : "" }}
                    >
                      {row.subFolderDescription}
                    </TableCell>
                    <TableCell className='TableCell truncate-cell'>
                      <UserInitialsBadge name={row.subFolderID ? row.subFolderCreatedByName : row.createdByName} />
                    </TableCell>
                    <TableCell className='py-0'>
                      <Dropdown className='align-items-center'>
                        <Dropdown.Toggle as={CustomToggle} />

                        <Dropdown.Menu>
                          {row.subFolderID ? (
                            <>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                <Icons.PenEdit size={20} />
                                {t("Folder.update")}
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.subFolderName, row.subFolderID)}>
                                <Icons.View size={20} />
                                {t("Folder.view")}
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocSubFolder(row.subFolderID)}>
                                <Icons.Upload size={20} />
                                {t("Folder.add")}
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteFolderModal(row.subFolderID)}>
                                <Icons.DeleteAction size={20} />
                                {t("Folder.delete")}
                              </Dropdown.Item>
                            </>
                          ) : (
                            <>
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
        <Modal.Header>
          <Modal.Title>{selectedFolderTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-4'>
          <h6>{t("Folder.Description")}</h6>
          <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedDescription}</p>
        </Modal.Body>
      </Modal>

      <AddCompletedDocuments show={showAddDocument} handleClose={handleAddDocumentClose} folderId={selectedFolderId} />
      <AddCompletedToSubFolder show={showAddDocumentSub} handleClose={handleAddDocSubClose} subFolderID={selectedSubFolderId} />

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
              {updateFormData.Description?.length > 0 && (
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

      <Offcanvas show={showFolder} onHide={handleCloseOffcanvas} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("Folder.CreateFolder")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr className='m-0 border-[var(--modern-border)] opacity-100' />
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3' controlId='folderName'>
              <Form.Label>
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
              <Form.Control as='textarea' name='Description' value={formData.Description} onChange={handleInputChange} rows={5} placeholder={t("Folder.enterDescription")} maxLength={500} />
              {formData.Description?.length > 0 && (
                <small className={`d-block mt-1 ${formData.Description.length >= 500 ? "text-danger" : "text-muted"}`}>{t("createDepartment.descriptionTooLong")}</small>
              )}
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
