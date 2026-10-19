export const formatDate = (raw, locale = "en-US") => {
  if (!raw || raw === "—") return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
};

export const DMS_SCOPE_OWN = "own";
export const DMS_SCOPE_SHARED = "shared";
export const DMS_SCOPE_SHARED_OTHERS = "sharedOthers";

const SYNTHETIC_TREE_IDS = new Set(["dms-my-folders", "dms-shared-me", "dms-shared-others"]);

/** Parse ?scope=shared from URL search params. */
export const parseDmsScope = (searchParams) => {
  const raw = searchParams?.get?.("scope") ?? "";
  const normalized = String(raw).toLowerCase();
  if (normalized === "shared") return DMS_SCOPE_SHARED;
  if (normalized === "sharedothers" || normalized === "shared-others") return DMS_SCOPE_SHARED_OTHERS;
  return DMS_SCOPE_OWN;
};

/** Stable tree key for selection/expansion; synthetic roots keep raw ids. */
export const getFolderTreeKey = (treeScope, id) => {
  const sid = String(id ?? "");
  if (SYNTHETIC_TREE_IDS.has(sid)) return sid;
  if (treeScope === DMS_SCOPE_SHARED_OTHERS) return `sharedOthers:${sid}`;
  return treeScope === DMS_SCOPE_SHARED ? `shared:${sid}` : `own:${sid}`;
};

export const getFolderDocsMapKey = (treeScope, folderId) =>
  `${treeScope ?? DMS_SCOPE_OWN}:${String(folderId ?? "")}`;

/** Dedupe shared list rows by shareId (fallback to id). */
export const dedupeSharedListItems = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item?.shareId || item?.id || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/** Folder id plus all descendant ids in the same tree branch. */
export const collectDescendantFolderIds = (rootId, treeScope, folders) => {
  const scope = treeScope ?? DMS_SCOPE_OWN;
  const ids = new Set([String(rootId)]);
  let grew = true;
  while (grew) {
    grew = false;
    (folders || []).forEach((f) => {
      if ((f.treeScope ?? DMS_SCOPE_OWN) !== scope) return;
      if (ids.has(String(f.parentFolderID)) && !ids.has(String(f.id))) {
        ids.add(String(f.id));
        grew = true;
      }
    });
  }
  return ids;
};

const nodeMatchesTarget = (node, targetId, targetScope) => {
  if (SYNTHETIC_TREE_IDS.has(String(node.id))) {
    return node.id === targetId;
  }
  const scope = node.treeScope ?? DMS_SCOPE_OWN;
  if (scope !== targetScope) return false;
  const tid = String(targetId ?? "");
  return (
    String(node.id) === tid ||
    String(node.folderID || "") === tid ||
    String(node.shareId || "") === tid
  );
};

export const buildBreadcrumb = (tree, targetId, targetScope = DMS_SCOPE_OWN, path = []) => {
  for (const node of tree) {
    const newPath = [...path, node];
    if (nodeMatchesTarget(node, targetId, targetScope)) return newPath;
    if (node.children?.length) {
      const found = buildBreadcrumb(node.children, targetId, targetScope, newPath);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Sorts documents array by the given sort key.
 */
export const sortDocuments = (docs, sortBy) => {
  return [...docs].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return parseFloat(a.size) - parseFloat(b.size);
    return new Date(b.modified) - new Date(a.modified);
  });
};

/**
 * Filters documents by search query and status.
 */
export const filterDocuments = (docs, searchQuery, filterStatus) => {
  return docs.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "All" || doc.status === filterStatus;
    return matchSearch && matchStatus;
  });
};

