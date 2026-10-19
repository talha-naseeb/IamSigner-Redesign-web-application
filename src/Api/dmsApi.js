import axios from "axios";
import { apiHandlers } from "./apiHandlers";

const dmsApi = axios.create({
  baseURL: process.env.REACT_APP_DMS_API_BASE_URL,
});

apiHandlers(dmsApi);

export default dmsApi;
