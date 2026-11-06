import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import uploadFlowService from "@/services/uploadFlowService";
import { Button, Col, Dropdown, DropdownButton, Row } from "@/Components/UI/shadcnCompat";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SignatureModal from "@/Pages/SignaturePage/SignatureModal";
import { useTranslation } from "react-i18next";
import ImageThumbnails from "@/Components/ImageThumbnails/ImageThumbnails";
import ConfirmationModal from "@/Pages/SignaturePage/ConfirmationModal";
import { Icons } from "@/assets/Icons";
import InputEditors from "@/Pages/SignaturePage/InputEditors";
import PageNavigations from "@/Components/DocumentPreparation/Step2_Canvas/PageNavigations";
import { ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronUp, Sun, Moon, Check, ChevronLeft } from "lucide-react";
import { useTheme } from "@/Context/ThemeContext";

// Normalize Windows-style backslashes in image paths so browsers can fetch page thumbnails
const withNormalizedPageUrls = (items) =>
  Array.isArray(items)
    ? items.map((item) =>
        item && typeof item.pagesPath === "string"
          ? { ...item, pagesPath: item.pagesPath.replace(/\\/g, "/") }
          : item
      )
    : items;

const SignaturePageSelf = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
  const [imagesData, setImagesData] = useState([]);
  const [isThumbnailsExpanded, setIsThumbnailsExpanded] = useState(false);
  const [masterDocPagesId, setMasterDocPagesId] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [controlData, setControlData] = useState([]);
  const [hasLoadedCurrentControls, setHasLoadedCurrentControls] = useState(false);
  const [signatoriesID, setSignatoriesID] = useState();
  const [email, setEmail] = useState();
  const [controlLocationID, setControlLocationID] = useState();
  const [textEditor, setTextEditor] = useState();
  const [isToastDisplayed, setIsToastDisplayed] = useState(false);
  const [registerSignID, setRegisterSignID] = useState();
  const [signatoryName, setSignatoryName] = useState();
  const [showModal, setShowModal] = useState(false);
  const [controlName, setControlName] = useState();
  const [controlID, setControlID] = useState();
  const [uploadedSignature, setUploadedSignature] = useState([]);
  const [allControlData, setAllControlData] = useState(null);
  const [hasLoadedWorkflowControls, setHasLoadedWorkflowControls] = useState(false);
  const [scrollToCalled, setScrollToCalled] = useState(false);
  const [currentControlIndex, setCurrentControlIndex] = useState(0);
  const [sortedControls, setSortedControls] = useState([]);
  const [completedControls, setCompletedControls] = useState(false);
  const [editingStates, setEditingStates] = useState({});
  const [textInput, setTextInput] = useState();
  const indicatorRef = useRef(null);
  const [textUpdated, setTextUpdated] = useState(false);
  const [checkboxValues, setCheckboxValues] = useState({});

  const totalPagesCount = imagesData?.length || 0;
  const halfCount = Math.ceil(totalPagesCount / 2);

  const visibleThumbnails = useMemo(() => {
    if (!imagesData || !Array.isArray(imagesData)) return [];
    if (isThumbnailsExpanded || totalPagesCount <= 6) return imagesData;
    return imagesData.slice(0, halfCount);
  }, [imagesData, isThumbnailsExpanded, totalPagesCount, halfCount]);

  const currentPageIdx = useMemo(() => {
    if (!imagesData || !Array.isArray(imagesData)) return 0;
    const idx = imagesData.findIndex((img) => img.pagesPath === selectedImage);
    return idx >= 0 ? idx : 0;
  }, [imagesData, selectedImage]);

  const progressStats = useMemo(() => {
    const total = sortedControls.length;
    if (total === 0) return { completed: 0, total: 0, percent: 100 };
    const completed = sortedControls.filter((c) => {
      if (["Signature", "Initial", "Stamp", "Image"].includes(c.controlName)) {
        return uploadedSignature.some((item) => item.controlLocationID === c.controlLocationID);
      }
      return c.textEditor && c.textEditor.trim() !== "";
    }).length;
    return {
      completed,
      total,
      percent: Math.min(100, Math.round((completed / total) * 100)),
    };
  }, [sortedControls, uploadedSignature]);

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

  const registerSignIDInitial = localStorage.getItem("registerSignID");

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
        console.error("Error:", error);
      }
    } else {
      scrollToControl(newIndex);
    }
  };

  const scrollToControl = async (index) => {
    const control = sortedControls[index];

    const element = control && document.getElementById(control.controlLocationID);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      if (indicatorRef.current) {
        indicatorRef.current.style.top = control.controlLocationY;
      }
    }
  };

  const navigate = useNavigate();
  const mainDocumentRef = useRef(null);

  const handleDocSelect = async (masterDocID, selectedFolderName, signedDocKey) => {
    setSelectedFolder(selectedFolderName);
    setSelectedMasterDocID(masterDocID);
    setIsThumbnailsExpanded(false);
    setIsLoading(true);
    getMasterDocPages(masterDocID);
    setIsLoading(false);
    try {
      await uploadFlowService.createSelfSignActivity({
        Status: "Document viewed",
        Message: `${signatoryName} viewed  ${selectedFolderName} document`,
      });
    } catch (error) {}
  };

  useEffect(() => {
    if (imagesData && imagesData.length > 0) {
      setSelectedImage(imagesData[0].pagesPath);
      setMasterDocPagesId(imagesData[0].masterDocPagesID);
    }
  }, [imagesData]);

  // Auto-expand thumbnails if the active page is in the latter half
  useEffect(() => {
    if (selectedImage && Array.isArray(imagesData) && imagesData.length > 6) {
      const currentIdx = imagesData.findIndex((img) => img.pagesPath === selectedImage);
      if (currentIdx >= Math.ceil(imagesData.length / 2)) {
        setIsThumbnailsExpanded(true);
      }
    }
  }, [selectedImage, imagesData]);

  useEffect(() => {
    if (selectedImage && mainDocumentRef.current) {
      const img = mainDocumentRef.current.querySelector("img");
      if (img && img.naturalWidth) {
        handleImageLoaded({ target: img });
      }
    }
  }, [selectedImage]);

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
    if (!formData) return;

    let isActive = true;
    setHasLoadedWorkflowControls(false);
    const getControlsData = async () => {
      const files = formData.primaryDocs;
      let accumulatedControlData = [];

      if (Array.isArray(files)) {
        for (const doc of files) {
          try {
            const response = await uploadFlowService.getControlsLocationSelf(doc.masterDocID);

            if (response.data.successStatus) {
              accumulatedControlData = accumulatedControlData.concat(withNormalizedPageUrls(response.data.response));
            }
          } catch (error) {
            // Handle error silently
          }
        }
      } else if (files) {
        try {
          const response = await uploadFlowService.getControlsLocationSelf(files.masterDocID);

          if (response.data.successStatus) {
            accumulatedControlData = accumulatedControlData.concat(withNormalizedPageUrls(response.data.response));
          }
        } catch (error) {
          // Handle error silently
        }
      }
      if (isActive) {
        setAllControlData(accumulatedControlData);
        setHasLoadedWorkflowControls(true);
        setIsLoading(false);
      }
    };

    getControlsData();
    return () => {
      isActive = false;
    };
  }, [formData]);

  useEffect(() => {
    if (!selectedMasterDocID) return;

    let isActive = true;
    setIsLoading(true);
    setHasLoadedCurrentControls(false);
    setControlData([]);
    const getControlsLocation = async () => {
      try {
        const response = await uploadFlowService.getControlsLocationSelf(selectedMasterDocID);

        if (response.data.successStatus) {
          if (isActive) {
            setControlData(withNormalizedPageUrls(response.data.response));
            setHasLoadedCurrentControls(true);
          }
        }
      } catch (error) {
        // Keep completion unavailable if the current document's controls fail to load.
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    getControlsLocation();
    return () => {
      isActive = false;
    };
  }, [selectedMasterDocID]);

  const getMasterDocPages = async (selectedMasterDocID) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getMasterDocPages(selectedMasterDocID);

      if (response?.data?.response && Array.isArray(response.data.response)) {
        const normalized = withNormalizedPageUrls(response.data.response);
        setImagesData(normalized);
        if (!selectedImage && normalized.length > 0) {
          setSelectedImage(normalized[0].pagesPath);
          setMasterDocPagesId(normalized[0].masterDocPagesID);
        }
      } else {
        setImagesData([]);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const getRegisterSignData = async () => {
      try {
        const response = await uploadFlowService.getRegisterSignData(registerSignIDInitial);

        if (response.data.successStatus) {
          setFormData(response.data.response);

          setRegisterSignID(response.data.response.registerSignID);
          const firstDocument = response.data.response.primaryDocs[0];
          const firstDocName = firstDocument.docName;
          setSelectedFolder(firstDocName);

          const firstMasterDocID = firstDocument.masterDocID;
          getMasterDocPages(firstMasterDocID);
          setSelectedMasterDocID(firstMasterDocID);

          const pendingSignatory = response.data.response.signatories.find((signatory) => signatory.signStatus === "Not Started");

          const language = pendingSignatory.languageType === "Arabic" ? "ar" : "en";
          localStorage.setItem("language", language);
          setSignatoryName(pendingSignatory.name);

          setIsLoading(false);
        }
      } catch (error) {
        if (error?.response?.data?.statusCode === "6") {
          navigate("/alreadySigned");
        } else if (error?.response?.data?.statusCode === "11") {
          navigate("/alreadyDeclined");
        } else if (error?.response?.data?.statusCode === "13") {
          navigate("/LinkExpired");
        } else if (error?.response?.data?.statusCode === "14") {
          navigate("/docRecalled");
        }
        setIsLoading(false);
      }
    };
    getRegisterSignData();
  }, []);

  useEffect(() => {
    if (isToastDisplayed) {
      toast.info(t("signaturePage.docSignedByOneSignatory"));
    }
  }, [isToastDisplayed]);

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
          selectedMasterDocID: item.masterDocID || selectedMasterDocID,
          isSignatureSaved: isSavedSignature, // Store the saved state here
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
    handleUploadedSignature,
    signatoryName,
    textEditor,
  };

  const handleCompleted = async () => {
    try {
      setIsLoading(true);
      if (uploadedSignature.length === 0) {
        // Text-like controls are persisted as they are edited. If there are no
        // image controls to submit, finish the signing session after validation.
        localStorage.clear();
        navigate("/home");
        return;
      }

      if (uploadedSignature.length > 0) {
        const apiEndpoint = "/v1.0/api/UpdateControlLocationSelfSignature";
        const requestBodies = [];
        for (const signatureItem of uploadedSignature) {
          let extension = signatureItem.imageExtension;
          if (!extension || !extension.includes(".png")) {
            extension = ".png";
          }
          const requestBody = {
            ControlLocationID: signatureItem.controlLocationID,
            MasterDocID: signatureItem.selectedMasterDocID || selectedMasterDocID,
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

        const response = await uploadFlowService.updateControlLocationSelf(requestBodies);

        if (response.data.successStatus) {
          setIsLoading(false);
          localStorage.clear();
          navigate("/home");
        }
      }

      setIsLoading(false);
    } catch (error) {
      if (error?.response?.data?.statusCode === "19" || error?.response?.data?.successStatus === "false") {
        setIsConfirmationModalOpen(false);
        toast.error("Signature image exceeds! Try with small image.");
      }
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

      await uploadFlowService.updateSelfTextEditor(body);

      setControlData((prevData) => prevData.map((control) => (control.controlLocationID === controlLocationID ? { ...control, textEditor: text } : control)));

      setAllControlData((prevData) =>
        prevData ? prevData.map((control) => (control.controlLocationID === controlLocationID ? { ...control, textEditor: text, controlStatus: "Signed" } : control)) : null
      );

      // Set textUpdated to trigger recalculation
      setTextUpdated((prevState) => !prevState);

      try {
        await uploadFlowService.createSelfSignActivity({
          Status: `Text is added`,
          Message: `${signatoryName} added text [${text}] `,
        });
      } catch (error) {
        console.error("Error logging text addition activity:", error);
      }
      setShowModal(false);
    } catch (error) {
      toast.error("Something went wrong. Try again later.");
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event, controlLocationID) => {
    const date = event.target.value;
    handleTextButton(controlLocationID, date);
  };

  const handleCheckCompletedButton = () => {
    if (!isCompletionReady) return;
    if (completedControls) {
      setIsConfirmationModalOpen(true);
    } else {
      toast.error("There are some pending signatures. Please sign it.");
    }
  };

  useEffect(() => {
    const pendingControls = allControlData && allControlData.filter((control) => control.controlStatus === "Pending");

    const requiresUpload =
      pendingControls &&
      pendingControls.some((control) => control.controlName === "Stamp" || control.controlName === "Initial" || control.controlName === "Signature" || control.controlName === "Image");

    if (!requiresUpload) {
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

    setCompletedControls(allControlIdsPresent);
  }, [allControlData, uploadedSignature]);

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

  const isCompletionReady = Boolean(
    formData && hasLoadedWorkflowControls && hasLoadedCurrentControls && !isLoading
  );

  const handleBack = async () => {
    setActiveStep(2);
    setCompletedSteps([1, 2]);
  };

  return (
    <div className='w-full bg-[var(--modern-bg)] min-h-[calc(100vh-140px)] flex flex-col relative'>
      {/* Studio Stage Top Bar: Document selector, pager, and zoom controls */}
      <div className='stage-topbar shrink-0 z-20 px-3 sm:px-6 h-14 flex items-center justify-between gap-3 border-b border-[var(--modern-border)] bg-[var(--modern-card)]/90 backdrop-blur-md'>
        {/* Left: Document Selector Dropdown & Page Count */}
        <div className='flex items-center gap-2 min-w-0'>
          {formData?.primaryDocs?.length > 1 ? (
            <Dropdown>
              <Dropdown.Toggle
                variant='none'
                className='flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)] text-xs font-semibold text-[var(--modern-text)] hover:border-[var(--modern-border-strong)] transition-all shadow-none outline-none'
              >
                <span className='truncate max-w-[180px] sm:max-w-[240px]' title={selectedFolder || ""}>
                  {selectedFolder || t("uploadDocFlow.selectDocument", "Select Document")}
                </span>
                <ChevronDown size={14} className='shrink-0 opacity-60' />
              </Dropdown.Toggle>
              <Dropdown.Menu className='max-h-60 overflow-y-auto p-1.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] shadow-lg z-50'>
                {formData.primaryDocs.map((doc) => (
                  <Dropdown.Item
                    key={doc.masterDocID}
                    onClick={() => handleDocSelect(doc.masterDocID, doc.docName, doc.signedDocKey)}
                    className='px-3 py-2 text-xs rounded-lg text-[var(--modern-text)] hover:bg-[var(--modern-raised)] transition-colors truncate font-medium'
                  >
                    {doc.docName}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <span className='text-xs sm:text-sm font-semibold text-[var(--modern-text)] truncate max-w-[200px] sm:max-w-[280px]' title={selectedFolder || ""}>
              {selectedFolder || t("uploadDocFlow.document", "Document")}
            </span>
          )}

          {/* Current Page Badge */}
          {imagesData && imagesData.length > 0 && (
            <span className='hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium text-[var(--modern-muted)] bg-[var(--modern-raised)] border border-[var(--modern-border)] shrink-0'>
              {t("uploadDocFlow.page", "Page")} {currentPageIdx + 1} / {totalPagesCount}
            </span>
          )}
        </div>

        {/* Center: Page Navigations (‹ X of Y ›) */}
        <div className='flex items-center justify-center shrink-0'>
          <PageNavigations
            imagesData={imagesData}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            onImageSelect={handleImageSelect}
          />
        </div>

        {/* Right: Integrated Zoom / Scaling Controls */}
        <div className='flex items-center gap-1 rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-card)] p-1 shadow-xs shrink-0'>
          <button
            type='button'
            onClick={handleZoomOut}
            disabled={zoomScale <= 0.25}
            title={t("uploadDocFlow.zoomOut", "Zoom out")}
            aria-label='Zoom out'
            className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:border-[var(--modern-border)] cursor-pointer transition-colors'
          >
            <ZoomOut size={13} />
          </button>

          <button
            type='button'
            onClick={handleFitToggle}
            title='Reset to 100%'
            className={`min-w-[48px] px-2 py-0.5 rounded-full border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
              isFitMode
                ? "border-[var(--modern-primary)] bg-[var(--modern-primary)]/15 text-[var(--modern-primary)]"
                : "border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)]"
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
            className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:border-[var(--modern-border)] cursor-pointer transition-colors'
          >
            <ZoomIn size={13} />
          </button>

          <div className='h-4 w-px bg-[var(--modern-border-strong)] mx-0.5' />

          <button
            type='button'
            onClick={handleFitToggle}
            title='Fit to screen'
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
              isFitMode
                ? "border-[var(--modern-primary)] bg-[var(--modern-primary)] text-white"
                : "border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-primary)] hover:bg-[var(--modern-card)]"
            }`}
          >
            <Maximize2 size={12} />
            <span className='hidden sm:inline'>Fit</span>
          </button>

          <div className='h-4 w-px bg-[var(--modern-border-strong)] mx-0.5' />

          <button
            type='button'
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("header.switchToLightMode", "Switch to light mode") : t("header.switchToDarkMode", "Switch to dark mode")}
            title={theme === "dark" ? t("header.switchToLightMode", "Switch to light mode") : t("header.switchToDarkMode", "Switch to dark mode")}
            className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] cursor-pointer transition-colors'
          >
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>

      {/* Horizontal Page Thumbnails Strip */}
      {imagesData && imagesData.length > 0 && (
        <div className='shrink-0 px-4 pt-3 pb-2.5 border-b border-[var(--modern-border)] bg-[var(--modern-card)]/90 backdrop-blur-md overflow-x-auto custom-scrollbar'>
          <div className='flex items-center gap-3 min-w-max mx-auto justify-center'>
            {visibleThumbnails.map((img, idx) => {
              const originalIdx = imagesData.findIndex((item) => item.masterDocPagesID === img.masterDocPagesID);
              const displayIdx = originalIdx >= 0 ? originalIdx : idx;
              const isCurrent = img.pagesPath === selectedImage;
              const pagePendingFields = sortedControls.filter(
                (c) =>
                  String(c.masterDocPagesID) === String(img.masterDocPagesID) &&
                  (["Signature", "Initial", "Stamp", "Image"].includes(c.controlName)
                    ? !uploadedSignature.some((item) => item.controlLocationID === c.controlLocationID)
                    : !c.textEditor || c.textEditor.trim() === "")
              ).length;

              return (
                <button
                  key={img.masterDocPagesID || displayIdx}
                  type='button'
                  onClick={() => handleImageSelect(img.pagesPath, img.masterDocPagesID)}
                  aria-label={`${t("uploadDocFlow.page", "Page")} ${displayIdx + 1}`}
                  className={`group relative w-14 sm:w-16 aspect-[8.5/11] rounded-lg border-2 overflow-hidden bg-white cursor-pointer transition-all shrink-0 shadow-xs ${
                    isCurrent
                      ? "border-[var(--modern-primary,#4d8dff)] ring-2 ring-[var(--modern-primary,#4d8dff)]/25 scale-[1.03]"
                      : "border-[var(--modern-border)] hover:border-[var(--modern-border-strong)] opacity-85 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.pagesPath}
                    alt={`Page ${displayIdx + 1}`}
                    className='w-full h-full object-cover pointer-events-none'
                    onError={(e) => {
                      e.currentTarget.style.opacity = "0.3";
                    }}
                  />
                  {pagePendingFields > 0 && (
                    <span className='absolute top-0.5 left-0.5 rtl:left-auto rtl:right-0.5 z-10 h-4 min-w-[16px] px-1 rounded-full bg-[var(--modern-primary,#4d8dff)] text-white text-[9px] font-bold flex items-center justify-center shadow-xs'>
                      {pagePendingFields}
                    </span>
                  )}
                  <span className='absolute bottom-0.5 right-0.5 rtl:right-auto rtl:left-0.5 z-10 rounded bg-[var(--modern-card)]/90 px-1 py-0.2 font-mono text-[9px] font-semibold text-[var(--modern-text)] border border-[var(--modern-border)]'>
                    {displayIdx + 1}
                  </span>
                </button>
              );
            })}

            {imagesData.length > 6 && (
              <button
                type='button'
                onClick={() => setIsThumbnailsExpanded((prev) => !prev)}
                className='h-16 px-3 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] hover:bg-[var(--modern-card)] text-[11px] font-semibold text-[var(--modern-primary,#4d8dff)] flex flex-col items-center justify-center gap-1 transition-all shrink-0 cursor-pointer'
              >
                {isThumbnailsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{isThumbnailsExpanded ? t("signaturePage.showLessPages", "Less") : `${imagesData.length - visibleThumbnails.length}+`}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ruled Canvas Desk (Full-width centered desk) */}
      <div
        ref={canvasScrollRef}
        className='flex-1 min-h-[520px] max-h-[calc(100vh-230px)] p-4 sm:p-8 flex flex-col items-center justify-start overflow-y-auto overflow-x-auto bg-[var(--modern-raised)] pb-24'
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
                        alt='document page'
                        onLoad={handleImageLoaded}
                        className='block w-full h-auto select-none pointer-events-none'
                      />

                  {controlData.map((control, index) => {
                    const matchedSignatory = formData?.signatories?.find(
                      (signatory) =>
                        String(signatory.signatoriesID) === String(control.signatoriesID)
                    );
                    const controlBorderColor =
                      control.signatureColor?.trim() ||
                      matchedSignatory?.signatureColor?.trim() ||
                      "var(--modern-primary, #4d8dff)";
                    const fieldColor =
                      control.fontColor && control.fontColor.trim() !== ""
                        ? control.fontColor
                        : controlBorderColor;

                    return (
                      control.masterDocPagesID === masterDocPagesId &&
                      (control.controlStatus === "Pending" ? (
                        <div
                          key={control.controlLocationID || `pending-ctrl-${index}`}
                          id={control.controlLocationID}
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
                                color: fieldColor,
                                fontSize: control.fontSize || "",
                                width: control.width,
                                height: control.height,
                                border:
                                  control.controlName === "QR Code"
                                    ? "none"
                                    : `2px dashed ${controlBorderColor}`,
                                backgroundColor:
                                  uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ||
                                  control.controlName === "QR Code"
                                    ? "transparent"
                                    : `color-mix(in srgb, ${controlBorderColor} 10%, rgba(255, 255, 255, 0.88))`,
                                borderRadius: "6px",
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
                                  const targetName = control.name || signatoryName || "";
                                  if (targetName) {
                                    const nameParts = targetName.split(" ").filter(Boolean);
                                    const initial = nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
                                    setFullName(targetName);
                                    setInitials(initial);
                                  }
                                  openModal(control.controlLocationID, control.signatoriesID, control.email || email, control.controlName, control.controlID, control.textEditor);
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
                                      alt='Loaded signature'
                                      style={{
                                        width: control.width,
                                        height: control.height,
                                        border: "none",
                                      }}
                                    />
                                  </>
                                ) : (
                                  <div className='font-semibold'>{control.customPlaceHolder || "Signature"}</div>
                                )
                              ) : control.controlName === "Initial" ? (
                                uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ? (
                                  <>
                                    <img
                                      src={`data:image/png;base64, ${uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID).uploadedImage}`}
                                      alt='Loaded signature'
                                      style={{
                                        width: control.width,
                                        height: control.height,
                                        border: "none",
                                      }}
                                    />
                                  </>
                                ) : (
                                  <div className='font-semibold'>{control.customPlaceHolder || "Initial"}</div>
                                )
                              ) : control.controlName === "Stamp" ? (
                                uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ? (
                                  <>
                                    <img
                                      src={`data:image/png;base64, ${uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID).uploadedImage}`}
                                      alt='Loaded signature'
                                      style={{
                                        width: control.width,
                                        height: control.height,
                                        border: "none",
                                      }}
                                    />
                                  </>
                                ) : (
                                  <div className='font-semibold'>{control.customPlaceHolder || "Stamp"}</div>
                                )
                              ) : control.controlName === "Image" ? (
                                uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID) ? (
                                  <>
                                    <img
                                      src={`data:image/png;base64, ${uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID).uploadedImage}`}
                                      alt='Loaded imgage'
                                      style={{
                                        width: control.width,
                                        height: control.height,
                                        border: "none",
                                      }}
                                    />
                                  </>
                                ) : (
                                  <div className='font-semibold'>{control.customPlaceHolder || "Image"}</div>
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

                                  {control.controlName === "Date" && (
                                    <div>
                                      <div
                                        style={{
                                          width: control.width ? control.width : "px",
                                          height: control.height ? control.height : "px",
                                          padding: "10px ",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <input
                                          type='date'
                                          value={control.textEditor || ""}
                                          onChange={(event) => handleDateChange(event, control.controlLocationID)}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                            cursor: "pointer",
                                            background: "transparent",
                                            color: "inherit",
                                            outline: "none",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {control.controlName === "Radio" && (
                                    <div
                                      style={{
                                        width: control.width || "auto",
                                        height: control.height || "auto",
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
                                        <label htmlFor={`radio${control.controlLocationID}`} style={{ color: "inherit" }}>
                                          {control.customPlaceHolder}
                                        </label>
                                      </div>
                                    </div>
                                  )}

                                  {control.controlName === "Checkbox" && (
                                    <div
                                      style={{
                                        width: control.width || "auto",
                                        height: control.height || "auto",
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
                                        <label htmlFor={`checkbox${control.controlLocationID}`} style={{ color: "inherit" }}>
                                          {control.customPlaceHolder}
                                        </label>
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
                            key={control.controlLocationID || `signed-ctrl-${index}`}
                            className='draggable-button-container'
                            style={{
                              position: "absolute",
                              left: control.controlLocationX,
                              top: control.controlLocationY,
                              fontFamily: control.fontStyle || "",
                              color: control.fontColor && control.fontColor.trim() !== "" ? control.fontColor : "#0f172a",
                              fontSize: control.fontSize || "",
                            }}
                          >
                            {control.controlName === "Company" && control.company === "" ? null : (
                              <Button
                                className='field-button'
                                style={{
                                  backgroundColor: "transparent",
                                  color: control.fontColor && control.fontColor.trim() !== "" ? control.fontColor : "#0f172a",
                                  border: `2px dashed ${controlBorderColor}`,
                                  borderRadius: "6px",
                                  width: control.width,
                                  height: control.height,
                                }}
                                title={control.email + " " + control.name}
                              >
                                {control.controlName === "Signature" && (
                                  <img
                                    src={control.signature}
                                    alt='Signature loaded'
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
                                    alt='Initial loaded'
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
                                    alt='Stamp loaded'
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
                                    alt='Signature loaded'
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
                                      <label htmlFor={`radio${control.controlLocationID}`} style={{ color: "inherit" }}>
                                        {control.customPlaceHolder}
                                      </label>
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
                                      <label htmlFor={`checkbox${control.controlLocationID}`} style={{ color: "inherit" }}>
                                        {control.customPlaceHolder}
                                      </label>
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

    {/* Floating Bottom Dock (Progress bar + Counter + Start/Next CTA + Completed CTA) */}
    <div className='fixed inset-x-0 bottom-0 z-40 flex items-center justify-center p-4 pb-6 pointer-events-none'>
      <div className='pointer-events-auto flex items-center gap-2.5 sm:gap-4 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-card)]/95 backdrop-blur-xl shadow-xl flex-wrap justify-center max-w-[calc(100vw-24px)]'>
        {/* Back Button (if within stepper flow) */}
        {setActiveStep && (
          <button
            type='button'
            onClick={handleBack}
            disabled={isLoading}
            className='inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--modern-border)] bg-[var(--modern-card)] text-xs font-semibold text-[var(--modern-text)] hover:bg-[var(--modern-raised)] hover:border-[var(--modern-border-strong)] transition-all cursor-pointer'
          >
            <ChevronLeft size={14} className='rtl:rotate-180' />
            <span>{t("uploadDocFlow.back", "Back")}</span>
          </button>
        )}

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
        <button
          type='button'
          onClick={handleCheckCompletedButton}
          disabled={!isCompletionReady}
          className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm border-0 ${
            isCompletionReady && completedControls
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
              : isCompletionReady
              ? "bg-[var(--modern-raised)] text-[var(--modern-muted)] hover:text-[var(--modern-text)] cursor-pointer border border-[var(--modern-border)]"
              : "bg-emerald-600/30 text-emerald-100 cursor-not-allowed opacity-60"
          }`}
          aria-disabled={!isCompletionReady || !completedControls}
        >
          <Check size={14} />
          <span>{t("signaturePage.completed", "Completed")}</span>
        </button>
      </div>
    </div>

    <ConfirmationModal
      show={isConfirmationModalOpen}
      onHide={() => setIsConfirmationModalOpen(false)}
      onClick={handleCompleted}
    />

    <SignatureModal {...SignatureModalProps} />
  </div>
);
};

export default SignaturePageSelf;
