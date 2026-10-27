import React, { useEffect, useState } from "react";
import userService from "@/services/userService";
import { Offcanvas as Offcanvas } from "@/Components/UI/shadcnCompat";
import { Button, Form, Dropdown, Accordion } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/Components/UI/shadcnCompat";
import { Icons } from "@/assets/Icons";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";

import { useUser } from "@/Context/UserContext";
import UserLisence from "@/Components/UserLisence/UserLisence";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import AddCompletedToSubFolder from "../AddCompletedToSubFolder";
import { Loader2, Folder as FolderIcon } from "lucide-react";

function SubFolder() {
  const [showFolder, setShowFolder] = useState(false);
  const { user, userAccess } = useUser("");
  const [showTotalFolder, setTotalShowFolder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ FolderID: "", FolderName: "", FolderType: "Files", Description: "" });
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showUpdateOffcanvas, setShowUpdateOffcanvas] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ SubFolderID: "", FolderName: "", FolderType: "", Description: "" });
  const [selectedFolderId, setSelectedFolderId] = useState(false);
  const [showDeleteConfirmatrionFolderModal, setShowDeleteConfirmatrionFolderModal] = useState(false);
  const [showDeleteConfirmatrionFolderID, setShowDeleteConfirmatrionFolderID] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { folderId } = useParams();

  const GetFoldersandDocs = async () => {
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.getSubFolder();
      if (response.data.statusCode === "1") {
        const GetFoldersData = response.data.response;
        setTotalShowFolder(GetFoldersData);
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetFoldersandDocs();
  }, []);

  const navigateToViewFiles = (folderName, subFolderID) => {
    const folderPath = `/sub-folders/${folderName}/${subFolderID}`;
    // console.log("data", folderName, subFolderID);
    navigate(folderPath);
  };

  const handleViewDocuments = (folderName, subFolderID) => {
    setSelectedFolderId(folderName);
    // console.log("data", folderName, subFolderID);
    navigate(`/sub-folders/${folderName}/${subFolderID}`);
  };

  const handleAddDocumentClick = (folderID) => {
    setSelectedFolderId(folderID);
    setShowAddDocument(true);
  };

  const handleAddDocumentClose = () => {
    GetFoldersandDocs();
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
      const SubFolderData = {
        ...formData,
        FolderID: folderId,
      };
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.createSubFolder(SubFolderData);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.createFolderSuccess"));
        setFormData({ FolderName: "", Description: "" });
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
    setShowFolder(false);
  };

  const handleUpdateFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setIsLoading(true);
      const response = await userService.updateSubFolder(updateFormData);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.folderUpdateSuccess"));
        GetFoldersandDocs();
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
    const { subFolderID, folderName, description, folderType } = row;
    setUpdateFormData({ SubFolderID: subFolderID, FolderName: folderName, Description: description, FolderType: folderType });
    setShowUpdateOffcanvas(true);
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
        GetFoldersandDocs();
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error(t("Folder.errDeleteFolder"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolderModal = (subFolderID) => {
    setShowDeleteConfirmatrionFolderID(subFolderID);
    setShowDeleteConfirmatrionFolderModal(true);
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
            <div className='folder-route folder-subfolder-route container mx-auto mt-4 px-3 sm:px-6 text-foreground [font-family:var(--modern-font-ui)]'>
              <div className='rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] p-5 md:p-6 text-foreground'>
                {/* Top Header Toolbar */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--modern-border)]'>
                  <div className='flex items-center gap-3.5'>
                    <div className='w-11 h-11 rounded-xl bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_25%,transparent)] flex items-center justify-center shrink-0'>
                      <FolderIcon size={22} className='text-[var(--theme-color)]' />
                    </div>
                    <div>
                      <div className='flex items-center gap-2.5'>
                        <h1 className='text-lg md:text-xl font-bold text-[var(--modern-text)] tracking-tight m-0'>
                          {t("Folder.SubFolder")}
                        </h1>
                        <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                          {showTotalFolder.length}
                        </span>
                      </div>
                      <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5'>
                        {t("Folder.manageFoldersSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2.5 self-end sm:self-center'>
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

                {showTotalFolder.length === 0 ? (
                  <div className='py-12 flex flex-col items-center justify-center text-center'>
                    <div className='w-14 h-14 rounded-2xl bg-[var(--modern-raised)] border border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-muted)] mb-3'>
                      <FolderIcon size={28} />
                    </div>
                    <h3 className='text-sm font-semibold text-[var(--modern-text)] mb-1'>{t("Folder.nofolder")}</h3>
                    <p className='text-xs text-[var(--modern-muted)] max-w-sm m-0'>{t("Folder.manageFoldersSubtitle")}</p>
                  </div>
                ) : (
                  <div className='flex w-full flex-col items-start gap-3 mt-5'>
                    {showTotalFolder.map((row, index) => (
                      <div
                        key={index}
                        className='flex w-full min-w-0 cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] px-4 py-3.5 text-foreground transition-colors hover:border-[var(--theme-color)] hover:bg-[var(--modern-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-color)] max-sm:items-start group'
                      >
                        <div onClick={() => navigateToViewFiles(row.folderName, row.subFolderID)} className='flex items-center gap-3.5 min-w-0'>
                          <div className='w-10 h-10 rounded-xl bg-[var(--modern-primary-bg)] text-[var(--theme-color)] border border-[color-mix(in_srgb,var(--theme-color)_20%,transparent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                            {row.numberOfFiles > 0 ? (
                              <Icons.FoldersFill size={20} color='var(--theme-color)' />
                            ) : (
                              <FolderIcon size={18} className='text-[var(--theme-color)]' />
                            )}
                          </div>
                          <div className='min-w-0'>
                            <span className='font-semibold text-sm text-[var(--modern-text)] group-hover:text-[var(--theme-color)] transition-colors truncate block'>
                              {row.folderName}
                            </span>
                            {row.description && (
                              <p className='text-xs text-[var(--modern-muted)] m-0 mt-0.5 truncate'>
                                {row.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center justify-end gap-3 shrink-0'>
                          <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--modern-raised)] border border-[var(--modern-border)] text-[var(--modern-muted)]'>
                            {row.numberOfFiles} {t("Folder.files")}
                          </span>
                          <Dropdown>
                            <Dropdown.Toggle as={CustomToggle} />

                            <Dropdown.Menu>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                <Icons.EditSquare size={18} />
                                <span>{t("Folder.update")}</span>
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.folderName, row.subFolderID)}>
                                <Icons.View size={18} />
                                <span>{t("Folder.view")}</span>
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocumentClick(row.subFolderID)}>
                                <Icons.FolderPlus size={18} />
                                <span>{t("Folder.add")}</span>
                              </Dropdown.Item>
                              <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteFolderModal(row.subFolderID)}>
                                <Icons.DeleteAction size={18} />
                                <span>{t("Folder.delete")}</span>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Modal show={showDeleteConfirmatrionFolderModal} onHide={() => setShowDeleteConfirmatrionFolderModal(false)} dialogClassName='custom-modal-width'>
                  <Modal.Header closeButton className='border-b border-[var(--modern-border)] px-5 py-4'>
                    <Modal.Title className='text-base font-semibold text-[var(--modern-text)]'> {t("Folder.deleteConfirmation")}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className='p-5 text-sm text-[var(--modern-text)]'>
                    <p className='m-0'>{t("Folder.sureDeleteFolder")}</p>
                  </Modal.Body>
                  <Modal.Footer className='border-t border-[var(--modern-border)] px-5 py-3.5 flex items-center justify-end gap-3 bg-[var(--modern-card)]'>
                    <Button 
                      variant='none' 
                      className='px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--modern-border-strong)] text-[var(--modern-text)] bg-[var(--modern-raised)] hover:bg-[var(--modern-border)] active:scale-[0.98] transition-colors shadow-none' 
                      onClick={() => setShowDeleteConfirmatrionFolderModal(false)}
                    >
                      {t("Folder.Cancel")}
                    </Button>
                    <Button 
                      className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition-all shadow-none' 
                      variant='none' 
                      onClick={HandleDeleteFolderOnly}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
                      {t("Folder.Confirm")}
                    </Button>
                  </Modal.Footer>
                </Modal>

                <AddCompletedToSubFolder show={showAddDocument} handleClose={handleAddDocumentClose} subFolderID={selectedFolderId} />

                {/* Create SubFolder Offcanvas */}
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
                    <Form id="create-subfolder-page-form" onSubmit={handleSubmit}>
                      <Form.Group className='mb-3' controlId='subfolderName'>
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
                      <Form.Group className='mb-3' controlId='subfolderDescription'>
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
                      form="create-subfolder-page-form"
                      variant='none' 
                      disabled={!formData.FolderName.trim() || isLoading} 
                      className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none'
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t("Folder.Create")}
                    </Button>
                  </div>
                </Offcanvas>

                {/* Update SubFolder Offcanvas */}
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
                    <Form id="update-subfolder-page-form" onSubmit={handleUpdateFormSubmit}>
                      <Form.Group className='mb-3' controlId='updateSubfolderName'>
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
                      <Form.Group className='mb-3' controlId='updateSubfolderDescription'>
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
                      form="update-subfolder-page-form"
                      variant='none' 
                      disabled={isLoading}
                      className='inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[var(--theme-color)] text-white border-0 hover:bg-[var(--theme-color)] hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all shadow-none'
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {t("Folder.update")}
                    </Button>
                  </div>
                </Offcanvas>
              </div>
            </div>
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}

export default SubFolder;
