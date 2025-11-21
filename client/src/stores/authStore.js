import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api.js';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        set({ user: data.user, tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken } });
        return data;
      },
      signup: async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        // After signup, automatically log them in
        const loginData = await api.post('/auth/login', { email: userData.email, password: userData.password });
        set({ user: loginData.data.user, tokens: { accessToken: loginData.data.accessToken, refreshToken: loginData.data.refreshToken } });
        return loginData.data;
      },
      logout: () => {
        set({ user: null, tokens: null });
        // Clear localStorage
        localStorage.removeItem('ifa-ems-auth');
        // Clear all cached data
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to landing page
        window.location.href = '/';
      },
    }),
    { name: 'ifa-ems-auth' },
  ),
);

