import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const integrationService = {
  // Get auth integration
  getIntegrationAuth: () => {
    return api.get(ENDPOINTS.INTEGRATION.GET_INTEGRATION_AUTH);
  },

  //   Update auth integration
  updateIntegrationAuth: (payload) => {
    return api.put(ENDPOINTS.INTEGRATION.UPDATE_INTEGRATION_AUTH, payload);
  },

  //   Delete auth integration
  deleteIntegrationAuth: (authID) => {
    return api.delete(`${ENDPOINTS.INTEGRATION.DELETE_INTEGRATION_AUTH}?integrationAuthID=${authID}`);
  },

  //   Create auth integration
  createIntegrationAuth: (payload) => {
    return api.post(ENDPOINTS.INTEGRATION.CREATE_INTEGRATION_AUTH, payload);
  },

  //   Get integration config
  getIntegrationConfig: () => {
    return api.get(ENDPOINTS.INTEGRATION.GET_INTEGRATION_AUTH_CONFIG);
  },

  //   Create webhook integration
  createWebhookIntegration: (payload) => {
    return api.post(ENDPOINTS.INTEGRATION.CREATE_WEBHOOK_INTEGRATION, payload);
  },

  //   Get webhook integration
  getWebhookIntegration: (accountID) => {
    return api.get(`${ENDPOINTS.INTEGRATION.GET_WEBHOOK_INTEGRATION}?AccountID=${accountID}`);
  },

  // Update webhook integration
  updateWebhookIntegration: (payload) => {
    return api.put(ENDPOINTS.INTEGRATION.UPDATE_WEBHOOK_INTEGRATION, payload);
  },

  // Update webhook integration status
  updateWebhookIntegrationStatus: (payload) => {
    return api.put(ENDPOINTS.INTEGRATION.UPDATE_WEBHOOK_INTEGRATION_STATUS, payload);
  },

  // Generate document manually
  generateDocumentManually: (payload) => {
    return api.post(ENDPOINTS.GENERATE_DOCUMENTS.GENERATE_DOCUMENT_MANUALLY, payload);
  },

  // Get non AI text document
  getNonAITextDocument: () => {
    return api.get(ENDPOINTS.GENERATE_DOCUMENTS.GET_NON_AITEXT_DOCUMENT);
  },

  // Get AI text document
  getAITextDocument: () => {
    return api.get(ENDPOINTS.GENERATE_DOCUMENTS.GET_AI_TEXT_DOCUMENT);
  },

  // Generate AI text document
  generateAITextDocument: (payload) => {
    return api.post(ENDPOINTS.GENERATE_DOCUMENTS.GENERATE_AI_TEXT_DOCUMENT, payload, {
      skipSessionExpiryRedirect: true,
      suppressGlobalErrorToast: true,
    });
  },

  // Generate AI text
  generateAIText: (payload) => {
    return api.post(ENDPOINTS.GENERATE_DOCUMENTS.GENERATE_AI_TEXT, payload, {
      skipSessionExpiryRedirect: true,
      suppressGlobalErrorToast: true,
    });
  },

  // Get Account SMS Config
  getAccountSMSConfig: (accountID) => {
    return api.get(`${ENDPOINTS.INTEGRATION.GET_ACCOUNT_SMS_CONFIG}?accountID=${accountID}`);
  },

  // Create Account SMS Config
  createAccountSMSConfig: (payload) => {
    return api.post(ENDPOINTS.INTEGRATION.CREATE_ACCOUNT_SMS_CONFIG, payload);
  },
};

export default integrationService;
