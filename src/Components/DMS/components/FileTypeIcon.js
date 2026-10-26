import React from "react";
import { Icons } from "@/assets/Icons/index";
import { getDmsFileTypeIcon } from "../constants/dmsConfig";
import { getFileConfig } from "../constants/dmsUploadConfig";

/**
 * FileTypeBadge renders a rich, colorful document-shaped badge
 * inspired by modern macOS Finder and Figma file card designs.
 */
export const FileTypeBadge = ({ ext, size = 46, className = "" }) => {
  const fileConfig = getFileConfig(ext);
  const cleanExt = String(ext || "").toUpperCase().replace(/^\./, "").slice(0, 4) || "FILE";
  const Icon = getDmsFileTypeIcon(ext);

  return (
    <div
      className={`dms-file-badge-hero ${className}`}
      style={{
        backgroundColor: fileConfig.color,
      }}
      title={cleanExt}
      aria-label={cleanExt}
    >
      <span className="dms-file-badge-icon" aria-hidden="true">
        <Icon size={size <= 32 ? 15 : 19} color="#ffffff" />
      </span>
      <span className="dms-file-badge-text">{cleanExt}</span>
    </div>
  );
};

const FileTypeIcon = ({
  ext,
  size = 40,
  color,
  shared = false,
  variant,
  className = "",
}) => {
  if (variant === "folder") {
    const folderColor = color || "var(--modern-violet)";
    return shared
      ? <Icons.FoldersFill size={size} color={folderColor} className={className} />
      : <Icons.Folders size={size} color={folderColor} className={className} />;
  }

  if (variant === "badge") {
    return <FileTypeBadge ext={ext} size={size} className={className} />;
  }

  const fileConfig = getFileConfig(ext);
  const iconColor = color || fileConfig.color || "var(--theme-color)";
  const Icon = getDmsFileTypeIcon(ext);
  return <Icon size={size} color={iconColor} className={className} />;
};

export default FileTypeIcon;
