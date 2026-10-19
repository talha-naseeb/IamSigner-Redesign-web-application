import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { Icons } from "@/assets/Icons";

const DraggableButton = ({ icon, label, data, signatoryColors, selectedSignatoryID, controlID, MasterDocPagesId, index, signatureType, onButtonClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconMapping = {
    FaFileSignature: Icons.SignatureFilled,
    PiTextTFill: Icons.Initials,
    BiSolidUserRectangle: Icons.UserFilled,
    GrOrganization: Icons.Building,
    MdEmail: Icons.EmailFilled,
    BsFillCalendarDateFill: Icons.DateFilled,
    FaStamp: Icons.Stamp,
    MdOutlineTextFields: Icons.TextFields,
    IoQrCodeSharp: Icons.QRCode,
    TbNumbers: Icons.Numbers,
    RiListRadio: Icons.RadioList,
    TbListCheck: Icons.CheckboxList,
    RiImageAddFill: Icons.ImageAdd,
  };

  const colorMapping = {
    "#00B2B0": "#00807E",
    "#9F467B": "#6E3055",
    "#E8AC00": "#B28400",
    "#E84600": "#B23600",
    "#29C785": "#219C68",
    "#6F29C7": "#4E1D8C",
    "#C729B7": "#941F88",
    "#E11919": "#AA1313",
    "#84B300": "#577500",
  };

  const currentSignatoryType = selectedSignatoryID && signatureType[selectedSignatoryID];
  const isSignatureButton = icon === "FaFileSignature";
  const isStampButton = icon === "FaStamp";
  const isInitialsButton = icon === "PiTextTFill";
  const isViewOnlySignatory = currentSignatoryType === "View Only" && (isSignatureButton || isStampButton || isInitialsButton);

  const [, ref] = useDrag({
    type: "BUTTON",
    item: {
      label,
      data,
      icon,
      selectedSignatoryID,
      controlID,
      MasterDocPagesId,
      index,
    },
    canDrag: !isViewOnlySignatory,
  });

  const IconComponent = iconMapping[icon];
  const originalColor = signatoryColors[selectedSignatoryID] || "orange";
  const hoverColor = colorMapping[originalColor];

  const backgroundColor = isViewOnlySignatory ? "var(--bg-secondary)" : isHovered ? hoverColor : originalColor;

  const cursor = isViewOnlySignatory ? "not-allowed" : "pointer";

  return (
    <div
      ref={ref}
      className={`tooltip-container draggable-button ${isViewOnlySignatory ? "view-only" : ""}`}
      style={{
        cursor,
        touchAction: "none",
        border: `1px solid ${backgroundColor}`,
        borderRadius: "20px",
        padding: "5px 10px",
      }}
      draggable
      onClick={() => onButtonClick(label, icon, controlID, index, true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </div>
  );
};

export default DraggableButton;
