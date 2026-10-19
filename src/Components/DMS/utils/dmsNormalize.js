import { formatDate, formatDmsBytes } from "./dmsHelpers";
import { DMS_SCOPE_OWN, DMS_SCOPE_SHARED, DMS_SCOPE_SHARED_OTHERS } from "./dmsHelpers";
import { parsePermissionName, toSharedWithList } from "./dmsShareUtils";

export const getDmsResponsePayload = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.response)) return data.response;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const createDmsNormalizers = ({ t, locale }) => {
  const normalizeFolderColor = (value) => {
    const color = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "";
  };

  const normalizeFolder = (
    folder,
    { treeScope = DMS_SCOPE_OWN, parentFolderId = null, inheritSharedByFrom = null } = {}
  ) => {
    const inheritedSb = inheritSharedByFrom?.sharedBy ?? "";
    const rawSb = folder.sharedBy ?? folder.sharedByUser ?? folder.SharedBy ?? null;
    const sharedBy =
      rawSb != null && String(rawSb).trim() !== ""
        ? String(rawSb).trim()
        : inheritedSb
          ? String(inheritedSb).trim()
          : "";
    const hasOwnCanReshare = folder.canReshare != null;
    const canReshare = hasOwnCanReshare
      ? folder.canReshare === true
      : inheritSharedByFrom?.canReshare === true;
    const hasOwnPermission =
      folder.permission != null ||
      folder.folderPermission != null ||
      folder.accessLevel != null ||
      folder.sharePermission != null;
    const permissionRaw = hasOwnPermission
      ? folder.permission ??
        folder.folderPermission ??
        folder.accessLevel ??
        folder.sharePermission
      : null;
    const isSharedBranch = treeScope === DMS_SCOPE_SHARED;

    return {
      id: String(folder.id ?? folder.folderId ?? folder.folderID ?? folder.subFolderID ?? ""),
      name: folder.name || folder.folderName || t("DMS.untitledFolder"),
      type: "folder",
      count: folder.childFolderCount ?? folder.childFoldersCount ?? folder.folderCount ?? folder.numberOfFolders ?? folder.documentCount ?? folder.numberOfFiles ?? folder.noOfFiles ?? folder.fileCount ?? 0,
      documentCount: folder.documentCount ?? folder.numberOfFiles ?? folder.noOfFiles ?? folder.fileCount ?? 0,
      childFolderCount: folder.childFolderCount ?? folder.childFoldersCount ?? folder.folderCount ?? folder.numberOfFolders ?? 0,
      size: folder.folderSize || folder.size || "—",
      owner: folder.createdBy ?? folder.createdByName ?? folder.owner ?? "—",
      created: formatDate(
        folder.createdAt ||
          folder.createdOnFormatted ||
          folder.createdOn,
        locale
      ),
      modified: formatDate(
        folder.updatedAt ||
          folder.createdAt ||
          folder.createdOnFormatted ||
          folder.sharedOnFormatted ||
          folder.createdOn,
        locale
      ),
      shared: Boolean(isSharedBranch || folder.isShared || folder.sharedBy || sharedBy),
      description: folder.description || "",
      color: normalizeFolderColor(folder.color ?? folder.Color ?? folder.folderColor),
      folderID: folder.id ?? folder.folderId ?? folder.folderID ?? null,
      subFolderID: folder.subFolderID ?? null,
      isSubFolder: Boolean(
        parentFolderId || folder.subFolderID || folder.parentFolderId || folder.parentFolderID
      ),
      parentFolderID: parentFolderId
        ? String(parentFolderId)
        : String(folder.parentFolderId ?? folder.parentFolderID ?? ""),
      sharedBy,
      canReshare,
      treeScope,
      permission:
        permissionRaw != null
          ? parsePermissionName(permissionRaw)
          : isSharedBranch
            ? parsePermissionName(null)
            : null,
    };
  };

  const normalizeDoc = (doc, folderId = null) => ({
    id: String(doc.id || doc.documentId || doc.masterDocID || doc.registerSignID || ""),
    documentId: String(doc.documentId || doc.documentID || doc.id || ""),
    name: doc.title || doc.fileName || doc.docName || doc.name || t("DMS.untitledDocument"),
    fileName: doc.fileName || doc.title || doc.name || "",
    ext: (
      doc.extension ||
      doc.fileExtension ||
      (doc.fileName || doc.title || doc.name || "").split(".").pop() ||
      "FILE"
    ).toUpperCase(),
    status: doc.statusName || doc.status || "Pending",
    size: formatDmsBytes(doc.fileSize) || doc.fileSizeFormatted || doc.size || "—",
    fileSize: doc.fileSize ?? null,
    documentCount: doc.documentCount ?? doc.totalDocuments ?? doc.noOfDocuments ?? doc.documentsCount ?? 0,
    modified: formatDate(
      doc.updatedAt || doc.updatedOnFormatted || doc.createdOnFormatted || doc.modified || doc.createdOn,
      locale
    ),
    owner: doc.createdBy ?? doc.createdByName ?? doc.owner ?? "—",
    sharedWith: Array.isArray(doc.sharedWith)
      ? doc.sharedWith
      : doc.sharedWith
        ? String(doc.sharedWith)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    folderId: folderId ? String(folderId) : String(doc.folderId || doc.folderID || ""),
    masterDocID: doc.masterDocID ?? doc.id ?? null,
    registerSignID: doc.registerSignID ?? null,
    signedDocKey: doc.signedDocKey ?? null,
    description: doc.description || "",
    tags: doc.tags || "",
    notificationDate: doc.notificationDate ? formatDate(doc.notificationDate, locale) : "",
    notificationBeforeDays: doc.notificationBeforeDays ?? "",
    version: doc.version,
    folderPath: doc.folderPath || doc.folder_path || "",
  });

  const normalizeSharedFolder = (share) => {
    const folderId = String(share.folderId ?? share.folderID ?? share.folder?.id ?? "");
    if (!folderId) return null;
    const shareId = String(share.shareId ?? share.shareID ?? share.id ?? "");
    const perm =
      share.permission ??
      share.folderPermission ??
      share.permissionName ??
      share.accessLevel ??
      share.sharePermission ??
      null;
    return {
      // Prefer shareId for list/React identity when the same folder is shared multiple times
      id: shareId || folderId,
      name: share.folderName ?? share.folder?.name ?? share.name ?? t("DMS.untitledFolder"),
      type: "folder",
      count: share.childFolderCount ?? share.childFoldersCount ?? share.folder?.childFolderCount ?? share.folder?.childFoldersCount ?? share.documentCount ?? share.numberOfFiles ?? share.fileCount ?? share.folder?.documentCount ?? share.folder?.numberOfFiles ?? 0,
      documentCount: share.documentCount ?? share.numberOfFiles ?? share.fileCount ?? share.folder?.documentCount ?? share.folder?.numberOfFiles ?? 0,
      childFolderCount: share.childFolderCount ?? share.childFoldersCount ?? share.folder?.childFolderCount ?? share.folder?.childFoldersCount ?? 0,
      size: share.folderSize || share.size || share.folder?.folderSize || share.folder?.size || "—",
      owner: share.createdBy ?? share.createdByName ?? share.owner ?? share.folder?.createdBy ?? share.folder?.owner ?? "—",
      created: formatDate(
        share.sharedOnFormatted ??
          share.sharedOn ??
          share.createdAt ??
          share.createdOnFormatted ??
          share.createdOn ??
          share.folder?.createdOn,
        locale
      ),
      modified: formatDate(
        share.sharedOn ?? share.sharedOnFormatted ?? share.createdAt ?? share.updatedAt,
        locale
      ),
      shared: true,
      description: share.description ?? share.folder?.description ?? "",
      color: normalizeFolderColor(share.color ?? share.folder?.color ?? share.folderColor),
      folderID: folderId,
      subFolderID: null,
      isSubFolder: false,
      parentFolderID: "",
      sharedBy: share.sharedBy ?? share.sharedByUser ?? "",
      canReshare: share.canReshare === true,
      treeScope: DMS_SCOPE_SHARED,
      permission: parsePermissionName(perm),
      shareId: shareId || null,
    };
  };

  const normalizeSharedWithOthersFolder = (share) => {
    const folderId = String(share.folderId ?? share.folderID ?? share.folder?.id ?? "");
    if (!folderId) return null;
    const shareId = String(share.shareId ?? share.shareID ?? share.id ?? "");
    const folder = share.folder ?? {};
    const permission = share.permission ?? share.folderPermission ?? share.permissionName ?? "FullControl";
    return {
      id: shareId || folderId,
      name: share.folderName ?? folder.name ?? share.name ?? t("DMS.untitledFolder"),
      type: "folder",
      count:
        share.childFolderCount ??
        share.childFoldersCount ??
        folder.childFolderCount ??
        folder.childFoldersCount ??
        share.documentCount ??
        share.numberOfFiles ??
        share.fileCount ??
        folder.documentCount ??
        folder.numberOfFiles ??
        0,
      documentCount:
        share.documentCount ?? share.numberOfFiles ?? share.fileCount ?? folder.documentCount ?? folder.numberOfFiles ?? 0,
      childFolderCount:
        share.childFolderCount ?? share.childFoldersCount ?? folder.childFolderCount ?? folder.childFoldersCount ?? 0,
      size: share.folderSize || share.size || folder.folderSize || folder.size || "—",
      owner: share.sharedBy ?? share.createdBy ?? share.createdByName ?? share.owner ?? folder.createdBy ?? folder.owner ?? "—",
      created: formatDate(
        share.sharedOn ?? share.sharedOnFormatted ?? share.createdAt ?? share.createdOnFormatted ?? share.createdOn ?? folder.createdOn,
        locale
      ),
      modified: formatDate(
        share.sharedOn ?? share.sharedOnFormatted ?? share.updatedAt ?? share.createdAt ?? folder.updatedAt,
        locale
      ),
      shared: true,
      sharedWith: share.sharedWithUser ?? share.sharedWithEmail ?? share.email ?? share.userEmail ?? "",
      description: share.description ?? folder.description ?? "",
      color: normalizeFolderColor(share.color ?? folder.color ?? share.folderColor),
      folderID: folderId,
      subFolderID: null,
      isSubFolder: false,
      parentFolderID: "",
      sharedBy: share.sharedBy ?? "",
      canReshare: share.canReshare === true,
      treeScope: DMS_SCOPE_SHARED_OTHERS,
      permission: parsePermissionName(permission),
      shareId: shareId || null,
    };
  };

  const normalizeSharedDocument = (share) => {
    const documentId = String(share.documentId ?? share.documentID ?? share.document?.id ?? "");
    if (!documentId) return null;

    const shareId = String(share.shareId ?? share.shareID ?? share.id ?? "");
    const nested = share.document ?? {};
    const documentName =
      share.documentName ??
      share.documentTitle ??
      nested.title ??
      nested.fileName ??
      nested.name ??
      "";
    const perm =
      share.permission ??
      share.documentPermission ??
      share.permissionName ??
      share.accessLevel ??
      null;
    const baseDoc = normalizeDoc(
      {
        id: documentId,
        documentId,
        title: documentName,
        fileName: documentName || nested.fileName || share.fileName || "",
        fileSize: nested.fileSize ?? share.documentSize ?? share.fileSize,
        statusName: nested.statusName ?? share.statusName ?? share.status,
        createdBy: share.sharedBy ?? share.sharedByUser ?? nested.createdBy ?? nested.owner,
        folderPath: nested.folderPath ?? share.folderPath ?? "",
        updatedAt: share.sharedOn ?? share.sharedOnFormatted ?? nested.updatedAt,
        extension: nested.extension ?? nested.fileExtension,
      },
      share.folderId ?? share.folderID ?? nested.folderId ?? null
    );
    return {
      ...baseDoc,
      id: documentId,
      documentId,
      type: "document",
      sharedDirectly: true,
      shared: true,
      sharedBy: share.sharedBy ?? share.sharedByUser ?? share.createdBy ?? "",
      sharedWith: toSharedWithList(share.sharedWithUser ?? share.sharedWith),
      sharedWithUser: share.sharedWithUser ?? share.sharedWith ?? "",
      canReshare: share.canReshare === true,
      treeScope: DMS_SCOPE_SHARED,
      permission: parsePermissionName(perm),
      shareId: shareId || null,
      sharedOn: formatDate(share.sharedOn ?? share.sharedOnFormatted, locale),
      expiresAt: share.expiresAt ?? share.expiresOn ?? null,
    };
  };

  const normalizeSharedWithOthersDocument = (share) => {
    const documentId = String(share.documentId ?? share.documentID ?? share.document?.id ?? "");
    if (!documentId) return null;

    const shareId = String(share.shareId ?? share.shareID ?? share.id ?? "");
    const nested = share.document ?? {};
    const documentName =
      share.documentName ??
      share.documentTitle ??
      nested.title ??
      nested.fileName ??
      nested.name ??
      "";
    const perm =
      share.permission ??
      share.documentPermission ??
      share.permissionName ??
      "FullControl";
    const recipient =
      share.sharedWithUser ?? share.sharedWithEmail ?? share.email ?? share.userEmail ?? "";
    const baseDoc = normalizeDoc(
      {
        id: documentId,
        documentId,
        title: documentName,
        fileName: documentName || nested.fileName || share.fileName || "",
        fileSize: nested.fileSize ?? share.documentSize ?? share.fileSize,
        statusName: nested.statusName ?? share.statusName ?? share.status,
        createdBy: share.sharedBy ?? share.createdBy ?? nested.createdBy ?? nested.owner,
        folderPath: nested.folderPath ?? share.folderPath ?? "",
        updatedAt: share.sharedOn ?? share.sharedOnFormatted ?? nested.updatedAt,
        extension: nested.extension ?? nested.fileExtension,
      },
      share.folderId ?? share.folderID ?? nested.folderId ?? null
    );
    return {
      ...baseDoc,
      id: documentId,
      documentId,
      type: "document",
      sharedDirectly: true,
      shared: true,
      sharedWith: toSharedWithList(recipient),
      sharedWithUser: recipient,
      sharedBy: share.sharedBy ?? share.createdBy ?? "",
      canReshare: share.canReshare === true,
      treeScope: DMS_SCOPE_SHARED_OTHERS,
      permission: parsePermissionName(perm),
      shareId: shareId || null,
      sharedOn: formatDate(share.sharedOn ?? share.sharedOnFormatted, locale),
      expiresAt: share.expiresAt ?? share.expiresOn ?? null,
    };
  };

  return {
    normalizeFolder,
    normalizeDoc,
    normalizeSharedFolder,
    normalizeSharedWithOthersFolder,
    normalizeSharedDocument,
    normalizeSharedWithOthersDocument,
  };
};
