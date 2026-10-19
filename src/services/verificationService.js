import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const verificationService = {
  // Add Supporting Docs Verification
  addSupportingDocsVerification: (payload, signAuth) => {
    return api.post(ENDPOINTS.VERIFICATION.ADD_SUPPORTING_DOCS_VERIFICATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Create Doc Comments Verification
  createDocCommentsVerification: (payload, signAuth) => {
    return api.post(ENDPOINTS.VERIFICATION.CREATE_DOC_COMMENTS_VERIFICATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Create Sign Activity Verification
  createSignActivityVerification: (payload, signAuth) => {
    return api.post(ENDPOINTS.VERIFICATION.CREATE_SIGN_ACTIVITY_VERIFICATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Delete Doc Comments Verification
  deleteDocCommentsVerification: (payload, signAuth) => {
    return api.put(ENDPOINTS.VERIFICATION.DELETE_DOC_COMMENTS_VERIFICATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update Doc Comments Verification
  updateDocCommentsVerification: (payload, signAuth) => {
    return api.put(ENDPOINTS.VERIFICATION.UPDATE_DOC_COMMENTS_VERIFICATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Supporting Doc And Doc Comments Verification
  getSupportingDocAndDocCommentsVerification: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_SUPPORTING_DOC_AND_DOC_COMMENTS_VERIFICATION, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Sign Audit Status Completed
  getSignAuditStatusCompleted: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_SIGN_AUDIT_STATUS_COMPLETED, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Control Location Completed
  getControlLocationCompleted: (masterDocID, signAuth) => {
    return api.get(`${ENDPOINTS.VERIFICATION.GET_CONTROL_LOCATION_COMPLETED}?MasterDocID=${masterDocID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Master Doc Pages Completed
  getMasterDocPagesCompleted: (masterDocID, signAuth) => {
    return api.get(`${ENDPOINTS.VERIFICATION.GET_MASTER_DOC_PAGES_COMPLETED}?MasterDocID=${masterDocID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Register Sign Data Completed
  getRegisterSignDataCompleted: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_REGISTER_SIGN_DATA_COMPLETED, {
      headers: { SignAuth: signAuth },
    });
  },

  // Download Doc (Verification)
  downloadDocVerification: (signAuth) => {
    return api.get(ENDPOINTS.DOCUMENTS.DOWNLOAD_DOC, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Control Location Verification
  getControlLocationVerification: (masterDocID, signAuth) => {
    return api.get(`${ENDPOINTS.VERIFICATION.GET_CONTROL_LOCATION_VERIFICATION}?MasterDocID=${masterDocID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Master Doc Pages Verification
  getMasterDocPagesVerification: (masterDocID, signAuth) => {
    return api.get(`${ENDPOINTS.VERIFICATION.GET_MASTER_DOC_PAGES_VERIFICATION}?MasterDocID=${masterDocID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Register Sign Data Verification
  getRegisterSignDataVerification: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_REGISTER_SIGN_DATA_VERIFICATION, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Register Sign Permission Verification
  getRegisterSignPermissionVerification: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_REGISTER_SIGN_PERMISSION_VERIFICATION, {
      headers: { SignAuth: signAuth },
    });
  },

  // Change Doc Status Declined
  changeDocStatusDeclined: (data, signAuth) => {
    return api.put(ENDPOINTS.VERIFICATION.CHANGE_DOC_STATUS_DECLINED, data, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update Control Location Signature
  updateControlLocationSignature: (data, signAuth) => {
    return api.put(ENDPOINTS.VERIFICATION.UPDATE_CONTROL_LOCATION_SIGNATURE, data, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update Viewed Signatory Status
  updateViewedSignatoryStatus: (data, signAuth) => {
    return api.put(ENDPOINTS.VERIFICATION.UPDATE_VIEWED_SIGNATORY_STATUS, data, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Signature Stamp Verification
  getSignatureStampVerification: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_SIGNATURE_STAMP_VERIFICATION, {
      headers: { SignAuth: signAuth },
    });
  },

  // Check Master Doc Password
  checkMasterDocPassword: (data, signAuth) => {
    return api.post(ENDPOINTS.VERIFICATION.CHECK_MASTER_DOC_PASSWORD, data, {
      headers: { SignAuth: signAuth },
    });
  },

  // Check Signatory Password
  checkSignatoryPassword: (data, signAuth) => {
    return api.post(ENDPOINTS.VERIFICATION.CHECK_SIGNATORY_PASSWORD, data, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update Text Editor
  updateTextEditor: (data, signAuth) => {
    return api.put(ENDPOINTS.VERIFICATION.UPDATE_TEXT_EDITOR, data, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Audit Trail (Dynamic URL)
  getAuditTrail: (url, signAuth) => {
    return api.get(url, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get AI Text For Page
  getAITextForPage: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_AI_TEXT_FOR_PAGE, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Sign Audit Status Verification
  getSignAuditStatusVerification: (signAuth) => {
    return api.get(ENDPOINTS.VERIFICATION.GET_SIGN_AUDIT_STATUS_VERIFICATION, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get Master Doc Pages Controls
  getMasterDocPagesControls: (masterDocPagesID, signAuth) => {
    return api.get(`${ENDPOINTS.VERIFICATION.GET_MASTER_DOC_PAGES_CONTROLS}?MasterDocPagesID=${masterDocPagesID}`, {
      headers: { SignAuth: signAuth },
    });
  },
};

export default verificationService;
