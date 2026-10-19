import { Icons } from "@/assets/Icons/index";
import { getDmsFileTypeIcon } from "../constants/dmsConfig";

const FileTypeIcon = ({ ext, size = 40, color = "var(--theme-color)", shared = false, variant }) => {
  if (variant === "folder") {
    return shared
      ? <Icons.FoldersFill size={size} color={color} />
      : <Icons.Folders size={size} color={color} />;
  }

  const Icon = getDmsFileTypeIcon(ext);
  return <Icon size={size} color={color} />;
};

export default FileTypeIcon;