/** Permission rank 1–5: View, Upload, Edit, Delete, FullControl (inclusive). */
const permissionRawToRank = (raw) => {
  if (raw == null || raw === "") return 1;
  if (typeof raw === "string") {
    const key = raw.trim().toLowerCase().replace(/\s+/g, "");
    if (key === "fullcontrol") return 5;
    if (key === "delete") return 4;
    if (key === "edit") return 3;
    if (key === "upload") return 2;
    if (key === "view") return 1;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  if (n >= 1 && n <= 5) return Math.round(n);
  return 1;
};

const rankToAccess = (rank) => {
  const r = Math.min(5, Math.max(1, Math.round(rank)));
  return {
    canView: r >= 1,
    canUpload: r >= 2,
    canEdit: r >= 3,
    canDelete: r >= 4,
    // The API permits creating shares only for Full Control recipients.
    canShare: r >= 5,
    canManageAccess: r >= 5,
    fullControl: r >= 5,
  };
};

/** Returns the highest permission rank represented by a resolved access object. */
export const getDmsAccessRank = (access) => {
  if (access?.fullControl) return 5;
  if (access?.canDelete) return 4;
  if (access?.canEdit) return 3;
  if (access?.canUpload) return 2;
  return 1;
};

/**
 * Resolves folder actions allowed for the current user.
 * Owned folders (not shared-with-me) get full access. Shared folders use `permission` on the folder object.
 */
export const resolveDmsFolderAccess = (folder) => {
  const full = {
    canView: true,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canShare: true,
    canManageAccess: true,
    fullControl: true,
  };
  const sharedRootLimited = {
    canView: true,
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canShare: false,
    canManageAccess: false,
    fullControl: false,
  };
  if (!folder) return full;
  if (folder.id === "dms-shared-me") return sharedRootLimited;
  if (folder.id === "dms-shared-others") return full;
  if (folder.id === "dms-my-folders") return full;
  if (folder.treeScope === DMS_SCOPE_SHARED_OTHERS) return full;
  const isSharedContext =
    folder.treeScope === DMS_SCOPE_SHARED ||
    folder.id === "dms-shared-me" ||
    Boolean(folder.sharedBy);
  if (!isSharedContext) return full;
  const rank = permissionRawToRank(folder.permission);
  return rankToAccess(rank);
};

/** Document actions: directly shared docs use share permission; others inherit folder access. */
export const resolveDmsDocumentAccess = (doc, folderAccess) => {
  const full = {
    canView: true,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canShare: true,
    canManageAccess: true,
    fullControl: true,
  };
  if (!doc?.sharedDirectly) return folderAccess ?? full;
  if (doc.treeScope === DMS_SCOPE_SHARED_OTHERS) return full;
  if (doc.treeScope === DMS_SCOPE_SHARED) {
    const rank = permissionRawToRank(doc.permission);
    return rankToAccess(rank);
  }
  return folderAccess ?? full;
};

const firstFiniteNumber = (...candidates) => {
  for (const c of candidates) {
    if (c == null || c === "") continue;
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const parseStorageBytes = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = String(value).trim().toLowerCase();
  const match = text.match(/^([\d,.]+)\s*(b|byte|bytes|kb|kib|mb|mib|gb|gib|tb|tib)?$/i);
  if (!match) return null;

  const amount = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;

  const unit = match[2] || "b";
  const multipliers = {
    b: 1,
    byte: 1,
    bytes: 1,
    kb: 1024,
    kib: 1024,
    mb: 1024 ** 2,
    mib: 1024 ** 2,
    gb: 1024 ** 3,
    gib: 1024 ** 3,
    tb: 1024 ** 4,
    tib: 1024 ** 4,
  };

  return amount * (multipliers[unit] ?? 1);
};

const firstStorageBytes = (...candidates) => {
  for (const candidate of candidates) {
    const bytes = parseStorageBytes(candidate);
    if (bytes != null) return bytes;
  }
  return null;
};

const firstPercentNumber = (...candidates) => {
  for (const c of candidates) {
    if (c == null || c === "") continue;
    const raw = String(c).trim().replace("%", "");
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.max(0, Math.min(100, n));
  }
  return null;
};

const firstNonEmptyString = (...candidates) => {
  for (const c of candidates) {
    if (c == null) continue;
    const s = String(c).trim();
    if (s) return s;
  }
  return null;
};

/**
 * Normalizes GET /api/folders/get-my-storage (and similar) responses.
 * Prefers server-provided formatted strings when present; exposes numeric fields for the progress bar.
 */
export const parseDmsMyStorageResponse = (res) => {
  const raw = res?.data;
  const obj =
    (raw && typeof raw.data === "object" && !Array.isArray(raw.data) ? raw.data : null) ??
    (raw && typeof raw.response === "object" && !Array.isArray(raw.response) ? raw.response : null) ??
    (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null);

  if (!obj || typeof obj !== "object") {
    return {
      usedBytes: null,
      totalBytes: null,
      usedFormatted: null,
      totalFormatted: null,
      totalDocuments: null,
      totalFolders: null,
    };
  }

  const usedFormatted = firstNonEmptyString(
    obj.usedFormatted,
    obj.usedFormattedString,
    obj.usedLabel,
    obj.usageFormatted,
    obj.storageUsedFormatted
  );
  const totalFormatted = firstNonEmptyString(
    obj.totalFormatted,
    obj.totalFormattedString,
    obj.totalLabel,
    obj.quotaFormatted,
    obj.limitFormatted,
    obj.storageLimitFormatted
  );

  const usedBytes = firstStorageBytes(
    obj.usedBytes,
    obj.used,
    obj.usedStorage,
    obj.usageBytes,
    obj.storageUsed,
    obj.UsedBytes,
    usedFormatted
  );
  const totalBytes = firstStorageBytes(
    obj.totalBytes,
    obj.total,
    obj.totalStorage,
    obj.quotaBytes,
    obj.limitBytes,
    obj.storageLimitBytes,
    obj.maxStorageBytes,
    obj.allowedStorageBytes,
    obj.storageLimit,
    obj.TotalBytes,
    totalFormatted
  );
  const usagePercent =
    firstPercentNumber(
      obj.usagePercent,
      obj.usedPercent,
      obj.storagePercent,
      obj.storageUsedPercent,
      obj.percentageUsed,
      obj.usedPercentage,
      obj.usagePercentage,
      obj.percentUsed,
      obj.UsagePercent,
      obj.UsedPercent
    ) ??
    (usedBytes != null && totalBytes != null && totalBytes > 0
      ? Math.min(100, Math.round((usedBytes / totalBytes) * 100))
      : null);

  const totalDocuments = firstFiniteNumber(
    obj.totalDocuments,
    obj.documentCount,
    obj.noOfDocuments,
    obj.documentsCount,
    obj.TotalDocuments
  );
  const totalFolders = firstFiniteNumber(
    obj.totalFolders,
    obj.folderCount,
    obj.noOfFolders,
    obj.foldersCount,
    obj.TotalFolders
  );

  return {
    usedBytes,
    totalBytes,
    usedFormatted,
    totalFormatted,
    usagePercent,
    totalDocuments,
    totalFolders,
  };
};

export const formatDmsBytes = (bytes) => {
  if (bytes == null || !Number.isFinite(Number(bytes))) return null;
  const n = Number(bytes);
  if (n >= 1073741824) return `${(n / 1073741824).toFixed(1)} GB`;
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
};

const normalizeTeamStorageRow = (row, index) => {
  const usedBytes = firstFiniteNumber(
    row.usedBytes,
    row.used,
    row.usedStorage,
    row.usageBytes,
    row.UsedBytes
  );
  const totalBytes = firstFiniteNumber(
    row.totalBytes,
    row.total,
    row.totalStorage,
    row.quotaBytes,
    row.limitBytes,
    row.TotalBytes
  );
  const email = firstNonEmptyString(
    row.email,
    row.userEmail,
    row.userName,
    row.Email,
    row.UserEmail
  );
  const displayName = firstNonEmptyString(
    row.displayName,
    row.fullName,
    row.name,
    row.userName,
    row.Name
  );
  const userId = firstNonEmptyString(
    row.userId,
    row.userID,
    row.accountId,
    row.AccountID,
    row.id
  );
  const usedFormatted =
    firstNonEmptyString(row.usedFormatted, row.usedFormattedString, row.usageFormatted) ??
    formatDmsBytes(usedBytes);
  const totalFormatted =
    firstNonEmptyString(row.totalFormatted, row.totalFormattedString, row.totalLabel, row.quotaFormatted) ??
    formatDmsBytes(totalBytes);
  const totalDocuments =
    firstFiniteNumber(
      row.totalDocuments,
      row.documentCount,
      row.noOfDocuments,
      row.documentsCount,
      row.TotalDocuments
    ) ?? 0;
  const totalFolders =
    firstFiniteNumber(row.totalFolders, row.folderCount, row.noOfFolders, row.foldersCount, row.TotalFolders) ??
    0;
  const usagePercent =
    usedBytes != null && totalBytes != null && totalBytes > 0
      ? Math.min(100, Math.round((usedBytes / totalBytes) * 100))
      : null;
  const label = displayName || email || userId || `User ${index + 1}`;
  const initials = (displayName || email || "?")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

  return {
    key: userId || email || `team-storage-${index}`,
    userId,
    email,
    displayName: label,
    initials,
    usedBytes,
    totalBytes,
    usedFormatted: usedFormatted ?? "—",
    totalFormatted: totalFormatted ?? "—",
    totalDocuments,
    totalFolders,
    usagePercent,
    usageLabel:
      usedFormatted && totalFormatted && totalFormatted !== "—"
        ? `${usedFormatted} / ${totalFormatted}`
        : usedFormatted && usedFormatted !== "—"
          ? usedFormatted
          : totalFormatted && totalFormatted !== "—"
            ? totalFormatted
            : "—",
  };
};

/** Normalize GET /api/folders/get-allusers-storage array response. */
export const parseDmsTeamStorageRows = (response) => {
  const raw = response?.data;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.response)
      ? raw.response
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.items)
          ? raw.items
          : [];
  return list.map((row, index) => normalizeTeamStorageRow(row ?? {}, index));
};

