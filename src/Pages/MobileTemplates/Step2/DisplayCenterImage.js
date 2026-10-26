import React, { useState, useRef, useEffect } from "react";
import { Button, Modal } from "@/Components/UI/shadcnCompat";
import mobileService from "@/services/mobileService";
import { toast } from "react-toastify";
import { useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageWithControls from "@/Components/DocumentPreparation/Step2_Canvas/ImageWithControls";
import useDragAutoScroll from "@/Components/SignaturePlacement/useDragAutoScroll";
import { tokenManager } from "@/services/tokenManager";
import { PALETTE_STORAGE_KEY } from "@/Context/themeUtils";

const toFiniteNumber = (v, fallback) => { const n = parseFloat(v); return Number.isFinite(n) ? n : fallback; };

const ImageWithDropZone = ({
  selectedImage,
  imageButtonsMap,
  setImageButtonsMap,
  signatoryColors,
  token,
  selectedSignatoryID,
  selectedMasterDocID,
  masterDocPagesId,
  TemplateID,
  setControls,
  buttonClicked,
  setButtonClicked,
  buttonLabel,
  controlID,
  auth,
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
  const navigate = useNavigate();
  const dropRef = useRef(null);
  useDragAutoScroll(dropRef);
  const imageContainerRef = useRef(null);
  const [isAPICallInProgress, setIsAPICallInProgress] = useState(false); // New state to track API call

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
        IsQRCode: buttonLabel === "QR Code" ? true : false,
        IsTextEditor: buttonLabel === "Text" ? true : false,
        TextEditor: "",
        MasterDocID: selectedMasterDocID,
        TemplateID: TemplateID,
        MasterDocPagesID: masterDocPagesId,
        TemplateSignatoryID: selectedSignatoryID,
        Width: buttonLabel === "QR Code" ? "100px" : "110px",
        Height: buttonLabel === "QR Code" ? "100px" : "40px",
        IsNumber: buttonLabel === "Number" ? true : false,
        IsDate: buttonLabel === "Date" ? true : false,
        FontSize: "16px",
        FontColor: "black",
        FontStyle: "Jost",
        PageMaxWidth: `${imgWidth - 108}px`,
        PageMaxHeight: `${imgHeight - 41}px`,
        CustomPlaceHolder: getPlaceholder(buttonLabel),
      };

      setIsAPICallInProgress(true);
      setIsLoading(true);
      try {
        const response = await mobileService.createTemplateControlsLocation(controlsLocationBody, auth);

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
    //console.log("buttons", selectedImageButtons);

    const getButtonsData =
      selectedImageButtons &&
      selectedImageButtons.map((button) => {
        const positionX = parseFloat(button.controlLocationX);
        const positionY = parseFloat(button.controlLocationY);
        const existingButton = displayedButtons.find((btn) => btn.controlLocationID === button.templateControlLocationID);
        const width = toFiniteNumber(button.width, existingButton?.width);
        const height = toFiniteNumber(button.height, existingButton?.height);

        const item = {
          label: button.controlName,
          selectedSignatoryID: button.templateSignatoryID,
          MasterDocPagesId: button.masterDocPagesID,
          masterDocID: button.masterDocID,
          templateID: button.templateID,
          ID: button.templateID,
          position: { x: positionX, y: positionY },
          controlLocationID: button.templateControlLocationID,
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
          qrCodeDetails1: button.qrCodeDetails1,
          qrCodeDetails2: button.qrCodeDetails2,
          qrCodeDetails3: button.qrCodeDetails3,
          qrCodeDetails4: button.qrCodeDetails4,
          customPlaceHolder: button.customPlaceHolder,
        };

        //console.log("item", item);

        return item;
      });

    setImageButtonsMap((prevMap) => ({
      ...prevMap,
      [selectedImage]: getButtonsData,
    }));
  };

  useEffect(() => {
    // const selectedDocumentButtons = buttons.filter(button => button.masterDocID === selectedMasterDocID);

    getButtons();
  }, [buttons, selectedImage, masterDocPagesId]);

  const fetchButtonPositions = async (masterDocID) => {
    try {
      const response = await mobileService.getTemplateControlsLocation(masterDocID, auth);

      if (response.data.successStatus) {
        setControls(response.data.response);
        setButtons(response.data.response);
      }
    } catch (error) {
      // toast.error("Error in loading data", {
      //   position: "top-right",
      // });
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
    canDrop: () => !isAPICallInProgress,

    drop: async (item, monitor) => {
      if (isAPICallInProgress) return;

      monitor.getSourceClientOffset();
      monitor.getInitialClientOffset();

      const offset = monitor.getClientOffset();

      if (offset) {
        // Calculate the boundaries of the image area
        const imageRect = dropRef.current.getBoundingClientRect();
        const minX = imageRect.left;
        const maxX = imageRect.right;
        const minY = imageRect.top;
        const maxY = imageRect.bottom;

        // Check if the drop position is within the boundaries
        if (offset.x >= minX && offset.x <= maxX && offset.y >= minY && offset.y <= maxY) {
          if (item && item.button && item.button.controlLocationID && item.button.dragging) {
            const { button } = item;

            const imgEl = imageContainerRef.current;
            if (!imgEl) return;
            const rect = imgEl.getBoundingClientRect();
            const scaleX = rect.width / imgEl.naturalWidth;
            const scaleY = rect.height / imgEl.naturalHeight;
            const clientOffset = monitor.getClientOffset();
            const x = (clientOffset.x - rect.left) / scaleX;
            const y = (clientOffset.y - rect.top) / scaleY;

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
                  button.customPlaceHolder
                );
              }
            }
          } else if (item && item.button && !item.button.dragging) {
            return null;
          } else {
            // New control dropped from the palette: convert the pointer position from
            // client pixels to natural image pixels using the real rendered scale of
            // the <img> (its bounding rect already includes the CSS `scale` transform),
            // so drops land correctly on mobile where the image is scaled down.
            const imgEl = imageContainerRef.current;
            if (!imgEl || !imgEl.naturalWidth) return;
            const rect = imgEl.getBoundingClientRect();
            const scaleX = rect.width / imgEl.naturalWidth;
            const scaleY = rect.height / imgEl.naturalHeight;
            const buttonWidth = 110;
            const buttonHeight = 40;
            let x = (offset.x - rect.left) / scaleX - buttonWidth / 2;
            let y = (offset.y - rect.top) / scaleY - buttonHeight / 2;

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
              IsQRCode: item.label === "QR Code" ? true : false,
              IsTextEditor: item.label === "Text" ? true : false,
              TextEditor: "",
              MasterDocID: selectedMasterDocID,
              TemplateID: TemplateID,
              MasterDocPagesID: item.MasterDocPagesId,
              TemplateSignatoryID: item.selectedSignatoryID,
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
            setIsAPICallInProgress(true);
            setIsLoading(true);
            try {
              const response = await mobileService.createTemplateControlsLocation(controlsLocationBody, auth);

              if (response.data.successStatus) {
                await fetchButtonPositions(selectedMasterDocID);
              }
            } catch (error) {
              toast.error(t("uploadDocFlow.errWrong"));
              setIsLoading(false);
            } finally {
              setIsAPICallInProgress(false); // Re-enable drop functionality
              setIsLoading(false);
            }
          }
        } else {
          toast.error("outside the boundaries");
          return;
        }
      }
    },
  });

  const formatFontSize = (size) => {
    return typeof size === "number" || !size.endsWith("px") ? `${size}px` : size;
  };

  const updateControlsLocation = async (controlLocationID, controlIdentifier, text, x, y, Height, Width, fontStyle, fontSize, fontColor, placeholder) => {
    const existingButton = displayedButtons.find((btn) => btn.controlLocationID === controlLocationID);
    const validWidth = toFiniteNumber(Width, existingButton ? existingButton.width : Width);
    const validHeight = toFiniteNumber(Height, existingButton ? existingButton.height : Height);
    const updatedLocationData = {
      TemplateControlLocationID: controlLocationID,
      ControlIdentifier: controlIdentifier,
      ControlLocationX: `${x}px`,
      ControlLocationY: `${y}px`,
      TextEditor: text,
      Width: `${validWidth}px`,
      Height: `${validHeight}px`,
      FontSize: formatFontSize(fontSize),
      FontColor: fontColor,
      FontStyle: fontStyle,
      CustomPlaceHolder: placeholder,
    };

    // setIsLoading(true);
    try {
      const response = await mobileService.updateTemplateControlsLocation(updatedLocationData, auth);

      await fetchButtonPositions(selectedMasterDocID);
      // toast.success("Location updated successfully");
    } catch (error) {
      if (error?.response?.data?.statusCode == 2 || error?.response?.data?.statusCode == 4) {
        const currentTheme = localStorage.getItem("theme");
        const currentPalette = localStorage.getItem(PALETTE_STORAGE_KEY);
        const currentLang = localStorage.getItem("i18nextLng");
        tokenManager.clearToken();
        localStorage.clear();
        if (currentTheme) localStorage.setItem("theme", currentTheme);
        if (currentPalette) localStorage.setItem(PALETTE_STORAGE_KEY, currentPalette);
        if (currentLang) localStorage.setItem("i18nextLng", currentLang);
        navigate("/");
        toast.info(t("uploadDocFlow.sessionExpire"));
      } else {
        toast.error(t("uploadDocFlow.errLocation"));
        // setIsLoading(false);
      }
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
        const response = await mobileService.deleteTemplateControlsLocation(controlLocationIDToRemove, auth);

        toast.success(t("uploadDocFlow.signatoryDeleted"));
        fetchButtonPositions(selectedMasterDocID);
        setIsLoading(false);
      } catch (error) {
        if (error?.response?.data?.statusCode == 2 || error?.response?.data?.statusCode == 4) {
          const currentTheme = localStorage.getItem("theme");
          const currentPalette = localStorage.getItem(PALETTE_STORAGE_KEY);
          const currentLang = localStorage.getItem("i18nextLng");
          tokenManager.clearToken();
          localStorage.clear();
          if (currentTheme) localStorage.setItem("theme", currentTheme);
          if (currentPalette) localStorage.setItem(PALETTE_STORAGE_KEY, currentPalette);
          if (currentLang) localStorage.setItem("i18nextLng", currentLang);
          setIsLoading(false);
          navigate("/");
          toast.info(t("uploadDocFlow.sessionExpire"));
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

      <ImageWithControls
        selectedImage={selectedImage}
        displayedButtons={displayedButtons}
        signatoryColors={signatoryColors}
        drop={drop}
        dropRef={dropRef}
        setImageButtonsMap={setImageButtonsMap}
        updateControlsLocation={updateControlsLocation}
        handleButtonRemove={handleButtonRemove}
        textInput={textInput}
        setTextInput={setTextInput}
        selectedMasterDocID={selectedMasterDocID}
        fetchButtonPositions={fetchButtonPositions}
        imageContainerRef={imageContainerRef}
        isAPICallInProgress={isAPICallInProgress}
        auth={auth}
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
          <Button variant='none' onClick={() => handleSureToDelete(controlLocationIDToRemove)} className='applyBtn'>
            {t("uploadDocFlow.delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageWithDropZone;
