import { Icons } from "@/assets/Icons/index";

export const STATUS_CONFIG = {
  Completed: { color: "#16d155", bg: "rgba(22,209,85,0.1)" },
  Pending:   { color: "#ffbc00", bg: "rgba(255,188,0,0.1)" },
  Draft:     { color: "#4339f2", bg: "rgba(67,57,242,0.1)" },
  Declined:  { color: "#f14444", bg: "rgba(241,68,68,0.1)" },
};

export const FILE_TYPE_CONFIG = {
  PDF:  { color: "#e74c3c", bg: "#fdecea" },
  HTML: { color: "#8e44ad", bg: "#f4ecf7" },
  HTM:  { color: "#8e44ad", bg: "#f4ecf7" },
  DOCX: { color: "#2980b9", bg: "#eaf4fb" },
  XLSX: { color: "#27ae60", bg: "#eafaf1" },
  PPTX: { color: "#e67e22", bg: "#fef5ec" },
};

export const getFileConfig = (ext) =>
  FILE_TYPE_CONFIG[ext] || { color: "#546e7a", bg: "#f0f3f4" };

/** Icon component from @/assets/Icons for a document extension (folders use Icons.Folders* in the row). */
export const getDmsFileTypeIcon = (ext) => {
  const key = String(ext || "").toUpperCase();
  switch (key) {
    case "PDF":
      return Icons.PDFs;
    case "DOC":
    case "DOCX":
      return Icons.Word;
    case "XLS":
    case "XLSX":
      return Icons.Excel;
    case "CSV":
      return Icons.UploadCSV;
    case "HTML":
    case "HTM":
      return Icons.CV;
    case "PNG":
    case "JPG":
    case "JPEG":
    case "GIF":
    case "WEBP":
    case "SVG":
      return Icons.ImageAdd;
    default:
      return Icons.DocumentReport;
  }
};

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG["Draft"];

export const ROWS_PER_PAGE = 6;

/** Max single-file upload size for DMS (50 MB). */
export const DMS_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const SORT_OPTIONS = [
  { value: "modified", label: "Date Modified" },
  { value: "name",     label: "Name" },
  { value: "size",     label: "File Size" },
];

export const STATUS_FILTER_OPTIONS = ["All", "Completed", "Pending", "Draft", "Declined"];

/** Permission names sent to folder-share APIs. */
export const DMS_PERMISSION_NAMES = {
  View: "View",
  Upload: "Upload",
  Edit: "Edit",
  Delete: "Delete",
  FullControl: "FullControl",
};

export const DMS_PERMISSION_OPTIONS = [
  DMS_PERMISSION_NAMES.View,
  DMS_PERMISSION_NAMES.Upload,
  DMS_PERMISSION_NAMES.Edit,
  DMS_PERMISSION_NAMES.Delete,
  DMS_PERMISSION_NAMES.FullControl,
];

/** Numeric ranks for access checks (shared-with-me folders). */
export const DMS_FOLDER_PERMISSION = {
  View: 1,
  Upload: 2,
  Edit: 3,
  Delete: 4,
  FullControl: 5,
};
