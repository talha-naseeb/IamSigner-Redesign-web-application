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
import Loader from "@/Components/CommonModals/Loader/Loader";
import { useParams } from "react-router-dom";
import AddCompletedToSubFolder from "../AddCompletedToSubFolder";

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
            <>
              {showTotalFolder.length === 0 ? null : (
                <Accordion defaultActiveKey='0' className='folder-route folder-subfolder-route my-3 text-foreground [font-family:var(--modern-font-ui)]'>
                  <Accordion.Item eventKey='2'>
                    <Accordion.Header>
                      <div className='d-flex align-items-center gap-3'>
                        <Icons.Folders size={30} />
                        <label style={{ fontSize: "20px", fontWeight: "500" }}>Sub Folders</label>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div>
                        {isLoading && (
                          <div className='loader-overlay'>
                            <Loader />
                          </div>
                        )}

                        <Offcanvas show={showFolder} onHide={handleCloseOffcanvas} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
                          <Offcanvas.Header closeButton>
                            <Offcanvas.Title> {t("Folder.errDeleteFolder")}</Offcanvas.Title>
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
                          <hr />
                          <Offcanvas.Body>
                            <Form onSubmit={handleUpdateFormSubmit}>
                              <Form.Group className='mb-3' controlId='updateFolderName'>
                                <Form.Label> {t("Folder.folderName")}</Form.Label>
                                <Form.Control type='text' name='FolderName' value={updateFormData.FolderName} onChange={handleUpdateInputChange} placeholder={t("Folder.enterfodlerName")} />
                              </Form.Group>
                              <Form.Group className='mb-3' controlId='updateDescription'>
                                <Form.Label>{t("Folder.Description")}</Form.Label>
                                <Form.Control
                                  as='textarea'
                                  name='Description'
                                  value={updateFormData.Description}
                                  onChange={handleUpdateInputChange}
                                  rows={3}
                                  placeholder={t("Folder.enterDescription")}
                                />
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

                        <div>
                          <div className='mb-3 flex justify-end'>
                            <button className='templateButton' onClick={() => setShowFolder(true)}>
                              {t("Folder.createFolder")}
                            </button>
                          </div>

                          <div className='flex w-full flex-col items-start gap-4'>
                            {showTotalFolder.map((row, index) => (
                              <div
                                key={index}
                                className='flex w-full min-w-0 cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-colors hover:border-[var(--modern-violet)] hover:bg-[var(--modern-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--modern-violet)] max-sm:items-start'
                              >
                                <div onClick={() => navigateToViewFiles(row.folderName, row.subFolderID)}>
                                  <div className='flex items-center gap-2'>
                                    {row.numberOfFiles > 0 ? (
                                      <div className='flex flex-col items-start'>
                                        <Icons.Folders size={30} />
                                      </div>
                                    ) : (
                                      <Icons.Folders size={30} />
                                    )}

                                    <span className='m-0 text-lg font-medium'>{row.folderName}</span>
                                  </div>
                                  <p className='mx-5 mb-0'>{row.description}</p>
                                </div>
                                <div className='flex items-center justify-end gap-4 max-sm:gap-2'>
                                  <span className='text-xs'>
                                    {row.numberOfFiles} {t("signaturePage.document")}
                                  </span>
                                  <Dropdown>
                                    <Dropdown.Toggle as={CustomToggle} />

                                    <Dropdown.Menu>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleUpdateClick(row)}>
                                        <Icons.EditSquare size={20} />
                                        {t("Folder.update")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleViewDocuments(row.folderName, row.subFolderID)}>
                                        <Icons.View size={20} />
                                        {t("Folder.view")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleAddDocumentClick(row.subFolderID)}>
                                        <Icons.FolderPlus size={20} />
                                        {t("Folder.add")}
                                      </Dropdown.Item>
                                      <Dropdown.Item className='d-flex gap-2 align-items-center' onClick={() => handleDeleteFolderModal(row.subFolderID)}>
                                        <Icons.DeleteAction size={20} />
                                        {t("Folder.delete")}
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Modal show={showDeleteConfirmatrionFolderModal} onHide={() => setShowDeleteConfirmatrionFolderModal(false)} dialogClassName='custom-modal-width'>
                          <Modal.Header closeButton>
                            <Modal.Title> {t("Folder.deleteConfirmation")}</Modal.Title>
                          </Modal.Header>
                          <Modal.Body className='px-3 py-2'>
                            {t("Folder.sureDeleteFolder")}
                            <div className=' mt-4 d-flex justify-content-end gap-5 '>
                              <Button variant='none' className='modalCancelButton' onClick={() => setShowDeleteConfirmatrionFolderModal(false)}>
                                {t("Folder.Cancel")}
                              </Button>
                              <Button className='applyBtn' variant='none' onClick={HandleDeleteFolderOnly}>
                                {t("Folder.Confirm")}
                              </Button>
                            </div>
                          </Modal.Body>
                        </Modal>

                        <AddCompletedToSubFolder show={showAddDocument} handleClose={handleAddDocumentClose} subFolderID={selectedFolderId} />
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              )}
            </>
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}

export default SubFolder;
