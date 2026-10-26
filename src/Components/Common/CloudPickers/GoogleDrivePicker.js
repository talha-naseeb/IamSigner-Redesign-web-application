import React, { useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import axios from "axios";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { Form } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import UploadSourceCard from "./UploadSourceCard";

function GoogleDrivePicker({
  uploadedFiles = [],
  setUploadedFiles,
  masterDocIDs = [],
  setMasterDocIDs,
  fileToggleStates = [],
  setFileToggleStates,
  registerSignID,
  setRegisterSignID,
  email,
  setTemplateID,
  TemplateID,
  templateScope,
  templateName,
  isTemplate = false,
}) {
  const { t } = useTranslation();
  const [openPicker] = useDrivePicker();
  const [isLoading, setIsLoading] = useState(false);
  const client_Id = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const developer_Key = process.env.REACT_APP_GOOGLE_DEVELOPER_KEY;

  const handleOpenPicker = () => {
    openPicker({
      clientId: client_Id,
      developerKey: developer_Key,
      viewId: "DOCS",
      showUploadView: false,
      showUploadFolders: false,
      supportDrives: true,
      multiselect: false,
      callbackFunction: (data) => {
        if (data.action === "picked" && data.docs && data.docs.length > 0) {
          convertToBase64(data.docs[0].id, data.docs[0].name);
        } else if (data.action === "cancel") {
          toast.info(t("User clicked cancel/close button") || "File selection cancelled");
        }
      },
    });
  };

  const convertToBase64 = async (fileId, fileName) => {
    setIsLoading(true);
    try {
      const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${developer_Key}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      if (response.status === 200) {
        const arrayBuffer = response.data;
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
      console.error("Error fetching Google Drive file:", error);
      toast.error(t("uploadDocFlow.googleerrorUploadFile"));
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (base64data, fileName) => {
    const isDuplicate = uploadedFiles.includes(fileName);
    if (isDuplicate) {
      toast.error(t("uploadDocFlow.duplicateFileError") || "File with the same name already exists.");
      setIsLoading(false);
      return;
    }

    const fileExtension = fileName.split(".").pop();
    const isTemplateFlow = Boolean(setTemplateID || isTemplate || templateName);

    try {
      if (isTemplateFlow) {
        const body = {
          TemplateName: templateName,
          TemplateID: TemplateID,
          Scope: templateScope === "Individual" ? "I" : "B",
          PrimaryDocs: [
            {
              DocName: fileName,
              DocExtension: fileExtension,
              DocFile: base64data,
              IsPasswordProtected: false,
            },
          ],
        };

        const response = await templateService.createTemplateDoc(body);
        if (response.data.successStatus) {
          if (setTemplateID) setTemplateID(response.data.response.templateID);
          if (setMasterDocIDs && response.data.response.masterDocs?.[0]?.masterDocIDs) {
            setMasterDocIDs((prev) => [...prev, response.data.response.masterDocs[0].masterDocIDs]);
          }
          if (setUploadedFiles) setUploadedFiles((prev) => [...prev, fileName]);
          if (setFileToggleStates) setFileToggleStates((prev) => [...prev, false]);
          toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
        } else {
          toast.error(t("uploadDocFlow.apireqFailed"));
        }
      } else {
        const body = {
          ReferenceNumber: "",
          Description: "",
          CreatedBy: email,
          IsSerial: false,
          IsBulk: false,
          isOnlySigner: false,
          registerSignID: registerSignID,
          PrimaryDocs: [
            {
              DocName: fileName,
              DocExtension: fileExtension,
              DocFile: base64data,
              IsPasswordProtected: false,
              IsBulk: false,
            },
          ],
        };

        const response = await uploadFlowService.registerDocs(body);
        if (response.data.successStatus) {
          if (setRegisterSignID) {
            setRegisterSignID(response.data.response.registerSignID);
            localStorage.setItem("registerSignID", response.data.response.registerSignID);
          }
          if (setMasterDocIDs && response.data.response.masterDocs?.[0]?.masterDocIDs) {
            setMasterDocIDs((prev) => [...prev, response.data.response.masterDocs[0].masterDocIDs]);
          }
          if (setUploadedFiles) setUploadedFiles((prev) => [...prev, fileName]);
          if (setFileToggleStates) setFileToggleStates((prev) => [...prev, false]);
          toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
        } else {
          toast.error(t("uploadDocFlow.apireqFailed"));
        }
      }
    } catch (error) {
      console.error("Error uploading Google Drive file:", error);
      toast.error(t("uploadDocFlow.googleerrorUploadFile"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <UploadSourceCard onClick={handleOpenPicker} role='button' tabIndex={0}>
        <Icons.GoogleDrive alt='Google Drive Image' />
        <Form.Group controlId='file-input-add-gdrive' className='space-y-0'>
          <Form.Label className='m-0 cursor-pointer whitespace-nowrap text-sm font-medium'>{t("uploadDocFlow.googledrive")}</Form.Label>
          <Form.Control
            className='!sr-only'
            type='file'
            name='file'
            accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx'
            readOnly
          />
        </Form.Group>
      </UploadSourceCard>
    </>
  );
}

export default GoogleDrivePicker;
