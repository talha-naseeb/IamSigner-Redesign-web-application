import React, { useState, useEffect } from "react";
import { ListGroup, Offcanvas, Form, Button, InputGroup } from "@/Components/UI/shadcnCompat";
import userService from "@/services/userService";
import { Icons } from "@/assets/Icons";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const FolderSelection = ({ show, onClose, onSelectFolder }) => {
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [selectedFolderID, setSelectedFolderID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (show) {
      fetchFolders();
    }
  }, [show]);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getFolders();
      if (response.data.statusCode === "1") {
        setFolders(response.data.response);
        setFilteredFolders(response.data.response);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = (folderID, folderName) => {
    setSelectedFolderID(folderID);
    onSelectFolder(folderID, folderName);
  };

  const handleSave = () => {
    if (selectedFolderID) {
      toast.success(t("uploadDocFlow.FolderSelectedSuccess"));
      onClose();
    }
  };

  const handleUnselect = () => {
    setSelectedFolderID(null);
    onSelectFolder(null, "");
    onClose();
  };

  // Handle search input change
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = folders.filter((folder) => folder.folderName.toLowerCase().includes(searchValue));
    setFilteredFolders(filtered);
  };

  return (
    <>
      <Offcanvas show={show} onHide={onClose} placement={document.documentElement.dir === "rtl" ? "start" : "end"}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("uploadDocFlow.Folders")}</Offcanvas.Title>
        </Offcanvas.Header>
        <hr />
        <Offcanvas.Body>
          <InputGroup className='mb-3'>
            <Form.Control type='text' placeholder={t("uploadDocFlow.SearchFolders")} value={searchTerm} onChange={handleSearch} />
          </InputGroup>

          {filteredFolders.length === 0 ? (
            <>
              <div className='text-center'>
                <Icons.Folders size={100} style={{ color: "var(--border-color)" }} />
                <p>{t("Folder.nofolder")}</p>
              </div>
            </>
          ) : (
            <>
              <ListGroup>
                {filteredFolders.map((folder) => (
                  <ListGroup.Item key={folder.folderID} onClick={() => handleFolderSelect(folder.folderID, folder.folderName)} style={{ cursor: "pointer" }}>
                    <Form.Check
                      className='mb-2'
                      type='checkbox'
                      label={
                        <div>
                          <strong>{folder.folderName}</strong>
                          <p className='mb-0'>{folder.description}</p>
                        </div>
                      }
                      checked={folder.folderID === selectedFolderID}
                      onChange={() => handleFolderSelect(folder.folderID, folder.folderName)}
                    />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Offcanvas.Body>
        <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4'>
          <Button className='resetBtn' onClick={handleUnselect}>
            {t("uploadDocFlow.UnSelect")}
          </Button>
          <Button className='applyBtn' onClick={handleSave} disabled={!selectedFolderID}>
            {t("uploadDocFlow.SelectFolder")}
          </Button>
        </div>
      </Offcanvas>
    </>
  );
};

export default FolderSelection;
