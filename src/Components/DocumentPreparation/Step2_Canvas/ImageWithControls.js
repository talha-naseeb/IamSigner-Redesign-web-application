import React, { useState, useRef } from "react";
import { Button } from "@/Components/UI/shadcnCompat";
import ResizableButtons from "./ResizableButtons";
import Draggable from "react-draggable";
import { X, Pen } from "lucide-react";
import { Icons } from "@/assets/Icons";
import ControlsFotmatting from "./ControlsFotmatting";
import SmartGuides from "@/Components/SignaturePlacement/SmartGuides";

const renderFieldIcon = (label) => {
  switch (label) {
    case "Signature":
      return <Icons.ContractFilled size={16} className='shrink-0' />;
    case "Initial":
      return <Icons.Initials size={16} className='shrink-0' />;
    case "Name":
      return <Icons.UserFilled size={15} className='shrink-0' />;
    case "Company":
      return <Icons.Building size={15} className='shrink-0' />;
    case "Email":
      return <Icons.EmailFilled size={15} className='shrink-0' />;
    case "Date Signed":
      return <Icons.DateFilled size={15} className='shrink-0' />;
    case "Stamp":
      return <Icons.Stamp size={16} className='shrink-0' />;
    case "QR Code":
      return <Icons.QRCode size={16} className='shrink-0' />;
    case "Image":
      return <Icons.ImageAdd size={16} className='shrink-0' />;
    default:
      return <Icons.ContractFilled size={15} className='shrink-0' />;
  }
};