export const summarizeDmsTeamStorage = (rows) => {
  const safe = Array.isArray(rows) ? rows : [];
  let usedBytes = 0;
  let totalBytes = 0;
  let hasUsed = false;
  let hasTotal = false;
  let totalDocuments = 0;
  let totalFolders = 0;

  safe.forEach((row) => {
    if (row.usedBytes != null) {
      usedBytes += row.usedBytes;
      hasUsed = true;
    }
    if (row.totalBytes != null) {
      totalBytes += row.totalBytes;
      hasTotal = true;
    }
    totalDocuments += row.totalDocuments ?? 0;
    totalFolders += row.totalFolders ?? 0;
  });

  const usagePercent =
    hasUsed && hasTotal && totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : null;

  return {
    memberCount: safe.length,
    usedBytes: hasUsed ? usedBytes : null,
    totalBytes: hasTotal ? totalBytes : null,
    usedFormatted: hasUsed ? formatDmsBytes(usedBytes) : null,
    totalFormatted: hasTotal ? formatDmsBytes(totalBytes) : null,
    usagePercent,
    totalDocuments,
    totalFolders,
  };
};

/**
 * DMS download endpoints may return JSON or a plain UTF-8 string (e.g. raw URL as text/plain).
 */
export const extractDmsDownloadUrl = (data) => {
  if (data == null) return null;
  if (typeof data === "string") {
    let s = data.replace(/^\uFEFF/, "").trim();
    if (!s) return null;
    if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
      try {
        return extractDmsDownloadUrl(JSON.parse(s));
      } catch {
        /* plain string */
      }
    }
    return s;
  }
  if (typeof data === "object") {
    const fromFields =
      data.filePath ??
      data.url ??
      data.downloadUrl ??
      data.document ??
      data.response?.url ??
      data.response?.document ??
      (typeof data.data === "string" ? data.data : null) ??
      data.data?.url ??
      data.data?.document ??
      null;
    if (fromFields) return typeof fromFields === "string" ? fromFields.trim() || null : fromFields;
    if (data.data != null && typeof data.data === "object") return extractDmsDownloadUrl(data.data);
    return null;
  }
  return null;
};

