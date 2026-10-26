import React from "react";
import { FiChevronDown, FiChevronLeft, FiUsers, FiShare2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { FaRegFolder } from "react-icons/fa6";
import { IoFolderOpenOutline } from "react-icons/io5";
import { HiOutlineDatabase } from "react-icons/hi";
import { Icons } from "@/assets/Icons/index";
import { ALL_DOCUMENTS_ICON } from "../constants/dmsConfig";
import { hasSelectedChild } from "../utils/dmsHelpers";

// Top-level synthetic nodes whose children we always know exactly from local state
const SYNTHETIC_IDS = new Set(["dms-my-folders", "dms-shared-me", "dms-shared-others"]);

const getItemTreeKey = (item) => item?.treeKey ?? item?.id;

// Recursive tree item matching the main sidebar dropdown pattern
const FolderTreeItem = ({
  item,
  depth = 0,
  selectedTreeKey,
  expandedFolders,
  loadedChildrenFor,
  onSelect,
  onToggle,
  collapsed = false,
}) => {
  const treeKey = getItemTreeKey(item);
  const isExpanded = expandedFolders.includes(treeKey);
  const isSelected =
    selectedTreeKey === treeKey ||
    (collapsed && hasSelectedChild(item, selectedTreeKey));
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

  const renderIcon = () => {
    if (item.id === "dms-shared-me") {
      return <FiUsers size={16} color={folderColor} />;
    }
    if (item.id === "dms-shared-others") {
      return <FiShare2 size={16} color={folderColor} />;
    }
    if (isExpanded && showChevron && !collapsed) {
      return <IoFolderOpenOutline size={17} color={folderColor} />;
    }
    return <FaRegFolder size={17} color={folderColor} />;
  };

  return (
    <div className="dms-tree-node">
      <div
        className={`dms-tree-item${isSelected ? " active" : ""}`}
        style={collapsed ? undefined : (depth > 0 ? { paddingInlineStart: `${11 + depth * 10}px` } : undefined)}
        onClick={() => {
          onSelect(item);
          // Synthetic roots: selection handles navigation; chevron alone toggles expand
          if (!collapsed && showChevron && !SYNTHETIC_IDS.has(item.id)) onToggle(item);
        }}
        title={collapsed ? item.name : undefined}
        aria-label={item.name}
      >
        <span className="dms-tree-folder-icon">
          {renderIcon()}
        </span>
        <span className="dms-tree-label">{item.name}</span>
        {showChevron && !collapsed ? (
          <span
            className={`dms-tree-chevron${isExpanded ? " dms-tree-chevron--open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item);
            }}
            aria-hidden="true"
          >
            <FiChevronDown size={14} />
          </span>
        ) : null}
      </div>

      {!collapsed && isExpanded && hasLoadedChildren ? (
        <div className="dms-tree-subfolder-list">
          {item.children.map((child) => (
            <FolderTreeItem
              key={getItemTreeKey(child)}
              item={child}
              depth={depth + 1}
              selectedTreeKey={selectedTreeKey}
              expandedFolders={expandedFolders}
              loadedChildrenFor={loadedChildrenFor}
              onSelect={onSelect}
              onToggle={onToggle}
              collapsed={collapsed}
            />
          ))}
        </div>
      ) : null}
    </div>
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
  collapsed = false,
  onToggleCollapse,
}) => {
  const { t } = useTranslation();
  const direction = document.dir || "ltr";

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

  const myFoldersNode = folderTree.find((n) => n.id === "dms-my-folders") || folderTree[0];
  const sharedMeNode = folderTree.find((n) => n.id === "dms-shared-me");
  const sharedOthersNode = folderTree.find((n) => n.id === "dms-shared-others");
  const otherNodes = folderTree.filter(
    (n) => n.id !== "dms-my-folders" && n.id !== "dms-shared-me" && n.id !== "dms-shared-others"
  );

  return (
    <Root className={`${panelClass}${collapsed ? " dms-tree-panel--collapsed" : ""}`}>
      {!embedded ? (
        <div className="dms-tree-header">
          <span className="dms-tree-title" aria-hidden={collapsed}>
            <Icons.Folders size={16} className="text-[var(--modern-violet)]" />
            <span>{t("Sidebar.DMS", "MAC Drive")}</span>
          </span>
          {onToggleCollapse ? (
            <button
              type="button"
              className="dms-tree-collapse-btn"
              onClick={onToggleCollapse}
              aria-label={
                collapsed
                  ? t("DMS.expandSidebar", "Expand sidebar")
                  : t("DMS.collapseSidebar", "Collapse sidebar")
              }
              title={
                collapsed
                  ? t("DMS.expandSidebar", "Expand sidebar")
                  : t("DMS.collapseSidebar", "Collapse sidebar")
              }
            >
              <FiChevronLeft
                size={18}
                className={`dms-tree-toggle-icon${collapsed ? " dms-tree-toggle-icon--collapsed" : ""}${direction === "rtl" ? " dms-tree-toggle-icon--rtl" : ""}`}
              />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="dms-tree-scroll">
        {/* MANAGEMENT SECTION */}
        <div className="dms-tree-section">
          <div className="dms-tree-section-header">
            {t("DMS.management", "MANAGEMENT")}
          </div>

          <div
            className={`dms-tree-item dms-tree-root-item${isRoot ? " active" : ""}`}
            onClick={handleGoHomeClick}
            title={collapsed ? t("DMS.allDocuments", "All Documents") : undefined}
            aria-label={t("DMS.allDocuments", "All Documents")}
          >
            <span className="dms-tree-folder-icon">
              <ALL_DOCUMENTS_ICON size={17} className={isRoot ? "text-[var(--modern-violet)]" : ""} />
            </span>
            <span className="dms-tree-label">{t("DMS.allDocuments")}</span>
          </div>

          {sharedMeNode && (
            <FolderTreeItem
              key={getItemTreeKey(sharedMeNode)}
              item={sharedMeNode}
              depth={0}
              selectedTreeKey={selectedTreeKey}
              expandedFolders={expandedFolders}
              loadedChildrenFor={loadedChildrenFor}
              onSelect={handleSelect}
              onToggle={onToggle}
              collapsed={collapsed}
            />
          )}

          {sharedOthersNode && (
            <FolderTreeItem
              key={getItemTreeKey(sharedOthersNode)}
              item={sharedOthersNode}
              depth={0}
              selectedTreeKey={selectedTreeKey}
              expandedFolders={expandedFolders}
              loadedChildrenFor={loadedChildrenFor}
              onSelect={handleSelect}
              onToggle={onToggle}
              collapsed={collapsed}
            />
          )}
        </div>

        {/* CATEGORIES SECTION */}
        <div className="dms-tree-section">
          <div className="dms-tree-section-header">
            {t("DMS.categories", "CATEGORIES")}
          </div>

          {myFoldersNode && (
            <FolderTreeItem
              key={getItemTreeKey(myFoldersNode)}
              item={myFoldersNode}
              depth={0}
              selectedTreeKey={selectedTreeKey}
              expandedFolders={expandedFolders}
              loadedChildrenFor={loadedChildrenFor}
              onSelect={handleSelect}
              onToggle={onToggle}
              collapsed={collapsed}
            />
          )}

          {otherNodes.map((item) => (
            <FolderTreeItem
              key={getItemTreeKey(item)}
              item={item}
              depth={0}
              selectedTreeKey={selectedTreeKey}
              expandedFolders={expandedFolders}
              loadedChildrenFor={loadedChildrenFor}
              onSelect={handleSelect}
              onToggle={onToggle}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>

      {!compact ? (
        <div className="dms-tree-footer">
          {!collapsed ? (
            <>
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
                  <span>{t("DMS.macdStorage", "MAC D Storage")}</span>
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
            </>
          ) : (
            <div
              className="dms-storage-collapsed-icon"
              title={
                usedLabel && totalLabel
                  ? `${t("DMS.macdStorage", "MAC D Storage")}: ${usedLabel} / ${totalLabel}${percentLabel ? ` (${percentLabel})` : ""}`
                  : usedLabel
                    ? `${t("DMS.macdStorage", "MAC D Storage")}: ${usedLabel}`
                    : totalLabel
                      ? `${t("DMS.macdStorage", "MAC D Storage")}: ${totalLabel}`
                      : t("DMS.macdStorage", "MAC D Storage")
              }
              aria-label={t("DMS.macdStorage", "MAC D Storage")}
            >
              <HiOutlineDatabase size={20} />
            </div>
          )}
        </div>
      ) : null}
    </Root>
  );
};

export default FolderTree;
