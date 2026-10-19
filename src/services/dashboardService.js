import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const dashboardService = {
  // Get Pending Signatories List (Pending with Me)
  getPendingSignatoriesList: (params, config) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_PENDING_SIGNATORIES_LIST, { params, ...config });
  },

  // Get Pending Master Doc List (Pending with Others)
  getPendingMasterDocList: (params, config) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_PENDING_MASTER_DOC_LIST, { params, ...config });
  },

  // Get Not Started Signatories (for changing sign order)
  getNotStartedSignatories: (registerSignID) => {
    return api.get(`${ENDPOINTS.DASHBOARD.GET_NOT_STARTED_SIGNATORIES}?RegisterSignID=${registerSignID}`);
  },

  // Send Reminder Email (Resend Notification)
  reminderEmail: (headers) => {
    return api.get(ENDPOINTS.DASHBOARD.REMINDER_EMAIL, { headers });
  },

  // Create Document Ownership (Transfer Ownership)
  createDocumentOwnership: (data) => {
    return api.post(ENDPOINTS.DASHBOARD.CREATE_DOCUMENT_OWNERSHIP, data);
  },

  // Recall Signature
  recallSignature: (data) => {
    return api.put(ENDPOINTS.DASHBOARD.RECALL_SIGNATURE, data);
  },

  // Update Signatory After Workflow Initiation
  updateSignatoryAfterWorkflowInitiation: (data) => {
    return api.post(ENDPOINTS.DASHBOARD.UPDATE_SIGNATORY_AFTER_WORKFLOW_INITIATION, data);
  },

  // Get Completed Master Doc List
  getCompletedMasterDocList: (params) => {
    return api.get(ENDPOINTS.DOCUMENTS.GET_COMPLETED_MASTER_DOC_LIST, { params });
  },

  // Get Register Sign Declined (Declined Docs)
  getRegisterSignDeclined: (params) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_REGISTER_SIGN_DECLINED, { params });
  },

  // Get Register Sign Draft List
  getRegisterSignDraftList: (params) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_REGISTER_SIGN_DRAFT_LIST, { params });
  },

  // Get Docs By Register Sign ID
  getDocsByRegisterSignID: (registerSignID) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_DOCS_BY_REGISTER_SIGN_ID, { params: { RegisterSignID: registerSignID } });
  },

  // Change Doc Status To InActive
  changeDocStatusInActive: (data) => {
    return api.put(ENDPOINTS.DASHBOARD.CHANGE_DOC_STATUS_INACTIVE, data);
  },

  // Get Register Sign InActive
  getRegisterSignInActive: (params) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_REGISTER_SIGN_INACTIVE, { params });
  },

  // Get Recalled Documents
  getRecalledDocuments: (params) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_RECALLED_DOCUMENTS, { params });
  },

  // Get Doc Shared With Me List
  getDocSharedWithMeList: (params) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_DOC_SHARED_WITH_ME_LIST, { params });
  },

  // Get Doc Shared With Others List
  getDocSharedWithOthersList: (params) => {
    return api.get(ENDPOINTS.DASHBOARD.GET_DOC_SHARED_WITH_OTHERS_LIST, { params });
  },

  // Get Signature Order
  getSignatureOrder: (masterDocID) => {
    return api.get(`${ENDPOINTS.DASHBOARD.GET_SIGNATURE_ORDER}?MasterDocID=${masterDocID}`);
  },
};

export default dashboardService;