export const normalizeDownloadUrlForOpen = (url) => {
  if (!url || typeof url !== "string") return url;
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
};

/** DMS may return Windows-style backslashes inside HTTPS URLs; normalize for fetch / iframe / URL(). */
export const sanitizeDmsFileUrl = (raw) => {
  if (raw == null || typeof raw !== "string") return raw;
  return raw.trim().replace(/\\/g, "/");
};

const HTTP_URL_RE = /^https?:\/\//i;

/** Axios DMS detail responses: unwrap common envelope shapes */
export const getDmsDetailPayload = (res) => {
  const d = res?.data;
  if (d == null) return null;
  if (typeof d === "string") return d;
  if (typeof d === "object") {
    if (d.data !== undefined && !Array.isArray(d.data)) return d.data;
    if (d.response !== undefined && !Array.isArray(d.response)) return d.response;
  }
  return d;
};

const normalizeIfFileUrl = (v) => {
  if (typeof v !== "string") return null;
  const s = sanitizeDmsFileUrl(v);
  if (!s) return null;
  if (HTTP_URL_RE.test(s) || s.startsWith("blob:") || s.startsWith("data:")) {
    return normalizeDownloadUrlForOpen(s);
  }
  return null;
};

/**
 * File / view URL from DMS GET document-by-id (or similar) payload.
 */
