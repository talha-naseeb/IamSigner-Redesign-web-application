import React, { useEffect, useRef, useState } from "react";
import verificationService from "@/services/verificationService";
import "./SignaturePage.css";
import { Button, Col, Dropdown, DropdownButton, Form, Modal, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Comments from "@/Components/Comments/Comments";
import SignatureModal from "./SignatureModal";
import AuditTrailModal from "../AuditTrail/AuditTrailModal";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import LanguageSelector from "@/Components/Language/LanguageSelector";
import PasswordModal from "./PasswordModal";
import ImageThumbnails from "@/Components/ImageThumbnails/ImageThumbnails";
import PageNavigations from "@/Components/PageNavigations";
import ConfirmationModal from "./ConfirmationModal";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "@/Components/CommonModals/Loader/Loader";
import InputEditors from "./InputEditors";
import { getSignatureErrorRoute } from "@/Helpers/signatureErrors";
import { notifyDocumentSigned } from "@/Helpers/documentSignChannel";
import DocumentLoadError from "./DocumentLoadError";

// The verify APIs sometimes return Windows-style paths (backslashes) in pagesPath,
// which browsers treat as literal characters so the page images 404. Normalize them here.
const withNormalizedPageUrls = (items) =>
  Array.isArray(items)
    ? items.map((item) =>
        item && typeof item.pagesPath === "string"
          ? { ...item, pagesPath: item.pagesPath.replace(/\\/g, "/") }
          : item
      )
    : items;

const SignaturePage = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState();
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [selectedSignedDocKey, setSelectedSignedDocKey] = useState();
  const [defaultMasterDocID, setDefaultMasterDocID] = useState(null);
  const [imagesData, setImagesData] = useState([]);
  const [masterDocPagesId, setMasterDocPagesId] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [controlData, setControlData] = useState([]);
  const [signatoriesID, setSignatoriesID] = useState();
  const [email, setEmail] = useState();
  const [controlLocationID, setControlLocationID] = useState();
  const [textEditor, setTextEditor] = useState();
  const [isToastDisplayed, setIsToastDisplayed] = useState(false);
  const [registerSignID, setRegisterSignID] = useState();
  const [auth, setAuth] = useState();
  const [signatoryEmail, setSignatoryEmail] = useState();
  const [signatoryName, setSignatoryName] = useState();
  const [signatoryID, setSignatoryID] = useState();
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [controlName, setControlName] = useState();
  const [controlID, setControlID] = useState();
  const [reason, setReason] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState([]);
  const [enableCompletedButton, setEnableCompletedButton] = useState(false);
  const [fileName, setFileName] = useState();
  const [showATModal, setShowATModal] = useState(false);
  const [auditTrailURL, setAuditTrailURL] = useState("");
  const [allControlData, setAllControlData] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState("");
  const [viewOnly, setViewOnly] = useState();
  const [scrollToCalled, setScrollToCalled] = useState(false);
  const [controlRefs, setControlRefs] = useState([]);
  const [currentControlIndex, setCurrentControlIndex] = useState(0);
  const [sortedControls, setSortedControls] = useState([]);
  const [completedControls, setCompletedControls] = useState(false);
  const [textValue, setTextValue] = useState();
  const [editingStates, setEditingStates] = useState({});
  const [textInput, setTextInput] = useState();
  const indicatorRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [textUpdated, setTextUpdated] = useState(false);
  const [checkboxValues, setCheckboxValues] = useState({});
  const [permissions, setPermissions] = useState();
  const [docLoadError, setDocLoadError] = useState(false);

  useEffect(() => {
    const sortControlsByPage = () => {
      const filteredControls = controlData.filter((control) => {
        const isPendingSignatureStampInitial = control.controlStatus === "Pending" && ["Signature", "Stamp", "Initial", "Image"].includes(control.controlName);

        const isRequiredNumberTextDate = control.controlStatus === "Pending" && ["Number", "Text", "Date", "Checkbox", "Radio"].includes(control.controlName) && control.isRequired;

        return isPendingSignatureStampInitial || isRequiredNumberTextDate;
      });
      const sorted = filteredControls.sort((a, b) => {
        if (a.pagesOrder !== b.pagesOrder) {
          return a.pagesOrder - b.pagesOrder;
        }

        const posYA = parseFloat(a.controlLocationY.replace("px", ""));
        const posYB = parseFloat(b.controlLocationY.replace("px", ""));
        return posYA - posYB;
      });

      setSortedControls(sorted);
    };

    sortControlsByPage();

    scrollToControl(0);
  }, [controlData]);

  const waitForElement = async (id) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Element with ID "${id}" not found within timeout`));
      }, 5000);

      const checkElement = () => {
        const element = document.getElementById(id);
        if (element) {
          clearTimeout(timeout);
          resolve(element);
        } else {
          requestAnimationFrame(checkElement);
        }
      };

      checkElement();
    });
  };

  useEffect(() => {
    if (currentControlIndex !== null && !scrollToCalled) {
      setScrollToCalled(true);
      scrollToNextControl();
    }
  }, [currentControlIndex, scrollToCalled]);

  useEffect(() => {
    const allControlsCompleted = sortedControls.every((control) => control.controlStatus !== "Pending");

    if (allControlsCompleted) {
      setCompletedControls(true);
    } else {
      setCompletedControls(false);
    }
  }, [sortedControls]);

  const scrollToNextControl = async () => {
    if (currentControlIndex === null) return;

    let newIndex = currentControlIndex + 1;
    if (newIndex > sortedControls.length - 1) {
      newIndex = 0;
    }

    setCurrentControlIndex(newIndex);
    const nextcontrol = sortedControls[newIndex];

    if (nextcontrol && nextcontrol.masterDocPagesID !== masterDocPagesId) {
      try {
        setMasterDocPagesId(nextcontrol.masterDocPagesID);
        setSelectedImage(nextcontrol.pagesPath);
        await waitForElement(nextcontrol.controlLocationID);
        scrollToControl(newIndex);
      } catch (error) {
        // console.error("Error:", error);
      }
    } else {
      scrollToControl(newIndex);
    }
  };

  const scrollToControl = async (index) => {
    const control = sortedControls[index];

    const element = control && document.getElementById(control.controlLocationID);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const offsetTop = rect.top + scrollTop - 300;
      const offsetBottom = rect.bottom + scrollTop + 100;

      window.scrollTo({
        top: offsetTop,
        bottom: offsetBottom,
        behavior: "smooth",
      });

      indicatorRef.current.style.top = control.controlLocationY;
    }
  };

  const navigate = useNavigate();
  const mainDocumentRef = useRef(null);

  const currentUrl = window.location.href;
  const parts = currentUrl.split("/");

  const idIndex = parts.indexOf("id");

  useEffect(() => {
    if (idIndex !== -1 && idIndex < parts.length - 1) {
      const pathAfterId = parts.slice(idIndex + 1).join("/");
      setAuth(pathAfterId);
    }
  }, []);

  const handleEnterText = (value) => {
    setTextValue(value);
  };

  const handleDocSelect = async (masterDocID, selectedFolderName, signedDocKey) => {
    const truncatedName = selectedFolderName.length > 10 ? selectedFolderName.slice(0, 7) + "..." : selectedFolderName;
    setSelectedFolder(truncatedName);
    setFileName(selectedFolderName);
    setSelectedMasterDocID(masterDocID);
    setSelectedSignedDocKey(signedDocKey);
    setIsLoading(true);
    getMasterDocPages(masterDocID);
    setIsLoading(false);
    try {
      await verificationService.createSignActivityVerification(
        {
          Status: "Document viewed",
          Message: `${signatoryName} viewed  ${selectedFolderName} document`,
        },
        auth,
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (imagesData && imagesData.length > 0) {
      setSelectedImage(imagesData[0].pagesPath);
      setMasterDocPagesId(imagesData[0].masterDocPagesID);
    }
  }, [imagesData]);

  const handleImageSelect = (image, id) => {
    setMasterDocPagesId(id);
    setSelectedImage(image);
  };

  const openModal = (ControlLocationID, signatoriesID, email, control, controlId, textEditor) => {
    setControlLocationID(ControlLocationID);
    setEmail(email);
    setSignatoriesID(signatoriesID);
    setControlName(control);
    setControlID(controlId);
    setTextEditor(textEditor);
    setShowModal(true);
  };

  useEffect(() => {
    const getControlsData = async () => {
      const files = formData && formData.primaryDocs;
      let accumulatedControlData = [];

      if (Array.isArray(files)) {
        for (const doc of files) {
          try {
            const response = await verificationService.getControlLocationVerification(doc.masterDocID, auth);

            if (response.data.successStatus) {
              accumulatedControlData = accumulatedControlData.concat(withNormalizedPageUrls(response.data.response));
            }
          } catch (error) {}
        }
      } else if (files) {
        try {
          const response = await verificationService.getControlLocationVerification(files.masterDocID, auth);

          if (response.data.successStatus) {
            accumulatedControlData = accumulatedControlData.concat(withNormalizedPageUrls(response.data.response));
          }
        } catch (error) {}
      }
      setAllControlData(accumulatedControlData);
      setIsLoading(false);
    };

    getControlsData();
  }, [formData, auth]);

  useEffect(() => {
    setIsLoading(true);
    const getControlsLocation = async () => {
      try {
        const response = await verificationService.getControlLocationVerification(selectedMasterDocID, auth);

        if (response.data.successStatus) {
          setControlData(withNormalizedPageUrls(response.data.response));
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    if (auth) {
      getControlsLocation();
    }
  }, [selectedMasterDocID, textValue]);

  const getMasterDocPages = async (selectedMasterDocID) => {
    setIsLoading(true);
    setDocLoadError(false);
    try {
      const response = await verificationService.getMasterDocPagesVerification(selectedMasterDocID, auth);

      if (response.data.successStatus && Array.isArray(response.data.response) && response.data.response.length > 0) {
        setImagesData(withNormalizedPageUrls(response.data.response));
        sessionStorage.setItem("masterDocID", selectedMasterDocID);
      } else {
        setImagesData([]);
        setDocLoadError(true);
      }
    } catch (error) {
      setImagesData([]);
      setDocLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const getRegisterSignData = async () => {
      try {
        const response = await verificationService.getRegisterSignDataVerification(auth);

        if (response.data.successStatus) {
          if (!Array.isArray(response.data.response.primaryDocs) || response.data.response.primaryDocs.length === 0) {
            setDocLoadError(true);
            setIsLoading(false);
            return;
          }

          setFormData(response.data.response);

          setRegisterSignID(response.data.response.registerSignID);

          const masterDocIDs = response.data.response.primaryDocs.map((doc) => doc.masterDocID);
          setMasterDocIDs(masterDocIDs);
          setDefaultMasterDocID(masterDocIDs[0]);
          const firstDocument = response.data.response.primaryDocs[0];
          const firstDocName = firstDocument.docName;
          const truncatedName = firstDocName.length > 10 ? firstDocName.slice(0, 7) + ".." : firstDocName;
          setSelectedFolder(truncatedName);

          const firstMasterDocID = firstDocument.masterDocID;
          getMasterDocPages(firstMasterDocID);
          setSelectedMasterDocID(firstMasterDocID);
          const defaultSignedKey = firstDocument.signedDocKey;
          setFileName(firstDocName);
          setSelectedSignedDocKey(defaultSignedKey);

          const pendingSignatory = response.data.response.signatories.find((signatory) => signatory.signStatus === "Pending");

          const language = pendingSignatory.languageType === "Arabic" ? "ar" : "en";
          localStorage.setItem("language", language);

          setSignatoryEmail(pendingSignatory.email);
          setSignatoryName(pendingSignatory.name);
          setViewOnly(pendingSignatory && pendingSignatory.signatureType === "View Only");

          const passwordFile = response.data.response.primaryDocs.some((file) => file.isPasswordProtected);

          if (passwordFile) {
            setPasswordProtected("Document");
            setPasswordModal(true);
          }

          const passwordProtectedSignatory = pendingSignatory.isPasswordProtected;

          if (passwordProtectedSignatory) {
            setSignatoryID(pendingSignatory.signatoriesID);
            setPasswordProtected("Signatory");
            setPasswordModal(true);
          }

          setIsLoading(false);
        }
      } catch (error) {
        const signatureRoute = getSignatureErrorRoute(error?.response?.data?.statusCode);
        if (signatureRoute) {
          navigate(signatureRoute);
        }
        setIsLoading(false);
      }
    };
    if (auth) {
      getRegisterSignData();
    }
  }, [auth]);

  useEffect(() => {
    setIsLoading(true);
    const GetPermissions = async () => {
      try {
        const response = await verificationService.getRegisterSignPermissionVerification(auth);

        if (response.data.successStatus) {
          setPermissions(response.data.response);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    if (auth) {
      GetPermissions();
    }
  }, [auth]);

  useEffect(() => {
    if (isToastDisplayed) {
      toast.info(t("signaturePage.docSignedByOneSignatory"));
    }
  }, [isToastDisplayed]);

  const handleViewAuditTrail = () => {
    const newPdfUrl = `/DownloadAuditTrail/id/${auth}`;
    setAuditTrailURL(newPdfUrl);
    setShowATModal(true);
  };

  const handleFileDownload = async () => {
    setIsLoading(true);

    try {
      const response = await verificationService.downloadDocVerification(selectedSignedDocKey);

      if (response.data.statusCode === "1") {
        const response1 = await fetch(response.data.response.document);
        const blob = await response1.blob();
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${fileName}`;
        downloadLink.click();
        setIsLoading(false);
        toast.success(t("signaturePage.fileDownload"));

        try {
          await verificationService.createSignActivityVerification(
            {
              Status: "file downloaded",
              Message: `${signatoryName} downloaded  ${fileName} file`,
            },
            auth,
          );
        } catch (error) {}
      }
    } catch (error) {
      toast.error(t("signaturePage.fileNotDownload"));
      setIsLoading(false);
    }
  };
  const handleDownloadAuditTrail = async () => {
    setIsLoading(true);

    try {
      const response = await verificationService.downloadDocVerification(selectedSignedDocKey);

      if (response.data.statusCode === "1") {
        const auditTrailUrl = response.data.response.auditTrail;

        if (!auditTrailUrl) {
          toast.info(t("dashboardCardStatuses.noAuditTrail"));
        } else {
          const auditTrailResponse = await fetch(auditTrailUrl);
          if (!auditTrailResponse.ok) {
            throw new Error("Failed to fetch audit trail");
          }
          const blob = await auditTrailResponse.blob();
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = `AuditTrail.pdf`;
          downloadLink.click();
          toast.success(t("signaturePage.fileDownload"));
        }

        // Log the activity of downloading the audit trail
        try {
          await verificationService.createSignActivityVerification(
            {
              Status: "Audit Trail downloaded",
              Message: `${signatoryName} downloaded the Audit Trail`,
            },
            auth,
          );
        } catch (error) {
          console.error("Error logging activity:", error);
        }
      }
    } catch (error) {
      toast.error(t("signaturePage.fileNotDownload"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDecline = async () => {
    if (!reason.trim()) {
      toast.error(t("signaturePage.pleaseEnterDeclineReason"));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const body = {
      Reason: reason,
    };
    try {
      await verificationService.changeDocStatusDeclined(body, auth);

      setShowDeclineModal(false);
      navigate("/declined-message");

      try {
        await verificationService.createSignActivityVerification(
          {
            Status: "file declined",
            Message: `${signatoryName} declined ${fileName} file`,
          },
          auth,
        );
      } catch (error) {}
    } catch (error) {
      toast.error(t("signaturePage.errDecline"));
    } finally {
      setIsLoading(false);
    }
  };

  const closeDeclineModal = () => {
    setShowDeclineModal(false);
  };

  const handleCheckboxChange = (controlLocationID) => (event) => {
    const { checked } = event.target;
    setCheckboxValues((prevValues) => ({
      ...prevValues,
      [controlLocationID]: checked,
    }));

    const transformedValue = checked ? "Yes" : "No";

    handleTextButton(controlLocationID, transformedValue);
  };

  useEffect(() => {
    const initialCheckboxValues = controlData.reduce((acc, control) => {
      if (control.controlName === "Checkbox") {
        acc[control.controlLocationID] = control.isCheckBox && control.textEditor === "Yes";
      }
      return acc;
    }, {});

    setCheckboxValues(initialCheckboxValues);
  }, [controlData, textEditor]);

  const handleUploadedSignature = async (uploadedImage, controlLocationID, signatoriesID, controlName, controlID, imageExtension, selectedMasterDocID, isBulkSign, isSavedSignature) => {
    const existingEntryIndex = uploadedSignature.findIndex((item) => item.controlLocationID === controlLocationID);

    if (isBulkSign) {
      const filteredControls = sortedControls.filter((item) => item.controlName === controlName);

      filteredControls.forEach((item) => {
        const bulkEntryIndex = uploadedSignature.findIndex((entry) => entry.controlLocationID === item.controlLocationID);
        const newEntry = {
          controlLocationID: item.controlLocationID,
          uploadedImage,
          signatoriesID,
          controlName: item.controlName,
          controlID: item.controlID,
          imageExtension,
          selectedMasterDocID,
          isSignatureSaved: isSavedSignature,
        };

        if (bulkEntryIndex !== -1) {
          uploadedSignature[bulkEntryIndex] = newEntry;
        } else {
          uploadedSignature.push(newEntry);
        }
      });
    } else {
      if (existingEntryIndex !== -1) {
        uploadedSignature[existingEntryIndex] = {
          controlLocationID,
          uploadedImage,
          signatoriesID,
          controlName,
          controlID,
          imageExtension,
          selectedMasterDocID,
          isSignatureSaved: isSavedSignature, // Store the saved state here
        };
      } else {
        uploadedSignature.push({
          controlLocationID,
          uploadedImage,
          signatoriesID,
          controlName,
          controlID,
          imageExtension,
          selectedMasterDocID,
          isSignatureSaved: isSavedSignature, // Store the saved state here
        });
      }
    }

    setUploadedSignature([...uploadedSignature]);

    if (currentControlIndex === null) {
      setCurrentControlIndex(sortedControls.findIndex((control) => control.controlLocationID === controlLocationID));
    } else {
      setScrollToCalled(false);
    }
  };

  const SignatureModalProps = {
    email,
    fullName,
    setFullName,
    registerSignID,
    controlLocationID,
    signatoriesID,
    selectedMasterDocID,
    showModal,
    setShowModal,
    controlName,
    controlID,
    initials,
    setInitials,
    auth,
    handleUploadedSignature,
    signatoryName,
    handleEnterText,
    textEditor,
  };

  const handleCompleted = async () => {
    setIsLoading(true);
    try {
      if (uploadedSignature.length > 0) {
        const apiEndpoint = "/v1.0/api/UpdateControlLocationSignature";
        const requestBodies = [];

        for (const signatureItem of uploadedSignature) {
          // Check if the extension already has one, if not, append "."
          let extension = signatureItem.imageExtension;
          if (!extension || !extension.includes(".png")) {
            extension = ".png";
          }
          const requestBody = {
            ControlLocationID: signatureItem.controlLocationID,
            MasterDocID: selectedMasterDocID,
            RegisterSignID: registerSignID,
            SignatoriesID: signatureItem.signatoriesID,
            ModifiedBy: email,
            IsSignature: signatureItem.controlName === "Signature" ? true : false,
            IsInitial: signatureItem.controlName === "Initial" ? true : false,
            IsStamp: signatureItem.controlName === "Stamp" ? true : false,
            IsImage: signatureItem.controlName === "Image" ? true : false,
            IsRequired: true,
            IsRadioButton: false,
            IsCheckBox: false,
            IsDigitalSignature: false,
            Signature: signatureItem.uploadedImage,
            SignatureExtention: extension,
            IsSignatureSaved: signatureItem.isSignatureSaved,
          };

          requestBodies.push(requestBody);
        }

        const response = await verificationService.updateControlLocationSignature(requestBodies, auth);

        if (response.data.successStatus) {
          setIsLoading(false);
          notifyDocumentSigned({ masterDocID: selectedMasterDocID, registerSignID });
          const currentTheme = localStorage.getItem("theme");
          localStorage.clear();
          if (currentTheme) {
            localStorage.setItem("theme", currentTheme);
          }
          sessionStorage.clear();
          navigate("/signed-message");
        }
      }
    } catch (error) {
      if (error?.response?.data?.statusCode === "19" || error?.response?.data?.successStatus === "false") {
        setIsConfirmationModalOpen(false);
        toast.error(t("signaturePage.signatureImageExceeds"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOnly = async () => {
    setIsLoading(true);

    try {
      // First: Log the activity
      await verificationService.createSignActivityVerification(
        {
          Status: "Confirm View",
          Message: `${signatoryName} has viewed [${fileName}] file`,
        },
        auth,
      );

      // Second: Update the status
      const response = await verificationService.updateViewedSignatoryStatus(
        {
          MasterDocID: selectedMasterDocID,
          ModifiedBy: signatoryEmail,
        },
        auth,
      );

      if (response.data.statusCode === "1") {
        setIsConfirmationModalOpen(false);
        navigate("/view-message");
        const currentTheme = localStorage.getItem("theme");
        localStorage.clear();
        if (currentTheme) {
          localStorage.setItem("theme", currentTheme);
        }
        sessionStorage.clear();
      } else {
        toast.error(t("signaturePage.errorProcessingRequest"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("signaturePage.errorProcessingRequest"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (controlLocationID, text) => {
    setTextInput(text);
    setEditingStates((prevState) => ({
      ...prevState,
      [controlLocationID]: true,
    }));
  };

  const handleTextButton = async (controlLocationID, text) => {
    setIsLoading(true);
    try {
      const body = {
        ControlLocationID: controlLocationID,
        TextEditor: text,
      };

      await verificationService.updateTextEditor(body, auth);

      handleEnterText(text);

      // Set textUpdated to trigger recalculation
      setTextUpdated((prevState) => !prevState);

      try {
        await verificationService.createSignActivityVerification(
          {
            Status: `Text is added`,
            Message: `${signatoryName} added text [${text}] `,
          },
          auth,
        );
      } catch (error) {
        console.error("Error logging text addition activity:", error);
      }
      setShowModal(false);
    } catch (error) {
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event, controlLocationID) => {
    const date = event.target.value;
    setSelectedDate(date);
    handleTextButton(controlLocationID, date);
  };

  useEffect(() => {
    const pendingControls = allControlData && allControlData.filter((control) => control.controlStatus === "Pending");

    const requiresUpload =
      pendingControls &&
      pendingControls.some((control) => control.controlName === "Stamp" || control.controlName === "Initial" || control.controlName === "Signature" || control.controlName === "Image");

    if (!requiresUpload) {
      setEnableCompletedButton(false);
      return;
    }

    const allControlIdsPresent =
      pendingControls &&
      pendingControls.every((control) => {
        if (
          (control.controlName === "Stamp" || control.controlName === "Initial" || control.controlName === "Signature" || control.controlName === "Image") &&
          !uploadedSignature.some((item) => item.controlLocationID === control.controlLocationID)
        ) {
          return false;
        }

        if (["Text", "Number", "Date", "Checkbox", "Radio"].includes(control.controlName) && control.isRequired && (!control.textEditor || control.textEditor.trim() === "")) {
          return false;
        }

        return true;
      });

    // Enable or disable the completed button based on the check
    setEnableCompletedButton(allControlIdsPresent);
    setCompletedControls(allControlIdsPresent);
  }, [allControlData, uploadedSignature]);

  const handleCheckCompletedButton = () => {
    if (completedControls) {
      setIsConfirmationModalOpen(true);
    } else {
      toast.error(t("signaturePage.somePendingSignatures"));
    }
  };

  useEffect(() => {
    const allControlsCompleted = sortedControls.every((control) => {
      if (["Signature", "Initial", "Stamp", "Image"].includes(control.controlName)) {
        return uploadedSignature.some((item) => item.controlLocationID === control.controlLocationID);
      }
      if (["Text", "Number", "Date", "Checkbox", "Radio"].includes(control.controlName) && control.isRequired) {
        return control.textEditor && control.textEditor.trim() !== "";
      }
      return true;
    });

    setCompletedControls(allControlsCompleted);
  }, [sortedControls, uploadedSignature, textUpdated]);

  useEffect(() => {
    document.body.classList.add("force-light-body");
    return () => {
      document.body.classList.remove("force-light-body");
    };
  }, []);

  return (
    <div className='signaturePage'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div className={`${passwordModal ? "blur-background" : ""}`}>
        <Row className='bg-white m-0 fixed-top signaturePage-header'>
          <Col className='d-flex justify-content-between align-items-center px-3 mx-3 h-100'>
            <Link to='/'>
              <Icons.StepperLogo style={{ height: "30px", width: "100px" }} />
            </Link>
            <LanguageSelector auth={auth} />
          </Col>
        </Row>

        <div className='signaturePage-container' style={{ marginTop: "56px" }}>
          <Row className='main-content px-0 mx-0 pt-2'>
            <Col md={2} className='comments-col p-0 border border-1 bg-white'>
              <Comments signAuth={auth} registerSignID={registerSignID} signatoryEmail={signatoryEmail} signatoryName={signatoryName} permissions={permissions} />
            </Col>

            <Col md={8} className='image-col p-0' style={{ background: "#eee" }}>
              <Row className='actions-btns ms-0 mb-2'>
                <div className='bg-white d-flex align-items-center justify-content-between px-3 border border-1' style={{ padding: "11px" }}>
                  <div className='signature-actions-tab d-flex gap-4 '>
                    {permissions && permissions.isAllowDownload && (
                      <div className='action d-flex align-items-center gap-2' onClick={() => handleFileDownload()}>
                        <Icons.DownloadAction size={20} />
                        <span> {t("signaturePage.download")}</span>
                      </div>
                    )}

                    <div className='action d-flex align-items-center gap-2' onClick={() => handleViewAuditTrail()}>
                      <Icons.AuditTrail size={20} />
                      <span> {t("signaturePage.viewAuditTrail")}</span>
                    </div>
                    {permissions && permissions.canDownloadAuditTrail && (
                      <div className='action d-flex align-items-center gap-2' onClick={() => handleDownloadAuditTrail()}>
                        <Icons.DownloadAction size={20} />
                        <span>{t("signaturePage.DownloadAuditTrail")}</span>
                      </div>
                    )}

                    {permissions && permissions.isAllowDeclined && (
                      <div className='action d-flex align-items-center gap-2' onClick={() => setShowDeclineModal(true)}>
                        <Icons.Declined size={20} />
                        <span>{t("signaturePage.declined")}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Button
                      onClick={scrollToNextControl}
                      className={`signedBtn ${isLoading || !completedControls ? "disabled-button" : ""}`}
                      style={{
                        backgroundColor: isLoading ? "gray" : completedControls ? "#3ea42c" : "gray",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? t("signOrderDaigram.loading") : completedControls ? t("uploadDocFlow.finish") : currentControlIndex === 0 ? t("signaturePage.Start") : t("signaturePage.NextStep")}
                    </Button>
                  </div>
                </div>
              </Row>

              <Row className='mx-0 p-0' style={{ marginTop: "67px" }}>
                <div
                  className='main-document scrollable-content  px-0 px-md-2'
                  ref={mainDocumentRef}
                  style={{
                    position: "relative",
                  }}
                >
                  <div className='large-image' style={{ position: "relative" }}>
                    <div
                      className='doc-image'
                      style={{
                        // width: "100%",
                        position: "relative",
                        height: "auto",
                      }}
                    >
                      {sortedControls.length > 0 && sortedControls.some((control) => control.masterDocPagesID === masterDocPagesId) && (
                        <div
                          ref={indicatorRef}
                          className='indicator'
                          id='indicator'
                          style={{
                            position: "absolute",
                            top: `${sortedControls[0].controlLocationY}`,
                            left: "-6px",
                          }}
                        >
                          <Icons.ArrowGif style={{ width: "100px", height: "45px" }} />
                        </div>
                      )}

                      <img
                        src={selectedImage}
                        alt=''
                        onError={() => {
                          if (selectedImage) setDocLoadError(true);
                        }}
                      />

                      {controlData.map((control, index) => {
                        // console.log(control);
                        return (
                          control.masterDocPagesID === masterDocPagesId &&
                          (control.controlStatus === "Pending" ? (
                            <div
                              key={control.controlLocationID}
                              id={control.controlLocationID}
                              ref={(ref) => {
                                // Store a reference to each control element
                                if (ref && !controlRefs.includes(ref)) {
                                  setControlRefs((prevRefs) => [...prevRefs, ref]);
                                }
                              }}
                              className='draggable-button-container'
                              style={{
                                position: "absolute",
                                left: control.controlLocationX,
                                top: control.controlLocationY,
                              }}
                              title={control.email + " " + control.name}
                            >
                              {control.controlName === "Date Signed" || (control.controlName === "Company" && control.company === "") ? null : (
                                <Button
                                  className='field-button p-0'
                                  variant='none'
                                  style={{
                                    fontFamily: control.fontStyle || "",
                                    color: control.fontColor || "black",
                                    fontSize: control.fontSize || "",
                                    width: control.width,
                                    height: control.height,
                                    border:
                                      (control.signatureColor && control.signatureColor.trim() !== ""
                                        ? control.signatureColor
                                        : "#e84600" &&
                                          (control.controlName === "Signature" || control.controlName === "Initial" || control.controlName === "Stamp" || control.controlName === "Image") &&
                                          !uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID)) ||
                                      (control.controlName !== "Signature" &&
                                        control.controlName !== "Initial" &&
                                        control.controlName !== "Stamp" &&
                                        control.controlName !== "QR Code" &&
                                        control.controlName !== "Image")
                                        ? `2px dotted ${control.signatureColor || "#e84600"}`
                                        : "transparent",
                                    backgroundColor:
                                      ((control.controlName === "Signature" || control.controlName === "Initial" || control.controlName === "Stamp" || control.controlName === "Image") &&
                                        !uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID)) ||
                                      (control.controlName !== "Signature" && control.controlName !== "Initial" && control.controlName !== "Stamp" && control.controlName !== "Image")
                                        ? "rgb(12 154 215 / 4%)"
                                        : "transparent",
                                    cursor:
                                      control.controlName === "Signature" ||
                                      control.controlName === "Initial" ||
                                      control.controlName === "Stamp" ||
                                      control.controlName === "Image" ||
                                      control.controlName === "Text" ||
                                      control.controlName === "Number" ||
                                      control.controlName === "Date"
                                        ? "pointer"
                                        : "auto",
                                  }}
                                  onClick={() => {
                                    if (control.controlName === "Signature" || control.controlName === "Initial" || control.controlName === "Stamp" || control.controlName === "Image") {
                                      if (control.name) {
                                        const nameParts = control.name.split(" ");
                                        const initial = nameParts.map((part) => part.charAt(0)).join("");
                                        setFullName(control.name);
                                        setInitials(initial);
                                      }
                                      openModal(control.controlLocationID, control.signatoriesID, control.email, control.controlName, control.controlID, control.textEditor);
                                    }
                                    if (control.controlName === "Text" || control.controlName === "Number") {
                                      handleButtonClick(control.controlLocationID, control.textEditor);
                                    }
                                  }}
                                >
                                  {control.controlName === "Signature" ? (
                                    uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ? (
                                      <>
                                        <img
                                          src={`data:image/png;base64, ${uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID).uploadedImage}`}
                                          alt='Uploaded Signature'
                                          style={{
                                            width: control.width,
                                            height: control.height,
                                            border: "none",
                                          }}
                                        />
                                      </>
                                    ) : (
                                      <div>{control.customPlaceHolder}</div>
                                    )
                                  ) : control.controlName === "Initial" ? (
                                    uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ? (
                                      <>
                                        <img
                                          src={`data:image/png;base64, ${uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID).uploadedImage}`}
                                          alt='Uploaded initials '
                                          style={{
                                            width: control.width,
                                            height: control.height,
                                            border: "none",
                                          }}
                                        />
                                      </>
                                    ) : (
                                      <div>{control.customPlaceHolder}</div>
                                    )
                                  ) : control.controlName === "Stamp" ? (
                                    uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ? (
                                      <>
                                        {" "}
                                        <img
                                          src={`data:image/png;base64, ${uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID).uploadedImage}`}
                                          alt='Uploaded stamp '
                                          style={{
                                            width: control.width,
                                            height: control.height,
                                            border: "none",
                                          }}
                                        />
                                      </>
                                    ) : (
                                      <div>{control.customPlaceHolder}</div>
                                    )
                                  ) : control.controlName === "Image" ? (
                                    uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ? (
                                      <>
                                        {" "}
                                        <img
                                          src={`data:image/png;base64, ${uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID).uploadedImage}`}
                                          alt='Loaded img'
                                          style={{
                                            width: control.width,
                                            height: control.height,
                                            border: "none",
                                          }}
                                        />
                                      </>
                                    ) : (
                                      <div>{control.customPlaceHolder}</div>
                                    )
                                  ) : (
                                    <>
                                      {control.controlName === "Text" &&
                                        (editingStates[control.controlLocationID] ? (
                                          <InputEditors control={control} textInput={textInput} setEditingStates={setEditingStates} handleTextButton={handleTextButton} />
                                        ) : (
                                          <div
                                            style={{
                                              width: control.textEditor ? "100%" : "",
                                              height: control.textEditor ? "100%" : "",
                                              display: "flex",
                                              flexWrap: "wrap",
                                            }}
                                          >
                                            {control.textEditor !== "" ? control.textEditor : control.customPlaceHolder}
                                          </div>
                                        ))}

                                      {control.controlName === "Number" &&
                                        (editingStates[control.controlLocationID] ? (
                                          <InputEditors control={control} textInput={textInput} setEditingStates={setEditingStates} handleTextButton={handleTextButton} />
                                        ) : (
                                          <div
                                            style={{
                                              width: control.textEditor ? "100%" : "",
                                              height: control.textEditor ? "100%" : "",
                                              display: "flex",
                                              flexWrap: "wrap",
                                            }}
                                          >
                                            {control.textEditor !== "" ? control.textEditor : control.customPlaceHolder}
                                          </div>
                                        ))}

                                      {/* {control.controlName === "Date" && (
                                        <div>
                                          <div
                                            style={{
                                              width: control.width + "px",
                                              height: control.height + "px",
                                              padding: "10px ",
                                              cursor: "grab",
                                            }}
                                          >
                                            <input
                                              type='date'
                                              value={control.textEditor ?? selectedDate}
                                              onChange={handleDateChange}
                                              style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                cursor: "grab",
                                                background: "transparent",
                                              }}
                                              // onBlur={() => {
                                              //   handleTextButton(control.controlLocationID, selectedDate);
                                              // }}
                                            />
                                          </div>
                                        </div>
                                      )} */}
                                      {control.controlName === "Date" && (
                                        <div>
                                          <div
                                            style={{
                                              width: control.width + "px",
                                              height: control.height + "px",
                                              padding: "10px ",
                                              cursor: "pointer", // Optional, makes it clear the user can interact with the input
                                            }}
                                          >
                                            <input
                                              type='date'
                                              value={control.textEditor ?? selectedDate} // Bind the input value to the state
                                              onChange={(event) => handleDateChange(event, control.controlLocationID)} // Update the date when it's selected
                                              style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none",
                                                cursor: "pointer",
                                                background: "transparent",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {control.controlName === "Radio" && (
                                        <div
                                          style={{
                                            width: control.width + "px",
                                            height: control.height + "px",
                                            padding: "10px ",
                                            cursor: "grab",
                                          }}
                                        >
                                          <div className='d-flex justify-content-start align-items-center gap-2'>
                                            <input
                                              type='radio'
                                              id={`radio${control.controlLocationID}`}
                                              name='radioGroup'
                                              value={`Text`}
                                              style={{
                                                width: "15px",
                                                height: "15px",
                                              }}
                                            />
                                            <label htmlFor={`radio${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                                          </div>
                                        </div>
                                      )}

                                      {control.controlName === "Checkbox" && (
                                        <div
                                          style={{
                                            width: control.width + "px",
                                            height: control.height + "px",
                                            padding: "10px ",
                                            cursor: "grab",
                                          }}
                                        >
                                          <div className='d-flex justify-content-start align-items-center gap-2'>
                                            <input
                                              type='checkbox'
                                              id={`checkbox${control.controlLocationID}`}
                                              name={`checkbox${control.controlLocationID}`}
                                              value=''
                                              checked={checkboxValues[control.controlLocationID] || false}
                                              onChange={handleCheckboxChange(control.controlLocationID)}
                                              style={{
                                                width: "15px",
                                                height: "15px",
                                              }}
                                            />

                                            <label htmlFor={`checkbox${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                                          </div>
                                        </div>
                                      )}

                                      {control.controlName === "Name" && control.name}
                                      {control.controlName === "Email" && control.email}
                                      {control.controlName === "Stamp" && "Stamp"}
                                      {control.controlName === "Company" && control.company}
                                      {control.controlName === "QR Code" && control.qrCodePath && (
                                        <img
                                          src={`${control.qrCodePath}`}
                                          style={{
                                            height: control.height,
                                            width: control.width,
                                          }}
                                          alt='QR Code'
                                        />
                                      )}
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          ) : (
                            control.controlStatus === "Signed" &&
                            !isToastDisplayed && (
                              <div
                                key={index}
                                className='draggable-button-container'
                                style={{
                                  position: "absolute",
                                  left: control.controlLocationX,
                                  top: control.controlLocationY,
                                  fontFamily: control.fontStyle || "",
                                  color: control.fontColor || "black",
                                  fontSize: control.fontSize || "",
                                }}
                              >
                                {control.controlName === "Company" && control.company === "" ? null : (
                                  <Button
                                    className='field-button'
                                    style={{
                                      backgroundColor: "transparent",
                                      color: "black",
                                      border: "none",
                                      width: control.width,
                                      height: control.height,
                                    }}
                                    title={control.email + " " + control.name}
                                  >
                                    {control.controlName === "Signature" && (
                                      <img
                                        src={control.signature}
                                        alt='Signature Loading'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "none",
                                        }}
                                      />
                                    )}
                                    {control.controlName === "Name" && control.name}
                                    {control.controlName === "Initial" && (
                                      <img
                                        src={control.signature}
                                        alt='Initial Loading'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "none",
                                        }}
                                      />
                                    )}
                                    {control.controlName === "Email" && control.email}{" "}
                                    {control.controlName === "Stamp" && (
                                      <img
                                        src={control.signature}
                                        alt='Stamp Loading'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "none",
                                        }}
                                      />
                                    )}
                                    {control.controlName === "Image" && (
                                      <img
                                        src={control.signature}
                                        alt=' Loading img'
                                        style={{
                                          width: control.width,
                                          height: control.height,
                                          border: "none",
                                        }}
                                      />
                                    )}
                                    {control.controlName === "Radio" && (
                                      <div
                                        style={{
                                          width: control.width + "px",
                                          height: control.height + "px",
                                          padding: "10px ",
                                          cursor: "grab",
                                        }}
                                      >
                                        <div className='d-flex justify-content-start align-items-center gap-2'>
                                          <input
                                            type='radio'
                                            id={`radio${control.controlLocationID}`}
                                            name='radioGroup'
                                            style={{
                                              width: "15px",
                                              height: "15px",
                                            }}
                                          />
                                          <label htmlFor={`radio${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                                        </div>
                                      </div>
                                    )}
                                    {control.controlName === "Checkbox" && (
                                      <div
                                        style={{
                                          width: control.width + "px",
                                          height: control.height + "px",
                                          padding: "10px ",
                                          cursor: "grab",
                                        }}
                                      >
                                        <div className='d-flex justify-content-start align-items-center gap-2'>
                                          <input
                                            type='checkbox'
                                            id={`checkbox${control.controlLocationID}`}
                                            name={`checkbox${control.controlLocationID}`}
                                            value=''
                                            checked={control.isCheckBox && control.textEditor === "Yes" ? true : false}
                                            style={{
                                              width: "15px",
                                              height: "15px",
                                            }}
                                          />

                                          <label htmlFor={`checkbox${control.controlLocationID}`}>{control.customPlaceHolder}</label>
                                        </div>
                                      </div>
                                    )}
                                    {control.controlName === "Company" && control.company}
                                    {control.controlName === "Date Signed" && control.signDate}
                                    {control.controlName === "Text" && control.textEditor}
                                    {control.controlName === "Number" && control.textEditor}
                                    {control.controlName === "Date" && control.textEditor}
                                    {control.controlName === "QR Code" && control.qrCodePath && (
                                      <img
                                        src={`${control.qrCodePath}`}
                                        style={{
                                          height: control.height,
                                          width: control.width,
                                        }}
                                        alt='QR Code'
                                      />
                                    )}
                                  </Button>
                                )}
                              </div>
                            )
                          ))
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Row>
            </Col>

            <Col md={2} className='page-display p-0'>
              <div className='documents-dropdown'>
                <DropdownButton
                  title={selectedFolder || ""}
                  onSelect={(eventKey) => {
                    const [masterDocID, selectedFolderName, signedDocKey] = eventKey.split(",");
                    handleDocSelect(masterDocID, selectedFolderName, signedDocKey);
                  }}
                  id='doc-dropdown'
                  className='border border-0 w-100'
                  variant='none'
                >
                  {formData &&
                    formData.primaryDocs.map((doc) => {
                      return (
                        <Dropdown.Item key={doc.masterDocID} eventKey={`${doc.masterDocID},${doc.docName},${doc.signedDocKey}`} className='truncate-text'>
                          {doc.docName}
                        </Dropdown.Item>
                      );
                    })}
                </DropdownButton>
              </div>
              <hr className='m-0' />
              <div className='doc-pages d-none d-md-block'>
                <ImageThumbnails
                  controls={allControlData}
                  t={t}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  setMasterDocPagesId={setMasterDocPagesId}
                  imagesData={imagesData}
                  setImagesData={setImagesData}
                  buttons={false}
                  onImageError={() => setDocLoadError(true)}
                />
              </div>

              <div className='completed-btn d-flex justify-content-center align-items-center p-2'>
                {viewOnly ? (
                  <>
                    <div className='signbutton-container'>
                      <div></div>
                      <Button className='Continue-btn' variant='none' onClick={() => setIsConfirmationModalOpen(true)}>
                        {t("signaturePage.confirm")}
                      </Button>
                    </div>

                    <ConfirmationModal show={isConfirmationModalOpen} onHide={() => setIsConfirmationModalOpen(false)} onClick={handleViewOnly} className='force-light-modal' />
                  </>
                ) : (
                  <>
                    <div className='signbutton-container'>
                      <div className='d-flex justify-content-center m-auto'>
                        <PageNavigations imagesData={imagesData} selectedImage={selectedImage} setSelectedImage={setSelectedImage} onImageSelect={handleImageSelect} />
                      </div>

                      <Button className='Continue-btn' variant='none' onClick={handleCheckCompletedButton}>
                        {t("signaturePage.completed")}
                      </Button>
                    </div>
                    <ConfirmationModal show={isConfirmationModalOpen} onHide={() => setIsConfirmationModalOpen(false)} onClick={handleCompleted} className='force-light-modal' />
                  </>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* audit trail modal */}
      <AuditTrailModal
        show={showATModal}
        auditTrailURL={auditTrailURL}
        handleClose={() => {
          setShowATModal(false);
          setAuditTrailURL("");
        }}
        className='force-light-modal'
      />
      {/* signature modal */}
      <SignatureModal {...SignatureModalProps} className='force-light-modal' />
      {/* password modal */}
      {passwordModal && (
        <PasswordModal
          show={passwordModal}
          closeModal={() => setPasswordModal(false)}
          auth={auth}
          signatoryID={signatoryID}
          signatoryName={signatoryName}
          passwordProtected={passwordProtected}
          defaultMasterDocID={defaultMasterDocID}
          className='force-light-modal'
        />
      )}

      {/* decline modal */}
      <Modal show={showDeclineModal} onHide={closeDeclineModal} dialogClassName='custom-modal-width force-light-modal' backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <div className='header-content'>
            <div className='header-icon'>
              <Icons.Declined style={{ width: 22, height: 22 }} />
            </div>
            <div className='header-text'>
              <Modal.Title>{t("signaturePage.declineDocument")}</Modal.Title>
              {/* <p className='header-subtitle'>{t("signaturePage.declineConfirmation")}</p> */}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>
          <Form>
            <Form.Group controlId='reason'>
              <Form.Label className='fw-semibold'>
                {t("signaturePage.reasonDecliningDocument")} <span className='text-danger'>*</span>
              </Form.Label>
              <Form.Control
                as='textarea'
                className='reason-textarea'
                rows={4}
                placeholder={t("signaturePage.typeYourReason")}
                maxLength={300}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className='d-flex justify-content-between mt-1'>
                <small className='char-counter'>{(reason || "").length}/300</small>
              </div>
            </Form.Group>
          </Form>

          {/* <div className='transfer-warning mb-3'>
            <div className='warning-text'>
              <p>{t("signaturePage.pleaseTellUsWhy")}</p>
            </div>
          </div> */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='none' onClick={closeDeclineModal} className='py-1 modalCancelButton'>
            {t("signaturePage.close")}
          </Button>
          <Button variant='none' className='applyBtn  py-1 text-white fw-normal' onClick={handleFileDecline} disabled={isLoading}>
            {t("signaturePage.submit")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* document failed to load (broken file / unavailable pages) */}
      {docLoadError && <DocumentLoadError />}
    </div>
  );
};

export default SignaturePage;
