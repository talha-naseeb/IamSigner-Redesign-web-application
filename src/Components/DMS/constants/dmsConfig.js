import { Icons } from "@/assets/Icons/index";
export * from "./dmsUploadConfig";

/** Icon component representing "All Documents" in DMS navigation, toolbar, and breadcrumb */
export const ALL_DOCUMENTS_ICON = Icons.DocumentReport;

/** Icon component from @/assets/Icons for a document extension (folders use Icons.Folders* in the row). */
export const getDmsFileTypeIcon = (ext) => {
  const key = String(ext || "").toUpperCase().replace(/^\./, "");
  switch (key) {
    case "PDF":
      return Icons.PDFs;
    case "DOC":
    case "DOCX":
    case "RTF":
      return Icons.Word;
    case "XLS":
    case "XLSX":
      return Icons.Excel;
    case "CSV":
      return Icons.UploadCSV;
    case "HTML":
    case "HTM":
    case "TXT":
    case "MD":
      return Icons.CV;
    case "PNG":
    case "JPG":
    case "JPEG":
    case "GIF":
    case "WEBP":
    case "SVG":
      return Icons.ImageAdd;
    case "ZIP":
    case "RAR":
    case "7Z":
    case "TAR":
    case "GZ":
      return Icons.DocumentAttach;
    default:
      return Icons.DocumentReport;
  }
};

/** Standard control sizing across DMS forms and filter toolbars (40px height, 0.5rem border radius, 0.875rem font size) */
export const DMS_CONTROL_SIZES = {
  inputHeight: "40px",
  buttonHeight: "40px",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
};

/** Root folder filter field definitions ensuring consistent width and height */
export const ROOT_FOLDER_FILTER_FIELDS = [
  { key: "name", labelKey: "DMS.filterFolderName", placeholderKey: "DMS.folderNamePlaceholder" },
  { key: "dateRange", labelKey: "DMS.filterDateFrom", placeholderKey: "DMS.filterDateTo" },
  { key: "description", labelKey: "DMS.filterFolderDescription", placeholderKey: "DMS.folderDescriptionPlaceholder" },
];
