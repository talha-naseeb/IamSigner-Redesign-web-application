import React, { useEffect, useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const toFiniteNumber = (v, fallback) => { const n = parseFloat(v); return Number.isFinite(n) ? n : fallback; };

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

  const handleButtonResizeStop = (BulkID, controlID, controlIdentifier, text, x, y, width, height, font, size, color, placeholder, isRequired, signatureType, category) => {
    const LocationX = x + width;
    const LocationY = y + height;

    const maxLocationX = imgWidth;
    const maxLocationY = imgHeight;

    // Keep the old size when the new dimensions are not finite numbers.
    const safeWidth = toFiniteNumber(width, button.width);
    const safeHeight = toFiniteNumber(height, button.height);

    if (LocationX > maxLocationX || LocationY > maxLocationY) {
      onUpdateControlsLocation(BulkID, controlID, controlIdentifier, text, x, y, button.height, button.width, font, size, color, placeholder, isRequired, signatureType, category);
    } else {
      onUpdateControlsLocation(BulkID, controlID, controlIdentifier, text, x, y, safeHeight, safeWidth, font, size, color, placeholder, isRequired, signatureType, category);
    }
  };

  const getButtonDimensions = () => {
    const widthValue = Number(button?.width) > 0 ? Number(button.width) : 100;
    const heightValue = Number(button?.height) > 0 ? Number(button.height) : 100;

    if (["Stamp", "QR Code", "Image"].includes(button.label)) {
      return { width: widthValue, height: heightValue };
    } else {
      return { width: button.width, height: button.height };
    }
  };

  const { width, height } = getButtonDimensions();

  return (
    <ResizableBox
      className='field-button'
      width={width}
      height={height}
      onResizeStart={() => setResizing(true)}
      onResize={(event, data) => onResizeGuides?.(data.size)}
      onResizeStop={(e, data) => {
        setResizing(false);
        onResizeGuideEnd?.();
        handleButtonResizeStop(
          button.BulkID,
          button.controlID,
          button.controlIdentifier,
          button.textEditor,
          button.position.x,
          button.position.y,
          data.size.width,
          data.size.height,
          button.fontStyle,
          button.fontSize,
          button.fontColor,
          button.customPlaceHolder,
          button.isRequired,
          button.isDigitalSignature,
          button.category
        );
      }}
      draggableOpts={{}}
      minConstraints={[110, 40]}
      maxConstraints={[200, 200]}
      style={{
        border: `2px dotted ${signatoryColors?.[button?.selectedSignatoryID] || "#e84600"}`,
        cursor: "grab",
        position: button.label === "Text" ? "relative" : "",
        fontFamily: button.fontStyle || "",
        color: button.fontColor || "black",
        fontSize: button.fontSize || "",
        backgroundColor: "rgb(12 154 215 / 4%)",
        // userSelect: "none",
      }}
      {...props}
    >
      {children}
    </ResizableBox>
  );
};

export default ResizableButtons;
