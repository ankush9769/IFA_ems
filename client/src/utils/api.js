import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const defaultBaseUrl = isLocalhost
  ? 'http://localhost:5000/api'
  : 'https://ifa-ems-1-thebackend-server.onrender.com/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

