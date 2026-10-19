import React from "react";
import "./SmartGuides.css";

export const emptyAlignmentGuides = () => ({
  vertical: [],
  horizontal: [],
  verticalSnapped: false,
  horizontalSnapped: false,
});

export const getControlDimensions = (control) => ({
  width: Number(control?.width) || 110,
  height: Number(control?.height) || 40,
});

export const getNewControlDimensions = (control) =>
  ["QR Code", "Stamp", "Image"].includes(control?.label)
    ? { width: 100, height: 100 }
    : { width: 110, height: 40 };

export const snapToControls = ({
  position,
  width,
  height,
  controls,
  isDraggedControl = () => false,
  maxWidth,
  maxHeight,
  threshold = 14,
}) => {
  if (!position) return { position, guides: emptyAlignmentGuides() };

  let nearestVertical;
  let nearestHorizontal;

  controls.filter((control) => !isDraggedControl(control)).forEach((control) => {
    const dimensions = getControlDimensions(control);

    [control.position.x, control.position.x + dimensions.width].forEach((target) => {
      [position.x, position.x + width].forEach((source) => {
        const distance = Math.abs(target - source);
        if (distance <= threshold && (!nearestVertical || distance < nearestVertical.distance)) {
          nearestVertical = { target, distance, delta: target - source };
        }
      });
    });

    [control.position.y, control.position.y + dimensions.height].forEach((target) => {
      [position.y, position.y + height].forEach((source) => {
        const distance = Math.abs(target - source);
        if (distance <= threshold && (!nearestHorizontal || distance < nearestHorizontal.distance)) {
          nearestHorizontal = { target, distance, delta: target - source };
        }
      });
    });
  });

  return {
    position: {
      x: Math.max(0, Math.min(position.x + (nearestVertical?.delta || 0), maxWidth - width)),
      y: Math.max(0, Math.min(position.y + (nearestHorizontal?.delta || 0), maxHeight - height)),
    },
    guides: {
      vertical: nearestVertical ? [nearestVertical.target] : [position.x, position.x + width],
      horizontal: nearestHorizontal ? [nearestHorizontal.target] : [position.y, position.y + height],
      verticalSnapped: Boolean(nearestVertical),
      horizontalSnapped: Boolean(nearestHorizontal),
    },
  };
};

const SmartGuides = ({ guides = emptyAlignmentGuides() }) => (
  <>
    {guides.vertical.map((position) => (
      <div
        key={`vertical-${position}`}
        className={`alignment-guide alignment-guide--vertical ${guides.verticalSnapped ? "alignment-guide--snapped" : ""}`}
        style={{ left: `${position}px` }}
      />
    ))}
    {guides.horizontal.map((position) => (
      <div
        key={`horizontal-${position}`}
        className={`alignment-guide alignment-guide--horizontal ${guides.horizontalSnapped ? "alignment-guide--snapped" : ""}`}
        style={{ top: `${position}px` }}
      />
    ))}
  </>
);

export default SmartGuides;
