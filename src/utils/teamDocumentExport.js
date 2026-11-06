import Papa from "papaparse";
import { saveAs } from "file-saver";
import documentService from "@/services/documentService";

const DEFAULT_LABELS = {
  fullName: "Full Name",
  email: "Email",
  role: "Role",
  department: "Department",
  mobile: "Mobile",
  userStatus: "User Status",
  totalDocuments: "Total Documents",
  documents: "Documents",
  documentNumber: "#",
  documentName: "Document Name",
  documentType: "Document Type",
  documentStatus: "Document Status",
  documentLink: "Document Link",
  documentId: "Document ID",
  createdOn: "Created On",
  noDocuments: "No documents uploaded",
  docsLoadFailed: "Documents could not be loaded",
  active: "Active",
  inactive: "Inactive",
};

const resolveLabels = (translate) => Object.fromEntries(
  Object.entries(DEFAULT_LABELS).map(([key, fallback]) => [
    key,
    translate ? translate(`teamExport.${key}`, { defaultValue: fallback }) : fallback,
  ])
);

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

export const getExportDocumentLink = (doc) => firstValue(
  doc?.docPath,
  doc?.documentLink,
  doc?.docLink,
  doc?.documentUrl,
  doc?.docUrl,
  doc?.fileUrl,
  doc?.filePath,
  doc?.downloadUrl,
  doc?.url,
  doc?.link
) || "";

export const normalizeExportDocuments = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.response)) return payload.response;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

/** Load user documents with a small concurrency limit so large teams don't flood the API. */
export const fetchTeamDocuments = async (users, onProgress) => {
  const queue = users.filter((member) => member?.appUserID);
  const docsByUser = new Map();
  const failedUserIDs = new Set();
  let completed = 0;

  const worker = async () => {
    while (queue.length) {
      const member = queue.shift();
      try {
        const response = await documentService.getAppUserDocs(member.appUserID, {
          suppressGlobalErrorToast: true,
        });
        docsByUser.set(member.appUserID, normalizeExportDocuments(response?.data));
      } catch (error) {
        docsByUser.set(member.appUserID, []);
        failedUserIDs.add(member.appUserID);
      }
      completed += 1;
      onProgress?.({ completed, total: users.length, failed: failedUserIDs.size });
    }
  };

  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
  return users.map((member) => ({
    user: member,
    docs: docsByUser.get(member.appUserID) || [],
    docsFailed: failedUserIDs.has(member.appUserID),
  }));
};

const getDocumentName = (doc) => firstValue(doc?.docName, doc?.documentName, doc?.title, doc?.name, doc?.fileName) || "-";
const getDocumentStatus = (doc) => firstValue(doc?.docStatus, doc?.status, doc?.documentStatus, doc?.statusName) || "Bulk";
const getDocumentType = (doc) => firstValue(doc?.docType, doc?.documentType, doc?.fileType) || "-";
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

export const buildTeamDocumentCsvRows = (exportUsers, translate) => {
  const labels = resolveLabels(translate);
  const rows = [];
  exportUsers.forEach(({ user, docs, docsFailed }, index) => {
    if (index) rows.push([]);
    rows.push([labels.fullName, user.fullName || "-"]);
    rows.push([labels.email, user.emailID || "-"]);
    rows.push([labels.role, user.roleNameEn || "-"]);
    rows.push([labels.department, user.department || "-"]);
    rows.push([labels.userStatus, user.isActive ? labels.active : labels.inactive]);
    rows.push([labels.totalDocuments, docsFailed ? "-" : docs.length]);
    rows.push([]);
    rows.push([labels.documents]);
    rows.push([labels.documentNumber, labels.documentName, labels.documentType, labels.documentStatus, labels.documentLink, labels.documentId, labels.createdOn]);

    if (docsFailed) {
      rows.push(["-", labels.docsLoadFailed, "", "", "", "", ""]);
    } else if (!docs.length) {
      rows.push(["-", labels.noDocuments, "", "", "", "", ""]);
    } else {
      docs.forEach((doc, docIndex) => rows.push([
        docIndex + 1,
        getDocumentName(doc),
        getDocumentType(doc),
        getDocumentStatus(doc),
        getExportDocumentLink(doc),
        doc.masterDocID || doc.documentID || "",
        doc.createdOn || doc.createdDate || "",
      ]));
    }
  });
  return rows;
};

