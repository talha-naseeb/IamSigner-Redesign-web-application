import React, { useEffect, useRef, useState } from "react";
import uploadFlowService from "@/services/uploadFlowService";
import "./SignaturePage.css";
import { Button, Col, Dropdown, DropdownButton, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SignatureModal from "@/Pages/SignaturePage/SignatureModal";
import { useTranslation } from "react-i18next";
import ImageThumbnails from "@/Components/ImageThumbnails/ImageThumbnails";
import ConfirmationModal from "@/Pages/SignaturePage/ConfirmationModal";
import "react-datepicker/dist/react-datepicker.css";
import { Icons } from "@/assets/Icons";
import Loader from "@/Components/CommonModals/Loader/Loader";
import InputEditors from "@/Pages/SignaturePage/InputEditors";
import PageNavigations from "@/Components/PageNavigations";

const SignaturePageSelf = ({ setActiveStep, setCompletedSteps }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMasterDocID, setSelectedMasterDocID] = useState();
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
  const [signatoryName, setSignatoryName] = useState();
  const [showModal, setShowModal] = useState(false);
  const [controlName, setControlName] = useState();
  const [controlID, setControlID] = useState();
  const [uploadedSignature, setUploadedSignature] = useState([]);
  const [allControlData, setAllControlData] = useState(null);
  const [scrollToCalled, setScrollToCalled] = useState(false);
  const [currentControlIndex, setCurrentControlIndex] = useState(0);
  const [sortedControls, setSortedControls] = useState([]);
  const [completedControls, setCompletedControls] = useState(false);
  const [editingStates, setEditingStates] = useState({});
  const [textInput, setTextInput] = useState();
  const indicatorRef = useRef(null);
  const [textUpdated, setTextUpdated] = useState(false);
  const [checkboxValues, setCheckboxValues] = useState({});

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

  const handleDocSelect = async (masterDocID, selectedFolderName, signedDocKey) => {
    const truncatedName = selectedFolderName.length > 10 ? selectedFolderName.slice(0, 7) + "..." : selectedFolderName;
    setSelectedFolder(truncatedName);
    setSelectedMasterDocID(masterDocID);
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
            const response = await uploadFlowService.getControlsLocationSelf(doc.masterDocID);

            if (response.data.successStatus) {
              accumulatedControlData = accumulatedControlData.concat(response.data.response);
            }
          } catch (error) {
            // Handle error silently
          }
        }
      } else if (files) {
        try {
          const response = await uploadFlowService.getControlsLocationSelf(files.masterDocID);

          if (response.data.successStatus) {
            accumulatedControlData = accumulatedControlData.concat(response.data.response);
          }
        } catch (error) {
          // Handle error silently
        }
      }
      setAllControlData(accumulatedControlData);
      setIsLoading(false);
    };

    getControlsData();
  }, [formData]);

  useEffect(() => {
    setIsLoading(true);
    const getControlsLocation = async () => {
      try {
        const response = await uploadFlowService.getControlsLocationSelf(selectedMasterDocID);

        if (response.data.successStatus) {
          setControlData(response.data.response);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    getControlsLocation();
  }, [selectedMasterDocID]);

  const getMasterDocPages = async (selectedMasterDocID) => {
    setIsLoading(true);
    try {
      const response = await uploadFlowService.getMasterDocPages(selectedMasterDocID);

      setImagesData(response.data.response);

      response.data.response.map((doc) => doc.masterDocPagesID);
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
          const truncatedName = firstDocName.length > 10 ? firstDocName.slice(0, 7) + ".." : firstDocName;
          setSelectedFolder(truncatedName);

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
          selectedMasterDocID,
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

  const handleBack = async () => {
    setActiveStep(2);
    setCompletedSteps([1, 2]);
  };

  return (
    <div className='selfSignaturePage'>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <div>
        <div className='signaturePage-container'>
          <Row className='main-content px-0 mx-0'>
            <Col md={10} className='p-0' style={{ background: "var(--bg-secondary)" }}>
              <Row
                className='signatories-row m-0'
                style={{
                  position: "fixed",
                  top: "67px",
                  width: "100%",
                  zIndex: "5",
                  background: "var(--bg-primary)",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <div className='self-image-col'>
                  <div>
                    <Button
                      onClick={scrollToNextControl}
                      className={`signedBtn ${isLoading || !completedControls ? "disabled-button" : ""}`}
                      style={{
                        backgroundColor: isLoading ? "gray" : completedControls ? "#218838" : "var(--theme-color)",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        t("signOrderDaigram.loading")
                      ) : completedControls ? (
                        <>
                          {/* <Icons.CheckIcon size={18} className='me-2' /> */}
                          {t("uploadDocFlow.finish")}
                        </>
                      ) : currentControlIndex === 0 ? (
                        <>
                          {/* <Icons.Play size={18} className='me-2' /> */}
                          {t("signaturePage.Start")}
                        </>
                      ) : (
                        <>
                          {/* <Icons.Next size={18} className='me-2' /> */}
                          {t("signaturePage.NextStep")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Row>

              <Row className='mx-0 p-0' style={{ marginTop: "70px" }}>
                <div
                  className='main-document scrollable-content px-0'
                  ref={mainDocumentRef}
                  style={{
                    position: "relative",
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

                      <img src={selectedImage} alt='document page' />

                      {controlData.map((control, index) => {
                        return (
                          control.masterDocPagesID === masterDocPagesId &&
                          (control.controlStatus === "Pending" ? (
                            <div
                              key={control.controlLocationID}
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
                                    color: control.fontColor || "var(--text-primary)",
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
                                    // backgroundColor:
                                    //   ((control.controlName === "Signature" || control.controlName === "Initial" || control.controlName === "Stamp" || control.controlName === "Image") &&
                                    //     !uploadedSignature.find((item) => item.controlLocationID === control.controlLocationID)) ||
                                    //   (control.controlName !== "Signature" && control.controlName !== "Initial" && control.controlName !== "Stamp" && control.controlName !== "Image")
                                    //     ? "var(--theme-light)"
                                    //     : "transparent",
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
                                          alt='Loaded signature'
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
                                          alt='Loaded signature'
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
                                          alt='Loaded signature'
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
                                          alt='Loaded imgage'
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
                                            <label htmlFor={`radio${control.controlLocationID}`}>{control.customPlaceHolder}</label>
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

            <Col md={2} className='page-display p-0' style={{ position: "fixed", top: "67px", zIndex: "5", background: "var(--bg-primary)" }}>
              <div className='documents-dropdown py-1 my-2 mx-2' style={{ color: "var(--text-primary) !important" }}>
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
                />
              </div>

              <ConfirmationModal show={isConfirmationModalOpen} onHide={() => setIsConfirmationModalOpen(false)} onClick={handleCompleted} />
            </Col>
          </Row>

          <SignatureModal {...SignatureModalProps} />
        </div>
        <div className='fixed-button-container'>
          <Button className='backBtn' id='hide_part_one' onClick={handleBack}>
            {t("uploadDocFlow.back")}
          </Button>

          <PageNavigations imagesData={imagesData} selectedImage={selectedImage} setSelectedImage={setSelectedImage} onImageSelect={handleImageSelect} />

          <Button className='Continue-btn' id='hide_part_one' onClick={handleCheckCompletedButton}>
            {/* <Icons.CheckSign size={18} className='mx-2' /> */}
            {t("signaturePage.completed")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePageSelf;
