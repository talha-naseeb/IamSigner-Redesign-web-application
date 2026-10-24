import { Dropdown } from "@/Components/UI/shadcnCompat";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@/Components/UI/dataPrimitives";
import { useTranslation } from "react-i18next";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { Icons } from "@/assets/Icons/index";
import FileTypeIcon from "./FileTypeIcon";
import { getFileConfig } from "../constants/dmsConfig";
import { DMS_SCOPE_SHARED, DMS_SCOPE_SHARED_OTHERS, resolveDmsFolderAccess, resolveDmsDocumentAccess } from "../utils/dmsHelpers";
import { isDmsSignableDocument } from "../utils/dmsSignBridge";
import { getPermissionLabelKey } from "../utils/dmsShareUtils";

const renderFileTypeLabel = (t, { variant, ext }) => {
  if (variant === "folder") {
    return <span className="dms-folder-label">{t("DMS.folder")}</span>;
  }
  const label = String(ext || "FILE").toUpperCase();
  const cfg = getFileConfig(label);
  return (
    <span className="dms-file-type-label" style={{ color: cfg.color, background: cfg.bg }}>
      {label}
    </span>
  );
};

const FolderRow = ({ folder, onOpen, onFolderAction, t, selectionEnabled = false }) => {
  const access = resolveDmsFolderAccess(folder);
  const sharedBy = String(folder.sharedBy || "").trim();
  const sharedWith = String(folder.sharedWith || "").trim();
  const owner = String(
    folder.treeScope === DMS_SCOPE_SHARED_OTHERS ? sharedWith || sharedBy || folder.owner : sharedBy || folder.owner || ""
  ).trim();
  const canMove = access.canEdit && (folder.treeScope ?? "") !== DMS_SCOPE_SHARED;
  const folderColor = folder.color || "var(--theme-color)";
  const permissionLabel = folder.shared ? t(getPermissionLabelKey(folder.permission)) : "";
  return (
    <TableRow className="dms-list-row dms-list-folder-row" style={{ cursor: "pointer" }} onClick={() => onOpen(folder)}>
      {selectionEnabled ? (
        <TableCell className="TableCell py-0 dms-list-select-cell dms-list-empty-cell" />
      ) : null}
      <TableCell className="TableCell dms-list-icon-cell">
        <FileTypeIcon variant="folder" shared={folder.shared} size={folder.shared ? 26 : 22} color={folderColor} />
      </TableCell>
      <TableCell className="TableCell dms-list-name-cell" data-label={t("DMS.sortName")}>
        <div className="d-flex align-items-center gap-2">
          <span>{folder.name}</span>
          <span className="dms-table-subfolder-count">{folder.count} {t("DMS.items")}</span>
          {permissionLabel ? (
            <span className="dms-folder-permission-tag">
              {t("DMS.permission")}: {permissionLabel}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="TableCell" data-label={t("DMS.fileType")}>
        {renderFileTypeLabel(t, { variant: "folder" })}
      </TableCell>
      <TableCell className="TableCell" data-label={t("DMS.sortSize")}>{folder.size || "—"}</TableCell>
      <TableCell className="TableCell" data-label={t("DMS.modified")}>{folder.modified}</TableCell>
      <TableCell className="TableCell dms-list-owner-cell" data-label={t("DMS.owner")} title={owner || undefined}>
        {owner || "—"}
      </TableCell>
      <TableCell className="py-0 dms-list-action-cell" onClick={(e) => e.stopPropagation()}>
        <Dropdown>
          <Dropdown.Toggle as={CustomToggle} />
          <Dropdown.Menu>
            <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onOpen(folder)}>
              <Icons.FolderOpen size={18} /> {t("DMS.open")}
            </Dropdown.Item>
            {access.canView ? (
              <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("download", folder)}>
                <Icons.Download size={18} /> {t("DMS.download")}
              </Dropdown.Item>
            ) : null}
            {access.canView ? (
              <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("activity", folder)}>
                <Icons.InfoOutline size={18} /> {t("DMS.folderActivity")}
              </Dropdown.Item>
            ) : null}
            {access.canShare ? (
              <>
                <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("share", folder)}>
                  <Icons.Share size={18} /> {t("DMS.invitePeople")}
                </Dropdown.Item>
              </>
            ) : null}
            {access.canManageAccess ? (
              <>
                <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("manageAccess", folder)}>
                  <Icons.Users size={18} /> {t("DMS.manageFolderAccess")}
                </Dropdown.Item>
              </>
            ) : null}
            {access.canEdit ? (
              <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("rename", folder)}>
                <Icons.PenEdit size={18} /> {t("DMS.edit")}
              </Dropdown.Item>
            ) : null}
            {canMove ? (
              <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("move", folder)}>
                <Icons.Folders size={18} /> {t("DMS.moveFolder")}
              </Dropdown.Item>
            ) : null}
            {access.canDelete ? (
              <>
                <Dropdown.Item className="d-flex gap-2 align-items-center text-danger" onClick={() => onFolderAction("delete", folder)}>
                  <Icons.DeleteAction size={18} /> {t("DMS.delete")}
                </Dropdown.Item>
              </>
            ) : null}
          </Dropdown.Menu>
        </Dropdown>
      </TableCell>
    </TableRow>
  );
};

