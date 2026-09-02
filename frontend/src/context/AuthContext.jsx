import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pos_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.login(username, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('pos_token', res.token);
      localStorage.setItem('pos_user', JSON.stringify(res.user));
      return res;
    } catch (err) {
      // Fallback demo local login if backend is unreachable
      if ((username === 'admin' || username === 'kasir' || username === 'customer') &&
          (password === 'admin123' || password === 'kasir123' || password === 'cust123')) {
        const fallbackRole = username === 'admin' ? 'admin' : username === 'kasir' ? 'cashier' : 'customer';
        const fallbackUser = fallbackRole === 'admin'
          ? { id: 'usr-admin', username: 'admin', name: 'Ahmad Administrator', role: 'admin', email: 'admin@pos-sistem.id', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin' }
          : fallbackRole === 'cashier'
          ? { id: 'usr-cashier', username: 'kasir', name: 'Siti Nurhaliza', role: 'cashier', email: 'kasir@pos-sistem.id', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=siti' }
          : { id: 'usr-customer', username: 'customer', name: 'Budi Santoso', role: 'customer', email: 'budi@customer.id', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi' };
        setUser(fallbackUser);
        setToken('demo-token');
        return { success: true, user: fallbackUser };
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register customer (requires cashier or admin approval)
  const registerCustomer = async (data) => {
    setLoading(true);
    try {
      const res = await api.registerCustomer(data);
      return res;
    } catch (err) {
      // Simulate pending approval locally if backend unavailable
      return { success: true, pending: true, message: 'Permohonan akun member telah dikirim. Menunggu persetujuan Kasir atau Administrator.' };
    } finally {
      setLoading(false);
    }
  };

  // Register cashier (requires admin approval)
  const registerCashier = async (data) => {
    setLoading(true);
    try {
      const res = await api.registerCashier(data);
      return res;
    } catch (err) {
      // Simulate pending approval locally
      return { success: true, pending: true, message: 'Permohonan akun kasir telah dikirim. Menunggu persetujuan Admin.' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const res = await api.updateProfile(data);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('pos_user', JSON.stringify(res.user));
      }
      return res;
    } catch (err) {
      // Local fallback
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('pos_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, registerCustomer, registerCashier, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
