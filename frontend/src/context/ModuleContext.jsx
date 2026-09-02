import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const ModuleContext = createContext(null);

export function ModuleProvider({ children }) {
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({ total: 16, active: 16, inactive: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getModules();
      if (res.success) {
        setModules(res.modules);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.getModuleHistory();
      if (res.success) {
        setHistory(res.history);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  useEffect(() => {
    fetchModules();
    fetchHistory();
  }, [fetchModules, fetchHistory]);

  const toggleModule = async (moduleId, targetStatus, reason = '') => {
    try {
      const res = await api.toggleModule(moduleId, targetStatus, reason);
      if (res.success) {
        await fetchModules();
        await fetchHistory();
        return res;
      }
    } catch (err) {
      throw err;
    }
  };

  const applyPreset = async (presetName) => {
    try {
      const res = await api.applyPreset(presetName);
      if (res.success) {
        await fetchModules();
        await fetchHistory();
        return res;
      }
    } catch (err) {
      throw err;
    }
  };

  const isModuleActive = (moduleKey) => {
    const mod = modules.find(m => m.key === moduleKey);
    return mod ? mod.isActive : true;
  };

  return (
    <ModuleContext.Provider
      value={{
        modules,
        stats,
        history,
        loading,
        fetchModules,
        fetchHistory,
        toggleModule,
        applyPreset,
        isModuleActive,
        notificationMsg,
        setNotificationMsg
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules() {
  return useContext(ModuleContext);
}
