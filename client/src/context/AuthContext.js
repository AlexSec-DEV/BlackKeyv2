import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Token'ı her request'e ekle
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      return response.data;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      return response.data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const loadUser = useCallback(async () => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Kullanıcı yükleme hatası:', err);
      setError(err.response?.data?.message || 'Kullanıcı bilgileri yüklenemedi');
      logout();
    }
  }, [token, api, logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        setLoading(true);
        await loadUser();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token, user, loadUser]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    loadUser,
    api
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;