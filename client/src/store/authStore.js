import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const res = await api.get('/auth/me');
      if (res.data.success) {
        set({
          user: res.data.user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        get().logout();
      }
    } catch (err) {
      get().logout();
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user, token } = res.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { user, token } = res.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }
}));
