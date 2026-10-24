import React, { useState, useEffect } from "react";
import DropboxChooser from "react-dropbox-chooser";
import { Form } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import uploadFlowService from "@/services/uploadFlowService";
import templateService from "@/services/templateService";
import { useTranslation } from "react-i18next";
import Loader from "@/Components/CommonModals/Loader/Loader";
import { Icons } from "@/assets/Icons";
import UploadSourceCard from "./UploadSourceCard";

function DropboxPicker({
  uploadedFiles = [],
  setUploadedFiles,
  masterDocIDs = [],
  setMasterDocIDs,
  fileToggleStates = [],
  setFileToggleStates,
  registerSignID,
  setRegisterSignID,
  email,
  onFileSelected,
  setTemplateID,
  TemplateID,
  templateScope,
  templateName,
  isTemplate = false,
}) {
  const { t } = useTranslation();

  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = (files) => {
    if (files && files.length > 0) {
      setSelectedFileUrl(files[0].link);
      setSelectedFileName(files[0].name);
      if (typeof onFileSelected === "function") {
        onFileSelected(files[0].link);
      }
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
      console.error("Error downloading file from Dropbox:", error);
      toast.error(t("uploadDocFlow.errorUploadFile"));
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fileName, base64String) => {
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
              DocFile: base64String,
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
          isOnlySigner: false,
          IsBulk: false,
          registerSignID: registerSignID,
          PrimaryDocs: [
            {
              DocName: fileName,
              DocExtension: fileExtension,
              DocFile: base64String,
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
      console.error("Error uploading Dropbox file:", error);
      toast.error(t("uploadDocFlow.errorUploadFile"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFileUrl && selectedFileName) {
      const modifiedUrl = selectedFileUrl
        .replace("www.dropbox.com", "dl.dropboxusercontent.com")
        .replace("?dl=0", "?raw=1");
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
      <DropboxChooser appKey={APP_KEY} success={handleSuccess} cancel={handleCancel} multiselect={false}>
        <UploadSourceCard>
          <Icons.Dropbox alt='Dropbox Image' />
          <Form.Group controlId='file-input-add' className='space-y-0'>
            <Form.Label className='m-0 cursor-pointer whitespace-nowrap text-sm font-medium'>{t("uploadDocFlow.dropbox")}</Form.Label>
            <Form.Control
              className='!sr-only'
              type='file'
              name='file'
              accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx'
              readOnly
            />
          </Form.Group>
        </UploadSourceCard>
      </DropboxChooser>
    </>
  );
}

export default DropboxPicker;
