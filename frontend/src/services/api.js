import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
    
    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
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
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // Store tokens and user data
    if (response.data.success) {
      const { accessToken, refreshToken, ...userData } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return response.data;
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  
  updateAddress: async (addressData) => {
    const response = await api.put('/users/address', addressData);
    return response.data;
  },
  
  updatePreferences: async (preferencesData) => {
    const response = await api.put('/users/preferences', preferencesData);
    return response.data;
  },
  
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await api.get('/users/dashboard');
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/users/dashboard/stats');
    return response.data;
  },
  
  getRecentAppointments: async (limit = 5) => {
    const response = await api.get(`/users/dashboard/recent-appointments?limit=${limit}`);
    return response.data;
  },
  
  getRecentDocuments: async (limit = 5) => {
    const response = await api.get(`/users/dashboard/recent-documents?limit=${limit}`);
    return response.data;
  },

  // User-specific dashboard APIs
  getUserStats: async () => {
    const response = await api.get('/users/dashboard/stats');
    return response.data;
  },

  getRecommendedLawyers: async (limit = 3) => {
    const response = await api.get(`/users/dashboard/recommended-lawyers?limit=${limit}`);
    return response.data;
  },

  // Lawyer-specific dashboard APIs
  getLawyerStats: async () => {
    const response = await api.get('/lawyers/dashboard/stats');
    return response.data;
  },

  getLawyerAppointments: async (limit = 5) => {
    const response = await api.get(`/lawyers/dashboard/appointments?limit=${limit}`);
    return response.data;
  },

  getLawyerProfile: async () => {
    const response = await api.get('/lawyers/dashboard/profile');
    return response.data;
  },

  getRecentClients: async (limit = 3) => {
    const response = await api.get(`/lawyers/dashboard/recent-clients?limit=${limit}`);
    return response.data;
  }
};

// Lawyers API
export const lawyersAPI = {
  getLawyers: async (params = {}) => {
    const response = await api.get('/lawyers', { params });
    return response.data;
  },
  
  getLawyer: async (id) => {
    const response = await api.get(`/lawyers/${id}`);
    return response.data;
  },
  
  getSpecializations: async () => {
    const response = await api.get('/lawyers/specializations');
    return response.data;
  },
  
  getStates: async () => {
    const response = await api.get('/lawyers/states');
    return response.data;
  },
  
  createLawyerProfile: async (lawyerData) => {
    const response = await api.post('/lawyers', lawyerData);
    return response.data;
  },
  
  updateLawyerProfile: async (id, lawyerData) => {
    const response = await api.put(`/lawyers/${id}`, lawyerData);
    return response.data;
  },
  
  updateLawyerAvailability: async (id, availability) => {
    const response = await api.put(`/lawyers/${id}/availability`, { availability });
    return response.data;
  },
  
  updateLawyerFees: async (id, fees) => {
    const response = await api.put(`/lawyers/${id}/fees`, fees);
    return response.data;
  },
  
  uploadLawyerDocuments: async (id, documentData) => {
    const response = await api.post(`/lawyers/${id}/documents`, documentData);
    return response.data;
  },
  
  getLawyerAppointments: async (id, params = {}) => {
    const response = await api.get(`/lawyers/${id}/appointments`, { params });
    return response.data;
  },
  
  getLawyerStats: async (id) => {
    const response = await api.get(`/lawyers/${id}/stats`);
    return response.data;
  },
  
  addLawyerRating: async (id, ratingData) => {
    const response = await api.post(`/lawyers/${id}/ratings`, ratingData);
    return response.data;
  },
  
  getLawyerRatings: async (id) => {
    const response = await api.get(`/lawyers/${id}/ratings`);
    return response.data;
  }
};

// Appointments API
export const appointmentsAPI = {
  getAppointments: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },
  
  getAppointment: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },
  
  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },
  
  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }
};

