import React, { useState, useRef, useEffect } from "react";
import { Button, Modal } from "@/Components/UI/shadcnCompat";
import mobileService from "@/services/mobileService";
import { toast } from "react-toastify";
import { useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageWithControls from "@/Components/DocumentPreparation/Step2_Canvas/ImageWithControls";
import Loader from "@/Components/CommonModals/Loader/Loader";

const ImageWithDropZone = ({
  selectedImage,
  imageButtonsMap,
  setImageButtonsMap,
  signatoryColors,
  selectedSignatoryID,
  selectedMasterDocID,
  masterDocPagesId,
  RegisterSignID,
  setControls,
  auth,
  buttonClicked,
  setButtonClicked,
  buttonLabel,
  controlID,
}) => {
  const { t } = useTranslation();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const [buttonControlLocationIds, setButtonControlLocationIds] = useState({});
  const [uniqueIdToRemove, setUniqueIdToRemove] = useState(null);
  const [controlLocationIDToRemove, setControlLocationIDToRemove] = useState();
  const [localButtons, setLocalButtons] = useState([]);
  const [buttons, setButtons] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [scaledImgWidth, setScaledImgWidth] = useState(0);
  const [scaledImgHeight, setScaledImgHeight] = useState(0);
  const [isAPICallInProgress, setIsAPICallInProgress] = useState(false); // New state to track API call

  const navigate = useNavigate();
  const dropRef = useRef(null);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    let img = new Image();
    img.onload = function () {
      setImgWidth(this.naturalWidth);
      setImgHeight(this.naturalHeight);
    };
    img.src = selectedImage;

    const docImage = dropRef.current;

    if (docImage) {
      if (window.innerWidth >= 400 && window.innerWidth <= 576) {
        const scaledWidth = imgWidth / 2;
        const scaleFactor = 0.5;
        const scaledHeight = imgHeight * scaleFactor;
        setScaledImgWidth(scaledWidth);
        setScaledImgHeight(scaledHeight);
      }
      if (window.innerWidth < 400) {
        const scaledWidth = imgWidth * 0.45;
        const scaleFactor = 0.45;
        const scaledHeight = imgHeight * scaleFactor;
        setScaledImgWidth(scaledWidth);
        setScaledImgHeight(scaledHeight);
      }
    } else {
      setScaledImgWidth(imgWidth);
      setScaledImgHeight(imgHeight);
    }
  }, [selectedImage, imgWidth, imgHeight, dropRef]);

  const getPlaceholder = (label) => {
    if (label === "Text") {
      return "Enter text";
    }
    if (label === "Number") {
      return "Enter number";
    }
    if (label === "Date") {
      return "Enter date";
    }
    if (label === "Radio" || label === "Checkbox") {
      return "Label";
    }
    return label;
  };

  useEffect(() => {
    const createButtonOnClick = async () => {
      const controlsLocationBody = {
        ControlID: controlID,
        ControlIdentifier: "",
        ControlLocationX: `347px`,
        ControlLocationY: `560px`,
        Signature: "",
        IsSignature: buttonLabel === "Signature" ? true : false,
        IsTextEditor: buttonLabel === "Text" ? true : false,
        TextEditor: "",
        IsQRCode: buttonLabel === "QR Code" ? true : false,
        MasterDocID: selectedMasterDocID,
        RegisterSignID: RegisterSignID,
        MasterDocPagesID: masterDocPagesId,
        SignatoriesID: selectedSignatoryID,
        Width: buttonLabel === "QR Code" ? "100px" : "110px",
        Height: buttonLabel === "QR Code" ? "100px" : "40px",
        IsNumber: buttonLabel === "Number" ? true : false,
        IsDate: buttonLabel === "Date" ? true : false,
        FontSize: "16px",
        FontColor: "black",
        FontStyle: "Jost",
        CustomPlaceHolder: getPlaceholder(buttonLabel),
        PageMaxWidth: `${imgWidth - 108}px`,
        PageMaxHeight: `${imgHeight - 41}px`,
      };
      setIsAPICallInProgress(true);
      setIsLoading(true);
      try {
        const response = await mobileService.createControlsLocation(controlsLocationBody, auth);

        if (response.data.successStatus) {
          await fetchButtonPositions(selectedMasterDocID);
          setButtonClicked(false);

          if (imageContainerRef.current) {
            imageContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.errWrong"));
        setIsLoading(false);
      } finally {
        setIsAPICallInProgress(false); // Re-enable drop functionality
        setIsLoading(false);
      }
    };

    if (buttonClicked && controlID && selectedMasterDocID && selectedSignatoryID) {
      createButtonOnClick();
    }
  }, [buttonClicked, controlID, selectedMasterDocID, selectedSignatoryID]);

  let displayedButtons = imageButtonsMap[selectedImage] || [];
  const getButtons = () => {
    const selectedImageButtons = buttons && buttons.filter((button) => button.masterDocPagesID === masterDocPagesId);

    const getButtonsData =
      selectedImageButtons &&
      selectedImageButtons.map((button) => {
        const positionX = parseFloat(button.controlLocationX);
        const positionY = parseFloat(button.controlLocationY);
        const width = parseFloat(button.width);
        const height = parseFloat(button.height);

        const item = {
          label: button.controlName,
          selectedSignatoryID: button.signatoriesID,
          MasterDocPagesId: button.masterDocPagesID,
          masterDocID: button.masterDocID,
          registerSignID: button.registerSignID,
          ID: button.registerSignID,
          position: { x: positionX, y: positionY },
          controlLocationID: button.controlLocationID,
          controlID: button.controlID,
          controlIdentifier: button.controlIdentifier,
          email: button.email,
          name: button.name,
          textEditor: button.textEditor,
          width: width,
          height: height,
          qrCodePath: button.qrCodePath,
          fontSize: button.fontSize || "",
          fontColor: button.fontColor || "",
          fontStyle: button.fontStyle || "",
          customPlaceHolder: button.customPlaceHolder,
          qrCodeDetails1: button.qrCodeDetails1,
          qrCodeDetails2: button.qrCodeDetails2,
          qrCodeDetails3: button.qrCodeDetails3,
          qrCodeDetails4: button.qrCodeDetails4,
        };
        return item;
      });

    setImageButtonsMap((prevMap) => ({
      ...prevMap,
      [selectedImage]: getButtonsData,
    }));
  };

  useEffect(() => {
    getButtons();
  }, [buttons, selectedImage, masterDocPagesId]);

  const fetchButtonPositions = async (masterDocID) => {
    try {
      const response = await mobileService.getControlsLocation(masterDocID, auth);

      if (response.data.successStatus) {
        setControls(response.data.response);
        setButtons(response.data.response);
      }
    } catch (error) {
    } finally {
      setIsAPICallInProgress(false);
    }
  };

  useEffect(() => {
    if (selectedMasterDocID) {
      fetchButtonPositions(selectedMasterDocID);
    }
  }, [selectedMasterDocID]);

  const [, drop] = useDrop({
    accept: "BUTTON",
    drop: async (item, monitor) => {
      monitor.getSourceClientOffset();
      monitor.getInitialClientOffset();

      const offset = monitor.getClientOffset();

      if (offset) {
        if (item && item.button && item.button.controlLocationID && item.button.dragging) {
          const { button } = item;

          let x, y;
          if (window.innerWidth <= 576 && window.innerWidth >= 400) {
            const scaleFactor = imgWidth / scaledImgWidth;
            x = (offset.x - (dropRef.current.getBoundingClientRect().left + (dropRef.current.getBoundingClientRect().width - scaledImgWidth) / 2)) * scaleFactor;
            y = (offset.y - (dropRef.current.getBoundingClientRect().top + (dropRef.current.getBoundingClientRect().height - scaledImgHeight) / 2)) * scaleFactor;
          } else if (window.innerWidth < 400) {
            const scaleFactor = imgWidth / scaledImgWidth;
            x = (offset.x - (dropRef.current.getBoundingClientRect().left + (dropRef.current.getBoundingClientRect().width - scaledImgWidth) / 2)) * scaleFactor;
            y = (offset.y - (dropRef.current.getBoundingClientRect().top + (dropRef.current.getBoundingClientRect().height - scaledImgHeight) / 2)) * scaleFactor;
          } else {
            x = offset.x - dropRef.current.getBoundingClientRect().left - button.width / 2;
            y = offset.y - dropRef.current.getBoundingClientRect().top - button.height / 2;

            x = Math.max(0, Math.min(x, imgWidth - button.width));
            y = Math.max(0, Math.min(y, imgHeight - button.height));
          }

          const index = displayedButtons.findIndex((btn) => btn.controlLocationID === button.controlLocationID);

          if (!isNaN(index) && index >= 0 && index < displayedButtons.length) {
            const updatedButtons = [...displayedButtons];
            const draggedButton = updatedButtons[index];

            if (draggedButton) {
              draggedButton.position = { x, y };
              setImageButtonsMap((prevMap) => ({
                ...prevMap,
                [selectedImage]: updatedButtons,
              }));

              updateControlsLocation(
                button.controlLocationID,
                button.controlIdentifier,
                button.textEditor,
                x,
                y,
                button.height,
                button.width,
                button.fontStyle,
                button.fontSize,
                button.fontColor,
                button.customPlaceHolder,
              );
            }
          }
        } else if (item && item.button && !item.button.dragging) {
          return null;
        } else {
          const dropTargetRect = dropRef.current.getBoundingClientRect();
          const buttonWidth = 110;
          const buttonHeight = 40;
          let x = offset.x - dropTargetRect.x - buttonWidth / 2;
          let y = offset.y - dropTargetRect.y - buttonHeight / 2;

          x = Math.max(0, Math.min(x, imgWidth - buttonWidth));
          y = Math.max(0, Math.min(y, imgHeight - buttonHeight));

          setImageButtonsMap((prevMap) => ({
            ...prevMap,
            [selectedImage]: [
              ...(prevMap[selectedImage] || []),
              {
                ...item,
                position: { x, y },
              },
            ],
          }));

          const controlsLocationBody = {
            ControlID: item.controlID,
            ControlIdentifier: "",
            ControlLocationX: `${x}px`,
            ControlLocationY: `${y}px`,
            Signature: "",
            IsSignature: item.label === "Signature" ? true : false,
            IsTextEditor: item.label === "Text" ? true : false,
            TextEditor: "",
            IsQRCode: item.label === "QR Code" ? true : false,
            MasterDocID: selectedMasterDocID,
            RegisterSignID: RegisterSignID,
            MasterDocPagesID: item.MasterDocPagesId,
            SignatoriesID: item.selectedSignatoryID,
            Width: item.label === "QR Code" ? "100px" : "110px",
            Height: item.label === "QR Code" ? "100px" : "40px",
            IsNumber: item.label === "Number" ? true : false,
            IsDate: item.label === "Date" ? true : false,
            FontSize: "16px",
            FontColor: "black",
            FontStyle: "Jost",
            PageMaxWidth: `${imgWidth - 108}px`,
            PageMaxHeight: `${imgHeight - 41}px`,
            CustomPlaceHolder: getPlaceholder(item.label),
          };
          setIsAPICallInProgress(true); // Disable drop functionality
          setIsLoading(true);
          try {
            const response = await mobileService.createControlsLocation(controlsLocationBody, auth);

            if (response.data.successStatus) {
              fetchButtonPositions(selectedMasterDocID);
              setIsLoading(false);
            }
          } catch (error) {
            toast.error(t("uploadDocFlow.errWrong"));
            setIsLoading(false);
          }
        }
      }
    },
  });

  const formatFontSize = (size) => {
    return typeof size === "number" || !size.endsWith("px") ? `${size}px` : size;
  };

  const updateControlsLocation = async (controlLocationID, controlIdentifier, text, x, y, Height, Width, fontStyle, fontSize, fontColor, placeholder) => {
    const updatedLocationData = {
      ControlLocationID: controlLocationID,
      ControlIdentifier: controlIdentifier,
      ControlLocationX: `${x}px`,
      ControlLocationY: `${y}px`,
      TextEditor: text,
      Width: `${Width}px`,
      Height: `${Height}px`,
      FontSize: formatFontSize(fontSize),
      FontColor: fontColor,
      FontStyle: fontStyle,
      CustomPlaceHolder: placeholder,
    };

    try {
      const response = await mobileService.updateControlsLocation(updatedLocationData, auth);

      if (response.status === 200) {
        await fetchButtonPositions(selectedMasterDocID);
      }
    } catch (error) {
      if (error?.response?.data?.statusCode === 2 || error?.response?.data?.statusCode === 4) {
        sessionStorage.removeItem("token");
        localStorage.clear();
        setIsLoading(false);
        navigate("/");
        toast.info("session expired");
      } else {
        toast.error(t("uploadDocFlow.errLocation"));
        setIsLoading(false);
      }
    }
  };

  const updateQRDetails = async (controlLocationID, ID, selectedSignatoryID, detail1, detail2, detail3, detail4, xLocation, yLocation, width, height) => {
    const reqBody = {
      ControlsLocationID: controlLocationID,
      RegisterSignID: ID,
      SignatoriesID: selectedSignatoryID,
      QRCodeDetails1: detail1,
      QRCodeDetails2: detail2,
      QRCodeDetails3: detail3,
      QRCodeDetails4: detail4,
      ControlLocationX: `${xLocation}px`,
      ControlLocationY: `${yLocation}px`,
      Width: `${width}px`,
      Height: `${height}px`,
    };
    try {
      const response = await mobileService.updateQRCodeDetails(reqBody, auth);

      if (response.data.statusCode === "1") {
        await fetchButtonPositions(selectedMasterDocID);
      }
    } catch (error) {
      toast.error("Error in updating QR data");
    }
  };

  const handleButtonRemove = (index, controlLocationID) => {
    setControlLocationIDToRemove(controlLocationID);
    setIndexToRemove(index);
    setShowConfirmationModal(true);
  };

  const handleSureToDelete = async (controlLocationIDToRemove) => {
    if (indexToRemove !== null) {
      setLocalButtons((prevButtons) => {
        const newButtons = [...prevButtons];
        newButtons.splice(indexToRemove, 1);
        return newButtons;
      });
      setIsLoading(true);
      try {
        const response = await mobileService.deleteControlsLocation(controlLocationIDToRemove, auth);

        toast.success(t("uploadDocFlow.signatoryDeleted"));
        fetchButtonPositions(selectedMasterDocID);
        setIsLoading(false);
      } catch (error) {
        if (error?.response?.data?.statusCode === 2 || error?.response?.data?.statusCode === 4) {
          sessionStorage.removeItem("token");
          const currentTheme = localStorage.getItem("theme");
          localStorage.clear();
          if (currentTheme) {
            localStorage.setItem("theme", currentTheme);
          }
          setIsLoading(false);
          navigate("/");
          toast.info("session expired");
        } else {
          toast.error(t("uploadDocFlow.ErrDeletSignatory"));
          setIsLoading(false);
        }
      }

      const updatedButtons = [...displayedButtons];
      updatedButtons.splice(indexToRemove, 1);
      setImageButtonsMap((prevMap) => ({
        ...prevMap,
        [selectedImage]: updatedButtons,
      }));

      setButtonControlLocationIds((prevIds) => {
        const newIds = { ...prevIds };
        delete newIds[uniqueIdToRemove];
        return newIds;
      });
      setShowConfirmationModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmationModal(false);
  };

  return (
    <>
      {isLoading && (
        <div className='loader-overlay'>
          <Loader />
        </div>
      )}

      <ImageWithControls
        selectedImage={selectedImage}
        displayedButtons={displayedButtons}
        signatoryColors={signatoryColors}
        drop={drop}
        dropRef={dropRef}
        updateControlsLocation={updateControlsLocation}
        handleButtonRemove={handleButtonRemove}
        textInput={textInput}
        setTextInput={setTextInput}
        onUpdateQRDetails={updateQRDetails}
        imageContainerRef={imageContainerRef}
        buttons={buttons}
        isAPICallInProgress={isAPICallInProgress}
        auth={auth}
        fetchButtonPositions={fetchButtonPositions}
      />

      <Modal show={showConfirmationModal} onHide={handleCancelDelete} dialogClassName='custom-modal-width'>
        <Modal.Header closeButton>
          <Modal.Title>{t("uploadDocFlow.confirmDelete")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='px-3 py-2'>{t("uploadDocFlow.deleteField")}</Modal.Body>
        <Modal.Footer>
          <Button variant='none' onClick={handleCancelDelete} className='modalCancelButton'>
            {t("uploadDocFlow.cancel")}
          </Button>
          <Button variant='none' className='applyBtn' onClick={() => handleSureToDelete(controlLocationIDToRemove)}>
            {t("uploadDocFlow.delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageWithDropZone;
