import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icons } from "@/assets/Icons/index";
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

  return (
    <div
      className="dms-folder-card"
      style={{ "--dms-folder-color": folderColor }}
      onClick={() => onOpen(folder)}
    >
    <div className="dms-folder-card-header">
      {folder.shared
        ? <Icons.FoldersFill size={34} color={folderColor} />
        : <Icons.Folders size={34} color={folderColor} />}

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
            <>
              <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("share", folder)}>
                <Icons.Share size={15} /> {t("DMS.invitePeople")}
              </Dropdown.Item>
            </>
          ) : null}
          {access.canManageAccess ? (
            <>
              <Dropdown.Item className="d-flex gap-2 align-items-center" onClick={() => onFolderAction("manageAccess", folder)}>
                <Icons.Users size={15} /> {t("DMS.manageFolderAccess")}
              </Dropdown.Item>
            </>
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
            <>
              <Dropdown.Item className="d-flex gap-2 align-items-center text-danger" onClick={() => onFolderAction("delete", folder)}>
                <Icons.DeleteAction size={15} /> {t("DMS.delete")}
              </Dropdown.Item>
            </>
          ) : null}
        </Dropdown.Menu>
      </Dropdown>
    </div>

    <div className="dms-folder-card-name" title={folder.name}>{folder.name}</div>
    {sharedWith && folder.treeScope === DMS_SCOPE_SHARED_OTHERS ? (
      <div className="dms-folder-shared-by" title={sharedWith}>
        {t("DMS.sharedWith")}: <strong>{sharedWith}</strong>
      </div>
    ) : folder.sharedBy ? (
      <div className="dms-folder-shared-by" title={folder.sharedBy}>
        {t("DMS.sharedBy")}: <strong>{folder.sharedBy}</strong>
      </div>
    ) : null}
    {!folder.sharedBy && folder.description && (
      <div className="dms-folder-card-desc" title={folder.description}>
        {folder.description}
      </div>
    )}
    {folder.created ? (
      <div className="dms-folder-card-created">
        {t("DMS.createdOn")}: {folder.created}
      </div>
    ) : null}
    <div className="dms-folder-card-meta">
      <span className="dms-folder-card-count">
        {folder.count} {folder.count === 1 ? t("DMS.item") : t("DMS.items")}
      </span>
      {permissionLabel ? (
        <span className="dms-folder-permission-tag">
          {t("DMS.permission")}: {permissionLabel}
        </span>
      ) : null}
      {folder.shared && <span className="dms-folder-shared-tag">{t("DMS.shared")}</span>}
    </div>
  </div>
  );
};

export default FolderCard;