const DocumentRow = ({
  doc,
  onSelect,
  onDocAction,
  t,
  showDocumentShare = true,
  documentAccess,
  canMoveDocuments = false,
  canUseSignFlow = false,
  signFlowOptions = [],
  signDocumentLoading = false,
  selectionEnabled = false,
  selected = false,
  onToggleSelect,
}) => {
  const access = resolveDmsDocumentAccess(doc, documentAccess ?? {
    canView: true,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canShare: true,
    canManageAccess: true,
    fullControl: true,
  });
  const showSign = canUseSignFlow && access.canView && isDmsSignableDocument(doc);
  const isSharedDoc = doc?.sharedDirectly === true;
  const permissionLabel = doc?.permission ? t(getPermissionLabelKey(doc.permission)) : "";
  return (
  <TableRow
    style={{ cursor: "pointer" }}
    className={`dms-list-row dms-list-document-row${selected ? " dms-table-row-selected" : ""}${isSharedDoc ? " dms-list-document-row-shared" : ""}`}
    onClick={() => onSelect(doc)}
  >
    {selectionEnabled ? (
      <TableCell className="TableCell py-0 dms-list-select-cell" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="dms-doc-select"
          checked={selected}
          aria-label={doc.name}
          onChange={(e) => onToggleSelect?.(doc, e.target.checked)}
        />
      </TableCell>
    ) : null}
    <TableCell className="TableCell dms-list-icon-cell">
      <FileTypeIcon ext={doc.ext} size={26} />
    </TableCell>
    <TableCell className="TableCell truncate-cell dms-list-name-cell" data-label={t("DMS.sortName")}>
      <div className="dms-list-doc-name-block">
        <span>{doc.name}</span>
        {isSharedDoc && permissionLabel ? (
          <span className="dms-list-doc-share-meta">
            {t("DMS.permission")}: {permissionLabel}
          </span>
        ) : null}
      </div>
    </TableCell>
    <TableCell className="TableCell" data-label={t("DMS.fileType")}>
      {renderFileTypeLabel(t, { ext: doc.ext })}
    </TableCell>
    <TableCell className="TableCell" data-label={t("DMS.sortSize")}>{doc.size}</TableCell>
    <TableCell className="TableCell" data-label={t("DMS.modified")}>
      {isSharedDoc && doc.sharedOn ? doc.sharedOn : doc.modified}
    </TableCell>
    <TableCell className="TableCell" data-label={t("DMS.owner")}>{doc.owner}</TableCell>
    <TableCell className="py-0 dms-list-action-cell" onClick={(e) => e.stopPropagation()}>
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} />
        <Dropdown.Menu>
          {access.canView ? (
            <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("view", doc)}>
              <Icons.View size={18} /> {t("DMS.view")}
            </Dropdown.Item>
          ) : null}
          {access.canView ? (
            <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("download", doc)}>
              <Icons.Download size={18} /> {t("DMS.download")}
            </Dropdown.Item>
          ) : null}
          {showSign ? (
            <Dropdown drop="end" className="dms-sign-flow-dropdown">
              <Dropdown.Toggle
                as="button"
                type="button"
                className="dropdown-item dms-sign-flow-toggle"
                disabled={signDocumentLoading}
              >
                <span className="dms-sign-flow-toggle-label">
                  <Icons.Upload size={18} /> {t("dashboardCardStatuses.SignDoc")}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dms-sign-flow-menu">
                {signFlowOptions.map((option) => (
                  <Dropdown.Item
                    key={option.mode}
                    className="dms-sign-flow-item"
                    disabled={signDocumentLoading}
                    onClick={() => onDocAction("sign", doc, option.mode)}
                  >
                    {option.title}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : null}
          {showDocumentShare && access.canShare ? (
            <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("share", doc)}>
              <Icons.Share size={18} /> {t("DMS.share")}
            </Dropdown.Item>
          ) : null}
          {access.canManageAccess ? (
            <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("manageAccess", doc)}>
              <Icons.Users size={18} /> {t("DMS.manageDocumentAccess")}
            </Dropdown.Item>
          ) : null}
          {access.canEdit ? (
            <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("rename", doc)}>
              <Icons.PenEdit size={18} /> {t("DMS.rename")}
            </Dropdown.Item>
          ) : null}
          {canMoveDocuments && !doc.sharedDirectly ? (
            <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("move", doc)}>
              <Icons.Folders size={18} /> {t("DMS.moveDocument")}
            </Dropdown.Item>
          ) : null}
          {access.canDelete ? (
            <>
              <Dropdown.Item className="d-flex gap-2 align-items-center text-danger" onClick={() => onDocAction("delete", doc)}>
                <Icons.DeleteAction size={18} /> {t("DMS.delete")}
              </Dropdown.Item>
            </>
          ) : null}
        </Dropdown.Menu>
      </Dropdown>
    </TableCell>
  </TableRow>
  );
};

