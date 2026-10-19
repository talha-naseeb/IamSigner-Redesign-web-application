import userService from "@/services/userService";
import uploadFlowService from "@/services/uploadFlowService";
import { resolveDmsDownloadBlobResponse } from "./dmsHelpers";

export const DMS_SIGN_FLOW_MODES = {
  NORMAL: "normal",
  BULK: "bulk",
  SELF: "self",
};

const DMS_SIGN_FLOW_CONFIG = {
  [DMS_SIGN_FLOW_MODES.NORMAL]: {
    route: "/upload-doc",
    isBulk: false,
    isSerial: false,
    referenceNumber: "",
  },
  [DMS_SIGN_FLOW_MODES.BULK]: {
    route: "/upload-bulk",
    isBulk: true,
    isSerial: true,
    referenceNumber: "",
  },
  [DMS_SIGN_FLOW_MODES.SELF]: {
    route: "/self-sign",
    isBulk: false,
    isSerial: true,
    referenceNumber: "Self Signature",
  },
};

/** Extensions allowed to start the upload/sign flow from DMS. */
export const DMS_SIGNABLE_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

export const normalizeDmsDocExtension = (doc) => {
  const ext = String(doc?.ext || "")
    .toLowerCase()
    .replace(/^\./, "");
  if (ext && ext !== "file") return ext;
  const name = doc?.fileName || doc?.name || "";
  const fromName = name.split(".").pop();
  return fromName ? fromName.toLowerCase() : "";
};

export const isDmsSignableDocument = (doc) => DMS_SIGNABLE_EXTENSIONS.has(normalizeDmsDocExtension(doc));

/** Same license/role gate as ManualDosList sign action. */
export const canUserStartDmsSign = (user, userAccess) => {
  if (!user || !userAccess) return false;
  if (userAccess.remainingDays <= 0) return false;
  if (user.AccountType !== "B") return false;
  return [1, 2, 4].includes(Number(user.RoleID));
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("read-failed"));
        return;
      }
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });

const buildSignDocName = (doc, ext) => {
  const raw = (doc?.fileName || doc?.name || "document").trim();
  if (/\.[a-z0-9]+$/i.test(raw)) return raw;
  return `${raw}.${ext}`;
};

/**
 * Download a DMS document and register it as the primary doc in a new signing session.
 * Caller should set localStorage.registerSignID and navigate to the returned route on success.
 */
export const registerDmsDocumentForSigning = async ({ doc, user, mode = DMS_SIGN_FLOW_MODES.NORMAL }) => {
  const documentId = doc?.documentId ?? doc?.documentID ?? doc?.masterDocID ?? doc?.id ?? null;
  if (!documentId) throw new Error("missing-document-id");
  if (!isDmsSignableDocument(doc)) throw new Error("unsupported-type");
  const config = DMS_SIGN_FLOW_CONFIG[mode] ?? DMS_SIGN_FLOW_CONFIG[DMS_SIGN_FLOW_MODES.NORMAL];

  const ext = normalizeDmsDocExtension(doc);
  const response = await userService.downloadDmsDocument(documentId);
  const fileBlob = await resolveDmsDownloadBlobResponse(response.data, response.headers?.["content-type"]);
  const base64 = await blobToBase64(fileBlob);

  const body = {
    IsBulk: config.isBulk,
    ReferenceNumber: config.referenceNumber,
    Description: doc?.description || "",
    CreatedBy: user.email,
    IsSerial: config.isSerial,
    isOnlySigner: false,
    registerSignID: null,
    PrimaryDocs: [
      {
        IsBulk: config.isBulk,
        DocName: buildSignDocName(doc, ext),
        DocExtension: ext,
        DocFile: base64,
        IsPasswordProtected: false,
      },
    ],
  };

  const registerResponse = await uploadFlowService.registerDocs(body);
  if (registerResponse.data?.statusCode !== "1") {
    throw new Error("register-failed");
  }
  return {
    ...registerResponse.data.response,
    route: config.route,
    mode,
  };
};

/**
 * Download a DMS document and add it to an existing upload/sign session (normal flow step 1).
 */
export const registerDmsDocumentForUploadFlow = async ({ doc, user, registerSignID = null, referenceNumber = "", description = "" }) => {
  const documentId = doc?.documentId ?? doc?.documentID ?? doc?.masterDocID ?? doc?.id ?? null;
  if (!documentId) throw new Error("missing-document-id");
  if (!isDmsSignableDocument(doc)) throw new Error("unsupported-type");

  const ext = normalizeDmsDocExtension(doc);
  const response = await userService.downloadDmsDocument(documentId);
  const fileBlob = await resolveDmsDownloadBlobResponse(response.data, response.headers?.["content-type"]);
  const base64 = await blobToBase64(fileBlob);
  const docName = buildSignDocName(doc, ext);

  const body = {
    IsBulk: false,
    ReferenceNumber: referenceNumber,
    Description: description,
    CreatedBy: user.email,
    IsSerial: false,
    isOnlySigner: false,
    registerSignID,
    PrimaryDocs: [
      {
        IsBulk: false,
        DocName: docName,
        DocExtension: ext,
        DocFile: base64,
        IsPasswordProtected: false,
      },
    ],
  };

  const registerResponse = await uploadFlowService.registerDocs(body);
  if (registerResponse.data?.statusCode !== "1") {
    throw new Error("register-failed");
  }
  return registerResponse.data.response;
};
