import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/Components/UI/shadcnCompat";
import ResizableButtons from "./ResizableButtons";
import Draggable from "react-draggable";
import { X, Pen, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
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
  const [zoomScale, setZoomScale] = useState(1);
  const [isFitMode, setIsFitMode] = useState(false);
  const [naturalDim, setNaturalDim] = useState({ width: 0, height: 0 });
  const viewportDeskRef = useRef(null);
  const userManualZoomRef = useRef(false);

  const calculateFitScale = useCallback((nw) => {
    if (!viewportDeskRef.current || !nw) return 1;
    const padding = window.innerWidth < 768 ? 16 : 32;
    const avail = viewportDeskRef.current.clientWidth - padding;
    if (avail > 0 && nw > 0) {
      return Math.min(1.0, Math.max(0.25, avail / nw));
    }
    return 1;
  }, []);

  const handleImageLoaded = (e) => {
    const nw = e.target.naturalWidth || 800;
    const nh = e.target.naturalHeight || 1100;
    setNaturalDim({ width: nw, height: nh });

    // Auto-fit document to screen/device size unless user has explicitly customized zoom
    if (!userManualZoomRef.current) {
      const fit = calculateFitScale(nw);
      if (fit < 1.0 || window.innerWidth < 1024) {
        setZoomScale(Number(fit.toFixed(2)));
        setIsFitMode(true);
      } else {
        setZoomScale(1);
        setIsFitMode(false);
      }
    }
  };

  // Dynamically auto-fit document when container or device/window resizes
  useEffect(() => {
    const el = viewportDeskRef.current;
    if (!el || !naturalDim.width) return;

    const handleResize = () => {
      if (!userManualZoomRef.current || isFitMode) {
        const newFit = calculateFitScale(naturalDim.width);
        setZoomScale(Number(newFit.toFixed(2)));
        setIsFitMode(true);
      }
    };

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(el);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [naturalDim.width, calculateFitScale, isFitMode]);

  const handleZoomIn = () => {
    userManualZoomRef.current = true;
    setIsFitMode(false);
    setZoomScale((prev) => Math.min(2.0, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    userManualZoomRef.current = true;
    setIsFitMode(false);
    setZoomScale((prev) => Math.max(0.25, Number((prev - 0.15).toFixed(2))));
  };

  const handleFitToggle = () => {
    if (!naturalDim.width) return;
    if (isFitMode) {
      userManualZoomRef.current = true;
      setZoomScale(1);
      setIsFitMode(false);
    } else {
      userManualZoomRef.current = false;
      const fit = calculateFitScale(naturalDim.width);
      setZoomScale(Number(fit.toFixed(2)));
      setIsFitMode(true);
    }
  };

  return (
    <div className='w-full flex flex-col items-center' ref={viewportDeskRef}>
      {/* Zoom / Scaling Control Pill */}
      <div className='sticky top-2 z-20 mb-3 flex items-center gap-1.5 rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-card)] px-2 py-1 backdrop-blur-md'>
        <button
          type='button'
          onClick={handleZoomOut}
          disabled={zoomScale <= 0.25}
          title='Zoom out'
          className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:border-[var(--modern-border)] cursor-pointer transition-colors'
        >
          <ZoomOut size={13} />
        </button>

        <button
          type='button'
          onClick={handleFitToggle}
          title='Reset to 100%'
          className={`min-w-[58px] px-2.5 py-1 rounded-full border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
            isFitMode
              ? "border-[var(--modern-primary)] bg-[var(--modern-primary)]/15 text-[var(--modern-primary)]"
              : "border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)]"
          }`}
        >
          {Math.round(zoomScale * 100)}%
        </button>

        <button
          type='button'
          onClick={handleZoomIn}
          disabled={zoomScale >= 2.0}
          title='Zoom in'
          className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:text-[var(--modern-primary)] disabled:opacity-30 disabled:border-[var(--modern-border)] cursor-pointer transition-colors'
        >
          <ZoomIn size={13} />
        </button>

        <div className='h-4 w-px bg-[var(--modern-border-strong)] mx-0.5' />

        <button
          type='button'
          onClick={handleFitToggle}
          title='Fit to screen'
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
            isFitMode
              ? "border-[var(--modern-primary)] bg-[var(--modern-primary)] text-white"
              : "border-[var(--modern-border-strong)] bg-[var(--modern-raised)] text-[var(--modern-primary)] hover:bg-[var(--modern-card)]"
          }`}
        >
          <Maximize2 size={12} />
          <span>Fit</span>
        </button>
      </div>

      {/* Scaled Document Canvas Desk */}
      <div
        className='max-w-full overflow-auto flex justify-center pb-6'
        style={{
          pointerEvents: isAPICallInProgress ? "none" : "auto",
        }}
      >
        <div
          style={{
            width: naturalDim.width ? `${naturalDim.width * zoomScale}px` : "auto",
            height: naturalDim.height ? `${naturalDim.height * zoomScale}px` : "auto",
            position: "relative",
          }}
          className='transition-all duration-150'
        >
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: "top left",
              width: naturalDim.width || "auto",
              height: naturalDim.height || "auto",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <div
              ref={drop(dropRef)}
              className={`doc-image relative rounded-xl overflow-hidden border-2 border-[var(--modern-border-strong)] bg-white transition-all ${
                isDropOver ? "ring-4 ring-[var(--modern-primary,#4d8dff)] ring-offset-2" : ""
              }`}
              style={{
                position: "relative",
                height: "auto",
              }}
            >
              <img
                src={selectedImage}
                alt='Document Page'
                ref={imageContainerRef}
                onLoad={handleImageLoaded}
                className='block select-none pointer-events-none'
              />
              <SmartGuides guides={alignmentGuides} />

              {displayedButtons.map((button, index) => {
                const uniqueKey =
                  button.controlLocationID ||
                  button.controlIdentifier ||
                  button.id ||
                  `ctrl-${button.label || "field"}-${index}-${button.position?.x ?? 0}-${button.position?.y ?? 0}`;

                return (
                  <ButtonsOnImage
                    key={uniqueKey}
                    button={button}
                    index={index}
                    handleButtonRemove={handleButtonRemove}
                    signatoryColors={signatoryColors}
                    updateControlsLocation={updateControlsLocation}
                    selectedImage={selectedImage}
                    onUpdateQRDetails={onUpdateQRDetails}
                    buttons={buttons}
                    isAPICallInProgress={isAPICallInProgress}
                    fetchButtonPositions={fetchButtonPositions}
                    auth={auth}
                    onPlacedControlDrag={onPlacedControlDrag}
                    onPlacedControlDrop={onPlacedControlDrop}
                    onPlacedControlResize={onPlacedControlResize}
                    onPlacedControlResizeEnd={onPlacedControlResizeEnd}
                    scale={zoomScale}
                  />
                );
              })}
            </div>
          </div>
        </div>
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
  scale = 1,
}) => {
  const nodeRef = useRef(null);
  const [resizing, setResizing] = useState(false);
  const [editingStates, setEditingStates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [textInput, setTextInput] = useState();
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});

  const signatoryColor =
    (button?.selectedSignatoryID && signatoryColors?.[button.selectedSignatoryID]) ||
    "#4d8dff";
  const rawFontSize = button?.fontSize || button?.FontSize;
  const fieldFontSize = rawFontSize
    ? typeof rawFontSize === "number" || !String(rawFontSize).endsWith("px")
      ? `${rawFontSize}px`
      : rawFontSize
    : "inherit";
  const customColor = button?.fontColor || button?.FontColor;
  const fieldFontColor = customColor && customColor !== "" ? customColor : signatoryColor;
  const fieldFontStyle = button?.fontStyle || button?.FontStyle || "inherit";
  const fieldTypographyStyle = {
    color: fieldFontColor,
    fontSize: fieldFontSize,
    fontFamily: fieldFontStyle,
  };

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
      scale={scale || 1}
      key={`${button.controlLocationID || button.controlIdentifier || button.id || index}-${button.position?.x ?? 0}-${button.position?.y ?? 0}`}
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
              className='h-full w-full border-none bg-transparent font-semibold cursor-grab focus:outline-none'
              style={fieldTypographyStyle}
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
              className='h-full w-full border-none bg-transparent px-2.5 font-semibold focus:outline-none'
              style={fieldTypographyStyle}
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
              className='flex h-full w-full items-center px-2.5 font-semibold leading-none select-none truncate'
              style={fieldTypographyStyle}
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
              className='h-full w-full resize-none border-none bg-transparent px-2.5 font-semibold focus:outline-none'
              style={fieldTypographyStyle}
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
              className='flex h-full w-full items-center px-2.5 font-semibold leading-none select-none truncate'
              style={fieldTypographyStyle}
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
            <div className='flex h-full w-full items-center justify-center gap-1.5 px-2 select-none pointer-events-none' style={{ color: fieldFontColor }}>
              {renderFieldIcon(button.label)}
              <span className='truncate font-semibold leading-none' style={fieldTypographyStyle}>
                {button.customPlaceHolder ?? button.label}
              </span>
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
        className='absolute -top-2.5 -right-2.5 z-30 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-card)] text-[var(--modern-muted)] opacity-0 group-hover/drag:opacity-100 hover:border-transparent hover:bg-[var(--modern-danger,#ef4444)] hover:text-white transition-all cursor-pointer'
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
        className='absolute -top-2.5 -left-2.5 z-30 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--modern-border-strong)] bg-[var(--modern-card)] text-[var(--modern-muted)] opacity-0 group-hover/drag:opacity-100 hover:border-transparent hover:bg-[var(--modern-primary,#4d8dff)] hover:text-white transition-all cursor-pointer'
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
          signatoryColor={signatoryColor}
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
