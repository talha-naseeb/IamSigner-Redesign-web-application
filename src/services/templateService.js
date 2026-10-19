import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const templateService = {
  // Get template data
  getTemplateData: (templateID) => {
    return api.get(`${ENDPOINTS.TEMPLATES.GET_TEMPLATE_DATA}?TemplateID=${templateID}`);
  },

  // Create template doc
  createTemplateDoc: (payload) => {
    return api.post(ENDPOINTS.TEMPLATES.CREATE_TEMPLATE_DOC, payload);
  },

  // Get all templates
  getAllTemplates: (params) => {
    return api.get(ENDPOINTS.TEMPLATES.GET_ALL_TEMPLATES, { params });
  },

  // Delete template
  deleteTemplate: (templateID, data) => {
    return api.delete(`${ENDPOINTS.TEMPLATES.DELETE_TEMPLATE}?TemplateID=${templateID}`, { data });
  },

  // Deactivate template
  deactivateTemplate: (templateID) => {
    return api.put(ENDPOINTS.TEMPLATES.DEACTIVATE_TEMPLATE, null, { params: { TemplateID: templateID } });
  },

  // Activate template
  activateTemplate: (templateID) => {
    return api.put(ENDPOINTS.TEMPLATES.ACTIVATE_TEMPLATE, null, { params: { TemplateID: templateID } });
  },

  // Update template
  updateTemplate: (payload) => {
    return api.put(ENDPOINTS.TEMPLATES.UPDATE_TEMPLATE, payload);
  },

  // Create bulk template signatories
  createBulkTemplateSignatories: (payload) => {
    return api.post(ENDPOINTS.TEMPLATES.CREATE_BULK_TEMPLATE_SIGNATORIES, payload);
  },

  // Delete template signatory
  deleteTemplateSignatory: (payload) => {
    return api.put(ENDPOINTS.TEMPLATES.DELETE_TEMPLATE_SIGNATORY, payload);
  },

  // Create template controls location
  createTemplateControlsLocation: (payload) => {
    return api.post(ENDPOINTS.TEMPLATES.CREATE_TEMPLATE_CONTROLS_LOCATION, payload);
  },

  // Update template controls location
  updateTemplateControlsLocation: (payload) => {
    return api.put(ENDPOINTS.TEMPLATES.UPDATE_TEMPLATE_CONTROLS_LOCATION, payload);
  },

  // Delete template controls location
  deleteTemplateControlsLocation: (templateControlLocationID) => {
    return api.delete(`${ENDPOINTS.TEMPLATES.DELETE_TEMPLATE_CONTROLS_LOCATION}?TemplateControlLocationID=${templateControlLocationID}`);
  },

  // Get template controls location
  getTemplateControlsLocation: (masterDocID) => {
    return api.get(`${ENDPOINTS.TEMPLATES.GET_TEMPLATE_CONTROLS_LOCATION}?MasterDocID=${masterDocID}`);
  },

  // Update template QR code details
  updateTemplateQRCodeDetails: (payload) => {
    return api.put(ENDPOINTS.TEMPLATES.UPDATE_TEMPLATE_QR_CODE_DETAILS, payload);
  },

  // Apply template controls location on all pages
  applyTemplateControlsLocationOnAllPages: (payload) => {
    return api.post(ENDPOINTS.TEMPLATES.APPLY_TEMPLATE_CONTROLS_LOCATION_ON_ALL_PAGES, payload);
  },
};

export default templateService;
