import React, { useMemo, useState } from "react";
import { useDrag, DragPreviewImage } from "react-dnd";
import { Icons } from "@/assets/Icons";
import {
  getNewControlDimensions,
  createControlDragPreview,
} from "@/Components/SignaturePlacement/SmartGuides";

/**
 * Unified DraggableButton component for field placement palette.
 * Supports signatory color coding, touch devices, and view-only restrictions.
 */
export const DraggableButton = ({
  icon,
  label,
  data,
  signatoryColors = {},
  selectedSignatoryID,
  controlID,
  MasterDocPagesId,
  index,
  signatureType = {},
  onButtonClick,
  variant = "pill",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconMapping = {
    FaFileSignature: Icons.ContractFilled,
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
  const isViewOnlySignatory =
    currentSignatoryType === "View Only" && (isSignatureButton || isStampButton || isInitialsButton);

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: "BUTTON",
    item: () => {
      const dimensions = getNewControlDimensions({ label });
      return {
        label,
        data,
        icon,
        selectedSignatoryID,
        controlID,
        MasterDocPagesId,
        index,
        width: dimensions.width,
        height: dimensions.height,
      };
    },
    canDrag: !isViewOnlySignatory,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const originalColor = (selectedSignatoryID && signatoryColors[selectedSignatoryID]) || "#4d8dff";
  const hoverColor = colorMapping[originalColor] || originalColor;
  const backgroundColor = isViewOnlySignatory
    ? "var(--modern-raised, #f8fafc)"
    : isHovered
    ? hoverColor
    : originalColor;
  const cursor = isViewOnlySignatory ? "not-allowed" : "pointer";
  const IconComponent = iconMapping[icon] || Icons.ContractFilled;

  // Transparent drag preview matching exact control dimensions and signatory color
  const previewSvg = useMemo(
    () => createControlDragPreview({ label, color: originalColor }),
    [label, originalColor]
  );

  if (variant === "tile") {
    return (
      <>
        {!isViewOnlySignatory && <DragPreviewImage connect={previewRef} src={previewSvg} />}
        <div
          ref={dragRef}
          role='button'
          tabIndex={isViewOnlySignatory ? -1 : 0}
          aria-disabled={isViewOnlySignatory}
          className={`flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-[14px] border px-2 text-center text-xs font-semibold select-none transition-all ${
            isDragging ? "opacity-40 scale-95" : ""
          } ${
            isViewOnlySignatory
              ? "cursor-not-allowed border-[var(--modern-border)] bg-[var(--modern-raised)] text-[var(--modern-muted)] opacity-50"
              : "cursor-pointer border-[var(--modern-border)] bg-[var(--modern-card)] text-[var(--modern-text)] hover:border-[var(--modern-primary)] hover:bg-[var(--modern-raised)]"
          }`}
          style={{
            touchAction: "none",
            borderColor: !isViewOnlySignatory && isHovered ? originalColor : undefined,
          }}
          draggable={!isViewOnlySignatory}
          onClick={() => {
            if (!isViewOnlySignatory && onButtonClick) {
              onButtonClick(label, icon, controlID, index, true);
            }
          }}
          onKeyDown={(e) => {
            if (!isViewOnlySignatory && (e.key === "Enter" || e.key === " ") && onButtonClick) {
              e.preventDefault();
              onButtonClick(label, icon, controlID, index, true);
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span
            className='inline-flex items-center justify-center'
            style={{ color: isViewOnlySignatory ? "var(--modern-muted, #64748b)" : originalColor }}
          >
            <IconComponent size={20} />
          </span>
          <span className='w-full truncate leading-tight'>{label}</span>
        </div>
      </>
    );
  }

  return (
    <>
      {!isViewOnlySignatory && <DragPreviewImage connect={previewRef} src={previewSvg} />}
      <div
        ref={dragRef}
        className={`tooltip-container draggable-button ${isViewOnlySignatory ? "view-only" : ""}`}
        style={{
          cursor,
          touchAction: "none",
          border: `1px solid ${backgroundColor}`,
          borderRadius: "20px",
          padding: "5px 10px",
        }}
        draggable={!isViewOnlySignatory}
        onClick={() => onButtonClick && onButtonClick(label, icon, controlID, index, true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label}
      </div>
    </>
  );
};

export default DraggableButton;
