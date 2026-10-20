import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Col, Modal, Row, Form, Dropdown } from "react-bootstrap";
import verificationService from "@/services/verificationService";
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
  const [selectedStyle, setSelectedStyle] = useState("default");
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
    { id: "arial", name: "Arial" },
    { id: "aptos", name: "Aptos" },
    { id: "calibri", name: "Calibri" },
    { id: "ubuntu", name: "Ubuntu" },
    { id: "style1", name: "Dancing Script" },
    { id: "style2", name: "Great Vibes" },
    { id: "style3", name: "Pacifico" },
    { id: "style4", name: "Covered" },
    { id: "style5", name: "Rochester" },
    { id: "style6", name: "Monsieur" },
    { id: "style7", name: "Engagement" },
    { id: "style8", name: "Alex Brush" },
    { id: "style9", name: "Allura" },
    { id: "style10", name: "Arizonia" },
    { id: "style11", name: "Kaushan" },
    { id: "style12", name: "Pinyon" },
    { id: "style13", name: "Parisienne" },
    { id: "style14", name: "Sacramento" },
    { id: "style15", name: "Satisfy" },
    { id: "style16", name: "Homemade" },
    { id: "style17", name: "Marck Script" },
    { id: "style18", name: "Shadows" },
    { id: "style19", name: "Tangerine" },
  ];

  useEffect(() => {
    if (controlName === "Stamp") {
      setSelectedTab("UPLOAD");
      getSignatureStampVerification();
    }

    if (controlName === "Image") {
      setSelectedTab("UPLOAD");
    }

    if (selectedTab === "UPLOAD") {
      setPreviewImage(null);
    }
  }, [controlName]);

  const getSignatureStampVerification = async () => {
    setIsLoading(true);
    try {
      const response = await verificationService.getSignatureStampVerification(auth);

      if (response.data.statusCode === "1") {
        const { mySignatureBase64String, companyStampBase64String } = response.data.response;

        setSavedSignature(mySignatureBase64String);
        setSavedStamp(companyStampBase64String);
      }
    } catch (error) {
      // console.error(error);
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
      setTabIndicator({
        left: buttonBounds.left - listBounds.left,
        width: buttonBounds.width,
        visible: true,
      });
    };

    updateTabIndicator();
    window.addEventListener("resize", updateTabIndicator);
    return () => window.removeEventListener("resize", updateTabIndicator);
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
    const boldClass = isBold ? "fw-bold" : "";
    return (
      <div className={`signStyle d-flex align-items-center ${boldClass}`} style={{ color: selectedColor, width: "fit-content", backgroundColor: "transparent" }}>
        {controlName === "Signature" && (
          <div className='signature-item'>
            <h1 className={`${selectedStyle} ${boldClass}`}>{fullName}</h1>
          </div>
        )}
        {controlName === "Initial" && (
          <div className='signature-item'>
            <h1 className={`${selectedStyle} ${boldClass}`}>{initials}</h1>
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
      } else if (controlName === "Signature") {
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
      <Modal show={showModal} onHide={closeModal} dialogClassName={`custom-modal-width ${className}`}>
        <Modal.Header closeButton>
          <Modal.Title>
            {controlName === "Stamp" && t("signatureModal.stamp_here")}
            {controlName === "Signature" && t("signatureModal.sign_here")}
            {controlName === "Initial" && t("signatureModal.initials_here")}
            {controlName === "Image" && t("signatureModal.upload_image")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className='signature-modal-body'>
          <p className='mt-3 mb-0'>{t("signatureModal.confirmNameSignature")}</p>
          <Row className='py-2'>
            <Col md={7}>
              {controlName === "Signature" && (
                <>
                  <label htmlFor='name'>
                    {t("createTeam.fullName")}
                    <span className='text-danger mx-1'>*</span>
                  </label>
                  <br />
                  <input
                    type='text'
                    id='name'
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                  />
                  {fieldErrors.fullName && <small className='error-message mt-1 w-100'>{fieldErrors.fullName}</small>}
                </>
              )}
              {controlName === "Initial" && (
                <>
                  <label htmlFor='initials'>
                    <b> {t("signatureModal.initials")}</b>
                    <span className='text-danger mx-1'>*</span>
                  </label>
                  <br />
                  <input
                    type='text'
                    id='initials'
                    value={initials}
                    onChange={(e) => {
                      setInitials(e.target.value);
                      if (fieldErrors.initials) setFieldErrors((prev) => ({ ...prev, initials: "" }));
                    }}
                  />
                  {fieldErrors.initials && <small className='error-message mt-1 w-100'>{fieldErrors.initials}</small>}
                </>
              )}
            </Col>
          </Row>
          <div className='signature_tabs pt-2'>
            <div className='nav-links signature-tab-list' ref={tabListRef}>
              {controlName === "Stamp" || controlName === "Image" ? null : (
                <>
                  <button ref={(element) => { tabButtonRefs.current.SELECT_SIGN = element; }} onClick={() => handleTabChange("SELECT_SIGN")} className={`signature-tab-button ${selectedTab === "SELECT_SIGN" ? "active-tab" : ""}`}>
                    {t("signatureModal.selectStyle")}
                  </button>
                  <button ref={(element) => { tabButtonRefs.current.DRAW = element; }} onClick={() => handleTabChange("DRAW")} className={`signature-tab-button ${selectedTab === "DRAW" ? "active-tab" : ""}`}>
                    {t("signatureModal.draw")}
                  </button>
                </>
              )}

              <button ref={(element) => { tabButtonRefs.current.UPLOAD = element; }} onClick={() => handleTabChange("UPLOAD")} className={`signature-tab-button ${selectedTab === "UPLOAD" ? "active-tab" : ""}`}>
                {t("signatureModal.upload")}
              </button>
              {controlName === "Image" ? null : (
                <button
                  onClick={() => {
                    handleTabChange("SAVED");
                    getSignatureStampVerification();
                  }}
                  ref={(element) => { tabButtonRefs.current.SAVED = element; }}
                  className={`signature-tab-button ${selectedTab === "SAVED" ? "active-tab" : ""}`}
                >
                  {t("signatureModal.saved")}
                </button>
              )}
              <span
                aria-hidden='true'
                className='signature-tab-indicator'
                style={{
                  opacity: tabIndicator.visible ? 1 : 0,
                  transform: `translateX(${tabIndicator.left}px)`,
                  width: `${tabIndicator.width}px`,
                }}
              />
            </div>
            <hr className='m-0' />

            {selectedTab === "SELECT_SIGN" && (
              <div>
                <div className='d-flex justify-content-between align-items-center my-3'>
                  {/* <b>Preview</b> */}
                  <SignatureColor selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
                  <div>
                    <button style={{ fontFamily: "Ubuntu" }} className={isBold ? "active-tab" : ""} onClick={handleBoldToggle}>
                      {t("signatureModal.bold")}
                    </button>
                    <Dropdown className='d-inline-block ml-2'>
                      <Dropdown.Toggle variant='none' id='dropdown-basic' className='change-sign-dropdown '>
                        <span className={selectedStyle === "default" ? "" : selectedStyle}>
                          {selectedStyle === "default" ? t("signatureModal.changeSign") : styleOptions.find((s) => s.id === selectedStyle)?.name || selectedStyle}
                        </span>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className='style-dropdown-menu'>
                        <div className='p-2 sticky-top bg-white border-bottom'>
                          <input
                            type='text'
                            className='form-control form-control-sm'
                            placeholder={t("signatureModal.searchFonts")}
                            value={styleSearchTerm}
                            onChange={(e) => setStyleSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className='style-options-list'>
                          {styleOptions
                            .filter((style) => style.name.toLowerCase().includes(styleSearchTerm.toLowerCase()))
                            .map((style) => (
                              <Dropdown.Item key={style.id} className={`style-dropdown-item ${selectedStyle === style.id ? "active-style-item" : ""}`} onClick={() => setSelectedStyle(style.id)}>
                                <span className={style.id}>{style.name}</span>
                              </Dropdown.Item>
                            ))}
                          {styleOptions.filter((style) => style.name.toLowerCase().includes(styleSearchTerm.toLowerCase())).length === 0 && (
                            <div className='p-3 text-center text-muted' style={{ fontSize: "12px" }}>
                              {t("uploadDocFlow.notItemsFound")}
                            </div>
                          )}
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                <div className='preview-box d-flex align-items-center'>
                  <div className='signStyle' ref={previewBoxRef}>
                    {renderSignature()}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "DRAW" && (
              <div>
                <div className='d-flex justify-content-between flex-wrap align-items-start my-3'>
                  {/* <b>Draw signature</b> */}

                  <SignatureColor selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
                  <div className='d-flex align-items-start justify-content-end'>
                    <div className='d-flex align-items-start gap-1 justify-content-end'>
                      <Form.Label>{t("signatureModal.Pointer")}</Form.Label>
                      <Form.Group controlId='minWidthSlider' className='mx-1' style={{ width: "50%" }}>
                        <input type='range' min='0.1' max='5' step='0.1' value={minWidth} onChange={handleMinWidthChange} />
                      </Form.Group>
                    </div>
                    <button onClick={handleClear}>{t("signatureModal.clear")}</button>
                  </div>
                </div>

                <div className='preview-box'>
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
                      className: "sigCanvas",
                      background: "transparent",
                    }}
                  />
                </div>
                {fieldErrors.draw && <small className='error-message mt-1 w-100'>{fieldErrors.draw}</small>}
              </div>
            )}

            {selectedTab === "UPLOAD" && (
              <div>
                <div className='d-flex justify-content-between my-3'>{/* <b>Preview</b> */}</div>
                <div className='preview-box mb-2 d-flex align-items-center p-2'>
                  {errorMessage ? <div className='error-message'>{errorMessage}</div> : previewImage && <img src={previewImage} alt='Uploaded' style={{ maxWidth: "100%", maxHeight: "100%" }} />}
                </div>
                <div>
                  <Button onClick={handleFileSelect} className='signature-button'>
                    {controlName === "Stamp" && t("signatureModal.upload_stamp")}
                    {controlName === "Signature" && t("signatureModal.upload_signature")}
                    {controlName === "Initial" && t("signatureModal.upload_initials")}
                    {controlName === "Image" && t("signatureModal.upload_image")}
                  </Button>
                  <input type='file' accept='.jpg, .jpeg, .png' style={{ display: "none" }} ref={fileInputRef} onChange={handleFileUpload} />
                </div>
                {fieldErrors.upload && <small className='error-message mt-1 w-100'>{fieldErrors.upload}</small>}
                <small>{t("signatureModal.picQuality")}</small>
                <br />
                <div className='adopt-text my-2'>
                  <input type='checkbox' className='form-check-input mx-2' checked={isSavedSignature} onChange={() => setIsSavedSignature(!isSavedSignature)} />
                  <small style={{ fontStyle: "italic", color: "red" }}>{t("signatureModal.saveForLater")}</small>
                </div>
              </div>
            )}

            {selectedTab === "SAVED" && (
              <div>
                <div className='d-flex justify-content-between my-3'></div>
                <div className='preview-box mb-2 d-flex align-items-center p-2'>
                  {errorMessage ? (
                    <div className='error-message'>{errorMessage}</div>
                  ) : controlName === "Stamp" ? (
                    validSavedStamp ? (
                      <img src={`data:image/png;base64,${validSavedStamp}`} alt='Saved Stamp' style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    ) : (
                      <small style={{ fontStyle: "italic", color: "red" }}>{t("signatureModal.stampSizeExceeded")}</small>
                    )
                  ) : controlName === "Signature" ? (
                    validSavedSignature ? (
                      <img src={`data:image/png;base64,${validSavedSignature}`} alt='Saved Signature' style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    ) : (
                      <small style={{ fontStyle: "italic", color: "red" }}>{t("signatureModal.signatureSizeExceeded")}</small>
                    )
                  ) : null}
                </div>
                {fieldErrors.saved && <small className='error-message mt-1 w-100'>{fieldErrors.saved}</small>}
              </div>
            )}

            <div className='adopt-text my-2'>
              <small>{t("signatureModal.signatureDesc")}</small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className='d-flex w-100 mb-2 justify-content-start align-items-center bulk-sign'>
            <input type='checkbox' checked={isSignAllChecked} onChange={handleCheckboxChange} className='form-check-input mx-2' />
            <small style={{ fontStyle: "italic", color: "red" }}>
              {t("signatureModal.WnatPlace")}
              {controlName === "Stamp" && " Stamp "}
              {controlName === "Signature" && " Signature "}
              {controlName === "Initial" && " Initials "}
              {controlName === "Image" && " Image "}
              {t("signatureModal.relevantSections")}
            </small>
          </div>
          <div className='d-flex justify-content-between gap-2 w-100'>
            <Button onClick={closeModal} className='modalCancelButton'>
              {t("signatureModal.cancel")}
            </Button>

            <Button onClick={handleSign} className='applyBtn' disabled={selectedTab === "SAVED" && !isSavedImageValid}>
              {controlName === "Stamp" && t("signatureModal.stamp_now")}
              {controlName === "Signature" && t("signatureModal.sign_now")}
              {controlName === "Initial" && t("signatureModal.initials_now")}
              {controlName === "Image" && t("signatureModal.upload_image")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SignatureModal;
