import api from "@/Api/api";
import { ENDPOINTS } from "@/Constants/endpoints";

const staticToken = process.env.REACT_APP_STATIC_TOKEN;

const authService = {
  login: (email, password) => {
    return api.post(ENDPOINTS.AUTH.LOGIN, { Email: email, Password: password }, { headers: { Authorization: `Bearer ${staticToken}` } });
  },

  verifyOtp: (payload) => {
    return api.post(ENDPOINTS.AUTH.VERIFY_OTP, payload, { headers: { Authorization: `Bearer ${staticToken}` } });
  },

  signup: (payload) => {
    return api.post(ENDPOINTS.AUTH.SIGNUP, payload, { headers: { Authorization: `Bearer ${staticToken}` } });
  },

  forgotPassword: (email) => {
    return api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { EmailID: email }, { headers: { Authorization: `Bearer ${staticToken}` } });
  },

  checkResetLinkExpiry: (signAuth) => {
    return api.get(ENDPOINTS.AUTH.CHECK_RESET_LINK, {
      headers: { SignAuth: signAuth },
    });
  },

  changePassword: (payload, signAuth) => {
    return api.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload, {
      headers: { SignAuth: signAuth },
    });
  },
};

export default authService;
