import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const pricingService = {
  // Get Packages
  getPackages: () => {
    return api.get(ENDPOINTS.PRICING.GET_PACKAGES);
  },
};

export default pricingService;
