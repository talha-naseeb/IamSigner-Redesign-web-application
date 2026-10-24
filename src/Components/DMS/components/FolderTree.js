import { ChevronRightIcon as ChevronRightIcon } from "@/Components/UI/iconCompat";
import { ExpandMoreIcon as ExpandMoreIcon } from "@/Components/UI/iconCompat";
import { useTranslation } from "react-i18next";
import { FaRegFolder } from "react-icons/fa6";
import { IoFolderOpenOutline } from "react-icons/io5";
import { Icons } from "@/assets/Icons/index";

// Top-level synthetic nodes whose children we always know exactly from local state
const SYNTHETIC_IDS = new Set(["dms-my-folders", "dms-shared-me", "dms-shared-others"]);

const getItemTreeKey = (item) => item?.treeKey ?? item?.id;

// Recursive tree item
const FolderTreeItem = ({
  item,
  depth = 0,
  selectedTreeKey,
  expandedFolders,
  loadedChildrenFor,
  onSelect,
  onToggle,
}) => {
  const treeKey = getItemTreeKey(item);
  const isExpanded = expandedFolders.includes(treeKey);
  const isSelected = selectedTreeKey === treeKey;
  const hasLoadedChildren = Array.isArray(item.children) && item.children.length > 0;
  const isSynthetic = SYNTHETIC_IDS.has(item.id);
  const childrenLoaded = loadedChildrenFor?.has?.(treeKey);
  const apiChildFolderCount = Number(item.childFolderCount);
  // Accordion only when there are nested folders: trust loaded children, or API count before load
  const mayHaveChildFolders =
    hasLoadedChildren ||
    (!childrenLoaded && Number.isFinite(apiChildFolderCount) && apiChildFolderCount > 0);
  const showChevron = isSynthetic ? hasLoadedChildren : mayHaveChildFolders;
  const folderColor = item.color || "var(--theme-color)";

  return (
    <>
      <div
        className={`dms-tree-item${isSelected ? " active" : ""}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => {
          onSelect(item);
          // Synthetic roots: selection handles navigation; chevron alone toggles expand
          if (showChevron && !SYNTHETIC_IDS.has(item.id)) onToggle(item);
        }}
      >
        <span
          className="dms-tree-arrow"
          style={{ visibility: showChevron ? "visible" : "hidden" }}
          onClick={(e) => {
            e.stopPropagation();
            if (showChevron) onToggle(item);
          }}
        >
          {isExpanded ? (
            <ExpandMoreIcon sx={{ fontSize: 15 }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 15 }} />
          )}
        </span>
        <span className="dms-tree-folder-icon">
          {isExpanded && showChevron ? (
            <IoFolderOpenOutline size={17} color={folderColor} />
          ) : (
            <FaRegFolder size={17} color={folderColor} />
          )}
        </span>
        <span className="dms-tree-label">{item.name}</span>
      </div>

      {isExpanded &&
        hasLoadedChildren &&
        item.children.map((child) => (
          <FolderTreeItem
            key={getItemTreeKey(child)}
            item={child}
            depth={depth + 1}
            selectedTreeKey={selectedTreeKey}
            expandedFolders={expandedFolders}
            loadedChildrenFor={loadedChildrenFor}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
    </>
  );
};

const FolderTree = ({
  folderTree,
  selectedTreeKey,
  expandedFolders,
  isRoot,
  docCount = 0,
  folderCount = 0,
  storage = null,
  loadedChildrenFor,
  onGoHome,
  onSelect,
  onToggle,
  showAdminStorage = false,
  onOpenAdminStorage,
  embedded = false,
  compact = false,
  onNavigate,
}) => {
  const { t } = useTranslation();

  const formatBytes = (bytes) => {
    if (bytes == null) return null;
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const defaultTotalBytes = 3 * 1024 * 1024 * 1024;
  const usedBytes = storage?.usedBytes ?? null;
  const totalBytes = storage?.totalBytes ?? defaultTotalBytes;
  const usedLabel = storage?.usedFormatted?.trim() || formatBytes(usedBytes);
  const totalLabel = storage?.totalFormatted?.trim() || formatBytes(totalBytes);
  const apiUsagePercent = Number(storage?.usagePercent);
  const canShowPercent =
    usedBytes != null &&
    totalBytes != null &&
    Number.isFinite(usedBytes) &&
    Number.isFinite(totalBytes) &&
    totalBytes > 0;
  const storagePercent = Number.isFinite(apiUsagePercent)
    ? Math.max(0, Math.min(100, Math.round(apiUsagePercent)))
    : canShowPercent
      ? Math.min(100, Math.round((usedBytes / totalBytes) * 100))
      : null;
  const percentLabel = storagePercent != null ? `${storagePercent}%` : null;

  const handleGoHomeClick = () => {
    onGoHome();
    onNavigate?.();
  };

  const handleSelect = (item) => {
    onSelect(item);
    if (!SYNTHETIC_IDS.has(item?.id)) {
      onNavigate?.();
    }
  };

  const formatCount = (value) =>
    Number.isFinite(value) ? value.toLocaleString() : "0";

  const Root = embedded ? "div" : "aside";
  const panelClass = embedded ? "dms-tree-drawer" : "dms-tree-panel";

  return (
    <Root className={panelClass}>
      <div className="dms-tree-scroll">
        <div className="dms-tree-header">
          <span className="dms-tree-title">{t("DMS.documents")}</span>
        </div>

        <div
          className={`dms-tree-item${isRoot ? " active" : ""}`}
          style={{ paddingLeft: 12 }}
          onClick={handleGoHomeClick}
        >
          <span className="dms-tree-arrow" style={{ visibility: "hidden" }}>
            <ChevronRightIcon sx={{ fontSize: 15 }} />
          </span>
          <span className="dms-tree-folder-icon">
            <Icons.Home size={17} color="var(--theme-color)" />
          </span>
          <span className="dms-tree-label">{t("DMS.allDocuments")}</span>
        </div>

        {folderTree.map((item) => (
          <FolderTreeItem
            key={getItemTreeKey(item)}
            item={item}
            depth={0}
            selectedTreeKey={selectedTreeKey}
            expandedFolders={expandedFolders}
            loadedChildrenFor={loadedChildrenFor}
            onSelect={handleSelect}
            onToggle={onToggle}
          />
        ))}
      </div>

      {!compact ? (
        <div className="dms-tree-footer">
          <div className="dms-tree-stats">
            <div className="dms-tree-stat">
              <span className="dms-tree-stat-num">{formatCount(docCount)}</span>
              <span className="dms-tree-stat-label">{t("DMS.documents")}</span>
            </div>
            <div className="dms-tree-stat">
              <span className="dms-tree-stat-num">{formatCount(folderCount)}</span>
              <span className="dms-tree-stat-label">{t("DMS.folders")}</span>
            </div>
          </div>

          <div className="dms-storage">
            <div className="dms-storage-label">
              <span>{t("DMS.storage")}</span>
              {usedLabel && totalLabel ? (
                <span style={{ color: "var(--theme-color)", fontWeight: 600 }}>
                  {usedLabel} / {totalLabel}
                </span>
              ) : usedLabel ? (
                <span style={{ color: "var(--theme-color)", fontWeight: 600 }}>
                  {usedLabel}
                  {percentLabel ? ` (${percentLabel})` : ""}
                </span>
              ) : totalLabel ? (
                <span style={{ color: "var(--theme-color)", fontWeight: 600 }}>{totalLabel}</span>
              ) : null}
            </div>
            <div className="dms-storage-bar">
              <div className="dms-storage-fill" style={{ width: `${storagePercent ?? 0}%` }} />
            </div>
          </div>

          {showAdminStorage && onOpenAdminStorage ? (
            <div className="dms-tree-admin-storage px-3 pb-3">
              <button
                type="button"
                className="dms-admin-storage-link w-100 btn btn-sm btn-outline-secondary"
                onClick={onOpenAdminStorage}
              >
                {t("DMS.teamStorageTitle")}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Root>
  );
};

export default FolderTree;
