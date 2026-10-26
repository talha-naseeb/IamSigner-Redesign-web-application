import { Dropdown } from "@/Components/UI/shadcnCompat";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
import { UserInitialsBadge } from "@/Components/UI/dataPrimitives";
import CustomToggle from "@/Components/CommonModals/CustomDots/CustomToggle";

import { DMS_SCOPE_SHARED, DMS_SCOPE_SHARED_OTHERS, resolveDmsFolderAccess } from "../utils/dmsHelpers";
import { getPermissionLabelKey } from "../utils/dmsShareUtils";

const FolderCard = ({ folder, onOpen, onFolderAction }) => {
  const { t } = useTranslation();
  const access = resolveDmsFolderAccess(folder);
  const canMove = access.canEdit && (folder.treeScope ?? "") !== DMS_SCOPE_SHARED;
  const folderColor = folder.color || "var(--theme-color)";
  const sharedWith = String(folder.sharedWith || "").trim();
  const permissionLabel = folder.shared ? t(getPermissionLabelKey(folder.permission)) : "";

  const actionMenu = (
    <Dropdown onClick={(e) => e.stopPropagation()}>
      <Dropdown.Toggle as={CustomToggle} />
      <Dropdown.Menu align="end">
        <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onOpen(folder)}>
          <Icons.Folders size={15} /> {t("DMS.open")}
        </Dropdown.Item>
        {access.canView ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("download", folder)}>
            <Icons.Download size={15} /> {t("DMS.download")}
          </Dropdown.Item>
        ) : null}
        {access.canView ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("activity", folder)}>
            <Icons.InfoOutline size={15} /> {t("DMS.folderActivity")}
          </Dropdown.Item>
        ) : null}
        {access.canShare ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("share", folder)}>
            <Icons.Share size={15} /> {t("DMS.invitePeople")}
          </Dropdown.Item>
        ) : null}
        {access.canManageAccess ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("manageAccess", folder)}>
            <Icons.Users size={15} /> {t("DMS.manageFolderAccess")}
          </Dropdown.Item>
        ) : null}
        {access.canEdit ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("rename", folder)}>
            <Icons.PenEdit size={15} /> {t("DMS.edit")}
          </Dropdown.Item>
        ) : null}
        {canMove ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("move", folder)}>
            <Icons.Folders size={15} /> {t("DMS.moveFolder")}
          </Dropdown.Item>
        ) : null}
        {access.canDelete ? (
          <Dropdown.Item className="d-flex gap-2 align-items-center text-danger" onClick={() => onFolderAction("delete", folder)}>
            <Icons.DeleteAction size={15} /> {t("DMS.delete")}
          </Dropdown.Item>
        ) : null}
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <div
      className="dms-folder-card"
      style={{ "--dms-folder-color": folderColor }}
      onClick={() => onOpen(folder)}
    >
      <div className="dms-folder-card-hero">
        <div className="dms-folder-hero-badge">
          {folder.shared
            ? <Icons.FoldersFill size={28} color={folderColor} />
            : <Icons.Folders size={28} color={folderColor} />}
        </div>
      </div>

      <div className="dms-folder-card-body">
        <div className="dms-folder-card-name" title={folder.name}>{folder.name}</div>
        {sharedWith && folder.treeScope === DMS_SCOPE_SHARED_OTHERS ? (
          <div className="dms-folder-shared-by" title={sharedWith}>
            <span className="text-muted text-xs me-1">{t("DMS.sharedWith")}:</span>
            <UserInitialsBadge name={sharedWith} className="dms-user-badge-sm" />
          </div>
        ) : folder.sharedBy ? (
          <div className="dms-folder-shared-by" title={folder.sharedBy}>
            <span className="text-muted text-xs me-1">{t("DMS.sharedBy")}:</span>
            <UserInitialsBadge name={folder.sharedBy} className="dms-user-badge-sm" />
          </div>
        ) : folder.owner ? (
          <div className="dms-folder-shared-by" title={folder.owner}>
            <UserInitialsBadge name={folder.owner} className="dms-user-badge-sm" />
          </div>
        ) : folder.created ? (
          <div className="dms-folder-card-created">
            {t("DMS.createdOn", "Created")}: {folder.created}
          </div>
        ) : null}
        {!folder.sharedBy && folder.description && !folder.description.includes("childFolderCount") && (
          <div className="dms-folder-card-desc" title={folder.description}>
            {folder.description}
          </div>
        )}
      </div>

      <div className="dms-folder-card-bottom">
        <div className="dms-folder-card-size-wrap">
          <span className="dms-folder-card-count">
            {folder.count} {folder.count === 1 ? t("DMS.item") : t("DMS.items")}
          </span>
          {permissionLabel ? (
            <span className="dms-folder-permission-tag">
              {permissionLabel}
            </span>
          ) : null}
          {folder.shared && <span className="dms-folder-shared-tag">{t("DMS.shared")}</span>}
        </div>
        <div className="dms-folder-card-actions" onClick={(e) => e.stopPropagation()}>
          {actionMenu}
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
