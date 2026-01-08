import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('adminRefreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        localStorage.setItem('adminToken', accessToken);
        localStorage.setItem('adminRefreshToken', newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other HTTP errors
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      
      // Show toast for common errors
      if (error.response.status !== 401) {
        toast.error(message);
      }
      
      return Promise.reject({
        ...error,
        message,
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // Store tokens and user data
    if (response.data.success) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      const user = response.data.data.user;
      
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
    }
    
    return response.data;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getRecentActivities: async () => {
    const response = await api.get('/admin/activities');
    return response.data;
  },
  
  getSystemHealth: async () => {
    const response = await api.get('/admin/health');
    return response.data;
  }
};

// Users Management API
export const usersAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  
  banUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}/ban`, data);
    return response.data;
  },
  
  unbanUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/ban`, { isBanned: false });
    return response.data;
  }
};

// Lawyers Management API
export const lawyersAPI = {
  getLawyers: async (params = {}) => {
    const response = await api.get('/admin/lawyers', { params });
    return response.data;
  },
  
  getLawyer: async (id) => {
    const response = await api.get(`/admin/lawyers/${id}`);
    return response.data;
  },
  
  verifyLawyer: async (id, data) => {
    const response = await api.put(`/admin/lawyers/${id}/verify`, data);
    return response.data;
  },
  
  rejectLawyer: async (id, reason) => {
    const response = await api.put(`/admin/lawyers/${id}/verify`, { 
      status: 'rejected', 
      reason 
    });
    return response.data;
  }
};

// Appointments Management API
export const appointmentsAPI = {
  getAppointments: async (params = {}) => {
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },
  
  getAppointment: async (id) => {
    const response = await api.get(`/admin/appointments/${id}`);
    return response.data;
  },
  
  updateAppointment: async (id, data) => {
    const response = await api.put(`/admin/appointments/${id}`, data);
    return response.data;
  },
  
  deleteAppointment: async (id) => {
    const response = await api.delete(`/admin/appointments/${id}`);
    return response.data;
  }
};

// Payments Management API
export const paymentsAPI = {
  getPayments: async (params = {}) => {
    const response = await api.get('/admin/payments', { params });
    return response.data;
  },
  
  getPayment: async (id) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  },
  
  getRevenueStats: async (period = 'month') => {
    const response = await api.get(`/admin/payments/stats?period=${period}`);
    return response.data;
  },
  
  processRefund: async (data) => {
    const response = await api.post('/admin/payments/refund', data);
    return response.data;
  }
};

// Analytics API
export const analyticsAPI = {
  getOverview: async (period = '30d') => {
    const response = await api.get(`/admin/analytics/overview?period=${period}`);
    return response.data;
  },
  
  getUserGrowth: async (period = '30d') => {
    const response = await api.get(`/admin/analytics/users?period=${period}`);
    return response.data;
  },
  
  getRevenueAnalytics: async (period = '30d') => {
    const response = await api.get(`/admin/analytics/revenue?period=${period}`);
    return response.data;
  },
  
  getTopLawyers: async (period = '30d') => {
    const response = await api.get(`/admin/analytics/lawyers?period=${period}`);
    return response.data;
  }
};

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
  
  updateSettings: async (data) => {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },
  
  getSystemInfo: async () => {
    const response = await api.get('/admin/system/info');
    return response.data;
  }
};

// Utility functions
export const utils = {
  // Get current admin from localStorage
  getCurrentAdmin: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if admin is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },
  
  // Logout admin
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  },
  
  // Get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  // Handle API errors consistently
  handleError: (error, customMessage = null) => {
    const message = customMessage || 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    toast.error(message);
    console.error('API Error:', error);
  }
};

export default api;
