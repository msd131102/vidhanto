import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { authAPI, utils } from '../services/api';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER: 'LOAD_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');

    if (accessToken && refreshToken && user) {
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: {
          accessToken,
          refreshToken,
          user: JSON.parse(user),
        },
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.login(credentials);

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.data,
        });
        toast.success('Login successful!');
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  }, [dispatch]);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: response.data,
        });
        toast.success('Registration successful! Please check your email for verification.');
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  }, [dispatch]);

  // Logout function
  const logout = useCallback(() => {
    utils.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  }, [dispatch]);

  // Verify email function
  const verifyEmail = useCallback(async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);

      if (response.success) {
        toast.success('Email verified successfully!');
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Email verification failed';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);

      if (response.success) {
        toast.success('Password reset email sent!');
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password);

      if (response.success) {
        toast.success('Password reset successfully!');
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Update user profile
  const updateUser = useCallback((userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
      // Update localStorage as well
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [dispatch]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user]);

  // Check if user is lawyer
  const isLawyer = useCallback(() => {
    return state.user?.role === 'lawyer';
  }, [state.user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return state.user?.role === 'admin';
  }, [state.user]);

  // Get user display name
  const getDisplayName = useCallback(() => {
    if (!state.user) return '';
    return `${state.user.firstName} ${state.user.lastName}`.trim();
  }, [state.user]);

  const value = useMemo(() => ({
    // State
    ...state,

    // Actions
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,

    // Helpers
    hasRole,
    isLawyer,
    isAdmin,
    getDisplayName,
  }), [state, login, register, logout, verifyEmail, forgotPassword, resetPassword, clearError, hasRole, isLawyer, isAdmin, getDisplayName]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
