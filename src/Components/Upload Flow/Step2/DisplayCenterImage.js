import React, { useState, useRef, useEffect } from "react";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { useDrop } from "react-dnd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageWithControls from "@/Components/ImageWithControls";
import useDragAutoScroll from "@/Components/SignaturePlacement/useDragAutoScroll";
import Loader from "@/Components/CommonModals/Loader/Loader";
import DeleteConfirmationModal from "@/Components/CommonModals/DeleteConfirmationModal/DeleteConfirmationModal";
import { Icons } from "@/assets/Icons";
import { emptyAlignmentGuides, getControlDimensions, getNewControlDimensions, snapToControls as getSnappedControlPosition } from "@/Components/SignaturePlacement/SmartGuides";

const toFiniteNumber = (v, fallback) => { const n = parseFloat(v); return Number.isFinite(n) ? n : fallback; };

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
  // buttonPosition
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
  const [textInput, setTextInput] = useState();
  const navigate = useNavigate();
  const dropRef = useRef(null);
  useDragAutoScroll(dropRef);
  const imageContainerRef = useRef(null);
  const [isAPICallInProgress, setIsAPICallInProgress] = useState(false); // New state to track API call

  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [alignmentGuides, setAlignmentGuides] = useState(emptyAlignmentGuides);

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
        IsNumber: buttonLabel === "Number" ? true : false,
        IsDate: buttonLabel === "Date" ? true : false,
        IsImage: buttonLabel === "Image" ? true : false,
        IsRequired: false,
        IsRadioButton: buttonLabel === "Radio" ? true : false,
        IsCheckBox: buttonLabel === "Checkbox" ? true : false,
        IsDigitalSignature: false,
        CustomPlaceHolder: getPlaceholder(buttonLabel),
        TextEditor: buttonLabel === "Checkbox" || buttonLabel === "Radio" ? "No" : "",
        MasterDocID: selectedMasterDocID,
        RegisterSignID: RegisterSignID,
        MasterDocPagesID: masterDocPagesId,
        SignatoriesID: selectedSignatoryID,
        Width: buttonLabel === "QR Code" || buttonLabel === "Stamp" || buttonLabel === "Image" ? "100px" : "110px",
        Height: buttonLabel === "QR Code" || buttonLabel === "Stamp" || buttonLabel === "Image" ? "100px" : "40px",
        FontSize: "16px",
        FontColor: "black",
        FontStyle: "Jost",
        PageMaxWidth: `${imgWidth - 108}px`,
        PageMaxHeight: `${imgHeight - 41}px`,
        category: "",
      };
      setIsAPICallInProgress(true);
      try {
        const response = await uploadFlowService.createControlsLocation(controlsLocationBody);

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
        setIsAPICallInProgress(false); // Re-enable drop functionality
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
        const existingButton = displayedButtons.find((btn) => btn.controlLocationID === button.controlLocationID);
        const width = toFiniteNumber(button.width, toFiniteNumber(existingButton?.width, button.width));
        const height = toFiniteNumber(button.height, toFiniteNumber(existingButton?.height, button.height));

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
          qrCodeDetails1: button.qrCodeDetails1,
          qrCodeDetails2: button.qrCodeDetails2,
          qrCodeDetails3: button.qrCodeDetails3,
          qrCodeDetails4: button.qrCodeDetails4,
          customPlaceHolder: button.customPlaceHolder,
          isDigitalSignature: button.isDigitalSignature,
          category: button.category,
          isRequired: button.isRequired,
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
      const response = await uploadFlowService.getControlsLocation(masterDocID);

      if (response.data.successStatus) {
        setControls(response.data.response);
        setButtons(response.data.response);
      }
    } catch (error) {
      toast.error("Error in loading data");
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
    // imageContainerRef points at the <img> element; its bounding rect already includes any CSS scale transform.
    const imgEl = imageContainerRef.current;
    if (!imgEl || !offset) return null;

    const rect = imgEl.getBoundingClientRect();
    const scaleX = rect.width / imgEl.naturalWidth;
    const scaleY = rect.height / imgEl.naturalHeight;
    const clientOffset = monitor.getClientOffset();

    let x = (clientOffset.x - rect.left) / scaleX;
    let y = (clientOffset.y - rect.top) / scaleY;

    if (centerOnPointer) {
      x -= width / 2;
      y -= height / 2;
    } else {
      // Keep the grab point: shift by where the pointer grabbed the control, converted to image pixels.
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
    return getSnappedControlPosition({ position, width, height, controls: displayedButtons, isDraggedControl: (field) => field.controlLocationID === controlLocationID, maxWidth: imgWidth, maxHeight: imgHeight });
  };

  const getItemDimensions = (item) => {
    return item.button ? getControlDimensions(item.button) : getNewControlDimensions(item);
  };

  const handlePlacedControlDrag = (button, position) => {
    const snapped = snapToControls(position, Number(button.width) || 110, Number(button.height) || 40, button.controlLocationID);
    setAlignmentGuides(snapped.guides);
  };

  const handlePlacedControlDrop = (button, position) => {
    const snapped = snapToControls(position, Number(button.width) || 110, Number(button.height) || 40, button.controlLocationID);
    setImageButtonsMap((previousMap) => ({
      ...previousMap,
      [selectedImage]: (previousMap[selectedImage] || []).map((field) =>
        field.controlLocationID === button.controlLocationID
          ? { ...field, position: snapped.position }
          : field
      ),
    }));
    setAlignmentGuides({ vertical: [], horizontal: [], verticalSnapped: false, horizontalSnapped: false });
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

      const offset = monitor.getClientOffset();

      if (offset) {
        if (item && item.button && item.button.controlLocationID && item.button.dragging) {
          const { button } = item;
          const position = getDraggedPosition(offset, monitor, button.width, button.height);
          const snapped = snapToControls(position, button.width, button.height, button.controlLocationID);
          const { x, y } = snapped.position;
          setAlignmentGuides({ vertical: [], horizontal: [], verticalSnapped: false, horizontalSnapped: false });

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
                button.isRequired,
                button.isDigitalSignature,
                button.category
              );
            }
          }
        } else if (item && item.button && !item.button.dragging) {
          setAlignmentGuides({ vertical: [], horizontal: [], verticalSnapped: false, horizontalSnapped: false });
          return null;
        } else {
          const { width: buttonWidth, height: buttonHeight } = getItemDimensions(item);
          const position = getDraggedPosition(offset, monitor, buttonWidth, buttonHeight, true);
          const snapped = snapToControls(position, buttonWidth, buttonHeight);
          const { x, y } = snapped.position;
          setAlignmentGuides({ vertical: [], horizontal: [], verticalSnapped: false, horizontalSnapped: false });

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
            TextEditor: item.label === "Checkbox" || item.label === "Radio" ? "No" : "",
            MasterDocID: selectedMasterDocID,
            RegisterSignID: RegisterSignID,
            MasterDocPagesID: item.MasterDocPagesId,
            SignatoriesID: item.selectedSignatoryID,
            Width: `${buttonWidth}px`,
            Height: `${buttonHeight}px`,
            IsSignature: item.label === "Signature" ? true : false,
            IsQRCode: item.label === "QR Code" ? true : false,
            IsTextEditor: item.label === "Text" ? true : false,
            IsNumber: item.label === "Number" ? true : false,
            IsDate: item.label === "Date" ? true : false,
            IsImage: item.label === "Image" ? true : false,
            IsRequired: false,
            IsRadioButton: item.label === "Radio" ? true : false,
            IsCheckBox: item.label === "Checkbox" ? true : false,
            IsDigitalSignature: false,
            CustomPlaceHolder: getPlaceholder(item.label),
            FontSize: "16px",
            FontColor: "black",
            FontStyle: "Jost",
            PageMaxWidth: `${imgWidth - 108}px`,
            PageMaxHeight: `${imgHeight - 41}px`,
            category: "",
          };

          setIsAPICallInProgress(true); // Disable drop functionality
          try {
            const response = await uploadFlowService.createControlsLocation(controlsLocationBody);

            if (response.data.successStatus) {
              await fetchButtonPositions(selectedMasterDocID);
            }
          } catch (error) {
            toast.error(t("uploadDocFlow.errWrong"));
          } finally {
            setIsAPICallInProgress(false); // Re-enable drop functionality
          }
        }
      }
      setAlignmentGuides({ vertical: [], horizontal: [], verticalSnapped: false, horizontalSnapped: false });
    },
  });

  const formatFontSize = (size) => {
    return typeof size === "number" || !size.endsWith("px") ? `${size}px` : size;
  };

  const updateControlsLocation = async (controlLocationID, controlIdentifier, text, x, y, Height, Width, fontStyle, fontSize, fontColor, placeholder, isRequired, signatureType, category) => {
    const existingButton = displayedButtons.find((btn) => btn.controlLocationID === controlLocationID);
    const validWidth = toFiniteNumber(Width, toFiniteNumber(existingButton?.width, 100));
    const validHeight = toFiniteNumber(Height, toFiniteNumber(existingButton?.height, 100));
    const updatedLocationData = {
      ControlLocationID: controlLocationID,
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
      IsRequired: isRequired,
      IsDigitalSignature: signatureType,
      category: category,
    };

    try {
      const response = await uploadFlowService.updateControlsLocation(updatedLocationData);
      if (response.status === 200) {
        await fetchButtonPositions(selectedMasterDocID);
      }
    } catch (error) {
      toast.error(t("uploadDocFlow.errLocation"));
    }
  };

  // Qr code details

  const updateQRDetails = async (controlLocationID, ID, selectedSignatoryID, detail1, detail2, detail3, detail4, xLocation, yLocation, width, height) => {
    // Never emit "NaNpx"/"undefinedpx": validate against the control's existing dimensions.
    const existingButton = displayedButtons.find((btn) => btn.controlLocationID === controlLocationID);
    const safeWidth = toFiniteNumber(width, toFiniteNumber(existingButton?.width, 100));
    const safeHeight = toFiniteNumber(height, toFiniteNumber(existingButton?.height, 100));
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
      Width: `${safeWidth}px`,
      Height: `${safeHeight}px`,
    };
    try {
      const response = await uploadFlowService.updateQRCodeDetails(reqBody);

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
        await uploadFlowService.deleteControlsLocation(controlLocationIDToRemove);

        toast.success(t("uploadDocFlow.signatoryDeleted"));
        fetchButtonPositions(selectedMasterDocID);
        setIsLoading(false);
      } catch (error) {
        toast.error("Error in deleting signatory");
        setIsLoading(false);
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
