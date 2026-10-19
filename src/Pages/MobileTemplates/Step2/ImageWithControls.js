import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { Button } from "react-bootstrap";
import ResizableButtons from "./ResizableButtons";
import { useDrag } from "react-dnd";
import "react-datepicker/dist/react-datepicker.css";
import { RiEdit2Fill } from "react-icons/ri";
import ControlsFotmatting from "./ControlsFotmatting";

const ImageWithControls = ({
  signatoryColors,
  selectedImage,
  displayedButtons = [],
  drop,
  updateControlsLocation,
  handleButtonRemove,
  dropRef,
  textInput,
  setTextInput,
  onUpdateQRDetails,
  imageContainerRef,
  buttons = [],
  isAPICallInProgress, // New prop to disable interaction when API is in progress
  fetchButtonPositions,
  auth,
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
        className='doc-image'
        style={{
          // width: "100%",
          position: "relative",
          height: "auto",
        }}
      >
        <img src={selectedImage} alt='' ref={imageContainerRef} />

        {displayedButtons.map((button, index) => {
          return (
            <ButtonsOnImage
              button={button}
              index={index}
              handleButtonRemove={handleButtonRemove}
              signatoryColors={signatoryColors}
              updateControlsLocation={updateControlsLocation}
              textInput={textInput}
              setTextInput={setTextInput}
              selectedImage={selectedImage}
              onUpdateQRDetails={onUpdateQRDetails}
              buttons={buttons}
              isAPICallInProgress={isAPICallInProgress} // Pass prop to ButtonsOnImage
              fetchButtonPositions={fetchButtonPositions}
              auth={auth}
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
}) => {
  const [resizing, setResizing] = useState(false);
  const [editingStates, setEditingStates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [textInput, setTextInput] = useState();
  const [showDateInput, setShowDateInput] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [radioButtonValue, setRadioButtonValue] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

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

  button = {
    ...button,
    dragging: !resizing,
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

  const [, ref] = useDrag({
    type: "BUTTON",
    item: {
      button,
    },
    canDrag: !isAPICallInProgress,
  });

  const resizeProps = {
    button,
    onUpdateControlsLocation: updateControlsLocation,
    signatoryColors,
    setResizing,
    selectedImage,
  };

  return (
    <div
      ref={ref}
      key={button.controlLocationID}
      className='draggable-button-container'
      draggable={!resizing && !isAPICallInProgress}
      style={{
        position: "absolute",
        left: `${button.position.x}px`,
        top: `${button.position.y}px`,
        touchAction: "none",

        pointerEvents: isAPICallInProgress ? "none" : "auto",
      }}
    >
      {button.label === "Radio" && (
        <ResizableButtons {...resizeProps}>
          <div
            style={{
              width: button.width + "px",
              height: button.height + "px",
              padding: "10px ",
              cursor: "grab",
            }}
          >
            <div className='d-flex justify-content-start align-items-center gap-2'>
              <input
                type='radio'
                id={`radio${button.controlLocationID}`}
                name={categoryMap[button.controlLocationID] || `radioGroup${button.controlLocationID}`}
                style={{ width: "15px", height: "15px" }}
              />

              <label htmlFor={`radio${button.controlLocationID}`}>{button.customPlaceHolder}</label>
            </div>
          </div>
        </ResizableButtons>
      )}

      {button.label === "Checkbox" && (
        <ResizableButtons {...resizeProps}>
          <div
            div
            style={{
              width: button.width + "px",
              height: button.height + "px",
              padding: "10px ",
              cursor: "grab",
            }}
          >
            <div className='d-flex justify-content-start align-items-center gap-2'>
              <input
                type='checkbox'
                id={`checkbox${button.controlLocationID}`}
                name={`checkbox${button.controlLocationID}`}
                value={``}
                checked={checkboxValue}
                onChange={handleCheckboxChange}
                style={{ width: "15px", height: "15px" }}
              />

              <label htmlFor={`checkbox${button.controlLocationID}`}>{button.customPlaceHolder}</label>
            </div>
          </div>
        </ResizableButtons>
      )}

      {button.label === "Date" && (
        <ResizableButtons {...resizeProps} onClick={() => setShowDateInput(true)}>
          <div
            style={{
              width: button.width + "px",
              height: button.height + "px",
              padding: "10px ",
              cursor: "grab",
            }}
          >
            {/* {showDateInput ? */}
            <input
              type='date'
              value={selectedDate || button.textEditor}
              onChange={handleDateChange}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                cursor: "grab",
                background: "transparent",
              }}
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
                setShowDateInput(false);
              }}
            />
            {/* : */}
            {/* <div style={{
                width: "100%",
                height: "100%",
                border: "none",
                cursor: "grab"
              }}>
                {button.textEditor && button.textEditor !== "" ? button.textEditor : "dd/mm/yyyy"}
              </div> */}

            {/* } */}
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
              style={{
                width: button.width + "px",
                height: button.height + "px",
              }}
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
              style={{
                width: button.textEditor ? "100%" : "",
                height: button.textEditor ? "100%" : "",
                display: "flex",
                flexWrap: "wrap",
              }}
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
              style={{
                width: button.width + "px",
                height: button.height + "px",
                overflow: "auto",
                resize: "none",
              }}
              value={textInput}
              onChange={(event) => handleInputChange(event)}
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
              style={{
                width: button.textEditor ? "100%" : "",
                height: button.textEditor ? "100%" : "",
                display: "flex",
                flexWrap: "wrap",
              }}
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
            <div>{button.customPlaceHolder ?? button.label}</div>
          )}
        </ResizableButtons>
      )}

      <Button className='remove-button' onClick={() => handleButtonRemove(index, button.controlLocationID)}>
        <RxCross2 size={9} />
      </Button>

      <Button className='draggableEdit-button' onClick={toggleOffcanvas}>
        <RiEdit2Fill size={9} />
      </Button>

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
  );
};
