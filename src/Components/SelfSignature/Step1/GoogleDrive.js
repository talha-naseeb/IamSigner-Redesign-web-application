import React, { useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import uploadFlowService from "@/services/uploadFlowService";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";

function UploadFromGoogleDrive({ uploadedFiles, setUploadedFiles, masterDocIDs, setMasterDocIDs, fileToggleStates, setFileToggleStates, registerSignID, setRegisterSignID, email }) {
  const { t } = useTranslation();
  const [openPicker] = useDrivePicker();
  const [isLoading, setIsLoading] = useState(false);
  const client_Id = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const developer_Key = process.env.REACT_APP_GOOGLE_DEVELOPER_KEY;

  const handleOpenPicker = () => {
    alert("The file you want to access must be public...");

    openPicker({
      clientId: client_Id,
      developerKey: developer_Key,
      viewId: "DOCS",
      showUploadView: false,
      showUploadFolders: false,
      supportDrives: true,
      multiselect: false,
      callbackFunction: (data) => {
        if (data.action === "picked") {
          convertToBase64(data.docs[0].id, data.docs[0].name);
        } else if (data.action === "cancel") {
          toast.info(t("User clicked cancel/close button"));
        }
      },
    });
  };

  const convertToBase64 = async (fileId, fileName) => {
    setIsLoading(true);
    try {
      const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${developer_Key}`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64data = reader.result.split(",")[1];
          handleFileUpload(base64data, fileName);
        };

        reader.readAsDataURL(blob);
      } else {
        toast.error(t("uploadDocFlow.googleerrorUploadFile"));
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.googleerrorUploadFile"));
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (base64data, fileName) => {
    const fileExtension = fileName.split(".").pop();

    const body = {
      ReferenceNumber: "",
      Description: "",
      CreatedBy: email,
      IsSerial: true,
      isOnlySigner: false,
      registerSignID: registerSignID,
      PrimaryDocs: [
        {
          DocName: fileName,
          DocExtension: fileExtension,
          DocFile: base64data,
          IsPasswordProtected: false,
        },
      ],
    };

    try {
      const response = await uploadFlowService.registerDocs(body);

      if (response.data.successStatus) {
        setRegisterSignID(response.data.response.registerSignID);
        localStorage.setItem("registerSignID", response.data.response.registerSignID);
        setMasterDocIDs((prevIDs) => [...prevIDs, response.data.response.masterDocs[0].masterDocIDs]);
        setUploadedFiles([...uploadedFiles, fileName]);
        setFileToggleStates((prevStates) => [...prevStates, false]);
        toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
      } else {
        toast.error(t("uploadDocFlow.apireqFailed"));
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.errorUploadFile"));
    }

    setIsLoading(false);
  };

  return (
    <div>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div className='uplad_box' onClick={handleOpenPicker}>
        <div className='upload_trigger_bx'>
          <Icons.GoogleDrive />
          <div className='upload_doc_part'>
            <Form.Group controlId='file-input-add' className='file-upload_temp'>
              <Form.Label>{t("uploadDocFlow.googleDrive")}</Form.Label>
            </Form.Group>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadFromGoogleDrive;
