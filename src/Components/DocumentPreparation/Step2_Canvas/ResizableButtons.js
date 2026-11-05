import React, { useEffect, useState } from "react";
import { ResizableBox } from "react-resizable";
import { getNewControlDimensions } from "@/Components/SignaturePlacement/SmartGuides";
import "react-resizable/css/styles.css";

const ResizableButtons = ({ children, button, onUpdateControlsLocation, signatoryColors, setResizing, selectedImage, onResizeGuides, onResizeGuideEnd, ...props }) => {
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);

  useEffect(() => {
    let img = new Image();
    img.onload = function () {
      setImgWidth(this.naturalWidth);
      setImgHeight(this.naturalHeight);
    };

    img.src = selectedImage;
  }, [selectedImage]);

  const handleButtonResizeStop = (controlLocationID, controlIdentifier, text, x, y, width, height, font, size, color, placeholder, isRequired, signatureType, category) => {
    const parsedWidth = Number.isFinite(Number(width)) ? Number(width) : Number(button.width);
    const parsedHeight = Number.isFinite(Number(height)) ? Number(height) : Number(button.height);
    const safeWidth = Math.max(80, parsedWidth);
    const safeHeight = Math.max(30, parsedHeight);
    const LocationX = x + safeWidth;
    const LocationY = y + safeHeight;
    const maxLocationX = imgWidth;
    const maxLocationY = imgHeight;

    if (LocationX > maxLocationX || LocationY > maxLocationY) {
      onUpdateControlsLocation(controlLocationID, controlIdentifier, text, x, y, safeHeight, safeWidth, font, size, color, placeholder, isRequired, signatureType, category);
    } else {
      onUpdateControlsLocation(controlLocationID, controlIdentifier, text, x, y, safeHeight, safeWidth, font, size, color, placeholder, isRequired, signatureType, category);
    }
  };

  // Conditionally set width and height for specific button types (minimum 80x30 enforced)
  const getButtonDimensions = () => {
    const fallback = getNewControlDimensions(button);
    const w = parseFloat(button?.width || button?.Width);
    const h = parseFloat(button?.height || button?.Height);

    return {
      width: Math.max(80, Number.isFinite(w) && w > 0 ? w : Math.max(80, fallback.width)),
      height: Math.max(30, Number.isFinite(h) && h > 0 ? h : Math.max(30, fallback.height)),
    };
  };

  const { width, height } = getButtonDimensions();
  const signatoryColor =
    (button?.selectedSignatoryID && signatoryColors?.[button.selectedSignatoryID]) ||
    "#4d8dff";
  const fieldFontColor = button?.fontColor || button?.FontColor || signatoryColor;
  const rawFontSize = button?.fontSize || button?.FontSize;
  const fieldFontSize = rawFontSize
    ? typeof rawFontSize === "number" || !String(rawFontSize).endsWith("px")
      ? `${rawFontSize}px`
      : rawFontSize
    : "13px";

  return (
    <ResizableBox
      className='field-button group/field relative flex items-center justify-center select-none'
      width={width}
      height={height}
      onResizeStart={() => setResizing(true)}
      onResize={(event, data) => onResizeGuides?.(data.size)}
      onResizeStop={(e, data) => {
        setResizing(false);
        onResizeGuideEnd?.();
        handleButtonResizeStop(
          button.controlLocationID,
          button.controlIdentifier,
          button.textEditor,
          button.position.x,
          button.position.y,
          data.size.width,
          data.size.height,
          button.fontStyle || button.FontStyle,
          button.fontSize || button.FontSize,
          button.fontColor || button.FontColor,
          button.customPlaceHolder,
          button.isRequired,
          button.isDigitalSignature,
          button.category
        );
      }}
      draggableOpts={{}}
      minConstraints={[80, 30]}
      maxConstraints={[320, 320]}
      style={{
        border: `2px dashed ${signatoryColor}`,
        borderRadius: "8px",
        cursor: "grab",
        position: button.label === "Text" ? "relative" : "",
        fontFamily: button.fontStyle || button.FontStyle || "",
        color: fieldFontColor,
        fontSize: fieldFontSize,
        fontWeight: "600",
        backgroundColor: "rgb(12 154 215 / 4%)",
        boxSizing: "border-box",
        overflow: "visible",
      }}
      title={button.email + "    " + button.name}
      {...props}
    >
      {button?.isRequired && (
        <span
          className='pointer-events-none absolute -top-1 -left-1 z-10 h-2.5 w-2.5 rounded-full border border-white bg-[var(--modern-danger,#ef4444)] shadow-xs'
          title='Required'
        />
      )}
      {children}
    </ResizableBox>
  );
};

export default ResizableButtons;
