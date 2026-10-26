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
  DOC:  { color: "#2980b9", bg: "#eaf4fb" },
  DOCX: { color: "#2980b9", bg: "#eaf4fb" },
  XLS:  { color: "#27ae60", bg: "#eafaf1" },
  XLSX: { color: "#27ae60", bg: "#eafaf1" },
  CSV:  { color: "#16a085", bg: "#e8f8f5" },
  PPT:  { color: "#e67e22", bg: "#fef5ec" },
  PPTX: { color: "#e67e22", bg: "#fef5ec" },
  TXT:  { color: "#34495e", bg: "#ebedef" },
  RTF:  { color: "#34495e", bg: "#ebedef" },
  ZIP:  { color: "#d35400", bg: "#fbeee6" },
  RAR:  { color: "#d35400", bg: "#fbeee6" },
  "7Z": { color: "#d35400", bg: "#fbeee6" },
  TAR:  { color: "#d35400", bg: "#fbeee6" },
  GZ:   { color: "#d35400", bg: "#fbeee6" },
  PNG:  { color: "#00838f", bg: "#e0f7fa" },
  JPG:  { color: "#00838f", bg: "#e0f7fa" },
  JPEG: { color: "#00838f", bg: "#e0f7fa" },
  WEBP: { color: "#00838f", bg: "#e0f7fa" },
  SVG:  { color: "#00838f", bg: "#e0f7fa" },
  GIF:  { color: "#00838f", bg: "#e0f7fa" },
  MP4:  { color: "#c0392b", bg: "#fdedec" },
  MOV:  { color: "#c0392b", bg: "#fdedec" },
  MP3:  { color: "#8e44ad", bg: "#f5eef8" },
  JSON: { color: "#f39c12", bg: "#fef9e7" },
  XML:  { color: "#f39c12", bg: "#fef9e7" },
};

export const getFileConfig = (ext) => {
  const key = String(ext || "").toUpperCase().replace(/^\./, "");
  return FILE_TYPE_CONFIG[key] || { color: "#546e7a", bg: "#f0f3f4" };
};

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG["Draft"];

export const ROWS_PER_PAGE = 6;

/** Max single-file upload size for DMS (100 MB). */
export const DMS_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

/**
 * Format bytes to human readable string (e.g. 520 B, 14.2 KB, 45.8 MB).
 */
export const formatFileSize = (bytes) => {
  const num = Number(bytes);
  if (!Number.isFinite(num) || num <= 0) return "0 B";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Validate files against max allowed bytes per file.
 */
export const validateDmsFiles = (files, maxBytes = DMS_MAX_UPLOAD_BYTES) => {
  const list = Array.isArray(files) ? files : Array.from(files || []);
  if (!list.length) {
    return { isValid: false, error: "NO_FILES", oversizedFiles: [], validFiles: [] };
  }
  const oversizedFiles = list.filter((f) => (f?.size || 0) > maxBytes);
  if (oversizedFiles.length > 0) {
    return {
      isValid: false,
      error: "FILE_TOO_LARGE",
      oversizedFiles,
      validFiles: list.filter((f) => (f?.size || 0) <= maxBytes),
    };
  }
  return { isValid: true, error: null, oversizedFiles: [], validFiles: list };
};

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
