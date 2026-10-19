import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const uploadFlowService = {
  // Get register sign data
  getRegisterSignData: (registerSignID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_REGISTER_SIGN_DATA}?RegisterSignID=${registerSignID}`);
  },

  // Get master document pages
  getMasterDocPages: (masterDocID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_MASTER_DOC_PAGES}?MasterDocID=${masterDocID}`);
  },

  // Delete master document
  deleteMasterDoc: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.DELETE_MASTER_DOC, payload);
  },

  // Update register details
  updateRegisterDetails: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_REGISTER_DETAILS, payload);
  },

  // Create controls location bulk
  createControlsLocationBulk: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.CREATE_CONTROLS_LOCATION_BULK, payload);
  },

  // Get distinct controls location
  getDistinctControlsLocation: (registerSignID, masterDocID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_DISTINCT_CONTROLS_LOCATION}?RegisterSignID=${registerSignID}&MasterDocID=${masterDocID}`);
  },

  // Update controls location bulk
  updateControlsLocationBulk: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_CONTROLS_LOCATION_BULK, payload);
  },

  // Delete controls location bulk
  deleteControlsLocationBulk: (bulkID) => {
    return api.delete(`${ENDPOINTS.UPLOAD_FLOW.DELETE_CONTROLS_LOCATION_BULK}?BulkID=${bulkID}`);
  },

  // Update QR code details
  updateQRCodeDetails: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_QR_CODE_DETAILS, payload);
  },

  // Apply controls location on all pages bulk
  applyControlsLocationOnAllPagesBulk: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.APPLY_CONTROLS_LOCATION_ON_ALL_PAGES_BULK, payload);
  },

  // Get controls
  getControls: () => {
    return api.get(ENDPOINTS.UPLOAD_FLOW.GET_CONTROLS);
  },

  // Get register sign permission
  getRegisterSignPermission: () => {
    return api.get(ENDPOINTS.UPLOAD_FLOW.GET_REGISTER_SIGN_PERMISSION);
  },

  // Get register sign notification setting
  getRegisterSignNotificationSetting: () => {
    return api.get(ENDPOINTS.UPLOAD_FLOW.GET_REGISTER_SIGN_NOTIFICATION_SETTING);
  },

  // Upload supporting document
  uploadSupportingDoc: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.UPLOAD_SUPPORTING_DOC, payload);
  },

  // Get single supporting document
  getSingleSupportingDoc: (supportingDocID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_SINGLE_SUPPORTING_DOC}?SupportingDocID=${supportingDocID}`);
  },

  // Create document comments
  createDocComments: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.CREATE_DOC_COMMENTS, payload);
  },

  // Update document comments
  updateDocComments: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_DOC_COMMENTS, payload);
  },

  // Send and sign
  sendAndSign: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.SEND_AND_SIGN, payload);
  },

  // Create workflow activity
  createWorkflowActivity: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.CREATE_WORKFLOW_ACTIVITY, payload);
  },

  // Upsert register sign permission
  upsertRegisterSignPermission: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.UPSERT_REGISTER_SIGN_PERMISSION, payload);
  },

  // Copy to
  copyTo: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.COPY_TO, payload);
  },

  // Get supporting documents
  getSupportingDocs: (registerSignID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_SUPPORTING_DOCS}?RegisterSignID=${registerSignID}`);
  },

  // Delete supporting document
  deleteSupportingDoc: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.DELETE_SUPPORTING_DOC, payload);
  },

  // Get document comments
  getDocComments: (registerSignID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_DOC_COMMENTS}?RegisterSignID=${registerSignID}`);
  },

  // Delete document comments
  deleteDocComments: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.DELETE_DOC_COMMENTS, payload);
  },

  // Upsert register sign notification setting
  upsertRegisterSignNotificationSetting: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.UPSERT_REGISTER_SIGN_NOTIFICATION_SETTING, payload);
  },

  // Delete signatories from CSV
  deleteSignatoriesFromCSV: (registerSignID) => {
    return api.delete(`${ENDPOINTS.UPLOAD_FLOW.DELETE_SIGNATORIES_FROM_CSV}?RegisterSignID=${registerSignID}`);
  },

  // Create bulk signatory from CSV
  createBulkSignatoryFromCSV: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.CREATE_BULK_SIGNATORY_FROM_CSV, payload);
  },

  // Register documents
  registerDocs: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.REGISTER_DOCUMENTS, payload);
  },

  // Create bulk signatory
  createBulkSignatory: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.CREATE_BULK_SIGNATORY, payload);
  },

  // Create self sign activity
  createSelfSignActivity: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.CREATE_SELF_SIGN_ACTIVITY, payload);
  },

  // Get controls location for self signature
  getControlsLocationSelf: (masterDocID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_CONTROLS_LOCATION_SELF}?MasterDocID=${masterDocID}`);
  },

  // Update control location for self signature
  updateControlLocationSelf: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_CONTROL_LOCATION_SELF, payload);
  },

  // Update self text editor
  updateSelfTextEditor: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_SELF_TEXT_EDITOR, payload);
  },

  // Is password protected
  isPasswordProtected: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.IS_PASSWORD_PROTECTED, payload);
  },

  // Get lookups
  getLookups: (lookupType) => {
    return api.get(`${ENDPOINTS.GENERAL.GET_LOOKUPS}?LookupType=${lookupType}`);
  },

  // Get adhock users
  getAdhockUsers: () => {
    return api.get(ENDPOINTS.GENERAL.GET_ADHOCK_USERS);
  },

  // Get sign workflow activity
  getSignWorkFlowActivity: (registerSignID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_SIGN_WORKFLOW_ACTIVITY}?RegisterSignID=${registerSignID}`);
  },

  // Delete Signatory
  deleteSignatory: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.DELETE_SIGNATORY, payload);
  },

  // Get templates
  getTemplates: () => {
    return api.get(ENDPOINTS.UPLOAD_FLOW.GET_TEMPLATES);
  },

  // Apply template
  applyTemplate: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.APPLY_TEMPLATE, payload);
  },

  // Remove template
  removeTemplate: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.REMOVE_TEMPLATE, payload);
  },

  // Create controls location
  createControlsLocation: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.CREATE_CONTROLS_LOCATION, payload);
  },

  // Get controls location
  getControlsLocation: (masterDocID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_CONTROLS_LOCATION}?MasterDocID=${masterDocID}`);
  },

  // Update controls location
  updateControlsLocation: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_CONTROLS_LOCATION, payload);
  },

  // Delete controls location
  deleteControlsLocation: (controlLocationID) => {
    return api.delete(`${ENDPOINTS.UPLOAD_FLOW.DELETE_CONTROLS_LOCATION}?ControlLocationID=${controlLocationID}`);
  },

  // Get self signature stamp
  getSelfSignatureStamp: (signatoryID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.GET_SELF_SIGNATURE_STAMP}?SignatoryID=${signatoryID}`);
  },

  // Download supporting document
  downloadSupportingDocs: (registerSignID) => {
    return api.get(`${ENDPOINTS.UPLOAD_FLOW.DOWNLOAD_SUPPORTING_DOC}?RegisterSignID=${registerSignID}`, {
      responseType: "arraybuffer", // Important for downloading files
    });
  },

  // Apply controls location on all pages
  applyControlsLocationOnAllPages: (payload) => {
    return api.post(ENDPOINTS.UPLOAD_FLOW.APPLY_CONTROLS_LOCATION_ON_ALL_PAGES, payload);
  },

  // Delete master doc pages
  deleteMasterDocPages: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.DELETE_MASTER_DOC_PAGES, payload);
  },

  // Update master doc pages ordering
  updateMasterDocPagesOrdering: (payload) => {
    return api.put(ENDPOINTS.UPLOAD_FLOW.UPDATE_MASTER_DOC_PAGES_ORDERING, payload);
  },
};

export default uploadFlowService;