// AI Chat API
export const aiAPI = {
  chat: async (message, chatId = null) => {
    const response = await api.post('/ai/chat', { message, chatId });
    return response.data;
  },
  
  getHistory: async (params = {}) => {
    const response = await api.get('/ai/history', { params });
    return response.data;
  },
  
  getChat: async (id) => {
    const response = await api.get(`/ai/chat/${id}`);
    return response.data;
  },
  
  updateChat: async (id, data) => {
    const response = await api.put(`/ai/chat/${id}`, data);
    return response.data;
  },
  
  deleteChat: async (id) => {
    const response = await api.delete(`/ai/chat/${id}`);
    return response.data;
  },
  
  endChat: async (id) => {
    const response = await api.post(`/ai/chat/${id}/end`);
    return response.data;
  },
  
  getUsage: async () => {
    const response = await api.get('/ai/usage');
    return response.data;
  }
};

// Documents API
export const documentsAPI = {
  getDocuments: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },
  
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  
  createDocument: async (documentData) => {
    const response = await api.post('/documents', documentData);
    return response.data;
  },
  
  updateDocument: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },
  
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  
  uploadDocument: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  signDocument: async (id, signatureData) => {
    const response = await api.post(`/documents/${id}/sign`, signatureData);
    return response.data;
  }
};

// E-Signature API
export const esignatureAPI = {
  getMyRequests: async () => {
    const response = await api.get('/esignature/my-requests');
    return response.data;
  },
  
  createRequest: async (requestData) => {
    const response = await api.post('/esignature/create', requestData);
    return response.data;
  },
  
  getRequest: async (id) => {
    const response = await api.get(`/esignature/${id}`);
    return response.data;
  },
  
  updateRequest: async (id, data) => {
    const response = await api.put(`/esignature/${id}`, data);
    return response.data;
  },
  
  deleteRequest: async (id) => {
    const response = await api.delete(`/esignature/${id}`);
    return response.data;
  },
  
  signRequest: async (id, signatureData) => {
    const response = await api.post(`/esignature/${id}/sign`, signatureData);
    return response.data;
  },
  
  getToSign: async () => {
    const response = await api.get('/esignature/to-sign');
    return response.data;
  }
};

// E-Stamp API
export const estampAPI = {
  getMyRequests: async () => {
    const response = await api.get('/estamp/my-requests');
    return response.data;
  },
  
  createRequest: async (requestData) => {
    const response = await api.post('/estamp/create', requestData);
    return response.data;
  },
  
  getRequest: async (id) => {
    const response = await api.get(`/estamp/${id}`);
    return response.data;
  },
  
  updateRequest: async (id, data) => {
    const response = await api.put(`/estamp/${id}`, data);
    return response.data;
  },
  
  deleteRequest: async (id) => {
    const response = await api.delete(`/estamp/${id}`);
    return response.data;
  },
  
  verifyStamp: async (id, verificationData) => {
    const response = await api.post(`/estamp/${id}/verify`, verificationData);
    return response.data;
  },
  
  downloadCertificate: async (id) => {
    const response = await api.get(`/estamp/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Payments API
export const paymentsAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/payments/create', orderData);
    return response.data;
  },
  
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },
  
  getHistory: async (params = {}) => {
    const response = await api.get('/payments/history', { params });
    return response.data;
  },
  
  getStats: async (period = 'month') => {
    const response = await api.get(`/payments/stats?period=${period}`);
    return response.data;
  },
  
  getInvoice: async (paymentId) => {
    const response = await api.get(`/payments/invoice/${paymentId}`);
    return response.data;
  },
  
  processRefund: async (paymentId, amount, reason) => {
    const response = await api.post('/payments/refund', {
      paymentId,
      amount,
      reason
    });
    return response.data;
  }
};

// Utility functions
export const utils = {
  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  
  // Get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('accessToken');
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

// Socket.io connection
export const initializeSocket = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  return io(SOCKET_URL, {
    auth: {
      token
    }
  });
};

export default api;
