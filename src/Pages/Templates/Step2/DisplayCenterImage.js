import React, { useState, useRef, useEffect } from "react";
import templateService from "@/services/templateService";
import { toast } from "react-toastify";
import { useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons";
import ImageWithControls from "@/Components/DocumentPreparation/Step2_Canvas/ImageWithControls";
import useDragAutoScroll from "@/Components/SignaturePlacement/useDragAutoScroll";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { emptyAlignmentGuides, getControlDimensions, getNewControlDimensions, snapToControls as getSnappedControlPosition } from "@/Components/SignaturePlacement/SmartGuides";

const toFiniteNumber = (v, fallback) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const ImageWithDropZone = ({
  selectedImage,
  imageButtonsMap,
  setImageButtonsMap,
  signatoryColors,
  selectedSignatoryID,
  selectedMasterDocID,
  masterDocPagesId,
  TemplateID,
  setControls,
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
  const [textInput, setTextInput] = useState("");
  const [alignmentGuides, setAlignmentGuides] = useState(emptyAlignmentGuides);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
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
  }, [selectedImage]);

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
        width: buttonLabel === "QR Code" || buttonLabel === "Stamp" || buttonLabel === "Image" ? "100px" : "110px",
        Height: buttonLabel === "QR Code" || buttonLabel === "Stamp" || buttonLabel === "Image" ? "100px" : "40px",
        IsNumber: buttonLabel === "Number" ? true : false,
        IsDate: buttonLabel === "Date" ? true : false,
        FontSize: "16px",
        FontColor: "black",
        FontStyle: "Jost",
        PageMaxWidth: `${imgWidth}px`,
        PageMaxHeight: `${imgHeight}px`,
        CustomPlaceHolder: getPlaceholder(buttonLabel),
      };
      setIsAPICallInProgress(true);
      try {
        const response = await templateService.createTemplateControlsLocation(controlsLocationBody);

        if (response.data.successStatus) {
          await fetchButtonPositions(selectedMasterDocID);
          setButtonClicked(false);

          if (imageContainerRef.current) {
            imageContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.errWrong"));
      } finally {
        setIsAPICallInProgress(false);
      }
    };

    if (buttonClicked && controlID && selectedMasterDocID && selectedSignatoryID) {
      createButtonOnClick();
    }
  }, [buttonClicked, controlID, selectedMasterDocID, selectedSignatoryID]);

  let displayedButtons = imageButtonsMap[selectedImage] || [];

  const getButtons = () => {
    const selectedImageButtons = buttons && buttons.filter((button) => button.masterDocPagesID === masterDocPagesId);
    // console.log("buttons", selectedImageButtons);
    const existingButtons = imageButtonsMap[selectedImage] || [];

    const getButtonsData =
      selectedImageButtons &&
      selectedImageButtons.map((button) => {
        const positionX = parseFloat(button.controlLocationX);
        const positionY = parseFloat(button.controlLocationY);
        const existingButton = existingButtons.find((item) => item.controlLocationID === button.templateControlLocationID);
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

        // console.log("item", item);

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
      const response = await templateService.getTemplateControlsLocation(masterDocID);

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

  const getDraggedPosition = (offset, monitor, width, height, centerOnPointer = false) => {
    const imgEl = imageContainerRef.current;
    if (!imgEl || !offset) return null;

    // getBoundingClientRect already includes the CSS `scale` transform, so this
    // measures the real rendered scale on both desktop and mobile.
    const rect = imgEl.getBoundingClientRect();
    const scaleX = rect.width / imgEl.naturalWidth;
    const scaleY = rect.height / imgEl.naturalHeight;
    if (!scaleX || !scaleY || !imgEl.naturalWidth || !imgEl.naturalHeight) return null;

    let x = (offset.x - rect.left) / scaleX;
    let y = (offset.y - rect.top) / scaleY;

    if (centerOnPointer) {
      x -= width / 2;
      y -= height / 2;
    } else {
      const dragStartOffset = monitor.getInitialClientOffset();
      const dragStartPoint = monitor.getInitialSourceClientOffset();
      if (dragStartOffset && dragStartPoint) {
        x -= (dragStartOffset.x - dragStartPoint.x) / scaleX;
        y -= (dragStartOffset.y - dragStartPoint.y) / scaleY;
      }
    }

    return {
      x: Math.max(0, Math.min(x, imgWidth - width)),
      y: Math.max(0, Math.min(y, imgHeight - height)),
    };
  };

  const snapToControls = (position, width, height, controlLocationID) => {
    return getSnappedControlPosition({
      position,
      width,
      height,
      controls: displayedButtons,
      isDraggedControl: (field) => field.controlLocationID === controlLocationID,
      maxWidth: imgWidth,
      maxHeight: imgHeight,
    });
  };

  const getItemDimensions = (item) => (item.button ? getControlDimensions(item.button) : getNewControlDimensions(item));
  const handlePlacedControlDrag = (button, position) => setAlignmentGuides(snapToControls(position, Number(button.width) || 110, Number(button.height) || 40, button.controlLocationID).guides);
  const handlePlacedControlDrop = (button, position) => {
    const snapped = snapToControls(position, Number(button.width) || 110, Number(button.height) || 40, button.controlLocationID);
    setImageButtonsMap((previousMap) => ({
      ...previousMap,
      [selectedImage]: (previousMap[selectedImage] || []).map((field) => (field.controlLocationID === button.controlLocationID ? { ...field, position: snapped.position } : field)),
    }));
    setAlignmentGuides(emptyAlignmentGuides());
    return snapped.position;
  };
  const handlePlacedControlResize = (button, size) => setAlignmentGuides(snapToControls(button.position, size.width, size.height, button.controlLocationID).guides);
  const clearAlignmentGuides = () => setAlignmentGuides(emptyAlignmentGuides());

  const [, drop] = useDrop({
    accept: "BUTTON",
    canDrop: () => !isAPICallInProgress,
    hover: (item, monitor) => {
      if (!item || isAPICallInProgress) return;
      const button = item.button;
      const { width, height } = getItemDimensions(item);
      const position = getDraggedPosition(monitor.getClientOffset(), monitor, width, height, !button);
      const snapped = snapToControls(position, width, height, button?.controlLocationID);
      setAlignmentGuides(snapped.guides);
    },
    drop: async (item, monitor) => {
      if (isAPICallInProgress) return;
      setAlignmentGuides(emptyAlignmentGuides());

      const offset = monitor.getClientOffset();

      if (offset) {
        if (item && item.button && item.button.controlLocationID && item.button.dragging) {
          const { button } = item;
          const { width, height } = getItemDimensions(item);
          const snapped = snapToControls(getDraggedPosition(offset, monitor, width, height), width, height, button.controlLocationID);
          const { x, y } = snapped.position;

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
          const { width: buttonWidth, height: buttonHeight } = getItemDimensions(item);
          const snapped = snapToControls(getDraggedPosition(offset, monitor, buttonWidth, buttonHeight, true), buttonWidth, buttonHeight);
          const { x, y } = snapped.position;

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
            Width: `${buttonWidth}px`,
            Height: `${buttonHeight}px`,
            IsNumber: item.label === "Number" ? true : false,
            IsDate: item.label === "Date" ? true : false,
            FontSize: "16px",
            FontColor: "black",
            FontStyle: "Jost",
            PageMaxWidth: `${imgWidth}px`,
            PageMaxHeight: `${imgHeight}px`,
            CustomPlaceHolder: getPlaceholder(item.label),
          };
          setIsAPICallInProgress(true);
          try {
            const response = await templateService.createTemplateControlsLocation(controlsLocationBody);

            if (response.data.successStatus) {
              await fetchButtonPositions(selectedMasterDocID);
            }
          } catch (error) {
            toast.error(t("uploadDocFlow.errWrong"));
          } finally {
            setIsAPICallInProgress(false);
            setAlignmentGuides(emptyAlignmentGuides());
          }
        }
      }
      setAlignmentGuides(emptyAlignmentGuides());
    },
  });

  const formatFontSize = (size) => {
    return typeof size === "number" || !size.endsWith("px") ? `${size}px` : size;
  };

  const updateControlsLocation = async (controlLocationID, controlIdentifier, text, x, y, Height, Width, fontStyle, fontSize, fontColor, placeholder) => {
    const existingButton = (displayedButtons || []).find((btn) => btn.controlLocationID === controlLocationID);
    const fallbackDimensions = getNewControlDimensions({ label: existingButton?.label });
    const validWidth = toFiniteNumber(Width, toFiniteNumber(existingButton?.width, fallbackDimensions.width));
    const validHeight = toFiniteNumber(Height, toFiniteNumber(existingButton?.height, fallbackDimensions.height));
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

    try {
      await templateService.updateTemplateControlsLocation(updatedLocationData);

      await fetchButtonPositions(selectedMasterDocID);
    } catch (error) {
      toast.error(t("uploadDocFlow.errLocation"));
    }
  };

  // Qr code details

  const updateQRDetails = async (controlLocationID, ID, selectedSignatoryID, detail1, detail2, detail3, detail4, xLocation, yLocation, width, height) => {
    // Never emit "NaNpx"/"undefinedpx": validate against the control's existing dimensions,
    // same fallback chain as this module's updateControlsLocation.
    const existingButton = (displayedButtons || []).find((btn) => btn.controlLocationID === controlLocationID);
    const fallbackDimensions = getNewControlDimensions({ label: existingButton?.label });
    const safeWidth = toFiniteNumber(width, toFiniteNumber(existingButton?.width, fallbackDimensions.width));
    const safeHeight = toFiniteNumber(height, toFiniteNumber(existingButton?.height, fallbackDimensions.height));
    const reqBody = {
      TemplateControlsLocationID: controlLocationID,
      TemplateID: ID,
      TemplateSignatoryID: selectedSignatoryID,
      QRCodeDetails1: detail1,
      QRCodeDetails2: detail2,
      QRCodeDetails3: detail3,
      QRCodeDetails4: detail4,
      ControlLocationX: `${xLocation}px`,
      ControlLocationY: `${yLocation}px`,
      Width: `${safeWidth}px`,
      Height: `${safeHeight}px`,
    };
    try {
      const response = await templateService.updateTemplateQRCodeDetails(reqBody);

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
      try {
        await templateService.deleteTemplateControlsLocation(controlLocationIDToRemove);

        toast.success(t("uploadDocFlow.signatoryDeleted"));
        fetchButtonPositions(selectedMasterDocID);
      } catch (error) {
        toast.error(t("uploadDocFlow.ErrDeletSignatory"));
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
        onUpdateQRDetails={updateQRDetails}
        imageContainerRef={imageContainerRef}
        isAPICallInProgress={isAPICallInProgress}
        buttons={buttons}
        fetchButtonPositions={fetchButtonPositions}
        alignmentGuides={alignmentGuides}
        onPlacedControlDrag={handlePlacedControlDrag}
        onPlacedControlDrop={handlePlacedControlDrop}
        onPlacedControlResize={handlePlacedControlResize}
        onPlacedControlResizeEnd={clearAlignmentGuides}
      />

      <DeleteConfirmationModal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        title={t("Folder.deleteConfirmation")}
        subtitle={t("uploadDocFlow.deleteControl")}
        warningText={t("uploadDocFlow.deleteField")}
        itemTitle={t("uploadDocFlow.standardFields")}
        itemName={displayedButtons[indexToRemove]?.label || "Field"}
        onConfirm={() => handleSureToDelete(controlLocationIDToRemove)}
        confirmText={t("createTeam.confirm")}
        cancelText={t("uploadDocFlow.cancel")}
        headerIcon={<Icons.DeleteAction size={25} />}
      />
    </>
  );
};

export default ImageWithDropZone;
