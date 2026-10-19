import axios from "axios";
import { apiHandlers } from "./apiHandlers";

// Use environment variable for API base URL
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
});


apiHandlers(api);

export default api;
