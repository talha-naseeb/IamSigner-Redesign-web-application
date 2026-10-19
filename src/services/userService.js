import api from "@/Api/api";
import dmsApi from "@/Api/dmsApi";
import { ENDPOINTS } from "@/Constants/endpoints";

const userService = {
  // GET USER PROFILE
  getUserProfile: () => {
    return api.get(ENDPOINTS.USER.PROFILE);
  },

  // UPDATE PROFILE IMAGES
  updateProfile: (payload) => {
    return api.put(ENDPOINTS.USER.UPDATE_PROFILE, payload);
  },

  // UPDATE APP USER
  updateAppUser: (payload) => {
    return api.put(ENDPOINTS.USER.UPDATE_APP_USER, payload);
  },

  // GET USER ACCESS
  getUserAccess: (accountId) => {
    return api.get(`${ENDPOINTS.USER.GET_USER_ACCESS}?AccountID=${accountId}`);
  },

  // GET COBRANDING
  getCoBranding: (accountId) => {
    return api.get(`${ENDPOINTS.USER.GET_COBRANDING}?AccountID=${accountId}`);
  },

  // UPDATE COBRANDING
  updateCoBranding: (payload) => {
    return api.put(ENDPOINTS.USER.UPDATE_COBRANDING, payload);
  },

  // CREATE DELEGATION
  createDelegation: (payload) => {
    return api.post(ENDPOINTS.USER.CREATE_DELEGATION, payload);
  },

  // GET DELEGATION
  getDelegation: () => {
    return api.get(ENDPOINTS.USER.GET_DELEGATION);
  },

  // ACTIVATE DELEGATION
  activateDelegation: (payload) => {
    return api.put(ENDPOINTS.USER.ACTIVATE_DELEGATION, payload);
  },

  // UPDATE DELEGATION
  updateDelegation: (payload) => {
    return api.put(ENDPOINTS.USER.UPDATE_DELEGATION, payload);
  },

  // CHANGE PASSWORD
  changePassword: (payload) => {
    return api.put(ENDPOINTS.USER.CHANGE_PASSWORD, payload);
  },

  // CHECK OLD PASSWORD
  checkOldPassword: (payload) => {
    return api.post(ENDPOINTS.USER.CHECK_OLD_PASSWORD, payload);
  },

  // Logout
  logout: (payload, config) => {
    return api.put(ENDPOINTS.USER.USER_LOGOUT, payload, config);
  },

  // CREATE APP USER
  createAppUser: (payload) => {
    return api.post(ENDPOINTS.USER.CREATE_APP_USER, payload);
  },

  // UPDATE APP USER STATUS
  updateAppUserStatus: (payload) => {
    return api.put(ENDPOINTS.USER.UPDATE_APP_USER_STATUS, payload);
  },

  // GET APP USER TEAM
  getAppUserTeam: (accountId, params, requestConfig = {}) => {
    return api.get(`${ENDPOINTS.USER.GET_APP_USER_TEAM}?AccountID=${accountId}`, { ...requestConfig, params });
  },

  // Get User roles
  getUserRoles: () => {
    return api.get(ENDPOINTS.USER.GET_USER_ROLES);
  },

  // Get Account Departments
  getAccountDepartments: (accountId, params, requestConfig = {}) => {
    return api.get(`${ENDPOINTS.USER.GET_ACCOUNT_DEPARTMENTS}?AccountID=${accountId}`, { ...requestConfig, params });
  },

  // Get Active Account Departments
  getActiveAccountDepartments: (accountId) => {
    return api.get(`${ENDPOINTS.USER.GET_ACCOUNT_DEPARTMENTS}?AccountID=${accountId}&IsActive=${true}`);
  },

  // Update Account Department
  updateAccountDepartment: (payload) => {
    return api.post(ENDPOINTS.USER.UPDATE_ACCOUNT_DEPARTMENT, payload);
  },

  createAccountDepartment: (payload) => {
    return api.post(ENDPOINTS.USER.CREATE_ACCOUNT_DEPARTMENT, payload);
  },

  // GET EMAIL TEMPLATES
  getEmailTemplates: (accountId) => {
    return api.get(`${ENDPOINTS.EMAIL_TEMPLATES.GET_EMAIL_TEMPLATES}?AccountID=${accountId}`);
  },

  // UPDATE EMAIL TEMPLATE STATUS
  updateEmailTemplateStatus: (payload) => {
    return api.patch(ENDPOINTS.EMAIL_TEMPLATES.UPDATE_EMAIL_TEMPLATE_STATUS, payload);
  },

  // DELETE EMAIL TEMPLATE
  deleteEmailTemplate: (templateId) => {
    return api.delete(`${ENDPOINTS.EMAIL_TEMPLATES.DELETE_EMAIL_TEMPLATE}?EmailTemplateID=${templateId}`);
  },

  // CREATE EMAIL TEMPLATE
  createEmailTemplate: (payload) => {
    return api.post(ENDPOINTS.EMAIL_TEMPLATES.CREATE_EMAIL_TEMPLATE, payload);
  },

  // FOLDER MANAGEMENT
  getFolders: (params) => {
    return api.get(ENDPOINTS.FOLDER.GET_FOLDERS, { params });
  },

  getFoldersSharedWithMe: () => {
    return api.get(ENDPOINTS.FOLDER.GET_FOLDERS_SHARED_WITH_ME);
  },

  createFolder: (payload) => {
    return api.post(ENDPOINTS.FOLDER.CREATE_FOLDER, payload);
  },

  updateFolder: (payload) => {
    return api.put(ENDPOINTS.FOLDER.UPDATE_FOLDER, payload);
  },

  deleteFolder: (payload) => {
    return api.delete(ENDPOINTS.FOLDER.DELETE_FOLDER, { data: payload });
  },

  createSubFolder: (payload) => {
    return api.post(ENDPOINTS.FOLDER.CREATE_SUB_FOLDER, payload);
  },

  unshareFolder: (payload) => {
    return api.delete(ENDPOINTS.FOLDER.UNSHARE_FOLDER, { data: payload });
  },

  createDocShared: (payload) => {
    return api.post(ENDPOINTS.FOLDER.CREATE_DOC_SHARED, payload);
  },

  getSubFolderDocs: (subFolderID) => {
    return api.get(`${ENDPOINTS.FOLDER.GET_SUB_FOLDER_DOCS}?SubFolderID=${subFolderID}`);
  },

  removeDocFromSubFolder: (subFolderID, masterDocID) => {
    return api.delete(`${ENDPOINTS.FOLDER.REMOVE_DOC_FROM_SUB_FOLDER}?SubFolderID=${subFolderID}&MasterDocID=${masterDocID}`);
  },

  assignDocToSubFolder: (payload) => {
    return api.post(ENDPOINTS.FOLDER.ASSIGN_DOC_TO_SUB_FOLDER, payload);
  },

  downloadDoc: (signAuth) => {
    return api.get(ENDPOINTS.DOCUMENTS.DOWNLOAD_DOC, {
      headers: {
        SignAuth: signAuth,
      },
    });
  },

  getCompletedMasterDocList: () => {
    return api.get(ENDPOINTS.DOCUMENTS.GET_COMPLETED_MASTER_DOC_LIST);
  },

  shareFolder: (payload) => {
    return api.post(ENDPOINTS.FOLDER.SHARE_FOLDER, payload);
  },

  updateSubFolder: (payload) => {
    return api.put(ENDPOINTS.FOLDER.UPDATE_SUB_FOLDER, payload);
  },

  deleteSubFolder: (payload) => {
    return api.delete(ENDPOINTS.FOLDER.DELETE_SUB_FOLDER, { data: payload });
  },

  getFolderDocsByFolderID: (folderID) => {
    return api.get(`${ENDPOINTS.FOLDER.GET_FOLDER_DOCS}?FolderID=${folderID}`);
  },

  removeDocumentFromFolder: (folderID, masterDocID) => {
    return api.delete(`${ENDPOINTS.FOLDER.REMOVE_DOC_FROM_FOLDER}?FolderID=${folderID}&MasterDocID=${masterDocID}`);
  },

  assignDocToFolder: (payload) => {
    return api.post(ENDPOINTS.FOLDER.ASSIGN_DOC_TO_FOLDER, payload);
  },

  getSubFolder: () => {
    return api.get(ENDPOINTS.FOLDER.GET_SUB_FOLDER);
  },

  // DMS V2 API
  getDmsRootFolders: (params, config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.GET_ROOT_FOLDERS, { params, ...config });
  },

  getDmsFolderTree: (config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.GET_FOLDER_TREE, config);
  },

  getDmsFolderById: (folderId, config = {}) => {
    return dmsApi.get(`${ENDPOINTS.DMS.GET_FOLDER_BY_ID}/${folderId}`, config);
  },

  getDmsFolderChildren: (parentFolderId, config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.GET_FOLDER_CHILDREN, {
      params: { parentFolderId },
      ...config,
    });
  },

  getDmsFolderActivity: (folderId, config = {}) => {
    return dmsApi.get(`${ENDPOINTS.DMS.GET_FOLDER_ACTIVITY}/${folderId}`, config);
  },

  getDmsDocumentActivity: (documentId, config = {}) => {
    return dmsApi.get(`${ENDPOINTS.DMS.GET_FOLDER_ACTIVITY}/${documentId}`, config);
  },

  createDmsFolder: (payload) => {
    return dmsApi.post(ENDPOINTS.DMS.CREATE_FOLDER, payload);
  },

  updateDmsFolder: (folderId, payload) => {
    return dmsApi.put(`${ENDPOINTS.DMS.UPDATE_FOLDER}/${folderId}`, payload);
  },

  moveDmsFolder: (payload) => {
    return dmsApi.put(ENDPOINTS.DMS.MOVE_FOLDER, payload);
  },

  deleteDmsFolder: (folderId) => {
    return dmsApi.delete(`${ENDPOINTS.DMS.DELETE_FOLDER}/${folderId}`);
  },

  getDmsAllDocuments: (config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.GET_ALL_DOCUMENTS, config);
  },

  getDmsDocumentsByFolder: (folderId, config = {}) => {
    return dmsApi.get(`${ENDPOINTS.DMS.GET_DOCUMENTS_BY_FOLDER}/${folderId}`, config);
  },

  getDmsDocumentById: (documentId) => {
    return dmsApi.get(`${ENDPOINTS.DMS.GET_DOCUMENT_BY_ID}/${documentId}`);
  },

  uploadDmsDocument: (formData, config = {}) => {
    return dmsApi.post(ENDPOINTS.DMS.UPLOAD_DOCUMENT, formData, config);
  },

  uploadDmsDocumentsBulk: (formData, config = {}) => {
    return dmsApi.post(ENDPOINTS.DMS.UPLOAD_DOCUMENT_BULK, formData, config);
  },

  updateDmsDocument: (documentId, payload) => {
    return dmsApi.put(`${ENDPOINTS.DMS.UPDATE_DOCUMENT}/${documentId}`, payload);
  },

  moveDmsDocument: (payload) => {
    return dmsApi.put(ENDPOINTS.DMS.MOVE_DOCUMENT, payload);
  },

  downloadDmsDocument: (documentId, config = {}) => {
    return dmsApi.get(`${ENDPOINTS.DMS.DOWNLOAD_DOCUMENT}/${documentId}/download`, {
      responseType: "blob",
      ...config,
    });
  },

  deleteDmsDocument: (documentId) => {
    return dmsApi.delete(`${ENDPOINTS.DMS.DELETE_DOCUMENT}/${documentId}`);
  },

  downloadDmsFolderZip: (folderId, config = {}) => {
    return dmsApi.get(`${ENDPOINTS.DMS.DOWNLOAD_FOLDER_ZIP}/${folderId}/download-zip`, {
      responseType: "blob",
      ...config,
    });
  },

  getDmsMyStorage: (config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.GET_MY_STORAGE, config);
  },

  getDmsAllUsersStorage: () => {
    return dmsApi.get(ENDPOINTS.DMS.GET_ALL_USERS_STORAGE);
  },

  getDmsUserStorage: (email) => {
    return dmsApi.get(`${ENDPOINTS.DMS.GET_USER_STORAGE}/${encodeURIComponent(email)}/storage`);
  },

  createFolderShare: (payload) => {
    return dmsApi.post(ENDPOINTS.DMS.FOLDER_SHARES.CREATE, payload);
  },

  getFolderShares: (folderId) => {
    return dmsApi.get(`${ENDPOINTS.DMS.FOLDER_SHARES.GET_BY_FOLDER}/${folderId}`);
  },

  getDmsSharedWithUsers: (config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.FOLDER_SHARES.GET_SHARED_WITH_USERS, config);
  },

  getDmsSharedWithOthers: (config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.FOLDER_SHARES.GET_SHARED_WITH_OTHERS, config);
  },

  updateFolderShare: (shareId, payload) => {
    return dmsApi.put(`${ENDPOINTS.DMS.FOLDER_SHARES.UPDATE}/${shareId}`, payload);
  },

  deleteFolderShare: (shareId) => {
    return dmsApi.delete(`${ENDPOINTS.DMS.FOLDER_SHARES.DELETE}/${shareId}`);
  },

  createDocumentShare: (payload) => {
    return dmsApi.post(ENDPOINTS.DMS.DOCUMENT_SHARES.CREATE, payload);
  },

  getDocumentShares: (documentId) => {
    return dmsApi.get(`${ENDPOINTS.DMS.DOCUMENT_SHARES.GET_BY_DOCUMENT}/${documentId}`);
  },

  getDmsDocumentsSharedWithMe: (config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.DOCUMENT_SHARES.GET_SHARED_WITH_ME, config);
  },

  getDmsDocumentsSharedWithOthers: (config = {}) => {
    return dmsApi.get(ENDPOINTS.DMS.DOCUMENT_SHARES.GET_SHARED_WITH_OTHERS, config);
  },

  updateDocumentShare: (shareId, payload) => {
    return dmsApi.put(`${ENDPOINTS.DMS.DOCUMENT_SHARES.UPDATE}/${shareId}`, payload);
  },

  deleteDocumentShare: (shareId) => {
    return dmsApi.delete(`${ENDPOINTS.DMS.DOCUMENT_SHARES.DELETE}/${shareId}`);
  },

  // Get App User Data (Admin)
  getAppUserData: (appUserID) => {
    return api.get(`${ENDPOINTS.USER.GET_APP_USER_DATA}?AppUserID=${appUserID}`);
  },
};

export default userService;
