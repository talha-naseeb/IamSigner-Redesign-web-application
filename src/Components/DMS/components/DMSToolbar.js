import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Tooltip, IconButton } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import DateRangePicker from "@/Components/Common/DateRangePicker/DateRangePicker";
import { Icons } from "@/assets/Icons/index";

const CONTENT_FILTERS = [
  { id: "both", labelKey: "DMS.filterBoth" },
  { id: "files", labelKey: "DMS.filterFiles" },
  { id: "folders", labelKey: "DMS.filterFolders" },
];

const DMSToolbar = ({
  selectedFolder,
  isRoot,
  subfolderCount,
  docCount,
  rootFolderCount,
  viewMode,
  searchQuery = "",
  onSearchChange,
  contentFilter = "both",
  onContentFilterChange,
  canCreateFolder = true,
  canUploadDocuments = false,
  onViewChange,
  onNewFolder,
  onUpload,
  onOpenMobileTree,
  rootFolderFilters = {},
  hasRootFolderFilters = false,
  hasRootFolderFilterDraft = false,
  canClearRootFolderFilters = false,
  rootFolderFilterLoading = false,
  onRootFolderFilterChange,
  onApplyRootFolderFilters,
  onClearRootFolderFilters,
}) => {
  const { t } = useTranslation();
  const [showFolderFilters, setShowFolderFilters] = useState(false);
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    if (rootFolderFilters.fromDate && rootFolderFilters.toDate) {
      setDateRange([
        new DateObject(rootFolderFilters.fromDate),
        new DateObject(rootFolderFilters.toDate),
      ]);
    } else {
      setDateRange([]);
    }
  }, [rootFolderFilters.fromDate, rootFolderFilters.toDate]);

  const handleApplyFilters = () => {
    onApplyRootFolderFilters?.();
  };

  const handleClearFilters = () => {
    onClearRootFolderFilters?.();
  };
  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
    if (dates && dates.length === 2) {
      onRootFolderFilterChange?.("fromDate", dates[0].format("YYYY-MM-DD"));
      onRootFolderFilterChange?.("toDate", dates[1].format("YYYY-MM-DD"));
      return;
    }
    onRootFolderFilterChange?.("fromDate", "");
    onRootFolderFilterChange?.("toDate", "");
  };

  return (
    <div className={`dms-toolbar${isRoot ? " dms-toolbar--root" : ""}`}>
      <div className="dms-toolbar-head">
        <h6 className="dms-page-title">
          {selectedFolder ? selectedFolder.name : t("DMS.allDocuments")}
          <span className="dms-page-count">
            {isRoot
              ? `${rootFolderCount} ${t("DMS.foldersCount")}`
              : `${
                  subfolderCount
                    ? `${subfolderCount} ${t("DMS.foldersCount")}, `
                    : ""
                }${docCount} ${t("DMS.docsCount")}`}
          </span>
        </h6>
      </div>

      <div className="dms-toolbar-controls">
        <div className="dms-toolbar-filters">
          <div className="dms-search-wrap">
            <SearchIcon className="dms-search-icon" sx={{ fontSize: 18 }} />
            <Form.Control
              type="search"
              className="dms-search-input"
              placeholder={t("DMS.search")}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              aria-label={t("DMS.search")}
            />
          </div>

          <div
            className="dms-content-filter"
            role="group"
            aria-label={t("DMS.contentFilter")}
          >
            {CONTENT_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-selected={contentFilter === item.id}
                className={`dms-content-filter-btn${
                  contentFilter === item.id ? " active" : ""
                }`}
                onClick={() => onContentFilterChange?.(item.id)}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
          <div className="dms-toolbar-actions">
            <div className="dms-view-toggle">
              <Tooltip title={t("DMS.gridView")}>
                <IconButton
                  size="small"
                  className={viewMode === "grid" ? "dms-view-active" : ""}
                  onClick={() => onViewChange("grid")}
                >
                  <GridViewIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("DMS.listView")}>
                <IconButton
                  size="small"
                  className={viewMode === "list" ? "dms-view-active" : ""}
                  onClick={() => onViewChange("list")}
                >
                  <ViewListIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </div>

            {onOpenMobileTree ? (
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                className="dms-action-btn dms-mobile-tree-btn"
                onClick={onOpenMobileTree}
                aria-label={t("DMS.browseFolders")}
              >
                <Icons.Folders size={15} />
                <span>{t("DMS.browseFolders")}</span>
              </Button>
            ) : null}
            {isRoot ? (
              <Button
                type="button"
                size="sm"
                variant="outline-secondary"
                className={`dms-action-btn dms-folder-filter-btn${
                  hasRootFolderFilters ? " active" : ""
                }`}
                onClick={() => setShowFolderFilters((prev) => !prev)}
                aria-label={t("DMS.folderFiltersTitle")}
                aria-expanded={showFolderFilters}
              >
                <Icons.Filter size={15} />
                <span className="dms-btn-label">{t("DMS.filter")}</span>
              </Button>
            ) : null}
            {canCreateFolder ? (
              <Button
                size="sm"
                variant="outline-secondary"
                className="dms-action-btn"
                onClick={onNewFolder}
              >
                <Icons.FolderPlus size={15} />
                <span className="dms-btn-label">{t("DMS.newFolder")}</span>
              </Button>
            ) : null}
            {canUploadDocuments ? (
              <Button size="sm" className="dms-upload-btn" onClick={onUpload}>
                <Icons.UploadCloud size={15} />
                <span className="dms-btn-label">{t("DMS.upload")}</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isRoot && showFolderFilters ? (
        <div className="dms-folder-filters-panel">
          <div className="dms-folder-filters-form">
            <Form.Group className="dms-folder-filter-field">
              <Form.Label>{t("DMS.filterFolderName")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("DMS.folderNamePlaceholder")}
                value={rootFolderFilters.name || ""}
                onChange={(e) =>
                  onRootFolderFilterChange?.("name", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group className="dms-folder-filter-field dms-folder-filter-date-range">
              <Form.Label>
                {t("DMS.filterDateFrom")} / {t("DMS.filterDateTo")}
              </Form.Label>
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder={`${t("DMS.filterDateFrom")} - ${t(
                  "DMS.filterDateTo"
                )}`}
                containerClassName="delegation-date-picker"
                disabled={rootFolderFilterLoading}
                zIndex={9999}
              />
            </Form.Group>

            <Form.Group className="dms-folder-filter-field dms-folder-filter-description">
              <Form.Label>{t("DMS.filterFolderDescription")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("DMS.folderDescriptionPlaceholder")}
                value={rootFolderFilters.description || ""}
                onChange={(e) =>
                  onRootFolderFilterChange?.("description", e.target.value)
                }
              />
            </Form.Group>

            <div className="dms-folder-filter-actions">
              <Button
                type="button"
                variant="none"
                className="resetBtn"
                onClick={handleClearFilters}
                disabled={rootFolderFilterLoading || !canClearRootFolderFilters}
              >
                {t("DMS.clearFilters")}
              </Button>
              <Button
                type="button"
                variant="none"
                className="applyBtn"
                onClick={handleApplyFilters}
                disabled={rootFolderFilterLoading || !hasRootFolderFilterDraft}
              >
                {t("DMS.applyFilters")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DMSToolbar;