export const extractDocumentFileUrl = (detail) => {
  if (detail == null) return null;
  const scalar = normalizeIfFileUrl(detail);
  if (scalar) return scalar;
  if (typeof detail !== "object") return null;

  // Unwrap one level when the document lives only on .data (envelope without filePath on parent)
  if (detail.filePath == null && detail.data != null && typeof detail.data === "object") {
    const u = extractDocumentFileUrl(detail.data);
    if (u) return u;
  }

  const nested = detail.document ?? detail.file ?? detail.item;
  if (nested && typeof nested === "object" && nested !== detail) {
    const u = extractDocumentFileUrl(nested);
    if (u) return u;
  }

  const direct = [
    normalizeIfFileUrl(detail.filePath),
    normalizeIfFileUrl(detail.url),
    normalizeIfFileUrl(detail.fileUrl),
    normalizeIfFileUrl(detail.downloadUrl),
    normalizeIfFileUrl(detail.documentUrl),
    normalizeIfFileUrl(detail.signedUrl),
    normalizeIfFileUrl(detail.presignedUrl),
    normalizeIfFileUrl(detail.publicUrl),
    normalizeIfFileUrl(detail.blobUrl),
    normalizeIfFileUrl(detail.viewUrl),
    normalizeIfFileUrl(detail.uri),
    normalizeIfFileUrl(detail.link),
  ].find(Boolean);
  if (direct) return direct;

  const extracted = extractDmsDownloadUrl(detail);
  if (typeof extracted === "string") {
    const s = sanitizeDmsFileUrl(extracted.trim());
    if (HTTP_URL_RE.test(s) || s.startsWith("blob:") || s.startsWith("data:")) {
      return normalizeDownloadUrlForOpen(s);
    }
  }
  return null;
};

/** Saved download name: document title when possible, else last segment of file URL path */
export const buildDmsDownloadFileName = (doc, fileUrl) => {
  const rawName = (doc?.fileName || doc?.name || "").trim();
  if (rawName) {
    const safe = sanitizeDownloadFileName(rawName);
    if (safe.includes(".")) return safe;
  }
  try {
    if (fileUrl && HTTP_URL_RE.test(fileUrl)) {
      const u = new URL(sanitizeDmsFileUrl(fileUrl));
      const segments = u.pathname.split("/").filter(Boolean);
      const last = segments.length ? decodeURIComponent(segments[segments.length - 1]) : "";
      if (last) return sanitizeDownloadFileName(last);
    }
  } catch {
    /* ignore */
  }
  const base = sanitizeDownloadFileName(rawName.replace(/\.[^.]+$/i, "") || "document");
  const ext = String(doc?.ext || "pdf").toLowerCase().replace(/^\./, "");
  return `${base}.${ext}`;
};

/** Safe filename segment for Content-Disposition / download attribute */
export const sanitizeDownloadFileName = (name, fallback = "download") => {
  const base = String(name || fallback)
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  return base || fallback;
};

/** Remote URL → Blob (same idea as DownloadModal.downloadURL) */
export const fetchUrlAsBlob = async (url) => {
  const sanitized = sanitizeDmsFileUrl(typeof url === "string" ? url : "");
  const normalized = normalizeDownloadUrlForOpen(sanitized);
  const response = await fetch(normalized);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
};

/** Infer MIME type for in-browser preview from response header or file extension. */
export const getDmsPreviewMimeType = (contentTypeHeader, ext) => {
  const ct = (contentTypeHeader || "").toLowerCase().split(";")[0].trim();
  if (ct && ct !== "application/octet-stream") return ct;
  const e = String(ext || "")
    .toLowerCase()
    .replace(/^\./, "");
  if (e === "pdf") return "application/pdf";
  if (e === "htm" || e === "html") return "text/html";
  if (e === "jpg" || e === "jpeg") return "image/jpeg";
  if (e === "png") return "image/png";
  if (e === "gif") return "image/gif";
  if (e === "webp") return "image/webp";
  return "application/pdf";
};

export const isDmsPreviewImageMime = (mime) => String(mime || "").startsWith("image/");

export const isDmsPreviewHtmlMime = (mime) => {
  const base = String(mime || "").toLowerCase().split(";")[0].trim();
  return base === "text/html" || base === "application/xhtml+xml";
};

/** True when UTF-8 payload is an HTML document (not a plain download URL). */
export const isDmsHtmlDocumentText = (text) => {
  if (typeof text !== "string" || !text.trim()) return false;
  const sample = text.replace(/^\uFEFF/, "").trimStart().slice(0, 4096);
  const lower = sample.toLowerCase();
  if (lower.startsWith("<!doctype html") || lower.startsWith("<html")) return true;
  if (lower.startsWith("<!--") && /<html[\s>]/i.test(sample)) return true;
  return /^<\s*!doctype\s+html/i.test(sample) || /^<\s*html[\s>]/i.test(sample);
};

