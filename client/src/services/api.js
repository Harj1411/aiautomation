import axios from 'axios';

const getCleanApiUrl = () => {
  let raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim().replace(/["']/g, '').replace(/\/$/, '');
  if (raw.endsWith('/api/auth') || raw.endsWith('/api/workflows') || raw.endsWith('/api/executions')) {
    raw = raw.replace(/\/api\/.*$/, '/api');
  }
  if (!raw.endsWith('/api')) {
    raw = `${raw}/api`;
  }
  return raw;
};

const API_URL = getCleanApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
