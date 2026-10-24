import React from "react";
import {
  FileText,
  Search,
  ChevronRight,
  Users,
  UserPlus,
  LayoutGrid,
  List,
  Clock3,
  Folder,
  ChevronDown,
  X,
  CloudUpload,
} from "lucide-react";

const wrap = (Icon) => function ShadcnIcon({ sx, fontSize, htmlColor, color, titleAccess, style, ...props }) {
  const sizing = fontSize === "small" ? 20 : fontSize === "large" ? 35 : fontSize === "inherit" ? "1em" : undefined;
  const sxStyle = sx && typeof sx === "object" ? Object.fromEntries(Object.entries(sx).filter(([key, value]) => !key.startsWith("&") && !key.startsWith("@")).map(([key, value]) => [key, key === "fontSize" && typeof value === "number" ? `${value}px` : value])) : {};
  return <Icon {...props} aria-label={titleAccess || props["aria-label"]} style={{ ...(sizing ? { width: sizing, height: sizing } : {}), ...(htmlColor || color ? { color: htmlColor || color } : {}), ...sxStyle, ...style }} />;
};

export const InsertDriveFileOutlinedIcon = wrap(FileText);
export const SearchIcon = wrap(Search);
export const NavigateNextIcon = wrap(ChevronRight);
export const PeopleOutlineIcon = wrap(Users);
export const PersonAddAltIcon = wrap(UserPlus);
export const GridViewIcon = wrap(LayoutGrid);
export const ViewListIcon = wrap(List);
export const AccessTimeIcon = wrap(Clock3);
export const FolderOutlinedIcon = wrap(Folder);
export const ChevronRightIcon = wrap(ChevronRight);
export const ExpandMoreIcon = wrap(ChevronDown);
export const CloseIcon = wrap(X);
export const CloudUploadIcon = wrap(CloudUpload);
