import React, { useEffect, useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const ResizableButtons = ({ children, button, onUpdateControlsLocation, signatoryColors, setResizing, selectedImage, ...props }) => {
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
    const newWidth = Number.isFinite(width) ? width : button.width;
    const newHeight = Number.isFinite(height) ? height : button.height;
    const LocationX = x + newWidth;
    const LocationY = y + newHeight;
    const maxLocationX = imgWidth;
    const maxLocationY = imgHeight;

    if (LocationX > maxLocationX || LocationY > maxLocationY) {
      onUpdateControlsLocation(controlLocationID, controlIdentifier, text, x, y, button.height, button.width, font, size, color, placeholder, isRequired, signatureType, category);
    } else {
      onUpdateControlsLocation(controlLocationID, controlIdentifier, text, x, y, newHeight, newWidth, font, size, color, placeholder, isRequired, signatureType, category);
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
      onResizeStop={(e, data) => {
        setResizing(false);
        handleButtonResizeStop(
          button.controlLocationID,
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
      }}
      title={button.email + "    " + button.name}
      {...props}
    >
      {children}
    </ResizableBox>
  );
};

export default ResizableButtons;
