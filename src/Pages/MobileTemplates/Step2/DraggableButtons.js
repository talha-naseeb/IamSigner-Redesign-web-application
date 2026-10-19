
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { FaFileSignature } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { BiSolidUserRectangle } from "react-icons/bi";
import { MdEmail, MdOutlineTextFields } from "react-icons/md";
import { FaStamp } from "react-icons/fa";
import { PiTextTFill } from "react-icons/pi";
import { IoQrCodeSharp } from "react-icons/io5";
import { TbListCheck, TbNumbers } from "react-icons/tb";
import { HiBuildingOffice } from "react-icons/hi2";
import { RiImageAddFill, RiListRadio } from "react-icons/ri";

const DraggableButton = ({
  icon,
  label,
  data,
  signatoryColors,
  selectedSignatoryID,
  controlID,
  MasterDocPagesId,
  index,
  signatureType,
  onButtonClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconMapping = {
    FaFileSignature: FaFileSignature,
    PiTextTFill: PiTextTFill,
    BiSolidUserRectangle: BiSolidUserRectangle,
    GrOrganization: HiBuildingOffice,
    MdEmail: MdEmail,
    BsFillCalendarDateFill: BsFillCalendarDateFill,
    FaStamp: FaStamp,
    MdOutlineTextFields: MdOutlineTextFields,
    IoQrCodeSharp: IoQrCodeSharp,
    TbNumbers: TbNumbers,
    RiListRadio: RiListRadio,
    TbListCheck: TbListCheck,
    RiImageAddFill: RiImageAddFill
  };

  const colorMapping = {
    '#00B2B0': '#00807E',
    '#9F467B': '#6E3055',
    '#E8AC00': '#B28400',
    '#E84600': '#B23600',
    '#29C785': '#219C68',
    '#6F29C7': '#4E1D8C',
    '#C729B7': '#941F88',
    '#E11919': '#AA1313',
    '#84B300': '#577500',
  };

  const currentSignatoryType =
    selectedSignatoryID && signatureType[selectedSignatoryID];
  const isSignatureButton = icon === "FaFileSignature";
  const isStampButton = icon === "FaStamp";
  const isInitialsButton = icon === "PiTextTFill";
  const isViewOnlySignatory =
    currentSignatoryType === "View Only" && (isSignatureButton || isStampButton || isInitialsButton);

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

  const backgroundColor = isViewOnlySignatory
    ? "#CCCCCC"
    : isHovered
      ? hoverColor
      : originalColor;

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
