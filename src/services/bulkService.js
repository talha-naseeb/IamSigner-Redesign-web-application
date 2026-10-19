import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const bulkService = {
  // Get Bulk Documents
  getBulkDocuments: (params) => {
    return api.get(ENDPOINTS.BULK.GET_BULK_DOCUMENTS, { params });
  },

  // Download Bulk CSV Docs
  downloadBulkCSVDocs: (params) => {
    return api.get(ENDPOINTS.BULK.DOWNLOAD_BULK_CSV_DOCS, {
      params,
      responseType: "arraybuffer",
    });
  },

  // Get Bulk Signatories
  getBulkSignatories: (registerSignID, masterDocID) => {
    return api.get(`${ENDPOINTS.BULK.GET_BULK_SIGNATORIES}?RegisterSignID=${registerSignID}&MasterDocID=${masterDocID}`);
  },

  
};

export default bulkService;
