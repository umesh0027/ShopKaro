import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useCart } from './CartContext';

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const { clearCart } = useCart();

  const fetchMe = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    }
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  };

  const verifyOTP = async (payload) => {
    const { data } = await authAPI.verifyOTP(payload);
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      toast.success('Email verified! Welcome to ShopKaro!');
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearCart();
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, isLoggedIn, login, register, verifyOTP, logout, updateUser, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
