import React from "react";
import "./SmartGuides.css";

export const emptyAlignmentGuides = () => ({
  vertical: [],
  horizontal: [],
  verticalSnapped: false,
  horizontalSnapped: false,
});

export const getNewControlDimensions = (control) =>
  ["QR Code", "Stamp", "Image"].includes(control?.label || control?.data)
    ? { width: 100, height: 100 }
    : { width: 110, height: 40 };

export const getControlDimensions = (control) => {
  const fallback = getNewControlDimensions(control);
  const w = parseFloat(control?.width);
  const h = parseFloat(control?.height);
  return {
    width: Number.isFinite(w) && w > 0 ? w : fallback.width,
    height: Number.isFinite(h) && h > 0 ? h : fallback.height,
  };
};

/**
 * Creates a transparent SVG data URI preview for drag operations.
 * Matches exact placed control dimensions (110x40 standard, 100x100 square) and signatory color.
 */
export const createControlDragPreview = ({ label, color = "#4d8dff" } = {}) => {
  const { width, height } = getNewControlDimensions({ label });
  const strokeColor = color && String(color).startsWith("#") ? color : "#4d8dff";
  const escapedLabel = String(label || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="8" ry="8" fill="rgba(12,154,215,0.04)" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="4 3" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="${strokeColor}">${escapedLabel}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

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
    {guides.vertical.map((position, idx) => (
      <div
        key={`vertical-${position}-${idx}`}
        className={`alignment-guide alignment-guide--vertical ${guides.verticalSnapped ? "alignment-guide--snapped" : ""}`}
        style={{ left: `${position}px` }}
      />
    ))}
    {guides.horizontal.map((position, idx) => (
      <div
        key={`horizontal-${position}-${idx}`}
        className={`alignment-guide alignment-guide--horizontal ${guides.horizontalSnapped ? "alignment-guide--snapped" : ""}`}
        style={{ top: `${position}px` }}
      />
    ))}
  </>
);

export default SmartGuides;
