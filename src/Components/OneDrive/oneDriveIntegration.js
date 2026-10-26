import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import oneDriveIcon from "../../assets/images/oneDriveIntegrate.svg";
import { Form } from "@/Components/UI/shadcnCompat";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import axios from "../../Api/api";
import uploadFlowService from "@/services/uploadFlowService";
import UploadSourceCard from "@/Components/Common/CloudPickers/UploadSourceCard";

// Function to convert blob to Base64
const blobToBase64 = (blob) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function OneDriveIntegration({ uploadedFiles, setUploadedFiles, masterDocIDs, setMasterDocIDs, fileToggleStates, setFileToggleStates, registerSignID, setRegisterSignID, email }) {
  const { instance } = useMsal();
  const { t } = useTranslation("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    instance
      .loginPopup(loginRequest)
      .then(() => {
        launchOneDrivePicker();
      })
      .catch((e) => {
        console.error("Login failed:", e);
        toast.error(t("uploadDocFlow.loginFailed"));
      });
  };

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/",
    });
  };

  const fetchFileAsBase64 = async (downloadUrl, fileName) => {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();
      return await blobToBase64(blob);
    } catch (error) {
      console.error("Error fetching and converting file to Base64:", error);
      return null;
    }
  };

  const launchOneDrivePicker = () => {
    if (window.OneDrive) {
      const odOptions = {
        clientId: process.env.REACT_APP_ONEDRIVE_CLIENTID,
        action: "share",
        multiSelect: true,
        openInNewWindow: true,
        success: async function (files) {
          if (files && files.value) {
            const base64Files = [];
            for (const file of files.value) {
              const downloadUrl = file["@microsoft.graph.downloadUrl"];
              const base64File = await fetchFileAsBase64(downloadUrl, file.name);
              if (base64File) {
                base64Files.push({
                  name: file.name,
                  base64: base64File,
                  MasterDocID: null,
                });
              }
            }
            handleFileUpload(base64Files);
          }
          handleLogout();
        },
        cancel: function () {},
        error: function (e) {
          console.error("Error from OneDrive Picker:", e);
          toast.info(t("uploadDocFlow.oneDriveError"));
        },
      };

      try {
        window.OneDrive.open(odOptions);
      } catch (error) {
        console.error("Error launching OneDrive Picker:", error);
        toast.info(t("uploadDocFlow.oneDriveError"));
      }
    } else {
      console.error("SDK not laoded yet!");
    }
  };

  window.addEventListener("message", function (e) {
    if (typeof e.data === "string" && e.data.indexOf("[OneDrive-FromPicker]") !== -1) {
    } else {
      console.warn("Unexpected message data type:", typeof e.data);
    }
  });

  const handleFileUpload = async (base64Files) => {
    const duplicateFiles = base64Files.filter((file) => uploadedFiles.includes(file.name));
    if (duplicateFiles.length > 0) {
      toast.error(t("uploadDocFlow.alreadyExits"));
      return;
    }
    setIsLoading(true);

    const body = {
      ReferenceNumber: "",
      Description: "",
      CreatedBy: email,
      IsSerial: false,
      IsBulk: false,
      isOnlySigner: false,
      registerSignID: registerSignID,
      PrimaryDocs: base64Files.map((uploadedFile) => {
        const fileExtension = uploadedFile.name.split(".").pop();
        return {
          DocName: uploadedFile.name,
          DocExtension: fileExtension,
          DocFile: uploadedFile.base64,
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
        setUploadedFiles([...uploadedFiles, ...base64Files.map((uploadedFile) => uploadedFile.name)]);
        setFileToggleStates((prevStates) => [...prevStates, ...base64Files.map(() => false)]);

        toast.success(t("uploadDocFlow.fileuploadSuccessfully"));
      } else {
        toast.error(t("uploadDocFlow.apireqFailed"));
      }
    } catch (error) {
      console.error("Error uploading file to API:", error);
      if (error.response && error.response.status === 403) {
        toast.info(t("uploadDocFlow.oneDriveError"));
      } else {
        toast.info(t("uploadDocFlow.oneDriveError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <UploadSourceCard onClick={handleLogin}>
        <img alt='oneDriveIcon' src={oneDriveIcon} className='h-7 w-7 shrink-0 object-contain' />
        <Form.Group controlId='file-input-add' className='space-y-0'>
          <Form.Label className='m-0 cursor-pointer whitespace-nowrap text-sm font-medium'>{t("uploadDocFlow.OneDriveDocuments")}</Form.Label>
          <Form.Control className='!sr-only' name='file' accept='.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx' multiple />
        </Form.Group>
      </UploadSourceCard>
    </div>
  );
}
