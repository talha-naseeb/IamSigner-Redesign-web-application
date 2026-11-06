import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import verificationService from "@/services/verificationService";
import { Button, Col, Dropdown, DropdownButton, Form, Modal, Row } from "@/Components/UI/shadcnCompat";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, Maximize2, Paperclip, Eye, Download, FileText, Plus, MessageSquare, Sun, Moon, Check } from "lucide-react";
import { toast } from "react-toastify";
import Comments from "@/Components/Comments/Comments";
import SignatureModal from "./SignatureModal";
import AuditTrailModal from "../AuditTrail/AuditTrailModal";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import LanguageSelector from "@/Components/Language/LanguageSelector";
import PasswordModal from "./PasswordModal";
import PageNavigations from "@/Components/DocumentPreparation/Step2_Canvas/PageNavigations";
import ConfirmationModal from "./ConfirmationModal";
import InputEditors from "./InputEditors";
import { getSignatureErrorRoute } from "@/Helpers/signatureErrors";
import { notifyDocumentSigned } from "@/Helpers/documentSignChannel";
import DocumentLoadError from "./DocumentLoadError";
import { useTheme } from "@/Context/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState();
  const [masterDocIDs, setMasterDocIDs] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [selectedSignedDocKey, setSelectedSignedDocKey] = useState();
  const [defaultMasterDocID, setDefaultMasterDocID] = useState(null);
  const [imagesData, setImagesData] = useState([]);
  const [isThumbnailsExpanded, setIsThumbnailsExpanded] = useState(false);
  const totalPagesCount = imagesData?.length || 0;
  const halfCount = Math.ceil(totalPagesCount / 2);
  const visibleThumbnails = useMemo(() => {
    if (!imagesData || !Array.isArray(imagesData)) return [];
    if (isThumbnailsExpanded || totalPagesCount <= 6) return imagesData;
    return imagesData.slice(0, halfCount);
  }, [imagesData, isThumbnailsExpanded, totalPagesCount, halfCount]);
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
  const [permissions, setPermissions] = useState({
    isAllowDownload: true,
    canDownloadAuditTrail: true,
    isAllowDeclined: true,
    isAllowComments: true,
    canAddSupportingDocument: true,
  });
  const [docLoadError, setDocLoadError] = useState(false);

  // Download dropdown menu state & ref
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
    };
    if (showDownloadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDownloadMenu]);

  // Comments & Supporting documents panel state
  const [isCommentsOpen, setIsCommentsOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [commentsInitialTab, setCommentsInitialTab] = useState("comments");
  const [counts, setCounts] = useState({ commentsCount: 0, supportingDocsCount: 0 });

  // Zoom & scaling state (reusing Step 2 canvas standard)
  const [zoomScale, setZoomScale] = useState(1);
  const [isFitMode, setIsFitMode] = useState(false);
  const [naturalDim, setNaturalDim] = useState({ width: 0, height: 0 });
  const viewportDeskRef = useRef(null);
  const canvasScrollRef = useRef(null);
  const userManualZoomRef = useRef(false);

  const calculateFitScale = useCallback((nw) => {
    if (!viewportDeskRef.current || !nw) return 1;
    const padding = window.innerWidth < 768 ? 16 : 48;
    const avail = viewportDeskRef.current.clientWidth - padding;
    if (avail > 0 && nw > 0) {
      return Math.min(1.0, Math.max(0.25, avail / nw));
    }
    return 1;
  }, []);

  const handleImageLoaded = (e) => {
    const nw = e?.target?.naturalWidth || 800;
    const nh = e?.target?.naturalHeight || 1100;
    setNaturalDim({ width: nw, height: nh });

    if (!userManualZoomRef.current) {
      const fit = calculateFitScale(nw);
      if (fit < 1.0 || window.innerWidth < 1024) {
        setZoomScale(Number(fit.toFixed(2)));
        setIsFitMode(true);
      } else {
        setZoomScale(1);
        setIsFitMode(false);
      }
    }
  };

  useEffect(() => {
    const el = viewportDeskRef.current;
    if (!el || !naturalDim.width) return;

    const handleResize = () => {
      if (!userManualZoomRef.current || isFitMode) {
        const newFit = calculateFitScale(naturalDim.width);
        setZoomScale(Number(newFit.toFixed(2)));
        setIsFitMode(true);
      }
    };

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(el);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [naturalDim.width, calculateFitScale, isFitMode]);

  const handleZoomIn = () => {
    userManualZoomRef.current = true;
    setIsFitMode(false);
    setZoomScale((prev) => Math.min(2.0, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    userManualZoomRef.current = true;
    setIsFitMode(false);
    setZoomScale((prev) => Math.max(0.25, Number((prev - 0.15).toFixed(2))));
  };

  const handleFitToggle = () => {
    if (!naturalDim.width) return;
    if (isFitMode) {
      userManualZoomRef.current = true;
      setZoomScale(1);
      setIsFitMode(false);
    } else {
      userManualZoomRef.current = false;
      const fit = calculateFitScale(naturalDim.width);
      setZoomScale(Number(fit.toFixed(2)));
      setIsFitMode(true);
    }
  };

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
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

      if (indicatorRef.current) {
        indicatorRef.current.style.top = control.controlLocationY;
      }
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
    setSelectedFolder(selectedFolderName);
    setFileName(selectedFolderName);
    setSelectedMasterDocID(masterDocID);
    setSelectedSignedDocKey(signedDocKey);
    setIsLoading(true);
    getMasterDocPages(masterDocID);
    setIsLoading(false);
    try {
      if (auth) {
        await verificationService.createSignActivityVerification(
          {
            Status: "Document viewed",
            Message: `${signatoryName} viewed ${selectedFolderName} document`,
          },
          auth,
        );
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (imagesData && imagesData.length > 0) {
      setSelectedImage(imagesData[0].pagesPath);
      setMasterDocPagesId(imagesData[0].masterDocPagesID);
    }
  }, [imagesData]);

  // Auto-expand thumbnails if active page is in the latter half
  useEffect(() => {
    if (!isThumbnailsExpanded && imagesData && imagesData.length > 6) {
      const selectedIndex = imagesData.findIndex((img) => img.pagesPath === selectedImage);
      if (selectedIndex >= Math.ceil(imagesData.length / 2)) {
        setIsThumbnailsExpanded(true);
      }
    }
  }, [selectedImage, imagesData, isThumbnailsExpanded]);

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
          setSelectedFolder(firstDocName);

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

  const progressStats = useMemo(() => {
    const total = sortedControls.length;
    if (total === 0) return { total: 0, completed: 0, percent: 100 };
    const completed = sortedControls.filter((control) => {
      if (["Signature", "Initial", "Stamp", "Image"].includes(control.controlName)) {
        return uploadedSignature.some((item) => item.controlLocationID === control.controlLocationID);
      }
      if (["Text", "Number", "Date", "Checkbox", "Radio"].includes(control.controlName)) {
        if (control.controlName === "Checkbox") {
          return !!checkboxValues[control.controlLocationID];
        }
        return !!(control.textEditor && String(control.textEditor).trim() !== "");
      }
      return control.controlStatus !== "Pending";
    }).length;
    const percent = Math.min(100, Math.round((completed / total) * 100));
    return { total, completed, percent };
  }, [sortedControls, uploadedSignature, checkboxValues, textUpdated]);

  const currentPageIndex = useMemo(() => {
    if (!imagesData || imagesData.length === 0) return 0;
    const idx = imagesData.findIndex(
      (img) => img.pagesPath === selectedImage || img.masterDocPagesID === masterDocPagesId
    );
    return idx >= 0 ? idx : 0;
  }, [imagesData, selectedImage, masterDocPagesId]);

  const handlePrevPage = () => {
    if (currentPageIndex > 0 && imagesData[currentPageIndex - 1]) {
      const prev = imagesData[currentPageIndex - 1];
      handleImageSelect(prev.pagesPath, prev.masterDocPagesID);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < imagesData.length - 1 && imagesData[currentPageIndex + 1]) {
      const next = imagesData[currentPageIndex + 1];
      handleImageSelect(next.pagesPath, next.masterDocPagesID);
    }
  };

  return (
    <div className='signaturePage w-full min-h-screen bg-[var(--modern-bg)] text-[var(--modern-text)] flex flex-col font-sans transition-colors duration-300'>
      <div className={`flex flex-col flex-1 w-full ${passwordModal ? "blur-background" : ""}`}>
        {/* Unified Sticky Top Action Bar (Matching iamSigner Studio prototype .sbar) */}
        <header className='sticky top-0 z-30 border-b border-[var(--modern-border)] bg-[var(--modern-card)]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors shadow-xs'>
          <div className='max-w-[1540px] mx-auto flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap'>
            {/* Left: Brand Logo + Signatory Identifier Pill */}
            <div className='flex items-center gap-3'>
              <Link to='/' className='flex items-center shrink-0'>
                <Icons.StepperLogo style={{ height: "28px", width: "95px" }} />
              </Link>
              {signatoryName && (
                <div className='flex items-center gap-2 pl-3 border-l border-[var(--modern-border)] rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[11px] font-semibold text-[var(--modern-muted)] whitespace-nowrap'>
                      {t("signaturePage.previewingAs", "Previewing as")}:
                    </span>
                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-[var(--modern-primary,#4d8dff)] bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_12%,var(--modern-card))] border border-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_25%,transparent)] shadow-xs max-w-[200px] truncate'>
                      <span className='w-1.5 h-1.5 rounded-full bg-[var(--modern-primary,#4d8dff)] shrink-0' />
                      <span className='truncate'>{signatoryName}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Actions (View Trail, Downloads, Decline, Theme, Lang) */}
            <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap'>
              {/* Mobile Drawer Trigger for Comments */}
              <button
                type='button'
                onClick={() => setIsCommentsOpen(true)}
                className='lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] transition-all cursor-pointer shadow-xs'
                title={t("Comments.Comments", "Comments")}
              >
                <MessageSquare size={13} className='text-[var(--modern-primary)]' />
                <span className='hidden xs:inline'>{t("Comments.Comments", "Comments")}</span>
                {(counts.commentsCount > 0 || counts.supportingDocsCount > 0) && (
                  <span className='px-1.5 py-0.2 rounded-full bg-[var(--modern-primary)] text-white font-mono text-[10px] font-bold'>
                    {counts.commentsCount + counts.supportingDocsCount}
                  </span>
                )}
              </button>

              {/* View Audit Trail */}
              <button
                type='button'
                onClick={() => handleViewAuditTrail()}
                className='inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer shadow-xs shrink-0'
                title={t("signaturePage.viewAuditTrail", "View Audit Trail")}
              >
                <Icons.AuditTrail size={13} />
                <span>{t("signaturePage.viewAuditTrail", "View Audit Trail")}</span>
              </button>

              {/* Download Document */}
              {permissions && permissions.isAllowDownload && (
                <button
                  type='button'
                  onClick={handleFileDownload}
                  className='inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer shadow-xs shrink-0'
                  title={t("signaturePage.download", "Download Document")}
                >
                  <Icons.DownloadAction size={13} />
                  <span>{t("signaturePage.download", "Download")}</span>
                </button>
              )}

              {/* Download Audit Trail */}
              {permissions && permissions.canDownloadAuditTrail && (
                <button
                  type='button'
                  onClick={handleDownloadAuditTrail}
                  className='inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer shadow-xs shrink-0'
                  title={t("signaturePage.DownloadAuditTrail", "Download Audit Trail")}
                >
                  <Icons.AuditTrail size={13} />
                  <span>{t("signaturePage.auditTrail", "Audit Trail")}</span>
                </button>
              )}

              {/* Decline */}
              {permissions && permissions.isAllowDeclined && (
                <button
                  type='button'
                  onClick={() => setShowDeclineModal(true)}
                  className='inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-rose-300/60 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer shadow-xs shrink-0'
                  title={t("signaturePage.decline", "Decline")}
                >
                  <Icons.Declined size={13} />
                  <span>{t("signaturePage.decline", "Decline")}</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                type='button'
                onClick={toggleTheme}
                aria-label={theme === "dark" ? t("header.switchToLightMode", "Switch to light mode") : t("header.switchToDarkMode", "Switch to dark mode")}
                title={theme === "dark" ? t("header.switchToLightMode", "Switch to light mode") : t("header.switchToDarkMode", "Switch to dark mode")}
                className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] transition-all cursor-pointer'
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Language Selector */}
              <LanguageSelector auth={auth} />
            </div>
          </div>
        </header>

        {/* 2-Column Studio Workspace (.slay: 300px Left Sidebar + Flexible Stage) */}
        <div className='max-w-[1540px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 p-4 sm:p-6 pb-32 flex-1 items-start'>
          {/* Left Column: Stacked Comments & Supporting Documents (.sside) - Fixed/Sticky on both LTR and RTL */}
          <aside className='hidden lg:flex flex-col gap-4 w-[300px] shrink-0 sticky top-[72px] self-start max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar z-20'>
            <Comments
              signAuth={auth}
              registerSignID={registerSignID}
              signatoryEmail={signatoryEmail}
              signatoryName={signatoryName}
              permissions={permissions}
              initialTab={commentsInitialTab}
              variant='stacked'
              onCountsChange={setCounts}
            />
          </aside>

          {/* Mobile Slide-over Drawer for Comments */}
          {isCommentsOpen && (
            <>
              <div
                className='fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden'
                onClick={() => setIsCommentsOpen(false)}
              />
              <aside className='fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] bg-[var(--modern-card)] border-r border-[var(--modern-border)] shadow-2xl flex flex-col h-full overflow-hidden lg:hidden'>
                <Comments
                  signAuth={auth}
                  registerSignID={registerSignID}
                  signatoryEmail={signatoryEmail}
                  signatoryName={signatoryName}
                  permissions={permissions}
                  initialTab={commentsInitialTab}
                  onClose={() => setIsCommentsOpen(false)}
                  onCountsChange={setCounts}
                />
              </aside>
            </>
          )}

          {/* Right Column: Stage (.stage) */}
          <section className='min-w-0 flex flex-col gap-3 flex-1'>
            {/* Stage Top Bar: Document Title & Dropdown on Left, Pager & Zoom Controls on Right */}
            <div className='flex items-center justify-between gap-3 flex-wrap p-2.5 sm:p-3 rounded-2xl border border-[var(--modern-border)] bg-[var(--modern-card)] shadow-xs'>
              {/* Document Title & Dropdown Switcher */}
              <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                <div className='flex flex-col min-w-0'>
                  <div className='flex items-center gap-2'>
                    <b className='text-sm sm:text-base font-bold text-[var(--modern-text)] truncate' title={selectedFolder || fileName}>
                      {selectedFolder || fileName || t("signaturePage.document", "Document")}
                    </b>
                    {formData && formData.primaryDocs && formData.primaryDocs.length > 1 && (
                      <Dropdown className='inline-block'>
                        <Dropdown.Toggle
                          variant='none'
                          className='p-1 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs text-[var(--modern-muted)] hover:text-[var(--modern-text)]'
                        >
                          <ChevronDown size={13} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className='max-h-60 overflow-y-auto p-1.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] shadow-lg z-50'>
                          {formData.primaryDocs.map((doc) => (
                            <Dropdown.Item
                              key={doc.masterDocID}
                              onClick={() => handleDocSelect(doc.masterDocID, doc.docName, doc.signedDocKey)}
                              className='px-3 py-1.5 text-xs rounded-lg text-[var(--modern-text)] hover:bg-[var(--modern-raised)] transition-colors truncate'
                            >
                              {doc.docName}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                  <small className='text-xs text-[var(--modern-muted)] truncate'>
                    {imagesData.length} {t("signaturePage.pages", "pages")} {signatoryName ? `· ${signatoryName}` : ""}
                  </small>
                </div>
              </div>

              {/* Right: Pager + Zoom Controls */}
              <div className='flex items-center gap-2 sm:gap-3 flex-wrap shrink-0'>
                {/* Pager: ‹ X of Y › */}
                <div className='flex items-center gap-1 p-1 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)]'>
                  <button
                    type='button'
                    onClick={handlePrevPage}
                    disabled={currentPageIndex === 0}
                    aria-label='Previous page'
                    className='h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold text-[var(--modern-text)] hover:bg-[var(--modern-card)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors border-0 bg-transparent'
                  >
                    ‹
                  </button>
                  <span className='font-mono text-xs font-semibold text-[var(--modern-muted)] px-2 min-w-[70px] text-center'>
                    {currentPageIndex + 1} {t("signaturePage.of", "of")} {imagesData.length}
                  </span>
                  <button
                    type='button'
                    onClick={handleNextPage}
                    disabled={currentPageIndex >= imagesData.length - 1}
                    aria-label='Next page'
                    className='h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold text-[var(--modern-text)] hover:bg-[var(--modern-card)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors border-0 bg-transparent'
                  >
                    ›
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className='flex items-center gap-0.5 sm:gap-1 rounded-full border border-[var(--modern-border)] bg-[var(--modern-raised)] p-0.5 sm:p-1'>
                  <button
                    type='button'
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 0.25}
                    title={t("uploadDocFlow.zoomOut", "Zoom out")}
                    aria-label='Zoom out'
                    className='inline-flex h-6 sm:h-7 w-6 sm:w-7 items-center justify-center rounded-full border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] disabled:opacity-30 cursor-pointer transition-colors'
                  >
                    <ZoomOut size={12} />
                  </button>

                  <button
                    type='button'
                    onClick={handleFitToggle}
                    title='Reset to 100%'
                    className={`min-w-[42px] sm:min-w-[48px] px-1.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                      isFitMode
                        ? "border-[var(--modern-primary)] bg-[var(--modern-primary)]/15 text-[var(--modern-primary)]"
                        : "border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)]"
                    }`}
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>

                  <button
                    type='button'
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 2.0}
                    title={t("uploadDocFlow.zoomIn", "Zoom in")}
                    aria-label='Zoom in'
                    className='inline-flex h-6 sm:h-7 w-6 sm:w-7 items-center justify-center rounded-full border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] disabled:opacity-30 cursor-pointer transition-colors'
                  >
                    <ZoomIn size={12} />
                  </button>

                  <div className='h-3 sm:h-4 w-px bg-[var(--modern-border)] mx-0.5' />

                  <button
                    type='button'
                    onClick={handleFitToggle}
                    title='Fit to screen'
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                      isFitMode
                        ? "border-[var(--modern-primary)] bg-[var(--modern-primary)] text-white"
                        : "border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-primary)] hover:bg-[var(--modern-raised)]"
                    }`}
                  >
                    <Maximize2 size={11} />
                    <span className='hidden sm:inline'>Fit</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Page Thumbnails Strip */}
            {imagesData && imagesData.length > 1 && (
              <div className='w-full overflow-x-auto py-2 px-1 flex items-center gap-2.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)]/50 custom-scrollbar shrink-0'>
                {imagesData.map((img, idx) => {
                  const isCurrent = idx === currentPageIndex;
                  const pageFieldCount = Array.isArray(allControlData)
                    ? allControlData.filter((c) => String(c.masterDocPagesID) === String(img.masterDocPagesID)).length
                    : 0;

                  return (
                    <button
                      key={img.masterDocPagesID || idx}
                      type='button'
                      onClick={() => handleImageSelect(img.pagesPath, img.masterDocPagesID)}
                      className={`group relative shrink-0 w-16 sm:w-20 aspect-[8.5/11] rounded-lg border-2 overflow-hidden transition-all cursor-pointer bg-white ${
                        isCurrent
                          ? "border-[var(--modern-primary)] shadow-sm ring-2 ring-[var(--modern-primary)]/20"
                          : "border-[var(--modern-border)] hover:border-[var(--modern-border-strong)] opacity-80 hover:opacity-100"
                      }`}
                      aria-label={`${t("uploadDocFlow.page", "Page")} ${idx + 1}`}
                    >
                      <img
                        src={img.pagesPath}
                        alt={`Page ${idx + 1}`}
                        className='w-full h-full object-cover pointer-events-none'
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0.3";
                        }}
                      />
                      {pageFieldCount > 0 && (
                        <span className='absolute top-1 left-1 rtl:left-auto rtl:right-1 z-10 h-4 min-w-[16px] px-1 rounded-full bg-[var(--modern-primary)] text-white text-[9px] font-bold flex items-center justify-center shadow-xs'>
                          {pageFieldCount}
                        </span>
                      )}
                      <span className='absolute bottom-1 right-1 rtl:right-auto rtl:left-1 z-10 rounded bg-black/60 backdrop-blur-xs text-white px-1 font-mono text-[9px] font-semibold'>
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Ruled Canvas Desk (Scrollable Document Stage) */}
            <div
              ref={canvasScrollRef}
              className='flex-1 p-3 sm:p-6 flex flex-col items-center justify-start overflow-y-auto overflow-x-auto bg-[var(--modern-raised)] rounded-2xl border border-[var(--modern-border)] min-h-[520px] max-h-[calc(100vh-230px)] custom-scrollbar'
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent 0 23px, var(--modern-border) 23px 24px)",
                backgroundSize: "100% 24px",
              }}
            >
              {isLoading && (!imagesData || imagesData.length === 0 || !selectedImage) ? (
                <div className='flex flex-col items-center justify-center gap-3 py-24 sm:py-36 text-center my-auto'>
                  <div className='h-10 w-10 animate-spin rounded-full border-3 border-[var(--modern-primary,#4d8dff)] border-t-transparent' />
                  <div className='space-y-1'>
                    <p className='text-sm sm:text-base font-semibold text-[var(--modern-text)]'>
                      {t("uploadDocFlow.loadingPreview", "Loading document preview…")}
                    </p>
                    <p className='text-xs text-[var(--modern-muted)]'>
                      {t("signaturePage.preparingDocument", "Preparing pages and signature fields...")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='w-full flex flex-col items-center' ref={viewportDeskRef}>
                {/* Scaled Document Outer Box */}
                <div
                  style={{
                    width: naturalDim.width ? `${naturalDim.width * zoomScale}px` : "auto",
                    height: naturalDim.height ? `${naturalDim.height * zoomScale}px` : "auto",
                    position: "relative",
                  }}
                  className='transition-all duration-150'
                >
                  <div
                    className='main-document scrollable-content relative rounded-2xl border border-[var(--modern-border-strong)] bg-white overflow-visible'
                    ref={mainDocumentRef}
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: "top left",
                      width: naturalDim.width || "auto",
                      height: naturalDim.height || "auto",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <div className='large-image'>
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
                          onLoad={handleImageLoaded}
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
                                      control.controlName === "QR Code"
                                        ? "none"
                                        : `2px dotted ${control.signatureColor?.trim() || "#e84600"}`,
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
                                      border:
                                        control.controlName === "QR Code"
                                          ? "none"
                                          : `2px dotted ${control.signatureColor?.trim() || "#e84600"}`,
                                      borderRadius: "6px",
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
              </div>
            </div>
          )}
        </div>
      </section>
    </div>

    {/* Floating Bottom Dock (Progress bar + Counter + Start/Next CTA + Completed CTA) */}
    <div className='fixed inset-x-0 bottom-0 z-40 flex items-center justify-center p-4 pb-6 pointer-events-none'>
      <div className='pointer-events-auto flex items-center gap-2.5 sm:gap-4 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-card)]/95 backdrop-blur-xl shadow-xl flex-wrap justify-center max-w-[calc(100vw-24px)]'>
        {/* Progress bar track */}
        <div className='h-1.5 w-16 sm:w-28 rounded-full bg-[var(--modern-raised)] border border-[var(--modern-border)] overflow-hidden shrink-0'>
          <div
            className='h-full bg-gradient-to-r from-[var(--modern-primary,#4d8dff)] to-emerald-500 transition-all duration-300'
            style={{ width: `${progressStats.percent}%` }}
          />
        </div>

        {/* Counter */}
        <span className='font-mono text-xs font-semibold text-[var(--modern-muted)] shrink-0'>
          {progressStats.completed} / {progressStats.total}
        </span>

        {/* Start / Next Field CTA */}
        <button
          type='button'
          onClick={scrollToNextControl}
          disabled={isLoading || sortedControls.length === 0}
          className='inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[var(--modern-primary,#4d8dff)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border-0 disabled:opacity-50 disabled:pointer-events-none'
        >
          {progressStats.completed === 0
            ? t("signaturePage.Start", "Start")
            : progressStats.completed < progressStats.total
            ? t("signaturePage.NextStep", "Next Step")
            : t("signaturePage.allSet", "All Set")}
        </button>

        {/* Completed Button */}
        {viewOnly ? (
          <button
            type='button'
            onClick={() => setIsConfirmationModalOpen(true)}
            className='inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm border-0 cursor-pointer active:scale-95'
          >
            <Check size={14} />
            <span>{t("signaturePage.confirm", "Confirm")}</span>
          </button>
        ) : (
          <button
            type='button'
            onClick={handleCheckCompletedButton}
            disabled={!enableCompletedButton && !completedControls}
            className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm border-0 ${
              completedControls || enableCompletedButton
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
                : "bg-emerald-600/30 text-emerald-100 cursor-not-allowed opacity-60"
            }`}
          >
            <Check size={14} />
            <span>{t("signaturePage.completed", "Completed")}</span>
          </button>
        )}
      </div>
    </div>

    {/* Confirmation Modal */}
    <ConfirmationModal
      show={isConfirmationModalOpen}
      onHide={() => setIsConfirmationModalOpen(false)}
      onClick={viewOnly ? handleViewOnly : handleCompleted}
    />
  </div>

      {/* audit trail modal */}
      <AuditTrailModal
        show={showATModal}
        auditTrailURL={auditTrailURL}
        handleClose={() => {
          setShowATModal(false);
          setAuditTrailURL("");
        }}
      />
      {/* signature modal */}
      <SignatureModal {...SignatureModalProps} />
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
        />
      )}

      {/* decline modal */}
      <Modal show={showDeclineModal} onHide={closeDeclineModal} dialogClassName='custom-modal-width' backdrop='static' keyboard={false}>
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
        <Modal.Footer className="border-t border-[var(--modern-border)] flex justify-end gap-3 p-3">
          <button
            type="button"
            onClick={closeDeclineModal}
            className="px-5 py-2 text-xs font-semibold rounded-full border border-[var(--modern-border)] text-[var(--modern-text)] bg-[var(--modern-card)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer appearance-none outline-none"
          >
            {t("signaturePage.close")}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold rounded-full border-0 shadow-none outline-none text-white bg-[var(--modern-danger,#ef4444)] hover:opacity-90 active:scale-95 transition-all cursor-pointer appearance-none"
            onClick={handleFileDecline}
            disabled={isLoading}
          >
            {t("signaturePage.submit")}
          </button>
        </Modal.Footer>
      </Modal>

      {/* document failed to load (broken file / unavailable pages) */}
      {docLoadError && <DocumentLoadError />}
    </div>
  );
};

export default SignaturePage;
