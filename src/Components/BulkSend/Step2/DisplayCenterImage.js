import React, { useState, useRef, useEffect } from "react";
import uploadFlowService from "@/services/uploadFlowService";
import { toast } from "react-toastify";
import { useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import ImageWithControls from "./ImageWithControls";
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
  const dropRef = useRef(null);
  useDragAutoScroll(dropRef);
  // Re-entrancy guards for control creation. isAPICallInProgress is state
  // (async), so two near-simultaneous creates would both pass its check and
  // create the same control twice on the server. Refs flip synchronously.
  const dropCreateRef = useRef(false);
  const clickCreateRef = useRef(false);
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
      if (clickCreateRef.current) return;
      clickCreateRef.current = true;
      // Consume the click immediately so a second effect run (e.g. a dep
      // change while the request is in flight) can't create it again.
      setButtonClicked(false);

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
        TextEditor: "",
        MasterDocID: selectedMasterDocID,
        RegisterSignID: RegisterSignID,
        MasterDocPagesID: masterDocPagesId,
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
        const response = await uploadFlowService.createControlsLocationBulk(controlsLocationBody);

        if (response.data.successStatus) {
          await fetchButtonPositions(selectedMasterDocID);
          setIsLoading(false);

          // Scroll the image container into view
          if (imageContainerRef.current) {
            imageContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      } catch (error) {
        toast.error(t("uploadDocFlow.errWrong"));
        setIsLoading(false);
      } finally {
        clickCreateRef.current = false;
        setIsAPICallInProgress(false); // Re-enable drop functionality
        setIsLoading(false);
      }
    };

    if (buttonClicked && controlID && selectedMasterDocID && selectedSignatoryID) {
      createButtonOnClick();
    }
  }, [buttonClicked, controlID, selectedMasterDocID, selectedSignatoryID]);

  let displayedButtons = imageButtonsMap[selectedImage] || [];
  {
    const seenIDs = new Set();
    displayedButtons = displayedButtons.filter((b) => {
      const id = b.BulkID ?? b.controlLocationID ?? b.controlID;
      if (seenIDs.has(id)) return false;
      seenIDs.add(id);
      return true;
    });
  }
  const getButtons = () => {
    const selectedImageButtons = buttons && buttons.filter((button) => button.masterDocPagesID === masterDocPagesId);

    const getButtonsData =
      selectedImageButtons &&
      selectedImageButtons.map((button) => {
        const positionX = parseFloat(button.controlLocationX);
        const positionY = parseFloat(button.controlLocationY);
        const prevButton = (imageButtonsMap[selectedImage] || []).find((b) => b.controlLocationID === button.controlLocationID);
        const width = toFiniteNumber(button.width, prevButton ? prevButton.width : undefined);
        const height = toFiniteNumber(button.height, prevButton ? prevButton.height : undefined);

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
          BulkID: button.BulkID ?? button.bulkID,
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
  }, [buttons, selectedImage, masterDocPagesId, controlID]);

  const fetchButtonPositions = async () => {
    try {
      const response = await uploadFlowService.getDistinctControlsLocation(RegisterSignID, selectedMasterDocID);

      if (response.data.successStatus) {
        setControls(response.data.response);
        setButtons(response.data.response);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAPICallInProgress(false);
    }
  };

  useEffect(() => {
    if (selectedMasterDocID) {
      fetchButtonPositions(selectedMasterDocID);
    }
  }, [selectedMasterDocID, masterDocPagesId]);

  const getDraggedPosition = (offset, monitor, width, height, centerOnPointer = false) => {
    // imageContainerRef points at the <img> element; its bounding rect already includes any CSS scale transform,
    // so this converts client pixels to natural image pixels with no viewport-specific fudge factors.
    const imgEl = imageContainerRef.current;
    if (!imgEl || !imgEl.naturalWidth || !offset) return null;

    const rect = imgEl.getBoundingClientRect();
    const scaleX = rect.width / imgEl.naturalWidth;
    const scaleY = rect.height / imgEl.naturalHeight;
    const pointerX = (offset.x - rect.left) / scaleX;
    const pointerY = (offset.y - rect.top) / scaleY;
    let x;
    let y;
    if (centerOnPointer) {
      x = pointerX - width / 2;
      y = pointerY - height / 2;
    } else {
      // Keep the pointer's grab point inside the control: grab offsets are in rendered pixels,
      // so they are divided by the real scale too.
      const initialPointer = monitor.getInitialClientOffset();
      const initialSource = monitor.getInitialSourceClientOffset();
      x = pointerX - (initialPointer.x - initialSource.x) / scaleX;
      y = pointerY - (initialPointer.y - initialSource.y) / scaleY;
    }
    return { x: Math.max(0, Math.min(x, imgWidth - width)), y: Math.max(0, Math.min(y, imgHeight - height)) };
  };

  const snapToControls = (position, width, height, controlID, bulkID) => {
    return getSnappedControlPosition({ position, width, height, controls: displayedButtons, isDraggedControl: (field) => !!bulkID && field.controlID === controlID && field.BulkID === bulkID, maxWidth: imgWidth, maxHeight: imgHeight });
  };

  const getItemDimensions = (item) => item.button ? getControlDimensions(item.button) : getNewControlDimensions(item);
  const handlePlacedControlDrag = (button, position) => setAlignmentGuides(snapToControls(position, Number(button.width) || 110, Number(button.height) || 40, button.controlID, button.BulkID).guides);
  const handlePlacedControlDrop = (button, position) => {
    const snapped = snapToControls(position, Number(button.width) || 110, Number(button.height) || 40, button.controlID, button.BulkID);
    setImageButtonsMap((previousMap) => ({ ...previousMap, [selectedImage]: (previousMap[selectedImage] || []).map((field) => button.BulkID && field.controlID === button.controlID && field.BulkID === button.BulkID ? { ...field, position: snapped.position } : field) }));
    setAlignmentGuides({ vertical: [], horizontal: [], verticalSnapped: false, horizontalSnapped: false });
    return snapped.position;
  };
  const handlePlacedControlResize = (button, size) => setAlignmentGuides(snapToControls(button.position, size.width, size.height, button.controlID, button.BulkID).guides);
  const clearAlignmentGuides = () => setAlignmentGuides(emptyAlignmentGuides());

  const [, drop] = useDrop({
    accept: "BUTTON",
    canDrop: () => !isAPICallInProgress,
    hover: (item, monitor) => {
      if (isAPICallInProgress) return;
      const { width, height } = getItemDimensions(item);
      setAlignmentGuides(snapToControls(getDraggedPosition(monitor.getClientOffset(), monitor, width, height, !item.button), width, height, item.button?.controlID, item.button?.BulkID).guides);
    },
    drop: async (item, monitor) => {
      if (isAPICallInProgress) return;
      setAlignmentGuides(emptyAlignmentGuides());

      // Prevent default touch behavior
      monitor.getSourceClientOffset();
      monitor.getInitialClientOffset();

      // Get the current position of the drop
      const offset = monitor.getClientOffset();

      const dragStartOffset = monitor.getInitialClientOffset();
      const dragStartPoint = monitor.getInitialSourceClientOffset();
      // s(dragStartOffset, dragStartPoint)

      if (offset) {
        if (item && item.button && item.button.controlID && item.button.dragging) {
          const { button } = item;

          // Convert the client (rendered) drop point into the image's natural
          // coordinate space using the REAL rendered scale. getBoundingClientRect()
          // already includes the CSS `scale` transform, so this is correct on
          // desktop and mobile with no viewport-specific fudge factors.
          const imgEl = imageContainerRef.current;
          if (!imgEl) return;
          const rect = imgEl.getBoundingClientRect();
          const scaleX = rect.width / imgEl.naturalWidth;
          const scaleY = rect.height / imgEl.naturalHeight;
          // Keep the pointer's grab point inside the control (grab offsets are in
          // rendered pixels, so they are divided by the real scale too).
          let x = (offset.x - rect.left - (dragStartOffset.x - dragStartPoint.x)) / scaleX;
          let y = (offset.y - rect.top - (dragStartOffset.y - dragStartPoint.y)) / scaleY;

          // Ensure drop position is within image boundaries
          x = Math.max(0, Math.min(x, imgWidth - button.width));
          y = Math.max(0, Math.min(y, imgHeight - button.height));

          // Find the index where controlLocationID matches
          const index = displayedButtons.findIndex((btn) => button.BulkID && btn.controlID === button.controlID && btn.BulkID === button.BulkID);

          if (!isNaN(index) && index >= 0 && index < displayedButtons.length) {
            const updatedButtons = [...displayedButtons];
            const draggedButton = updatedButtons[index];

            if (draggedButton) {
              draggedButton.position = { x, y };
              setImageButtonsMap((prevMap) => ({
                ...prevMap,
                [selectedImage]: updatedButtons,
              }));
              // setTextInput(button.textEditor);

              updateControlsLocation(
                button.BulkID,
                button.controlID,
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
          setAlignmentGuides(emptyAlignmentGuides());
          return null;
        } else {
          // Guard against double-submits: a second drop fired for the same
          // gesture (double drop event, touch tap+drag) must not create the
          // control twice on the server.
          if (dropCreateRef.current) return;
          dropCreateRef.current = true;

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
            TextEditor: "",
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

            MasterDocID: selectedMasterDocID,
            RegisterSignID: RegisterSignID,
            MasterDocPagesID: masterDocPagesId,
          };

          setIsAPICallInProgress(true); // Disable drop functionality
          try {
            const response = await uploadFlowService.createControlsLocationBulk(controlsLocationBody);

            if (response.data.successStatus) {
              await fetchButtonPositions(selectedMasterDocID);
            }
          } catch (error) {
            toast.error(t("uploadDocFlow.errWrong"));
          } finally {
            dropCreateRef.current = false;
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

  const updateControlsLocation = async (BulkID, controlID, controlIdentifier, text, x, y, Height, Width, fontStyle, fontSize, fontColor, placeholder, isRequired, signatureType, category) => {
    // Never send "undefinedpx"/"NaNpx": validate against the control's existing dimensions.
    const existingButton = displayedButtons.find((btn) => btn.controlLocationID === BulkID || btn.BulkID === BulkID);
    const safeWidth = toFiniteNumber(Width, existingButton ? existingButton.width : 0);
    const safeHeight = toFiniteNumber(Height, existingButton ? existingButton.height : 0);
    const updatedLocationData = {
      BulkID: BulkID,
      ControlIdentifier: controlIdentifier,
      ControlLocationX: `${x}px`,
      ControlLocationY: `${y}px`,
      TextEditor: text,
      Width: `${safeWidth}px`,
      Height: `${safeHeight}px`,
      FontSize: formatFontSize(fontSize),
      FontColor: fontColor,
      FontStyle: fontStyle,
      CustomPlaceHolder: placeholder,
      IsRequired: isRequired,
      IsDigitalSignature: signatureType,
      ControlID: controlID,
      MasterDocID: selectedMasterDocID,
      RegisterSignID: RegisterSignID,
      MasterDocPagesID: masterDocPagesId,
    };
    // setIsLoading(true);
    try {
      const response = await uploadFlowService.updateControlsLocationBulk(updatedLocationData);

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
    const existingButton = displayedButtons.find((btn) => btn.controlLocationID === controlLocationID || btn.BulkID === controlLocationID);
    const safeWidth = toFiniteNumber(width, toFiniteNumber(existingButton?.width, 0));
    const safeHeight = toFiniteNumber(height, toFiniteNumber(existingButton?.height, 0));
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

  const handleButtonRemove = (index, BulkID) => {
    setControlLocationIDToRemove(BulkID);
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
        await uploadFlowService.deleteControlsLocationBulk(controlLocationIDToRemove);

        toast.success(t("uploadDocFlow.signatoryDeleted"));
        fetchButtonPositions(selectedMasterDocID);
        setIsLoading(false);
      } catch (error) {
        toast.error(t("uploadDocFlow.ErrDeletSignatory"));
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
        headerIconSrc={Icons.DeleteAction}
      />
    </>
  );
};

export default ImageWithDropZone;
