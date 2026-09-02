import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ShiftContext = createContext(null);

export function ShiftProvider({ children }) {
  const { user } = useAuth();
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchActiveShift = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getActiveShift();
      if (res.success) {
        setActiveShift(res.activeShift);
      }
    } catch (err) {
      console.error('Failed to fetch active shift:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchActiveShift();
    }
  }, [user, fetchActiveShift]);

  const openShift = async (startingCash, notes) => {
    try {
      const res = await api.openShift(startingCash, notes);
      if (res.success) {
        setActiveShift(res.shift);
        return res;
      }
    } catch (err) {
      throw err;
    }
  };

  const closeShift = async (actualCash, notes) => {
    if (!activeShift) throw new Error('Tidak ada shift aktif');
    try {
      const res = await api.closeShift(activeShift.id, actualCash, notes);
      if (res.success) {
        setActiveShift(null);
        return res;
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <ShiftContext.Provider value={{ activeShift, loading, fetchActiveShift, openShift, closeShift }}>
      {children}
    </ShiftContext.Provider>
  );
}

export function useShift() {
  return useContext(ShiftContext);
}
