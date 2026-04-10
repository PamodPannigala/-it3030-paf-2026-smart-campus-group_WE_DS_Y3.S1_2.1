import axios from 'axios';

const rawOrigin = import.meta.env.VITE_API_ORIGIN || '';
export const API_ORIGIN = rawOrigin.replace(/\/+$/, '');
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (API_ORIGIN ? `${API_ORIGIN}/api` : '/api');
export const OAUTH_LOGIN_URL = API_ORIGIN
  ? `${API_ORIGIN}/oauth2/authorization/google`
  : '/oauth2/authorization/google';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