const DMSListView = ({
  isRoot,
  foldersOnly = false,
  showFolders = true,
  showDocuments = true,
  rootFolders,
  subfolders,
  pagedDocs,
  showDocumentShare = true,
  documentAccess,
  canMoveDocuments = false,
  canUseSignFlow = false,
  signFlowOptions = [],
  signDocumentLoading = false,
  onFolderOpen,
  onFolderAction,
  onDocSelect,
  onDocAction,
  selectionEnabled = false,
  selectedDocIds,
  onToggleDocSelect,
  hasRootFolderFilters = false,
}) => {
  const { t } = useTranslation();
  const columns = [
    ...(selectionEnabled ? [""] : []),
    "",
    t("DMS.sortName"),
    t("DMS.fileType"),
    t("DMS.sortSize"),
    t("DMS.modified"),
    t("DMS.owner"),
    "",
  ];
  const folders = showFolders ? (isRoot ? rootFolders : subfolders) : [];
  const docs = showDocuments ? pagedDocs : [];
  const isEmpty =
    showDocuments &&
    !foldersOnly &&
    docs.length === 0 &&
    folders.length === 0 &&
    !isRoot;
  const isFilteredRootFoldersEmpty =
    showFolders && isRoot && rootFolders.length === 0 && hasRootFolderFilters;

  return (
    <TableContainer
      component={Paper}
      className='custom-table-scrollbar'
      style={{
        maxWidth: "100%",
        overflowX: "auto",
        height: "80vh",
      }}
    >
      <Table stickyHeader style={{ border: "none", minWidth: "800px" }}>
       
        <TableHead className="customTableHead">
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index} className="TableHeaderCell">
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {folders.map((folder) => (
            <FolderRow
              key={folder.shareId || folder.id}
              folder={folder}
              onOpen={onFolderOpen}
              onFolderAction={onFolderAction}
              selectionEnabled={selectionEnabled}
              t={t}
            />
          ))}

          {isFilteredRootFoldersEmpty ? (
            <TableRow className="dms-list-empty-row">
              <TableCell colSpan={columns.length} align="center" style={{ border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "40px 0",
                    color: "var(--text-primary)",
                  }}
                >
                  <Icons.Folders size={50} />
                  <span className="mt-2">{t("DMS.noFoldersFound")}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : null}

          {isEmpty ? (
            <TableRow className="dms-list-empty-row">
              <TableCell colSpan={columns.length} align="center" style={{ border: "none" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "40px 0",
                    color: "var(--text-primary)",
                  }}
                >
                  <Icons.Folders size={50} />
                  <span className="mt-2">{t("DMS.noDocsFound")}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : showDocuments ? (
            docs.map((doc) => (
              <DocumentRow
                key={doc.shareId || doc.id}
                doc={doc}
                onSelect={onDocSelect}
                onDocAction={onDocAction}
                showDocumentShare={showDocumentShare}
                documentAccess={documentAccess}
                canMoveDocuments={canMoveDocuments}
                canUseSignFlow={canUseSignFlow}
                signFlowOptions={signFlowOptions}
                signDocumentLoading={signDocumentLoading}
                selectionEnabled={selectionEnabled}
                selected={selectedDocIds?.has?.(doc.id)}
                onToggleSelect={onToggleDocSelect}
                t={t}
              />
            ))
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DMSListView;
