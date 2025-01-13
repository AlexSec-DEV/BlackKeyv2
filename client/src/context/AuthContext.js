import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const api = axios.create({
    baseURL: baseURL,
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

  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/register', formData);
      console.log('Kayıt cevabı:', res.data);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
      setLoading(false);
      return false;
    }
  };

  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Giriş isteği gönderiliyor:', formData);
      const res = await api.post('/auth/login', formData);
      console.log('Giriş cevabı:', res.data);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Giriş hatası:', err);
      setError(err.response?.data?.message || 'Giriş sırasında bir hata oluştu');
      setLoading(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data);
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
    register,
    login,
    logout,
    loadUser,
    api
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;