const createDmsHtmlBlob = (text) => new Blob([text], { type: "text/html;charset=utf-8" });

const isProbablyDmsDownloadUrl = (value) => {
  const s = String(value || "").trim();
  if (!s) return false;
  return HTTP_URL_RE.test(s) || s.startsWith("blob:") || s.startsWith("data:");
};

const resolveDmsTextBlobResponse = async (blob) => {
  const text = await blob.text();
  if (isDmsHtmlDocumentText(text)) return createDmsHtmlBlob(text);
  const url = extractDmsDownloadUrl(text);
  if (!url || !isProbablyDmsDownloadUrl(url)) throw new Error("DMS_DOWNLOAD_NO_URL");
  return fetchUrlAsBlob(url);
};

/** Detect file type from magic bytes when Content-Type is missing or generic. */
export const sniffBlobMimeType = async (blob) => {
  const head = await blob.slice(0, 16).arrayBuffer();
  const b = new Uint8Array(head);
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return "image/png";
  }
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return "image/webp";
  }
  if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) {
    return "application/pdf";
  }
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b) return "application/zip";

  try {
    const sampleText = new TextDecoder("utf-8", { fatal: false })
      .decode(b)
      .replace(/^\uFEFF/, "")
      .trimStart();
    if (isDmsHtmlDocumentText(sampleText)) return "text/html";
  } catch {
    /* ignore decode errors */
  }

  return null;
};

/** Re-wrap blob with a concrete MIME when the server omits or mislabels it. */
export const ensureBlobMimeType = async (blob, preferredMime) => {
  const normalizedPreferred = (preferredMime || "").toLowerCase().split(";")[0].trim();
  const preferred =
    normalizedPreferred && normalizedPreferred !== "application/octet-stream"
      ? normalizedPreferred
      : null;
  const existing =
    blob.type && blob.type !== "application/octet-stream" ? blob.type : null;
  const mime = preferred || existing || (await sniffBlobMimeType(blob));
  if (!mime || blob.type === mime) return blob;
  const buffer = await blob.arrayBuffer();
  return new Blob([buffer], { type: mime });
};

export const createBlobPreviewUrl = (blob) => URL.createObjectURL(blob);

export const revokeBlobPreviewUrl = (url) => {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

/** Trigger a file save in the browser without opening a new tab */
export const triggerBrowserFileDownload = (blob, filename) => {
  const downloadLink = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  downloadLink.href = objectUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(objectUrl);
};

/**
 * Normalize axios `response.data` from DMS download endpoints (Blob) into the actual file bytes.
 * Supports direct zip/pdf/binary, JSON with a URL, or UTF-8 text URL.
 */
export const resolveDmsDownloadBlobResponse = async (blob, contentTypeHeader) => {
  if (!(blob instanceof Blob)) throw new Error("DMS_DOWNLOAD_NOT_BLOB");
  const ct = (contentTypeHeader || blob.type || "").toLowerCase();
  const baseMime = ct.split(";")[0].trim();

  if (baseMime.includes("application/zip")) return blob;
  if (baseMime.includes("application/pdf")) return ensureBlobMimeType(blob, "application/pdf");
  if (baseMime.startsWith("image/") || baseMime.startsWith("video/") || baseMime.startsWith("audio/")) {
    return ensureBlobMimeType(blob, baseMime);
  }
  if (baseMime.includes("application/json")) {
    const text = await blob.text();
    const url = extractDmsDownloadUrl(JSON.parse(text));
    if (!url) throw new Error("DMS_DOWNLOAD_NO_URL");
    return fetchUrlAsBlob(url);
  }
  if (baseMime.includes("html") || baseMime === "application/xhtml+xml") {
    return ensureBlobMimeType(blob, "text/html");
  }
  if (baseMime.startsWith("text/")) {
    return resolveDmsTextBlobResponse(blob);
  }

  const sniffed = await sniffBlobMimeType(blob);
  if (sniffed) return ensureBlobMimeType(blob, sniffed);

  if (!baseMime && blob.size > 400) return ensureBlobMimeType(blob, null);
  if (baseMime.includes("application/octet-stream") && blob.size > 400) {
    return ensureBlobMimeType(blob, null);
  }

  return resolveDmsTextBlobResponse(blob);
};
