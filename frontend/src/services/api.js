import axios from 'axios';

export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || '';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const OAUTH_LOGIN_URL = `${API_ORIGIN}/oauth2/authorization/google`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
