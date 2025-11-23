import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ifa-ems-1-thebackend-server.onrender.com/api',
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

