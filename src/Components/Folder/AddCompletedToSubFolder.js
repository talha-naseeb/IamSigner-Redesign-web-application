import React, { useState, useEffect } from "react";
import userService from "@/services/userService";
import { Offcanvas, Form, Button } from "react-bootstrap";
import "./style.css";
import { toast } from "react-toastify";
import { Icons } from "@/assets/Icons";
import { useTranslation } from "react-i18next";

const AddCompletedToSubFolder = ({ show, handleClose, subFolderID }) => {
  const [completedDocuments, setCompletedDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [filter, setFilter] = useState("");
  const [isCreateDisabled, setIsCreateDisabled] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchCompletedDocuments();
  }, []);

  useEffect(() => {
    setIsCreateDisabled(selectedDocuments.length === 0);
  }, [selectedDocuments]);

  const fetchCompletedDocuments = async () => {
    try {
      const response = await userService.getCompletedMasterDocList();
      if (response.data.statusCode === "1") {
        setCompletedDocuments(response.data.response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDocumentSelection = (masterDocId) => {
    setSelectedDocuments((prevSelected) => {
      if (prevSelected.includes(masterDocId)) {
        return prevSelected.filter((id) => id !== masterDocId);
      } else {
        return [...prevSelected, masterDocId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await assignDocumentsToFolder(selectedDocuments);
      if (response.data.statusCode === "1") {
        toast.success(t("Folder.assigned"));
        handleCancel();
      } else {
        toast.error(t("Folder.notassigned"));
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const assignDocumentsToFolder = async (selectedDocs) => {
    try {
      return await userService.assignDocToSubFolder({
        SubFolderID: subFolderID,
        Documents: selectedDocs.map((docId) => ({ MasterDocID: docId })),
      });
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    setSelectedDocuments([]);
    setFilter("");
    handleClose();
  };

  const handleSearch = (e) => {
    setFilter(e.target.value);
  };

  const filteredDocuments = completedDocuments.filter((doc) => doc.docName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <Offcanvas show={show} onHide={handleCancel} placement={document.documentElement.dir === "rtl" ? "start" : "end"} scroll={true}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{t("Folder.addCompletedDocs")}</Offcanvas.Title>
      </Offcanvas.Header>
      <hr style={{ margin: " auto 0", borderColor: "black" }} />

      <Offcanvas.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Control type='text' placeholder={t("Folder.searchDocs")} value={filter} onChange={handleSearch} />
          {filteredDocuments.map((doc) => (
            <div className={`DocsOffcanvas ${selectedDocuments.includes(doc.masterDocID) ? "active" : ""}`} key={doc.masterDocID}>
              <Form.Check type='checkbox' id={`doc-checkbox-${doc.masterDocId}`} onChange={() => handleDocumentSelection(doc.masterDocID)} checked={selectedDocuments.includes(doc.masterDocID)} />
              <div className='d-flex gap-1 align-items-center'>
                {selectedDocuments.includes(doc.masterDocID) ? <Icons.PDFCheck size={24} color='#19d157' /> : <Icons.PDF size={24} />}
                {doc.docName}
              </div>
            </div>
          ))}

          <div className='newComment d-flex align-items-center justify-content-between w-100 p-3 py-4 bg-white'>
            <Button variant='none' className='resetBtn' onClick={handleCancel}>
              {t("Folder.Cancel")}
            </Button>
            <Button type='submit' variant='none' className='applyBtn' disabled={isCreateDisabled}>
              {t("Folder.add")}
            </Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default AddCompletedToSubFolder;
