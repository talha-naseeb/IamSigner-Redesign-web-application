import { Dropdown } from "@/Components/UI/shadcnCompat";
import { FolderOutlinedIcon as FolderOutlinedIcon } from "@/Components/UI/iconCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import { UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";
import { FileTypeBadge } from "./FileTypeIcon";
import { isDmsSignableDocument } from "../utils/dmsSignBridge";
import { resolveDmsDocumentAccess } from "../utils/dmsHelpers";
import { getPermissionLabelKey } from "../utils/dmsShareUtils";

const DocumentCard = ({
  doc,
  onSelect,
  onDocAction,
  showShare = true,
  documentAccess,
  canMove = false,
  canUseSignFlow = false,
  signFlowOptions = [],
  signDocumentLoading = false,
  selectionEnabled = false,
  selected = false,
  onToggleSelect,
}) => {
  const { t } = useTranslation();
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
  const showFolderPath =
    Boolean(doc?.folderPath) &&
    !isSharedDoc;

  const actionMenu = (
    <Dropdown onClick={(e) => e.stopPropagation()}>
      <Dropdown.Toggle as={CustomToggle} />
      <Dropdown.Menu align="end">
        {access.canView ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("view", doc)}>
            <Icons.View size={15} /> {t("DMS.view")}
          </Dropdown.Item>
        ) : null}
        {access.canView ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("download", doc)}>
            <Icons.Download size={15} /> {t("DMS.download")}
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
                <Icons.Upload size={15} /> {t("dashboardCardStatuses.SignDoc")}
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
        {showShare && access.canShare ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("share", doc)}>
            <Icons.Share size={15} /> {t("DMS.share")}
          </Dropdown.Item>
        ) : null}
        {access.canManageAccess ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("manageAccess", doc)}>
            <Icons.Users size={15} /> {t("DMS.manageDocumentAccess")}
          </Dropdown.Item>
        ) : null}
        {access.canEdit ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("rename", doc)}>
            <Icons.PenEdit size={15} /> {t("DMS.rename")}
          </Dropdown.Item>
        ) : null}
        {canMove && !doc.sharedDirectly ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onDocAction("move", doc)}>
            <Icons.Folders size={15} /> {t("DMS.moveDocument")}
          </Dropdown.Item>
        ) : null}
        {access.canDelete ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center text-danger" onClick={() => onDocAction("delete", doc)}>
            <Icons.DeleteAction size={15} /> {t("DMS.delete")}
          </Dropdown.Item>
        ) : null}
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <div
      className={`dms-doc-card${selected ? " dms-doc-card-selected" : ""}${isSharedDoc ? " dms-doc-card-shared" : ""}`}
      onClick={() => onSelect(doc)}
    >
      <div className="dms-doc-card-hero">
        {selectionEnabled ? (
          <input
            type="checkbox"
            className="dms-doc-select"
            checked={selected}
            aria-label={doc.name}
            onChange={(e) => onToggleSelect?.(doc, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
        <FileTypeBadge ext={doc.ext} />
      </div>

      <div className="dms-doc-card-body">
        <div className="dms-doc-card-name" title={doc.name}>{doc.name}</div>
        <div className="dms-doc-card-modified">
          {doc.modified
            ? doc.modified.startsWith("Edited")
              ? doc.modified
              : `${t("DMS.edited", "Edited")} ${doc.modified}`
            : "—"}
        </div>
        {doc.owner ? (
          <div className="dms-doc-card-owner">
            <UserInitialsBadge name={doc.owner} className="dms-user-badge-sm" />
          </div>
        ) : null}
        {showFolderPath ? (
          <div className="dms-doc-card-path" title={doc.folderPath}>
            <FolderOutlinedIcon sx={{ fontSize: 11, flexShrink: 0 }} />
            <span>{doc.folderPath}</span>
          </div>
        ) : null}
        {isSharedDoc && doc.sharedOn ? (
          <div className="dms-doc-card-share-line">
            {t("DMS.sharedOn")}: {doc.sharedOn}
          </div>
        ) : null}
      </div>

      <div className="dms-doc-card-bottom">
        <div className="dms-doc-card-size-wrap">
          <span className="dms-doc-size">{doc.size && doc.size !== "—" ? doc.size : "—"}</span>
          {isSharedDoc ? (
            <span className="dms-folder-shared-tag">{t("DMS.shared")}</span>
          ) : null}
          {permissionLabel ? (
            <span className="dms-folder-permission-tag" title={permissionLabel}>
              {permissionLabel}
            </span>
          ) : null}
        </div>
        <div className="dms-doc-card-actions" onClick={(e) => e.stopPropagation()}>
          {actionMenu}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
