import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api.js';

// Store reference to queryClient for cache clearing
let queryClientRef = null;

export const setQueryClient = (client) => {
  queryClientRef = client;
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      login: async (credentials) => {
        // Clear any existing cache before login
        if (queryClientRef) {
          queryClientRef.clear();
        }
        const { data } = await api.post('/auth/login', credentials);
        set({ user: data.user, tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken } });
        return data;
      },
      signup: async (userData) => {
        // Clear any existing cache before signup
        if (queryClientRef) {
          queryClientRef.clear();
        }
        const { data } = await api.post('/auth/register', userData);
        // After signup, automatically log them in
        const loginData = await api.post('/auth/login', { email: userData.email, password: userData.password });
        set({ user: loginData.data.user, tokens: { accessToken: loginData.data.accessToken, refreshToken: loginData.data.refreshToken } });
        return loginData.data;
      },
      logout: () => {
        // Clear React Query cache
        if (queryClientRef) {
          queryClientRef.clear();
        }
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