const ImageWithControls = ({
  signatoryColors,
  selectedImage,
  displayedButtons = [],
  drop,
  updateControlsLocation,
  handleButtonRemove,
  dropRef,
  onUpdateQRDetails,
  imageContainerRef,
  buttons = [],
  isAPICallInProgress, // New prop to disable interaction when API is in progress
  fetchButtonPositions,
  auth,
  alignmentGuides = { vertical: [], horizontal: [], verticalSnapped: false, horizontalSnapped: false },
  onPlacedControlDrag,
  onPlacedControlDrop,
  onPlacedControlResize,
  onPlacedControlResizeEnd,
  isDropOver,
}) => {
  return (
    <div
      className='large-image'
      style={{
        position: "relative",
        height: "auto",
        pointerEvents: isAPICallInProgress ? "none" : "auto", // Disable pointer events during API call
      }}
    >
      <div
        ref={drop(dropRef)}
        className={`doc-image transition-all ${
          isDropOver ? "ring-4 ring-[var(--modern-primary,#4d8dff)] ring-offset-2 rounded-lg" : ""
        }`}
        style={{
          position: "relative",
          height: "auto",
        }}
      >
        <img src={selectedImage} alt='' ref={imageContainerRef} />
        <SmartGuides guides={alignmentGuides} />

        {displayedButtons.map((button, index) => {
          return (
            <ButtonsOnImage
              key={button.controlLocationID}
              button={button}
              index={index}
              handleButtonRemove={handleButtonRemove}
              signatoryColors={signatoryColors}
              updateControlsLocation={updateControlsLocation}
              selectedImage={selectedImage}
              onUpdateQRDetails={onUpdateQRDetails}
              buttons={buttons}
              isAPICallInProgress={isAPICallInProgress} // Pass prop to ButtonsOnImage
              fetchButtonPositions={fetchButtonPositions}
              auth={auth}
              onPlacedControlDrag={onPlacedControlDrag}
              onPlacedControlDrop={onPlacedControlDrop}
              onPlacedControlResize={onPlacedControlResize}
              onPlacedControlResizeEnd={onPlacedControlResizeEnd}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ImageWithControls;

export const ButtonsOnImage = ({
  button,
  index,
  handleButtonRemove,
  signatoryColors,
  updateControlsLocation,
  selectedImage,
  onUpdateQRDetails,
  buttons,
  isAPICallInProgress, // New prop to disable interaction when API is in progress
  fetchButtonPositions,
  auth,
  onPlacedControlDrag,
  onPlacedControlDrop,
  onPlacedControlResize,
  onPlacedControlResizeEnd,
}) => {
  const nodeRef = useRef(null);
  const [resizing, setResizing] = useState(false);
  const [editingStates, setEditingStates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [textInput, setTextInput] = useState();
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
  };

  const handleCheckboxChange = (event) => {
    const value = event.target.checked;
    setCheckboxValue(value);

    const transformedValue = value ? "Yes" : "No";

    updateControlsLocation(
      button.controlLocationID,
      button.controlIdentifier,
      transformedValue,
      button.position.x,
      button.position.y,
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
  };

  const toggleOffcanvas = () => {
    setShowOffcanvas(!showOffcanvas);
  };

  const handleText = (controlLocationID, text) => {
    setTextInput(text);
    setEditingStates((prevState) => ({
      ...prevState,
      [controlLocationID]: true,
    }));
  };

  const handleInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const resizeProps = {
    button,
    onUpdateControlsLocation: updateControlsLocation,
    signatoryColors,
    setResizing,
    selectedImage,
    onResizeGuides: (size) => onPlacedControlResize?.(button, size),
    onResizeGuideEnd: () => onPlacedControlResizeEnd?.(),
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      key={`${button.controlLocationID}-${button.position.x}-${button.position.y}`}
      bounds='parent'
      cancel='.react-resizable-handle, input, textarea, button'
      defaultPosition={{ x: button.position.x, y: button.position.y }}
      disabled={isAPICallInProgress || resizing}
      onDrag={(event, data) => onPlacedControlDrag?.(button, { x: data.x, y: data.y })}
      onStop={(event, data) => {
        const position = onPlacedControlDrop?.(button, { x: data.x, y: data.y }) || { x: data.x, y: data.y };
        updateControlsLocation(
          button.controlLocationID,
          button.controlIdentifier,
          button.textEditor,
          position.x,
          position.y,
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
      }}
    >
      <div
        ref={nodeRef}
        className='draggable-button-container group/drag relative'
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          touchAction: "none",
          pointerEvents: isAPICallInProgress ? "none" : "auto",
        }}
      >
      {button.label === "Radio" && (
        <ResizableButtons {...resizeProps}>
          <div className='flex items-center gap-2 px-2.5 h-full w-full select-none' style={{ cursor: "grab" }}>
            <input
              type='radio'
              id={`radio${button.controlLocationID}`}
              name={categoryMap[button.controlLocationID] || `radioGroup${button.controlLocationID}`}
              className='h-3.5 w-3.5 shrink-0'
            />
            <label
              htmlFor={`radio${button.controlLocationID}`}
              className='m-0 truncate text-[13px] font-semibold leading-none cursor-grab'
              style={{ color: "inherit" }}
            >
              {button.customPlaceHolder}
            </label>
          </div>
        </ResizableButtons>
      )}

      {button.label === "Checkbox" && (
        <ResizableButtons {...resizeProps}>
          <div className='flex items-center gap-2 px-2.5 h-full w-full select-none' style={{ cursor: "grab" }}>
            <input
              type='checkbox'
              id={`checkbox${button.controlLocationID}`}
              name={`checkbox${button.controlLocationID}`}
              value={``}
              checked={checkboxValue}
              onChange={handleCheckboxChange}
              className='h-3.5 w-3.5 shrink-0'
            />
            <label
              htmlFor={`checkbox${button.controlLocationID}`}
              className='m-0 truncate text-[13px] font-semibold leading-none cursor-grab'
              style={{ color: "inherit" }}
            >
              {button.customPlaceHolder}
            </label>
          </div>
        </ResizableButtons>
      )}

      {button.label === "Date" && (
        <ResizableButtons {...resizeProps}>
          <div className='flex h-full w-full items-center px-2.5 select-none'>
            <input
              type='date'
              value={selectedDate || button.textEditor}
              onChange={handleDateChange}
              className='h-full w-full border-none bg-transparent text-[13px] font-semibold cursor-grab focus:outline-none'
              style={{ color: "inherit" }}
              onBlur={() => {
                updateControlsLocation(
                  button.controlLocationID,
                  button.controlIdentifier,
                  selectedDate,
                  button.position.x,
                  button.position.y,
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
              }}
            />
          </div>
        </ResizableButtons>
      )}

      {button.label === "Number" && (
        <ResizableButtons {...resizeProps} onClick={() => handleText(button.controlLocationID, button.textEditor)}>
          {editingStates[button.controlLocationID] ? (
            <input
              type='number'
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              className='h-full w-full border-none bg-transparent px-2.5 text-[13px] font-semibold focus:outline-none'
              style={{ color: "inherit" }}
              onBlur={() => {
                setEditingStates((prevState) => ({
                  ...prevState,
                  [button.controlLocationID]: false,
                }));
                updateControlsLocation(
                  button.controlLocationID,
                  button.controlIdentifier,
                  textInput,
                  button.position.x,
                  button.position.y,
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
              }}
              autoFocus
            />
          ) : (
            <div
              className='flex h-full w-full items-center px-2.5 text-[13px] font-semibold leading-none select-none truncate'
              style={{ color: "inherit" }}
            >
              {button.textEditor !== "" ? button.textEditor : button.customPlaceHolder}
            </div>
          )}
        </ResizableButtons>
      )}

      {button.label === "Text" && (
        <ResizableButtons {...resizeProps} onClick={() => handleText(button.controlLocationID, button.textEditor)}>
          {editingStates[button.controlLocationID] ? (
            <textarea
              className='h-full w-full resize-none border-none bg-transparent px-2.5 text-[13px] font-semibold focus:outline-none'
              style={{ color: "inherit" }}
              value={textInput}
              onChange={handleInputChange}
              onBlur={() => {
                // Clear editing state for this button when blurred
                setEditingStates((prevState) => ({
                  ...prevState,
                  [button.controlLocationID]: false,
                }));
                updateControlsLocation(
                  button.controlLocationID,
                  button.controlIdentifier,
                  textInput,
                  button.position.x,
                  button.position.y,
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
              }}
              autoFocus
            />
          ) : (
            <div
              className='flex h-full w-full items-center px-2.5 text-[13px] font-semibold leading-none select-none truncate'
              style={{ color: "inherit" }}
            >
              {button.textEditor !== "" ? button.textEditor : button.customPlaceHolder}
            </div>
          )}
        </ResizableButtons>
      )}

      {button.label !== "Date" && button.label !== "Text" && button.label !== "Number" && button.label !== "Radio" && button.label !== "Checkbox" && (
        <ResizableButtons {...resizeProps}>
          {button.label === "QR Code" && button.qrCodePath ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <img
                src={`${button.qrCodePath}`}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                alt='QR Code '
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          ) : (
            <div className='flex h-full w-full items-center justify-center gap-1.5 px-2 select-none pointer-events-none'>
              {renderFieldIcon(button.label)}
              <span className='truncate text-[13px] font-semibold leading-none'>{button.customPlaceHolder ?? button.label}</span>
            </div>
          )}
        </ResizableButtons>
      )}

      <button
        type='button'
        aria-label='Remove field'
        onClick={(e) => {
          e.stopPropagation();
          handleButtonRemove(index, button.controlLocationID);
        }}
        className='absolute -top-2.5 -right-2.5 z-30 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-card,#ffffff)] text-[var(--modern-muted,#64748b)] opacity-0 group-hover/drag:opacity-100 hover:border-transparent hover:bg-[var(--modern-danger,#ef4444)] hover:text-white transition-opacity shadow-xs cursor-pointer'
      >
        <X size={10} />
      </button>

      <button
        type='button'
        aria-label='Edit field settings'
        onClick={(e) => {
          e.stopPropagation();
          toggleOffcanvas();
        }}
        className='absolute -top-2.5 -left-2.5 z-30 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--modern-border-strong,#cbd5e1)] bg-[var(--modern-card,#ffffff)] text-[var(--modern-muted,#64748b)] opacity-0 group-hover/drag:opacity-100 hover:border-transparent hover:bg-[var(--modern-primary,#4d8dff)] hover:text-white transition-opacity shadow-xs cursor-pointer'
      >
        <Pen size={9} />
      </button>

      {showOffcanvas && (
        <ControlsFotmatting
          show={showOffcanvas}
          onHide={toggleOffcanvas}
          button={button}
          onUpdateControlsLocation={updateControlsLocation}
          selectedImage={selectedImage}
          onUpdateQRDetails={onUpdateQRDetails}
          buttons={buttons}
          setCategoryMap={setCategoryMap}
          categoryMap={categoryMap}
          fetchButtonPositions={fetchButtonPositions}
          auth={auth}
        />
      )}
      </div>
    </Draggable>
  );
};
