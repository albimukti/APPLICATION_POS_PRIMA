import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Hapus otomatis profil demo lama 'Ahmad Administrator'
        if (parsed?.name === 'Ahmad Administrator' || parsed?.username === 'Ahmad' || parsed?.avatar?.includes('bottts')) {
          const sanitizedAdmin = {
            id: 'usr-admin',
            username: 'admin',
            name: 'Administrator',
            role: 'admin',
            email: 'admin@posprima.id',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
          };
          localStorage.setItem('pos_user', JSON.stringify(sanitizedAdmin));
          return sanitizedAdmin;
        }
        return parsed;
      } catch (e) {}
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

  // Sinkronisasi profil pengguna ke data akun backend sebenarnya
  useEffect(() => {
    async function syncCurrentUser() {
      const storedToken = localStorage.getItem('pos_token');
      if (storedToken && storedToken !== 'demo-token') {
        try {
          const res = await api.getMe();
          if (res && res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('pos_user', JSON.stringify(res.user));
          }
        } catch (_) {}
      }
    }
    syncCurrentUser();
  }, []);

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
      // Re-throw error directly so the UI notifies user that password is wrong
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
