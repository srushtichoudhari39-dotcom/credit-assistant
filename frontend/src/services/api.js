import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('credit_assistant_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('credit_assistant_token');
      localStorage.removeItem('credit_assistant_user');
      // Redirect to login if not already on login or register
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const profileService = {
  getProfile: () => api.get('/financial-profile'),
  createProfile: (data) => api.post('/financial-profile', data),
  updateProfile: (data) => api.put('/financial-profile', data),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
};

export const creditHistoryService = {
  getHistory: () => api.get('/credit-history'),
  addEntry: (data) => api.post('/credit-history', data),
};

export const aiService = {
  getAdvice: (data = {}) => api.post('/ai/advice', data),
  getHistory: () => api.get('/ai/history'),
};

export default api;
