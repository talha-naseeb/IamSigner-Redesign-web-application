import React, { useState, useEffect } from "react";
import userService from "@/services/userService";
import { Offcanvas, Form, Button } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";

const AddDocuments = ({ show, handleClose, MasterDocID }) => {
  const [getFolders, setGetFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    GetFoldersOnly();
  }, []);

  const GetFoldersOnly = async () => {
    try {
      const response = await userService.getFolders();
      setGetFolders(response.data.response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFolderSelection = (folderID) => {
    setSelectedFolder(folderID === selectedFolder ? null : folderID);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await assignDocumentsToFolder(selectedFolder);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.assigned"));
        handleCancel();
      } else {
        toast.error(t("Folder.notassigned"));
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const assignDocumentsToFolder = async (selectedFolderId) => {
    try {
      return await userService.assignDocToFolder({
        FolderID: selectedFolderId,
        Documents: [{ MasterDocID }],
      });
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    setSelectedFolder(null);
    setFilter("");
    handleClose();
  };

  const filteredFolders = getFolders.filter((folder) => folder.folderName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>

      <Offcanvas show={show} onHide={handleCancel} placement='end' scroll={true}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("Folder.assignDocFolder")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr className='m-0 border-[var(--modern-border)] opacity-100' />
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Control type='text' placeholder={t("Folder.filterFolderName")} value={filter} onChange={(e) => setFilter(e.target.value)} />

            {filteredFolders.length === 0 ? (
              <>
                <div className='text-center'>
                  <Icons.Folders size={100} />
                  <p>{t("Folder.nofolder")}</p>
                </div>
              </>
            ) : (
              <>
                {filteredFolders.map((folder) => (
                  <div
                    className={`my-2.5 flex items-center gap-4 rounded-xl border bg-card p-2.5 font-medium text-foreground transition-colors [&_.form-check-label]:mx-[5px] [&_.form-check-label]:mt-0.5 ${
                      selectedFolder === folder.folderID
                        ? "border-[var(--modern-violet)] bg-[var(--modern-violet-soft)] text-[var(--modern-violet)]"
                        : "border-border"
                    }`}
                    key={folder.folderID}
                    onClick={() => handleFolderSelection(folder.folderID)}
                  >
                    <Form.Check type='checkbox' id={`doc-checkbox-${folder.folderID}`} checked={selectedFolder === folder.folderID} readOnly />
                    <div className='d-flex gap-2 align-items-center'>
                      {selectedFolder === folder.folderID ? <Icons.FolderCheck size={24} color="var(--modern-violet)"/> : <Icons.Folders size={24} />}
                      {folder.folderName}
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
              <Button variant='none' className='resetBtn' onClick={handleCancel} disabled={!selectedFolder}>
                {t("Folder.Cancel")}
              </Button>
              <Button type='submit' variant='none' className='applyBtn' disabled={!selectedFolder}>
                {t("Folder.addFolder")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AddDocuments;
