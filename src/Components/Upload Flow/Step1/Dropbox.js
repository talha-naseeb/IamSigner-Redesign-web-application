import React, { useState, useEffect } from "react";
import DropboxChooser from "react-dropbox-chooser";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";

function Dropbox({ uploadedFiles, setUploadedFiles, masterDocIDs, setMasterDocIDs, fileToggleStates, setFileToggleStates, registerSignID, setRegisterSignID, email }) {
  const { t } = useTranslation();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSerial, setIsSerial] = useState(true);
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [dropboxFiles, setDropboxFiles] = useState([]);

  const handleSuccess = (files) => {
    setDropboxFiles(files);
    if (files.length === 1) {
      setSelectedFileUrl(files[0].link);
      setSelectedFileName(files[0].name);
    }
  };
  const handleCancel = () => {
    setSelectedFileUrl("");
    setSelectedFileName("");
  };
  const fetchBase64 = async (url, fileName) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = function () {
        const base64String = reader.result.split(",")[1];
        handleFileUpload(fileName, base64String);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error downloading file:", error);
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fileName, base64String) => {
    const base64Files = [];
    base64Files.push({
      name: fileName,
      base64: base64String,
      MasterDocID: null,
    });

    const uploadedFileNames = uploadedFiles.map((fileName) => fileName);
    const duplicateFiles = base64Files.filter((uploadedFile) => uploadedFileNames.includes(uploadedFile.name));
    if (duplicateFiles.length > 0) {
      setUploadErrorMessage("File with the same name already exists.");
      setIsLoading(false);
    } else {
      const body = {
        ReferenceNumber: referenceNumber,
        Description: description,
        CreatedBy: email,
        IsSerial: false,
        isOnlySigner: false,
        IsBulk: false,
        registerSignID: registerSignID,
        PrimaryDocs: base64Files.map((uploadedFile) => {
          const fileExtension = fileName.split(".").pop();

          return {
            DocName: uploadedFile.name,
            DocExtension: fileExtension,
            DocFile: base64String,
            IsPasswordProtected: false,
            IsBulk: false,
          };
        }),
      };

      try {
        const response = await uploadFlowService.registerDocs(body);

        if (response.data.successStatus) {
          setRegisterSignID(response.data.response.registerSignID);
          localStorage.setItem("registerSignID", response.data.response.registerSignID);

          setMasterDocIDs((prevIDs) => [...prevIDs, response.data.response.masterDocs[0].masterDocIDs]);

          const newUploadedFiles = base64Files.map((uploadedFile) => uploadedFile.name);

          setUploadedFiles((prevFiles) => [...prevFiles, ...newUploadedFiles]);

          setFileToggleStates((prevStates) => [...prevStates, ...base64Files.map(() => false)]);

          setUploadErrorMessage("");
          setSelectedFile(null);
          toast.success(t("uploadDocFlow.fileuploadSuccessfully"));

          setIsLoading(false);
        } else {
          setUploadErrorMessage(t("uploadDocFlow.apireqFailed"));
          setIsLoading(false);
        }
      } catch (error) {
        setUploadErrorMessage(t("uploadDocFlow.errorUploadFile"));
        toast.error(t("uploadDocFlow.errorUploadFile"));
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (selectedFileUrl && selectedFileName) {
      const modifiedUrl = selectedFileUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?raw=1");
      fetchBase64(modifiedUrl, selectedFileName);
    }
  }, [selectedFileUrl, selectedFileName]);
  const APP_KEY = process.env.REACT_APP_DROPBOX_APP_KEY;
  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}
      <DropboxChooser s appKey={APP_KEY} success={handleSuccess} cancel={handleCancel} multiselect={false}>
        <div className='uplad_box'>
          <div className='upload_trigger_bx'>
            <Icons.Dropbox alt='Dropbox Image' />
            <div className='upload_doc_part'>
              <Form.Group controlId='file-input-add' className='file-upload_temp'>
                <Form.Label>{t("uploadDocFlow.dropbox")}</Form.Label>
                <Form.Control className='temp_file-input-additional' type='file' name='file' accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx' />
              </Form.Group>
            </div>
          </div>
        </div>
      </DropboxChooser>
    </>
  );
}
export default Dropbox;
