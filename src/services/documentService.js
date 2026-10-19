import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const documentService = {
  // Get Record Count (Folder, Docs, templates)
  getRecordCounts: () => {
    return api.get(ENDPOINTS.DOCUMENTS.GET_RECORD_COUNT);
  },

  // Recent Docs
  getRecentDocs: (params) => {
    return api.get(ENDPOINTS.DOCUMENTS.GET_RECENT_DOCS, { params });
  },

  // Dashboard Document Counts
  getDashboardDocumentCounts: () => {
    return api.get(ENDPOINTS.DOCUMENTS.GET_DOCUMENT_COUNTS);
  },

  // Get App User Docs Count
  getAppUserDocsCount: (appUserID) => {
    return api.get(`${ENDPOINTS.DOCUMENTS.GET_APP_USER_DOCS_COUNT}?AppUserID=${appUserID}`);
  },

  // Get Admin All Docs Count (FromDate / ToDate are optional)
  getAdminAllDocsCount: (accountID, { fromDate, toDate } = {}, requestConfig = {}) => {
    const params = { AccountID: accountID };
    if (fromDate) params.FromDate = fromDate;
    if (toDate) params.ToDate = toDate;

    return api.get(ENDPOINTS.DOCUMENTS.GET_ADMIN_ALL_DOCS_COUNTS, { ...requestConfig, params });
  },

  // Get Account Folder / Storage Size
  getAccountFolderSize: (accountID, requestConfig = {}) => {
    return api.get(`${ENDPOINTS.DOCUMENTS.GET_ACCOUNT_FOLDER_SIZE}?AccountID=${accountID}`, requestConfig);
  },

  // Share Document
  shareDocument: (data) => {
    return api.post(ENDPOINTS.FOLDER.CREATE_DOC_SHARED, data);
  },

  // Download Document
  downloadDoc: (headers) => {
    return api.get(ENDPOINTS.DOCUMENTS.DOWNLOAD_DOC, { headers });
  },
};

export default documentService;
