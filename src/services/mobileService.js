import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const mobileService = {
  // Get register sign data
  getRegisterSignData: (signAuth) => {
    return api.get(ENDPOINTS.MOBILE.GET_REGISTER_SIGN_DATA, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get controls
  getControls: (signAuth) => {
    return api.get(ENDPOINTS.MOBILE.GET_CONTROLS, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get master document pages
  getMasterDocPages: (masterDocID, signAuth) => {
    return api.get(`${ENDPOINTS.MOBILE.GET_MASTER_DOC_PAGES}?MasterDocID=${masterDocID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Delete master document pages
  deleteMasterDocPages: (payload, signAuth) => {
    return api.put(ENDPOINTS.MOBILE.DELETE_MASTER_DOC_PAGES, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update master document pages ordering
  updateMasterDocPagesOrdering: (payload, signAuth) => {
    return api.put(ENDPOINTS.MOBILE.UPDATE_MASTER_DOC_PAGES_ORDERING, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Create controls location
  createControlsLocation: (payload, signAuth) => {
    return api.post(ENDPOINTS.MOBILE.CREATE_CONTROLS_LOCATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get controls location
  getControlsLocation: (masterDocID, signAuth) => {
    return api.get(`${ENDPOINTS.MOBILE.GET_CONTROLS_LOCATION}?MasterDocID=${masterDocID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update controls location
  updateControlsLocation: (payload, signAuth) => {
    return api.put(ENDPOINTS.MOBILE.UPDATE_CONTROLS_LOCATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update QR Code details
  updateQRCodeDetails: (payload, signAuth) => {
    return api.put(ENDPOINTS.MOBILE.UPDATE_QR_CODE_DETAILS, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Delete controls location
  deleteControlsLocation: (controlLocationID, signAuth) => {
    return api.delete(`${ENDPOINTS.MOBILE.DELETE_CONTROLS_LOCATION}?ControlLocationID=${controlLocationID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get template data
  getTemplateData: (signAuth) => {
    return api.get(ENDPOINTS.MOBILE.GET_TEMPLATE_DATA, {
      headers: { SignAuth: signAuth },
    });
  },

  // Create template controls location
  createTemplateControlsLocation: (payload, signAuth) => {
    return api.post(ENDPOINTS.MOBILE.CREATE_TEMPLATE_CONTROLS_LOCATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Get template controls location
  getTemplateControlsLocation: (masterDocID, signAuth) => {
    return api.get(`${ENDPOINTS.MOBILE.GET_TEMPLATE_CONTROLS_LOCATION}?MasterDocID=${masterDocID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Update template controls location
  updateTemplateControlsLocation: (payload, signAuth) => {
    return api.put(ENDPOINTS.MOBILE.UPDATE_TEMPLATE_CONTROLS_LOCATION, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Delete template controls location
  deleteTemplateControlsLocation: (templateControlLocationID, signAuth) => {
    return api.delete(`${ENDPOINTS.MOBILE.DELETE_TEMPLATE_CONTROLS_LOCATION}?TemplateControlLocationID=${templateControlLocationID}`, {
      headers: { SignAuth: signAuth },
    });
  },

  // Apply controls location on all pages
  applyControlsLocationOnAllPages: (payload, signAuth) => {
    return api.post(ENDPOINTS.MOBILE.APPLY_CONTROLS_LOCATION_ON_ALL_PAGES, payload, {
      headers: { SignAuth: signAuth },
    });
  },

  // Apply template controls location on all pages
  applyTemplateControlsLocationOnAllPages: (payload, signAuth) => {
    return api.post(ENDPOINTS.MOBILE.APPLY_TEMPLATE_CONTROLS_LOCATION_ON_ALL_PAGES, payload, {
      headers: { SignAuth: signAuth },
    });
  },
};

export default mobileService;
