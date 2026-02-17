import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      // Extract the token from the nested structure
      const { data } = response.data;
      return {
        user: data.user,
        token: data.tokens.access_token,
        refresh_token: data.tokens.refresh_token
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      // Extract the token from the nested structure
      const { data } = response.data;
      return {
        user: data.user,
        token: data.tokens.access_token,
        refresh_token: data.tokens.refresh_token
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async verifyToken(token) {
    try {
      const response = await api.get('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data.user;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  async resetPassword(token, password) {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }
};

export default api;