import { API_STATUS } from "@/Constants/apiStatuses";
import { handleSessionExpiry, handleResponseError } from "./errorHandler";

export const apiHandlers = (axiosInstance) => {
  // request interceptor
  const requestInterceptor = axiosInstance.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // response interceptor
  const responseInterceptor = axiosInstance.interceptors.response.use(
    (response) => {
      // Handle business logic status codes returned with 200 OK
      const businessStatus = response.data?.statusCode;
      if (businessStatus !== undefined && businessStatus !== null) {
        const statusCode = String(businessStatus);

        switch (statusCode) {
          case API_STATUS.SUCCESS:
            break;

          case API_STATUS.EXPIRED: {
            if (response.config?.skipSessionExpiryRedirect !== true) {
              handleSessionExpiry();
            }
            // Reject so callers don't run success logic with an expired-session payload
            const sessionError = new Error("Session expired");
            sessionError.response = response;
            return Promise.reject(sessionError);
          }

          default:
            break;
        }
      }
      return response;
    },
    (error) => {
      return handleResponseError(error);
    }
  );

  return () => {
    axiosInstance.interceptors.request.eject(requestInterceptor);
    axiosInstance.interceptors.response.eject(responseInterceptor);
  };
};
