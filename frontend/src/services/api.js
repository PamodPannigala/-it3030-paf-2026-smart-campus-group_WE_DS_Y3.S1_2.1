import axios from "axios";

// Get env values
const rawOrigin = import.meta.env.VITE_API_ORIGIN || "";

// Remove trailing slash (if any)
export const API_ORIGIN = rawOrigin.replace(/\/+$/, "");

// Build base URLs
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (API_ORIGIN ? `${API_ORIGIN}/api` : "/api");

export const OAUTH_LOGIN_URL = API_ORIGIN
  ? `${API_ORIGIN}/oauth2/authorization/google`
  : "/oauth2/authorization/google";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // important for cookies / auth
});

export default api;
