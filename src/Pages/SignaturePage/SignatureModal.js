import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Col, Modal, Row, Form, Dropdown } from "@/Components/UI/shadcnCompat";
import verificationService from "@/services/verificationService";
import uploadFlowService from "@/services/uploadFlowService";
import ReactSignatureCanvas from "react-signature-canvas";
import html2canvas from "html2canvas";
import SignatureColor from "./SignatureColor";
import { useTranslation } from "react-i18next";

const SignatureModal = (props) => {
  const {
    fullName,
    setFullName,
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
    textEditor,
    className,
  } = props;

  const [selectedTab, setSelectedTab] = useState("SELECT_SIGN");
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ fullName: "", initials: "", draw: "", upload: "", saved: "" });
  const [selectedStyle, setSelectedStyle] = useState("style1");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSign, setUploadSign] = useState();
  const [extension, setExtension] = useState();
  const [textInput, setTextInput] = useState("");
  const [selectedColor, setSelectedColor] = useState("black");
  const [isSignAllChecked, setIsSignAllChecked] = useState(false);
  const [savedSignature, setSavedSignature] = useState();
  const [isBold, setIsBold] = useState(false);
  const [minWidth, setMinWidth] = useState(0.5);
  const [savedStamp, setSavedStamp] = useState();
  const [drawnSignature, setDrawnSignature] = useState(null);
  const [styleSearchTerm, setStyleSearchTerm] = useState("");
  const previewBoxRef = useRef(null);
  const tabListRef = useRef(null);
  const tabButtonRefs = useRef({});
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0, visible: false });
  const { t } = useTranslation();

  const [isSavedSignature, setIsSavedSignature] = useState(false);

  const [validSavedStamp, setValidSavedStamp] = useState(null);
  const [validSavedSignature, setValidSavedSignature] = useState(null);
  const [isSavedImageValid, setIsSavedImageValid] = useState(false);

  useEffect(() => {
    setTextInput(textEditor);
  }, [textEditor]);

  useEffect(() => {
    setIsSignAllChecked(false);
  }, [showModal]);

  useEffect(() => {
    const savedSignature = sessionStorage.getItem("savedSignature") || localStorage.getItem("savedSignature");
    if (savedSignature && signRef.current) {
      signRef.current.fromDataURL(savedSignature);
    }
  }, [showModal]);

  const styleOptions = [
    { id: "style1", name: "Dancing Script" },
    { id: "style2", name: "Great Vibes" },
    { id: "style8", name: "Alex Brush" },
    { id: "style3", name: "Pacifico" },
    { id: "style13", name: "Parisienne" },
    { id: "style14", name: "Sacramento" },
    { id: "style15", name: "Satisfy" },
    { id: "style4", name: "Covered" },
    { id: "style5", name: "Rochester" },
    { id: "style6", name: "Monsieur" },
    { id: "style7", name: "Engagement" },
    { id: "style9", name: "Allura" },
    { id: "style10", name: "Arizonia" },
    { id: "style11", name: "Kaushan" },
    { id: "style12", name: "Pinyon" },
    { id: "style16", name: "Homemade" },
    { id: "style17", name: "Marck Script" },
    { id: "style18", name: "Shadows" },
    { id: "style19", name: "Tangerine" },
    { id: "ubuntu", name: "Ubuntu" },
    { id: "arial", name: "Arial" },
    { id: "calibri", name: "Calibri" },
    { id: "aptos", name: "Aptos" },
  ];

  useEffect(() => {
    if (controlName === "Stamp" || controlName === "Image") {
      setSelectedTab("UPLOAD");
    } else {
      setSelectedTab("SELECT_SIGN");
    }

    if (selectedTab === "UPLOAD") {
      setPreviewImage(null);
    }
  }, [controlName, showModal]);

  const getSignatureStampVerification = async () => {
    setIsLoading(true);
    try {
      let response;
      if (signatoriesID) {
        response = await uploadFlowService.getSelfSignatureStamp(signatoriesID);
      } else if (auth) {
        response = await verificationService.getSignatureStampVerification(auth);
      } else {
        setIsLoading(false);
        return;
      }

      if (response?.data && (response.data.statusCode === "1" || response.data.successStatus)) {
        const resData = response.data.response || {};
        const mySig = resData.mySignatureBase64 || resData.signatureStampBase64 || resData.mySignatureBase64String || "";
        const compStamp = resData.companyStampBase64 || resData.signatureStampBase64 || resData.companyStampBase64String || "";

        setSavedSignature(mySig);
        setSavedStamp(compStamp || mySig);
      }
    } catch (error) {
      // Saved stamps/signatures are optional. Ignore missing-record responses.
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleTabChange = (tab) => {
    // Save the current signature before switching tabs
    if (selectedTab === "DRAW" && signRef.current) {
      const drawnSignatureData = signRef.current.getTrimmedCanvas().toDataURL("image/png");
      setDrawnSignature(drawnSignatureData);
    }
    // clear tab-specific errors on switch
    setFieldErrors((prev) => ({ ...prev, draw: "", upload: "", saved: "" }));
    setSelectedTab(tab);
  };

  useLayoutEffect(() => {
    const updateTabIndicator = () => {
      const tabList = tabListRef.current;
      const activeButton = tabButtonRefs.current[selectedTab];

      if (!tabList || !activeButton) {
        setTabIndicator((current) => ({ ...current, visible: false }));
        return;
      }

      const listBounds = tabList.getBoundingClientRect();
      const buttonBounds = activeButton.getBoundingClientRect();
      if (buttonBounds.width > 0) {
        setTabIndicator({
          left: buttonBounds.left - listBounds.left,
          width: buttonBounds.width,
          visible: true,
        });
      }
    };

    updateTabIndicator();
    const rafId = requestAnimationFrame(updateTabIndicator);
    const timer = setTimeout(updateTabIndicator, 150);
    window.addEventListener("resize", updateTabIndicator);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      window.removeEventListener("resize", updateTabIndicator);
    };
  }, [selectedTab, showModal, controlName]);

  useEffect(() => {
    if (selectedTab === "DRAW" && drawnSignature && signRef.current) {
      signRef.current.fromDataURL(drawnSignature);
    }
  }, [selectedTab, drawnSignature]);

  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  // Validate if the selected file is an image of type jpg, jpeg, or png
  const isImageFile = (file) => {
    const acceptedFormats = ["image/jpeg", "image/png", "image/jpg"];
    return acceptedFormats.includes(file.type);
  };

  // Resize the image if its width/height exceeds the max dimensions
  const resizeImageIfNeeded = (file, maxWidth = 800, maxHeight = 500, callback) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Only resize if the image is larger than maxWidth x maxHeight
        if (width > maxWidth || height > maxHeight) {
          // Calculate new dimensions to fit within bounds while maintaining aspect ratio
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        // If image is already smaller than maxWidth x maxHeight, use original dimensions

        const canvas = document.createElement("canvas");
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        // Use PNG for lossless quality
        const resizedDataUrl = canvas.toDataURL("image/png");
        callback(resizedDataUrl);
      };

      img.onerror = () => {
        callback(null);
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    setErrorMessage("");
    setFieldErrors((prev) => ({ ...prev, upload: "" }));

    if (selectedFile && isImageFile(selectedFile)) {
      // Determine the correct extension based on the original file type
      let originalExtension = "png"; // default
      if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/jpg") {
        originalExtension = "jpeg";
      } else if (selectedFile.type === "image/png") {
        originalExtension = "png";
      }

      resizeImageIfNeeded(selectedFile, 800, 500, (resizedImageDataUrl) => {
        if (!resizedImageDataUrl) {
          setPreviewImage(null);
          setErrorMessage(t("signatureModal.invalidFileFormat"));
          return;
        }

        setPreviewImage(resizedImageDataUrl);

        const uploadData = extractBase64FromDataURI(resizedImageDataUrl);
        setUploadSign(uploadData);

        // Set the correct extension based on original file type
        setExtension(originalExtension);
      });
    } else {
      setPreviewImage(null);
      setErrorMessage(t("signatureModal.invalidFileFormat"));
    }
  };

  useEffect(() => {
    if (savedStamp) {
      const img = new Image();
      img.onload = () => {
        if (img.width <= 800 && img.height <= 500) {
          setValidSavedStamp(savedStamp);
          setIsSavedImageValid(true);
        } else {
          setValidSavedStamp(null);
          setIsSavedImageValid(false);
        }
      };
      img.src = `data:image/png;base64,${savedStamp}`;
    } else {
      setIsSavedImageValid(false);
    }
  }, [savedStamp]);

  useEffect(() => {
    if (savedSignature) {
      const img = new Image();
      img.onload = () => {
        if (img.width <= 800 && img.height <= 500) {
          setValidSavedSignature(savedSignature);
          setIsSavedImageValid(true);
        } else {
          setValidSavedSignature(null);
          setIsSavedImageValid(false);
        }
      };
      img.src = `data:image/png;base64,${savedSignature}`;
    } else {
      setIsSavedImageValid(false);
    }
  }, [savedSignature]);

  // draw signature
  const signRef = useRef(null);

  const handleClear = () => {
    signRef.current.clear();
    setFieldErrors((prev) => ({ ...prev, draw: "" }));
  };

  const handleDrawSignature = async () => {
    const signatureImage = await signRef.current.getTrimmedCanvas().toDataURL("image/png");
    const drawdata = extractBase64FromDataURI(signatureImage);

    sessionStorage.setItem("savedSignature", signatureImage);
    return drawdata;
  };

  const handleMinWidthChange = (e) => {
    setMinWidth(parseFloat(e.target.value));
  };

  const handleBoldToggle = () => {
    setIsBold(!isBold);
  };

  const renderSignature = () => {
    const boldClass = isBold ? "font-bold" : "font-normal";
    const activeStyleClass = selectedStyle === "default" ? "style1" : selectedStyle;
    return (
      <div className={`signStyle flex items-center justify-center ${boldClass}`} style={{ color: selectedColor, width: "fit-content", backgroundColor: "transparent" }}>
        {controlName === "Signature" && (
          <div className='signature-item py-2'>
            <span className={`${activeStyleClass} text-3xl sm:text-4xl select-none tracking-wide`} style={{ lineHeight: 1.3 }}>
              {fullName || "Your Signature"}
            </span>
          </div>
        )}
        {controlName === "Initial" && (
          <div className='signature-item py-2'>
            <span className={`${activeStyleClass} text-3xl sm:text-4xl select-none tracking-widest uppercase`} style={{ lineHeight: 1.3 }}>
              {initials || "IN"}
            </span>
          </div>
        )}
      </div>
    );
  };

  const extractBase64FromDataURI = (dataURI) => {
    const splitURI = dataURI.split(",");

    if (splitURI.length === 2) {
      const base64Data = splitURI[1];
      return base64Data;
    } else {
      // console.error("Invalid data URI format");
      return null;
    }
  };

  const saveAsBase64 = () => {
    const previewBox = previewBoxRef.current;
    //console.log("preview", previewBox);
    return html2canvas(previewBox, {
      backgroundColor: null,
    })
      .then((canvas) => {
        const base64Image = canvas.toDataURL("image/png");
        const base64Data = extractBase64FromDataURI(base64Image);
        return base64Data;
      })
      .catch((error) => {
        // console.error(error);
      });
  };

  const handleSignButton = async (isBulkSign) => {
    setIsLoading(true);
    let signature;
    let signatureExtension;

    // Validate required fields first
    if (controlName === "Signature" && (!fullName || fullName.trim() === "")) {
      setFieldErrors((prev) => ({ ...prev, fullName: t("signatureModal.fullNameRequired") || "Full name is required" }));
      setIsLoading(false);
      return;
    }

    if (controlName === "Initial" && (!initials || initials.trim() === "")) {
      setFieldErrors((prev) => ({ ...prev, initials: t("signatureModal.initialsRequired") || "Initials are required" }));
      setIsLoading(false);
      return;
    }

    if (selectedTab === "SELECT_SIGN") {
      const selectSignBase64 = await saveAsBase64();
      signature = selectSignBase64;
      signatureExtension = ".png";
    } else if (selectedTab === "DRAW") {
      // require a drawn signature
      if (signRef.current && signRef.current.isEmpty()) {
        setFieldErrors((prev) => ({ ...prev, draw: t("signatureModal.drawSignatureRequired") }));
        setIsLoading(false);
        return;
      }
      const selectDrawBase64 = await handleDrawSignature();
      signature = selectDrawBase64;
      signatureExtension = ".png";
    } else if (selectedTab === "UPLOAD") {
      if (!uploadSign) {
        setFieldErrors((prev) => ({ ...prev, upload: t("signatureModal.uploadRequired") }));
        setIsLoading(false);
        return;
      }
      signature = uploadSign;
      signatureExtension = extension;
    } else if (selectedTab === "SAVED") {
      if (controlName === "Stamp") {
        if (!savedStamp) {
          setFieldErrors((prev) => ({ ...prev, saved: t("signatureModal.noSavedStamp") }));
          setIsLoading(false);
          return;
        }
        signature = savedStamp;
        signatureExtension = ".png";
      } else if (controlName === "Signature" || controlName === "Initial") {
        if (!savedSignature) {
          setFieldErrors((prev) => ({ ...prev, saved: t("signatureModal.noSavedSignature") }));
          setIsLoading(false);
          return;
        }
        signature = savedSignature;
        signatureExtension = ".png";
      }
    }

    if (!signature) {
      setIsLoading(false);
      return;
    }

    const uploadedImage = signature;

    const isSignatureSaved = isSavedSignature ? false : true;
    handleUploadedSignature(uploadedImage, controlLocationID, signatoriesID, controlName, controlID, signatureExtension, selectedMasterDocID, isBulkSign, isSignatureSaved);

    if (auth) {
      try {
        verificationService.createSignActivityVerification(
          {
            Status: `${controlName} uploaded`,
            Message: isBulkSign ? `${signatoryName} uploaded ${controlName} for all relevant sections ` : `${signatoryName} uploaded ${controlName} `,
          },
          auth,
        );
      } catch (error) {
        console.log(error);
      }
    }

    setShowModal(false);
  };

  const handleCheckboxChange = (event) => {
    setIsSignAllChecked(event.target.checked);
  };

  const handleSign = () => {
    if (isSignAllChecked) {
      handleSignButton(true);
    } else {
      handleSignButton(false);
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={closeModal} centered dialogClassName={`custom-modal-width ${className}`}>
        <Modal.Header closeButton className='border-b border-[var(--modern-border)] bg-[var(--modern-card)] px-6 py-4'>
          <Modal.Title className='text-base font-bold text-[var(--modern-text)]'>
            {controlName === "Stamp" && t("signatureModal.stamp_here")}
            {controlName === "Signature" && t("signatureModal.sign_here")}
            {controlName === "Initial" && t("signatureModal.initials_here")}
            {controlName === "Image" && t("signatureModal.upload_image")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className='signature-modal-body bg-[var(--modern-card)] text-[var(--modern-text)] p-4 sm:p-6'>
          <p className='mt-1 mb-2 text-xs font-medium text-[var(--modern-muted)]'>
            {controlName === "Initial"
              ? t("signatureModal.initials_here", "Initials")
              : controlName === "Stamp"
              ? t("signatureModal.stamp_here", "Stamp")
              : controlName === "Image"
              ? t("signatureModal.upload_image", "Image")
              : t("signatureModal.confirmNameSignature", "Confirm your name and signature")}
          </p>
          <Row className='py-2'>
            <Col md={7}>
              {controlName === "Signature" && (
                <>
                  <label htmlFor='name' className='text-xs font-semibold text-[var(--modern-text)] mb-1 block'>
                    {t("createTeam.fullName")}
                    <span className='text-rose-500 mx-1'>*</span>
                  </label>
                  <input
                    type='text'
                    id='name'
                    className='w-full h-11 px-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] text-sm font-semibold outline-none focus:border-[var(--modern-primary,#4d8dff)] focus:ring-2 focus:ring-[var(--modern-primary,#4d8dff)]/20 transition-all'
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                  />
                  {fieldErrors.fullName && <small className='text-xs text-rose-500 mt-1 block'>{fieldErrors.fullName}</small>}
                </>
              )}
              {controlName === "Initial" && (
                <>
                  <label htmlFor='initials' className='text-xs font-semibold text-[var(--modern-text)] mb-1 block'>
                    {t("signatureModal.initials")}
                    <span className='text-rose-500 mx-1'>*</span>
                  </label>
                  <input
                    type='text'
                    id='initials'
                    className='w-full h-11 px-3.5 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] text-sm font-semibold tracking-wider outline-none focus:border-[var(--modern-primary,#4d8dff)] focus:ring-2 focus:ring-[var(--modern-primary,#4d8dff)]/20 transition-all uppercase'
                    value={initials}
                    onChange={(e) => {
                      setInitials(e.target.value);
                      if (fieldErrors.initials) setFieldErrors((prev) => ({ ...prev, initials: "" }));
                    }}
                  />
                  {fieldErrors.initials && <small className='text-xs text-rose-500 mt-1 block'>{fieldErrors.initials}</small>}
                </>
              )}
            </Col>
          </Row>
          <div className='pt-2'>
            <div className='inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--modern-raised)] border border-[var(--modern-border)] mb-4' ref={tabListRef}>
              {controlName === "Stamp" || controlName === "Image" ? null : (
                <>
                  <button
                    type='button'
                    ref={(element) => { tabButtonRefs.current.SELECT_SIGN = element; }}
                    onClick={() => handleTabChange("SELECT_SIGN")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 appearance-none outline-none ${
                      selectedTab === "SELECT_SIGN"
                        ? "bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)] shadow-xs"
                        : "bg-transparent text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
                    }`}
                  >
                    {t("signatureModal.selectStyle")}
                  </button>
                  <button
                    type='button'
                    ref={(element) => { tabButtonRefs.current.DRAW = element; }}
                    onClick={() => handleTabChange("DRAW")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 appearance-none outline-none ${
                      selectedTab === "DRAW"
                        ? "bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)] shadow-xs"
                        : "bg-transparent text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
                    }`}
                  >
                    {t("signatureModal.draw")}
                  </button>
                </>
              )}

              <button
                type='button'
                ref={(element) => { tabButtonRefs.current.UPLOAD = element; }}
                onClick={() => handleTabChange("UPLOAD")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 appearance-none outline-none ${
                  selectedTab === "UPLOAD"
                    ? "bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)] shadow-xs"
                    : "bg-transparent text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
                }`}
              >
                {t("signatureModal.upload")}
              </button>
              {controlName === "Image" ? null : (
                <button
                  type='button'
                  onClick={() => {
                    handleTabChange("SAVED");
                    getSignatureStampVerification();
                  }}
                  ref={(element) => { tabButtonRefs.current.SAVED = element; }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 appearance-none outline-none ${
                    selectedTab === "SAVED"
                      ? "bg-[var(--modern-card)] text-[var(--modern-primary,#4d8dff)] shadow-xs"
                      : "bg-transparent text-[var(--modern-muted)] hover:text-[var(--modern-text)]"
                  }`}
                >
                  {t("signatureModal.saved")}
                </button>
              )}
            </div>

            {selectedTab === "SELECT_SIGN" && (
              <div>
                <div className='flex items-center justify-between flex-wrap gap-2 my-3'>
                  <SignatureColor selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={handleBoldToggle}
                      className={`h-9 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer appearance-none outline-none ${
                        isBold
                          ? "border-[var(--modern-primary,#4d8dff)] bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_12%,var(--modern-card))] text-[var(--modern-primary,#4d8dff)] font-extrabold"
                          : "border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] hover:border-[var(--modern-border-strong)]"
                      }`}
                    >
                      {t("signatureModal.bold")}
                    </button>
                    <Dropdown className='inline-block'>
                      <Dropdown.Toggle variant='none' id='dropdown-basic' className='change-sign-dropdown'>
                        <span className={selectedStyle === "default" ? "style1" : selectedStyle}>
                          {selectedStyle === "default"
                            ? styleOptions[0]?.name || t("signatureModal.changeSign")
                            : styleOptions.find((s) => s.id === selectedStyle)?.name || selectedStyle}
                        </span>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className='style-dropdown-menu rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] shadow-lg'>
                        <div className='p-2 sticky-top bg-[var(--modern-card)] border-b border-[var(--modern-border)]'>
                          <input
                            type='text'
                            className='w-full h-8 px-2.5 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-text)] text-xs outline-none focus:border-[var(--modern-primary,#4d8dff)]'
                            placeholder={t("signatureModal.searchFonts")}
                            value={styleSearchTerm}
                            onChange={(e) => setStyleSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className='style-options-list max-h-56 overflow-y-auto p-1'>
                          {styleOptions
                            .filter((style) => style.name.toLowerCase().includes(styleSearchTerm.toLowerCase()))
                            .map((style) => (
                              <Dropdown.Item
                                key={style.id}
                                className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                                  selectedStyle === style.id
                                    ? "bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_12%,var(--modern-card))] text-[var(--modern-primary,#4d8dff)] font-semibold"
                                    : "text-[var(--modern-text)] hover:bg-[var(--modern-raised)]"
                                }`}
                                onClick={() => setSelectedStyle(style.id)}
                              >
                                <span className={style.id}>{style.name}</span>
                              </Dropdown.Item>
                            ))}
                          {styleOptions.filter((style) => style.name.toLowerCase().includes(styleSearchTerm.toLowerCase())).length === 0 && (
                            <div className='p-3 text-center text-xs text-[var(--modern-muted)]'>
                              {t("uploadDocFlow.notItemsFound")}
                            </div>
                          )}
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                <div className='preview-box flex items-center justify-center p-6 rounded-2xl border border-[var(--modern-border)] bg-white min-h-[150px] shadow-xs'>
                  <div className='signStyle flex items-center justify-center' ref={previewBoxRef}>
                    {renderSignature()}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "DRAW" && (
              <div>
                <div className='flex items-center justify-between flex-wrap gap-2 my-3'>
                  <SignatureColor selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2'>
                      <Form.Label className='text-xs font-semibold text-[var(--modern-muted)] m-0'>
                        {t("signatureModal.Pointer")}
                      </Form.Label>
                      <input
                        type='range'
                        min='0.1'
                        max='5'
                        step='0.1'
                        value={minWidth}
                        onChange={handleMinWidthChange}
                        className='w-24 h-1.5 bg-[var(--modern-border)] rounded-lg appearance-none cursor-pointer accent-[var(--modern-primary,#4d8dff)]'
                      />
                    </div>
                    <button
                      type='button'
                      onClick={handleClear}
                      className='h-8 px-3 rounded-lg border border-[var(--modern-border)] bg-[var(--modern-card)] text-xs font-semibold text-[var(--modern-muted)] hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer appearance-none outline-none'
                    >
                      {t("signatureModal.clear")}
                    </button>
                  </div>
                </div>

                <div className='preview-box flex items-center justify-center p-2 rounded-2xl border border-[var(--modern-border)] bg-white min-h-[160px] shadow-xs'>
                  <ReactSignatureCanvas
                    penColor={selectedColor}
                    minWidth={minWidth}
                    ref={signRef}
                    onBegin={() => {
                      setFieldErrors((prev) => ({ ...prev, draw: "" }));
                    }}
                    canvasProps={{
                      width: 500,
                      height: 150,
                      className: "sigCanvas max-w-full",
                      background: "transparent",
                    }}
                  />
                </div>
                {fieldErrors.draw && <small className='error-message mt-1 w-100'>{fieldErrors.draw}</small>}
              </div>
            )}

            {selectedTab === "UPLOAD" && (
              <div className='space-y-3 pt-2'>
                <div className='preview-box flex items-center justify-center p-3 rounded-2xl border border-[var(--modern-border)] bg-white min-h-[140px] shadow-xs'>
                  {errorMessage ? (
                    <div className='text-xs text-rose-500'>{errorMessage}</div>
                  ) : previewImage ? (
                    <img src={previewImage} alt='Uploaded' className='max-h-28 max-w-full object-contain' />
                  ) : (
                    <span className='text-xs text-[var(--modern-muted)]'>{t("signatureModal.picQuality")}</span>
                  )}
                </div>
                <div className='flex items-center justify-between gap-3'>
                  <button
                    type='button'
                    onClick={handleFileSelect}
                    className='inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-card)] text-xs font-semibold text-[var(--modern-text)] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer'
                  >
                    {controlName === "Stamp" && t("signatureModal.upload_stamp")}
                    {controlName === "Signature" && t("signatureModal.upload_signature")}
                    {controlName === "Initial" && t("signatureModal.upload_initials")}
                    {controlName === "Image" && t("signatureModal.upload_image")}
                  </button>
                  <input type='file' accept='.jpg, .jpeg, .png' style={{ display: "none" }} ref={fileInputRef} onChange={handleFileUpload} />

                  <label className='flex items-center gap-2 cursor-pointer m-0 text-xs text-[var(--modern-muted)]'>
                    <input
                      type='checkbox'
                      checked={isSavedSignature}
                      onChange={() => setIsSavedSignature(!isSavedSignature)}
                      className='h-4 w-4 rounded accent-[var(--modern-primary,#4d8dff)]'
                    />
                    <span>{t("signatureModal.saveForLater")}</span>
                  </label>
                </div>
                {fieldErrors.upload && <small className='text-xs text-rose-500 mt-1 block'>{fieldErrors.upload}</small>}
              </div>
            )}

            {selectedTab === "SAVED" && (
              <div className='pt-2'>
                <div className='preview-box flex items-center justify-center p-3 rounded-2xl border border-[var(--modern-border)] bg-white min-h-[140px] shadow-xs'>
                  {errorMessage ? (
                    <div className='text-xs text-rose-500'>{errorMessage}</div>
                  ) : controlName === "Stamp" ? (
                    validSavedStamp ? (
                      <img src={`data:image/png;base64,${validSavedStamp}`} alt='Saved Stamp' className='max-h-28 max-w-full object-contain' />
                    ) : (
                      <span className='text-xs text-rose-500 italic'>{t("signatureModal.stampSizeExceeded")}</span>
                    )
                  ) : controlName === "Signature" || controlName === "Initial" ? (
                    validSavedSignature ? (
                      <img src={`data:image/png;base64,${validSavedSignature}`} alt='Saved Signature' className='max-h-28 max-w-full object-contain' />
                    ) : (
                      <span className='text-xs text-rose-500 italic'>{t("signatureModal.signatureSizeExceeded")}</span>
                    )
                  ) : null}
                </div>
                {fieldErrors.saved && <small className='text-xs text-rose-500 mt-1 block'>{fieldErrors.saved}</small>}
              </div>
            )}

            <div className='mt-4 p-3 rounded-xl border border-[var(--modern-border)] bg-[var(--modern-raised)]/50 text-xs text-[var(--modern-muted)] leading-relaxed'>
              {t("signatureModal.signatureDesc")}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className='border-t border-[var(--modern-border)] bg-[var(--modern-card)] p-4 flex flex-col gap-3'>
          <div className='flex w-full justify-start items-center gap-2 bulk-sign'>
            <input type='checkbox' id='bulkSignCheckbox' checked={isSignAllChecked} onChange={handleCheckboxChange} className='h-4 w-4 rounded accent-[var(--modern-primary,#4d8dff)] cursor-pointer' />
            <label htmlFor='bulkSignCheckbox' className='text-xs font-medium text-[var(--modern-muted)] cursor-pointer m-0'>
              {t("signatureModal.WnatPlace")}
              {controlName === "Stamp" && ` ${t("signatureModal.stamp", "Stamp")} `}
              {controlName === "Signature" && ` ${t("signatureModal.signature", "Signature")} `}
              {controlName === "Initial" && ` ${t("signatureModal.initials", "Initials")} `}
              {controlName === "Image" && ` ${t("signatureModal.image", "Image")} `}
              {t("signatureModal.relevantSections")}
            </label>
          </div>
          <div className='flex justify-between items-center w-full gap-3'>
            <button
              type='button'
              onClick={closeModal}
              className='px-5 py-2 text-xs font-semibold rounded-full border border-[var(--modern-border)] text-[var(--modern-text)] bg-[var(--modern-card)] hover:bg-[color-mix(in_srgb,var(--modern-primary,#4d8dff)_8%,var(--modern-card))] hover:border-[var(--modern-primary,#4d8dff)] hover:text-[var(--modern-primary,#4d8dff)] transition-all cursor-pointer appearance-none outline-none'
            >
              {t("signatureModal.cancel")}
            </button>

            <button
              type='button'
              onClick={handleSign}
              className='inline-flex items-center justify-center gap-2 px-6 py-2 text-xs font-semibold rounded-full border-0 shadow-none outline-none text-white bg-[var(--modern-primary,#4d8dff)] hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none appearance-none'
              disabled={selectedTab === "SAVED" && !isSavedImageValid}
            >
              {controlName === "Stamp" && t("signatureModal.stamp_now")}
              {controlName === "Signature" && t("signatureModal.sign_now")}
              {controlName === "Initial" && t("signatureModal.initials_now")}
              {controlName === "Image" && t("signatureModal.upload_image")}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SignatureModal;