export const exportTeamDocumentsCsv = (exportUsers, translate) => {
  const rows = buildTeamDocumentCsvRows(exportUsers, translate);
  const content = Papa.unparse(rows, { escapeFormulae: /^[=@\t\r]|^[+-](?![0-9\s()+-]*$)/ });
  const date = new Date().toISOString().slice(0, 10);
  saveAs(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8;" }), `TeamMembers_with_Documents_${date}.csv`);
};

export const exportTeamDocumentsWord = (exportUsers, translate) => {
  const labels = resolveLabels(translate);
  const sections = exportUsers.map(({ user, docs, docsFailed }, index) => {
    let documentRows;
    if (docsFailed || !docs.length) {
      const message = docsFailed ? labels.docsLoadFailed : labels.noDocuments;
      documentRows = `<tr><td colspan="7">${escapeHtml(message)}</td></tr>`;
    } else {
      documentRows = docs.map((doc, docIndex) => `<tr>
        <td>${docIndex + 1}</td>
        <td>${escapeHtml(getDocumentName(doc))}</td>
        <td>${escapeHtml(getDocumentType(doc))}</td>
        <td>${escapeHtml(getDocumentStatus(doc))}</td>
        <td>${escapeHtml(getExportDocumentLink(doc))}</td>
        <td>${escapeHtml(doc.masterDocID || doc.documentID || "")}</td>
        <td>${escapeHtml(doc.createdOn || doc.createdDate || "")}</td>
      </tr>`).join("");
    }
    return `<section class="user-block">
      <h2>${index + 1}. ${escapeHtml(user.fullName || "-")}</h2>
      <table class="details"><tbody>
        <tr><th>${escapeHtml(labels.email)}</th><td>${escapeHtml(user.emailID || "-")}</td><th>${escapeHtml(labels.role)}</th><td>${escapeHtml(user.roleNameEn || "-")}</td></tr>
        <tr><th>${escapeHtml(labels.department)}</th><td>${escapeHtml(user.department || "-")}</td><th>${escapeHtml(labels.userStatus)}</th><td>${escapeHtml(user.isActive ? labels.active : labels.inactive)}</td></tr>
        <tr><th>${escapeHtml(labels.totalDocuments)}</th><td colspan="3">${docsFailed ? "-" : docs.length}</td></tr>
      </tbody></table>
      <table class="documents"><thead><tr><th>${escapeHtml(labels.documentNumber)}</th><th>${escapeHtml(labels.documentName)}</th><th>${escapeHtml(labels.documentType)}</th><th>${escapeHtml(labels.documentStatus)}</th><th>${escapeHtml(labels.documentLink)}</th><th>${escapeHtml(labels.documentId)}</th><th>${escapeHtml(labels.createdOn)}</th></tr></thead><tbody>${documentRows}</tbody></table>
    </section>`;
  }).join("");
  const source = `<html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;color:#1e293b;margin:24px}h1{color:#0979a9;font-size:22px}.user-block{margin:0 0 28px;page-break-inside:avoid}h2{font-size:16px;margin:0 0 8px}
    table{border-collapse:collapse;width:100%;font-size:11px;margin-bottom:10px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}th{background:#f1f5f9}.documents thead th{background:#0979a9;color:#fff}
  </style></head><body><h1>Team Members and Documents</h1>${sections}</body></html>`;
  const date = new Date().toISOString().slice(0, 10);
  saveAs(new Blob(["\uFEFF", source], { type: "application/msword" }), `TeamMembers_with_Documents_${date}.doc`);
};
