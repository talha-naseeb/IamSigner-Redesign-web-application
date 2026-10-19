import {
  DMS_FOLDER_PERMISSION,
  DMS_PERMISSION_NAMES,
  DMS_PERMISSION_OPTIONS,
} from "../constants/dmsConfig";

export { DMS_PERMISSION_NAMES, DMS_PERMISSION_OPTIONS };

const PERMISSION_NAME_BY_RANK = {
  1: DMS_PERMISSION_NAMES.View,
  2: DMS_PERMISSION_NAMES.Upload,
  3: DMS_PERMISSION_NAMES.Edit,
  4: DMS_PERMISSION_NAMES.Delete,
  5: DMS_PERMISSION_NAMES.FullControl,
};

const PERMISSION_LABEL_KEYS = {
  [DMS_PERMISSION_NAMES.View]: "DMS.permView",
  [DMS_PERMISSION_NAMES.Upload]: "DMS.permUpload",
  [DMS_PERMISSION_NAMES.Edit]: "DMS.permEdit",
  [DMS_PERMISSION_NAMES.Delete]: "DMS.permDelete",
  [DMS_PERMISSION_NAMES.FullControl]: "DMS.permFullControl",
};

/** Normalize API/UI value to canonical permission name for payloads. */
export const parsePermissionName = (raw) => {
  if (raw == null || raw === "") return DMS_PERMISSION_NAMES.View;
  if (typeof raw === "string") {
    const compact = raw.trim().replace(/\s+/g, "");
    const match = DMS_PERMISSION_OPTIONS.find(
      (name) => name.toLowerCase() === compact.toLowerCase()
    );
    if (match) return match;
  }
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1 && n <= 5) {
    return PERMISSION_NAME_BY_RANK[Math.round(n)] ?? DMS_PERMISSION_NAMES.View;
  }
  return DMS_PERMISSION_NAMES.View;
};

/** Numeric permission rank used to cap delegated shares to the grantor's access. */
export const getDmsPermissionRank = (raw) =>
  DMS_FOLDER_PERMISSION[parsePermissionName(raw)] ?? DMS_FOLDER_PERMISSION.View;

export const getShareResponsePayload = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.response)) return data.response;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const normalizeFolderShare = (row) => ({
  id: String(row.shareId ?? row.shareID ?? row.id ?? ""),
  folderId: String(row.folderId ?? row.folderID ?? row.folder?.id ?? ""),
  sharedWithUser:
    row.sharedWithUser ?? row.sharedWith ?? row.email ?? row.userEmail ?? "",
  permission: parsePermissionName(row.permission ?? row.permissionName),
  canReshare: row.canReshare === true,
});

export const buildFolderShareUpdatePayload = (share, draft) => ({
  id: String(share.id),
  folderId: String(share.folderId ?? ""),
  sharedWithUser: share.sharedWithUser,
  permission: parsePermissionName(draft.permission),
  canReshare: Boolean(draft.canReshare),
});

export const normalizeDocumentShare = (row) => ({
  id: String(row.shareId ?? row.shareID ?? row.id ?? ""),
  documentId: String(row.documentId ?? row.documentID ?? row.document?.id ?? ""),
  sharedWithUser:
    row.sharedWithUser ?? row.sharedWith ?? row.email ?? row.userEmail ?? "",
  permission: parsePermissionName(row.permission ?? row.permissionName),
  canReshare: row.canReshare === true,
});

export const buildDocumentShareUpdatePayload = (share, draft) => ({
  id: String(share.id),
  documentId: String(share.documentId ?? ""),
  sharedWithUser: share.sharedWithUser,
  permission: parsePermissionName(draft.permission),
  canReshare: Boolean(draft.canReshare),
});

export const getPermissionLabelKey = (permission) =>
  PERMISSION_LABEL_KEYS[parsePermissionName(permission)] ?? "DMS.permView";

export const shareDraftEquals = (draft, row) => {
  if (!draft || !row) return true;
  const permMatch =
    parsePermissionName(draft.permission) === parsePermissionName(row.permission);
  const reshareMatch = Boolean(draft.canReshare) === (row.canReshare === true);
  return permMatch && reshareMatch;
};

export const buildShareRowDraft = (row) => ({
  permission: parsePermissionName(row.permission),
  canReshare: row.canReshare === true,
});

/** Coerce API shared-with value to an email array for UI lists. */
export const toSharedWithList = (value) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value == null || value === "") return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};
